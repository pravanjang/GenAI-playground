"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ModelId, ModelOption } from "@/data/models";
import { MODEL_OPTIONS } from "@/data/models";
import type { PlaygroundPreset } from "@/data/presets";
import { PRESETS } from "@/data/presets";

interface ControlPanelProps {
  temperature: number;
  topP: number;
  maxTokens: number;
  modelId: ModelId;
  onTemperatureChange: (value: number) => void;
  onTopPChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onModelChange: (id: ModelId) => void;
  onPresetApply: (preset: PlaygroundPreset) => void;
}

export function ControlPanel({
  temperature,
  topP,
  maxTokens,
  modelId,
  onTemperatureChange,
  onTopPChange,
  onMaxTokensChange,
  onModelChange,
  onPresetApply,
}: ControlPanelProps) {
  const selectedModel = useMemo(
    () => MODEL_OPTIONS.find((option) => option.id === modelId) ?? MODEL_OPTIONS[0]!,
    [modelId],
  );

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Select value={modelId} onValueChange={(value) => onModelChange(value as ModelId)}>
          <SelectTrigger id="model" aria-label="Model selector">
            <SelectValue placeholder="Pick a model" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectLabel>OpenAI hosted</SelectLabel>
              {MODEL_OPTIONS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{model.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.bestFor}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{selectedModel.contextWindow} context</span>
          <span>•</span>
          <span>{selectedModel.maxOutput.toLocaleString()} max output</span>
        </div>
      </section>

      <section className="space-y-3">
        <Tabs defaultValue="presets">
          <div className="flex items-center justify-between">
            <Label>Prompt helpers</Label>
            <TabsList>
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="presets">
            <ScrollArea className="h-32 rounded-xl border border-dashed p-3">
              <div className="flex flex-col gap-3 text-sm">
                {PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="rounded-xl border border-transparent bg-muted/60 p-3 transition hover:border-border"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{preset.label}</p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onPresetApply(preset)}
                      >
                        Load
                      </Button>
                    </div>
                    <p className="mt-1 text-muted-foreground">{preset.prompt}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="notes">
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Save time by seeding the editor with consistent prompts. Presets
              also update temperature and top-p to match the expected writing
              style.
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <Label>Temperature</Label>
          <Badge variant="outline">{temperature.toFixed(2)}</Badge>
        </div>
        <Slider
          value={[temperature]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([value]) => value !== undefined && onTemperatureChange(Number(value.toFixed(2)))}
        />
        <p className="text-xs text-muted-foreground">
          Higher values make the model more creative while lower values keep it
          deterministic.
        </p>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <Label>Top P</Label>
          <Badge variant="outline">{topP.toFixed(2)}</Badge>
        </div>
        <Slider
          value={[topP]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([value]) => value !== undefined && onTopPChange(Number(value.toFixed(2)))}
        />
        <p className="text-xs text-muted-foreground">
          Controls nucleus sampling. Keep between 0.6 and 0.95 for most creative
          tasks.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="maxTokens">Max output tokens</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="What is this?">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top">
              Keep this below the provider maximum to avoid truncation. The
              playground uses streaming responses, so you can interrupt anytime.
            </PopoverContent>
          </Popover>
        </div>
        <Input
          id="maxTokens"
          type="number"
          min={256}
          max={selectedModel.maxOutput}
          value={maxTokens}
          onChange={(event) =>
            onMaxTokensChange(
              Math.min(selectedModel.maxOutput, Number(event.target.value) || 0),
            )
          }
        />
      </section>
    </div>
  );
}

export type { ModelOption };
