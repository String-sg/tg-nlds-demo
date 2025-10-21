'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface AccessibilitySettings {
  highContrast: boolean
}

interface AccessibilityContextValue extends AccessibilitySettings {
  setHighContrast: (enabled: boolean) => void
  resetToDefaults: () => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

const STORAGE_KEY = 'app-accessibility-settings'

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialization - reads localStorage synchronously on first render
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.error('Failed to load accessibility settings from localStorage:', error)
    }
    return DEFAULT_SETTINGS
  })

  const [isMounted, setIsMounted] = useState(false)

  // Mark as mounted
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Apply settings to document root
  useEffect(() => {
    if (!isMounted || typeof document === 'undefined') return

    const root = document.documentElement

    // High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }, [settings, isMounted])

  // Save to localStorage whenever settings change
  const saveSettings = useCallback((newSettings: AccessibilitySettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    } catch (error) {
      console.error('Failed to save accessibility settings to localStorage:', error)
    }
  }, [])

  const setHighContrast = useCallback(
    (enabled: boolean) => {
      const newSettings = { ...settings, highContrast: enabled }
      setSettings(newSettings)
      saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
  }, [saveSettings])

  const value: AccessibilityContextValue = {
    ...settings,
    setHighContrast,
    resetToDefaults,
  }

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}
