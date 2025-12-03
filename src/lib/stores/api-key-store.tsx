"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import {
  APIKeyConfig,
  APIProvider,
  DEFAULT_API_CONFIG,
  ModelInfo,
  ProviderID,
  PROVIDERS,
} from "@/lib/types"
import { getConnector } from "@/lib/connectors"

const API_KEY_STORAGE_KEY = "genai-playground-api-keys"

interface APIKeyContextType {
  config: APIKeyConfig
  setAPIKey: (providerId: ProviderID, apiKey: string) => void
  removeAPIKey: (providerId: ProviderID) => void
  testConnection: (providerId: ProviderID) => Promise<boolean>
  testAllConnections: () => Promise<void>
  getAvailableModels: () => ModelInfo[]
  getProviderStatus: (providerId: ProviderID) => APIProvider | undefined
  isAnyKeyConfigured: () => boolean
  clearAllKeys: () => void
  initializeKeylessProviders: () => Promise<void>
}

const APIKeyContext = createContext<APIKeyContextType | undefined>(undefined)

// Masks an API key for display (shows first 7 and last 4 characters)
export function maskAPIKey(key: string): string {
  if (key.length <= 11) return "••••••••"
  return `${key.slice(0, 7)}••••${key.slice(-4)}`
}

// Validates API key format based on provider
export function validateKeyFormat(
  providerId: ProviderID,
  key: string
): boolean {
  const trimmedKey = key.trim()
  
  // Ollama doesn't require an API key
  if (!PROVIDERS[providerId].requiresKey) {
    return true
  }
  
  if (!trimmedKey) return false

  switch (providerId) {
    case "openai":
      return trimmedKey.startsWith("sk-") && trimmedKey.length >= 20
    case "anthropic":
      return trimmedKey.startsWith("sk-ant-") && trimmedKey.length >= 20
    case "google":
      return trimmedKey.startsWith("AIza") && trimmedKey.length >= 20
    default:
      return trimmedKey.length >= 20
  }
}

// Simple obfuscation for localStorage (not truly secure, but better than plaintext)
function obfuscate(text: string): string {
  return btoa(text)
}

function deobfuscate(text: string): string {
  try {
    return atob(text)
  } catch {
    return ""
  }
}

// Load saved API keys from localStorage
function loadSavedConfig(): APIKeyConfig {
  if (typeof window === "undefined") return DEFAULT_API_CONFIG

  try {
    const saved = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Deobfuscate stored keys
      const providers = parsed.providers.map((p: APIProvider) => ({
        ...p,
        apiKey: p.apiKey ? deobfuscate(p.apiKey) : undefined,
      }))
      return {
        ...parsed,
        providers,
      }
    }
  } catch (error) {
    console.error("Failed to load API keys:", error)
  }
  return DEFAULT_API_CONFIG
}

