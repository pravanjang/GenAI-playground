"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Code2, Download, Share2 } from "lucide-react"

export function PlaygroundHeader() {
  return (
    <header className="border-b border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Playground</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="none">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Load preset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No preset</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="qa">Q&A</SelectItem>
              <SelectItem value="summarize">Summarize</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Code2 className="h-4 w-4" />
            View code
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </header>
  )
}
