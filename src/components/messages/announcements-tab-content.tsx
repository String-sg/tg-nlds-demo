'use client'

import { useState } from 'react'
import { Search, Megaphone, AlertCircle, Info, FileText, Paperclip, BookOpen, FileCheck, PartyPopper, Siren, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { mockAnnouncements } from '@/lib/mock-data/announcements-data'
import type { Announcement, AnnouncementPriority, AnnouncementCategory } from '@/types/announcements'

export function AnnouncementsTabContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | AnnouncementPriority>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | AnnouncementCategory>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filter announcements
  let filteredAnnouncements = mockAnnouncements

  if (priorityFilter !== 'all') {
    filteredAnnouncements = filteredAnnouncements.filter((a) => a.priority === priorityFilter)
  }

  if (categoryFilter !== 'all') {
    filteredAnnouncements = filteredAnnouncements.filter((a) => a.category === categoryFilter)
  }

  if (searchQuery) {
    filteredAnnouncements = filteredAnnouncements.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const unreadCount = filteredAnnouncements.filter((a) => !a.read).length

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300'
    }
  }

  const getCategoryIcon = (category: AnnouncementCategory) => {
    switch (category) {
      case 'academic':
        return <BookOpen className="size-5 text-blue-600" />
      case 'administrative':
        return <FileCheck className="size-5 text-stone-600" />
      case 'event':
        return <PartyPopper className="size-5 text-purple-600" />
      case 'emergency':
        return <Siren className="size-5 text-red-600" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-stone-50">
      {/* Header with Search and Filters */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-6 py-4">
        <div className="space-y-4">
          {/* Title and Count */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Announcements</h2>
              <p className="text-sm text-stone-600">
                {filteredAnnouncements.length} total • {unreadCount} unread
              </p>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              Create Announcement
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as 'all' | AnnouncementPriority)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as 'all' | AnnouncementCategory)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 p-6">
          {filteredAnnouncements.length === 0 ? (
            <Card className="border-stone-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="mb-3 size-12 text-stone-400" />
                <h3 className="mb-2 text-lg font-semibold text-stone-900">No announcements found</h3>
                <p className="max-w-sm text-center text-sm text-stone-600">
                  {searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'There are no announcements at the moment'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAnnouncements.map((announcement) => {
              const isExpanded = expandedId === announcement.id

              return (
                <Card
                  key={announcement.id}
                  className={cn(
                    'cursor-pointer border-stone-200 transition-all hover:shadow-md',
                    !announcement.read && 'bg-blue-50/30'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-1 items-start gap-3">
                        {/* Category Icon */}
                        <div className="mt-0.5">{getCategoryIcon(announcement.category)}</div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2">
                            <h3 className="flex-1 font-semibold text-stone-900">{announcement.title}</h3>
                            {!announcement.read && (
                              <div className="mt-1 size-2 flex-shrink-0 rounded-full bg-blue-600" />
                            )}
                          </div>

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
                            <span>{announcement.author}</span>
                            <span>•</span>
                            <span>{formatDate(announcement.date)}</span>
                          </div>

                          {/* Preview or full content */}
                          <p
                            className={cn(
                              'text-sm leading-relaxed text-stone-700',
                              !isExpanded && 'line-clamp-2'
                            )}
                          >
                            {announcement.content}
                          </p>

                          {/* Attachments */}
                          {announcement.attachments && announcement.attachments.length > 0 && isExpanded && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                                Attachments
                              </p>
                              {announcement.attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2"
                                >
                                  <Paperclip className="size-4 text-stone-400" />
                                  <span className="text-sm text-stone-700">{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <Badge variant="outline" className={cn('capitalize', getPriorityColor(announcement.priority))}>
                        {announcement.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              )
            })
          )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
