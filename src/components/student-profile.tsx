'use client'

import { ArrowLeftIcon, MailIcon, PhoneIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CaseManagementTable } from '@/components/case-management-table'
import { cn } from '@/lib/utils'

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Helper function to get consistent color for avatar based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
  ]

  // Generate a consistent hash from the name
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

interface StudentProfileProps {
  studentName: string
  classId?: string
  onBack?: () => void
}

export function StudentProfile({ studentName, classId, onBack }: StudentProfileProps) {
  // Mock student data - in a real app, this would be fetched based on studentName
  const student = {
    name: studentName,
    id: 'S2025001',
    class: 'Primary 4A',
    attendance: 98,
    english: 88,
    math: 76,
    science: 82,
    conduct: 'Above average',
    status: 'GEP',
    parentName: 'Mr. & Mrs. ' + studentName.split(' ').slice(-1)[0],
    parentEmail: studentName.toLowerCase().replace(/\s+/g, '.') + '@email.com',
    parentPhone: '+65 9123 4567',
    background: {
      healthDeclaration: 'No known allergies. Requires inhaler for asthma during physical activities.',
      friendsMapping: ['Sarah Chen', 'Marcus Wong', 'Emily Tan'],
      familyBackground: 'Lives with both parents and one younger sibling. Mother is a teacher, father works in finance. Supportive home environment.',
      housingAndFinance: 'HDB 4-room flat. Middle-income family. No financial assistance required.'
    },
    attendanceDetails: {
      daily: '98% (23/24 days present this month)',
      temperature: 'Normal range (36.5°C - 37.0°C)',
      cca: 'Robotics Club - 100% attendance',
      schoolEvents: 'Attended all events this term',
      earlyDismissal: 'None this term'
    },
    studentNeeds: {
      counselling: false,
      disciplinary: false,
      sen: false,
      senDetails: null
    },
    recentActivities: [
      { date: '2025-09-28', activity: 'Completed Math Assignment 5', grade: 'A' },
      { date: '2025-09-25', activity: 'Science Project Presentation', grade: 'B+' },
      { date: '2025-09-20', activity: 'English Essay Submission', grade: 'A-' },
    ],
    strengths: ['Mathematics', 'Critical thinking', 'Team collaboration'],
    areasForImprovement: ['Time management', 'Reading comprehension'],
    notes: 'Shows consistent improvement in class participation. Parents are supportive and engaged.',
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GEP':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'SEN':
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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      {/* Header with back button */}
      <div className="flex items-center gap-4 pt-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      {/* Student Info Header */}
      <Card className="border-stone-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Avatar and basic info */}
            <div className="flex items-start gap-4">
              <div className={cn(
                'flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-medium',
                getAvatarColor(student.name)
              )}>
                {getInitials(student.name)}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-stone-900">{student.name}</h1>
                  {student.status !== 'None' && (
                    <span className={cn(
                      'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                      getStatusColor(student.status)
                    )}>
                      {student.status}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-sm text-stone-600">
                  <p>Student ID: {student.id}</p>
                  <p>Class: {student.class}</p>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="ml-auto grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-stone-500">Attendance</span>
                <span className="text-lg font-semibold text-stone-900">{student.attendance}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-stone-500">English</span>
                <span className="text-lg font-semibold text-stone-900">{student.english}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-stone-500">Math</span>
                <span className="text-lg font-semibold text-stone-900">{student.math}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-stone-500">Science</span>
                <span className="text-lg font-semibold text-stone-900">{student.science}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
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
                <Button variant="outline" size="sm" className="w-full">
                  Contact Parent
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

        {/* Case Management Tab */}
        <TabsContent value="cases" className="space-y-6">
          <CaseManagementTable studentFilter={student.name} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
