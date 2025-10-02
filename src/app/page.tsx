'use client'

import { useCallback, useEffect, useState } from 'react'

import type { LucideIcon } from 'lucide-react'
import {
  BotIcon,
  CalendarDaysIcon,
  FilePenIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  NewspaperIcon,
  PieChartIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'

import {
  AssistantBody,
  AssistantModeSwitcher,
  AssistantPanel,
  type AssistantMode,
} from '@/components/assistant-panel'
import { Button } from '@/components/ui/button'
import { HomeContent } from '@/components/home-content'
import { RoundupContent } from '@/components/roundup-content'
import { ClassView } from '@/components/class-view'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const primaryPages = [
  { key: 'roundup', label: 'Round-up', icon: NewspaperIcon, tooltip: 'Round-up' },
  { key: 'home', label: 'Home', icon: HomeIcon, tooltip: 'Home' },
  { key: 'classroom', label: 'Classroom', icon: UsersIcon, tooltip: 'Classroom' },
  { key: 'draft', label: 'Draft', icon: FilePenIcon, tooltip: 'Drafts' },
  { key: 'calendar', label: 'Calendar', icon: CalendarDaysIcon, tooltip: 'Calendar' },
  { key: 'analysis', label: 'Analysis', icon: PieChartIcon, tooltip: 'Analysis' },
  { key: 'inbox', label: 'Inbox', icon: InboxIcon, tooltip: 'Inbox' },
] as const

const newTabConfig = {
  key: 'new-tab',
  label: 'New Tab',
  icon: PlusIcon,
  tooltip: 'New tab',
} as const

const profileTabConfig = {
  key: 'profile',
  label: 'Profile',
  icon: UserIcon,
  tooltip: 'Profile',
} as const

const assistantTabConfig = {
  key: 'assistant',
  label: 'Assistant',
  icon: BotIcon,
  tooltip: 'Assistant',
} as const

type PrimaryPageKey = (typeof primaryPages)[number]['key']
type ProfileTabKey = typeof profileTabConfig['key']
type AssistantTabKey = typeof assistantTabConfig['key']
type PageKey = PrimaryPageKey | ProfileTabKey
type ClosableTabKey = PageKey | AssistantTabKey
type TabKey = typeof newTabConfig['key'] | ClosableTabKey
type PageConfig = (typeof primaryPages)[number] | typeof profileTabConfig
type TabConfig = PageConfig | typeof newTabConfig | typeof assistantTabConfig

type EmptyState = {
  heading: string
  title: string
  description: string
  icon: LucideIcon
  primaryAction?: string
  secondaryAction?: string
}

const emptyStates: Record<TabKey, EmptyState> = {
  'new-tab': {
    heading: 'New Tab',
    title: 'Create your first tab',
    description:
      'Open a page from the sidebar or start with a preselected one to jump into your workspace.',
    icon: PlusIcon,
  },
  roundup: {
    heading: 'Round-up',
    title: 'No highlights yet',
    description:
      'Summaries and noteworthy updates from your team will appear here once activity picks up.',
    icon: NewspaperIcon,
    primaryAction: 'Share an update',
  },
  home: {
    heading: 'Home',
    title: "You're all set to begin",
    description:
      'Start exploring your workspace or jump into a project to keep momentum going.',
    icon: HomeIcon,
    primaryAction: 'Create reminder',
    secondaryAction: 'Invite a teammate',
  },
  classroom: {
    heading: 'Classroom',
    title: 'Your classroom view',
    description:
      'View and manage your students, track attendance, grades, and conduct.',
    icon: UsersIcon,
    primaryAction: 'Add student',
    secondaryAction: 'Export data',
  },
  draft: {
    heading: 'Drafts',
    title: 'No drafts on file',
    description:
      'Capture your thoughts and save them as drafts to revisit and refine later.',
    icon: FilePenIcon,
    primaryAction: 'Compose draft',
  },
  calendar: {
    heading: 'Calendar',
    title: 'Your schedule looks clear',
    description:
      'Link your calendar to review upcoming meetings and plan focus time without conflicts.',
    icon: CalendarDaysIcon,
    primaryAction: 'Connect calendar',
  },
  analysis: {
    heading: 'Analysis',
    title: 'No insights generated',
    description:
      'Run reports or review metrics to uncover patterns and stay ahead of upcoming work.',
    icon: PieChartIcon,
    primaryAction: 'Build report',
  },
  inbox: {
    heading: 'Inbox',
    title: 'No updates right now',
    description:
      'When teammates mention you or share docs, they’ll show up here for quick triage.',
    icon: InboxIcon,
    primaryAction: 'Compose a note',
  },
  profile: {
    heading: 'Profile',
    title: 'Complete your profile details',
    description:
      'Add a bio, contact information, and personalize your presence so teammates know who you are.',
    icon: UserIcon,
    primaryAction: 'Edit profile',
    secondaryAction: 'Upload photo',
  },
  assistant: {
    heading: 'Assistant',
    title: 'Ask the assistant',
    description:
      'Summarize this page, ask for insights, or draft quick updates without leaving your flow.',
    icon: BotIcon,
    primaryAction: 'Start a prompt',
    secondaryAction: 'Share context',
  },
}

const pageConfigMap: Record<PageKey, PageConfig> = primaryPages.reduce(
  (acc, page) => {
    acc[page.key] = page
    return acc
  },
  { [profileTabConfig.key]: profileTabConfig } as Record<PageKey, PageConfig>,
)

const tabConfigMap: Record<TabKey, TabConfig> = {
  [newTabConfig.key]: newTabConfig,
  ...pageConfigMap,
  [assistantTabConfig.key]: assistantTabConfig,
}

const MAX_TABS = 8

export default function Home() {
  const { state: sidebarState } = useSidebar()
  const [openTabs, setOpenTabs] = useState<ClosableTabKey[]>(['roundup'])
  const [activeTab, setActiveTab] = useState<TabKey>('roundup')
  const [tabLimitReached, setTabLimitReached] = useState(false)
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('sidebar')
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [draggedTab, setDraggedTab] = useState<ClosableTabKey | null>(null)
  const [dragOverTab, setDragOverTab] = useState<ClosableTabKey | null>(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  const currentState = emptyStates[activeTab]
  const ActiveIcon = currentState.icon
  const isNewTabActive = activeTab === newTabConfig.key
  const isProfileActive = activeTab === profileTabConfig.key
  const isAssistantTabActive = activeTab === assistantTabConfig.key
  const isHomeActive = activeTab === 'home'
  const isSidebarCollapsed = sidebarState === 'collapsed'
  const isAssistantSidebarOpen = assistantMode === 'sidebar' && isAssistantOpen

  const handleNavigate = (tabKey: ClosableTabKey) => {
    setOpenTabs((tabs) => {
      if (tabs.includes(tabKey)) {
        setActiveTab(tabKey)
        return tabs
      }

      if (
        tabs.length >= MAX_TABS &&
        tabKey !== profileTabConfig.key &&
        tabKey !== assistantTabConfig.key
      ) {
        setTabLimitReached(true)
        return tabs
      }

      const nextTabs = [...tabs, tabKey]

      setActiveTab(tabKey)
      return nextTabs
    })
  }

  const handleCloseTab = useCallback((pageKey: TabKey) => {
    setOpenTabs((tabs) => {
      if (pageKey === newTabConfig.key) {
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
          (filteredTabs.length > 0 ? filteredTabs[filteredTabs.length - 1] : newTabConfig.key)
        )
      })

      return filteredTabs
    })
  }, [])

  useEffect(() => {
    if (openTabs.length < MAX_TABS) {
      setTabLimitReached(false)
    }
  }, [openTabs])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculate visible tab count based on screen width
  const getVisibleTabCount = () => {
    if (windowWidth < 640) return 2  // Mobile
    if (windowWidth < 768) return 3  // Small tablet
    if (windowWidth < 1024) return 4 // Tablet
    if (windowWidth < 1280) return 5 // Laptop
    return 6 // Desktop
  }

  const visibleTabCount = getVisibleTabCount()

  // Ensure active tab is always visible
  let visibleTabs = [...openTabs]
  let hiddenTabs: ClosableTabKey[] = []

  if (openTabs.length > visibleTabCount) {
    const activeIndex = openTabs.indexOf(activeTab as ClosableTabKey)

    if (activeIndex >= visibleTabCount) {
      // If active tab is hidden, swap it with the last visible tab
      visibleTabs = [...openTabs]
      ;[visibleTabs[visibleTabCount - 1], visibleTabs[activeIndex]] =
        [visibleTabs[activeIndex], visibleTabs[visibleTabCount - 1]]
    }

    hiddenTabs = visibleTabs.slice(visibleTabCount)
    visibleTabs = visibleTabs.slice(0, visibleTabCount)
  }

  const handleNewTab = () => {
    setActiveTab(newTabConfig.key)
  }

  const handleAssistantButtonClick = useCallback(() => {
    if (assistantMode === 'floating') {
      setIsAssistantOpen((previous) => !previous)
      return
    }

    setIsAssistantOpen((previous) => !previous)
  }, [assistantMode])

  const handleAssistantModeChange = (mode: AssistantMode | 'full') => {
    if (mode === 'full') {
      setAssistantMode('sidebar')
      setIsAssistantOpen(false)
      handleNavigate(assistantTabConfig.key)
      return
    }

    if (mode === 'floating') {
      setAssistantMode('floating')
      setIsAssistantOpen(true)
      if (isAssistantTabActive) {
        handleCloseTab(assistantTabConfig.key)
      }
      return
    }

    // Sidebar mode - keep assistant open without forcing navigation
    setAssistantMode('sidebar')
    setIsAssistantOpen(true)
    if (isAssistantTabActive) {
      handleCloseTab(assistantTabConfig.key)
    }
  }

  const handleDragStart = (event: React.DragEvent, tabKey: ClosableTabKey) => {
    setDraggedTab(tabKey)
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  const handleDragEnd = () => {
    setDraggedTab(null)
    setDragOverTab(null)
  }

  const handleDragOver = (event: React.DragEvent, tabKey: ClosableTabKey) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    
    if (draggedTab && draggedTab !== tabKey) {
      setDragOverTab(tabKey)
    }
  }

  const handleDragLeave = () => {
    setDragOverTab(null)
  }

  const handleDrop = (event: React.DragEvent, targetTabKey: ClosableTabKey) => {
    event.preventDefault()
    
    if (!draggedTab || draggedTab === targetTabKey) {
      setDraggedTab(null)
      setDragOverTab(null)
      return
    }

    setOpenTabs((tabs) => {
      const draggedIndex = tabs.indexOf(draggedTab)
      const targetIndex = tabs.indexOf(targetTabKey)

      if (draggedIndex === -1 || targetIndex === -1) {
        return tabs
      }

      const newTabs = [...tabs]
      newTabs.splice(draggedIndex, 1)
      newTabs.splice(targetIndex, 0, draggedTab)

      return newTabs
    })

    setDraggedTab(null)
    setDragOverTab(null)
  }

  // Keyboard shortcut for assistant toggle (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isAssistantTabActive) {
          handleCloseTab(assistantTabConfig.key)
        } else {
          handleAssistantButtonClick()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAssistantTabActive, handleAssistantButtonClick, handleCloseTab])

  return (
    <div className="flex min-h-svh w-full bg-background">
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent className="gap-6">
          <SidebarGroup className="gap-3">
            <div className="flex h-8 w-full items-center justify-between px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <SidebarGroupLabel className="flex-1 truncate px-0 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:hidden">
                Ah Meng&apos;s Space
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
              Folders
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="2025">
                    <FolderIcon className="size-4" />
                    <span>2025</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border px-3 py-4">
          <div className={cn(isSidebarCollapsed && 'flex justify-center')}>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleNavigate(profileTabConfig.key)}
                    aria-label="Open profile"
                    aria-pressed={isProfileActive}
                    className={cn(
                      'group/profile flex h-10 w-full items-center justify-start gap-3 rounded-xl px-1 text-left text-sidebar-foreground transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isProfileActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                      'group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:transition-none',
                      'group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:hover:text-sidebar-foreground group-data-[collapsible=icon]:focus-visible:ring-0',
                      isProfileActive &&
                        'group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:text-sidebar-accent-foreground',
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-foreground/15 text-sm font-semibold text-sidebar-foreground transition-colors',
                        'group-hover/profile:bg-sidebar-accent-foreground/15 group-hover/profile:text-sidebar-accent-foreground',
                        isProfileActive && 'bg-sidebar-accent-foreground/20 text-sidebar-accent-foreground',
                      )}
                    >
                      TA
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors group-data-[collapsible=icon]:hidden',
                        isProfileActive && 'text-sidebar-accent-foreground',
                      )}
                    >
                      Tan Ah Meng
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" hidden={!isSidebarCollapsed}>
                  View profile
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-20 overflow-hidden rounded-t-2xl bg-background">
            <div className="border-b border-border/70 bg-muted/20 px-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 py-2">
                <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={150}>
                      {visibleTabs.map((tabKey, index) => {
                    const tab = tabConfigMap[tabKey]

                    if (!tab) {
                      return null
                    }

                    const Icon = tab.icon
                    const isActive = activeTab === tabKey
                    const isDragging = draggedTab === tabKey
                    const isDragOver = dragOverTab === tabKey
                    const draggedIndex = draggedTab ? visibleTabs.indexOf(draggedTab) : -1
                    const showIndicatorLeft = isDragOver && draggedIndex > index
                    const showIndicatorRight = isDragOver && draggedIndex < index
                    
                    return (
                      <button
                        key={tabKey}
                        type="button"
                        data-tab-item
                        draggable
                        onDragStart={(e) => handleDragStart(e, tabKey)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, tabKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, tabKey)}
                        onClick={() => setActiveTab(tabKey)}
                        className={cn(
                          'group relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-200',
                        isActive
                          ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                          isDragging && 'opacity-30',
                        )}
                      >
                        {showIndicatorLeft && (
                          <div className="absolute -left-1 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                        )}
                        {showIndicatorRight && (
                          <div className="absolute -right-1 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                        )}
                        <Icon className="size-4" />
                        <span className="truncate">{tab.label}</span>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation()
                            handleCloseTab(tabKey)
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              event.stopPropagation()
                              handleCloseTab(tabKey)
                            }
                          }}
                          className="text-muted-foreground/80 hover:text-foreground focus-visible:text-foreground flex size-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 group-[.ring-1]:opacity-100"
                          aria-label={`Close ${tab.label}`}
                        >
                          <XIcon className="size-3.5" />
                        </div>
                      </button>
                    )
                  })}
                  <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleNewTab}
                        disabled={tabLimitReached}
                        className={cn(
                          'flex h-9 items-center rounded-md transition-colors',
                          isNewTabActive
                            ? 'gap-2 px-3 py-1.5 text-sm bg-background text-foreground shadow-sm ring-1 ring-border'
                            : 'w-9 justify-center text-muted-foreground hover:bg-accent hover:text-foreground',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                        aria-label="Open new tab"
                      >
                        <PlusIcon className="size-4" />
                        {isNewTabActive && <span className="truncate">{newTabConfig.label}</span>}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">New Tab</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* More dropdown for hidden tabs */}
                {hiddenTabs.length > 0 && (
                  <Tooltip>
                    <DropdownMenu>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label={`${hiddenTabs.length} more tabs`}
                          >
                            <MoreHorizontalIcon className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {hiddenTabs.length} more {hiddenTabs.length === 1 ? 'tab' : 'tabs'}
                      </TooltipContent>
                    <DropdownMenuContent align="start" className="w-56">
                      {hiddenTabs.map((tabKey) => {
                        const tab = tabConfigMap[tabKey]
                        if (!tab) return null
                        const Icon = tab.icon
                        const isActive = activeTab === tabKey

                        return (
                          <DropdownMenuItem
                            key={tabKey}
                            className={cn(
                              "flex items-center justify-between",
                              isActive && "bg-accent"
                            )}
                            onClick={() => setActiveTab(tabKey)}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="size-4" />
                              <span>{tab.label}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCloseTab(tabKey)
                              }}
                              className="ml-2 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                              aria-label={`Close ${tab.label}`}
                            >
                              <XIcon className="size-3" />
                            </button>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </Tooltip>
                )}
                </div>

                {!isAssistantTabActive && (
                  <div className="ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={handleAssistantButtonClick}
                      aria-expanded={isAssistantOpen}
                      aria-controls="assistant-panel"
                    >
                      <MessageSquareIcon className="size-4" />
                      Assistant
                    </Button>
                  </div>
                )}
              </div>
              {tabLimitReached && (
                <div className="pb-2 text-xs text-muted-foreground">
                  You’ve reached the tab limit. Close an open page before adding a new
                  one.
                </div>
              )}
            </div>
            <div className="flex h-16 items-center gap-3 border-b bg-background px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden flex-1 md:flex">
                <h1 className="text-lg font-semibold tracking-tight">
                  {currentState ? currentState.heading : 'New Tab'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {isAssistantTabActive && (
                  <AssistantModeSwitcher
                    mode={assistantMode}
                    onModeChange={handleAssistantModeChange}
                    activeOption={isAssistantTabActive ? 'full' : assistantMode}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden rounded-b-[15px]">
            <div
                className={cn(
                  'flex flex-1 flex-col overflow-y-auto',
                  activeTab === 'roundup' ? '' : 'px-8 py-10',
                )}
              >
                {isAssistantTabActive ? (
                  <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6">
                    {assistantMode === 'sidebar' ? (
                      <AssistantPanel
                        mode="sidebar"
                        isOpen
                        onOpenChange={setIsAssistantOpen}
                        onModeChange={handleAssistantModeChange}
                        showBodyHeading={false}
                        showHeaderControls={false}
                      />
                    ) : (
                      <AssistantBody showHeading={false} />
                    )}
                  </div>
                ) : isHomeActive ? (
                  <HomeContent onNavigateToClassroom={() => handleNavigate('classroom')} />
                ) : activeTab === 'roundup' ? (
                  <RoundupContent />
                ) : activeTab === 'classroom' ? (
                  <ClassView />
                ) : currentState ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full">
                      {ActiveIcon ? <ActiveIcon className="size-7" /> : <PlusIcon className="size-7" />}
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
                    {isProfileActive && (
                      <div className="mt-10 w-full max-w-md text-left">
                        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary transition-colors group-hover:bg-primary/20">
                              TA
                            </div>
                            <div className="flex flex-1 flex-col">
                              <h3 className="text-base font-semibold">Tan Ah Meng</h3>
                              <p className="text-muted-foreground text-sm">
                                Product Strategist · Ready to collaborate
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg border border-dashed border-border/60 bg-background/80 p-3 transition group-hover:border-border">
                              <p className="text-muted-foreground text-xs uppercase tracking-wide">Bio</p>
                              <p className="mt-1 font-medium">Tell your story here…</p>
                            </div>
                            <div className="rounded-lg border border-dashed border-border/60 bg-background/80 p-3 transition group-hover:border-border">
                              <p className="text-muted-foreground text-xs uppercase tracking-wide">Availability</p>
                              <p className="mt-1 font-medium">Set your schedule</p>
                            </div>
                          </div>
                          <div className="mt-6 flex flex-wrap gap-2">
                            <Button size="sm">Preview profile</Button>
                            <Button size="sm" variant="ghost">
                              Share profile link
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full">
                      <PlusIcon className="size-7" />
                    </div>
                    <div className="mt-6 space-y-2">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Create your first tab
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Open a page from the sidebar or start with a preselected one
                        to jump into your workspace.
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      <Button size="sm" onClick={() => handleNavigate('home')}>
                        Go Home
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleNavigate('roundup')}>
                        Open Round-up
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>

        {/* Right sidebar panel for assistant in sidebar mode */}
        {assistantMode === 'sidebar' && (
          <div
            className="group text-sidebar-foreground hidden md:block"
            data-state={isAssistantOpen ? 'expanded' : 'collapsed'}
            data-collapsible="offcanvas"
            data-variant="inset"
            data-side="right"
          >
            {/* Sidebar gap */}
            <div
              className={cn(
                'relative w-[20rem] bg-transparent transition-[width] duration-150 ease-in-out',
                !isAssistantOpen && 'w-0',
              )}
            />
            {/* Sidebar container */}
            <div
              className={cn(
                'fixed inset-y-0 z-10 hidden h-svh w-[20rem] transition-[right,width] duration-150 ease-in-out md:flex',
                'right-0 p-2',
                !isAssistantOpen && 'right-[calc(20rem*-1)]',
              )}
            >
              <div className="bg-sidebar border-sidebar-border flex h-full w-full flex-col rounded-2xl border">
                <AssistantPanel
                  mode="sidebar"
                  isOpen={isAssistantOpen}
                  onOpenChange={setIsAssistantOpen}
                  onModeChange={handleAssistantModeChange}
                  className="flex h-full w-full flex-col"
                />
              </div>
            </div>
          </div>
        )}

        {/* Floating mode assistant panel */}
        {assistantMode === 'floating' && isAssistantOpen && (
          <AssistantPanel
            mode="floating"
            isOpen={isAssistantOpen}
            onOpenChange={setIsAssistantOpen}
            onModeChange={handleAssistantModeChange}
          />
        )}
      </div>
    )
  }
