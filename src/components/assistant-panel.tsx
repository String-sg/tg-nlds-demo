'use client'

import React, { useState } from 'react'
import { CheckIcon, ChevronRightIcon, Loader2Icon, MonitorIcon, PanelRightIcon, SendIcon, SquareIcon, Trash2Icon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import AssistantRichText from '@/components/assistant-rich-text'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { usePTMStudents } from '@/hooks/queries/use-ptm-students-query'
import { formatAttendanceRate } from '@/lib/utils/ptm-utils'
import { useAssistant } from '@/contexts/assistant-context'
import { useUser } from '@/contexts/user-context'
import type { PTMStudent } from '@/types/ptm'

type AssistantMode = 'floating' | 'sidebar'

type AssistantPanelProps = {
  mode: AssistantMode
  onModeChange: (mode: AssistantMode | 'full') => void
  isOpen: boolean
  onOpenChange: (next: boolean) => void
  className?: string
  showBodyHeading?: boolean
  showHeaderControls?: boolean
  onStudentClick?: (studentName: string) => void
  onStudentClickWithClass?: (classId: string, studentName: string) => void
  incomingMessage?: string | null
  onMessageProcessed?: () => void
}

type AssistantBodyProps = {
  showHeading?: boolean
  onStudentClick?: (studentName: string) => void
  onStudentClickWithClass?: (classId: string, studentName: string) => void
  incomingMessage?: string | null
  onMessageProcessed?: () => void
  fullPageMode?: boolean
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string | React.ReactNode
  timestamp: Date
  isThinking?: boolean
  command?: string // For slash commands like /ptm
  fullPrompt?: string // The expanded prompt text
}

const promptShortcuts = [
  {
    label: 'Parent teacher meet prep',
    command: '/ptm',
    prompt: 'Prepare for parent-teacher meeting on October 14, 2025. Review student data and identify key discussion points for parents.'
  },
  {
    label: 'Lesson plan summary',
    command: '/lesson',
    prompt: 'Summarize the current lesson plan and suggest improvements based on student engagement data.'
  },
  {
    label: 'Student progress report',
    command: '/progress',
    prompt: 'Generate a detailed progress report for selected students including attendance, grades, and behavior notes.'
  },
]

// Helper function to generate unique IDs
let messageIdCounter = 0
const generateMessageId = () => {
  messageIdCounter += 1
  return `msg-${Date.now()}-${messageIdCounter}`
}

// Helper function to get badge color
const getBadgeColor = (badge: string) => {
  const lowerBadge = badge.toLowerCase()

  // Performance grades
  if (lowerBadge.includes('excellent') || lowerBadge.includes('top performer')) {
    return 'bg-green-100 text-green-800'
  }
  if (lowerBadge.includes('above average')) {
    return 'bg-blue-100 text-blue-800'
  }
  if (lowerBadge.includes('average') || lowerBadge.includes('steady')) {
    return 'bg-stone-100 text-stone-800'
  }
  if (lowerBadge.includes('below average') || lowerBadge.includes('needs support')) {
    return 'bg-red-100 text-red-800'
  }

  // Behavioral/progress tags
  if (lowerBadge.includes('improved') || lowerBadge.includes('improving')) {
    return 'bg-emerald-100 text-emerald-800'
  }
  if (lowerBadge.includes('consistent') || lowerBadge.includes('hardworking')) {
    return 'bg-indigo-100 text-indigo-800'
  }
  if (lowerBadge.includes('creative')) {
    return 'bg-purple-100 text-purple-800'
  }
  if (lowerBadge.includes('engaged') || lowerBadge.includes('potential')) {
    return 'bg-cyan-100 text-cyan-800'
  }

  // Default
  return 'bg-muted text-muted-foreground'
}

// Collapsible user message component for showing command shortcuts with full prompts
function CollapsibleUserMessage({ command, fullPrompt }: { command: string; fullPrompt: string }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="flex flex-col gap-2">
      <div className="font-medium">{command}</div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs underline opacity-70 hover:opacity-100 transition-opacity text-left"
      >
        {isExpanded ? 'Hide full message' : 'Show full message'}
      </button>
      {isExpanded && (
        <div className="text-sm opacity-90">{fullPrompt}</div>
      )}
    </div>
  )
}

