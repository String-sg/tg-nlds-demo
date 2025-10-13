'use client'

import { useState, useMemo } from 'react'
import { ConversationList } from './conversation-list'
import { ConversationView } from './conversation-view'
import { MetadataSidebar } from './metadata-sidebar'
import { conversationGroups as mockConversationGroups } from '@/lib/mock-data/inbox-data'
import { useInboxStudents } from '@/hooks/use-inbox-students'
import type { Priority, ConversationGroup } from '@/types/inbox'

interface InboxLayoutProps {
  conversationId?: string
  onConversationClick: (conversationId: string) => void
}

export function InboxLayout({ conversationId, onConversationClick }: InboxLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const { students, loading, error } = useInboxStudents()

  // Merge real student data with mock conversations
  const conversationGroups = useMemo<ConversationGroup[]>(() => {
    // Convert students map to array
    const studentArray = Array.from(students.values())

    // If we have real students, update the first few mock conversations with real data
    if (studentArray.length > 0) {
      return mockConversationGroups.map((group, index) => {
        const realStudent = studentArray[index]
        if (realStudent) {
          // Update student info
          const updatedStudent = {
            ...group.student,
            id: realStudent.student_id,
            name: realStudent.name,
            class: realStudent.class_name,
            class_id: realStudent.class_id,
            class_name: realStudent.class_name,
          }

          // Update parent participant name to match student
          const updatedThreads = group.threads.map(thread => {
            const parentParticipant = thread.participants.find(p => p.role === 'parent')
            if (parentParticipant) {
              // Generate parent name from student name (e.g., "Tan Wei Jie" -> "Mrs. Tan" or "Mr. Tan")
              const lastName = realStudent.name.split(' ')[0]
              const updatedParentName = `Mrs. ${lastName}`

              return {
                ...thread,
                participants: thread.participants.map(p =>
                  p.role === 'parent'
                    ? { ...p, name: updatedParentName }
                    : p
                ),
                studentContext: {
                  ...thread.studentContext,
                  studentId: realStudent.student_id,
                  studentName: realStudent.name,
                  className: realStudent.class_name || '',
                }
              }
            }
            return thread
          })

          return {
            ...group,
            student: updatedStudent,
            threads: updatedThreads,
          }
        }
        return group
      })
    }

    // Fall back to mock data if no real students yet
    return mockConversationGroups
  }, [students])

  // Filter by priority
  let filteredGroups = conversationGroups
  if (priorityFilter !== 'all') {
    filteredGroups = filteredGroups.filter((group) => group.priority === priorityFilter)
  }

  // Filter by search query
  if (searchQuery) {
    filteredGroups = filteredGroups.filter(
      (group) =>
        group.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.threads[0].participants.some((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
  }

  return (
    <div className="flex h-full w-full border-t border-stone-200 bg-stone-50">
      {/* Left Panel - Conversation List - 360px fixed */}
      <div className="w-[360px] min-h-0 flex-shrink-0 border-r border-stone-200 bg-white">
        <ConversationList
          conversationGroups={filteredGroups}
          activeConversationId={conversationId}
          onConversationClick={onConversationClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          isLoading={loading && students.size === 0}
        />
      </div>

      {/* Right Panel - Conversation View + Metadata - Flex fill */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Conversation View - Flex grow */}
        <div className="flex-1 min-h-0 bg-white overflow-hidden">
          <ConversationView
            conversationId={conversationId}
            conversationGroups={conversationGroups}
          />
        </div>

        {/* Metadata Sidebar - 280px fixed */}
        {conversationId && (
          <div className="w-[280px] min-h-0 flex-shrink-0 border-l border-stone-200 bg-stone-50">
            <MetadataSidebar
              conversationId={conversationId}
              conversationGroups={conversationGroups}
            />
          </div>
        )}
      </div>
    </div>
  )
}
