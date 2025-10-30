'use client'

import { useState } from 'react'
import { Bell, BellDot, AlertTriangle, MessageSquare, Clock, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notification'

interface NotificationBellProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onNotificationClick?: (notification: Notification) => void
  className?: string
  compact?: boolean
}

export function NotificationBell({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  className,
  compact = false,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-amber-600'
      case 'low':
        return 'text-stone-600'
      default:
        return 'text-stone-600'
    }
  }

  const getTypeIcon = (type: Notification['type']) => {
    const iconClass = 'size-5 shrink-0'
    switch (type) {
      case 'alert':
        return <AlertTriangle className={cn(iconClass, 'text-red-500')} />
      case 'message':
        return <MessageSquare className={cn(iconClass, 'text-blue-500')} />
      case 'reminder':
        return <Clock className={cn(iconClass, 'text-amber-500')} />
      case 'announcement':
        return <Megaphone className={cn(iconClass, 'text-purple-500')} />
      default:
        return <Bell className={cn(iconClass, 'text-stone-500')} />
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    if (onNotificationClick) {
      onNotificationClick(notification)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          tooltip="Notifications"
          className={cn(
            compact
              ? 'w-8 px-0 justify-center'
              : 'w-full justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center',
            className
          )}
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <BellDot className="size-4 text-red-500" />
          ) : (
            <Bell className="size-4" />
          )}
          {!compact && <span className="group-data-[collapsible=icon]:hidden">Notifications</span>}
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent align="start" side="right" className="w-80 p-0">
        <div className="flex flex-col h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 flex-shrink-0">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="h-auto p-1 text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notification List */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="size-12 text-stone-400 mb-3" />
              <h4 className="text-sm font-semibold text-stone-900 mb-1">
                No notifications
              </h4>
              <p className="text-xs text-stone-600">
                You&apos;re all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0">
              <div className="divide-y">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'w-full px-4 py-3 text-left transition-colors hover:bg-muted',
                      !notification.read && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={cn(
                              'text-sm truncate',
                              !notification.read
                                ? 'font-semibold text-stone-900'
                                : 'font-medium text-stone-700'
                            )}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="flex size-2 shrink-0 rounded-full bg-blue-500 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-stone-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.relatedStudent && (
                            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              {notification.relatedStudent.class}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-8"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
