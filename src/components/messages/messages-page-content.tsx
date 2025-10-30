'use client'

import { InboxTabContainer } from './inbox-tab-container'

interface MessagesPageContentProps {
  conversationId?: string
  onConversationClick: (conversationId: string) => void
  defaultTab?: 'chat' | 'announcements' | 'meetings'
}

export function MessagesPageContent({
  conversationId,
  onConversationClick,
  defaultTab = 'chat',
}: MessagesPageContentProps) {
  return (
    <InboxTabContainer
      conversationId={conversationId}
      onConversationClick={onConversationClick}
      defaultTab={defaultTab}
    />
  )
}
