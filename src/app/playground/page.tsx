"use client"

import { useState } from "react"
import { PlaygroundHeader } from "@/components/playground/playground-header"
import { PlaygroundSidebar } from "@/components/playground/playground-sidebar"
import { PlaygroundTextarea } from "@/components/playground/playground-textarea"
import { useAPIKeys } from "@/lib/stores/api-key-store"
import { getConnector } from "@/lib/connectors"
import { MODELS } from "@/lib/types"

export default function Playground() {
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [temperature, setTemperature] = useState(0.7)
  const [maxLength, setMaxLength] = useState(256)
  const [topP, setTopP] = useState(0.9)
  const [response, setResponse] = useState<string | undefined>(undefined)

  const { config } = useAPIKeys()

  const handleSubmit = async (text: string) => {
    setResponse("") // Clear previous response

    if (!selectedModel) {
      setResponse("Please select a model first.")
      return
    }

    const modelInfo = MODELS.find(m => m.id === selectedModel)
    if (!modelInfo) {
      setResponse("Invalid model selected.")
      return
    }

    try {
      const connector = getConnector(modelInfo.provider)
      const providerConfig = config.providers.find(p => p.id === modelInfo.provider)

      if (!providerConfig || !providerConfig.apiKey) {
        setResponse(`Please configure API key for ${modelInfo.provider}.`)
        return
      }

      const stream = await connector.chat(
        [{
          role: "user",
          content: text,
          id: crypto.randomUUID(),
          timestamp: Date.now()
        }],
        {
          provider: modelInfo.provider,
          model: selectedModel,
          temperature,
          maxTokens: maxLength,
          topP,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        providerConfig.apiKey,
        true // Always stream for now
      )

      if (typeof stream === "string") {
        setResponse(stream)
      } else {
        const reader = stream.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)

          // Let's try to do a basic parsing for OpenAI style SSE
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6))
                const content = data.choices[0]?.delta?.content || ""
                setResponse(prev => (prev || "") + content)
              } catch (e) {
                // ignore parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <PlaygroundHeader />
      <div className="flex flex-1 overflow-hidden">
        <PlaygroundTextarea
          onSubmit={handleSubmit}
          response={response}
        />
        <PlaygroundSidebar
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          temperature={temperature}
          onTemperatureChange={setTemperature}
          maxLength={maxLength}
          onMaxLengthChange={setMaxLength}
          topP={topP}
          onTopPChange={setTopP}
        />
      </div>
    </div>
  )
}
