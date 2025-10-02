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

const quickActions = [
  { label: 'Summarize this page', prompt: 'Summarize the content on this page' },
  { label: 'Explain concept', prompt: 'Explain the key concepts shown here' },
  { label: 'Suggest improvements', prompt: 'Suggest improvements for this page' },
]

function AssistantBody({ showHeading = true }: AssistantBodyProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {showHeading && (
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Assistant</h3>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col gap-4 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-4">
          <p className="text-sm text-muted-foreground">
            Ask questions, request summaries, or get insights about the current page.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-lg border bg-muted/20 p-4">
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
      )}

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the assistant anything... (Press Enter to send)"
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
        <p className="text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> to send,{' '}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Shift+Enter</kbd> for new line
        </p>
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
    <div className={cn('flex h-full flex-col gap-4 p-6', className)}>
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
        className="bottom-4 right-4 top-auto h-auto max-h-[calc(100vh-2rem)] w-[min(95vw,22rem)] translate-x-0 rounded-2xl border shadow-2xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:bottom-6 sm:right-6 sm:w-[26rem] md:w-[28rem]"
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

