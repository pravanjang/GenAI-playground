"use client";

import { FormEvent, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { TextUIPart, UIMessage } from "ai";
import {
  History,
  Loader2,
  RotateCcw,
  Sparkles,
  StopCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ControlPanel } from "@/components/playground/control-panel";
import { MessageBubble } from "@/components/playground/message-bubble";
import { ModelPanel } from "@/components/playground/model-panel";
import {
  DEFAULT_MODEL_ID,
  MODEL_OPTIONS,
  type ModelId,
} from "@/data/models";
import type { PlaygroundPreset } from "@/data/presets";
import { PRESETS } from "@/data/presets";

const extractMessageText = (message: UIMessage) => {
  const textChunks = message.parts
    ?.filter((part): part is TextUIPart => part.type === "text")
    .map((part) => part.text.trim())
    .filter(Boolean);

  if (textChunks && textChunks.length > 0) {
    return textChunks.join("\n\n");
  }

  const fallback = (message as { content?: string }).content;
  return fallback ?? "";
};

export default function PlaygroundPage() {
  const [modelId, setModelId] = useState<ModelId>(DEFAULT_MODEL_ID);
  const [temperature, setTemperature] = useState(0.65);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [input, setInput] = useState("");

  const selectedModel = useMemo(
    () => MODEL_OPTIONS.find((option) => option.id === modelId) ?? MODEL_OPTIONS[0]!,
    [modelId],
  );

  const {
    messages,
    sendMessage,
    stop,
    setMessages,
    error,
    status,
  } = useChat({
    onError: (chatError) => {
      toast.error(chatError.message ?? "Something went wrong");
    },
  });

  const isStreaming = status === "submitted" || status === "streaming";

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      toast.error("Add a prompt first.");
      return;
    }

    try {
      await sendMessage(
        { text: input },
        {
          body: {
            modelId,
            temperature,
            topP,
            maxTokens,
          },
        },
      );
      setInput("");
    } catch (sendError) {
      const description =
        sendError instanceof Error ? sendError.message : "Failed to send the prompt";
      toast.error(description);
    }
  };

  const handlePresetApply = (preset: PlaygroundPreset) => {
    setInput(preset.prompt);
    setTemperature(preset.temperature);
    setTopP(preset.topP);
    toast.success(`Loaded ${preset.label}`);
  };

  const secondaryHistory = useMemo(
    () =>
      messages
        .filter((message) => message.role === "user")
        .slice(-3)
        .reverse(),
    [messages],
  );

  const resetSession = () => {
    setMessages([]);
    setInput("");
    toast.message("Session cleared");
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
      <aside className="w-full rounded-3xl border border-border/50 bg-card/70 p-6 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.65)] backdrop-blur lg:w-80">
        <ControlPanel
          temperature={temperature}
          topP={topP}
          maxTokens={maxTokens}
          modelId={modelId}
          onTemperatureChange={setTemperature}
          onTopPChange={setTopP}
          onMaxTokensChange={setMaxTokens}
          onModelChange={setModelId}
          onPresetApply={handlePresetApply}
        />
      </aside>

      <main className="flex flex-1 flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <ModelPanel model={selectedModel} />
          <Card className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Session tools</p>
                <p className="text-lg font-semibold">Realtime instrumentation</p>
              </div>
              <Button variant="ghost" onClick={resetSession} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {messages.filter((message) => message.role === "assistant").length} responses
              </Badge>
              <Badge variant="outline" className="gap-2 text-xs">
                <History className="h-3.5 w-3.5 text-primary" />
                {messages.filter((message) => message.role === "user").length} prompts
              </Badge>
            </div>
            <Separator />
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">Recent prompts</p>
              {secondaryHistory.length ? (
                secondaryHistory.map((message) => (
                  <p
                    key={message.id}
                    className="line-clamp-2 rounded-xl border border-dashed border-border/60 bg-muted/30 p-3"
                  >
                    {extractMessageText(message) || "No prompt body"}
                  </p>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-3 text-muted-foreground">
                  Nothing here yet — start by loading a preset.
                </p>
              )}
            </div>
          </Card>
        </div>

        <section className="flex flex-1 flex-col rounded-3xl border border-border/60 bg-card/80 shadow-[0_40px_120px_-80px_rgba(124,58,237,0.9)]">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Playground
              </p>
              <h1 className="text-2xl font-semibold">Ask anything</h1>
            </div>
            <Badge variant="outline" className="text-xs uppercase">
              {selectedModel.label}
            </Badge>
          </header>

          <div className="flex flex-1 flex-col gap-4 overflow-hidden px-6 py-4">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.length === 0 ? (
                <div className="grid h-full place-items-center rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
                  Load a preset prompt or describe the task you have in mind. The
                  playground streams the model output as it is generated so you
                  can stop at any time.
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    role={message.role === "system" ? "assistant" : message.role}
                    content={extractMessageText(message)}
                  />
                ))
              )}
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <Textarea
                placeholder={PRESETS[0]?.prompt ?? "Write a product summary"}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-h-[160px] bg-background/60"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                {error ? (
                  <p className="text-sm text-destructive">{error.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Tokens capped at {maxTokens.toLocaleString()} behind the scenes.
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void stop()}
                    disabled={!isStreaming}
                    className="gap-2"
                  >
                    <StopCircle className="h-4 w-4" />
                    Stop
                  </Button>
                  <Button type="submit" className="gap-2" disabled={isStreaming}>
                    {isStreaming ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Generating
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Submit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
