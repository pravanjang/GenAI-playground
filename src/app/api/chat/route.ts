import { NextResponse } from "next/server";
import { streamText, convertToCoreMessages, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

import { env } from "@/lib/env";

const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "system", "assistant"]),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  parts: z
    .array(
      z
        .object({
          type: z.string(),
        })
        .passthrough(),
    )
    .optional(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema),
  modelId: z.string().default("gpt-4o-mini"),
  temperature: z.number().min(0).max(1).default(0.7),
  topP: z.number().min(0).max(1).default(0.9),
  maxTokens: z.number().min(256).max(16384).default(4096),
});

export async function POST(request: Request) {
  const json = await request.json();
  const { messages, modelId, temperature, topP, maxTokens } = requestSchema.parse(json);

  const response = await streamText({
    model: openai(modelId),
    messages: convertToCoreMessages(messages as UIMessage[]),
    temperature,
    topP,
    maxOutputTokens: maxTokens,
    system:
      "You are a concise creative partner inside a developer playground. Provide structured, high-signal answers and avoid hallucinating facts.",
  });

  return response.toUIMessageStreamResponse();
}

export function GET() {
  return NextResponse.json({
    status: "ready",
    models: ["gpt-4o-mini", "gpt-4.1-mini", "o4-mini", "gpt-4.1"],
  });
}