function PTMResponseContent({
  onStudentClick,
  onStudentClickWithClass
}: {
  onStudentClick?: (studentName: string) => void
  onStudentClickWithClass?: (classId: string, studentName: string) => void
}) {
  const [currentPage, setCurrentPage] = useState(0)

  const { user } = useUser()

  // Fetch real PTM student data
  const { students, loading, error, isEmpty, highPriorityCount, mediumPriorityCount, totalCount, formClassId } = usePTMStudents(user?.user_id || '')

  // Handler for student clicks
  const handleStudentClick = (studentName: string) => {
    if (onStudentClickWithClass && formClassId) {
      // Use class-aware routing if available
      onStudentClickWithClass(formClassId, studentName)
    } else if (onStudentClick) {
      // Fall back to simple student click
      onStudentClick(studentName)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading student data...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-900">Failed to load student data</p>
        <p className="text-sm text-red-700">{error.message}</p>
        <p className="text-xs text-red-600">Please check that you have students in your form class and try again.</p>
      </div>
    )
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-6 text-center">
        <p className="text-sm font-medium">No students found</p>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have any students in your form class yet.
        </p>
      </div>
    )
  }

  // Split students into priority groups for pagination
  const highPriorityStudents = students.filter((s: PTMStudent) => s.priorityLevel === 'high')
  const mediumLowStudents = students.filter((s: PTMStudent) => s.priorityLevel !== 'high')

  // Determine which students to show based on current page
  const studentsToShow = currentPage === 0
    ? []
    : currentPage === 1
      ? students.slice(0, Math.min(8, students.length))
      : students.slice(8, students.length)

  // Calculate total pages based on student count
  const hasMoreStudents = students.length > 8
  const maxPages = hasMoreStudents ? 2 : 1

  return (
    <div className="flex flex-col gap-4">
      {/* Introduction */}
      <p className="text-sm">
        I&apos;ve analyzed your form class of <span className="font-medium">{totalCount} students</span> to help you prepare for parent-teacher meetings.
        {highPriorityCount > 0 && (
          <> There {highPriorityCount === 1 ? 'is' : 'are'} <span className="font-medium text-red-600">{highPriorityCount} student{highPriorityCount > 1 ? 's' : ''}</span> requiring priority attention.</>
        )}
      </p>

      {/* Show top priority students on page 0 */}
      {currentPage === 0 && highPriorityStudents.length > 0 && (
        <>
          <p className="text-sm font-medium">
            {highPriorityStudents.length === 1
              ? 'Here is the student you should focus on:'
              : `Here are ${Math.min(highPriorityStudents.length, 2)} students you should focus on:`}
          </p>

          {highPriorityStudents.slice(0, 2).map((student: PTMStudent) => (
            <div
              key={student.student_id}
              className={cn(
                "flex flex-col gap-3 rounded-lg border bg-background p-4",
                (onStudentClick || onStudentClickWithClass) && "cursor-pointer hover:bg-accent transition-colors"
              )}
              onClick={() => handleStudentClick(student.name)}
            >
              {/* Student header */}
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-medium ${getAvatarColor(student.name)}`}>
                  {getInitials(student.name)}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="font-semibold">{student.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Attendance: {formatAttendanceRate(student.attendanceRate)}
                  </span>
                </div>
              </div>

              {/* Tags/Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Priority badge */}
                <span className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                  student.badgeColor
                )}>
                  {student.priorityLevel === 'high' ? 'High Priority' : 'Medium Priority'}
                </span>

                {/* Additional tags */}
                {student.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Concern areas */}
              {student.concernAreas.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Concerns: </span>
                  <span className="text-muted-foreground">{student.concernAreas.join(', ')}</span>
                </div>
              )}

              {/* Strengths */}
              {student.strengths.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Strengths: </span>
                  <span className="text-muted-foreground">{student.strengths.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Show paginated student list on pages 1 and 2 */}
      {currentPage > 0 && studentsToShow.length > 0 && (
        <>
          <p className="text-sm font-medium">
            {currentPage === 1
              ? `Students 1-${Math.min(8, students.length)} (sorted by priority)`
              : `Students 9-${students.length}`}
          </p>

          {studentsToShow.map((student: PTMStudent) => (
            <div
              key={student.student_id}
              className={cn(
                "flex flex-col gap-3 rounded-lg border bg-background p-4",
                (onStudentClick || onStudentClickWithClass) && "cursor-pointer hover:bg-accent transition-colors"
              )}
              onClick={() => handleStudentClick(student.name)}
            >
              {/* Student header */}
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-medium ${getAvatarColor(student.name)}`}>
                  {getInitials(student.name)}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="font-semibold">{student.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Attendance: {formatAttendanceRate(student.attendanceRate)}
                    {student.average_grade && ` • Avg: ${student.average_grade}%`}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Priority badge for high priority students */}
                {student.priorityLevel === 'high' && (
                  <span className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                    student.badgeColor
                  )}>
                    High Priority
                  </span>
                )}

                {/* Student tags */}
                {student.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Summary */}
              <p className="text-sm text-muted-foreground">
                {student.concernAreas.length > 0
                  ? student.concernAreas.join('; ')
                  : student.strengths.join('; ')}
              </p>
            </div>
          ))}
        </>
      )}

      {/* Pagination button */}
      {currentPage < maxPages && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {currentPage === 0
            ? 'Show all students'
            : hasMoreStudents && currentPage === 1
              ? `Show remaining ${students.length - 8} students`
              : 'Show more'}
        </Button>
      )}
    </div>
  )
}

