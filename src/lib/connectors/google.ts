import { GenAIConnector } from "./base"
import { Message, ModelConfig, ModelInfo, MODELS } from "@/lib/types"

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

            await response.json()
            // Google returns a list of models. We could map them.
            // For now, we'll just validate our known models are available.

            return MODELS.filter(m => m.provider === "google").map(model => ({
                ...model,
                available: true
            }))
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
        // Gemini 1.5 Pro supports system instructions, but for simplicity we might prepend it or use the specific field if available in the endpoint version
        // For now, let's just prepend system message to the first user message if it exists, or look for a system_instruction field

        const systemMessage = messages.find(m => m.role === "system")
        const chatContents = contents.filter(c => c.role !== "system") // Filter out system role from contents as it might not be valid in 'contents' array directly depending on API version

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
