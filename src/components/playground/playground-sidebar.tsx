"use client"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAPIKeys } from "@/lib/stores/api-key-store"
import { PROVIDERS, ProviderID } from "@/lib/types"
import { Settings, AlertTriangle } from "lucide-react"

type Mode = "complete" | "insert" | "edit"

interface PlaygroundSidebarProps {
  selectedModel: string
  onModelChange: (model: string) => void
  temperature: number
  onTemperatureChange: (value: number) => void
  maxLength: number
  onMaxLengthChange: (value: number) => void
  topP: number
  onTopPChange: (value: number) => void
  onOpenSettings?: () => void
}

export function PlaygroundSidebar({
  selectedModel,
  onModelChange,
  temperature,
  onTemperatureChange,
  maxLength,
  onMaxLengthChange,
  topP,
  onTopPChange,
  onOpenSettings,
}: PlaygroundSidebarProps) {
  const [mode, setMode] = useState<Mode>("complete")

  const { getAvailableModels, config, initializeKeylessProviders } = useAPIKeys()

  // Track if we've already initialized keyless providers to prevent infinite loops
  const hasInitializedRef = useRef(false)

  // Initialize keyless providers (like Ollama) on mount - run only once
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      initializeKeylessProviders()
    }
  }, [initializeKeylessProviders])

  const availableModels = getAvailableModels()
  const hasValidKey = availableModels.some((m) => m.available)

  // Group models by provider
  const modelsByProvider = (Object.keys(PROVIDERS) as ProviderID[]).map(
    (providerId) => {
      const provider = config.providers.find((p) => p.id === providerId)
      const providerModels = availableModels.filter((m) => m.provider === providerId)
      const isConfigured = provider?.status === "valid"
      const requiresKey = PROVIDERS[providerId].requiresKey

      return {
        providerId,
        providerName: PROVIDERS[providerId].name,
        models: providerModels,
        isConfigured,
        requiresKey,
        status: provider?.status,
      }
    }
  )

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
  }

  // Fallback native select to keep the UI functional in case Radix Select fails
  function NativeSelect() {
    return (
      <div>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full rounded-md border border-input px-3 py-2 text-sm"
        >
          <option value="">Select a model...</option>
          {availableModels.map((m) => (
            <option key={m.id} value={m.id} disabled={!m.available}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Defensive check: if the Select primitives are missing due to a module/import issue,
  // render a friendly error message instead of letting React throw a minified error.
  const isPrimitive = (p: unknown) => typeof p === "function" || (typeof p === "object" && p !== null)

  if (
    !isPrimitive(Select) ||
    !isPrimitive(SelectGroup) ||
    !isPrimitive(SelectItem) ||
    !isPrimitive(SelectTrigger) ||
    !isPrimitive(SelectValue)
  ) {
    console.error("Missing Select primitives:", { Select, SelectGroup, SelectItem, SelectTrigger, SelectValue })
    return (
      <div className="w-80 border-l border-border bg-background p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
            <div className="text-yellow-500 text-sm">Radix Select is unavailable; falling back to a native select for model selection.</div>
          </div>
          <div>
            <Label>Model</Label>
            <NativeSelect />
          </div>
        </div>
      </div>
    )
  }

  // For diagnostics: print runtime typeof each primitive to help debug invalid element types
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("Select primitives types:", {
      SelectType: typeof Select,
      SelectGroupType: typeof SelectGroup,
      SelectItemType: typeof SelectItem,
      SelectTriggerType: typeof SelectTrigger,
      SelectValueType: typeof SelectValue,
    })
  }

  return (
    <div className="w-80 border-l border-border bg-background p-6 overflow-y-auto">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Model</Label>
          {!hasValidKey ? (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm text-yellow-500 dark:text-yellow-400">
                    Configure API keys to get started
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-yellow-500 dark:text-yellow-400"
                    onClick={onOpenSettings}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Open Settings
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Select
              value={selectedModel}
              onValueChange={onModelChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model..." />
              </SelectTrigger>
              <SelectContent>
                {modelsByProvider.map((group, index) => (
                  <SelectGroup key={group.providerId}>
                    {index > 0 && <SelectSeparator />}
                    <SelectLabel className="flex items-center gap-2">
                      {group.providerName}
                      {group.isConfigured ? (
                        <span className="text-xs text-green-500">
                          ({group.models.length} models)
                        </span>
                      ) : group.requiresKey ? (
                        <span className="text-xs text-muted-foreground">
                          (not configured)
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-500">
                          (not available)
                        </span>
                      )}
                    </SelectLabel>
                    {group.models.map((model) => (
                      <SelectItem
                        key={model.id}
                        value={model.id}
                        disabled={!group.isConfigured}
                      >
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {model.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={mode === "complete" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange("complete")}
              className="text-xs"
            >
              Complete
            </Button>
            <Button
              variant={mode === "insert" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange("insert")}
              className="text-xs"
            >
              Insert
            </Button>
            <Button
              variant={mode === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange("edit")}
              className="text-xs"
            >
              Edit
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperature</Label>
              <span className="text-sm text-muted-foreground">
                {temperature.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(val) => onTemperatureChange(val[0])}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Maximum Length</Label>
              <span className="text-sm text-muted-foreground">
                {maxLength}
              </span>
            </div>
            <Slider
              value={[maxLength]}
              onValueChange={(val) => onMaxLengthChange(val[0])}
              min={1}
              max={4096}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Top P</Label>
              <span className="text-sm text-muted-foreground">
                {topP.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[topP]}
              onValueChange={(val) => onTopPChange(val[0])}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
  
