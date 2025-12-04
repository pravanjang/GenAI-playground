"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAPIKeys } from "@/lib/stores/api-key-store"
import { Download, Check, X, Loader2, AlertCircle } from "lucide-react"

export function OllamaModelInput() {
  const { config, testConnection } = useAPIKeys()
  const [modelName, setModelName] = useState("")
  const [isPulling, setIsPulling] = useState(false)
  const [pullStatus, setPullStatus] = useState<"idle" | "pulling" | "success" | "error">("idle")
  const [pullMessage, setPullMessage] = useState("")
  const [pullProgress, setPullProgress] = useState(0)

  const provider = config.providers.find((p) => p.id === "ollama")
  if (!provider) return null

  const handlePullModel = async () => {
    if (!modelName.trim()) return

    setIsPulling(true)
    setPullStatus("pulling")
    setPullMessage(`Pulling ${modelName}...`)
    setPullProgress(0)

    try {
      const response = await fetch("/api/ollama/api/pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: modelName }),
      })

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.status) {
              setPullMessage(data.status)
            }
            // Calculate progress percentage from completed/total
            if (data.total && data.completed) {
              const percent = Math.round((data.completed / data.total) * 100)
              setPullProgress(percent)
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      setPullStatus("success")
      setPullMessage(`Successfully pulled ${modelName}`)
      setModelName("")
      
      // Refresh models list
      setTimeout(() => {
        testConnection("ollama")
      }, 500)
    } catch (error) {
      setPullStatus("error")
      setPullMessage(error instanceof Error ? error.message : "Failed to pull model")
    } finally {
      setIsPulling(false)
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setPullStatus("idle")
        setPullMessage("")
        setPullProgress(0)
      }, 3000)
    }
  }

  const getStatusIcon = () => {
    switch (provider.status) {
      case "valid":
        return <Check className="h-4 w-4 text-green-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusText = () => {
    if (pullStatus === "pulling") {
      return <span className="text-blue-500">{pullMessage}</span>
    }
    if (pullStatus === "success") {
      return <span className="text-green-500">{pullMessage}</span>
    }
    if (pullStatus === "error") {
      return <span className="text-red-500">{pullMessage}</span>
    }

    switch (provider.status) {
      case "valid":
        return (
          <span className="text-green-500">
            Connected • {provider.availableModels.length} models available
          </span>
        )
      case "error":
        return (
          <span className="text-red-500">
            {provider.errorMessage || "Service not available"}
          </span>
        )
      default:
        return (
          <span className="text-yellow-500">
            Not tested - Click &quot;Check Service&quot; to verify
          </span>
        )
    }
  }

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="ollama-model-name" className="text-base font-medium">
          Ollama
        </Label>
        {getStatusIcon()}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="ollama-model-name"
              type="text"
              placeholder="Model name (e.g., llama3.2, mistral, codellama)"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && modelName.trim() && !isPulling) {
                  handlePullModel()
                }
              }}
              disabled={isPulling}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePullModel}
            disabled={!modelName.trim() || isPulling}
          >
            {isPulling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Pulling
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Pull
              </>
            )}
          </Button>
        </div>

        {/* Progress bar for model pulling */}
        {isPulling && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{pullMessage}</span>
              <span>{pullProgress}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${pullProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => testConnection("ollama")}
          disabled={isPulling}
          className="w-full"
        >
          Check Service
        </Button>
      </div>

      {!isPulling && <p className="text-xs">{getStatusText()}</p>}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Pull models from Ollama library (ollama.com/library)</p>
        <p>• Examples: llama3.2, mistral, codellama:7b, gemma:2b</p>
      </div>
    </div>
  )
}
