export type ModelId = "gpt-4o-mini" | "gpt-4.1-mini" | "o4-mini" | "gpt-4.1";

export interface ModelOption {
  id: ModelId;
  label: string;
  provider: string;
  release: string;
  contextWindow: string;
  bestFor: string;
  maxOutput: number;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "OpenAI",
    release: "Aug 2025",
    contextWindow: "128K tokens",
    bestFor: "Fast drafting & UI prototyping",
    maxOutput: 4096,
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    provider: "OpenAI",
    release: "Oct 2025",
    contextWindow: "128K tokens",
    bestFor: "High-signal reasoning",
    maxOutput: 8192,
  },
  {
    id: "o4-mini",
    label: "o4 Mini",
    provider: "OpenAI",
    release: "Sep 2025",
    contextWindow: "200K tokens",
    bestFor: "Analytical reports & planning",
    maxOutput: 8192,
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    provider: "OpenAI",
    release: "Jun 2025",
    contextWindow: "200K tokens",
    bestFor: "Long-form agent workflows",
    maxOutput: 16384,
  },
];

export const DEFAULT_MODEL_ID: ModelId = MODEL_OPTIONS[0]!.id;
