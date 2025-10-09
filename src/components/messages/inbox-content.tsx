'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getFilteredConversations } from '@/lib/mock-data/chat-data'
import { formatLastMessageTime, truncateMessage, getInitials, getAvatarColor } from '@/lib/chat/utils'
import { Search, MessageSquare, Users } from 'lucide-react'
import { ConversationContent } from './conversation-content'
import { cn } from '@/lib/utils'

interface InboxContentProps {
  conversationId?: string
  onConversationClick: (conversationId: string) => void
}

export function InboxContent({ conversationId, onConversationClick }: InboxContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const conversations = getFilteredConversations(false, searchQuery)

  return (
    <div className="flex h-full w-full">
      {/* Left Panel - Conversation List */}
      <div className="flex w-80 flex-col border-r border-stone-200 bg-white">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-stone-200 p-4">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">Messages</h2>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="h-9 rounded-lg border-stone-200 bg-stone-50 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Search className="size-8 text-stone-400 mb-3" />
              <p className="text-sm text-stone-600">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {conversations.map((conversation) => {
                const { id, type, participants, groupName, studentContext, lastMessage, lastMessageAt, unreadCount } = conversation
                const otherParticipant = participants.find((p) => p.role === 'parent')
                const displayName = type === 'group' ? (groupName || 'Group Chat') : (otherParticipant?.name || 'Unknown')
                const isActive = conversationId === id

                const messagePreview = lastMessage
                  ? lastMessage.type === 'file'
                    ? `📎 ${lastMessage.attachments.length} file(s)`
                    : truncateMessage(lastMessage.content, 50)
                  : 'No messages yet'

                return (
                  <div
                    key={id}
                    onClick={() => onConversationClick(id)}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-stone-50',
                      isActive && 'bg-stone-100'
                    )}
                  >
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className={getAvatarColor(displayName)}>
                        {type === 'group' ? <Users className="h-5 w-5" /> : getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-stone-900 truncate">
                          {displayName}
                        </h3>
                        <span className="text-xs text-stone-500 flex-shrink-0">
                          {formatLastMessageTime(lastMessageAt)}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 mb-1 truncate">
                        {studentContext.studentName} • {studentContext.className}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-stone-500 truncate flex-1">
                          {lastMessage?.senderRole === 'teacher' && 'You: '}
                          {messagePreview}
                        </p>
                        {unreadCount > 0 && (
                          <Badge className="h-5 min-w-5 flex-shrink-0 rounded-full bg-stone-900 px-1.5 text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Conversation or Empty State */}
      <div className="flex-1 bg-stone-50">
        {conversationId ? (
          <ConversationContent conversationId={conversationId} />
        ) : (
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
        )}
      </div>
    </div>
  )
}
