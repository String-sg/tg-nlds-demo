'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, MessageSquare, Loader2 } from 'lucide-react'
import { StudentPickerItem } from './student-picker-item'
import { useMessageParents } from '@/hooks/use-message-parents'
import { useUser } from '@/contexts/user-context'

interface Student {
  id: string
  student_id: string
  name: string
  year_level: string | null
  class_id: string
  class_name: string
  primary_guardian?: {
    id: string
    name: string
    email: string | null
    phone: string
    relationship: string
  } | null
}

interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Student[]
  isLoadingStudents?: boolean
}

export function NewChatDialog({
  open,
  onOpenChange,
  students,
  isLoadingStudents = false,
}: NewChatDialogProps) {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set()
  )
  const { messageParents, isLoading, progress } = useMessageParents()

  // Filter and group students by class
  const filteredAndGroupedStudents = useMemo(() => {
    // Filter by search query
    const filtered = students.filter((student) => {
      if (!searchQuery) return true

      const query = searchQuery.toLowerCase()
      return (
        student.name.toLowerCase().includes(query) ||
        student.class_name.toLowerCase().includes(query) ||
        student.primary_guardian?.name.toLowerCase().includes(query)
      )
    })

    // Group by class
    const grouped = new Map<string, Student[]>()
    filtered.forEach((student) => {
      const className = student.class_name
      if (!grouped.has(className)) {
        grouped.set(className, [])
      }
      grouped.get(className)?.push(student)
    })

    // Convert to array and sort by class name
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([className, classStudents]) => ({
        className,
        students: classStudents.sort((a, b) => a.name.localeCompare(b.name)),
      }))
  }, [students, searchQuery])

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }

  // Handle submit
  const handleSubmit = async () => {
    if (selectedStudentIds.size === 0) return

    // Prepare students data for messageParents hook
    const studentsToMessage = students
      .filter((s) => selectedStudentIds.has(s.id))
      .filter((s) => s.primary_guardian) // Only include students with guardians
      .map((s) => ({
        studentId: s.id,
        classId: s.class_id,
        guardianName: s.primary_guardian!.name,
        studentName: s.name,
      }))

    if (studentsToMessage.length === 0) {
      return
    }

    try {
      await messageParents({ students: studentsToMessage })
      // Reset state
      setSelectedStudentIds(new Set())
      setSearchQuery('')
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error messaging parents:', error)
    }
  }

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    // Don't allow closing while loading
    if (isLoading) return
    onOpenChange(newOpen)

    // Reset state when closing
    if (!newOpen) {
      setSelectedStudentIds(new Set())
      setSearchQuery('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex h-[600px] flex-col">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 border-b border-stone-200 px-6 py-4">
            <DialogTitle className="text-xl font-semibold">
              Start New Conversation
            </DialogTitle>
            <p className="text-sm text-stone-600 mt-1">
              Select students to start conversations with their parents
            </p>
          </DialogHeader>

          {/* Search */}
          <div className="flex-shrink-0 border-b border-stone-200 px-6 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, classes, or parents..."
                className="h-10 rounded-lg border-stone-200 bg-stone-50 pl-9 pr-3"
                autoFocus
              />
            </div>
          </div>

          {/* Student List */}
          <ScrollArea className="flex-1 min-h-0">
            {isLoadingStudents ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Loader2 className="size-8 animate-spin text-stone-400 mb-3" />
                <p className="text-sm text-stone-600">Loading students...</p>
              </div>
            ) : filteredAndGroupedStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="size-8 text-stone-400 mb-3" />
                <p className="text-sm text-stone-600">
                  {searchQuery ? 'No students found' : 'No students available'}
                </p>
                {searchQuery && (
                  <p className="text-xs text-stone-500 mt-1">
                    Try a different search term
                  </p>
                )}
              </div>
            ) : (
              <div>
                {filteredAndGroupedStudents.map((group) => (
                  <div key={group.className}>
                    {/* Class Header */}
                    <div className="sticky top-0 z-10 bg-stone-50 px-4 py-2 border-b border-stone-200">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                        {group.className}
                      </h3>
                    </div>

                    {/* Students in this class */}
                    <div className="divide-y divide-stone-100">
                      {group.students.map((student) => {
                        // Skip students without guardians
                        if (!student.primary_guardian) return null

                        return (
                          <StudentPickerItem
                            key={student.id}
                            student={{
                              id: student.id,
                              name: student.name,
                              class: student.class_name,
                              className: group.className,
                              guardianName: student.primary_guardian.name,
                              guardianType: student.primary_guardian.relationship,
                            }}
                            selected={selectedStudentIds.has(student.id)}
                            onToggle={toggleStudent}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <DialogFooter className="flex-shrink-0 border-t border-stone-200 px-6 py-4">
            <div className="flex w-full items-center justify-between">
              {/* Selected count */}
              <div className="flex items-center gap-2">
                {selectedStudentIds.size > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedStudentIds.size} student
                    {selectedStudentIds.size > 1 ? 's' : ''} selected
                  </Badge>
                )}
                {isLoading && progress && (
                  <span className="text-xs text-stone-600">
                    {progress.completed}/{progress.total} - {progress.current}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    selectedStudentIds.size === 0 || isLoading || isLoadingStudents
                  }
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="size-4" />
                      Start Conversation
                      {selectedStudentIds.size > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
