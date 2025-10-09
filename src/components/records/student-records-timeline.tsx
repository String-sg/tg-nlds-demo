'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  MoreHorizontal,
  UserCheck,
  TrendingUp,
  UserCircle,
  Calendar,
  User,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudentRecord, RecordType } from '@/types/student-records'
import { ericStudentRecords } from '@/lib/mock-data/eric-records'

interface StudentRecordsTimelineProps {
  studentName: string
  studentId: string
}

// Mock data - returns Eric's comprehensive records if Eric, otherwise generic mock
const getMockRecords = (studentName: string, studentId: string): StudentRecord[] => {
  // If this is Eric Lim, return his comprehensive records
  if (studentId === 'student-031' || studentName === 'Eric Lim') {
    return ericStudentRecords
  }

  // Otherwise return generic mock records for other students
  return [
  {
    id: 'rec-001',
    studentId: 'student-001',
    type: 'attendance',
    subType: 'daily',
    title: 'Absent - Medical Leave',
    description:
      'Student was absent due to fever. Medical certificate provided.',
    date: '2025-10-08',
    createdBy: 'Daniel Tan',
    createdAt: '2025-10-08T09:00:00',
    status: 'published',
    visibility: 'parent',
    data: {
      subType: 'daily',
      status: 'absent',
      reason: 'Fever - medical certificate provided',
      notifyParent: true,
      followUpRequired: false,
    },
  },
  {
    id: 'rec-002',
    studentId: 'student-001',
    type: 'performance',
    subType: 'academic-results',
    title: 'Math Quiz - Excellent Performance',
    description:
      'Scored 95/100 on Algebra quiz. Shows strong understanding of quadratic equations.',
    date: '2025-10-05',
    createdBy: 'Daniel Tan',
    createdAt: '2025-10-05T14:30:00',
    status: 'published',
    visibility: 'parent',
    tags: ['mathematics', 'quiz', 'excellent'],
    data: {
      subType: 'academic-results',
      subject: 'Mathematics',
      assessmentType: 'quiz',
      score: 95,
      maxScore: 100,
      grade: 'A',
      observation: 'Excellent understanding of quadratic equations',
      strengths: ['Problem solving', 'Analytical thinking'],
    },
  },
  {
    id: 'rec-003',
    studentId: 'student-001',
    type: 'profile',
    subType: 'family',
    title: 'Family Situation Update',
    description:
      'Parent informed about new sibling arrival. May need additional support during transition.',
    date: '2025-10-01',
    createdBy: 'Sarah Chen',
    createdAt: '2025-10-01T11:00:00',
    status: 'published',
    visibility: 'staff',
    data: {
      subType: 'family',
      observation:
        'New sibling in family. Monitor for any signs of adjustment difficulties.',
      actionRequired: true,
      actionTaken: 'Scheduled check-in with student next week',
    },
  },
  {
    id: 'rec-004',
    studentId: 'student-001',
    type: 'performance',
    subType: 'character-cce',
    title: 'Growth Mindset & Peer Support',
    description:
      `${studentName} shows excellent resilience and perseverance. Noticed helping classmates with study strategies.`,
    date: '2025-09-28',
    createdBy: 'Daniel Tan',
    createdAt: '2025-09-28T15:00:00',
    status: 'published',
    visibility: 'parent',
    tags: ['character', 'resilience', 'helping-peers'],
    data: {
      subType: 'character-cce',
      area: 'resilience',
      rating: 5,
      observation:
        'Demonstrates growth mindset when tackling difficult problems. Takes initiative to help peers.',
      strengths: ['Resilience', 'Growth mindset', 'Helping peers', 'Diligence'],
    },
  },
  ]
}

export function StudentRecordsTimeline({
  studentName,
  studentId,
}: StudentRecordsTimelineProps) {
  const [filterType, setFilterType] = useState<RecordType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const records = getMockRecords(studentName, studentId)

  const getRecordIcon = (type: RecordType) => {
    switch (type) {
      case 'attendance':
        return UserCheck
      case 'performance':
        return TrendingUp
      case 'profile':
        return UserCircle
      case 'case-related':
        return Briefcase
      default:
        return Calendar
    }
  }

  const getRecordColor = (type: RecordType) => {
    switch (type) {
      case 'attendance':
        return 'bg-blue-100 text-blue-700'
      case 'performance':
        return 'bg-green-100 text-green-700'
      case 'profile':
        return 'bg-purple-100 text-purple-700'
      case 'case-related':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-stone-100 text-stone-700'
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesType = filterType === 'all' || record.type === filterType
    const matchesSearch =
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex gap-2">
        <Select
          value={filterType}
          onValueChange={(value) => setFilterType(value as RecordType | 'all')}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="attendance">Attendance</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Records count */}
      <div className="text-sm text-stone-600">
        {filteredRecords.length}{' '}
        {filteredRecords.length === 1 ? 'record' : 'records'}
      </div>

      {/* Timeline list */}
      {filteredRecords.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-3 h-12 w-12 text-stone-400" />
            <p className="mb-1 text-sm font-medium text-stone-900">No records found</p>
            <p className="text-sm text-stone-500">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your filters'
                : `Use "New record" button above to start tracking ${studentName}'s activities`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const Icon = getRecordIcon(record.type)
            return (
              <Card
                key={record.id}
                className="border-stone-200 transition-colors hover:border-stone-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Record type icon */}
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        getRecordColor(record.type)
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Record content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-medium text-stone-900">
                              {record.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {record.subType}
                            </Badge>
                            {record.status === 'draft' && (
                              <Badge variant="outline" className="text-xs">
                                Draft
                              </Badge>
                            )}
                          </div>
                          <p className="mb-2 text-sm text-stone-600">
                            {record.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(record.date)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {record.createdBy}
                            </span>
                          </div>
                        </div>

                        {/* Actions menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
