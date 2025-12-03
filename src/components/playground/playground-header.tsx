"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Code2, Download, Share2, Moon, Sun } from "lucide-react"
import { SettingsDialog } from "@/components/playground/settings"
import { useTheme } from "@/lib/stores/theme-store"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function PlaygroundHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Playground</h1>
        </div>
        <div className="flex items-center gap-2">
          {Select && typeof Select === "function" ? (
            <Select defaultValue="none">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Load preset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No preset</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="qa">Q&amp;A</SelectItem>
              <SelectItem value="summarize">Summarize</SelectItem>
            </SelectContent>
            </Select>
          ) : (
            <div className="text-red-500 text-sm">Select component failed to load. Falling back to native select.</div>
          )}
          
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

          <div className="ml-2 h-6 w-px bg-border" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle {theme === "dark" ? "light" : "dark"} mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <SettingsDialog />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  )
}
