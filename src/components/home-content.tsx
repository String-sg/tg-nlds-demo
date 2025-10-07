'use client'

import { useState } from 'react'
import {
  Edit2,
  Sparkles,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Compass,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const actionButtons = [
  { key: 'marking', label: 'Marking', icon: Edit2 },
  { key: 'analyse', label: 'Analyse', icon: Sparkles },
  { key: 'learn', label: 'Learn', icon: BookOpen },
  { key: 'communicate', label: 'Communicate', icon: MessageSquare },
  { key: 'explore', label: 'Explore', icon: Compass },
]

// Mock data for teacher widgets
const classScheduleData = {
  currentPeriod: 3,
  classes: [
    { period: 3, time: '10:30-11:15', subject: 'Math 10A', room: 'Room 204', isNow: true },
    { period: 4, time: '11:15-12:00', subject: 'Math 10B', room: 'Room 204', isNow: false },
    { period: 5, time: '1:00-1:45', subject: 'Math 9A', room: 'Room 201', isNow: false },
  ],
}

const attendanceData = {
  present: 142,
  total: 151,
  percentage: 94,
  absent: 9,
}

const homeworkData = {
  pendingReview: 23,
  dueSoon: 5,
  totalAssigned: 180,
  submitted: 140,
  submissionRate: 78,
}

const studentAlertsData = [
  { id: 1, student: 'Tan Wei Jie', initials: 'TW', message: '3 absences this week', priority: 'high' as const },
  { id: 2, student: 'Lim Kai Xuan', initials: 'LK', message: 'Missing 2 assignments', priority: 'medium' as const },
  { id: 3, student: 'Nur Aisyah', initials: 'NA', message: 'Excellent progress', priority: 'info' as const },
]

interface HomeContentProps {
  onNavigateToClassroom?: () => void
  onNavigateToExplore?: () => void
  onAssistantMessage?: (message: string) => void
  onStudentClick?: (studentName: string) => void
}

export function HomeContent({ onNavigateToClassroom, onNavigateToExplore, onAssistantMessage, onStudentClick }: HomeContentProps = {}) {
  const [assistantInput, setAssistantInput] = useState('')

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (assistantInput.trim() && onAssistantMessage) {
      onAssistantMessage(assistantInput.trim())
      setAssistantInput('')
    }
  }
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16 sm:space-y-8">
      {/* Assistant Input */}
      <form onSubmit={handleAssistantSubmit} className="flex flex-col gap-3 pt-4 sm:gap-4">
        <div className="relative w-full">
          <div className="absolute left-5 top-1/2 z-10 -translate-y-1/2">
            <Sparkles className="size-5 text-stone-600" />
          </div>
          <Input
            type="text"
            value={assistantInput}
            onChange={(e) => setAssistantInput(e.target.value)}
            placeholder="Ask me about students, assignments, or lesson plans..."
            className="shimmer-input relative h-14 rounded-lg border-stone-200 bg-white pl-14 pr-6 text-sm transition-all placeholder:text-stone-400 hover:shadow-md focus-visible:border-stone-300 focus-visible:shadow-md sm:h-16 sm:text-base"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
          <span className="hidden sm:inline">Try asking:</span>
          <button
            type="button"
            onClick={() => {
              onAssistantMessage?.('Find student with needs')
            }}
            className="rounded-md border-stone-200 bg-stone-50 px-2.5 py-1.5 font-medium text-stone-800 transition-colors hover:bg-stone-100"
          >
            &quot;Find student with needs&quot;
          </button>
          <button
            type="button"
            onClick={() => {
              onAssistantMessage?.('Draft a parent email')
            }}
            className="rounded-md border-stone-200 bg-stone-50 px-2.5 py-1.5 font-medium text-stone-800 transition-colors hover:bg-stone-100"
          >
            &quot;Draft a parent email&quot;
          </button>
        </div>
      </form>

      {/* Quick Actions - macOS Dock Style */}
      <div className="w-full">
        <div className="flex items-end justify-between rounded-2xl border border-stone-200/60 bg-white/80 px-20 py-2 backdrop-blur-sm sm:px-24 sm:py-3">
          {actionButtons.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.key}
                onClick={() => {
                  if (action.key === 'explore') {
                    onNavigateToExplore?.()
                  }
                }}
                className="group relative flex flex-col items-center justify-end gap-1 transition-all duration-200 ease-out hover:scale-150 hover:-translate-y-3 sm:gap-1.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-stone-200 shadow-sm transition-all group-hover:shadow-md sm:h-14 sm:w-14">
                  <Icon className="size-5 text-stone-600 sm:size-6" />
                </div>
                <span className="absolute -bottom-8 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Teacher Widgets Section */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {/* Class Schedule Widget */}
        <Card className="rounded-lg border-stone-200 bg-white shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {classScheduleData.classes.map((classItem) => (
              <div
                key={classItem.period}
                className={`space-y-1 ${classItem.isNow ? 'rounded-lg bg-stone-100 -mx-2 px-2 py-2' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-900">{classItem.subject}</span>
                  <span className="text-xs text-stone-600">{classItem.room}</span>
                </div>
                <p className="text-xs text-stone-600">{classItem.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Attendance Quick View Widget */}
        <Card className="rounded-lg border-stone-200 bg-white shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className={`text-4xl font-normal tracking-tight sm:text-5xl ${
                attendanceData.percentage >= 90
                  ? 'text-green-600'
                  : attendanceData.percentage >= 80
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {attendanceData.percentage}%
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-stone-900">
                {attendanceData.present} of {attendanceData.total} present
              </p>
              <p className="text-xs text-stone-600">
                {attendanceData.absent} students absent
              </p>
            </div>
            {onNavigateToClassroom && (
              <Button
                onClick={onNavigateToClassroom}
                variant="outline"
                size="sm"
                className="mt-3 w-fit gap-2 text-stone-700 hover:text-stone-900"
              >
                My Classroom
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Assignment Tracker Widget */}
        <Card className="rounded-lg border-stone-200 bg-white shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="space-y-1">
                <p className="text-2xl font-normal text-stone-900 sm:text-3xl">{homeworkData.pendingReview}</p>
                <p className="text-xs text-stone-600">To review</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-normal text-stone-900 sm:text-3xl">{homeworkData.dueSoon}</p>
                <p className="text-xs text-stone-600">Due soon</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">Submission rate</span>
                <span className="font-medium text-stone-900">{homeworkData.submissionRate}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-stone-900"
                  style={{ width: `${homeworkData.submissionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Alerts Widget */}
        <Card className="rounded-lg border-stone-200 bg-white shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Student Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 sm:space-y-2">
            {studentAlertsData.map((alert) => (
              <button
                key={alert.id}
                onClick={() => onStudentClick?.(alert.student)}
                className="flex w-full items-start gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-stone-50 sm:gap-3 sm:p-2"
              >
                <div className="relative shrink-0">
                  <div className="flex size-7 items-center justify-center rounded-full bg-stone-200 text-xs font-medium text-stone-700 sm:size-8">
                    {alert.initials}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 size-2 rounded-full border-2 border-white sm:size-2.5 ${
                      alert.priority === 'high'
                        ? 'bg-red-600'
                        : alert.priority === 'medium'
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                    }`}
                  />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs font-medium text-stone-900 sm:text-sm">{alert.student}</p>
                  <p className="text-xs text-stone-600 sm:text-sm">{alert.message}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Edit Widgets Button */}
      <div className="flex justify-center pt-2 sm:pt-4">
        <button className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-800 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md sm:text-sm">
          Edit widgets
        </button>
      </div>
    </div>
  )
}

