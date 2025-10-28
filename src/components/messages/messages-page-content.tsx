'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InboxContent } from './inbox-content'
import { NotificationsContent } from './notifications-content'

interface MessagesPageContentProps {
  conversationId?: string
  onConversationClick: (conversationId: string) => void
}

export function MessagesPageContent({
  conversationId,
  onConversationClick,
}: MessagesPageContentProps) {
  const [activeTab, setActiveTab] = useState('messages')

  return (
    <div className="flex h-full w-full flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full w-full flex-col gap-0">
        {/* Tabs Header */}
        <div className="flex-shrink-0 bg-white px-6 pt-4 pb-4">
          <TabsList>
            <TabsTrigger value="messages">
              Chat with parents
            </TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tabs Content */}
        <TabsContent value="messages" className="mt-0 flex-1 min-h-0">
          <InboxContent conversationId={conversationId} onConversationClick={onConversationClick} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0 flex-1 min-h-0">
          <NotificationsContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}
