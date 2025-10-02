'use client'

import { useState } from 'react'
import { ChevronDownIcon, MoreHorizontalIcon, BarChart3Icon, CalendarDaysIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
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

// Mock student data with Singaporean names
const studentsData = [
  { id: 1, name: 'Alice Wong', present: 98, english: 92, math: 88, science: 90, conduct: 'Excellent', status: 'None', remark: 'None' },
  { id: 2, name: 'Reza Halim', present: 95, english: 85, math: 82, science: 87, conduct: 'Above average', status: 'None', remark: 'None' },
  { id: 3, name: 'Tan Wei Jie', present: 100, english: 88, math: 76, science: 82, conduct: 'Above average', status: 'GEP', remark: 'None' },
  { id: 4, name: 'Lim Hui Ling', present: 50, english: 79, math: 85, science: 91, conduct: 'Average', status: 'SEN', remark: 'None' },
  { id: 5, name: 'Muhammad Iskandar', present: 98, english: 92, math: 88, science: 95, conduct: 'Excellent', status: 'GEP', remark: 'None' },
  { id: 6, name: 'Priya Krishnan', present: 98, english: 85, math: 91, science: 79, conduct: 'Above average', status: 'None', remark: 'None' },
  { id: 7, name: 'Wong Kai Xuan', present: 100, english: 91, math: 79, science: 85, conduct: 'Average', status: 'None', remark: 'None' },
  { id: 8, name: 'Siti Nurul Ain', present: 98, english: 76, math: 82, science: 88, conduct: 'Needs improvement', status: 'SEN', remark: 'None' },
  { id: 9, name: 'Chen Jia Yi', present: 70, english: 88, math: 76, science: 82, conduct: 'Above average', status: 'None', remark: 'None' },
  { id: 10, name: 'Rachel Ng', present: 100, english: 88, math: 76, science: 82, conduct: 'Above average', status: 'None', remark: 'None' },
  { id: 11, name: 'Ahmad Faisal', present: 92, english: 79, math: 91, science: 85, conduct: 'Above average', status: 'None', remark: 'None' },
  { id: 12, name: 'Nicholas Loh', present: 70, english: 92, math: 88, science: 95, conduct: 'Excellent', status: 'None', remark: 'None' },
  { id: 13, name: 'Kavitha Raj', present: 98, english: 85, math: 91, science: 79, conduct: 'Average', status: 'None', remark: 'None' },
]

// Additional Singaporean student names
const additionalStudentNames = [
  'Lee Ming Hui', 'Zainab Binte Hassan', 'Koh Wen Qi', 'Ravi Shankar',
  'Chua Li Ting', 'Muhammad Rizwan', 'Angeline Teo', 'Kumar Selvam',
  'Fatimah Abdullah', 'Brandon Ong', 'Jasmine Lim', 'Harish Menon',
  'Zhang Wei', 'Nurul Hidayah', 'Marcus Tan', 'Deepa Nair',
  'Eugene Yap', 'Sarah Ibrahim', 'Kevin Ng', 'Aishwarya Pillai',
  'Ryan Goh', 'Lily Chen', 'Daniel Lee'
]

// Add more students to match the design (34 total)
const additionalStudents = additionalStudentNames.map((name, i) => ({
  id: 14 + i,
  name: name,
  present: Math.floor(Math.random() * 51) + 50, // 50-100%
  english: Math.floor(Math.random() * 31) + 70, // 70-100
  math: Math.floor(Math.random() * 31) + 70,
  science: Math.floor(Math.random() * 31) + 70,
  conduct: ['Average', 'Above average', 'Excellent', 'Needs improvement'][Math.floor(Math.random() * 4)],
  status: ['None', 'GEP', 'SEN'][Math.floor(Math.random() * 3)],
  remark: 'None'
}))

const allStudents = [...studentsData, ...additionalStudents]

type SortField = 'present' | 'name' | 'english' | 'math' | 'science' | 'conduct'
type SortOrder = 'asc' | 'desc'
type TabType = 'overview' | 'statistics' | 'timetable'

interface ClassViewProps {
  onStudentClick?: (studentName: string) => void
}

export function ClassView({ onStudentClick }: ClassViewProps) {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(allStudents.map(s => s.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (studentId: number, checked: boolean) => {
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

  const filteredStudents = allStudents.filter(student => {
    if (filterStatus === 'all') return true
    return student.status === filterStatus
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let compareValue = 0

    switch (sortField) {
      case 'name':
        compareValue = a.name.localeCompare(b.name)
        break
      case 'present':
      case 'english':
      case 'math':
      case 'science':
        compareValue = a[sortField] - b[sortField]
        break
      case 'conduct':
        compareValue = a.conduct.localeCompare(b.conduct)
        break
    }

    return sortOrder === 'asc' ? compareValue : -compareValue
  })

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

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'statistics' as TabType, label: 'Statistics' },
    { id: 'timetable' as TabType, label: 'Timetable' }
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-16">
      {/* Header Section */}
      <div className="flex items-center justify-between pt-4">
        <h1 className="text-2xl font-semibold text-stone-900">My Classroom</h1>
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-stone-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                activeTab === tab.id
                  ? "bg-white text-stone-900 shadow"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-stone-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">●</span>
                  <CardTitle className="text-sm font-medium text-stone-600">SEN</CardTitle>
                  <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Attention</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-stone-900">2 students need extra attention</p>
                <p className="text-sm text-stone-600 mt-1">Sarah M., James K., and Lisa T. scored below 70% on recent assessment.</p>
              </CardContent>
            </Card>

            <Card className="border-stone-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">●</span>
                  <CardTitle className="text-sm font-medium text-stone-600">Nurture</CardTitle>
                  <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Attention</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-stone-900">3 students need math support</p>
                <p className="text-sm text-stone-600 mt-1">Sarah M., James K., and Lisa T. scored below 70% on recent assessment.</p>
              </CardContent>
            </Card>

            <Card className="border-stone-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <CardTitle className="text-sm font-medium text-stone-600">Record</CardTitle>
                  <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">On track</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-stone-900">100% students attended today!</p>
                <p className="text-sm text-stone-600 mt-1">Sarah M., James K., and Lisa T. scored below 70% on recent assessment.</p>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card className="border-stone-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-stone-900">34 students</CardTitle>
                <div className="flex items-center gap-2">
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
                      <DropdownMenuItem onClick={() => handleSort('present')}>Attendance</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('english')}>English</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('math')}>Math</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('science')}>Science</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('conduct')}>Conduct</DropdownMenuItem>
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
                        checked={selectedStudents.length === sortedStudents.length}
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
                      key={student.id}
                      className={onStudentClick ? 'cursor-pointer' : ''}
                      onClick={() => onStudentClick?.(student.name)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
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
                      <TableCell className="font-medium text-stone-900">{student.present}%</TableCell>
                      <TableCell className="text-center text-stone-900">{student.english}</TableCell>
                      <TableCell className="text-center text-stone-900">{student.math}</TableCell>
                      <TableCell className="text-center text-stone-900">{student.science}</TableCell>
                      <TableCell>
                        <span className={getConductColor(student.conduct)}>{student.conduct}</span>
                      </TableCell>
                      <TableCell>
                        {student.status !== 'None' ? (
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        ) : (
                          <span className="text-stone-500">{student.remark}</span>
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
                            <DropdownMenuItem>View details</DropdownMenuItem>
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
        </>
      )}

      {/* Statistics Tab - Empty State */}
      {activeTab === 'statistics' && (
        <Card className="border-stone-200">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-stone-100 p-3">
              <BarChart3Icon className="h-8 w-8 text-stone-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-stone-900">Statistics Coming Soon</h3>
            <p className="max-w-sm text-center text-sm text-stone-600">
              View detailed performance analytics, trends, and insights about your classroom here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timetable Tab - Empty State */}
      {activeTab === 'timetable' && (
        <Card className="border-stone-200">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-stone-100 p-3">
              <CalendarDaysIcon className="h-8 w-8 text-stone-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-stone-900">Timetable Coming Soon</h3>
            <p className="max-w-sm text-center text-sm text-stone-600">
              Manage your class schedule, view upcoming lessons, and organize your teaching calendar here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}