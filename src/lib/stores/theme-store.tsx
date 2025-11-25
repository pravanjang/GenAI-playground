"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "genai-playground-theme"

// Load saved theme from localStorage
function loadSavedTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (saved === "light" || saved === "dark") {
      return saved
    }
  } catch (error) {
    console.error("Failed to load theme:", error)
  }
  return "dark"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize with saved theme on client side
    if (typeof window !== "undefined") {
      return loadSavedTheme()
    }
    return "dark"
  })

  // Apply theme class to document and save to localStorage
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
      console.error("Failed to save theme:", error)
    }
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
