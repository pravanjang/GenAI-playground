export interface PlaygroundPreset {
  id: string;
  label: string;
  prompt: string;
  temperature: number;
  topP: number;
}

export const PRESETS: PlaygroundPreset[] = [
  {
    id: "tagline",
    label: "Brand Tagline",
    prompt:
      "Write a punchy tagline for a neighborhood ice cream shop that leans into nostalgic summer vibes.",
    temperature: 0.8,
    topP: 0.9,
  },
  {
    id: "support",
    label: "Support Reply",
    prompt:
      "Answer a customer asking why their order is delayed. Be empathetic, action-oriented, and include tracking next steps.",
    temperature: 0.4,
    topP: 0.85,
  },
  {
    id: "product",
    label: "Product Brief",
    prompt:
      "Create a two-paragraph overview for a hypothetical AI meeting copilot that summarizes positioning, core value props, and a CTA.",
    temperature: 0.6,
    topP: 0.92,
  },
];
