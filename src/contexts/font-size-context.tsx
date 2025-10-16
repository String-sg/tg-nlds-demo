'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface FontSizeContextValue {
  fontSize: number
  setFontSize: (size: number) => void
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null)

const FONT_SIZE_KEY = 'app-font-size'
const DEFAULT_FONT_SIZE = 18

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialization - reads localStorage synchronously on first render
  const [fontSize, setFontSizeState] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_FONT_SIZE
    
    try {
      const stored = localStorage.getItem(FONT_SIZE_KEY)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed >= 14 && parsed <= 20) {
          return parsed
        }
      }
    } catch (error) {
      console.error('Failed to load font size from localStorage:', error)
    }
    return DEFAULT_FONT_SIZE
  })
  
  const [isMounted, setIsMounted] = useState(false)

  // Mark as mounted
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Apply font size to document root
  useEffect(() => {
    if (isMounted && typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`)
    }
  }, [fontSize, isMounted])

  const setFontSize = useCallback((size: number) => {
    if (size < 14 || size > 20) {
      console.warn('Font size must be between 14 and 20px')
      return
    }

    setFontSizeState(size)

    try {
      localStorage.setItem(FONT_SIZE_KEY, size.toString())
    } catch (error) {
      console.error('Failed to save font size to localStorage:', error)
    }
  }, [])

  const value: FontSizeContextValue = {
    fontSize,
    setFontSize,
  }

  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>
}

export function useFontSize(): FontSizeContextValue {
  const context = useContext(FontSizeContext)
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider')
  }
  return context
}
