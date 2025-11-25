"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings } from "lucide-react"
import { APIKeyInput } from "./api-key-input"
import { useAPIKeys } from "@/lib/stores/api-key-store"
import { PROVIDERS, ProviderID } from "@/lib/types"
import { Separator } from "@/components/ui/separator"

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const { testAllConnections, clearAllKeys, isAnyKeyConfigured } = useAPIKeys()
  const [isTesting, setIsTesting] = useState(false)

  const handleTestAll = async () => {
    setIsTesting(true)
    await testAllConnections()
    setIsTesting(false)
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to remove all API keys?")) {
      clearAllKeys()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4 mt-4">
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-sm text-yellow-500 dark:text-yellow-400">
                <strong>🔒 Security Notice:</strong> API keys are sensitive
                credentials. Never share your keys or commit them to version
                control. Keys stored in your browser are encoded but remain
                vulnerable to XSS attacks. For production use, consider using
                server-side key management.
              </p>
            </div>

            <div className="space-y-4">
              {(Object.keys(PROVIDERS) as ProviderID[]).map((providerId) => (
                <APIKeyInput key={providerId} providerId={providerId} />
              ))}
            </div>

            <Separator />

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestAll}
                  disabled={!isAnyKeyConfigured() || isTesting}
                >
                  {isTesting ? "Testing..." : "Test All Connections"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={!isAnyKeyConfigured()}
                  className="text-destructive hover:text-destructive"
                >
                  Clear All Keys
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">UI Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Additional preferences will be available in future updates.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">GenAI Playground</h3>
              <p className="text-sm text-muted-foreground">
                An interactive AI playground for experimenting with multiple
                language models including GPT-4, Claude, and Gemini.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Version:</strong> 0.1.0
                </p>
                <p>
                  <strong>Documentation:</strong>{" "}
                  <a
                    href="https://github.com/pravanjang/GenAI-playground"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    GitHub Repository
                  </a>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
