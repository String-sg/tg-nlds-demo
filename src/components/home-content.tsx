'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Edit2,
  Sparkle,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Megaphone,
  Zap,
  Play,
  Pause,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  UserCheck,
  CheckSquare,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { fetchStudentAlerts } from '@/lib/queries/student-queries'
import type { StudentAlert } from '@/lib/supabase/queries'
import { useUser } from '@/contexts/user-context'
import { comingSoonToast } from '@/lib/coming-soon-toast'

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
    key: 'announcements',
    label: 'Create Announcement',
    icon: Megaphone,
    bgColor: 'bg-purple-500',
    iconColor: 'text-white'
  },
]

// Mock data for teacher widgets
const podcastData = {
  title: "Strategies to Develop Emotion Regulation in Secondary School Students",
  date: 'Oct 24',
  duration: '8 min',
  description: "Through these MLUs, educators can gain an understanding of emotions, emotion regulation and its benefits.",
  imageUrl: '/images/podcast-thumb-student-dev.png',
  audioUrl: '/audio/ElevenLabs_Draft_SEED_Emotional_Regulation.mp3',
}

const getTodayDate = () => {
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  return today.toLocaleDateString('en-US', options)
}

const upcomingClassesData = [
  { time: '11:15 AM', subject: 'Math 10B', room: 'Room 204' },
  { time: '1:00 PM', subject: 'Assessment Literacy for H1 Economics @ AST', room: 'AST' },
]

// Fallback data for when no alerts are found
const fallbackStudentAlertsData = [
  {
    student_id: 'demo-student-1',
    student_name: 'Tan Ah Kow',
    initials: 'TAK',
    message: 'missed 20 days of school this term.\nRecommended learning: Strategies for managing long term absenteeism',
    priority: 'medium' as const,
    alert_type: 'attendance' as const,
    class_id: '4A',
    class_name: '4A',
    recommendedLink: 'https://www.notion.so/moediva/Managing-Long-Term-Absenteeism-1d9970a387f2801db143f6ee7b49ad59?source=copy_link'
  },
]

interface HomeContentProps {
  onNavigateToClassroom?: () => void
  onNavigateToExplore?: () => void
  onNavigateToAttendance?: () => void
  onNavigateToRecordResults?: () => void
  onNavigateToLearn?: () => void
  onNavigateToInbox?: () => void
  onNavigateToAnnouncements?: () => void
  onNavigateToTeachingMarking?: () => void
  onNavigateToTeachingLessonPlanning?: () => void
  onAssistantMessage?: (message: string) => void
  onStudentClick?: (studentName: string) => void
  onStudentClickWithClass?: (classId: string, studentName: string) => void
  onNavigateToDailyRoundup?: () => void
  onEditWidgets?: () => void
  renderPageActions?: () => React.ReactNode
}

