'use client'

import { useEffect, useRef } from 'react'

interface UseScrollToBottomOptions {
  /**
   * Scroll behavior: 'smooth' for animated scroll, 'instant' for immediate scroll
   * @default 'smooth'
   */
  behavior?: ScrollBehavior
  /**
   * Dependencies array to trigger scroll
   */
  dependencies?: unknown[]
}

/**
 * Hook for auto-scrolling to the bottom of a container
 * Commonly used for chat/messaging interfaces
 *
 * @example
 * ```tsx
 * const { scrollRef, scrollToBottom } = useScrollToBottom({
 *   dependencies: [messages],
 *   behavior: 'smooth'
 * })
 *
 * return (
 *   <div>
 *     {messages.map(msg => <Message key={msg.id} {...msg} />)}
 *     <div ref={scrollRef} />
 *   </div>
 * )
 * ```
 */
export function useScrollToBottom(options: UseScrollToBottomOptions = {}) {
  const { behavior = 'smooth', dependencies = [] } = options
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { scrollRef, scrollToBottom }
}
