'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Send, Paperclip, MoreVertical, MessageSquare, Loader2, Trash2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials, getAvatarColor } from '@/lib/chat/utils'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useConversation } from '@/hooks/use-conversation-lookup'
import { useSendMessageMutation } from '@/hooks/mutations/use-send-message-mutation'
import { useDeleteConversationMutation } from '@/hooks/mutations/use-delete-conversation-mutation'
import { useUser } from '@/contexts/user-context'
import type { ConversationGroup, ConversationThread } from '@/types/inbox'
import type { Message } from '@/types/chat'

interface ConversationViewProps {
  conversationId?: string
  conversationGroups: ConversationGroup[]
}

export function ConversationView({ conversationId, conversationGroups }: ConversationViewProps) {
  const [newMessage, setNewMessage] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { user } = useUser()

  // Instant O(1) lookup - no delay, no linear search
  const conversation = useConversation(conversationGroups, conversationId)

  // Track the displayed conversation to prevent flicker during transitions
  const [displayedConversation, setDisplayedConversation] = useState<ConversationThread | undefined>()

  // Only update displayed conversation when we have a valid one
  // This prevents flicker when switching - keeps previous conversation visible during transition
  useEffect(() => {
    if (conversation) {
      setDisplayedConversation(conversation)
    }
  }, [conversation])

  // Get messages from displayed conversation (not the transitioning one)
  const messages = displayedConversation?.messages || []

  // Auto-scroll to bottom when messages change
  const { scrollRef } = useScrollToBottom({ dependencies: [messages] })

  // Mutation hook for sending messages with optimistic updates
  const sendMessageMutation = useSendMessageMutation(user?.user_id)

  // Mutation hook for deleting conversations
  const deleteConversationMutation = useDeleteConversationMutation(user?.user_id)

  const handleSendMessage = async () => {
    if (!displayedConversation || !newMessage.trim() || sendMessageMutation.isPending) return

    const messageContent = newMessage.trim()

    // Clear input immediately for better UX
    setNewMessage('')

    // Send message with optimistic update (mutation hook handles the optimistic UI)
    sendMessageMutation.mutate({
      conversationId: displayedConversation.id,
      content: messageContent,
      senderType: 'teacher',
      senderName: user?.name || 'Teacher', // Use actual user name
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleDeleteConversation = () => {
    if (!displayedConversation) return

    deleteConversationMutation.mutate({
      conversationId: displayedConversation.id,
    })
    setShowDeleteDialog(false)
  }

  // Show empty state ONLY when no conversation is selected in URL
  // Never show it when conversationId exists (even during loading/transition)
  if (!conversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-4 bg-stone-50">
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

  // If we don't have a conversation to display yet, return null (blank screen)
  // This prevents the flicker - better to show nothing briefly than wrong content
  if (!displayedConversation) {
    return null
  }

  const parentParticipant = displayedConversation.participants.find((p) => p.role === 'parent')
  const displayName = displayedConversation.type === 'group'
    ? displayedConversation.groupName || 'Group Chat'
    : parentParticipant?.name || 'Unknown'

  // Find student info from conversationGroups
  let studentInfo: { name: string; avatar?: string } | undefined
  for (const group of conversationGroups) {
    const thread = group.threads.find((t) => t.id === displayedConversation.id)
    if (thread) {
      studentInfo = {
        name: group.student.name,
        avatar: group.student.avatar,
      }
      break
    }
  }
  const studentName = studentInfo?.name || displayedConversation.studentContext.studentName
  const studentAvatar = studentInfo?.avatar

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
            {displayedConversation.type === 'group' ? (
              <div className="relative h-10 w-10">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={studentAvatar ?? undefined} alt={studentName} />
                  <AvatarFallback className={getAvatarColor(studentName)}>
                    {getInitials(studentName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border border-stone-200 grid place-items-center">
                  <Users className="h-3.5 w-3.5 text-stone-600" />
                </div>
              </div>
            ) : (
              <Avatar className="h-10 w-10">
                <AvatarImage src={studentAvatar} alt={studentName} />
                <AvatarFallback className={getAvatarColor(studentName)}>
                  {getInitials(studentName)}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h2 className="text-sm font-semibold text-stone-900">{displayName}</h2>
              <p className="text-xs text-stone-600">
                Parent of {studentName}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0 bg-stone-50">
        <div className="space-y-6 px-6 py-4 min-h-full">
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
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="h-10 w-10 flex-shrink-0 bg-stone-900 hover:bg-stone-800"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        <p className="text-xs text-stone-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and will permanently
              delete all messages in this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteConversationMutation.isPending}
            >
              {deleteConversationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
