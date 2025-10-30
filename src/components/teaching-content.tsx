'use client'

import { useState } from 'react'
import { CheckSquare, ClipboardList, BookOpen, Plus, GraduationCap, ChevronRight, MoreVertical, Clock, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimetableTabContent } from './timetable/timetable-tab-content'
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
import { comingSoonToast } from '@/lib/coming-soon-toast'

interface TeachingContentProps {
  defaultTab?: 'marking' | 'lesson-planning' | 'homework' | 'timetable'
  teacherId?: string
}

// Dummy assignment data
interface Assignment {
  id: string
  title: string
  subject: string
  subjectColor: string
  studentCount: number
  lastEdited: string
  classId: string
}

const dummyAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Mid Year Exam 2025',
    subject: 'English',
    subjectColor: 'bg-indigo-100 text-indigo-700',
    studentCount: 40,
    lastEdited: '2 days ago',
    classId: '5A'
  },
  {
    id: '2',
    title: 'Mid Year Exam 2025',
    subject: 'English',
    subjectColor: 'bg-indigo-100 text-indigo-700',
    studentCount: 40,
    lastEdited: '2 days ago',
    classId: '5A'
  },
  {
    id: '3',
    title: 'Mid Year Exam 2025',
    subject: 'English',
    subjectColor: 'bg-indigo-100 text-indigo-700',
    studentCount: 40,
    lastEdited: '2 days ago',
    classId: '5A'
  },
  {
    id: '4',
    title: 'Mid Year Exam 2025',
    subject: 'English',
    subjectColor: 'bg-indigo-100 text-indigo-700',
    studentCount: 40,
    lastEdited: '2 days ago',
    classId: '5A'
  },
  {
    id: '5',
    title: 'Mid Year Exam 2025',
    subject: 'English',
    subjectColor: 'bg-indigo-100 text-indigo-700',
    studentCount: 40,
    lastEdited: '2 days ago',
    classId: '5A'
  },
  {
    id: '6',
    title: 'Mid Year Exam 2025',
    subject: 'English',
    subjectColor: 'bg-indigo-100 text-indigo-700',
    studentCount: 40,
    lastEdited: '2 days ago',
    classId: '5A'
  },
  {
    id: '7',
    title: 'Mathematics Quiz 3',
    subject: 'Math',
    subjectColor: 'bg-blue-100 text-blue-700',
    studentCount: 38,
    lastEdited: '1 week ago',
    classId: '5B'
  },
  {
    id: '8',
    title: 'Science Project',
    subject: 'Science',
    subjectColor: 'bg-green-100 text-green-700',
    studentCount: 38,
    lastEdited: '3 days ago',
    classId: '5B'
  },
  {
    id: '9',
    title: 'History Essay',
    subject: 'History',
    subjectColor: 'bg-amber-100 text-amber-700',
    studentCount: 42,
    lastEdited: '5 days ago',
    classId: '6A'
  }
]

