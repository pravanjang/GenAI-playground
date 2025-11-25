import { GenAIConnector } from "./base"
import { Message, ModelConfig, ModelInfo, MODELS } from "@/lib/types"

export class AnthropicConnector implements GenAIConnector {
    id = "anthropic" as const

    async validateKey(apiKey: string): Promise<boolean> {
        try {
            // Anthropic doesn't have a simple "validate" endpoint that doesn't cost money or require a body
            // But we can try to list models if they support it, or just assume valid if it matches regex
            // Recent Anthropic API supports GET /v1/models
            const response = await fetch("https://api.anthropic.com/v1/models", {
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
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
            // Note: Client-side calls to Anthropic might fail due to CORS if not proxied.
            // We'll try the direct call.
            const response = await fetch("https://api.anthropic.com/v1/models", {
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
            })

            if (!response.ok) return []

            // If successful, we could parse the models. 
            // For now, we'll return the static list filtered by what we know
            return MODELS.filter(m => m.provider === "anthropic").map(model => ({
                ...model,
                available: true
            }))
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
