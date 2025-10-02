'use client'

import { useState } from 'react'
import { CheckIcon, ChevronDownIcon, MonitorIcon, PanelRightIcon, SendIcon, SparklesIcon, SquareIcon, XIcon } from 'lucide-react'

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
}

type AssistantBodyProps = {
  showHeading?: boolean
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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

function AssistantBody({ showHeading = true }: AssistantBodyProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [filteredShortcuts, setFilteredShortcuts] = useState(promptShortcuts)
  const [selectedShortcutIndex, setSelectedShortcutIndex] = useState(0)

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
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
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a simulated response. In a real implementation, this would connect to an AI service.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
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

  const handleShortcutSelect = (shortcut: typeof promptShortcuts[0]) => {
    setInput(shortcut.command)
    setShowShortcuts(false)
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
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-lg bg-muted/20">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex flex-col gap-1 rounded-lg p-3 text-sm',
                message.role === 'user'
                  ? 'ml-auto max-w-[85%] bg-primary text-primary-foreground'
                  : 'mr-auto max-w-[85%] bg-background',
              )}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <span className="text-xs opacity-60">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
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
            className="min-h-[80px] resize-none pr-12"
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
}: AssistantPanelProps) {
  const content = (
    <div className={cn('flex h-full flex-col gap-4 px-4 pb-4 pt-2', className)}>
      {showHeaderControls && (
        <div className="flex items-center justify-between gap-2">
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
      <AssistantBody showHeading={showBodyHeading} />
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
          <AssistantBody showHeading={showBodyHeading} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { AssistantBody }
export type { AssistantMode, AssistantPanelProps }

