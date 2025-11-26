export type ProviderID = "openai" | "anthropic" | "google"

export type APIKeyStatus = "valid" | "invalid" | "untested" | "error"

export interface APIProvider {
  id: ProviderID
  name: string
  configured: boolean
  apiKey?: string
  status: APIKeyStatus
  errorMessage?: string
  availableModels: ModelInfo[]
  lastTested?: number
}

export interface APIKeyConfig {
  providers: APIProvider[]
  activeProvider?: ProviderID
  storageMethod: "localStorage" | "sessionStorage"
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  model?: string
  tokens?: number
}

export interface ModelConfig {
  provider: ProviderID
  model: string
  temperature: number
  maxTokens: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stopSequences?: string[]
}

export interface ModelInfo {
  id: string
  name: string
  provider: ProviderID
  contextWindow: number
  description: string
  available: boolean
}

export interface Preset {
  id: string
  name: string
  description?: string
  config: ModelConfig
  systemMessage?: string
  tags?: string[]
  createdAt: number
}

export interface Conversation {
  id: string
  messages: Message[]
  config: ModelConfig
  createdAt: number
  updatedAt: number
}



// Provider info
export const PROVIDERS: Record<
  ProviderID,
  { name: string; keyPrefix: string; keyPlaceholder: string }
> = {
  openai: {
    name: "OpenAI",
    keyPrefix: "sk-",
    keyPlaceholder: "sk-proj-...",
  },
  anthropic: {
    name: "Anthropic",
    keyPrefix: "sk-ant-",
    keyPlaceholder: "sk-ant-...",
  },
  google: {
    name: "Google AI",
    keyPrefix: "AIza",
    keyPlaceholder: "AIza...",
  },
}

export const DEFAULT_API_CONFIG: APIKeyConfig = {
  providers: [
    {
      id: "openai",
      name: "OpenAI",
      configured: false,
      status: "untested",
      availableModels: [],
    },
    {
      id: "anthropic",
      name: "Anthropic",
      configured: false,
      status: "untested",
      availableModels: [],
    },
    {
      id: "google",
      name: "Google AI",
      configured: false,
      status: "untested",
      availableModels: [],
    },
  ],
  storageMethod: "localStorage",
}

export const MAX_DYNAMIC_MODELS = 10
