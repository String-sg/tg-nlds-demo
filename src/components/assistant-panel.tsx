'use client'

import React, { useState } from 'react'
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, MonitorIcon, PanelRightIcon, SendIcon, SquareIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

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
  incomingMessage?: string | null
  onMessageProcessed?: () => void
}

type AssistantBodyProps = {
  showHeading?: boolean
  onStudentClick?: (studentName: string) => void
  incomingMessage?: string | null
  onMessageProcessed?: () => void
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string | React.ReactNode
  timestamp: Date
  isThinking?: boolean
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

function PTMResponseContent({ onStudentClick }: { onStudentClick?: (studentName: string) => void }) {
  const [currentPage, setCurrentPage] = useState(0)

  const topStudents = [
    {
      name: 'Sarah Johnson',
      grade: 'Excellent',
      tags: ['Top performer'],
      description: 'Consistently achieves high grades across all subjects. Shows strong leadership skills and actively participates in class discussions.'
    },
    {
      name: 'Marcus Lee',
      grade: 'Above average',
      tags: ['Improved'],
      description: 'Has shown significant improvement this semester. Particularly strong in mathematics and science subjects.'
    },
    {
      name: 'Emily Wong',
      grade: 'Excellent',
      tags: ['Top performer'],
      description: 'Excels in creative subjects and demonstrates exceptional critical thinking abilities. Active in extracurricular activities.'
    },
    {
      name: 'Daniel Rodriguez',
      grade: 'Above average',
      tags: ['Consistent'],
      description: 'Maintains steady performance across all subjects. Shows good time management and organizational skills.'
    },
    {
      name: 'Aisha Patel',
      grade: 'Above average',
      tags: ['Creative'],
      description: 'Demonstrates strong creative abilities and innovative problem-solving approaches. Excellent collaboration skills.'
    }
  ]

  const otherStudents = [
    {
      name: 'James Wilson',
      grade: 'Average',
      tags: ['Steady'],
      description: 'Maintains consistent performance. Would benefit from additional support in reading comprehension.'
    },
    {
      name: 'Olivia Martinez',
      grade: 'Above average',
      tags: ['Engaged'],
      description: 'Shows enthusiasm in class and actively seeks help when needed. Strong in group work.'
    },
    {
      name: 'Ryan Kim',
      grade: 'Average',
      tags: ['Improving'],
      description: 'Recent improvement noted. Responds well to one-on-one attention and feedback.'
    },
    {
      name: 'Sophie Taylor',
      grade: 'Below average',
      tags: ['Needs support'],
      description: 'Struggling with core concepts. Would benefit from additional tutoring and parental involvement.'
    },
    {
      name: 'Michael Brown',
      grade: 'Average',
      tags: ['Potential'],
      description: 'Shows potential but lacks focus. Encouragement and structured study time recommended.'
    }
  ]

  const studentsToShow = currentPage === 0 ? [] : currentPage === 1 ? topStudents : otherStudents

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        On October 14, 2025, you&apos;ll be meeting with six parents, and there are two important pieces of information regarding two students that you should keep in mind.
      </p>
      <p className="text-sm font-medium">Here are the two students you might want to focus on.</p>

      {/* Student 1 - Alice Wong */}
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border bg-background p-4",
          onStudentClick && "cursor-pointer hover:bg-accent transition-colors"
        )}
        onClick={() => onStudentClick?.('Alice Wong')}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-medium ${getAvatarColor('Alice Wong')}`}>
            {getInitials('Alice Wong')}
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="font-semibold">Alice Wong</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            Excellent
          </span>
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            Hardworking
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Alice recently scored an A in her latest assessment, a significant improvement from her consistent B grades. This positive trend demonstrates her dedication and hard work, making it a meaningful achievement to celebrate with her parents.
        </p>
      </div>

      {/* Student 2 - Reza Halim */}
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border bg-background p-4",
          onStudentClick && "cursor-pointer hover:bg-accent transition-colors"
        )}
        onClick={() => onStudentClick?.('Reza Halim')}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-medium ${getAvatarColor('Reza Halim')}`}>
            {getInitials('Reza Halim')}
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="font-semibold">Reza Halim</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            Above average
          </span>
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            Improved behavior
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Reza has shown remarkable growth and improvement since his last discipline case. The Case Management team&apos;s observations reveal a clear positive trajectory in both his behavior and academic engagement, a story worth celebrating with his parents.
        </p>
      </div>

      {currentPage > 0 && (
        <>
          <p className="text-sm font-medium">{currentPage === 1 ? 'Top 5 students in priority' : 'Other 5 students'}</p>
          {studentsToShow.map((student) => (
            <div
              key={student.name}
              className={cn(
                "flex flex-col gap-3 rounded-lg border bg-background p-4",
                onStudentClick && "cursor-pointer hover:bg-accent transition-colors"
              )}
              onClick={() => onStudentClick?.(student.name)}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-medium ${getAvatarColor(student.name)}`}>
                  {getInitials(student.name)}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="font-semibold">{student.name}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                  {student.grade}
                </span>
                {student.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {student.description}
              </p>
            </div>
          ))}
        </>
      )}

      {currentPage < 2 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {currentPage === 0 ? 'Show all summaries' : 'Show other 5'}
        </Button>
      )}
    </div>
  )
}

function AssistantBody({ onStudentClick, incomingMessage, onMessageProcessed }: AssistantBodyProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
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

      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: 'This is a simulated response. In a real implementation, this would connect to an AI service.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1000)

      onMessageProcessed?.()
    }
  }, [incomingMessage, onMessageProcessed])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'This is a simulated response. In a real implementation, this would connect to an AI service.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
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

    // Send the shortcut command as a message
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: shortcut.command,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Add thinking indicator
    const thinkingMessage: Message = {
      id: generateMessageId(),
      role: 'assistant',
      content: 'Thought for 5 seconds',
      timestamp: new Date(),
      isThinking: true,
    }
    setMessages((prev) => [...prev, thinkingMessage])
    setIsLoading(true)

    // Simulate assistant response
    setTimeout(() => {
      // Remove thinking message and add actual response
      setMessages((prev) => prev.filter((msg) => !msg.isThinking))

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: shortcut.command === '/ptm' ? <PTMResponseContent onStudentClick={onStudentClick} /> : 'This is a simulated response. In a real implementation, this would connect to an AI service.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 5000)
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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:opacity-0 hover:[&::-webkit-scrollbar-thumb]:opacity-100 [&::-webkit-scrollbar-thumb]:transition-opacity">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex flex-col gap-1 text-sm',
                message.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-lg bg-orange-500 p-3 text-white'
                  : message.isThinking
                    ? 'mr-auto flex-row items-center gap-2'
                    : 'mr-auto max-w-full',
              )}
            >
              {message.isThinking ? (
                <>
                  <span className="text-muted-foreground">{message.content}</span>
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                </>
              ) : (
                <>
                  {typeof message.content === 'string' ? (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
            <div className="mr-auto max-w-[85%] rounded-lg bg-background p-3 text-sm">
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
        </div>

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
        <Button variant="ghost" size="sm" className={cn('gap-1.5', className)}>
          {current === 'sidebar' ? (
            <PanelRightIcon className="size-4 text-muted-foreground" />
          ) : current === 'full' ? (
            <MonitorIcon className="size-4 text-muted-foreground" />
          ) : (
            <SquareIcon className="size-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {current === 'sidebar' ? 'Sidebar' : current === 'full' ? 'Full page' : 'Floating'}
          </span>
          <ChevronDownIcon aria-hidden className="size-3 text-muted-foreground" />
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
  incomingMessage,
  onMessageProcessed,
}: AssistantPanelProps) {
  const content = (
    <div className={cn('flex h-full flex-col gap-4 px-2 pb-2 pt-2', className)}>
      {showHeaderControls && (
        <div className="flex items-center justify-between gap-2 px-2 py-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold leading-none">Assistant</h2>
          </div>
          <div className="flex items-center gap-1">
            <AssistantModeSwitcher mode={mode} onModeChange={onModeChange} />
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onOpenChange(false)}
              aria-label="Close assistant"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}
      <AssistantBody
        showHeading={showBodyHeading}
        onStudentClick={onStudentClick}
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
              <AssistantModeSwitcher mode={mode} onModeChange={onModeChange} />
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onOpenChange(false)}
                aria-label="Close assistant"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </SheetHeader>
        )}
        <div className="flex max-h-[calc(100vh-10rem)] min-h-[24rem] flex-col overflow-hidden p-5">
          <AssistantBody
            showHeading={showBodyHeading}
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

