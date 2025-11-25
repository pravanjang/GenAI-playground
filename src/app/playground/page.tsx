"use client"

import { PlaygroundHeader } from "@/components/playground/playground-header"
import { PlaygroundSidebar } from "@/components/playground/playground-sidebar"
import { PlaygroundTextarea } from "@/components/playground/playground-textarea"

export default function Playground() {
  return (
    <div className="flex h-screen flex-col">
      <PlaygroundHeader />
      <div className="flex flex-1 overflow-hidden">
        <PlaygroundTextarea />
        <PlaygroundSidebar />
      </div>
    </div>
  )
}
