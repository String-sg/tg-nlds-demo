'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Paperclip, MoreVertical, MessageSquare, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials, getAvatarColor } from '@/lib/chat/utils'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { ConversationViewSkeleton } from './conversation-view-skeleton'
import type { ConversationGroup, ConversationThread } from '@/types/inbox'
import type { Message, Attachment } from '@/types/chat'

interface ConversationViewProps {
  conversationId?: string
  conversationGroups: ConversationGroup[]
}

export function ConversationView({ conversationId, conversationGroups }: ConversationViewProps) {
  const [newMessage, setNewMessage] = useState('')
  const [conversation, setConversation] = useState<ConversationThread | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const { scrollRef } = useScrollToBottom({ dependencies: [messages] })

  // Cache for loaded conversations - persists across renders
  const conversationCacheRef = useRef<Map<string, { conversation: ConversationThread; messages: Message[] }>>(new Map())

  useEffect(() => {
    if (!conversationId) {
      setConversation(undefined)
      setMessages([])
      return
    }

    // Check if conversation is in cache
    const cached = conversationCacheRef.current.get(conversationId)
    if (cached) {
      // Use cached data immediately (no skeleton, no delay)
      setConversation(cached.conversation)
      setMessages(cached.messages)
      return
    }

    // Not in cache - simulate async loading with setTimeout (in real app, this would be an API call)
    const timeoutId = setTimeout(() => {
      // Find the conversation
      for (const group of conversationGroups) {
        const thread = group.threads.find((t) => t.id === conversationId)
        if (thread) {
          const loadedData = {
            conversation: thread,
            messages: thread.messages,
          }
          // Store in cache for future use
          conversationCacheRef.current.set(conversationId, loadedData)
          // Update state
          setConversation(thread)
          setMessages(thread.messages)
          break
        }
      }
    }, 400) // 400ms delay to show skeleton

    return () => clearTimeout(timeoutId)
  }, [conversationId, conversationGroups])

  // Derive loading state synchronously - only show skeleton if:
  // 1. We have a conversationId to load AND
  // 2. The conversation is NOT in cache AND
  // 3. Either we have no conversation loaded OR the loaded conversation doesn't match
  const isInCache = conversationId ? conversationCacheRef.current.has(conversationId) : false
  const shouldShowSkeleton = conversationId && !isInCache && (!conversation || conversation.id !== conversationId)

  const handleSendMessage = () => {
    if (!conversation || !newMessage.trim()) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      senderId: 'teacher-1',
      senderName: 'You',
      senderRole: 'teacher',
      type: 'text',
      content: newMessage.trim(),
      attachments: [],
      sentAt: new Date(),
      status: 'sent',
      readBy: [],
    }

    setMessages([...messages, message])
    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Show loading skeleton when switching conversations
  if (shouldShowSkeleton) {
    return <ConversationViewSkeleton />
  }

  // Show empty state when no conversation is selected
  if (!conversationId || !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-4">
        <div className="rounded-full bg-stone-200 p-6 mb-4">
          <MessageSquare className="size-12 text-stone-500" />
        </div>
        <h3 className="text-xl font-semibold text-stone-900 mb-2">
          Select a conversation
        </h3>
        <p className="text-sm text-stone-600 max-w-md">
          Choose a conversation from the list to view messages and continue chatting with parents and guardians.
        </p>
      </div>
    )
  }

  const parentParticipant = conversation.participants.find((p) => p.role === 'parent')
  const displayName = conversation.type === 'group'
    ? conversation.groupName || 'Group Chat'
    : parentParticipant?.name || 'Unknown'

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ''

    msgs.forEach((msg) => {
      const msgDate = msg.sentAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msgDate, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    })

    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={getAvatarColor(displayName)}>
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">{displayName}</h2>
              <p className="text-xs text-stone-600">
                Parent of {conversation.studentContext.studentName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0 bg-stone-50 px-6 py-4">
        <div className="space-y-6">
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              {/* Date separator */}
              <div className="flex items-center justify-center">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((message) => {
                const isOwn = message.senderRole === 'teacher'

                return (
                  <div key={message.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[70%]', !isOwn && 'flex items-start gap-2')}>
                      {!isOwn && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={getAvatarColor(message.senderName)}>
                            {getInitials(message.senderName)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div>
                        <div
                          className={cn(
                            'rounded-lg px-3 py-2',
                            isOwn ? 'bg-stone-900 text-white' : 'bg-white text-stone-900 shadow-sm'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p className={cn('text-xs mt-1', isOwn ? 'text-stone-400' : 'text-stone-500')}>
                            {message.sentAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-stone-200 bg-white p-4">
        <div className="flex items-end gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-10 w-10 flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />

          <Button
            type="button"
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-10 w-10 flex-shrink-0 bg-stone-900 hover:bg-stone-800"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-xs text-stone-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
