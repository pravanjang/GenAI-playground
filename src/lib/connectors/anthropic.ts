import { GenAIConnector } from "./base"
import { Message, ModelConfig, ModelInfo, MAX_DYNAMIC_MODELS } from "@/lib/types"

interface AnthropicModel {
    id: string
    display_name: string
    created_at?: string
}

interface AnthropicListModelsResponse {
    data: AnthropicModel[]
}

export class AnthropicConnector implements GenAIConnector {
    id = "anthropic" as const

    async validateKey(apiKey: string): Promise<boolean> {
        try {
            const response = await fetch("https://api.anthropic.com/v1/models", {
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                    "anthropic-dangerous-direct-browser-access": "true"
                },
            })
            return response.ok
        } catch (error) {
            console.error("Anthropic validation error:", error)
            return false
        }
    }

    async getModels(apiKey: string): Promise<ModelInfo[]> {
        try {
            const response = await fetch("https://api.anthropic.com/v1/models", {
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                    "anthropic-dangerous-direct-browser-access": "true"
                },
            })

            if (!response.ok) return []

            const data = (await response.json()) as AnthropicListModelsResponse
            const apiModels = data.data || []

            // Sort by created_at descending if available
            apiModels.sort((a, b) => {
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                }
                return 0
            })

            const recentModels = apiModels.slice(0, MAX_DYNAMIC_MODELS)

            return recentModels.map((model) => {
                return {
                    id: model.id,
                    name: model.display_name || model.id,
                    provider: "anthropic",
                    contextWindow: 200000, // Default for Anthropic
                    description: "Dynamic model from Anthropic",
                    available: true
                }
            })
        } catch (error) {
            console.error("Anthropic getModels error:", error)
            return []
        }
    }

    async chat(
        messages: Message[],
        config: ModelConfig,
        apiKey: string,
        stream: boolean = true
    ): Promise<ReadableStream | string> {
        const systemMessage = messages.find(m => m.role === "system")?.content
        const userAssistantMessages = messages.filter(m => m.role !== "system")

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
                "anthropic-dangerous-direct-browser-access": "true" // Required for client-side calls
            },
            body: JSON.stringify({
                model: config.model,
                messages: userAssistantMessages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
                system: systemMessage,
                max_tokens: config.maxTokens,
                temperature: config.temperature,
                top_p: config.topP,
                stream: stream,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || "Anthropic API request failed")
        }

        if (stream) {
            if (!response.body) {
                throw new Error("No response body from Anthropic")
            }
            return response.body
        } else {
            const data = await response.json()
            return data.content[0]?.text || ""
        }
    }
}
