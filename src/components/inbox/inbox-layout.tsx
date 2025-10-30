'use client'

import { useState } from 'react'
import { ConversationList } from './conversation-list'
import { ConversationView } from './conversation-view'
import { MetadataSidebar } from './metadata-sidebar'
import { useInbox } from '@/contexts/inbox-context'
import type { Priority } from '@/types/inbox'

interface InboxLayoutProps {
  conversationId?: string
  onConversationClick: (conversationId: string) => void
}

export function InboxLayout({ conversationId, onConversationClick }: InboxLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')

  // Get stable conversation data from context
  // This data persists across navigation, preventing flicker
  const {
    conversationGroups,
    isLoading: loading,
    error
  } = useInbox()

  // Filter by priority
  let filteredGroups = conversationGroups
  if (priorityFilter !== 'all') {
    filteredGroups = filteredGroups.filter((group) => group.priority === priorityFilter)
  }

  // Filter by search query
  if (searchQuery) {
    filteredGroups = filteredGroups.filter(
      (group) =>
        group.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.threads[0].participants.some((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
  }

  return (
    <div className="flex h-full w-full bg-stone-50">
      {/* Left Panel - Conversation List - 360px fixed */}
      <div className="w-[360px] min-h-0 flex-shrink-0 border-r border-stone-200 bg-white">
        <ConversationList
          conversationGroups={filteredGroups}
          activeConversationId={conversationId}
          onConversationClick={onConversationClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          isLoading={loading}
        />
      </div>

      {/* Right Panel - Conversation View + Metadata - Flex fill */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Conversation View - Flex grow */}
        <div className="flex-1 min-h-0 bg-white overflow-hidden">
          <ConversationView
            conversationId={conversationId}
            conversationGroups={conversationGroups}
          />
        </div>

        {/* Metadata Sidebar - 280px fixed */}
        {conversationId && (
          <div className="w-[280px] min-h-0 flex-shrink-0 border-l border-stone-200 bg-stone-50">
            <MetadataSidebar
              conversationId={conversationId}
              conversationGroups={conversationGroups}
              isLoading={loading}
            />
          </div>
        )}
      </div>
    </div>
  )
}