export function HomeContent({ onNavigateToClassroom, onNavigateToExplore, onNavigateToAttendance, onNavigateToRecordResults, onNavigateToLearn, onNavigateToInbox, onNavigateToAnnouncements, onNavigateToTeachingMarking, onNavigateToTeachingLessonPlanning, onAssistantMessage, onStudentClick, onStudentClickWithClass, onNavigateToDailyRoundup, onEditWidgets, renderPageActions }: HomeContentProps = {}) {
  const [assistantInput, setAssistantInput] = useState('')
  const [gridRowHeight] = useState(156)
  const [widgetPadding] = useState(16)
  const [studentAlerts, setStudentAlerts] = useState<StudentAlert[] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { user, loading: userLoading } = useUser()

  // Extract stable dependency values
  const userId = user?.user_id ?? null
  const isUserLoading = userLoading ?? false

  // Fetch student alerts on mount
  useEffect(() => {
    let isMounted = true

    async function loadStudentAlerts() {
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
        // Use API route with service role client to bypass RLS
        const data = await fetchStudentAlerts(userId, 3)

        if (!isMounted) return

        if (data && data.length > 0) {
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

    loadStudentAlerts()

    return () => {
      isMounted = false
    }
  }, [userId, isUserLoading])

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(podcastData.audioUrl)
      audioRef.current.addEventListener('ended', () => setIsPlaying(false))
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current?.removeAttribute('src')
      audioRef.current = null
    }
  }, [])

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (assistantInput.trim() && onAssistantMessage) {
      onAssistantMessage(assistantInput.trim())
      setAssistantInput('')
    }
  }

  return (
    <ScrollArea className="h-full w-full bg-gradient-to-b from-white to-[#F5E3DF]">
      <div className="mx-auto w-full max-w-5xl px-6 py-6 space-y-6">
          {/* Teacher Widgets Section */}
          <div
            className="grid grid-cols-1 gap-3 sm:gap-3 md:grid-cols-2"
            style={{
              gridTemplateRows: `minmax(${gridRowHeight}px, auto) minmax(${gridRowHeight}px, auto)`
            }}
          >
            {/* Calendar & Upcoming Classes Widget */}
            <Card className="rounded-2xl border-stone-200 bg-white shadow-sm py-0">
              <CardContent className="flex gap-4 items-start p-0" style={{ padding: `${widgetPadding}px` }}>
                {/* Left: Day Display */}
                <div className="flex flex-col flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
                  </p>
                  <p className="text-5xl font-bold text-stone-900">
                    {new Date().getDate()}
                  </p>
                  <p className="mt-4 text-xs text-stone-400">No events today</p>
                </div>

                {/* Right: Upcoming Classes */}
                <div className="flex-1 space-y-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500">TOMORROW</p>
                  {upcomingClassesData.map((classItem, index) => (
                    <div key={index} className="bg-red-50 p-2 border-l-2 border-red-500">
                      <p className="text-xs font-semibold text-stone-900">{classItem.subject}</p>
                      <p className="text-[10px] text-red-600">{classItem.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Podcast Widget - Large, spans 1 column on larger screens */}
            <Card className="flex h-full min-h-full flex-col rounded-2xl border-stone-200 bg-white shadow-sm md:row-span-2 py-0">
              <CardContent className="flex h-full flex-col p-0" style={{ padding: `${widgetPadding}px` }}>
                {/* Podcast Image */}
                <div
                  className="relative h-48 overflow-hidden rounded-xl py-4"
                  style={{ backgroundColor: '#86EFAC' }}
                >
                  <img
                    src={podcastData.imageUrl}
                    alt={podcastData.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Podcast Info */}
                <div className="mt-3 space-y-1">
                  <h3 className="text-base font-semibold text-stone-900 sm:text-lg">{podcastData.title}</h3>
                  <p className="text-sm text-stone-600 line-clamp-2">{podcastData.description}</p>
                </div>

                {/* Play Button - pushed to bottom */}
                <Button
                  className="mt-4 h-9 w-full rounded-lg bg-stone-900 text-sm text-white hover:bg-stone-800"
                  onClick={() => {
                    const audio = audioRef.current
                    if (!audio) return
                    if (isPlaying) {
                      audio.pause()
                      setIsPlaying(false)
                    } else {
                      audio.play()
                      setIsPlaying(true)
                    }
                  }}
                >
                  {isPlaying ? (
                    <Pause className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                  )}
                  {isPlaying ? 'Pause' : 'Play now'}
                </Button>
              </CardContent>
            </Card>

            {/* Student Alert Widget */}
            <Card
              className={cn(
                "flex h-full min-h-full flex-col rounded-2xl border-yellow-200 shadow-sm py-0",
                studentAlerts && studentAlerts.length > 0 && studentAlerts[0].student_name !== 'No alerts' && studentAlerts[0].priority === 'medium'
                  ? "bg-yellow-50"
                  : "bg-white border-stone-200"
              )}
            >
              <CardContent className="flex flex-col gap-3 items-start p-0 relative" style={{ padding: `${widgetPadding}px` }}>
                {/* Hazard Icon for warning alerts */}
                {studentAlerts && studentAlerts.length > 0 && studentAlerts[0].student_name !== 'No alerts' && studentAlerts[0].priority === 'medium' && (
                  <div className="absolute top-3 left-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                )}

                <div className={cn(
                  studentAlerts && studentAlerts.length > 0 && studentAlerts[0].student_name !== 'No alerts' && studentAlerts[0].priority === 'medium'
                    ? "ml-8" : ""
                )}>
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
                          <div className={cn(
                            "rounded-lg p-3 space-y-2",
                            studentAlerts[0].priority === 'medium'
                              ? "bg-yellow-100/60 border border-yellow-200"
                              : "bg-stone-100/80"
                          )}>
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
                            <div className="text-sm leading-relaxed text-stone-700">
                              {studentAlerts[0].message.split('\n').map((line, index) => (
                                <p key={index}>
                                  {line.includes('Recommended learning:') && (studentAlerts[0] as any).recommendedLink ? (
                                    <>
                                      Recommended learning: <a
                                        href={(studentAlerts[0] as any).recommendedLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline"
                                      >
                                        Strategies for long term absenteeism
                                      </a>
                                    </>
                                  ) : (
                                    line
                                  )}
                                </p>
                              ))}
                            </div>
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

          {/* Assistant and Action Buttons Section */}
          <div className="flex flex-col gap-4">
            {/* Assistant Input */}
            <form onSubmit={handleAssistantSubmit} className="flex flex-col gap-2">
              <div className="relative">
                <div className="absolute left-5 top-1/2 z-10 -translate-y-1/2">
                  <Sparkle className="size-5 text-stone-600" />
                </div>
                <Input
                  type="text"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask me about students, assignments, or lesson plans..."
                  className="shimmer-input h-14 bg-white pl-14 pr-6 text-sm placeholder:text-stone-400 sm:h-16 sm:text-base rounded-2xl"
                />
              </div>

              {/* Quick action suggestions - normal flow */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 px-2">
                <span className="hidden sm:inline">Try asking:</span>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onAssistantMessage?.('Find student with needs')
                  }}
                  className="rounded-md border border-stone-200 bg-white px-2.5 py-1.5 font-medium text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
                >
                  &quot;Find student with needs&quot;
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onAssistantMessage?.('Draft a parent email')
                  }}
                  className="rounded-md border border-stone-200 bg-white px-2.5 py-1.5 font-medium text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
                >
                  &quot;Draft a parent email&quot;
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex w-full items-stretch justify-center gap-3">
              {actionButtons.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.key}
                    onClick={() => {
                      if (action.key === 'attendance') {
                        onNavigateToAttendance?.()
                      } else if (action.key === 'marking') {
                        onNavigateToTeachingMarking?.()
                      } else if (action.key === 'lesson-planning') {
                        onNavigateToTeachingLessonPlanning?.()
                      } else if (action.key === 'record-results') {
                        onNavigateToRecordResults?.()
                      } else if (action.key === 'announcements') {
                        onNavigateToAnnouncements?.()
                      }
                    }}
                    className="group relative flex flex-1 flex-col items-center rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Icon Circle */}
                    <div className={cn(
                      "relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full shadow-sm transition-all group-hover:shadow-md",
                      action.bgColor
                    )}>
                      <Icon className={cn(
                        "size-6 transition-transform group-hover:scale-110",
                        action.iconColor
                      )} />
                    </div>

                    {/* Label - min height to accommodate 2 lines */}
                    <span className="mt-3 text-center text-sm font-medium leading-[1.3] text-stone-900 transition-colors min-h-[2.5rem] flex items-center justify-center">
                      {action.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
      </div>
    </ScrollArea>
  )
}

