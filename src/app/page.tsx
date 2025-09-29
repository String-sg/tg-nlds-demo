'use client'

import { useEffect, useState } from 'react'

import type { LucideIcon } from 'lucide-react'
import {
  CalendarDaysIcon,
  FileTextIcon,
  FolderIcon,
  InboxIcon,
  LayersIcon,
  ListCheckIcon,
  PlusIcon,
  StarIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const primaryPages = [
  { key: 'welcome', label: 'Welcome', icon: FileTextIcon, tooltip: 'Welcome' },
  { key: 'inbox', label: 'Inbox', icon: InboxIcon, tooltip: 'Inbox' },
  { key: 'tasks', label: 'Tasks', icon: ListCheckIcon, tooltip: 'Tasks' },
  { key: 'calendar', label: 'Calendar', icon: CalendarDaysIcon, tooltip: 'Calendar' },
  {
    key: 'shared-with-me',
    label: 'Shared with Me',
    icon: UsersIcon,
    tooltip: 'Shared with me',
  },
] as const

type PageKey = (typeof primaryPages)[number]['key']
type PageConfig = (typeof primaryPages)[number]

type EmptyState = {
  heading: string
  title: string
  description: string
  icon: LucideIcon
  primaryAction?: string
  secondaryAction?: string
}

const emptyStates: Record<PageKey, EmptyState> = {
  welcome: {
    heading: 'Welcome back, Reza',
    title: 'You’re all set to begin',
    description:
      'Nothing on your workspace yet. Create your first document to kick things off.',
    icon: FileTextIcon,
    primaryAction: 'New Doc',
    secondaryAction: 'Invite a teammate',
  },
  inbox: {
    heading: 'Inbox',
    title: 'No updates right now',
    description:
      'When teammates mention you or share docs, they’ll show up here for quick triage.',
    icon: InboxIcon,
    primaryAction: 'Compose a note',
  },
  tasks: {
    heading: 'Tasks',
    title: 'Stay on top of your work',
    description:
      'Keep track of what’s next by adding tasks, due dates, and owners to your checklist.',
    icon: ListCheckIcon,
    primaryAction: 'Add a task',
  },
  calendar: {
    heading: 'Calendar',
    title: 'Your schedule looks clear',
    description:
      'Link your calendar to review upcoming meetings and plan focus time without conflicts.',
    icon: CalendarDaysIcon,
    primaryAction: 'Connect calendar',
  },
  'shared-with-me': {
    heading: 'Shared with Me',
    title: 'No shared docs yet',
    description:
      'Keep an eye out for folders and documents teammates share. They’ll appear here.',
    icon: UsersIcon,
    primaryAction: 'Browse templates',
  },
}

const pageConfigMap: Record<PageKey, PageConfig> = primaryPages.reduce(
  (acc, page) => {
    acc[page.key] = page
    return acc
  },
  {} as Record<PageKey, PageConfig>,
)

const MAX_TABS = 8

export default function Home() {
  const [openTabs, setOpenTabs] = useState<PageKey[]>(['welcome'])
  const [activeTab, setActiveTab] = useState<PageKey>('welcome')
  const [tabLimitReached, setTabLimitReached] = useState(false)

  const currentState = emptyStates[activeTab]
  const ActiveIcon = currentState.icon

  const handleNavigate = (pageKey: PageKey) => {
    setOpenTabs((tabs) => {
      if (tabs.includes(pageKey)) {
        setActiveTab(pageKey)
        return tabs
      }

      if (tabs.length >= MAX_TABS) {
        setTabLimitReached(true)
        return tabs
      }

      const nextTabs = [...tabs, pageKey]
      setActiveTab(pageKey)
      return nextTabs
    })
  }

  const handleCloseTab = (pageKey: PageKey) => {
    setOpenTabs((tabs) => {
      if (tabs.length === 1) {
        return tabs
      }

      const filteredTabs = tabs.filter((key) => key !== pageKey)

      setActiveTab((currentActive) => {
        if (currentActive !== pageKey) {
          return currentActive
        }

        const closingIndex = tabs.indexOf(pageKey)
        return (
          filteredTabs[closingIndex - 1] ??
          filteredTabs[closingIndex] ??
          filteredTabs[filteredTabs.length - 1] ??
          'welcome'
        )
      })

      return filteredTabs.length > 0 ? filteredTabs : (['welcome'] as PageKey[])
    })
  }

  useEffect(() => {
    if (openTabs.length < MAX_TABS) {
      setTabLimitReached(false)
    }
  }, [openTabs])

  const handleNewTab = () => {
    handleNavigate('welcome')
  }

  return (
    <div className="flex min-h-svh w-full bg-background">
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent className="gap-6">
          <SidebarGroup className="gap-3">
            <div className="flex h-8 w-full items-center justify-between px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <SidebarGroupLabel className="flex-1 truncate px-0 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:hidden">
                Reza’s Space
              </SidebarGroupLabel>
              <SidebarTrigger className="size-7 shrink-0" />
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryPages.map((page) => {
                  const Icon = page.icon

                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        tooltip={page.tooltip}
                        isActive={activeTab === page.key}
                        onClick={() => handleNavigate(page.key)}
                        type="button"
                      >
                        <Icon className="size-4" />
                        <span>{page.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="gap-3">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60">
              Starred
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Launch Plan">
                    <StarIcon className="size-4" />
                    <span>Launch Plan</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="gap-3">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60">
              Folders
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Unsorted">
                    <FolderIcon className="size-4" />
                    <span>Unsorted</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Work">
                    <LayersIcon className="size-4" />
                    <span>Work</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border px-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 rounded-lg border border-sidebar-border/40 bg-sidebar/30 px-4 py-3 shadow-sm transition-colors hover:bg-sidebar/40 hover:text-sidebar-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
            aria-label="Create new document"
          >
            <PlusIcon className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              New Doc
            </span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-border/70 bg-muted/20 px-4">
            <div className="flex items-center gap-2 overflow-x-auto py-2">
              {openTabs.map((tabKey) => {
                const tab = pageConfigMap[tabKey]
                const Icon = tab.icon
                const isActive = activeTab === tabKey
                const isClosable = tabKey !== 'welcome'

                return (
                  <div
                    key={tabKey}
                    className={cn(
                      'group relative flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'border-border bg-background text-foreground shadow-sm'
                        : 'border-transparent bg-transparent text-muted-foreground hover:bg-background/70',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab(tabKey)}
                      className="flex items-center gap-2 truncate"
                    >
                      <Icon className="size-4" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                    {isClosable && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleCloseTab(tabKey)
                        }}
                        className="text-muted-foreground/80 hover:text-foreground flex size-6 items-center justify-center rounded"
                        aria-label={`Close ${tab.label}`}
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 gap-2"
                onClick={handleNewTab}
                disabled={tabLimitReached}
              >
                <PlusIcon className="size-4" />
                New Tab
              </Button>
            </div>
            {tabLimitReached && (
              <div className="pb-2 text-xs text-muted-foreground">
                You’ve reached the tab limit. Close an open page before adding a new
                one.
              </div>
            )}
          </div>
          <div className="flex h-16 items-center gap-3 border-b px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden flex-1 md:flex">
              <h1 className="text-lg font-semibold tracking-tight">
                {currentState.heading}
              </h1>
            </div>
            <Button size="sm" variant="outline">
              Customize
            </Button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto px-8 py-10">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full">
                <ActiveIcon className="size-7" />
              </div>
              <div className="mt-6 space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {currentState.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {currentState.description}
                </p>
              </div>
              {(currentState.primaryAction || currentState.secondaryAction) && (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {currentState.primaryAction && (
                    <Button size="sm">{currentState.primaryAction}</Button>
                  )}
                  {currentState.secondaryAction && (
                    <Button size="sm" variant="outline">
                      {currentState.secondaryAction}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}
