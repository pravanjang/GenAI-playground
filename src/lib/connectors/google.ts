import { GenAIConnector } from "./base"
import { Message, ModelConfig, ModelInfo, MAX_DYNAMIC_MODELS } from "@/lib/types"

interface GoogleModel {
    name: string
    displayName: string
    description: string
    inputTokenLimit: number
    supportedGenerationMethods: string[]
}

interface GoogleListModelsResponse {
    models: GoogleModel[]
}

export class GoogleConnector implements GenAIConnector {
    id = "google" as const

    async validateKey(apiKey: string): Promise<boolean> {
        try {
            // Validate by listing models
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
            )
            return response.ok
        } catch (error) {
            console.error("Google validation error:", error)
            return false
        }
    }

    async getModels(apiKey: string): Promise<ModelInfo[]> {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
            )

            if (!response.ok) return []

            const data = (await response.json()) as GoogleListModelsResponse
            const apiModels = data.models || []

            // Google models don't have a clear creation date in the list response usually, 
            // but we can filter for 'generateContent' support
            const chatModels = apiModels.filter((m) =>
                m.supportedGenerationMethods?.includes("generateContent")
            )

            const recentModels = chatModels.slice(0, MAX_DYNAMIC_MODELS)

            return recentModels.map((model) => {
                // model.name is like "models/gemini-pro"
                const id = model.name.replace("models/", "")

                return {
                    id: id,
                    name: model.displayName || id,
                    provider: "google",
                    contextWindow: model.inputTokenLimit || 32768,
                    description: model.description || "Dynamic model from Google",
                    available: true
                }
            })
        } catch (error) {
            console.error("Google getModels error:", error)
            return []
        }
    }

    async chat(
        messages: Message[],
        config: ModelConfig,
        apiKey: string,
        stream: boolean = true
    ): Promise<ReadableStream | string> {
        // Google's API structure is different. We need to map messages.
        const contents = messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
        }))

        // Remove system message if present and handle it separately if needed
        const systemMessage = messages.find(m => m.role === "system")
        const chatContents = contents.filter(c => c.role !== "system")

        const method = stream ? "streamGenerateContent" : "generateContent"
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:${method}?key=${apiKey}`

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: chatContents,
                systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
                generationConfig: {
                    temperature: config.temperature,
                    maxOutputTokens: config.maxTokens,
                    topP: config.topP,
                },
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || "Google API request failed")
        }

        if (stream) {
            if (!response.body) {
                throw new Error("No response body from Google")
            }
            return response.body
        } else {
            const data = await response.json()
            return data.candidates?.[0]?.content?.parts?.[0]?.text || ""
        }
    }
}
