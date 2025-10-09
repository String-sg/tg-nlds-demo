'use client'

import { useRouter } from 'next/navigation'
import { MailIcon, PhoneIcon, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CaseManagementTable } from '@/components/case-management-table'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import { PageLayout } from '@/components/layout/page-layout'
import { StudentRecordsTimeline } from '@/components/records/student-records-timeline'
import { ReportSlip } from '@/components/student/report-slip'
import { getStudentByName } from '@/lib/mock-data/classroom-data'

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

  // Fetch real student data based on studentName
  const studentData = getStudentByName(studentName)

  // Map real student data to component format, or use fallback if not found
  const student = studentData ? {
    name: studentData.name,
    id: studentData.student_id,
    class: studentData.class_name,
    attendance: studentData.attendance_rate,
    english: studentData.grades.english || 0,
    math: studentData.grades.math || 0,
    science: studentData.grades.science || 0,
    conduct: studentData.conduct_grade,
    status: studentData.status,
    parentName: studentData.parent_name,
    parentEmail: studentData.parent_email,
    parentPhone: studentData.parent_phone,
    background: {
      healthDeclaration: studentData.health_declaration || 'No health declaration on file.',
      friendsMapping: studentData.friends || [],
      familyBackground: studentData.family_background || 'No family background information available.',
      housingAndFinance: 'Information not available' // Not in current student data structure
    },
    attendanceDetails: {
      daily: `${studentData.attendance_rate}% this term`,
      temperature: 'Normal range',
      cca: 'Information not available',
      schoolEvents: 'Information not available',
      earlyDismissal: 'None this term'
    },
    studentNeeds: {
      counselling: studentData.needs_counselling || false,
      disciplinary: studentData.has_disciplinary_issues || false,
      sen: studentData.has_sen || false,
      senDetails: studentData.has_sen
        ? `Student is under ${studentData.status === 'SWAN' ? 'SWAN (Student With Additional Needs)' : 'SEN'} monitoring and receiving appropriate support.`
        : null
    },
    recentActivities: studentData.name === 'Eric Lim' ? [
      { date: '2025-01-20', activity: 'Term 1 Math Test', grade: 'C+' },
      { date: '2025-01-15', activity: 'English Essay - "My Future Goals"', grade: 'B-' },
      { date: '2025-01-10', activity: 'Science Practical Assessment', grade: 'C' },
      { date: '2024-12-18', activity: 'End of Year Math Exam', grade: 'C+' },
      { date: '2024-12-15', activity: 'Chinese Oral Examination', grade: 'C' },
    ] : [] as Array<{ date: string; activity: string; grade: string }>,
    strengths: studentData.name === 'Eric Lim' ? [
      'Polite and respectful to teachers and peers',
      'Consistently completes homework despite emotional challenges',
      'Shows resilience in attending school regularly despite stress',
      'Thoughtful and introspective in counseling sessions',
      'Maintains average conduct grade despite personal difficulties'
    ] : [] as string[],
    areasForImprovement: studentData.name === 'Eric Lim' ? [
      'Academic performance - grades declined from 78% to 64% average (-14 points)',
      'Social engagement - very limited peer interactions outside of Daniel Koh',
      'Emotional regulation - managing anxiety and stress in academic settings',
      'Self-advocacy - building confidence to ask for help when needed',
      'Work-life balance - reducing stress from excessive self-imposed pressure'
    ] : [] as string[],
    notes: studentData.needs_counselling
      ? 'Student is currently receiving counselling support. Please check Records tab for detailed notes.'
      : 'No special notes at this time.',
  } : {
    // Fallback data if student not found
    name: studentName,
    id: 'N/A',
    class: 'Unknown',
    attendance: 0,
    english: 0,
    math: 0,
    science: 0,
    conduct: 'N/A',
    status: 'None',
    parentName: 'N/A',
    parentEmail: 'N/A',
    parentPhone: 'N/A',
    background: {
      healthDeclaration: 'No data available',
      friendsMapping: [],
      familyBackground: 'No data available',
      housingAndFinance: 'No data available'
    },
    attendanceDetails: {
      daily: 'No data available',
      temperature: 'No data available',
      cca: 'No data available',
      schoolEvents: 'No data available',
      earlyDismissal: 'No data available'
    },
    studentNeeds: {
      counselling: false,
      disciplinary: false,
      sen: false,
      senDetails: null
    },
    recentActivities: [] as Array<{ date: string; activity: string; grade: string }>,
    strengths: [] as string[],
    areasForImprovement: [] as string[],
    notes: 'Student data not found.',
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
        return 'text-green-600'
      case 'Above average':
        return 'text-stone-900'
      case 'Average':
        return 'text-stone-600'
      case 'Needs improvement':
        return 'text-amber-600'
      default:
        return 'text-stone-600'
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="report-slip">Report Slip</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
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
              <CardTitle className="text-base font-medium text-stone-900">Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-stone-900 mb-1">Health Declaration</h4>
                <p className="text-sm text-stone-600">{student.background.healthDeclaration}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-stone-900 mb-1">Friends Mapping</h4>
                <div className="flex flex-wrap gap-2">
                  {student.background.friendsMapping.map((friend, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs bg-stone-100 text-stone-700 rounded-md">
                      {friend}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-stone-900 mb-1">Family Background</h4>
                <p className="text-sm text-stone-600">{student.background.familyBackground}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-stone-900 mb-1">Housing and Finance</h4>
                <p className="text-sm text-stone-600">{student.background.housingAndFinance}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6">
          {/* Academic Performance */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">English</span>
                <span className="text-sm font-semibold text-stone-900">{student.english}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Math</span>
                <span className="text-sm font-semibold text-stone-900">{student.math}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Science</span>
                <span className="text-sm font-semibold text-stone-900">{student.science}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-stone-600">Conduct Grade</span>
                <span className={cn('text-sm font-semibold', getConductColor(student.conduct))}>
                  {student.conduct}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-stone-900">{activity.activity}</p>
                      <p className="text-xs text-stone-500">{new Date(activity.date).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-900">
                      {activity.grade}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {student.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-stone-900">
                    <span className="text-green-600">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {student.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-stone-900">
                    <span className="text-amber-600">→</span>
                    {area}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-base font-medium text-stone-900">Attendance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <h4 className="text-sm font-medium text-stone-900">Daily</h4>
                <p className="text-sm text-stone-600">{student.attendanceDetails.daily}</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <h4 className="text-sm font-medium text-stone-900">Temperature</h4>
                <p className="text-sm text-stone-600">{student.attendanceDetails.temperature}</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <h4 className="text-sm font-medium text-stone-900">CCA</h4>
                <p className="text-sm text-stone-600">{student.attendanceDetails.cca}</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <h4 className="text-sm font-medium text-stone-900">School Events</h4>
                <p className="text-sm text-stone-600">{student.attendanceDetails.schoolEvents}</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <h4 className="text-sm font-medium text-stone-900">Early Dismissal</h4>
                <p className="text-sm text-stone-600">{student.attendanceDetails.earlyDismissal}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavioral & Wellness Tab */}
        <TabsContent value="wellness" className="space-y-6">
          <Card className="border-stone-200">
            <CardContent className="pt-6">
              <div className="grid gap-3 md:grid-cols-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-xs",
                    student.studentNeeds.counselling ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                  )}>
                    {student.studentNeeds.counselling ? '!' : '✓'}
                  </span>
                  <span className="text-sm text-stone-900">Counselling / Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-xs",
                    student.studentNeeds.disciplinary ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                  )}>
                    {student.studentNeeds.disciplinary ? '!' : '✓'}
                  </span>
                  <span className="text-sm text-stone-900">Disciplinary Offences</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-xs",
                    student.studentNeeds.sen ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                  )}>
                    {student.studentNeeds.sen ? '!' : '✓'}
                  </span>
                  <span className="text-sm text-stone-900">Socio-emotional Needs (SEN)</span>
                </div>
              </div>
              {student.studentNeeds.senDetails && (
                <div className="rounded-md bg-amber-50 p-3">
                  <p className="text-sm text-amber-900">{student.studentNeeds.senDetails}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-stone-900 mb-2">Teacher Notes</h4>
                <p className="text-sm text-stone-600">{student.notes}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-6">
          <StudentRecordsTimeline
            studentName={student.name}
            studentId={student.id}
          />
        </TabsContent>

        {/* Report Slip Tab */}
        <TabsContent value="report-slip" className="space-y-6">
          <ReportSlip
            studentId={student.id}
            studentName={student.name}
            class={student.class}
          />
        </TabsContent>

        {/* Case Management Tab */}
        <TabsContent value="cases" className="space-y-6">
          <CaseManagementTable studentFilter={student.name} />
        </TabsContent>
      </Tabs>
      </div>
    </PageLayout>
  )
}
