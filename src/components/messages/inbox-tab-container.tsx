'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InboxContent } from './inbox-content'
import { AnnouncementsTabContent } from './announcements-tab-content'
import { MeetingsTabContent } from './meetings-tab-content'
import { MessageSquare, Megaphone, CalendarDays } from 'lucide-react'

interface InboxTabContainerProps {
  conversationId?: string
  onConversationClick: (conversationId: string) => void
  defaultTab?: 'chat' | 'announcements' | 'meetings'
}

export function InboxTabContainer({
  conversationId,
  onConversationClick,
  defaultTab = 'chat',
}: InboxTabContainerProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <Tabs defaultValue={defaultTab} className="flex h-full flex-col gap-0">
        {/* Tabs Header */}
        <div className="flex-shrink-0 border-b border-stone-200 bg-white px-6 pt-4 pb-4">
          <TabsList className="h-10">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="size-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="size-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="meetings" className="gap-2">
              <CalendarDays className="size-4" />
              Meetings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tabs Content */}
        <TabsContent value="chat" className="m-0 flex-1 min-h-0">
          <InboxContent conversationId={conversationId} onConversationClick={onConversationClick} />
        </TabsContent>

        <TabsContent value="announcements" className="m-0 flex-1 min-h-0">
          <AnnouncementsTabContent />
        </TabsContent>

        <TabsContent value="meetings" className="m-0 flex-1 min-h-0">
          <MeetingsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}
