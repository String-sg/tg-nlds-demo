'use client'

import { useState } from 'react'
import {
  Users,
  Heart,
  BookOpen,
  UserCheck,
  DollarSign,
  Bell,
  FileCheck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { comingSoonToast } from '@/lib/coming-soon-toast'

// Mock data for dashboard widgets
const dashboardData = {
  attendance: {
    total: 1247,
    present: 1198,
    absent: 32,
    late: 17,
    percentage: 96.1,
    change: '+2.3%',
    trend: 'up' as const,
  },
  health: {
    totalCases: 12,
    activeMonitoring: 5,
    resolved: 7,
    medicalLeave: 3,
    change: '-15%',
    trend: 'down' as const,
  },
  programme: {
    activePrograms: 24,
    participation: 456,
    upcomingEvents: 8,
    completionRate: 87,
  },
  custody: {
    totalStudents: 1247,
    guardianUpdates: 3,
    pendingVerification: 2,
  },
  moeFas: {
    applications: 145,
    approved: 132,
    pending: 13,
    approvalRate: 91,
  },
  adminUpdates: {
    unreadAnnouncements: 4,
    pendingApprovals: 7,
    upcomingDeadlines: 3,
  },
  mtl: {
    totalEnrolled: 892,
    approved: 892,
    pending: 0,
    languages: ['Chinese', 'Malay', 'Tamil'],
  },
  incidents: {
    total: 8,
    resolved: 5,
    pending: 3,
    categories: {
      behavioral: 4,
      safety: 2,
      academic: 2,
    },
  },
}

const quickStats = [
  {
    label: 'Total Students',
    value: '1,247',
    change: '+12',
    trend: 'up' as const,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    label: 'Staff Members',
    value: '84',
    change: '+2',
    trend: 'up' as const,
    icon: UserCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    label: 'Attendance Rate',
    value: '96.1%',
    change: '+2.3%',
    trend: 'up' as const,
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    label: 'Active Programs',
    value: '24',
    change: '+3',
    trend: 'up' as const,
    icon: BookOpen,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
]

interface SchoolDashboardProps {
  onNavigate?: (path: string) => void
}

export function SchoolDashboard({ onNavigate }: SchoolDashboardProps) {
  const getTodayDate = () => {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return today.toLocaleDateString('en-US', options)
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-6 p-6 pb-12">
        <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">School Dashboard</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <Calendar className="size-4" />
              {getTodayDate()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => comingSoonToast.report()}>
            <ArrowRight className="mr-2 size-4" />
            View Full Reports
          </Button>
        </div>

        {/* AI Insights */}
        <Card className="border-border/40 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-white/80 p-2.5 shadow-sm dark:bg-gray-900/80">
                <Sparkles className="size-5 text-purple-600" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">AI Insights</h3>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    Updated just now
                  </span>
                </div>
                <p className="text-foreground/90 text-sm leading-relaxed">
                  <strong>Overall: Positive trend this week.</strong> Attendance is up 2.3% with{' '}
                  <strong>96.1% present</strong> today. Health cases decreased by 15%, showing
                  improvement. However, <strong>3 incidents require attention</strong> —
                  2 behavioral and 1 safety-related. MOE-FAS applications are on track with 91%
                  approval rate. MTL enrollment is complete with zero pending approvals.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/60 px-3 py-1.5 text-xs font-medium dark:bg-gray-900/60">
                    <div className="size-1.5 rounded-full bg-green-500" />
                    <span>Attendance trending up</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/60 px-3 py-1.5 text-xs font-medium dark:bg-gray-900/60">
                    <div className="size-1.5 rounded-full bg-green-500" />
                    <span>Health cases improving</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/60 px-3 py-1.5 text-xs font-medium dark:bg-gray-900/60">
                    <div className="size-1.5 rounded-full bg-yellow-500" />
                    <span>3 pending incidents</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/60 px-3 py-1.5 text-xs font-medium dark:bg-gray-900/60">
                    <div className="size-1.5 rounded-full bg-blue-500" />
                    <span>13 MOE-FAS pending review</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => comingSoonToast.feature('AI detailed analysis')}
                  >
                    View detailed analysis
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
            return (
              <Card key={stat.label} className="border-border/40">
                <CardContent className="flex items-start justify-between gap-4 p-6">
                  <div className="flex-1 space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <TrendIcon
                        className={cn(
                          'size-3',
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600',
                        )}
                      />
                      <span
                        className={cn(
                          'font-medium',
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600',
                        )}
                      >
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">from last month</span>
                    </div>
                  </div>
                  <div className={cn('rounded-lg p-3', stat.bgColor)}>
                    <Icon className={cn('size-5', stat.color)} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Dashboard Widgets */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Today's Attendance */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2.5 dark:bg-blue-950/20">
                  <Users className="size-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Today&apos;s Attendance</CardTitle>
                  <CardDescription>Real-time attendance tracking</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{dashboardData.attendance.percentage}%</span>
                <span className="text-muted-foreground mb-1 text-sm">
                  ({dashboardData.attendance.present} / {dashboardData.attendance.total})
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    Present
                  </span>
                  <span className="font-medium">{dashboardData.attendance.present}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-red-500" />
                    Absent
                  </span>
                  <span className="font-medium">{dashboardData.attendance.absent}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-yellow-500" />
                    Late
                  </span>
                  <span className="font-medium">{dashboardData.attendance.late}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => comingSoonToast.report()}
              >
                View Attendance Details
              </Button>
            </CardContent>
          </Card>

          {/* Health */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2.5 dark:bg-red-950/20">
                  <Heart className="size-5 text-red-600" />
                </div>
                <div>
                  <CardTitle>Health Monitoring</CardTitle>
                  <CardDescription>Student health & wellbeing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Cases</p>
                  <p className="text-2xl font-bold">{dashboardData.health.totalCases}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Medical Leave</p>
                  <p className="text-2xl font-bold">{dashboardData.health.medicalLeave}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Active Monitoring</span>
                  <span className="font-medium">{dashboardData.health.activeMonitoring}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Resolved</span>
                  <span className="font-medium">{dashboardData.health.resolved}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => comingSoonToast.report()}
              >
                View Health Records
              </Button>
            </CardContent>
          </Card>

          {/* Programme */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2.5 dark:bg-purple-950/20">
                  <BookOpen className="size-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Programme Management</CardTitle>
                  <CardDescription>School programs & activities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Active Programs</p>
                  <p className="text-2xl font-bold">{dashboardData.programme.activePrograms}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Participation</p>
                  <p className="text-2xl font-bold">{dashboardData.programme.participation}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Upcoming Events</span>
                  <span className="font-medium">{dashboardData.programme.upcomingEvents}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-medium">{dashboardData.programme.completionRate}%</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => comingSoonToast.management('Programme')}
              >
                Manage Programs
              </Button>
            </CardContent>
          </Card>

          {/* Custody */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-50 p-2.5 dark:bg-cyan-950/20">
                  <UserCheck className="size-5 text-cyan-600" />
                </div>
                <div>
                  <CardTitle>Custody & Guardianship</CardTitle>
                  <CardDescription>Guardian information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Total Students</p>
                <p className="text-2xl font-bold">{dashboardData.custody.totalStudents}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Guardian Updates</span>
                  <span className="font-medium">{dashboardData.custody.guardianUpdates}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Pending Verification</span>
                  <span className="font-medium">{dashboardData.custody.pendingVerification}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => comingSoonToast.feature('Guardian updates review')}
              >
                Review Updates
              </Button>
            </CardContent>
          </Card>

          {/* MOE-FAS */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2.5 dark:bg-green-950/20">
                  <DollarSign className="size-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>MOE-FAS</CardTitle>
                  <CardDescription>Financial assistance applications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Applications</p>
                  <p className="text-2xl font-bold">{dashboardData.moeFas.applications}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Approval Rate</p>
                  <p className="text-2xl font-bold">{dashboardData.moeFas.approvalRate}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Approved</span>
                  <span className="font-medium">{dashboardData.moeFas.approved}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Pending Review</span>
                  <span className="font-medium">{dashboardData.moeFas.pending}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => comingSoonToast.feature('MOE-FAS application review')}
              >
                Review Applications
              </Button>
            </CardContent>
          </Card>

          {/* Admin Updates */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-2.5 dark:bg-orange-950/20">
                  <Bell className="size-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Admin Updates</CardTitle>
                  <CardDescription>Announcements & notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Unread Announcements</span>
                  <span className="flex items-center gap-2 font-medium">
                    {dashboardData.adminUpdates.unreadAnnouncements}
                    {dashboardData.adminUpdates.unreadAnnouncements > 0 && (
                      <span className="flex size-2 rounded-full bg-orange-500" />
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Pending Approvals</span>
                  <span className="font-medium">{dashboardData.adminUpdates.pendingApprovals}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Upcoming Deadlines</span>
                  <span className="font-medium">
                    {dashboardData.adminUpdates.upcomingDeadlines}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => comingSoonToast.feature('Admin updates')}
              >
                View All Updates
              </Button>
            </CardContent>
          </Card>

          {/* Approved MTL */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-50 p-2.5 dark:bg-indigo-950/20">
                  <FileCheck className="size-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>Mother Tongue Languages</CardTitle>
                  <CardDescription>MTL enrollment & approvals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Enrolled</p>
                  <p className="text-2xl font-bold">{dashboardData.mtl.totalEnrolled}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-2xl font-bold">{dashboardData.mtl.pending}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {dashboardData.mtl.languages.map((lang) => (
                    <span
                      key={lang}
                      className="bg-muted rounded-md px-2.5 py-1 text-xs font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => comingSoonToast.management('MTL')}
              >
                Manage MTL
              </Button>
            </CardContent>
          </Card>

          {/* Incidents */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-50 p-2.5 dark:bg-yellow-950/20">
                  <AlertCircle className="size-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>Incident Management</CardTitle>
                  <CardDescription>Safety & behavioral incidents</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Incidents</p>
                  <p className="text-2xl font-bold">{dashboardData.incidents.total}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboardData.incidents.pending}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Behavioral</span>
                  <span className="font-medium">{dashboardData.incidents.categories.behavioral}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Safety</span>
                  <span className="font-medium">{dashboardData.incidents.categories.safety}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Academic</span>
                  <span className="font-medium">{dashboardData.incidents.categories.academic}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => comingSoonToast.feature('Incident management')}
              >
                View All Incidents
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </ScrollArea>
  )
}
