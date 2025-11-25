"use client"

import { APIKeyProvider } from "@/lib/stores/api-key-store"
import { ThemeProvider } from "@/lib/stores/theme-store"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <APIKeyProvider>{children}</APIKeyProvider>
    </ThemeProvider>
  )
}
