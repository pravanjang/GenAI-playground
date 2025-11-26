import { GenAIConnector } from "./base"
import { Message, ModelConfig, ModelInfo, MAX_DYNAMIC_MODELS } from "@/lib/types"

interface OpenAIModel {
    id: string
    created: number
    object: string
    owned_by: string
}

interface OpenAIListModelsResponse {
    object: string
    data: OpenAIModel[]
}

export class OpenAIConnector implements GenAIConnector {
    id = "openai" as const

    async validateKey(apiKey: string): Promise<boolean> {
        try {
            const response = await fetch("https://api.openai.com/v1/models", {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            })
            return response.ok
        } catch (error) {
            console.error("OpenAI validation error:", error)
            return false
        }
    }

    async getModels(apiKey: string): Promise<ModelInfo[]> {
        try {
            const response = await fetch("https://api.openai.com/v1/models", {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            })

            if (!response.ok) return []

            const data = (await response.json()) as OpenAIListModelsResponse
            const apiModels = data.data || []

            // Sort by created date descending
            apiModels.sort((a, b) => b.created - a.created)

            // Limit to MAX_DYNAMIC_MODELS
            const recentModels = apiModels.slice(0, MAX_DYNAMIC_MODELS)

            return recentModels.map((model) => {
                return {
                    id: model.id,
                    name: model.id,
                    provider: "openai",
                    contextWindow: 128000, // Default assumption for modern models
                    description: "Dynamic model from OpenAI",
                    available: true
                }
            })
        } catch (error) {
            console.error("OpenAI getModels error:", error)
            return []
        }
    }

    async chat(
        messages: Message[],
        config: ModelConfig,
        apiKey: string,
        stream: boolean = true
    ): Promise<ReadableStream | string> {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
                temperature: config.temperature,
                max_completion_tokens: config.maxTokens,
                top_p: config.topP,
                frequency_penalty: config.frequencyPenalty,
                presence_penalty: config.presencePenalty,
                stream: stream,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || "OpenAI API request failed")
        }

        if (stream) {
            if (!response.body) {
                throw new Error("No response body from OpenAI")
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

                            const chunk = decoder.decode(value)
                            const lines = chunk.split("\n")

                            for (const line of lines) {
                                if (line.startsWith("data: ") && line !== "data: [DONE]") {
                                    try {
                                        const data = JSON.parse(line.slice(6))
                                        const content = data.choices[0]?.delta?.content
                                        if (content) {
                                            controller.enqueue(encoder.encode(content))
                                        }
                                    } catch {
                                        // ignore parse errors
                                    }
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
            const data = await response.json()
            return data.choices[0]?.message?.content || ""
        }
    }
}
