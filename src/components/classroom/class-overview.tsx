'use client'

import Link from 'next/link'
import {
  ArrowLeftIcon,
  HomeIcon,
  UsersIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  TrendingUpIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  GraduationCapIcon,
  MessageSquareIcon,
  FileTextIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getClassById,
  getClassOverviewStats,
  getActivityLogByClassId,
  currentUser,
} from '@/lib/mock-data/classroom-data'
import { cn } from '@/lib/utils'

interface ClassOverviewProps {
  classId: string
}

export function ClassOverview({ classId }: ClassOverviewProps) {
  const classData = getClassById(classId)
  const stats = getClassOverviewStats(classId)
  const activities = getActivityLogByClassId(classId).slice(0, 5)

  if (!classData) {
    return <div>Class not found</div>
  }

  const isFormClass = classData.is_form_class && classData.class_id === currentUser.form_class_id

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/classroom">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to My Classes
          </Button>
        </Link>
      </div>

      {/* Class Info Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 text-2xl font-bold text-blue-700">
            {classData.class_name}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold text-stone-900">
                Class {classData.class_name}
              </h1>
              {isFormClass && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                  <HomeIcon className="h-3 w-3 mr-1" />
                  Form Class
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-stone-600">
                {classData.subject} · Year {classData.year_level} · {classData.student_count} students
              </p>
              <p className="text-sm text-stone-600">
                Teacher: {currentUser.name}
                {isFormClass && ' (Form Teacher)'}
              </p>
              {classData.schedule.length > 0 && (
                <p className="text-sm text-stone-600">
                  Schedule: {classData.schedule.map((s) => s.day).join(', ')} | {classData.schedule[0].start_time} - {classData.schedule[0].end_time} | {classData.schedule[0].location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Snapshot */}
      {stats && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Today&apos;s Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Attendance */}
            <Card className="border-stone-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-stone-600">Attendance</CardTitle>
                  <CheckCircle2Icon className={cn(
                    "h-5 w-5",
                    stats.attendance.rate >= 90 ? "text-green-600" : "text-amber-600"
                  )} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-stone-900">
                    {stats.attendance.present}/{classData.student_count}
                  </span>
                  <span className="text-sm text-stone-600">
                    ({stats.attendance.rate.toFixed(1)}%)
                  </span>
                </div>
                <div className="space-y-1 text-xs text-stone-600">
                  <p>Present: {stats.attendance.present}</p>
                  <p>Absent: {stats.attendance.absent}</p>
                  {stats.attendance.late > 0 && <p>Late: {stats.attendance.late}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Academic Status */}
            <Card className="border-stone-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-stone-600">Academic Status</CardTitle>
                  <GraduationCapIcon className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-stone-900">
                    {stats.academic.class_average.toFixed(1)}%
                  </span>
                  <span className="text-sm text-stone-600">(B)</span>
                </div>
                <div className="space-y-1 text-xs text-stone-600">
                  <p>Pending Grades: {stats.academic.pending_grades} assignments</p>
                  <p>Upcoming: {stats.academic.upcoming_assessments} assessments</p>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card className="border-stone-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-stone-600">Active Alerts</CardTitle>
                  <AlertCircleIcon className={cn(
                    "h-5 w-5",
                    stats.alerts.urgent > 0 ? "text-red-600" : "text-amber-600"
                  )} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-stone-900">{stats.alerts.total}</span>
                  {stats.alerts.urgent > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {stats.alerts.urgent} urgent
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-xs text-stone-600">
                  {stats.alerts.urgent > 0 && <p>🔴 Urgent: {stats.alerts.urgent}</p>}
                  {stats.alerts.high > 0 && <p>🟡 High: {stats.alerts.high}</p>}
                  {stats.alerts.medium > 0 && <p>🟢 Medium: {stats.alerts.medium}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-900">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link href={`/classroom/${classId}/attendance/take`}>
            <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4">
              <ClipboardCheckIcon className="h-5 w-5" />
              <span className="text-xs">Take Attendance</span>
            </Button>
          </Link>
          <Link href={`/classroom/${classId}/academic/grades`}>
            <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4">
              <GraduationCapIcon className="h-5 w-5" />
              <span className="text-xs">Enter Grades</span>
            </Button>
          </Link>
          <Link href={`/classroom/${classId}/communication`}>
            <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4">
              <MessageSquareIcon className="h-5 w-5" />
              <span className="text-xs">Message Parents</span>
            </Button>
          </Link>
          <Link href={`/classroom/${classId}/cases/new`}>
            <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4">
              <FileTextIcon className="h-5 w-5" />
              <span className="text-xs">Create Record</span>
            </Button>
          </Link>
          <Link href={`/classroom/${classId}/students`}>
            <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4">
              <UsersIcon className="h-5 w-5" />
              <span className="text-xs">View Students</span>
            </Button>
          </Link>
          <Link href={`/classroom/${classId}/alerts`}>
            <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4">
              <AlertCircleIcon className="h-5 w-5" />
              <span className="text-xs">Class Alerts</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-stone-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.activity_id} className="flex items-start gap-3 pb-3 border-b border-stone-100 last:border-0 last:pb-0">
                    <div className="mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-900">{activity.description}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {new Date(activity.date).toLocaleString('en-SG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href={`/classroom/${classId}/activity`}>
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View All Activity
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-stone-600 text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-stone-900">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
                <CalendarIcon className="h-4 w-4 text-stone-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-stone-900 font-medium">Assignment 6 due</p>
                  <p className="text-xs text-stone-600 mt-0.5">Tomorrow · 18/30 submitted</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
                <CalendarIcon className="h-4 w-4 text-stone-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-stone-900 font-medium">Mid-term Examination</p>
                  <p className="text-xs text-stone-600 mt-0.5">Oct 12, 2025</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
                <CalendarIcon className="h-4 w-4 text-stone-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-stone-900 font-medium">Parent-Teacher Meeting (PTM)</p>
                  <p className="text-xs text-stone-600 mt-0.5">Oct 15, 2025</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-4 w-4 text-stone-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-stone-900 font-medium">End of Term Assessment</p>
                  <p className="text-xs text-stone-600 mt-0.5">Oct 20, 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators (if form class) */}
      {isFormClass && stats && (
        <Card className="border-stone-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-stone-900">Performance Indicators</CardTitle>
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-stone-900">
                  {stats.academic.class_average.toFixed(1)}%
                </span>
                <span className="text-sm text-stone-600">(B)</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  ↑ 2.3% from last month
                </Badge>
              </div>
              <p className="text-sm text-stone-600">Class Average</p>
            </div>

            <div>
              <p className="text-sm font-medium text-stone-900 mb-3">Grade Distribution</p>
              <div className="space-y-2">
                <GradeBar grade="A (85-100)" count={8} total={30} color="bg-green-500" />
                <GradeBar grade="B (70-84)" count={14} total={30} color="bg-blue-500" />
                <GradeBar grade="C (55-69)" count={6} total={30} color="bg-yellow-500" />
                <GradeBar grade="D (40-54)" count={2} total={30} color="bg-orange-500" />
                <GradeBar grade="F (<40)" count={0} total={30} color="bg-red-500" />
              </div>
            </div>

            <div>
              <p className="text-sm text-stone-600">
                Attendance Trend (Last 30 days): <span className="font-semibold text-stone-900">92.1%</span> average
              </p>
            </div>

            <Link href={`/classroom/${classId}/analytics`}>
              <Button variant="outline" className="w-full">
                View Detailed Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GradeBar({ grade, count, total, color }: { grade: string; count: number; total: number; color: string }) {
  const percentage = (count / total) * 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-stone-600">{grade}</span>
        <span className="text-stone-900 font-medium">
          {count} students ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
