'use client'

import { useRouter } from 'next/navigation'
import { MailIcon, PhoneIcon, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { CaseManagementTable } from '@/components/case-management-table'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import { PageLayout } from '@/components/layout/page-layout'
import { ReportSlip } from '@/components/student/report-slip'
import { useStudentProfile } from '@/hooks/use-student-profile'

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
  const { student: studentData, loading, error } = useStudentProfile(studentName)

  if (loading) {
    return (
      <PageLayout
        title="Loading..."
        subtitle={<Skeleton className="h-4 w-64 mt-1" />}
        titlePrefix={<Skeleton className="h-16 w-16 rounded-full" />}
        titleSuffix={<Skeleton className="h-6 w-16 rounded-full" />}
        headerContent={
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 w-8" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 w-8" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-8" />
            </div>
          </div>
        }
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
    conduct: studentData.overview?.conduct_grade || 'N/A',
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

  const getConductColor = (conduct: string) => {
    switch (conduct) {
      case 'Excellent':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Very Good':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Good':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'Fair':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Poor':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-stone-100 text-stone-600 border-stone-300'
    }
  }


  const avatar = (
    <div className={cn(
      'flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-medium',
      getAvatarColor(student.name)
    )}>
      {getInitials(student.name)}
    </div>
  )

  const badge = student.status !== 'None' ? (
    <span className={cn(
      'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
      getStatusColor(student.status)
    )}>
      {student.status}
    </span>
  ) : null

  const statsContent = (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-stone-500">Attendance</span>
        <span className="text-lg font-semibold text-stone-900">{student.attendance}%</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-stone-500">English</span>
        <span className="text-lg font-semibold text-stone-900">{student.english}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-stone-500">Math</span>
        <span className="text-lg font-semibold text-stone-900">{student.math}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-stone-500">Science</span>
        <span className="text-lg font-semibold text-stone-900">{student.science}</span>
      </div>
    </div>
  )

  return (
    <PageLayout
      title={student.name}
      subtitle={`Student ID: ${student.id} • Class: ${student.class}`}
      titlePrefix={avatar}
      titleSuffix={badge}
      headerContent={statsContent}
      contentClassName="px-6 py-6"
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="social-behaviour">Social & Behaviour</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
                  className="w-full"
                  onClick={() => {
                    // Check if conversation exists for this student
                    // In real app, would query backend to find or create conversation
                    // For now, navigate to inbox with conversation #1 as demo (Bryan Yeo's parents)
                    router.push('/inbox/conv-1')
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Parents
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
              {studentData.overview?.medical_conditions && (
                <div>
                  <h4 className="text-sm font-medium text-stone-900 mb-1">Medical Conditions</h4>
                  <p className="text-sm text-stone-600">{JSON.stringify(studentData.overview.medical_conditions)}</p>
                </div>
              )}
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

          {/* Conduct Grade */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Conduct Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500 mb-2">Overall Conduct Assessment</p>
                  <p className="text-xs text-stone-500">Based on attendance, behavior, and character development</p>
                </div>
                <span className={cn(
                  'inline-flex px-3 py-1.5 text-sm font-medium rounded-full border',
                  getConductColor(student.conduct)
                )}>
                  {student.conduct}
                </span>
              </div>
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
                  studentData.academic_results.slice(0, 10).map((result, index) => (
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
                          {result.grade}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No academic results recorded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CCE Results */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Character & Citizenship Education (CCE)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.cce_results.length > 0 ? (
                  studentData.cce_results.map((cce, index) => (
                    <div key={cce.id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-stone-900">{cce.term} {cce.academic_year}</p>
                        <span className="text-sm font-semibold text-stone-900">{cce.overall_grade}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-stone-500">Character:</span>{' '}
                          <span className="font-medium text-stone-900">{cce.character || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Citizenship:</span>{' '}
                          <span className="font-medium text-stone-900">{cce.citizenship || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Education:</span>{' '}
                          <span className="font-medium text-stone-900">{cce.education || 'N/A'}</span>
                        </div>
                      </div>
                      {cce.comments && (
                        <p className="text-sm text-stone-600 mt-2">{cce.comments}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No CCE results recorded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Physical Fitness */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Physical Fitness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.physical_fitness.length > 0 ? (
                  studentData.physical_fitness.map((fitness, index) => (
                    <div key={fitness.id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-stone-900">{fitness.assessment_type}</p>
                          <p className="text-xs text-stone-500">
                            {new Date(fitness.assessment_date).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          fitness.pass_status ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        )}>
                          {fitness.overall_grade || 'N/A'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(fitness.metrics as Record<string, unknown>).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-stone-500 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                            <span className="font-medium text-stone-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No fitness records available</p>
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <ReportSlip
            studentId={student.id}
            studentName={student.name}
            class={student.class}
          />
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
