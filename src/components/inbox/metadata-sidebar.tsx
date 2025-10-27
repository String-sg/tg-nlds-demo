'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  User,
  Clock,
  FileText,
  AlertTriangle,
  ExternalLink,
  MessageSquare
} from 'lucide-react'
import { getInitials, getAvatarColor } from '@/lib/chat/utils'
import { useUser } from '@/contexts/user-context'
import { useClasses } from '@/hooks/queries/use-classes-query'
import { MetadataSidebarSkeleton } from './metadata-sidebar-skeleton'
import type { ConversationGroup } from '@/types/inbox'

interface MetadataSidebarProps {
  conversationId: string
  conversationGroups: ConversationGroup[]
  isLoading?: boolean
}

export function MetadataSidebar({ conversationId, conversationGroups, isLoading = false }: MetadataSidebarProps) {
  const { user } = useUser()
  const { formClass } = useClasses(user?.user_id || '')

  // Show skeleton while loading
  if (isLoading) {
    return <MetadataSidebarSkeleton />
  }

  // Find the conversation and its group
  let conversationGroup: ConversationGroup | undefined
  let currentThread

  for (const group of conversationGroups) {
    const thread = group.threads.find((t) => t.id === conversationId)
    if (thread) {
      conversationGroup = group
      currentThread = thread
      break
    }
  }

  if (!conversationGroup || !currentThread) {
    return null
  }

  const { student } = conversationGroup
  const parentParticipant = currentThread.participants.find((p) => p.role === 'parent')

  return (
    <ScrollArea className="h-full min-h-0">
      {/* Student Info Card */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={getAvatarColor(student.name)}>
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-stone-900 mb-0.5">
              {student.name}
            </h3>
            <p className="text-xs text-stone-600 mb-1">
              {student.class_name || student.class}
            </p>
            <Badge variant="outline" className="h-5 text-xs">
              Student
            </Badge>
          </div>
        </div>

        {/* Student Alerts */}
        {student.alerts.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Active Alerts</span>
            </div>
            {student.alerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-lg p-2 text-xs ${
                  alert.severity === 'high'
                    ? 'bg-red-50 text-red-900'
                    : alert.severity === 'medium'
                    ? 'bg-amber-50 text-amber-900'
                    : 'bg-blue-50 text-blue-900'
                }`}
              >
                <div className="font-medium mb-0.5">{alert.type}</div>
                <div className="text-xs opacity-80">{alert.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parent Contact Info */}
      {parentParticipant && (
        <div className="flex-shrink-0 border-b border-stone-200 bg-white p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-3">
            <User className="h-3.5 w-3.5" />
            <span>Parent/Guardian</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={getAvatarColor(parentParticipant.name)}>
                  {getInitials(parentParticipant.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-stone-900">
                  {parentParticipant.name}
                </div>
                <div className="text-xs text-stone-600">
                  Parent
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Metadata */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-3">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Conversation Details</span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-start justify-between text-xs">
            <span className="text-stone-600">Status</span>
            <Badge
              variant={
                conversationGroup.priority === 'urgent'
                  ? 'destructive'
                  : conversationGroup.priority === 'resolved'
                  ? 'secondary'
                  : 'outline'
              }
              className="h-5 text-xs"
            >
              {conversationGroup.priority}
            </Badge>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-stone-600">Started</span>
            <span className="text-stone-900">
              {currentThread.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-stone-600">Last Activity</span>
            <span className="text-stone-900">
              {conversationGroup.lastActivityAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-start justify-between text-xs">
            <span className="text-stone-600">Messages</span>
            <span className="text-stone-900">{currentThread.messages.length}</span>
          </div>
          {conversationGroup.unreadCount > 0 && (
            <div className="flex items-start justify-between text-xs">
              <span className="text-stone-600">Unread</span>
              <Badge className="h-5 rounded-full bg-stone-900 text-xs">
                {conversationGroup.unreadCount}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-3">
          <FileText className="h-3.5 w-3.5" />
          <span>Quick Actions</span>
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-8 text-xs"
            onClick={() => {
              // Navigate to classroom student profile
              // Use real class_id if available, otherwise use class name as slug
              const classId = student.class_id || student.class.toLowerCase().replace(/\s+/g, '-')
              // Convert student name to slug
              const studentSlug = student.name.toLowerCase().replace(/\s+/g, '-')
              window.location.href = `/classroom/${classId}/student/${studentSlug}`
            }}
          >
            <User className="h-3.5 w-3.5 mr-2" />
            View Student Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-8 text-xs"
            onClick={() => {
              // Navigate to form teacher class overview
              if (formClass) {
                window.location.href = `/classroom/${formClass.class_id}`
              }
            }}
            disabled={!formClass}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-2" />
            View Class
          </Button>
        </div>
      </div>

      {/* Related Conversations */}
      {conversationGroup.threads.length > 1 && (
        <div className="flex-1 bg-stone-50 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-3">
            <Clock className="h-3.5 w-3.5" />
            <span>Related Conversations</span>
          </div>
          <div className="space-y-2">
            {conversationGroup.threads
              .filter((t) => t.id !== conversationId)
              .slice(0, 3)
              .map((thread) => {
                const lastMessage = thread.messages[thread.messages.length - 1]
                return (
                  <div
                    key={thread.id}
                    className="rounded-lg bg-white p-2.5 border border-stone-200 cursor-pointer hover:border-stone-300 transition-colors"
                    onClick={() => {
                      window.location.href = `/inbox/${thread.id}`
                    }}
                  >
                    <div className="text-xs font-medium text-stone-900 mb-1 truncate">
                      {thread.metadata.subject || 'No subject'}
                    </div>
                    <div className="text-xs text-stone-600 mb-1.5 line-clamp-2">
                      {lastMessage.content}
                    </div>
                    <div className="text-xs text-stone-500">
                      {lastMessage.sentAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </ScrollArea>
  )
}
