'use client'

import { useRouter } from 'next/navigation'
import { MailIcon, PhoneIcon, MessageSquare, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CaseManagementTable } from '@/components/case-management-table'
import { cn, getInitials, getAvatarColor, getLetterGrade, calculatePercentage } from '@/lib/utils'
import { PageLayout } from '@/components/layout/page-layout'
import { useStudentProfileQuery } from '@/hooks/queries/use-student-profile-query'
import { useMessageParent } from '@/hooks/use-message-parent'
import { getStudentAvatarUrl } from '@/lib/avatars/sample-avatars'
import type { StudentProfileData } from '@/types/student'

interface StudentProfileProps {
  studentName: string
  classId?: string
  onBack?: () => void
  activeTab?: string
  onNavigate?: (path: string, replaceTab?: boolean) => void
  classroomTabs?: Map<string, string>
  studentProfileTabs?: Map<string, string>
}

export function StudentProfile({ studentName, classId, onBack, activeTab, onNavigate, classroomTabs, studentProfileTabs }: StudentProfileProps) {
  const router = useRouter()
  const { data: studentData, isLoading: loading, error } = useStudentProfileQuery(studentName) as { data: StudentProfileData | undefined; isLoading: boolean; error: Error | null }
  const { messageParent, isLoading: isMessagingParent } = useMessageParent()

  if (loading) {
    return (
      <PageLayout
        title={<Skeleton className="h-8 w-48" />}
        subtitle={<Skeleton className="h-4 w-64 mt-1" />}
        titlePrefix={<Skeleton className="h-16 w-16 rounded-full" />}
        titleSuffix={<Skeleton className="h-6 w-16 rounded-full" />}
        contentClassName="px-6 py-6"
      >
        <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
          {/* Tabs Navigation Skeleton */}
          <Skeleton className="h-10 w-full" />

          {/* Content Cards Skeleton */}
          <div className="space-y-6">
            <StudentProfileCardSkeleton />
            <StudentProfileCardSkeleton />
            <StudentProfileCardSkeleton />
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error || !studentData) {
    return (
      <PageLayout title="Error" subtitle="">
        <div className="flex items-center justify-center h-64">
          <p className="text-stone-600">Student not found or error loading data.</p>
        </div>
      </PageLayout>
    )
  }

  // Calculate average grades from academic results
  const getSubjectAverage = (subject: string) => {
    const subjectResults = studentData.academic_results.filter(r =>
      r.assessment_name.toLowerCase().includes(subject.toLowerCase())
    )
    if (subjectResults.length === 0) return 0
    const avg = subjectResults.reduce((sum, r) => sum + (r.percentage || r.score || 0), 0) / subjectResults.length
    return Math.round(avg)
  }

  // Map Supabase data to component format
  const student = {
    name: studentData.name,
    id: studentData.student_id,
    class: studentData.class_name,
    attendance: studentData.attendance.attendance_rate,
    english: getSubjectAverage('English'),
    math: getSubjectAverage('Math'),
    science: getSubjectAverage('Science'),
    status: studentData.overview?.is_swan ? 'SWAN' : 'None',
    parentName: studentData.guardian?.name || 'N/A',
    parentEmail: studentData.guardian?.email || 'N/A',
    parentPhone: studentData.guardian?.phone || 'N/A',
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GEP':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'SEN':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'SWAN':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300'
    }
  }


  // Get avatar URL - returns undefined if no photo (will show initials fallback)
  const avatarUrl = getStudentAvatarUrl(
    studentData.profile_photo,
    studentData.gender as 'male' | 'female' | 'other' | undefined,
    studentData.nationality || undefined
  )

  const avatar = (
    <Avatar className="h-16 w-16">
      <AvatarImage src={avatarUrl} alt={student.name} />
      <AvatarFallback className={cn('text-xl font-medium', getAvatarColor(student.name))}>
        {getInitials(student.name)}
      </AvatarFallback>
    </Avatar>
  )

  const badge = student.status !== 'None' ? (
    <span className={cn(
      'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
      getStatusColor(student.status)
    )}>
      {student.status}
    </span>
  ) : null

  return (
    <PageLayout
      title={student.name}
      subtitle={`Student ID: ${student.id} • Class: ${student.class}`}
      titlePrefix={avatar}
      titleSuffix={badge}
      contentClassName="px-6 py-6"
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="social-behaviour">Social & Behaviour</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* AI Summary */}
          {studentData.ai_summary && (
            <Card className="border-stone-200 bg-stone-50">
              <CardHeader>
                <CardTitle className="text-base font-medium text-stone-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  AI Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {studentData.ai_summary.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-stone-700 flex items-start gap-2">
                      <span className="text-stone-400 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Parent/Guardian Information */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Parent/Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-stone-900">{student.parentName}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <MailIcon className="h-4 w-4" />
                <a href={`mailto:${student.parentEmail}`} className="hover:text-stone-900">
                  {student.parentEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <PhoneIcon className="h-4 w-4" />
                <a href={`tel:${student.parentPhone}`} className="hover:text-stone-900">
                  {student.parentPhone}
                </a>
              </div>
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Validate guardian exists
                    if (!studentData?.guardian) {
                      toast.error('No guardian information available for this student')
                      return
                    }

                    // Validate class ID exists
                    if (!studentData?.form_class_id) {
                      toast.error('Student class information is missing')
                      return
                    }

                    // Message parent using the hook
                    messageParent({
                      studentId: studentData.id, // Use id (UUID) not student_id (student number)
                      classId: studentData.form_class_id,
                      guardianName: studentData.guardian.name,
                    })
                  }}
                  disabled={isMessagingParent || !studentData?.guardian}
                >
                  {isMessagingParent ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening conversation...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Parents
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Background */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Student Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-stone-900 mb-1">Background</h4>
                <p className="text-sm text-stone-600">{studentData.overview?.background || 'No background information available.'}</p>
              </div>
              {studentData.overview?.medical_conditions && typeof studentData.overview.medical_conditions === 'object' && Object.keys(studentData.overview.medical_conditions).length > 0 && (() => {
                const medicalData = studentData.overview.medical_conditions as { notes?: string; allergies?: string[]; conditions?: string[]; medications?: string[] }
                const hasContent = medicalData.notes || (medicalData.allergies && medicalData.allergies.length > 0) || (medicalData.conditions && medicalData.conditions.length > 0) || (medicalData.medications && medicalData.medications.length > 0)

                if (!hasContent) return null

                return (
                  <div>
                    <h4 className="text-sm font-medium text-stone-900 mb-1">Medical Conditions</h4>
                    <div className="space-y-2">
                      {medicalData.notes && (
                        <p className="text-sm text-stone-600">{medicalData.notes}</p>
                      )}
                      {medicalData.conditions && medicalData.conditions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-stone-700">Conditions:</p>
                          <p className="text-sm text-stone-600">{medicalData.conditions.join(', ')}</p>
                        </div>
                      )}
                      {medicalData.allergies && medicalData.allergies.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-stone-700">Allergies:</p>
                          <p className="text-sm text-stone-600">{medicalData.allergies.join(', ')}</p>
                        </div>
                      )}
                      {medicalData.medications && medicalData.medications.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-stone-700">Medications:</p>
                          <p className="text-sm text-stone-600">{medicalData.medications.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
              {studentData.overview?.mental_wellness && (
                <div>
                  <h4 className="text-sm font-medium text-stone-900 mb-1">Mental Wellness</h4>
                  <p className="text-sm text-stone-600">
                    Status: {(studentData.overview.mental_wellness as { status?: string; notes?: string })?.status || 'N/A'} - {(studentData.overview.mental_wellness as { status?: string; notes?: string })?.notes || 'No notes'}
                  </p>
                </div>
              )}
              {studentData.overview?.family && (
                <div>
                  <h4 className="text-sm font-medium text-stone-900 mb-1">Family Background</h4>
                  <p className="text-sm text-stone-600">
                    {(studentData.overview.family as { structure?: string; notes?: string })?.structure || 'N/A'} - {(studentData.overview.family as { structure?: string; notes?: string })?.notes || 'No additional notes'}
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-stone-900 mb-1">Friends</h4>
                <div className="flex flex-wrap gap-2">
                  {studentData.friend_relationships.length > 0 ? (
                    studentData.friend_relationships.map((friend, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-stone-100 text-stone-700 rounded-md">
                        {friend.friend_name} ({friend.closeness_level || 'acquaintance'})
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-stone-500">No friend relationships recorded</p>
                  )}
                </div>
              </div>
              {studentData.overview?.is_swan && (
                <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
                  <h4 className="text-sm font-medium text-amber-900 mb-1">SWAN Status</h4>
                  <p className="text-sm text-amber-800">
                    Student is under SWAN (Student With Additional Needs) monitoring and receiving appropriate support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Private Notes */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Private Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studentData.private_notes.length > 0 ? (
                studentData.private_notes.map((note) => (
                  <div key={note.id} className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
                    <p className="text-sm text-stone-800 whitespace-pre-wrap">{note.note}</p>
                    <p className="text-xs text-stone-500 mt-2">
                      Last updated: {new Date(note.updated_at).toLocaleDateString('en-SG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-500">No private notes recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Academic Results */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Academic Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentData.academic_results.length > 0 ? (
                  studentData.academic_results.slice(0, 10).map((result, index) => {
                    // Calculate correct grade based on HDP standards
                    const percentage = result.percentage || (result.score && result.max_score ? calculatePercentage(result.score, result.max_score) : 0)
                    const grade = getLetterGrade(percentage)

                    return (
                      <div key={result.id} className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-stone-900">{result.assessment_name}</p>
                          <p className="text-xs text-stone-500">
                            {new Date(result.assessment_date).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}
                            {result.term && ` • ${result.term}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-stone-600">{result.score}/{result.max_score}</span>
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-900">
                            {grade}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-stone-500">No academic results recorded</p>
                )}
              </div>
            </CardContent>
          </Card>



        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          {/* Attendance Summary */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-green-600">{studentData.attendance.present}</p>
                  <p className="text-xs text-stone-500">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-red-600">{studentData.attendance.absent}</p>
                  <p className="text-xs text-stone-500">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-amber-600">{studentData.attendance.late}</p>
                  <p className="text-xs text-stone-500">Late</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-blue-600">{studentData.attendance.early_dismissal}</p>
                  <p className="text-xs text-stone-500">Early Dismissal</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-stone-900">{studentData.attendance.attendance_rate}%</p>
                  <p className="text-xs text-stone-500">Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendance Records */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {studentData.attendance.recent_records.length > 0 ? (
                  studentData.attendance.recent_records.map((record, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-stone-900">
                          {new Date(record.date).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {record.reason && (
                          <p className="text-xs text-stone-500">{record.reason}</p>
                        )}
                      </div>
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        record.status === 'present' && 'bg-green-100 text-green-800',
                        record.status === 'absent' && 'bg-red-100 text-red-800',
                        record.status === 'late' && 'bg-amber-100 text-amber-800',
                        record.status === 'early_dismissal' && 'bg-blue-100 text-blue-800'
                      )}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No attendance records</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social & Behaviour Tab */}
        <TabsContent value="social-behaviour" className="space-y-6">
          {/* Behaviour Observations */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Behaviour Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentData.behaviour_observations.length > 0 ? (
                  studentData.behaviour_observations.map((obs, index) => (
                    <div key={obs.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-stone-900">{obs.title}</p>
                          <p className="text-xs text-stone-500">
                            {new Date(obs.observation_date).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            obs.category === 'positive' && 'bg-green-100 text-green-800',
                            obs.category === 'concern' && 'bg-amber-100 text-amber-800',
                            obs.category === 'neutral' && 'bg-stone-100 text-stone-800'
                          )}>
                            {obs.category}
                          </span>
                          {obs.severity && (
                            <span className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              obs.severity === 'low' && 'bg-blue-100 text-blue-800',
                              obs.severity === 'medium' && 'bg-amber-100 text-amber-800',
                              obs.severity === 'high' && 'bg-red-100 text-red-800'
                            )}>
                              {obs.severity}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-stone-600 mb-2">{obs.description}</p>
                      {obs.action_taken && (
                        <p className="text-xs text-stone-500">
                          <span className="font-medium">Action taken:</span> {obs.action_taken}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No behaviour observations recorded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Friend Relationships */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Friend Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {studentData.friend_relationships.length > 0 ? (
                  studentData.friend_relationships.map((friend, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{friend.friend_name}</p>
                        {friend.notes && (
                          <p className="text-xs text-stone-500">{friend.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {friend.closeness_level && (
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            friend.closeness_level === 'very_close' && 'bg-purple-100 text-purple-800',
                            friend.closeness_level === 'close' && 'bg-blue-100 text-blue-800',
                            friend.closeness_level === 'acquaintance' && 'bg-stone-100 text-stone-800'
                          )}>
                            {friend.closeness_level.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No friend relationships recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases" className="space-y-6">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Student Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentData.cases.length > 0 ? (
                  studentData.cases.map((caseItem, index) => (
                    <div key={caseItem.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-stone-900">{caseItem.title}</p>
                          <p className="text-xs text-stone-500">{caseItem.case_number}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            caseItem.case_type === 'discipline' && 'bg-red-100 text-red-800',
                            caseItem.case_type === 'counselling' && 'bg-blue-100 text-blue-800',
                            caseItem.case_type === 'sen' && 'bg-purple-100 text-purple-800',
                            caseItem.case_type === 'career_guidance' && 'bg-green-100 text-green-800'
                          )}>
                            {caseItem.case_type.replace('_', ' ')}
                          </span>
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            caseItem.status === 'open' && 'bg-amber-100 text-amber-800',
                            caseItem.status === 'in_progress' && 'bg-blue-100 text-blue-800',
                            caseItem.status === 'closed' && 'bg-green-100 text-green-800'
                          )}>
                            {caseItem.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {caseItem.description && (
                        <p className="text-sm text-stone-600 mb-2">{caseItem.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <span>
                          Opened: {new Date(caseItem.opened_date).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        {caseItem.closed_date && (
                          <span>
                            Closed: {new Date(caseItem.closed_date).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {caseItem.severity && (
                          <span className="capitalize">Severity: {caseItem.severity}</span>
                        )}
                        {caseItem.guardian_notified && (
                          <span className="text-green-600">✓ Guardian Notified</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No cases recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PageLayout>
  )
}

// ============================================================================
// Skeleton Components
// ============================================================================

function StudentProfileCardSkeleton() {
  return (
    <Card className="border-stone-200">
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
