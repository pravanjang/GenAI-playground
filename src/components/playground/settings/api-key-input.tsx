"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAPIKeys, maskAPIKey, validateKeyFormat } from "@/lib/stores/api-key-store"
import { PROVIDERS, ProviderID } from "@/lib/types"
import { Eye, EyeOff, Check, AlertTriangle, X, Loader2 } from "lucide-react"

interface APIKeyInputProps {
  providerId: ProviderID
}

export function APIKeyInput({ providerId }: APIKeyInputProps) {
  const { config, setAPIKey, removeAPIKey, testConnection } = useAPIKeys()
  const [showKey, setShowKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const provider = config.providers.find((p) => p.id === providerId)
  const providerInfo = PROVIDERS[providerId]

  if (!provider || !providerInfo) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setAPIKey(providerId, value)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    await testConnection(providerId)
    setIsTesting(false)
  }

  const handleClear = () => {
    setInputValue("")
    removeAPIKey(providerId)
  }

  // Compute the display value for the input field
  const getInputValue = (): string => {
    if (showKey) {
      return inputValue || provider.apiKey || ""
    }
    if (provider.apiKey) {
      return maskAPIKey(provider.apiKey)
    }
    return inputValue
  }

  const getStatusIcon = () => {
    switch (provider.status) {
      case "valid":
        return <Check className="h-4 w-4 text-green-500" />
      case "invalid":
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return provider.configured ? (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        ) : null
    }
  }

  const getStatusText = () => {
    switch (provider.status) {
      case "valid":
        return (
          <span className="text-green-500">
            Connected • {provider.availableModels.length} models available
          </span>
        )
      case "invalid":
        return (
          <span className="text-red-500">
            {provider.errorMessage || "Invalid key format"}
          </span>
        )
      case "error":
        return (
          <span className="text-red-500">
            {provider.errorMessage || "Connection failed"}
          </span>
        )
      default:
        return provider.configured ? (
          <span className="text-yellow-500">Not tested</span>
        ) : (
          <span className="text-muted-foreground">
            Not configured
          </span>
        )
    }
  }

  const isValidFormat = provider.apiKey
    ? validateKeyFormat(providerId, provider.apiKey)
    : true

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={`api-key-${providerId}`} className="text-base font-medium">
          {providerInfo.name}
        </Label>
        {getStatusIcon()}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={`api-key-${providerId}`}
            type={showKey ? "text" : "password"}
            placeholder={providerInfo.keyPlaceholder}
            value={getInputValue()}
            onChange={handleInputChange}
            className={
              provider.configured && !isValidFormat
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowKey(!showKey)}
          aria-label={showKey ? "Hide API key" : "Show API key"}
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestConnection}
          disabled={!provider.configured || !isValidFormat || isTesting}
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Test"
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleClear}
          disabled={!provider.configured}
          aria-label="Clear API key"
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs">{getStatusText()}</p>
    </div>
  )
}
