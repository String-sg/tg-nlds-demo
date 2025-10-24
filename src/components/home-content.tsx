'use client'

import { useState, useEffect } from 'react'
import {
  Edit2,
  Sparkle,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Compass,
  Zap,
  Play,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  UserCheck,
  CheckSquare,
  ClipboardList,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getStudentAlerts, type StudentAlert } from '@/lib/supabase/queries'
import { useUser } from '@/contexts/user-context'

const actionButtons = [
  {
    key: 'attendance',
    label: 'Daily Attendance',
    icon: UserCheck,
    bgColor: 'bg-blue-500',
    iconColor: 'text-white'
  },
  {
    key: 'marking',
    label: 'Marking',
    icon: CheckSquare,
    bgColor: 'bg-purple-500',
    iconColor: 'text-white'
  },
  {
    key: 'lesson-planning',
    label: 'Lesson Planning',
    icon: BookOpen,
    bgColor: 'bg-orange-500',
    iconColor: 'text-white'
  },
  {
    key: 'record-results',
    label: 'Record Results',
    icon: ClipboardList,
    bgColor: 'bg-green-500',
    iconColor: 'text-white'
  },
  {
    key: 'explore',
    label: 'Explore',
    icon: Compass,
    bgColor: 'bg-cyan-500',
    iconColor: 'text-white'
  },
]

// Mock data for teacher widgets
const podcastData = {
  title: 'Daily Teacher Brief',
  date: 'Oct 9',
  duration: '4 min',
  description: 'Student performance insights, upcoming parent meetings, and classroom updates',
  imageUrl: '/podcast-cover.jpg', // placeholder
}

const getTodayDate = () => {
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  return today.toLocaleDateString('en-US', options)
}

const upcomingClassesData = [
  { time: '11:15 AM', subject: 'Math 10B', room: 'Room 204' },
  { time: '1:00 PM', subject: 'Math 9A', room: 'Room 201' },
]

// Fallback data for when no alerts are found
const fallbackStudentAlertsData = [
  {
    student_id: '',
    student_name: 'No alerts',
    initials: 'NA',
    message: 'All students doing well',
    priority: 'info' as const,
    alert_type: 'performance' as const,
    class_id: null,
    class_name: null,
  },
]

interface HomeContentProps {
  onNavigateToClassroom?: () => void
  onNavigateToExplore?: () => void
  onNavigateToAttendance?: () => void
  onNavigateToLearn?: () => void
  onNavigateToInbox?: () => void
  onAssistantMessage?: (message: string) => void
  onStudentClick?: (studentName: string) => void
  onStudentClickWithClass?: (classId: string, studentName: string) => void
  onNavigateToPulse?: () => void
  onEditWidgets?: () => void
  renderPageActions?: () => React.ReactNode
}

