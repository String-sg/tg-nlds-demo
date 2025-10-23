'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { inboxViews, classViews, priorityViews, statusViews } from '@/lib/mock-data/inbox-data'
import type { ViewType } from '@/types/inbox'

interface InboxSidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

export function InboxSidebar({ activeView, onViewChange }: InboxSidebarProps) {
  const [classesOpen, setClassesOpen] = useState(true)
  const [priorityOpen, setPriorityOpen] = useState(true)
  const [statusOpen, setStatusOpen] = useState(true)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-stone-200 px-3 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Messages</h2>
      </div>

      {/* Views List */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
        {/* Main views */}
        <div className="space-y-0.5">
          {inboxViews.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                activeView === view.id
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:bg-stone-100'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{view.icon}</span>
                <span className="font-medium">{view.name}</span>
              </div>
              {view.count > 0 && (
                <Badge
                  variant={activeView === view.id ? 'secondary' : 'outline'}
                  className="h-5 min-w-5 rounded-full text-xs"
                >
                  {view.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Classes Section */}
        <div className="mt-4">
          <button
            onClick={() => setClassesOpen(!classesOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 hover:bg-stone-50"
          >
            <span>Classes</span>
            {classesOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          {classesOpen && (
            <div className="mt-1 space-y-0.5">
              {classViews.map((view) => (
                <button
                  key={view.name}
                  onClick={() => onViewChange(view.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    activeView === view.name
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{view.icon}</span>
                    <span className="font-medium">{view.name}</span>
                  </div>
                  {view.count > 0 && (
                    <Badge
                      variant={activeView === view.name ? 'secondary' : 'outline'}
                      className="h-5 min-w-5 rounded-full text-xs"
                    >
                      {view.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Section */}
        <div className="mt-4">
          <button
            onClick={() => setPriorityOpen(!priorityOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 hover:bg-stone-50"
          >
            <span>Priority</span>
            {priorityOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          {priorityOpen && (
            <div className="mt-1 space-y-0.5">
              {priorityViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    activeView === view.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{view.icon}</span>
                    <span className="font-medium">{view.name}</span>
                  </div>
                  {view.count > 0 && (
                    <Badge
                      variant={activeView === view.id ? 'secondary' : 'outline'}
                      className="h-5 min-w-5 rounded-full text-xs"
                    >
                      {view.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Section */}
        <div className="mt-4">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 hover:bg-stone-50"
          >
            <span>Status</span>
            {statusOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          {statusOpen && (
            <div className="mt-1 space-y-0.5">
              {statusViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    activeView === view.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{view.icon}</span>
                    <span className="font-medium">{view.name}</span>
                  </div>
                  {view.count > 0 && (
                    <Badge
                      variant={activeView === view.id ? 'secondary' : 'outline'}
                      className="h-5 min-w-5 rounded-full text-xs"
                    >
                      {view.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
      </ScrollArea>
    </div>
  )
}
