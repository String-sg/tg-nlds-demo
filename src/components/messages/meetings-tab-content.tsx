'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { mockMeetings, getUpcomingMeetings, getPastMeetings } from '@/lib/mock-data/meetings-data'
import type { Meeting, MeetingStatus } from '@/types/meetings'

export function MeetingsTabContent() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<'all' | MeetingStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const upcomingMeetings = getUpcomingMeetings()
  const pastMeetings = getPastMeetings()

  // Filter meetings
  let filteredMeetings = mockMeetings
  if (statusFilter !== 'all') {
    filteredMeetings = filteredMeetings.filter((m) => m.status === statusFilter)
  }

  // Sort by date
  filteredMeetings.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'completed':
        return 'bg-stone-100 text-stone-700 border-stone-300'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handlePreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days: (number | null)[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const getMeetingsForDate = (day: number) => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    return mockMeetings.filter((meeting) => meeting.date === dateString)
  }

  const days = getDaysInMonth(selectedMonth)
  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex h-full w-full flex-col bg-stone-50">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Meetings</h2>
            <p className="text-sm text-stone-600">
              {upcomingMeetings.length} upcoming • {pastMeetings.length} past
            </p>
          </div>

          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-6">
          {/* Calendar Card */}
          <Card className="border-stone-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{monthName}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-stone-500">
                    {day}
                  </div>
                ))}

                {/* Days */}
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} />
                  }

                  const meetingsForDay = getMeetingsForDate(day)
                  const today = new Date()
                  const isToday =
                    day === today.getDate() &&
                    selectedMonth.getMonth() === today.getMonth() &&
                    selectedMonth.getFullYear() === today.getFullYear()

                  return (
                    <div
                      key={day}
                      className={cn(
                        'relative min-h-[40px] rounded-md border border-stone-200 p-2 text-center text-sm transition-colors hover:bg-stone-50',
                        isToday && 'border-blue-500 bg-blue-50'
                      )}
                    >
                      <div className={cn('font-medium', isToday && 'text-blue-600')}>{day}</div>
                      {meetingsForDay.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                          {meetingsForDay.slice(0, 3).map((meeting) => (
                            <div
                              key={meeting.id}
                              className={cn(
                                'size-1.5 rounded-full',
                                meeting.status === 'scheduled' && 'bg-green-600',
                                meeting.status === 'completed' && 'bg-stone-400',
                                meeting.status === 'cancelled' && 'bg-red-600'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filter */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-900">All Meetings</h3>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'all' | MeetingStatus)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meetings List */}
          <div className="space-y-3">
            {filteredMeetings.length === 0 ? (
              <Card className="border-stone-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="mb-3 size-12 text-stone-400" />
                  <h3 className="mb-2 text-lg font-semibold text-stone-900">No meetings found</h3>
                  <p className="max-w-sm text-center text-sm text-stone-600">
                    {statusFilter !== 'all'
                      ? 'Try adjusting your filter'
                      : 'There are no meetings scheduled at the moment'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredMeetings.map((meeting) => {
                const isExpanded = expandedId === meeting.id
                const isUpcoming = upcomingMeetings.some((m) => m.id === meeting.id)

                return (
                  <Card
                    key={meeting.id}
                    className={cn(
                      'cursor-pointer border-stone-200 transition-all hover:shadow-md',
                      isUpcoming && 'bg-green-50/20'
                    )}
                    onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Title and Status */}
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-stone-900">{meeting.title}</h3>
                            <Badge variant="outline" className={cn('capitalize', getStatusColor(meeting.status))}>
                              {meeting.status}
                            </Badge>
                          </div>

                          {/* Date and Time */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="size-4" />
                              <span>{formatDate(meeting.date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="size-4" />
                              <span>
                                {formatTime(meeting.time)} ({meeting.duration} min)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {meeting.location === 'Virtual' ? (
                                <>
                                  <Video className="size-4" />
                                  <span>Virtual</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="size-4" />
                                  <span>In-Person</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Parent and Student */}
                          <div className="flex items-center gap-1.5 text-sm text-stone-700">
                            <User className="size-4" />
                            <span>
                              {meeting.parentName} ({meeting.studentName} - {meeting.studentClass})
                            </span>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="space-y-3 border-t border-stone-200 pt-3">
                              {/* Meeting Link */}
                              {meeting.meetingLink && (
                                <div>
                                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-500">
                                    Meeting Link
                                  </p>
                                  <a
                                    href={meeting.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {meeting.meetingLink}
                                  </a>
                                </div>
                              )}

                              {/* Agenda */}
                              {meeting.agenda && meeting.agenda.length > 0 && (
                                <div>
                                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                                    Agenda
                                  </p>
                                  <ul className="list-inside list-disc space-y-1 text-sm text-stone-700">
                                    {meeting.agenda.map((item, index) => (
                                      <li key={index}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Notes */}
                              {meeting.notes && (
                                <div>
                                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-500">
                                    Notes
                                  </p>
                                  <p className="text-sm leading-relaxed text-stone-700">{meeting.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })
            )}
          </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
