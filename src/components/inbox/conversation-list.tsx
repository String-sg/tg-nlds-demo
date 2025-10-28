'use client'

import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, MessageSquare, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials, getAvatarColor } from '@/lib/chat/utils'
import { ConversationListSkeleton } from './conversation-list-skeleton'
import type { ConversationGroup, Priority } from '@/types/inbox'

interface ConversationListProps {
  conversationGroups: ConversationGroup[]
  activeConversationId?: string
  onConversationClick: (conversationId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  priorityFilter: Priority | 'all'
  onPriorityFilterChange: (filter: Priority | 'all') => void
  isLoading?: boolean
}

export function ConversationList({
  conversationGroups,
  activeConversationId,
  onConversationClick,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  isLoading = false,
}: ConversationListProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getFilterLabel = () => {
    switch (priorityFilter) {
      case 'urgent':
        return 'Urgent'
      case 'follow-up':
        return 'Follow up'
      case 'active':
        return 'Active'
      case 'resolved':
        return 'Resolved'
      default:
        return 'All'
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-stone-200 p-4">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Conversations</h2>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="h-9 rounded-lg border-stone-200 bg-stone-50 pl-9 pr-3 text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 border-stone-200 bg-stone-50 hover:bg-stone-100"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">{getFilterLabel()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onPriorityFilterChange('all')}>
                All Conversations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityFilterChange('urgent')}>
                Urgent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityFilterChange('follow-up')}>
                Follow up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityFilterChange('active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityFilterChange('resolved')}>
                Resolved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 min-h-0">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : conversationGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="size-8 text-stone-400 mb-3" />
            <p className="text-sm text-stone-600">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {conversationGroups.map((group) => {
              const latestThread = group.threads[0]
              const latestMessage = latestThread.messages[latestThread.messages.length - 1]
              const isActive = latestThread.id === activeConversationId

              // Get parent name for subtitle
              const parentParticipant = latestThread.participants.find((p) => p.role === 'parent')
              const parentName = latestThread.type === 'group'
                ? latestThread.groupName || 'Group Chat'
                : parentParticipant?.name || 'Unknown'

              return (
                <div
                  key={latestThread.id}
                  onClick={() => onConversationClick(latestThread.id)}
                  className={cn(
                    'cursor-pointer border-l-2 px-4 py-3 transition-colors hover:bg-stone-50',
                    isActive
                      ? 'border-l-stone-900 bg-stone-50'
                      : 'border-l-transparent'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar - Show parent initials */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className={getAvatarColor(parentName)}>
                        {getInitials(parentName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          {/* Parent name as primary with priority dot */}
                          <div className="flex items-center gap-2">
                            {group.priority === 'urgent' && (
                              <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                            )}
                            <h3 className="text-sm font-semibold text-stone-900 truncate">
                              {parentName}
                            </h3>
                          </div>
                          {/* Student name and class as secondary */}
                          <p className="text-xs text-stone-600 truncate">
                            {group.student.name} • {group.student.class}
                          </p>
                        </div>
                        <span className="text-xs text-stone-500 flex-shrink-0">
                          {formatTime(latestMessage.sentAt)}
                        </span>
                      </div>

                      <p className="text-sm text-stone-700 line-clamp-1">
                        {latestMessage.senderRole === 'teacher' && 'You: '}
                        {latestMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
