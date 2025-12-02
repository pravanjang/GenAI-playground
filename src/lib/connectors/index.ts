import { ProviderID } from "@/lib/types"
import { GenAIConnector } from "./base"
import { OpenAIConnector } from "./openai"
import { AnthropicConnector } from "./anthropic"
import { GoogleConnector } from "./google"
import { OllamaConnector } from "./ollama"

const connectors: Record<ProviderID, GenAIConnector> = {
    openai: new OpenAIConnector(),
    anthropic: new AnthropicConnector(),
    google: new GoogleConnector(),
    ollama: new OllamaConnector(),
}

export function getConnector(providerId: ProviderID): GenAIConnector {
    const connector = connectors[providerId]
    if (!connector) {
        throw new Error(`No connector found for provider: ${providerId}`)
    }
    return connector
}

export * from "./base"
export * from "./openai"
export * from "./anthropic"
export * from "./google"
export * from "./ollama"
