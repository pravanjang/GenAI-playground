import { GenAIConnector } from "./base"
import { Message, ModelConfig, ModelInfo, MODELS } from "@/lib/types"

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

            const data = await response.json()
            const apiModels = data.data || []

            // Filter and map to our ModelInfo format
            // We'll prioritize our known models but mark them as available
            // We could also dynamically add new models from the API if we wanted to be fancy

            return MODELS.filter(m => m.provider === "openai").map(model => ({
                ...model,
                available: apiModels.some((am: { id: string }) => am.id === model.id)
            }))
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
