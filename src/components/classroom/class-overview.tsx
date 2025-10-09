'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  HomeIcon,
  SearchIcon,
  ChevronDownIcon,
  InfoIcon,
  PencilIcon,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getClassOverviewStats,
  currentUser,
} from '@/lib/mock-data/classroom-data'
import { cn, getInitials } from '@/lib/utils'
import { PageLayout } from '@/components/layout/page-layout'

interface ClassOverviewProps {
  classId: string
  onBack?: () => void
  onNavigateToGrades?: (classId: string) => void
  onStudentClick?: (studentName: string) => void
  onNavigate?: (path: string, replaceTab?: boolean) => void
  classroomTabs?: Map<string, string>
}

// Database types
interface DbClass {
  id: string
  className: string
  subject: string
  yearLevel: number
  academicYear: string
  isFormClass: boolean
  schedules?: Array<{
    day: string
    startTime: string
    endTime: string
    location: string
  }>
}

interface DbStudent {
  id: string
  name: string
  status: 'NONE' | 'GEP' | 'SEN' | 'IEP'
  conductGrade: 'NONE' | 'EXCELLENT' | 'GOOD' | 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE' | 'POOR' | 'NEEDS_IMPROVEMENT'
  attendanceRate: number
  overallAverage: number
}

export function ClassOverview({ classId, onBack, onNavigateToGrades, onStudentClick, onNavigate, classroomTabs }: ClassOverviewProps) {
  const stats = getClassOverviewStats(classId)
  const [classData, setClassData] = useState<DbClass | null>(null)
  const [students, setStudents] = useState<DbStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortField, setSortField] = useState<'name' | 'attendanceRate' | 'overallAverage' | 'conductGrade'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Fetch class and student data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch class data
        const classRes = await fetch(`/api/classes/${classId}`)
        if (!classRes.ok) {
          if (classRes.status === 404) {
            throw new Error('Class not found')
          }
          throw new Error('Failed to fetch class data')
        }
        const classJson = await classRes.json()
        setClassData(classJson)

        // Fetch students
        const studentsRes = await fetch(`/api/classes/${classId}/students`)
        if (!studentsRes.ok) {
          throw new Error('Failed to fetch students')
        }
        const studentsJson = await studentsRes.json()
        setStudents(studentsJson)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [classId])

  // Helper function to format conduct grade
  const formatConductGrade = (grade: DbStudent['conductGrade']): string => {
    const gradeMap: Record<DbStudent['conductGrade'], string> = {
      NONE: 'None',
      EXCELLENT: 'Excellent',
      GOOD: 'Good',
      ABOVE_AVERAGE: 'Above Average',
      AVERAGE: 'Average',
      BELOW_AVERAGE: 'Below Average',
      POOR: 'Poor',
      NEEDS_IMPROVEMENT: 'Needs Improvement',
    }
    return gradeMap[grade] || grade
  }

  // Filter and sort students - must be before early return
  const filteredStudents = useMemo(() => {
    // Filter by search
    const filtered = students.filter(student => {
      const matchesSearch = !searchQuery.trim() ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus
      return matchesSearch && matchesStatus
    })

    // Sort
    return [...filtered].sort((a, b) => {
      let compareValue = 0

      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'attendanceRate':
          compareValue = a.attendanceRate - b.attendanceRate
          break
        case 'overallAverage':
          compareValue = a.overallAverage - b.overallAverage
          break
        case 'conductGrade':
          compareValue = a.conductGrade.localeCompare(b.conductGrade)
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })
  }, [students, searchQuery, filterStatus, sortField, sortOrder])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Handle loading state
  if (isLoading) {
    return (
      <PageLayout title="" subtitle={<Skeleton className="h-8 w-48" />} contentClassName="px-6 py-6">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[140px]" />
            <Skeleton className="h-[140px]" />
            <Skeleton className="h-[140px]" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </PageLayout>
    )
  }

  // Handle error state
  if (error || !classData) {
    return (
      <PageLayout title="" subtitle="Class Overview" contentClassName="px-6 py-6">
        <div className="mx-auto w-full max-w-5xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 p-6">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">{error || 'Class not found'}</h3>
                <p className="text-sm text-red-700 mt-1">
                  {error === 'Class not found'
                    ? 'The class you are looking for does not exist.'
                    : 'Unable to load class data. Please try again later.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  const isFormClass = classData.isFormClass

  // Title with badge and info button
  const titleElement = (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-700">
        {classData.className}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-semibold">Class {classData.className}</span>
        {isFormClass && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
            <HomeIcon className="h-3 w-3 mr-1" />
            Form Class
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setShowDetails(true)}
        >
          <InfoIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <PageLayout
      title=""
      subtitle={titleElement}
      contentClassName="px-6 py-6"
      headerClassName="border-b-0"
    >
      <TooltipProvider>
        <div className="mx-auto w-full max-w-5xl space-y-6">

      {/* Class Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-semibold">Class Details</DialogTitle>
                <DialogDescription>
                  Detailed information about Class {classData.className}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  // TODO: Implement edit class functionality
                }}
              >
                <PencilIcon className="h-4 w-4" />
                Edit Class
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-2">Subject</h3>
              <p className="text-base text-stone-900">{classData.subject}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-stone-500 mb-2">Year Level</h3>
                <p className="text-base text-stone-900">Year {classData.yearLevel}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-stone-500 mb-2">Total Students</h3>
                <p className="text-base text-stone-900">{students.length} students</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-2">Teacher</h3>
              <p className="text-base text-stone-900">
                {currentUser.name}
                {isFormClass && ' (Form Teacher)'}
              </p>
            </div>
            {classData.schedules && classData.schedules.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-stone-500 mb-2">Schedule</h3>
                <div className="space-y-2">
                  <p className="text-base text-stone-900">
                    <span className="font-medium">Days:</span> {classData.schedules.map((s) => s.day).join(', ')}
                  </p>
                  <p className="text-base text-stone-900">
                    <span className="font-medium">Time:</span> {classData.schedules[0].startTime} - {classData.schedules[0].endTime}
                  </p>
                  <p className="text-base text-stone-900">
                    <span className="font-medium">Location:</span> {classData.schedules[0].location}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick pulse - Natural Language Summary */}
      {/* TODO: Update stats to fetch from database */}
      {stats && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Quick pulse</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Attendance */}
            <Card className="border-stone-200">
              <CardContent className="p-4 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide">Attendance</h3>
                  <Badge
                    variant={stats.attendance.rate >= 90 ? "default" : "secondary"}
                    className={stats.attendance.rate >= 90 ? "bg-green-100 text-green-800 border-green-300" : "bg-amber-100 text-amber-800 border-amber-300"}
                  >
                    {stats.attendance.rate >= 90 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
                <p className="text-stone-700 leading-relaxed mt-auto">
                  <span className={stats.attendance.rate >= 90 ? 'text-green-700 font-semibold text-lg' : 'text-amber-700 font-semibold text-lg'}>
                    {stats.attendance.present} of {students.length}
                  </span>{' '}
                  students are present today
                  {stats.attendance.absent > 0 && (
                    <>
                      {', with '}
                      <span className="font-medium">{stats.attendance.absent} absent</span>
                    </>
                  )}
                  {stats.attendance.late > 0 && (
                    <>
                      {' and '}
                      <span className="font-medium">{stats.attendance.late} late</span>
                    </>
                  )}.
                </p>
              </CardContent>
            </Card>

            {/* Academic Status */}
            <Card className="border-stone-200">
              <CardContent className="p-4 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide">Academic Status</h3>
                  {isFormClass && (
                    <Badge
                      variant={stats.academic.class_average >= 75 ? "default" : "secondary"}
                      className={stats.academic.class_average >= 75 ? "bg-green-100 text-green-800 border-green-300" : "bg-amber-100 text-amber-800 border-amber-300"}
                    >
                      {stats.academic.class_average >= 75 ? "On Track" : "Needs Improvement"}
                    </Badge>
                  )}
                </div>
                <p className="text-stone-700 leading-relaxed mt-auto">
                  {isFormClass ? (
                    <>
                      Class average is{' '}
                      <span className="font-semibold text-lg text-stone-900">{stats.academic.class_average.toFixed(1)}%</span>.{' '}
                    </>
                  ) : (
                    <>Performance tracking available for form classes only. </>
                  )}
                  {stats.academic.pending_grades > 0 && (
                    <>
                      <span className="font-medium text-blue-700">{stats.academic.pending_grades} assignments</span> pending grading.
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card className="border-stone-200">
              <CardContent className="p-4 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide">Alerts</h3>
                  <Badge
                    variant={stats.alerts.urgent > 0 ? "destructive" : stats.alerts.total > 0 ? "secondary" : "default"}
                    className={
                      stats.alerts.urgent > 0
                        ? "bg-red-100 text-red-800 border-red-300"
                        : stats.alerts.total > 0
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-green-100 text-green-800 border-green-300"
                    }
                  >
                    {stats.alerts.urgent > 0 ? "Urgent" : stats.alerts.total > 0 ? "Attention Needed" : "All Clear"}
                  </Badge>
                </div>
                <p className="text-stone-700 leading-relaxed mt-auto">
                  {stats.alerts.total > 0 ? (
                    <>
                      {stats.alerts.urgent > 0 ? (
                        <>
                          <span className="font-semibold text-lg text-red-700">{stats.alerts.urgent} urgent</span>{' '}
                          {stats.alerts.urgent === 1 ? 'alert needs' : 'alerts need'} immediate attention
                          {stats.alerts.high > 0 && (
                            <>
                              {', with '}
                              <span className="font-medium">{stats.alerts.high} high priority</span>
                            </>
                          )}.
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-lg text-amber-700">{stats.alerts.total}</span>{' '}
                          {stats.alerts.total === 1 ? 'alert' : 'alerts'} need attention.
                        </>
                      )}
                    </>
                  ) : (
                    <>No active alerts at this time.</>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Student List */}
      <Card className="border-stone-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-stone-900">
              Students ({filteredStudents.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    Filter <ChevronDownIcon className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('GEP')}>GEP</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('SEN')}>SEN</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('None')}>None</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    Sort <ChevronDownIcon className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSort('name')}>Name</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('attendanceRate')}>Attendance</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('overallAverage')}>Average</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('conductGrade')}>Conduct</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-32">Attendance</TableHead>
                  <TableHead className="w-32">Average</TableHead>
                  <TableHead className="w-32">Conduct</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <TableRow
                      key={student.id}
                      className="cursor-pointer hover:bg-stone-50"
                      onClick={() => onStudentClick?.(student.name)}
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          student.attendanceRate >= 90 ? "text-green-600" :
                          student.attendanceRate >= 75 ? "text-amber-600" : "text-red-600"
                        )}>
                          {student.attendanceRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          student.overallAverage >= 75 ? "text-green-600" :
                          student.overallAverage >= 50 ? "text-amber-600" : "text-red-600"
                        )}>
                          {student.overallAverage.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.conductGrade === 'EXCELLENT' || student.conductGrade === 'GOOD' || student.conductGrade === 'ABOVE_AVERAGE'
                              ? 'default'
                              : student.conductGrade === 'NEEDS_IMPROVEMENT' || student.conductGrade === 'POOR'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {formatConductGrade(student.conductGrade)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.status !== 'NONE' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-help">
                                {student.status}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {student.status === 'GEP'
                                  ? 'Gifted Education Programme'
                                  : student.status === 'SEN'
                                  ? 'Special Educational Needs'
                                  : student.status === 'IEP'
                                  ? 'Individualized Education Plan'
                                  : student.status}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-stone-500 py-8">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </div>
      </TooltipProvider>
    </PageLayout>
  )
}
