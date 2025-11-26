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
        console.log("OpenAI chat", messages, config)
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
                max_tokens: config.maxTokens,
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

        console.log("OpenAI response", response)

        if (stream) {
            if (!response.body) {
                throw new Error("No response body from OpenAI")
            }
            return response.body
        } else {
            const data = await response.json()
            return data.choices[0]?.message?.content || ""
        }
    }
}
