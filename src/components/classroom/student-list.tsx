'use client'

import { useState, useMemo } from 'react'
import { ArrowLeftIcon, ChevronDownIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
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
import { getClassById, getStudentsByClassId } from '@/lib/mock-data/classroom-data'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { PageLayout } from '@/components/layout/page-layout'

interface StudentListProps {
  classId: string
  onBack?: () => void
  onStudentClick?: (studentName: string) => void
  onNavigate?: (path: string, replaceTab?: boolean) => void
  classroomTabs?: Map<string, string>
}

type SortField = 'attendance_rate' | 'name' | 'english' | 'math' | 'science' | 'conduct_grade'
type SortOrder = 'asc' | 'desc'

export function StudentList({ classId, onBack, onStudentClick, onNavigate, classroomTabs }: StudentListProps) {
  const classData = getClassById(classId)
  const students = getStudentsByClassId(classId)

  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter and sort students - must be before early return
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
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
        case 'attendance_rate':
          compareValue = a.attendance_rate - b.attendance_rate
          break
        case 'english':
        case 'math':
        case 'science':
          compareValue = (a.grades[sortField] || 0) - (b.grades[sortField] || 0)
          break
        case 'conduct_grade':
          compareValue = a.conduct_grade.localeCompare(b.conduct_grade)
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })
  }, [filteredStudents, sortField, sortOrder])

  if (!classData) {
    return <div>Class not found</div>
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.student_id))
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
    <PageLayout
      title="Students"
      subtitle={`Class ${classData.class_name} · ${classData.subject}`}
      backButton={
        onBack
          ? {
              label: 'Back to Class Overview',
              onClick: onBack,
              icon: ArrowLeftIcon,
            }
          : undefined
      }
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
                  <DropdownMenuItem onClick={() => handleSort('attendance_rate')}>Attendance</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('english')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('math')}>Math</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('science')}>Science</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('conduct_grade')}>Conduct</DropdownMenuItem>
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
                    checked={selectedStudents.length === sortedStudents.length && sortedStudents.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Name</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Attendance</TableHead>
                <TableHead className="text-xs font-medium text-stone-500 text-center">English</TableHead>
                <TableHead className="text-xs font-medium text-stone-500 text-center">Math</TableHead>
                <TableHead className="text-xs font-medium text-stone-500 text-center">Science</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Conduct grade</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Remark</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student) => (
                <TableRow
                  key={student.student_id}
                  className={onStudentClick ? 'cursor-pointer' : ''}
                  onClick={() => onStudentClick?.(student.name)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedStudents.includes(student.student_id)}
                      onCheckedChange={(checked) => handleSelectStudent(student.student_id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${getAvatarColor(student.name)}`}>
                        {getInitials(student.name)}
                      </div>
                      <span className="font-medium text-stone-900">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-stone-900">{student.attendance_rate}%</TableCell>
                  <TableCell className="text-center text-stone-900">{student.grades.english || '-'}</TableCell>
                  <TableCell className="text-center text-stone-900">{student.grades.math || '-'}</TableCell>
                  <TableCell className="text-center text-stone-900">{student.grades.science || '-'}</TableCell>
                  <TableCell>
                    <span className={getConductColor(student.conduct_grade)}>{student.conduct_grade}</span>
                  </TableCell>
                  <TableCell>
                    {student.status !== 'None' ? (
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    ) : (
                      <span className="text-stone-500">None</span>
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
