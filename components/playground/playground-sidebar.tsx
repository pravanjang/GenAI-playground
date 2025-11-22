"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type Mode = "complete" | "insert" | "edit"

interface PlaygroundSidebarProps {
  onModelChange?: (model: string) => void
  onModeChange?: (mode: Mode) => void
  onParametersChange?: (params: {
    temperature: number
    maxLength: number
    topP: number
  }) => void
}

export function PlaygroundSidebar({
  onModelChange,
  onModeChange,
  onParametersChange,
}: PlaygroundSidebarProps) {
  const [mode, setMode] = useState<Mode>("complete")
  const [temperature, setTemperature] = useState([0.7])
  const [maxLength, setMaxLength] = useState([256])
  const [topP, setTopP] = useState([0.9])

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    onModeChange?.(newMode)
  }

  const handleTemperatureChange = (value: number[]) => {
    setTemperature(value)
    onParametersChange?.({
      temperature: value[0],
      maxLength: maxLength[0],
      topP: topP[0],
    })
  }

  const handleMaxLengthChange = (value: number[]) => {
    setMaxLength(value)
    onParametersChange?.({
      temperature: temperature[0],
      maxLength: value[0],
      topP: topP[0],
    })
  }

  const handleTopPChange = (value: number[]) => {
    setTopP(value)
    onParametersChange?.({
      temperature: temperature[0],
      maxLength: maxLength[0],
      topP: value[0],
    })
  }

  return (
    <div className="w-80 border-l border-border bg-background p-6 overflow-y-auto">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Model</Label>
          <Select defaultValue="gpt-4" onValueChange={onModelChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
            </SelectContent>
          </Select>
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
                {temperature[0].toFixed(2)}
              </span>
            </div>
            <Slider
              value={temperature}
              onValueChange={handleTemperatureChange}
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
                {maxLength[0]}
              </span>
            </div>
            <Slider
              value={maxLength}
              onValueChange={handleMaxLengthChange}
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
                {topP[0].toFixed(2)}
              </span>
            </div>
            <Slider
              value={topP}
              onValueChange={handleTopPChange}
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
