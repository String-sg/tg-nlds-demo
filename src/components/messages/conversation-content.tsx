'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getConversation, getConversationMessages } from '@/lib/mock-data/chat-data'
import { groupMessagesByDate, getDateSeparator, formatMessageTime, formatFileSize, getFileIcon, getInitials, getAvatarColor } from '@/lib/chat/utils'
import type { Conversation, Message, Attachment } from '@/types/chat'
import { Send, Paperclip, X, Download, Users, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConversationContentProps {
  conversationId: string
}

export function ConversationContent({ conversationId }: ConversationContentProps) {
  const [conversation, setConversation] = useState<Conversation | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const conv = getConversation(conversationId)
    const msgs = getConversationMessages(conversationId)
    setConversation(conv)
    setMessages(msgs)
  }, [conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!conversation || (!newMessage.trim() && attachedFiles.length === 0)) return

    const attachments: Attachment[] = attachedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: URL.createObjectURL(file),
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      senderId: 'teacher-1',
      senderName: 'You',
      senderRole: 'teacher',
      type: attachedFiles.length > 0 ? 'file' : 'text',
      content: newMessage.trim(),
      attachments,
      sentAt: new Date(),
      status: 'sending',
      readBy: [],
    }

    setMessages([...messages, message])
    setNewMessage('')
    setAttachedFiles([])

    // Simulate sending
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === message.id ? { ...msg, status: 'sent' as const } : msg))
      )
    }, 500)

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === message.id ? { ...msg, status: 'delivered' as const } : msg))
      )
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 10)
    setAttachedFiles([...attachedFiles, ...files].slice(0, 10))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-stone-500">Conversation not found</p>
      </div>
    )
  }

  const { type, participants, groupName, studentContext } = conversation
  const otherParticipant = participants.find((p) => p.role === 'parent')
  const displayName = type === 'group' ? (groupName || 'Group Chat') : (otherParticipant?.name || 'Unknown')
  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={getAvatarColor(displayName)}>
                {type === 'group' ? <Users className="h-5 w-5" /> : getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">{displayName}</h2>
              <p className="text-xs text-stone-600">
                {type === 'group'
                  ? `Group • ${studentContext.studentName}`
                  : `Parent of ${studentContext.studentName}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-stone-50 px-6 py-4">
        {messageGroups.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-stone-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                {/* Date separator */}
                <div className="flex items-center justify-center">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
                    {getDateSeparator(group.date)}
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
                          {/* Sender name for group chats */}
                          {type === 'group' && !isOwn && (
                            <p className="text-xs font-medium text-stone-600 mb-1 ml-1">{message.senderName}</p>
                          )}

                          <div
                            className={cn(
                              'rounded-lg px-3 py-2',
                              isOwn ? 'bg-stone-900 text-white' : 'bg-white text-stone-900 shadow-sm'
                            )}
                          >
                            {/* Text content */}
                            {message.content && (
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            )}

                            {/* File attachments */}
                            {message.attachments.length > 0 && (
                              <div className={cn('space-y-2', message.content && 'mt-2')}>
                                {message.attachments.map((attachment) => {
                                  const isImage = attachment.fileType.startsWith('image/')

                                  if (isImage) {
                                    return (
                                      <div key={attachment.id} className="rounded-lg overflow-hidden">
                                        <img
                                          src={attachment.fileUrl}
                                          alt={attachment.fileName}
                                          className="max-w-full h-auto rounded"
                                        />
                                      </div>
                                    )
                                  }

                                  return (
                                    <div
                                      key={attachment.id}
                                      className={cn(
                                        'flex items-center gap-2 rounded p-2',
                                        isOwn ? 'bg-stone-800' : 'bg-stone-50'
                                      )}
                                    >
                                      <div className="text-xl">{getFileIcon(attachment.fileType)}</div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">
                                          {attachment.fileName}
                                        </p>
                                        <p className={cn('text-xs', isOwn ? 'text-stone-400' : 'text-stone-500')}>
                                          {formatFileSize(attachment.fileSize)}
                                        </p>
                                      </div>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Timestamp */}
                            <p className={cn('text-xs mt-1', isOwn ? 'text-stone-400' : 'text-stone-500')}>
                              {formatMessageTime(message.sentAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-stone-200 bg-white p-4">
        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 space-y-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg bg-stone-50 p-2">
                <div className="text-lg">{getFileIcon(file.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-stone-500">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== index))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input controls */}
        <div className="flex items-end gap-2">
          {/* File input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={attachedFiles.length >= 10}
            className="h-10 w-10 flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Textarea */}
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />

          {/* Send button */}
          <Button
            type="button"
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && attachedFiles.length === 0}
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
