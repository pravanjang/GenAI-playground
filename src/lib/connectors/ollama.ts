import { GenAIConnector } from "./base"
import { ModelInfo, Message, ModelConfig, MAX_DYNAMIC_MODELS } from "../types"

// Ollama API types
interface OllamaModel {
  name: string
  modified_at: string
  size: number
  digest: string
  details?: {
    format: string
    family: string
    parameter_size: string
    quantization_level: string
  }
}

interface OllamaTagsResponse {
  models: OllamaModel[]
}

interface OllamaChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface OllamaChatRequest {
  model: string
  messages: OllamaChatMessage[]
  stream?: boolean
  options?: {
    temperature?: number
    num_predict?: number
    top_p?: number
    frequency_penalty?: number
    presence_penalty?: number
    stop?: string[]
  }
}

interface OllamaChatResponse {
  model: string
  created_at: string
  message: OllamaChatMessage
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

// Get base URL - use API route in browser, direct URL on server
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/ollama"
  }
  return process.env.OLLAMA_BASE_URL || "http://localhost:11434"
}

export class OllamaConnector implements GenAIConnector {
  id = "ollama" as const

  async validateKey(): Promise<boolean> {
    // Ollama doesn't require an API key
    // Just check if the service is reachable
    try {
      const response = await fetch(`${getBaseUrl()}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${getBaseUrl()}/api/tags`)
      
      if (!response.ok) {
        console.error("Failed to fetch Ollama models:", response.statusText)
        return []
      }

      const data: OllamaTagsResponse = await response.json()
      
      // Limit to MAX_DYNAMIC_MODELS
      const models = data.models.slice(0, MAX_DYNAMIC_MODELS)
      
      return models.map((model) => ({
        id: model.name,
        name: this.formatModelName(model.name),
        provider: "ollama" as const,
        contextWindow: this.getContextWindow(model.name),
        description: this.getModelDescription(model),
        available: true,
      }))
    } catch (error) {
      console.error("Error fetching Ollama models:", error)
      return []
    }
  }

  async chat(
    messages: Message[],
    config: ModelConfig,
    _apiKey: string,
    stream: boolean = true
  ): Promise<ReadableStream | string> {
    const ollamaMessages: OllamaChatMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    const ollamaRequest: OllamaChatRequest = {
      model: config.model,
      messages: ollamaMessages,
      stream: stream,
      options: {
        temperature: config.temperature ?? 0.7,
        num_predict: config.maxTokens ?? 2048,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty,
        stop: config.stopSequences,
      },
    }

    const response = await fetch(`${getBaseUrl()}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ollamaRequest),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ollama API error: ${error}`)
    }

    if (stream) {
      if (!response.body) {
        throw new Error("No response body from Ollama")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()

      return new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split("\n").filter((line) => line.trim())

              for (const line of lines) {
                try {
                  const data: OllamaChatResponse = JSON.parse(line)
                  if (data.message?.content) {
                    controller.enqueue(encoder.encode(data.message.content))
                  }
                } catch {
                  // Skip malformed JSON lines
                }
              }
            }
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })
    } else {
      // Non-streaming response - collect all chunks
      if (!response.body) {
        throw new Error("No response body from Ollama")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          try {
            const data: OllamaChatResponse = JSON.parse(line)
            if (data.message?.content) {
              fullContent += data.message.content
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      return fullContent
    }
  }

  private formatModelName(name: string): string {
    // Format model name for display (e.g., "llama3.2:latest" -> "Llama 3.2")
    const baseName = name.split(":")[0]
    return baseName
      .replace(/([a-z])(\d)/gi, "$1 $2")
      .replace(/^([a-z])/i, (m) => m.toUpperCase())
  }

  private getContextWindow(modelName: string): number {
    // Estimate context window based on known models
    const lowerName = modelName.toLowerCase()
    
    if (lowerName.includes("llama3")) return 8192
    if (lowerName.includes("llama2")) return 4096
    if (lowerName.includes("mistral")) return 32768
    if (lowerName.includes("mixtral")) return 32768
    if (lowerName.includes("codellama")) return 16384
    if (lowerName.includes("phi")) return 2048
    if (lowerName.includes("gemma")) return 8192
    if (lowerName.includes("qwen")) return 32768
    if (lowerName.includes("deepseek")) return 32768
    
    return 4096 // Default context window
  }

  private getModelDescription(model: OllamaModel): string {
    const details = model.details
    if (!details) {
      return `Local model: ${model.name}`
    }
    
    const parts: string[] = []
    if (details.parameter_size) {
      parts.push(details.parameter_size)
    }
    if (details.quantization_level) {
      parts.push(details.quantization_level)
    }
    if (details.family) {
      parts.push(details.family)
    }
    
    return parts.length > 0 
      ? `${parts.join(" • ")}` 
      : `Local model: ${model.name}`
  }
}