export function APIKeyProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<APIKeyConfig>(DEFAULT_API_CONFIG)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load saved config on mount
  useEffect(() => {
    const saved = loadSavedConfig()
    if (saved) {
      setConfig(saved)
    }
    setIsInitialized(true)
  }, [])

  // Save API keys to localStorage when config changes
  useEffect(() => {
    if (!isInitialized) return

    try {
      // Obfuscate keys before storing
      const toSave = {
        ...config,
        providers: config.providers.map((p) => ({
          ...p,
          apiKey: p.apiKey ? obfuscate(p.apiKey) : undefined,
        })),
      }
      localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(toSave))
    } catch (error) {
      console.error("Failed to save API keys:", error)
    }
  }, [config, isInitialized])

  const setAPIKey = useCallback((providerId: ProviderID, apiKey: string) => {
    const trimmedKey = apiKey.trim()
    const isValid = validateKeyFormat(providerId, trimmedKey)

    setConfig((prev) => ({
      ...prev,
      providers: prev.providers.map((p) =>
        p.id === providerId
          ? {
            ...p,
            apiKey: trimmedKey,
            configured: !!trimmedKey,
            status: trimmedKey ? (isValid ? "untested" : "invalid") : "untested",
            errorMessage: !isValid && trimmedKey ? "Invalid key format" : undefined,
            availableModels: [],
          }
          : p
      ),
    }))
  }, [])

  const removeAPIKey = useCallback((providerId: ProviderID) => {
    setConfig((prev) => ({
      ...prev,
      providers: prev.providers.map((p) =>
        p.id === providerId
          ? {
            ...p,
            apiKey: undefined,
            configured: false,
            status: "untested",
            errorMessage: undefined,
            availableModels: [],
          }
          : p
      ),
    }))
  }, [])

  const testConnection = useCallback(async (providerId: ProviderID): Promise<boolean> => {
    const providerInfo = PROVIDERS[providerId]
    
    // Get the current provider from the latest config state
    let currentApiKey: string | undefined
    setConfig((prev) => {
      const provider = prev.providers.find((p) => p.id === providerId)
      currentApiKey = provider?.apiKey
      return prev // No state change, just reading
    })
    
    // For providers that require API keys, check if we have one
    if (providerInfo.requiresKey && !currentApiKey) return false

    // Set testing status
    setConfig((prev) => ({
      ...prev,
      providers: prev.providers.map((p) =>
        p.id === providerId
          ? { ...p, status: "untested", errorMessage: undefined }
          : p
      ),
    }))

    try {
      const connector = getConnector(providerId)
      const isValid = await connector.validateKey(currentApiKey ?? "")

      if (!isValid) {
        throw new Error(providerInfo.requiresKey ? "Invalid API key" : "Service not available")
      }

      // Get available models for this provider
      const models = await connector.getModels(currentApiKey ?? "")

      setConfig((prev) => ({
        ...prev,
        providers: prev.providers.map((p) =>
          p.id === providerId
            ? {
              ...p,
              status: "valid",
              configured: true,
              availableModels: models,
              lastTested: Date.now(),
              errorMessage: undefined,
            }
            : p
        ),
      }))

      return true
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Connection failed"
      setConfig((prev) => ({
        ...prev,
        providers: prev.providers.map((p) =>
          p.id === providerId
            ? {
              ...p,
              status: "error",
              errorMessage: message,
              availableModels: [],
            }
            : p
        ),
      }))
      return false
    }
  }, [])

  const testAllConnections = useCallback(async () => {
    let configuredProviderIds: ProviderID[] = []
    setConfig((prev) => {
      configuredProviderIds = prev.providers.filter((p) => p.configured).map((p) => p.id)
      return prev // No state change, just reading
    })
    await Promise.all(configuredProviderIds.map((id) => testConnection(id)))
  }, [testConnection])

  // Initialize providers that don't require API keys (like Ollama)
  const initializeKeylessProviders = useCallback(async () => {
    const keylessProviders = (Object.keys(PROVIDERS) as ProviderID[])
      .filter((id) => !PROVIDERS[id].requiresKey)
    
    await Promise.all(keylessProviders.map((id) => testConnection(id)))
  }, [testConnection])

  const getAvailableModels = useCallback((): ModelInfo[] => {
    return config.providers
      .filter((p) => p.status === "valid")
      .flatMap((p) => p.availableModels)
  }, [config.providers])

  const getProviderStatus = useCallback((providerId: ProviderID) => {
    return config.providers.find((p) => p.id === providerId)
  }, [config.providers])

  const isAnyKeyConfigured = useCallback(() => {
    return config.providers.some((p) => p.configured)
  }, [config.providers])

  const clearAllKeys = useCallback(() => {
    setConfig(DEFAULT_API_CONFIG)
  }, [])

  return (
    <APIKeyContext.Provider
      value={{
        config,
        setAPIKey,
        removeAPIKey,
        testConnection,
        testAllConnections,
        getAvailableModels,
        getProviderStatus,
        isAnyKeyConfigured,
        clearAllKeys,
        initializeKeylessProviders,
      }}
    >
      {children}
    </APIKeyContext.Provider>
  )
}

export function useAPIKeys() {
  const context = useContext(APIKeyContext)
  if (context === undefined) {
    throw new Error("useAPIKeys must be used within an APIKeyProvider")
  }
  return context
}
