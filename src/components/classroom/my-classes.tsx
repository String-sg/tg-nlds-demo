'use client'

import { HomeIcon, UsersIcon, TrophyIcon, ChevronRightIcon, CalendarIcon, MapPinIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { currentUser, mockClasses, getClassOverviewStats } from '@/lib/mock-data/classroom-data'
import { cn } from '@/lib/utils'
import type { Class, ClassSchedule } from '@/types/classroom'

interface MyClassesProps {
  onClassClick?: (classId: string) => void
}

export function MyClasses({ onClassClick }: MyClassesProps) {
  // Separate classes by type
  const formClass = mockClasses.find((c) => c.is_form_class && c.class_id === currentUser.form_class_id)
  const subjectClasses = mockClasses.filter((c) => !c.is_form_class)
  const hasFormClass = currentUser.role === 'FormTeacher' && formClass

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">My Classroom</h1>
          <p className="text-sm text-stone-600 mt-1">
            Manage your classes, students, and teaching activities
          </p>
        </div>
      </div>

      {/* Form Class (if applicable) */}
      {hasFormClass && formClass && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-stone-700" />
            <h2 className="text-lg font-semibold text-stone-900">Form Class</h2>
          </div>

          <ClassCard
            classData={formClass}
            isFormClass={true}
            onClassClick={onClassClick}
          />
        </div>
      )}

      {/* Subject Classes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-stone-700" />
          <h2 className="text-lg font-semibold text-stone-900">
            Subject Classes ({subjectClasses.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* CCA Classes (placeholder) */}
      {currentUser.cca_classes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-stone-700" />
            <h2 className="text-lg font-semibold text-stone-900">
              CCA Classes ({currentUser.cca_classes.length})
            </h2>
          </div>

          <Card className="border-stone-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrophyIcon className="h-12 w-12 text-stone-400 mb-3" />
              <p className="text-sm text-stone-600 text-center max-w-sm">
                CCA class management coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

interface ClassCardProps {
  classData: Class
  isFormClass: boolean
  onClassClick?: (classId: string) => void
}

function ClassCard({ classData, isFormClass, onClassClick }: ClassCardProps) {
  const stats = getClassOverviewStats(classData.class_id)

  return (
    <Card
      className={cn(
        "border-stone-200 hover:shadow-md transition-all cursor-pointer group",
        isFormClass && "ring-2 ring-blue-500/20 bg-blue-50/30"
      )}
      onClick={() => onClassClick?.(classData.class_id)}
    >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-semibold text-stone-900">
                  Class {classData.class_name}
                </CardTitle>
                {isFormClass && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                    <HomeIcon className="h-3 w-3 mr-1" />
                    Form Class
                  </Badge>
                )}
              </div>
              <p className="text-sm text-stone-600">
                {classData.subject} · Year {classData.year_level}
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-stone-400 group-hover:text-stone-600 transition-colors" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Student Count */}
          <div className="flex items-center gap-2 text-sm">
            <UsersIcon className="h-4 w-4 text-stone-500" />
            <span className="text-stone-900 font-medium">{classData.student_count} students</span>
          </div>

          {/* Schedule */}
          {classData.schedule.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <CalendarIcon className="h-4 w-4 text-stone-500" />
                <span>
                  {classData.schedule.map((s: ClassSchedule) => s.day).join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600 pl-6">
                <span>{classData.schedule[0].start_time} - {classData.schedule[0].end_time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600 pl-6">
                <MapPinIcon className="h-3 w-3 text-stone-500" />
                <span>{classData.schedule[0].location}</span>
              </div>
            </div>
          )}

          {/* Today's Stats */}
          {stats && (
            <div className="pt-3 border-t border-stone-200">
              <p className="text-xs font-medium text-stone-500 mb-2">TODAY</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-stone-600">Attendance</p>
                  <p className="text-lg font-semibold text-stone-900">
                    {stats.attendance.present}/{classData.student_count}
                  </p>
                </div>
                {stats.alerts.total > 0 && (
                  <div>
                    <p className="text-xs text-stone-600">Active Alerts</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-lg font-semibold text-amber-600">
                        {stats.alerts.total}
                      </p>
                      {stats.alerts.urgent > 0 && (
                        <Badge variant="destructive" className="h-5 text-xs">
                          {stats.alerts.urgent} urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-3 border-t border-stone-200">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Will navigate to attendance page
                }}
              >
                Take Attendance
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Will navigate to grades page
                }}
              >
                Enter Grades
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}