export function TeachingContent({ defaultTab = 'marking', teacherId = 'teacher@example.com' }: TeachingContentProps = {}) {
  const [activeTab, setActiveTab] = useState<'marking' | 'lesson-planning' | 'homework' | 'timetable'>(defaultTab)
  const [selectedClass, setSelectedClass] = useState<string>('5A')

  const handleTabChange = (value: string) => {
    if (value === 'marking' || value === 'lesson-planning' || value === 'homework' || value === 'timetable') {
      setActiveTab(value)
    }
  }

  // Filter assignments by selected class
  const filteredAssignments = dummyAssignments.filter(
    assignment => assignment.classId === selectedClass
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Teaching</h1>
              <p className="text-sm text-muted-foreground">
                Manage your teaching tasks and resources
              </p>
            </div>
            <Button size="sm" onClick={() => comingSoonToast.feature('Quick action')}>
              <Plus className="mr-2 size-4" />
              Quick action
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList>
              <TabsTrigger value="marking">
                <CheckSquare className="mr-2 size-4" />
                Marking
              </TabsTrigger>
              <TabsTrigger value="lesson-planning">
                <ClipboardList className="mr-2 size-4" />
                Lesson Planning
              </TabsTrigger>
              <TabsTrigger value="homework">
                <BookOpen className="mr-2 size-4" />
                Homework
              </TabsTrigger>
              <TabsTrigger value="timetable">
                <CalendarDays className="mr-2 size-4" />
                Timetable
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Marking Tab */}
            <TabsContent value="marking" className="space-y-6 mt-0">
              {/* Class Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-stone-700">Select Class:</span>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5A">Class 5A</SelectItem>
                      <SelectItem value="5B">Class 5B</SelectItem>
                      <SelectItem value="6A">Class 6A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assignment Cards Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} className="group relative overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm transition-all hover:shadow-md">
                    {/* Options Menu */}
                    <div className="absolute right-3 top-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => comingSoonToast.feature('Edit assignment')}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => comingSoonToast.feature('Duplicate assignment')}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => comingSoonToast.feature('Delete assignment')}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <CardHeader className="pb-3">
                      {/* Last Edited */}
                      <div className="flex items-center gap-1 text-xs text-stone-400 mb-2">
                        <Clock className="h-3 w-3" />
                        <span>Last edited {assignment.lastEdited}</span>
                      </div>

                      {/* Title */}
                      <CardTitle className="text-lg font-semibold text-stone-900">
                        {assignment.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Subject Badge */}
                      <Badge className={`${assignment.subjectColor} font-medium rounded-full px-3 py-1`}>
                        {assignment.subject}
                      </Badge>

                      {/* Student Count & Enter Button */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-stone-500">
                          {assignment.studentCount} Students
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
                          onClick={() => comingSoonToast.feature('Assignment marking')}
                        >
                          Enter
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredAssignments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <CheckSquare className="size-8 text-muted-foreground" />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold">No assignments yet</h2>
                  <p className="mb-6 max-w-md text-sm text-muted-foreground">
                    Create your first assignment for Class {selectedClass}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Lesson Planning Tab */}
            <TabsContent value="lesson-planning" className="space-y-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <ClipboardList className="size-8 text-muted-foreground" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">Lesson Planning feature coming soon</h2>
                <p className="mb-6 max-w-md text-sm text-muted-foreground">
                  Create, organize, and share lesson plans with templates and resources.
                </p>
                <Badge variant="secondary" className="text-xs">
                  In development
                </Badge>
              </div>

              {/* Sample features */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Lesson templates</CardTitle>
                    <CardDescription className="text-xs">
                      Use pre-built templates for quick planning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-xs">Coming soon</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resource library</CardTitle>
                    <CardDescription className="text-xs">
                      Attach materials and resources to lessons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-xs">Coming soon</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Curriculum mapping</CardTitle>
                    <CardDescription className="text-xs">
                      Align lessons with curriculum standards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-xs">Coming soon</Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Homework Tab */}
            <TabsContent value="homework" className="space-y-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <BookOpen className="size-8 text-muted-foreground" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">Homework feature coming soon</h2>
                <p className="mb-6 max-w-md text-sm text-muted-foreground">
                  Assign, track, and manage homework assignments for your classes.
                </p>
                <Badge variant="secondary" className="text-xs">
                  In development
                </Badge>
              </div>

              {/* Sample features */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Create assignments</CardTitle>
                    <CardDescription className="text-xs">
                      Set homework with due dates and instructions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-xs">Coming soon</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Submission tracking</CardTitle>
                    <CardDescription className="text-xs">
                      Monitor who has submitted their work
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-xs">Coming soon</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Reminders</CardTitle>
                    <CardDescription className="text-xs">
                      Auto-send reminders for upcoming deadlines
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-xs">Coming soon</Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Timetable Tab */}
            <TabsContent value="timetable" className="h-full mt-0">
              <TimetableTabContent teacherId={teacherId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