function AssistantBody({ onStudentClick, onStudentClickWithClass, incomingMessage, onMessageProcessed, fullPageMode = false }: AssistantBodyProps) {
  // Use context for persisted state
  const { messages, setMessages, currentInput: input, setCurrentInput: setInput, clearMessages } = useAssistant()
  const { scrollRef } = useScrollToBottom({ dependencies: [messages] })

  // Local state for UI interactions (not persisted)
  const [isLoading, setIsLoading] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [filteredShortcuts, setFilteredShortcuts] = useState(promptShortcuts)
  const [selectedShortcutIndex, setSelectedShortcutIndex] = useState(0)

  // Handle incoming messages from homepage
  React.useEffect(() => {
    if (incomingMessage) {
      const userMessage: Message = {
        id: generateMessageId(),
        role: 'user',
        content: incomingMessage,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      // Process incoming message with real API call
      handleRealTimeMessage(incomingMessage)
      onMessageProcessed?.()
    }
  }, [incomingMessage, onMessageProcessed, messages, onStudentClick, onStudentClickWithClass])

  // Handle real-time message processing
  const handleRealTimeMessage = async (messageText: string) => {
    try {
      // Check if message matches PTM natural language patterns
      const ptmPatterns = [
        'parent teacher meeting',
        'parents teacher meeting',
        'parent-teacher meeting',
        'parent teacher conference',
        'parents teacher conference',
        'ptm',
        'prepare for meeting with parents',
        'prepare for parent meeting',
        'help with parent meeting',
        'parent meeting',
        'meeting with parents',
      ]

      const isPTMRequest = ptmPatterns.some(pattern =>
        messageText.toLowerCase().includes(pattern) &&
        (messageText.toLowerCase().includes('prepare') ||
         messageText.toLowerCase().includes('help') ||
         messageText.toLowerCase().includes('ready') ||
         messageText.toLowerCase().includes('upcoming') ||
         messageText.toLowerCase().includes('next') ||
         messageText.toLowerCase() === pattern)
      )

      // For PTM requests, skip OpenAI and show component directly
      if (isPTMRequest) {
        // Show loading indicator briefly
        const loadingMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: 'Loading PTM data...',
          timestamp: new Date(),
          isThinking: true,
        }
        setMessages((prev) => [...prev, loadingMessage])

        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500))

        // Remove loading and show PTM component
        setMessages((prev) => prev.filter((msg) => !msg.isThinking))

        const ptmMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: <PTMResponseContent onStudentClick={onStudentClick} onStudentClickWithClass={onStudentClickWithClass} />,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, ptmMessage])
        setIsLoading(false)
        return
      }

      // For non-PTM requests, use OpenAI streaming
      // Create streaming message
      const streamingMessageId = generateMessageId()
      const streamingMessage: Message = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, streamingMessage])

      // Call streaming API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages
            .filter(m => typeof m.content === 'string' && !m.isThinking)
            .map(m => ({
              role: m.role,
              content: m.content as string,
            })),
          isPTMRequest: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))

              if (data.content) {
                accumulatedContent += data.content
                // Update streaming message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }

              if (data.error) {
                throw new Error(data.error)
              }
            }
          }
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Real-time message error:', error)
      // Remove failed streaming message
      setMessages((prev) => prev.filter(m => m.content !== ''))

      // Add error message
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = input.trim().toLowerCase()
    const inputValue = input.trim()
    setInput('')
    setIsLoading(true)

    // Check if message matches PTM natural language patterns
    const ptmPatterns = [
      'parent teacher meeting',
      'parents teacher meeting',
      'parent-teacher meeting',
      'parent teacher conference',
      'parents teacher conference',
      'ptm',
      'prepare for meeting with parents',
      'prepare for parent meeting',
      'help with parent meeting',
      'parent meeting',
      'meeting with parents',
    ]

    const isPTMRequest = ptmPatterns.some(pattern =>
      messageText.includes(pattern) &&
      (messageText.includes('prepare') || messageText.includes('help') || messageText.includes('ready') || messageText.includes('upcoming') || messageText.includes('next') || messageText === pattern)
    )

    try {
      // For PTM requests, skip OpenAI and show component directly
      if (isPTMRequest) {
        // Show loading indicator briefly
        const loadingMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: 'Loading PTM data...',
          timestamp: new Date(),
          isThinking: true,
        }
        setMessages((prev) => [...prev, loadingMessage])

        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500))

        // Remove loading and show PTM component
        setMessages((prev) => prev.filter((msg) => !msg.isThinking))

        const ptmMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: <PTMResponseContent onStudentClick={onStudentClick} onStudentClickWithClass={onStudentClickWithClass} />,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, ptmMessage])
        setIsLoading(false)
        return
      }

      // For non-PTM requests, use OpenAI streaming
      // Create streaming message
      const streamingMessageId = generateMessageId()
      const streamingMessage: Message = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, streamingMessage])

      // Call streaming API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages
            .filter(m => typeof m.content === 'string' && !m.isThinking)
            .map(m => ({
              role: m.role,
              content: m.content as string,
            })),
          isPTMRequest: false, // Never PTM here since we handle it above
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))

              if (data.content) {
                accumulatedContent += data.content
                // Update streaming message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }

              if (data.error) {
                throw new Error(data.error)
              }
            }
          }
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Chat error:', error)
      // Remove failed streaming message
      setMessages((prev) => prev.filter(m => m.content !== ''))

      // Add error message
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    // Check if user is typing a slash command
    if (value.startsWith('/')) {
      setShowShortcuts(true)
      setSelectedShortcutIndex(0)
      const search = value.slice(1).toLowerCase()
      const filtered = promptShortcuts.filter(
        shortcut =>
          shortcut.command.toLowerCase().includes(search) ||
          shortcut.label.toLowerCase().includes(search)
      )
      setFilteredShortcuts(filtered)
    } else {
      setShowShortcuts(false)
    }
  }

  const handleShortcutSelect = async (shortcut: typeof promptShortcuts[0]) => {
    setShowShortcuts(false)
    setInput('')

    // Send the shortcut command as a message with both command and full prompt
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: shortcut.command,
      command: shortcut.command,
      fullPrompt: shortcut.prompt,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const isPTMRequest = shortcut.command === '/ptm'

    try {
      // For PTM requests, skip OpenAI and show component directly
      if (isPTMRequest) {
        // Show loading indicator briefly
        const loadingMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: 'Loading PTM data...',
          timestamp: new Date(),
          isThinking: true,
        }
        setMessages((prev) => [...prev, loadingMessage])

        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500))

        // Remove loading and show PTM component
        setMessages((prev) => prev.filter((msg) => !msg.isThinking))

        const ptmMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: <PTMResponseContent onStudentClick={onStudentClick} onStudentClickWithClass={onStudentClickWithClass} />,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, ptmMessage])
        setIsLoading(false)
        return
      }

      // For non-PTM requests, use OpenAI streaming
      // Create streaming message
      const streamingMessageId = generateMessageId()
      const streamingMessage: Message = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, streamingMessage])

      // Call streaming API with full prompt
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: shortcut.prompt,
          conversationHistory: messages
            .filter(m => typeof m.content === 'string' && !m.isThinking)
            .map(m => ({
              role: m.role,
              content: m.content as string,
            })),
          isPTMRequest: false, // Never PTM here since we handle it above
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))

              if (data.content) {
                accumulatedContent += data.content
                // Update streaming message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }

              if (data.error) {
                throw new Error(data.error)
              }
            }
          }
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Chat error:', error)
      // Remove failed streaming message
      setMessages((prev) => prev.filter(m => m.content !== ''))

      // Add error message
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showShortcuts && filteredShortcuts.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedShortcutIndex((prev) =>
          prev < filteredShortcuts.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedShortcutIndex((prev) =>
          prev > 0 ? prev - 1 : filteredShortcuts.length - 1
        )
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleShortcutSelect(filteredShortcuts[selectedShortcutIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowShortcuts(false)
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Render messages (reused in both modes)
  const renderMessages = () => (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex flex-col gap-1 text-sm',
            message.role === 'user'
              ? 'ml-auto max-w-[85%] rounded-lg bg-orange-500 p-2 text-white'
              : message.isThinking
                ? 'mr-auto flex-row items-center gap-2'
                : 'mr-auto w-full min-w-0 rounded-lg bg-background p-2',
          )}
        >
          {message.isThinking ? (
            <>
              <span className="text-muted-foreground">{message.content}</span>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </>
          ) : (
            <>
              {/* Check if this is a command message with full prompt */}
              {message.command && message.fullPrompt ? (
                <CollapsibleUserMessage command={message.command} fullPrompt={message.fullPrompt} />
              ) : typeof message.content === 'string' ? (
                <AssistantRichText text={message.content as string} className="break-words overflow-hidden" />
              ) : (
                <div>{message.content}</div>
              )}
              {!message.isThinking && (
                <span className="text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="mr-auto max-w-[85%] rounded-lg bg-background p-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <div className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <div className="size-2 animate-bounce rounded-full bg-muted-foreground" />
            </div>
            <span className="text-muted-foreground">Thinking...</span>
          </div>
        </div>
      )}
    </>
  )

  // Render input area (reused in both modes)
  const renderInput = () => (
    <>
      <div className="flex flex-col gap-2">
        {/* Shortcut hints - only show when no messages */}
        {messages.length === 0 && (
          <div className="flex items-center gap-2">
            {promptShortcuts.map((shortcut) => (
              <button
                key={shortcut.command}
                type="button"
                onClick={() => {
                  setInput(shortcut.command)
                  setShowShortcuts(true)
                  setSelectedShortcutIndex(promptShortcuts.indexOf(shortcut))
                }}
                className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
              >
                <span className="text-muted-foreground">/</span>
                <span>{shortcut.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          {showShortcuts && filteredShortcuts.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-lg border bg-background shadow-lg">
              {filteredShortcuts.map((shortcut, index) => (
                <button
                  key={shortcut.command}
                  type="button"
                  onClick={() => handleShortcutSelect(shortcut)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent',
                    index === selectedShortcutIndex && 'bg-accent'
                  )}
                >
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{shortcut.command}</span>
                    <span className="text-sm font-medium">{shortcut.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask the assistant anything..."
            className="shimmer-input-sm min-h-[80px] resize-none pr-12"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 size-8"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <SendIcon className="size-4" />
          </Button>
        </div>
      </div>
    </>
  )

  return fullPageMode ? (
    // Full-page mode: Follow ConversationView pattern - full width with padding
    <div className="flex h-full flex-col">
      {/* Messages - scrollable with auto-scroll-to-bottom */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-2 px-6 py-4">
          {renderMessages()}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input - fixed at bottom */}
      <div className="flex-shrink-0 border-t bg-background px-6 py-4">
        {renderInput()}
      </div>
    </div>
  ) : (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Sidebar/floating mode: custom ScrollArea */}
      <ScrollArea className="assistant-scroll-mask flex-1 min-h-0">
        <div className="flex flex-col gap-2 px-3 pt-4 pb-2">
          {renderMessages()}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="flex flex-shrink-0 flex-col gap-2 px-4">
        {renderInput()}
      </div>
    </div>
  )
}

type AssistantModeSwitcherProps = {
  mode: AssistantMode
  onModeChange: (mode: AssistantMode | 'full') => void
  activeOption?: AssistantMode | 'full'
  className?: string
}

export function AssistantModeSwitcher({ mode, onModeChange, activeOption, className }: AssistantModeSwitcherProps) {
  const current = activeOption ?? mode

  const handleSelect = (value: AssistantMode | 'full') => {
    onModeChange(value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-8', className)}
          aria-label={
            current === 'sidebar'
              ? 'Switch assistant mode (sidebar)'
              : current === 'full'
                ? 'Switch assistant mode (full page)'
                : 'Switch assistant mode (floating)'
          }
          title={
            current === 'sidebar'
              ? 'Sidebar'
              : current === 'full'
                ? 'Full page'
                : 'Floating'
          }
        >
          {current === 'sidebar' ? (
            <PanelRightIcon className="size-4 text-muted-foreground" />
          ) : current === 'full' ? (
            <MonitorIcon className="size-4 text-muted-foreground" />
          ) : (
            <SquareIcon className="size-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-48">
        <DropdownMenuItem
          className="relative pl-8"
          onSelect={(event) => {
            event.preventDefault()
            handleSelect('floating')
          }}
        >
          <SquareIcon className="absolute left-2 size-4 text-muted-foreground" />
          Floating
          {current === 'floating' && <CheckIcon className="ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="relative pl-8"
          onSelect={(event) => {
            event.preventDefault()
            handleSelect('sidebar')
          }}
        >
          <PanelRightIcon className="absolute left-2 size-4 text-muted-foreground" />
          Sidebar
          {current === 'sidebar' && <CheckIcon className="ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="relative pl-8"
          onSelect={(event) => {
            event.preventDefault()
            handleSelect('full')
          }}
        >
          <MonitorIcon className="absolute left-2 size-4 text-muted-foreground" />
          Full page
          {current === 'full' && <CheckIcon className="ml-auto size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AssistantPanel({
  mode,
  onModeChange,
  isOpen,
  onOpenChange,
  className,
  showBodyHeading = true,
  showHeaderControls = true,
  onStudentClick,
  onStudentClickWithClass,
  incomingMessage,
  onMessageProcessed,
}: AssistantPanelProps) {
  // Get clearMessages from context
  const { clearMessages } = useAssistant()

  const content = (
    <div className={cn('flex h-full min-h-0 flex-col gap-4 pb-2 pt-2', className)}>
      {showHeaderControls && (
        <div className="flex items-center justify-between gap-2 px-5 py-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold leading-none">Assistant</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={clearMessages}
              aria-label="Clear chat history"
            >
              <Trash2Icon className="size-4 text-muted-foreground" />
            </Button>
            <AssistantModeSwitcher mode={mode} onModeChange={onModeChange} />
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onOpenChange(false)}
              aria-label="Close assistant"
            >
              <XIcon className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      )}
      <AssistantBody
        showHeading={showBodyHeading}
        onStudentClick={onStudentClick}
        onStudentClickWithClass={onStudentClickWithClass}
        incomingMessage={incomingMessage}
        onMessageProcessed={onMessageProcessed}
      />
    </div>
  )

  if (mode === 'sidebar') {
    if (!isOpen) {
      return null
    }

    return content
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bottom-4 right-4 top-auto h-auto max-h-[calc(100vh-2rem)] w-[min(95vw,22rem)] translate-x-0 rounded-2xl border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:duration-200 data-[state=open]:duration-300 sm:bottom-6 sm:right-6 sm:w-[26rem] md:w-[28rem]"
        showOverlay={false}
        showCloseButton={false}
        bounded={false}
      >
        {showHeaderControls && (
          <SheetHeader className="flex-row items-center justify-between gap-3 border-b px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SheetTitle className="text-base">Assistant</SheetTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={clearMessages}
                aria-label="Clear chat history"
              >
                <Trash2Icon className="size-4 text-muted-foreground" />
              </Button>
              <AssistantModeSwitcher mode={mode} onModeChange={onModeChange} />
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onOpenChange(false)}
                aria-label="Close assistant"
              >
                <XIcon className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </SheetHeader>
        )}
        <div className="flex h-[calc(100vh-10rem)] min-h-0 flex-col py-5">
          <AssistantBody
            showHeading={showBodyHeading}
            onStudentClick={onStudentClick}
            onStudentClickWithClass={onStudentClickWithClass}
            incomingMessage={incomingMessage}
            onMessageProcessed={onMessageProcessed}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { AssistantBody }
export type { AssistantMode, AssistantPanelProps }

