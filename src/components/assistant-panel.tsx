'use client'

import { CheckIcon, ChevronDownIcon, MonitorIcon, PanelRightIcon, SquareIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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

function AssistantBody({ showHeading = true }: AssistantBodyProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-4 text-sm text-muted-foreground">
      {showHeading && <p className="font-medium text-foreground">Assistant</p>}
      <p>
        This is where contextual responses, summaries, and actions would show up.
        Share the current page or ask for insights to get started.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm">Ask a question</Button>
        <Button size="sm" variant="outline">
          Recent activity
        </Button>
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
    <div className={cn('flex h-full flex-col gap-4 p-4', className)}>
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
        className="bottom-6 right-4 top-auto h-auto w-[min(92vw,22rem)] translate-x-0 rounded-2xl border shadow-2xl sm:bottom-8 sm:w-[24rem]"
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
        <div className="min-h-[30rem] max-h-[90vh] space-y-4 overflow-y-auto p-5">
          <AssistantBody showHeading={showBodyHeading} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { AssistantBody }
export type { AssistantMode, AssistantPanelProps }

