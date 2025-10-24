'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'

// Assistant mode types (matches assistant-panel.tsx)
// Note: 'full' mode is handled by navigating to assistant tab, not stored in mode state
export type AssistantMode = 'sidebar' | 'floating'

// Message type - matches the one in assistant-panel.tsx
export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string | React.ReactNode
  timestamp: Date
  isThinking?: boolean
}

// Stored message type - only text content, no React nodes
type StoredMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isThinking?: boolean
  isPTMResponse?: boolean // Flag to show placeholder for PTM responses
}

// Assistant state
type AssistantState = {
  messages: Message[]
  isOpen: boolean
  mode: AssistantMode
  currentInput: string
}

// Context value type
type AssistantContextValue = {
  messages: Message[]
  isOpen: boolean
  mode: AssistantMode
  currentInput: string
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  setIsOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void
  setMode: (mode: AssistantMode | ((prev: AssistantMode) => AssistantMode)) => void
  setCurrentInput: (input: string | ((prev: string) => string)) => void
  clearMessages: () => void
}

// Create context
const AssistantContext = createContext<AssistantContextValue | null>(null)

// Storage key
const STORAGE_KEY = 'assistantState'

// Maximum messages to keep
const MAX_MESSAGES = 50

/**
 * Check if content is a React node (non-string)
 */
function isReactNode(content: string | React.ReactNode): content is React.ReactNode {
  return typeof content !== 'string'
}

/**
 * Load state from sessionStorage
 */
function loadFromStorage(): Partial<AssistantState> | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored)

    // Convert stored messages back to Message type
    const messages: Message[] = (parsed.messages || []).map((msg: StoredMessage) => {
      // If it was a PTM response, show a placeholder
      if (msg.isPTMResponse) {
        return {
          id: msg.id,
          role: msg.role,
          content: '(PTM response - not persisted)',
          timestamp: new Date(msg.timestamp),
          isThinking: msg.isThinking,
        }
      }

      return {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        isThinking: msg.isThinking,
      }
    })

    return {
      messages,
      isOpen: parsed.isOpen ?? false,
      mode: parsed.mode ?? 'sidebar',
      currentInput: parsed.currentInput ?? '',
    }
  } catch (error) {
    console.error('Failed to load assistant state from sessionStorage:', error)
    return null
  }
}

/**
 * Save state to sessionStorage
 */
function saveToStorage(state: AssistantState): void {
  if (typeof window === 'undefined') return

  try {
    // Convert messages to storable format
    // Skip React node content (PTM responses)
    const storableMessages: StoredMessage[] = state.messages
      .slice(-MAX_MESSAGES) // Keep only last 50 messages
      .map((msg) => {
        // If content is a React node (PTM response), mark it
        if (isReactNode(msg.content)) {
          return {
            id: msg.id,
            role: msg.role,
            content: '', // Don't store React content
            timestamp: msg.timestamp.toISOString(),
            isThinking: msg.isThinking,
            isPTMResponse: true,
          }
        }

        return {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          isThinking: msg.isThinking,
          isPTMResponse: false,
        }
      })

    const toStore = {
      messages: storableMessages,
      isOpen: state.isOpen,
      mode: state.mode,
      currentInput: state.currentInput,
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  } catch (error) {
    console.error('Failed to save assistant state to sessionStorage:', error)
  }
}

/**
 * Assistant Provider Component
 */
export function AssistantProvider({ children }: { children: React.ReactNode }) {
  // Track if component is mounted (for hydration safety)
  const [isMounted, setIsMounted] = useState(false)

  // Always initialize with default values to prevent hydration mismatch
  // We'll restore from sessionStorage after mount
  const [messages, setMessagesState] = useState<Message[]>([])
  const [isOpen, setIsOpenState] = useState<boolean>(false)
  const [mode, setModeState] = useState<AssistantMode>('sidebar')
  const [currentInput, setCurrentInputState] = useState<string>('')

  // Mark as mounted and restore from sessionStorage
  useEffect(() => {
    setIsMounted(true)

    // Restore state from sessionStorage after mount
    const stored = loadFromStorage()
    if (stored) {
      if (stored.messages) setMessagesState(stored.messages)
      if (stored.isOpen !== undefined) setIsOpenState(stored.isOpen)
      if (stored.mode) setModeState(stored.mode)
      if (stored.currentInput !== undefined) setCurrentInputState(stored.currentInput)
    }
  }, [])

  // Debounced persistence to sessionStorage
  useEffect(() => {
    if (!isMounted) return

    const timeoutId = setTimeout(() => {
      const persist = () => {
        const state: AssistantState = {
          messages,
          isOpen,
          mode,
          currentInput,
        }
        saveToStorage(state)
      }

      // Use requestIdleCallback if available for better performance
      if ('requestIdleCallback' in window) {
        requestIdleCallback(persist)
      } else {
        persist()
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [messages, isOpen, mode, currentInput, isMounted])

  // Wrapper for setMessages to enforce max limit
  const setMessages = useCallback(
    (value: Message[] | ((prev: Message[]) => Message[])) => {
      setMessagesState((prev) => {
        const newMessages = typeof value === 'function' ? value(prev) : value
        // Enforce max messages limit
        return newMessages.slice(-MAX_MESSAGES)
      })
    },
    []
  )

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessagesState([])
  }, [])

  const value: AssistantContextValue = {
    messages,
    isOpen,
    mode,
    currentInput,
    setMessages,
    setIsOpen: setIsOpenState,
    setMode: setModeState,
    setCurrentInput: setCurrentInputState,
    clearMessages,
  }

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

/**
 * Hook to use assistant context
 */
export function useAssistant(): AssistantContextValue {
  const context = useContext(AssistantContext)
  if (!context) {
    throw new Error('useAssistant must be used within AssistantProvider')
  }
  return context
}
