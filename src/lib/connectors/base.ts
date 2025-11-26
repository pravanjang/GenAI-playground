import { Message, ModelConfig, ModelInfo, ProviderID } from "@/lib/types"

export interface GenAIConnector {
    id: ProviderID
    validateKey(apiKey: string): Promise<boolean>
    getModels(apiKey: string): Promise<ModelInfo[]>
    chat(messages: Message[], config: ModelConfig, apiKey: string, stream?: boolean): Promise<ReadableStream | string>
}
