export type ProviderID = "openai" | "anthropic" | "google"

export type APIKeyStatus = "valid" | "invalid" | "untested" | "error"

export interface APIProvider {
  id: ProviderID
  name: string
  configured: boolean
  apiKey?: string
  status: APIKeyStatus
  errorMessage?: string
  availableModels: string[]
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

// Model definitions
export const MODELS: ModelInfo[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai",
    contextWindow: 8192,
    description: "Most capable OpenAI model for complex tasks",
    available: false,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    contextWindow: 128000,
    description: "Faster GPT-4 with larger context window",
    available: false,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    contextWindow: 16385,
    description: "Fast and cost-effective for most tasks",
    available: false,
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "anthropic",
    contextWindow: 200000,
    description: "Most powerful Claude model for complex tasks",
    available: false,
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    description: "Balanced performance and speed",
    available: false,
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "google",
    contextWindow: 32768,
    description: "Google's versatile AI model",
    available: false,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    contextWindow: 1000000,
    description: "Advanced Gemini with massive context",
    available: false,
  },
]

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
