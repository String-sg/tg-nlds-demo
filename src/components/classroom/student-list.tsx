'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronDownIcon, MoreHorizontalIcon, SearchIcon, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { getInitials, getAvatarColor } from '@/lib/utils'
import { PageLayout } from '@/components/layout/page-layout'
import { Skeleton } from '@/components/ui/skeleton'

interface StudentListProps {
  classId: string
  onBack?: () => void
  onStudentClick?: (studentName: string) => void
  onNavigate?: (path: string, replaceTab?: boolean) => void
  classroomTabs?: Map<string, string>
}

type SortField = 'attendanceRate' | 'name' | 'overallAverage' | 'conductGrade'
type SortOrder = 'asc' | 'desc'

interface DbStudent {
  id: string
  name: string
  yearLevel: number
  className: string
  status: string
  conductGrade: string
  attendanceRate: number
  overallAverage: number | null
  parents: Array<{
    parent: {
      name: string
      email: string
      phone: string
    }
  }>
}

interface DbClass {
  id: string
  className: string
  subject: string
  yearLevel: number
  academicYear: string
  teacher: {
    name: string
  }
}

export function StudentList({ classId, onBack, onStudentClick, onNavigate, classroomTabs }: StudentListProps) {
  const [classData, setClassData] = useState<DbClass | null>(null)
  const [students, setStudents] = useState<DbStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch class and student data from API
  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch class data
        const classResponse = await fetch(`/api/classes/${classId}`)
        if (!classResponse.ok) {
          if (classResponse.status === 404) {
            throw new Error('Class not found')
          }
          throw new Error('Failed to fetch class data')
        }
        const classJson = await classResponse.json()

        // Fetch students
        const studentsResponse = await fetch(`/api/classes/${classId}/students`)
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students')
        }
        const studentsJson = await studentsResponse.json()

        if (isMounted) {
          setClassData(classJson)
          setStudents(studentsJson)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [classId])

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [students, searchQuery, filterStatus])

  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let compareValue = 0

      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'attendanceRate':
          compareValue = a.attendanceRate - b.attendanceRate
          break
        case 'overallAverage':
          compareValue = (a.overallAverage || 0) - (b.overallAverage || 0)
          break
        case 'conductGrade':
          compareValue = a.conductGrade.localeCompare(b.conductGrade)
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })
  }, [filteredStudents, sortField, sortOrder])

  // Loading state
  if (isLoading) {
    return (
      <PageLayout title="Students" subtitle="Loading..." contentClassName="px-6 py-6">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <Card className="border-stone-200">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  // Error state
  if (error || !classData) {
    return (
      <PageLayout title="Students" subtitle="Error" contentClassName="px-6 py-6">
        <div className="mx-auto w-full max-w-6xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">
                  {error || 'Class not found'}
                </p>
                <p className="text-sm text-red-700">
                  {error === 'Class not found'
                    ? 'The class you are looking for does not exist in the database.'
                    : 'Please try again or contact support if the problem persists.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  // Empty state (no students)
  if (students.length === 0) {
    return (
      <PageLayout
        title="Students"
        subtitle={`Class ${classData.className} · ${classData.subject}`}
        contentClassName="px-6 py-6"
      >
        <div className="mx-auto w-full max-w-6xl">
          <Card className="border-stone-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-stone-100 p-3">
                <AlertCircle className="h-6 w-6 text-stone-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-stone-900">No students found</h3>
              <p className="mt-2 text-sm text-stone-600">
                This class does not have any enrolled students yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map((s) => s.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId])
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GEP':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'SEN':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return ''
    }
  }

  const getConductColor = (conduct: string) => {
    switch (conduct) {
      case 'EXCELLENT':
        return 'text-green-600'
      case 'ABOVE_AVERAGE':
        return 'text-stone-900'
      case 'AVERAGE':
        return 'text-stone-600'
      case 'NEEDS_IMPROVEMENT':
        return 'text-amber-600'
      default:
        return 'text-stone-600'
    }
  }

  const formatConductGrade = (conduct: string) => {
    switch (conduct) {
      case 'EXCELLENT':
        return 'Excellent'
      case 'ABOVE_AVERAGE':
        return 'Above Average'
      case 'AVERAGE':
        return 'Average'
      case 'NEEDS_IMPROVEMENT':
        return 'Needs Improvement'
      default:
        return conduct
    }
  }


  return (
    <PageLayout
      title="Students"
      subtitle={`Class ${classData.className} · ${classData.subject}`}
      contentClassName="px-6 py-6"
    >
      <div className="mx-auto w-full max-w-6xl space-y-6">

      {/* Students Table */}
      <Card className="border-stone-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-stone-900">
              {sortedStudents.length} student{sortedStudents.length !== 1 ? 's' : ''}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-64 pl-8"
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
                  <DropdownMenuItem onClick={() => handleSort('attendanceRate')}>
                    Attendance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('overallAverage')}>
                    Overall Average
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('conductGrade')}>Conduct</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedStudents.length === sortedStudents.length && sortedStudents.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Name</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Attendance</TableHead>
                <TableHead className="text-center text-xs font-medium text-stone-500">
                  Overall Average
                </TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Conduct Grade</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className={onStudentClick ? 'cursor-pointer' : ''}
                  onClick={() => onStudentClick?.(student.name)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) =>
                        handleSelectStudent(student.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${getAvatarColor(student.name)}`}
                      >
                        {getInitials(student.name)}
                      </div>
                      <span className="font-medium text-stone-900">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-stone-900">
                    {student.attendanceRate}%
                  </TableCell>
                  <TableCell className="text-center text-stone-900">
                    {student.overallAverage?.toFixed(1) || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={getConductColor(student.conductGrade)}>
                      {formatConductGrade(student.conductGrade)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {student.status !== 'NONE' ? (
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(student.status)}`}
                      >
                        {student.status}
                      </span>
                    ) : (
                      <span className="text-stone-500">-</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onStudentClick?.(student.name)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit record</DropdownMenuItem>
                        <DropdownMenuItem>Send message</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </PageLayout>
  )
}
