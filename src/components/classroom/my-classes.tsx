'use client'

import { TrophyIcon, Sparkle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/contexts/user-context'
import { useClasses } from '@/hooks/use-classes'
import { cn } from '@/lib/utils'
import type { Class, CCAClass, AINotification, OverallStatus } from '@/types/classroom'

interface MyClassesProps {
  onClassClick?: (classId: string, className: string) => void
}

export function MyClasses({ onClassClick }: MyClassesProps) {
  const { user, loading: userLoading } = useUser()
  const { formClass, subjectClasses, ccaClasses, loading: classesLoading } = useClasses(user?.user_id || '')

  const hasFormClass = user?.role === 'FormTeacher' && formClass
  const loading = userLoading || classesLoading

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
          </div>
        </div>

        {/* Form Class Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ClassCardSkeleton isFormClass={true} />
            </div>
            <div className="lg:col-span-1">
              <OverallCardSkeleton />
            </div>
          </div>
        </div>

        {/* Subject Classes Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ClassCardSkeleton />
            <ClassCardSkeleton />
          </div>
        </div>

        {/* CCA Classes Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-4">
            <CCACardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading user data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Classroom</h1>
        </div>
      </div>

      {/* Form Class (if applicable) */}
      {hasFormClass && formClass && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-stone-900">Form class</h2>

          {/* Two-column layout: Main card (left) + Overall card (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ClassCard
                classData={formClass}
                isFormClass={true}
                onClassClick={onClassClick}
              />
            </div>
            <div className="lg:col-span-1">
              <OverallCard status={formClass.overall_status} />
            </div>
          </div>
        </div>
      )}

      {/* Subject Classes */}
      {subjectClasses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-stone-900">
            Subject class {subjectClasses.length}
          </h2>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {subjectClasses.map((classData) => (
              <ClassCard
                key={classData.class_id}
                classData={classData}
                isFormClass={false}
                onClassClick={onClassClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* CCA Classes */}
      {ccaClasses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-stone-700" />
            <h2 className="text-lg font-semibold text-stone-900">
              CCA class {ccaClasses.length}
            </h2>
          </div>

          {/* Full-width cards */}
          <div className="space-y-4">
            {ccaClasses.map((ccaClass) => (
              <CCACard
                key={ccaClass.cca_id}
                ccaData={ccaClass}
                onClassClick={onClassClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

interface ClassCardProps {
  classData: Class
  isFormClass: boolean
  onClassClick?: (classId: string, className: string) => void
}

function ClassCard({ classData, isFormClass, onClassClick }: ClassCardProps) {
  // Format schedule for display
  const formatSchedule = (schedule: typeof classData.schedule): string => {
    if (!schedule || schedule.length === 0) {
      return 'Not scheduled'
    }
    const days = schedule.map(s => s.day).join(', ')
    return days
  }

  return (
    <Card
      className={cn(
        "border-stone-200 hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col",
        "hover:border-stone-300"
      )}
      onClick={() => onClassClick?.(classData.class_id, classData.class_name)}
    >
      <CardHeader className="pb-6">
        {/* Top row: Title and Stats aligned */}
        <div className="flex items-start justify-between gap-8 mb-3">
          <div className="flex flex-col gap-3 min-w-0">
            <CardTitle className="text-2xl font-semibold text-stone-900">
              Class {classData.class_name}
            </CardTitle>
            
            {/* Badges row below title */}
            <div className="flex flex-wrap gap-2">
              {isFormClass && (
                <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
                  Form class
                </Badge>
              )}
              {!isFormClass && classData.subject && (
                <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
                  {classData.subject}
                </Badge>
              )}
              <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
                Year {classData.year_level}
              </Badge>
              {classData.awards && classData.awards.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  {classData.awards[0]}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Stats on same row as title */}
          <div className="flex items-stretch divide-x divide-stone-200 flex-shrink-0">
            <StatItem label="Student" value={classData.student_count} />
            <StatItem 
              label="Classroom" 
              value={classData.classroom_number || "5-12"} 
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* AI Agent notification box */}
        <AINotificationBox notification={classData.ai_notification} />
      </CardContent>
    </Card>
  )
}

interface CCACardProps {
  ccaData: CCAClass
  onClassClick?: (classId: string, className: string) => void
}

function CCACard({ ccaData, onClassClick }: CCACardProps) {
  // Format schedule for display
  const formatSchedule = (schedule: typeof ccaData.schedule): string => {
    if (!schedule || schedule.length === 0) {
      return 'Not scheduled'
    }
    const days = schedule.map(s => s.day).join(', ')
    return days
  }

  return (
    <Card
      className={cn(
        "border-stone-200 hover:shadow-md transition-shadow cursor-pointer group",
        "hover:border-stone-300"
      )}
      onClick={() => onClassClick?.(ccaData.cca_id, ccaData.name)}
    >
      <CardHeader className="pb-6">
        {/* Top row: Title and Stats aligned */}
        <div className="flex items-center justify-between gap-8 mb-2">
          <CardTitle className="text-2xl font-semibold text-stone-900">
            Class {ccaData.name}
          </CardTitle>
          
          {/* Stats on same row as title */}
          <div className="flex items-stretch divide-x divide-stone-200 flex-shrink-0">
            <StatItem label="Student" value={ccaData.members.length} />
            <StatItem 
              label="Location" 
              value={ccaData.location || "Tennis court"} 
            />
            <StatItem 
              label="My classes" 
              value={formatSchedule(ccaData.schedule) || "Tue, Thur"}
            />
          </div>
        </div>
        
        {/* Badges row below */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
            {ccaData.type}
          </Badge>
          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
            Year {ccaData.type === 'Sports' ? '6' : '5'}
          </Badge>
          {ccaData.type === 'Sports' && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              Excellence award winner
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        {/* AI Agent notification box */}
        <AINotificationBox notification={ccaData.ai_notification} />
      </CardContent>
    </Card>
  )
}

// Overall status card for form class
interface OverallCardProps {
  status?: OverallStatus
}

function OverallCard({ status }: OverallCardProps) {
  const defaultMessage = "All good, Mr. Tan"
  const statusMessage = status?.message || defaultMessage

  return (
    <Card className="border-stone-200 h-full flex flex-col">
      <CardHeader className="pb-10">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Overall</p>
        <CardTitle className="text-2xl font-semibold text-stone-900">
          {statusMessage}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {status?.illustration_url ? (
          <div className="rounded-lg overflow-hidden flex-1">
            <img 
              src={status.illustration_url} 
              alt="Overall status illustration" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          // Default illustration with gradient background
          <div 
            className="relative rounded-lg overflow-hidden flex-1 border border-stone-100"
            style={{ background: 'linear-gradient(180deg, #B4ECFF 0%, #F5E3DF 100%)' }}
          >
            {/* Cloud illustration */}
            <div className="absolute top-4 right-4">
              <img 
                src="/images/cloud-transparent.png" 
                alt="Cloud illustration" 
                className="w-24 h-auto object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// AI Agent notification box
interface AINotificationBoxProps {
  notification?: AINotification
}

function AINotificationBox({ notification }: AINotificationBoxProps) {
  if (!notification) {
    return (
      <div className="h-48 p-6 bg-stone-50 rounded-lg flex flex-col">
        <div className="flex items-start gap-3">
          <Sparkle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900">AI Agent</p>
            <p className="text-sm text-stone-600 mt-1">
              {/* TODO: Integrate with AI Agent API */}
              Pending: AI Agent integration
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "h-48 p-6 rounded-lg flex flex-col",
      notification.priority === 'urgent' && "bg-red-50",
      notification.priority === 'warning' && "bg-amber-50",
      (!notification.priority || notification.priority === 'info') && "bg-stone-50"
    )}>
      <div className="flex items-start gap-3">
        <Sparkle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900">AI Agent</p>

          {/* Display insights as bullet points if available */}
          {notification.insights && notification.insights.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {notification.insights.map((insight, index) => (
                <li key={index} className="text-sm text-stone-700 flex items-start gap-2">
                  <span className="text-stone-400 mt-1">•</span>
                  <span className="leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            /* Fallback to message if insights not available */
            <p className="text-sm text-stone-700 mt-1 leading-relaxed">
              {notification.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat item for horizontal stats display
interface StatItemProps {
  label: string
  value: string | number | React.ReactNode
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="px-4 py-2 min-w-0 first:pl-0 last:pr-0">
      <p className="text-xs text-stone-500 mb-1 text-center whitespace-nowrap">
        {label}
      </p>
      <p className="text-base font-semibold text-stone-900 text-center whitespace-nowrap">
        {value}
      </p>
    </div>
  )
}

// ============================================================================
// Skeleton Components
// ============================================================================

function ClassCardSkeleton({ isFormClass = false }: { isFormClass?: boolean }) {
  return (
    <Card className="border-stone-200 h-full flex flex-col">
      <CardHeader className="pb-6">
        {/* Top row: Title and Stats aligned */}
        <div className="flex items-start justify-between gap-8 mb-3">
          <div className="flex flex-col gap-3 min-w-0">
            <Skeleton className="h-8 w-32" />
            
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              {isFormClass && <Skeleton className="h-5 w-20" />}
              {!isFormClass && <Skeleton className="h-5 w-24" />}
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          
          {/* Stats on same row as title */}
          <div className="flex items-stretch divide-x divide-stone-200 flex-shrink-0">
            <div className="px-4 py-2 first:pl-0">
              <Skeleton className="h-3 w-12 mb-1 mx-auto" />
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
            <div className="px-4 py-2 last:pr-0">
              <Skeleton className="h-3 w-16 mb-1 mx-auto" />
              <Skeleton className="h-4 w-10 mx-auto" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* AI Agent notification box skeleton */}
        <div className="h-48 p-6 bg-stone-50 rounded-lg flex flex-col">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OverallCardSkeleton() {
  return (
    <Card className="border-stone-200 h-full flex flex-col">
      <CardHeader className="pb-6">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-6 w-40" />
      </CardHeader>

      <CardContent className="pt-0">
        <Skeleton className="rounded-lg h-48 w-full" />
      </CardContent>
    </Card>
  )
}

function CCACardSkeleton() {
  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-6">
        {/* Top row: Title and Stats aligned */}
        <div className="flex items-center justify-between gap-8 mb-2">
          <Skeleton className="h-8 w-40" />
          
          {/* Stats on same row as title - 3 stats for CCA */}
          <div className="flex items-stretch divide-x divide-stone-200 flex-shrink-0">
            <div className="px-4 py-2 first:pl-0">
              <Skeleton className="h-3 w-12 mb-1 mx-auto" />
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
            <div className="px-4 py-2">
              <Skeleton className="h-3 w-16 mb-1 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="px-4 py-2 last:pr-0">
              <Skeleton className="h-3 w-16 mb-1 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>
        </div>
        
        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-36" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* AI Agent notification box skeleton */}
        <div className="h-48 p-6 bg-stone-50 rounded-lg flex flex-col">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
