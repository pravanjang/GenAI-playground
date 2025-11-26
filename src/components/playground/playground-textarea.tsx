"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PlaygroundTextareaProps {
  onSubmit?: (text: string) => Promise<void>
  response?: string
  isError?: boolean
}

export function PlaygroundTextarea({ onSubmit, response, isError }: PlaygroundTextareaProps) {
  const [input, setInput] = useState("")
  const [internalOutput, setInternalOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Use response prop if available, otherwise fallback to internal state
  const output = response !== undefined ? response : internalOutput

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    try {
      if (onSubmit) {
        await onSubmit(input)
      } else {
        // Default mock response
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setInternalOutput(
          `Response to: "${input}"\n\nThis is a placeholder response. Connect your AI model to see real responses.`
        )
      }
    } catch (error) {
      setInternalOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto">
      <div className="space-y-2 flex-1">
        <Textarea
          placeholder="Enter your prompt here... (Ctrl/Cmd + Enter to submit)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[200px] resize-none font-mono text-sm"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>

      {output && (
        <div className="space-y-2">
          <div className={`text-sm font-medium ${isError ? "text-red-500" : "text-muted-foreground"}`}>
            {isError ? "Error:" : "Response:"}
          </div>
          <div className={`rounded-lg border p-4 ${isError
              ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
              : "border-border bg-muted/50"
            }`}>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