export function HomeContent({ onNavigateToClassroom, onNavigateToExplore, onNavigateToAttendance, onNavigateToLearn, onNavigateToInbox, onAssistantMessage, onStudentClick, onStudentClickWithClass, onNavigateToPulse, onEditWidgets, renderPageActions }: HomeContentProps = {}) {
  const [assistantInput, setAssistantInput] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [gridRowHeight] = useState(156)
  const [widgetPadding] = useState(16)
  const [studentAlerts, setStudentAlerts] = useState<StudentAlert[] | null>(null)
  const { user, loading: userLoading } = useUser()

  // Extract stable dependency values
  const userId = user?.user_id ?? null
  const isUserLoading = userLoading ?? false

  // Fetch student alerts on mount
  useEffect(() => {
    let isMounted = true

    async function fetchStudentAlerts() {
      // Wait for user context to finish loading before proceeding
      if (isUserLoading) {
        return
      }

      if (!userId) {
        if (isMounted) {
          setStudentAlerts(fallbackStudentAlertsData)
        }
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await getStudentAlerts(supabase, userId, 3)

        if (!isMounted) return

        if (error) {
          console.error('Error fetching student alerts:', error)
          setStudentAlerts(fallbackStudentAlertsData)
        } else if (data && data.length > 0) {
          setStudentAlerts(data)
        } else {
          // No alerts found, use fallback
          setStudentAlerts(fallbackStudentAlertsData)
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Error fetching student alerts:', error)
        setStudentAlerts(fallbackStudentAlertsData)
      }
    }

    fetchStudentAlerts()

    return () => {
      isMounted = false
    }
  }, [userId, isUserLoading])

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (assistantInput.trim() && onAssistantMessage) {
      onAssistantMessage(assistantInput.trim())
      setAssistantInput('')
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-white to-[#F5E3DF]">
      {/* Top section with widgets - scrollable */}
      <ScrollArea className="flex-1 pb-48">
        <div className="mx-auto w-full max-w-5xl px-6 py-6">
          {/* Teacher Widgets Section */}
          <div
            className="grid grid-cols-1 gap-3 sm:gap-3 md:grid-cols-2"
            style={{
              gridTemplateRows: `minmax(${gridRowHeight}px, auto) minmax(${gridRowHeight}px, auto)`
            }}
          >
            {/* Podcast Widget - Large, spans 1 column on larger screens */}
            <Card className="flex h-full min-h-full flex-col rounded-2xl border-stone-200 bg-white shadow-sm md:row-span-2 py-0">
              <CardContent className="flex h-full flex-col p-0" style={{ padding: `${widgetPadding}px` }}>
                {/* Podcast Image with Waveform Overlay */}
                <div className="relative h-32 overflow-hidden rounded-xl bg-stone-100">
                  {/* Placeholder for podcast image */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                    <div className="flex items-center gap-0.5">
                      {/* Audio waveform visual */}
                      {[19.6, 26.0, 20.8, 33.5, 29.1, 29.3, 30.7, 19.3, 19.2, 34.2, 26.4, 30.1, 25.6, 13.9, 33.3].map((height, i) => (
                        <div
                          key={i}
                          className="w-0.5 rounded-full bg-stone-600/70"
                          style={{
                            height: `${height}px`,
                            animation: `pulse ${[2.8, 1.2, 2.7, 2.4, 1.1, 1.4, 2.4, 2.3, 2.8, 1.8, 1.6, 2.5, 2.8, 2.7, 2.2][i]}s ease-in-out infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Podcast Info */}
                <div className="mt-3 space-y-1">
                  <h3 className="text-base font-semibold text-stone-900 sm:text-lg">{podcastData.title}</h3>
                  <p className="text-xs text-stone-500">
                    {podcastData.date} • {podcastData.duration}
                  </p>
                  <p className="text-sm text-stone-600 line-clamp-1">{podcastData.description}</p>
                </div>

                {/* Play Button - pushed to bottom */}
                <Button className="mt-auto h-9 w-full rounded-lg bg-stone-900 text-sm text-white hover:bg-stone-800">
                  <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                  Play now
                </Button>
              </CardContent>
            </Card>

            {/* Calendar & Upcoming Classes Widget */}
            <Card className="flex h-full min-h-full flex-col rounded-2xl border-stone-200 bg-white shadow-sm py-0">
              <button
                onClick={() => window.location.href = '/calendar'}
                className="flex h-full w-full cursor-pointer items-start gap-4 text-left transition-opacity hover:opacity-80"
                style={{ padding: `${widgetPadding}px` }}
              >
                {/* Left: Day Display */}
                <div className="flex flex-1 flex-col">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
                  </p>
                  <p className="text-5xl font-bold text-stone-900">
                    {new Date().getDate()}
                  </p>
                  <p className="mt-4 text-xs text-stone-400">No events today</p>
                </div>

                {/* Right: Upcoming Classes */}
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">TOMORROW</p>
                  {upcomingClassesData.map((classItem, index) => (
                    <div key={index} className="bg-red-50 p-2 border-l-2 border-red-500">
                      <p className="text-xs font-semibold text-stone-900">{classItem.subject}</p>
                      <p className="text-[10px] text-red-600">{classItem.time}</p>
                    </div>
                  ))}
                </div>
              </button>
            </Card>

            {/* Student Alert Widget */}
            <Card
              className={cn(
                "flex h-full min-h-full flex-col rounded-2xl border-stone-200 bg-white shadow-sm py-0",
                studentAlerts && studentAlerts.length > 0 && studentAlerts[0].student_name !== 'No alerts' && "cursor-pointer transition-all hover:shadow-md hover:border-stone-300"
              )}
              onClick={() => {
                if (studentAlerts && studentAlerts.length > 0 && studentAlerts[0].student_name !== 'No alerts') {
                  const firstAlert = studentAlerts[0]
                  if (onStudentClickWithClass && firstAlert.class_id) {
                    onStudentClickWithClass(firstAlert.class_id, firstAlert.student_name)
                  } else if (onStudentClick) {
                    onStudentClick(firstAlert.student_name)
                  }
                }
              }}
            >
              <CardContent className="flex flex-col gap-3 items-start p-0" style={{ padding: `${widgetPadding}px` }}>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">STUDENT ALERTS</p>
                </div>

                {/* AI Summary */}
                <div className="flex w-full flex-col gap-3">
                  {!studentAlerts ? (
                    // Loading state - skeleton matching actual content structure
                    <div className="space-y-2.5">
                      <div className="rounded-lg bg-stone-100/80 p-3 space-y-2">
                        {/* Student name and badge skeleton */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1.5">
                            <div className="h-5 w-32 animate-pulse rounded bg-stone-200" />
                            <div className="h-3 w-20 animate-pulse rounded bg-stone-200" />
                          </div>
                          <div className="h-5 w-24 animate-pulse rounded-full bg-stone-200" />
                        </div>
                        {/* Message skeleton */}
                        <div className="space-y-1.5">
                          <div className="h-3 w-full animate-pulse rounded bg-stone-200" />
                          <div className="h-3 w-11/12 animate-pulse rounded bg-stone-200" />
                          <div className="h-3 w-4/5 animate-pulse rounded bg-stone-200" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Single Student Alert with Detailed Context */}
                      {studentAlerts.length > 0 && studentAlerts[0].student_name !== 'No alerts' ? (
                        <div className="space-y-2.5">
                          {/* Student Card */}
                          <div className="rounded-lg bg-stone-100/80 p-3 space-y-2">
                            {/* Student Name & Class */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-base font-semibold text-stone-900">
                                  {studentAlerts[0].student_name}
                                </p>
                                {studentAlerts[0].class_name && (
                                  <p className="text-xs font-medium text-stone-500">
                                    Class {studentAlerts[0].class_name}
                                  </p>
                                )}
                              </div>
                              {studentAlerts[0].priority === 'high' && (
                                <div className="rounded-full bg-red-100 px-2 py-0.5">
                                  <span className="text-xs font-medium text-red-700">High Priority</span>
                                </div>
                              )}
                            </div>

                            {/* Alert Message */}
                            <p className="text-sm leading-relaxed text-stone-700">
                              {studentAlerts[0].message}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 rounded-lg bg-green-100/60 p-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                              <AlertCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <p className="text-sm text-stone-700">
                              No student alerts at this time. All cases are up to date.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Fixed Bottom section with Assistant and Icon Dock - floats at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-auto w-full max-w-5xl px-6 py-6">
            <div className="relative">
              {/* Glow effect backdrop */}
              <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-b from-white/20 to-[#f5e3df]/20 blur-xl" />

              {/* Combined Assistant and Dock Layout - stacked vertically */}
              <div className="flex flex-col gap-4">
                {/* Assistant Input - Expandable container */}
                <form onSubmit={handleAssistantSubmit}>
                  <div className="relative">
                    {/* Outer expandable container - only visible when focused */}
                    {isInputFocused && (
                      <div className="absolute -inset-2 rounded-2xl border border-stone-200/80 bg-stone-100 shadow-lg backdrop-blur-sm transition-all" />
                    )}

                    {/* Content wrapper */}
                    <div className="relative">
                      {/* Quick action suggestions - positioned above input when focused */}
                      {isInputFocused && (
                        <div className="relative z-10 mb-2 flex flex-wrap items-center gap-2 text-xs text-stone-600">
                          <span className="hidden sm:inline">Try asking:</span>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              onAssistantMessage?.('Find student with needs')
                            }}
                            className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-medium text-stone-800 transition-colors hover:bg-stone-100"
                          >
                            &quot;Find student with needs&quot;
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              onAssistantMessage?.('Draft a parent email')
                            }}
                            className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-medium text-stone-800 transition-colors hover:bg-stone-100"
                          >
                            &quot;Draft a parent email&quot;
                          </button>
                        </div>
                      )}

                      {/* Input field - stays in same position */}
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 z-10 -translate-y-1/2">
                          <Sparkle className="size-5 text-stone-600" />
                        </div>
                         <Input
                           type="text"
                           value={assistantInput}
                           onChange={(e) => setAssistantInput(e.target.value)}
                           onFocus={() => setIsInputFocused(true)}
                           onBlur={() => setIsInputFocused(false)}
                           placeholder="Ask me about students, assignments, or lesson plans..."
                           className={cn(
                             'shimmer-input relative h-14 bg-white pl-14 pr-6 text-sm transition-all placeholder:text-stone-400 sm:h-16 sm:text-base',
                             'focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none',
                             isInputFocused
                               ? 'rounded-xl border-stone-300 focus-visible:border-stone-300'
                               : 'rounded-2xl border-stone-200 focus-visible:border-stone-300'
                           )}
                         />
                      </div>
                    </div>
                  </div>
                </form>

                {/* Icon Dock - Card style */}
                <div className="flex w-full items-center justify-center gap-3">
                  {actionButtons.map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.key}
                        onClick={() => {
                          if (action.key === 'attendance') {
                            onNavigateToAttendance?.()
                          } else if (action.key === 'marking') {
                            onNavigateToClassroom?.()
                          } else if (action.key === 'lesson-planning') {
                            onNavigateToInbox?.()
                          } else if (action.key === 'record-results') {
                            onNavigateToClassroom?.()
                          } else if (action.key === 'explore') {
                            onNavigateToExplore?.()
                          }
                        }}
                        className="group relative flex flex-1 flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                      >
                        {/* Icon Circle */}
                        <div className={cn(
                          "relative flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition-all group-hover:shadow-md",
                          action.bgColor
                        )}>
                          <Icon className={cn(
                            "size-6 transition-transform group-hover:scale-110",
                            action.iconColor
                          )} />
                        </div>

                        {/* Label */}
                        <span className="text-sm font-medium text-stone-900 transition-colors">
                          {action.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

