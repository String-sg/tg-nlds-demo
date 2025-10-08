'use client'

import { HomeIcon, UsersIcon, TrophyIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { currentUser, mockClasses, mockCCAClasses } from '@/lib/mock-data/classroom-data'
import { cn } from '@/lib/utils'
import type { Class, CCAClass } from '@/types/classroom'

interface MyClassesProps {
  onClassClick?: (classId: string) => void
}

export function MyClasses({ onClassClick }: MyClassesProps) {
  // Separate classes by type
  const formClass = mockClasses.find((c) => c.is_form_class && c.class_id === currentUser.form_class_id)
  const subjectClasses = mockClasses.filter((c) => !c.is_form_class)
  const ccaClasses = mockCCAClasses.filter((c) => currentUser.cca_classes.includes(c.cca_id))
  const hasFormClass = currentUser.role === 'FormTeacher' && formClass

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
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
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-stone-700" />
            <h2 className="text-lg font-semibold text-stone-900">Form Class</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <ClassCard
              classData={formClass}
              isFormClass={true}
              onClassClick={onClassClick}
            />
          </div>
        </div>
      )}

      {/* Subject Classes */}
      {subjectClasses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-stone-700" />
            <h2 className="text-lg font-semibold text-stone-900">
              Subject Classes ({subjectClasses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              CCA Classes ({ccaClasses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

interface ClassCardProps {
  classData: Class
  isFormClass: boolean
  onClassClick?: (classId: string) => void
}

function ClassCard({ classData, isFormClass, onClassClick }: ClassCardProps) {
  return (
    <Card
      className={cn(
        "border-stone-200 hover:shadow-lg transition-all cursor-pointer group h-full",
        "hover:border-stone-300",
        isFormClass && "ring-2 ring-blue-500/20 bg-blue-50/30"
      )}
      onClick={() => onClassClick?.(classData.class_id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-2xl font-bold text-stone-900">
            {classData.class_name}
          </CardTitle>
          {isFormClass && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
              <HomeIcon className="h-3 w-3 mr-1" />
              Form
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Subject */}
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide">Subject</p>
            <p className="text-sm font-medium text-stone-900">{classData.subject}</p>
          </div>

          {/* Student Count */}
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide">Students</p>
            <p className="text-2xl font-bold text-stone-900">{classData.student_count}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// New CCA Card Component
interface CCACardProps {
  ccaData: CCAClass
  onClassClick?: (classId: string) => void
}

function CCACard({ ccaData, onClassClick }: CCACardProps) {
  return (
    <Card
      className={cn(
        "border-stone-200 hover:shadow-lg transition-all cursor-pointer group h-full",
        "hover:border-stone-300 bg-amber-50/30"
      )}
      onClick={() => onClassClick?.(ccaData.cca_id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <TrophyIcon className="h-5 w-5 text-amber-600" />
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
            CCA
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* CCA Name */}
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide">Activity</p>
            <p className="text-sm font-medium text-stone-900 leading-tight">{ccaData.name}</p>
          </div>

          {/* Member Count */}
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide">Members</p>
            <p className="text-2xl font-bold text-stone-900">{ccaData.members.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
