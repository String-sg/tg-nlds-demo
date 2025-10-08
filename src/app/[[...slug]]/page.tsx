'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  Compass,
  FilePen,
  GraduationCap,
  Home as HomeIcon,
  Inbox,
  MessageSquare,
  MoreHorizontal,
  PieChart,
  Plus,
  User,
  Users,
  X,
  Zap,
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
import { MyClasses } from '@/components/classroom/my-classes'
import { ClassOverview } from '@/components/classroom/class-overview'
import { StudentList } from '@/components/classroom/student-list'
import { GradeEntry } from '@/components/classroom/grade-entry'
import { StudentProfile } from '@/components/student-profile'
import { RecordsContent } from '@/components/records-content'
import { ExploreContent } from '@/components/explore-content'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserProvider } from '@/contexts/user-context'
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
  SidebarSeparator,
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
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'

const primaryPages = [
  { key: 'roundup', label: 'Pulse', icon: Zap, tooltip: 'Pulse' },
  { key: 'home', label: 'Home', icon: HomeIcon, tooltip: 'Home' },
  { key: 'explore', label: 'Explore', icon: Compass, tooltip: 'Explore' },
  { key: 'classroom', label: 'Classroom', icon: Users, tooltip: 'Classroom' },
  { key: 'records', label: 'Records', icon: ClipboardList, tooltip: 'Records' },
  { key: 'draft', label: 'Draft', icon: FilePen, tooltip: 'Drafts' },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays, tooltip: 'Calendar' },
  { key: 'analysis', label: 'Analysis', icon: PieChart, tooltip: 'Analysis' },
  { key: 'inbox', label: 'Inbox', icon: Inbox, tooltip: 'Inbox' },
] as const

const newTabConfig = {
  key: 'new-tab',
  label: 'New Tab',
  icon: Plus,
  tooltip: 'New tab',
} as const

const profileTabConfig = {
  key: 'profile',
  label: 'Profile',
  icon: User,
  tooltip: 'Profile',
} as const

const assistantTabConfig = {
  key: 'assistant',
  label: 'Assistant',
  icon: Bot,
  tooltip: 'Assistant',
} as const

type PrimaryPageKey = (typeof primaryPages)[number]['key']
type ProfileTabKey = typeof profileTabConfig['key']
type AssistantTabKey = typeof assistantTabConfig['key']
type StudentProfileTabKey = `student-${string}` // Dynamic student profile tabs (standalone)
type ClassroomTabKey = `classroom/${string}` // Dynamic classroom tabs with forward slash
type PageKey = PrimaryPageKey | ProfileTabKey
type ClosableTabKey = PageKey | AssistantTabKey | StudentProfileTabKey | ClassroomTabKey
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
    icon: Plus,
  },
  roundup: {
    heading: 'Pulse',
    title: 'No highlights yet',
    description:
      'Summaries and noteworthy updates from your team will appear here once activity picks up.',
    icon: Zap,
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
  explore: {
    heading: 'Explore',
    title: 'Discover all available apps',
    description:
      'Browse through all apps and find the tools you need to enhance your workflow.',
    icon: Compass,
    primaryAction: 'View all apps',
  },
  classroom: {
    heading: 'Classroom',
    title: 'Your classroom view',
    description:
      'View and manage your students, track attendance, grades, and conduct.',
    icon: Users,
    primaryAction: 'Add student',
    secondaryAction: 'Export data',
  },
  records: {
    heading: 'Records',
    title: 'No records yet',
    description:
      'Track attendance, results, and case management for your students.',
    icon: ClipboardList,
    primaryAction: 'Create record',
  },
  draft: {
    heading: 'Drafts',
    title: 'No drafts on file',
    description:
      'Capture your thoughts and save them as drafts to revisit and refine later.',
    icon: FilePen,
    primaryAction: 'Compose draft',
  },
  calendar: {
    heading: 'Calendar',
    title: 'Your schedule looks clear',
    description:
      'Link your calendar to review upcoming meetings and plan focus time without conflicts.',
    icon: CalendarDays,
    primaryAction: 'Connect calendar',
  },
  analysis: {
    heading: 'Analysis',
    title: 'No insights generated',
    description:
      'Run reports or review metrics to uncover patterns and stay ahead of upcoming work.',
    icon: PieChart,
    primaryAction: 'Build report',
  },
  inbox: {
    heading: 'Inbox',
    title: 'No updates right now',
    description:
      "When teammates mention you or share docs, they'll show up here for quick triage.",
    icon: Inbox,
    primaryAction: 'Compose a note',
  },
  profile: {
    heading: 'Profile',
    title: 'Complete your profile details',
    description:
      'Add a bio, contact information, and personalize your presence so teammates know who you are.',
    icon: User,
    primaryAction: 'Edit profile',
    secondaryAction: 'Upload photo',
  },
  assistant: {
    heading: 'Assistant',
    title: 'Ask the assistant',
    description:
      'Summarize this page, ask for insights, or draft quick updates without leaving your flow.',
    icon: Bot,
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

export default function Home() {
  const router = useRouter()
  const params = useParams()
  const { state: sidebarState } = useSidebar()

  // Initialize from sessionStorage to persist across page remounts
  const [openTabs, setOpenTabs] = useState<ClosableTabKey[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('openTabs')
      return stored ? JSON.parse(stored) : ['home']
    }
    return ['home']
  })

  const openTabsRef = useRef<ClosableTabKey[]>(openTabs) // Track current tabs in ref
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('sidebar')
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [draggedTab, setDraggedTab] = useState<ClosableTabKey | null>(null)
  const [dragOverTab, setDragOverTab] = useState<ClosableTabKey | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [studentProfileTabs, setStudentProfileTabs] = useState<Map<string, string>>(() => {
    // Initialize from sessionStorage to persist across navigation
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('studentProfileTabs')
      if (stored) {
        try {
          return new Map(JSON.parse(stored))
        } catch (e) {
          // Failed to parse studentProfileTabs from sessionStorage
        }
      }
    }
    return new Map()
  })
  const [classroomTabs, setClassroomTabs] = useState<Map<string, string>>(() => {
    // Initialize from sessionStorage to persist across navigation
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('classroomTabs')
      if (stored) {
        try {
          return new Map(JSON.parse(stored))
        } catch (e) {
          // Failed to parse classroomTabs from sessionStorage
        }
      }
    }
    return new Map()
  })
  const studentProfileTabsRef = useRef<Map<string, string>>(studentProfileTabs) // Ref for immediate access
  const classroomTabsRef = useRef<Map<string, string>>(classroomTabs) // Ref for immediate access
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState<string | null>(null)
  const tabContainerRef = useRef<HTMLDivElement>(null)

  // Helper to determine if a tab is a top-level page
  const isTopLevelTab = (tabKey: string): boolean => {
    const topLevelKeys = primaryPages.map((p) => p.key)
    return topLevelKeys.includes(tabKey as PrimaryPageKey) || tabKey === profileTabConfig.key
  }

  // Helper to get parent tab of a child tab
  const getParentTab = (tabKey: string): string | null => {
    if (tabKey.startsWith('classroom/')) {
      // For classroom routes, check if it's a nested route
      const parts = tabKey.split('/')
      if (parts.length > 2) {
        // classroom/{classId}/... -> return classroom/{classId}
        return `${parts[0]}/${parts[1]}`
      }
      // classroom/{classId} -> return classroom
      return 'classroom'
    }
    if (tabKey.startsWith('student-')) {
      // Student profiles don't have a fixed parent, return null
      return null
    }
    return null
  }

  // Sync refs with state and persist to sessionStorage
  useEffect(() => {
    studentProfileTabsRef.current = studentProfileTabs
    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('studentProfileTabs', JSON.stringify(Array.from(studentProfileTabs.entries())))
    }
  }, [studentProfileTabs])

  useEffect(() => {
    classroomTabsRef.current = classroomTabs
    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('classroomTabs', JSON.stringify(Array.from(classroomTabs.entries())))
    }
  }, [classroomTabs])

  // Sync URL with active tab on mount and URL changes
  useEffect(() => {
    const slug = params.slug as string[] | undefined
    const tabFromUrl = !slug || slug.length === 0 ? 'home' : slug.join('/')

    setActiveTab(tabFromUrl as TabKey)

    // Always add tab to openTabs if not present (handles all navigation - always opens new tabs)
    // Use ref to get the most current tab list, avoiding stale closures in Strict Mode double-render
    const currentTabsFromRef = openTabsRef.current
    const tabExists = currentTabsFromRef.includes(tabFromUrl as ClosableTabKey)

    if (!tabExists) {
      // Filter out the tab first to prevent any duplicates from race conditions
      const filteredTabs = currentTabsFromRef.filter(t => t !== (tabFromUrl as ClosableTabKey))
      const newTabs = [...filteredTabs, tabFromUrl as ClosableTabKey]
      openTabsRef.current = newTabs // Update ref immediately
      setOpenTabs(newTabs)
      sessionStorage.setItem('openTabs', JSON.stringify(newTabs)) // Persist to sessionStorage
    }
  }, [params])

  const currentState = emptyStates[activeTab as keyof typeof emptyStates]
  const ActiveIcon = currentState?.icon
  const isNewTabActive = activeTab === newTabConfig.key
  const isProfileActive = activeTab === profileTabConfig.key
  const isAssistantTabActive = activeTab === assistantTabConfig.key
  const isHomeActive = activeTab === 'home'
  const isSidebarCollapsed = sidebarState === 'collapsed'
  const isAssistantSidebarOpen = assistantMode === 'sidebar' && isAssistantOpen

  // Get breadcrumbs for current tab
  const { breadcrumbs: pageBreadcrumbs } = useBreadcrumbs({
    activeTab: activeTab as string,
    classroomTabs,
    studentProfileTabs,
    onNavigate: (path, replace) => handleNavigate(path as ClosableTabKey, replace),
  })

  // Get actions for current tab
  const getPageActions = () => {
    let actions: any[] = []

    if (typeof activeTab === 'string' && activeTab.startsWith('classroom/')) {
      const classroomPath = classroomTabs.get(activeTab)
      const parts = classroomPath?.split('/') ?? []
      const classId = parts[0]

      if (activeTab.includes('/students')) {
        // Student list page actions
        actions = []
      } else if (activeTab.includes('/grades')) {
        // Grade entry page actions
        actions = []
      } else if (activeTab.includes('/student/')) {
        // Student profile from class actions
        actions = []
      } else {
        // Class overview page actions
        actions = [
          {
            label: 'Take Attendance',
            icon: ClipboardCheck,
            onClick: undefined,
            disabled: true,
            variant: 'outline',
          },
          {
            label: 'Enter Grades',
            icon: GraduationCap,
            onClick: classId ? () => handleOpenGrades(classId) : undefined,
            disabled: !classId,
            variant: 'outline',
          },
          {
            label: 'Message Parents',
            icon: MessageSquare,
            onClick: undefined,
            disabled: true,
            variant: 'outline',
          },
        ]
      }
    } else if (typeof activeTab === 'string' && activeTab.startsWith('student-')) {
      // Standalone student profile actions
      actions = []
    }

    return actions
  }

  const pageActions = getPageActions()

  const handleNavigate = (tabKey: ClosableTabKey, replaceParent: boolean = false) => {
    // If replaceParent is true, close the parent tab if it exists
    if (replaceParent) {
      const parentTabKey = getParentTab(tabKey)
      if (parentTabKey) {
        setOpenTabs((tabs) => {
          // Check if parent exists in current tabs
          if (!tabs.includes(parentTabKey as ClosableTabKey)) {
            return tabs // Parent doesn't exist, don't modify tabs
          }

          const parentIndex = tabs.indexOf(parentTabKey as ClosableTabKey)
          // Remove both parent AND any existing child tab to prevent duplicates
          const filteredTabs = tabs.filter((key) => key !== parentTabKey && key !== tabKey)

          // Insert the new tab at the parent's position
          if (parentIndex !== -1) {
            filteredTabs.splice(parentIndex, 0, tabKey)
          } else {
            filteredTabs.push(tabKey)
          }

          openTabsRef.current = filteredTabs
          sessionStorage.setItem('openTabs', JSON.stringify(filteredTabs))
          return filteredTabs
        })

        // Navigate after updating tabs
        const newPath = tabKey === 'home' ? '/' : `/${tabKey}`
        router.push(newPath, { scroll: false })
        return
      }
    }

    // Simply navigate to the URL - the useEffect will handle adding the tab if not replaced
    const newPath = tabKey === 'home' ? '/' : `/${tabKey}`
    router.push(newPath, { scroll: false })
  }

  const handleOpenStudentProfile = (studentName: string) => {
    const tabKey = `student-${studentName.toLowerCase().replace(/\s+/g, '-')}` as StudentProfileTabKey

    setStudentProfileTabs((prev) => {
      const updated = new Map(prev)
      updated.set(tabKey, studentName)
      return updated
    })

    handleNavigate(tabKey)
  }

  const handleOpenClassroom = (classId: string) => {
    const tabKey = `classroom/${classId}` as ClassroomTabKey

    setClassroomTabs((prev) => {
      const updated = new Map(prev)
      updated.set(tabKey, classId)
      return updated
    })

    handleNavigate(tabKey, true) // Replace parent tab
  }

  const handleOpenStudentList = (classId: string) => {
    const tabKey = `classroom/${classId}/students` as ClassroomTabKey

    setClassroomTabs((prev) => {
      const updated = new Map(prev)
      updated.set(tabKey, `${classId}/students`)
      return updated
    })

    handleNavigate(tabKey, true) // Replace parent tab
  }

  const handleOpenGrades = (classId: string) => {
    const tabKey = `classroom/${classId}/grades` as ClassroomTabKey

    setClassroomTabs((prev) => {
      const updated = new Map(prev)
      updated.set(tabKey, `${classId}/grades`)
      return updated
    })

    handleNavigate(tabKey, true) // Replace parent tab
  }

  const handleOpenStudentFromClass = (classId: string, studentName: string) => {
    const studentSlug = studentName.toLowerCase().replace(/\s+/g, '-')
    const tabKey = `classroom/${classId}/student/${studentSlug}` as ClassroomTabKey

    // Update both maps using refs to ensure immediate availability
    const updatedClassroomTabs = new Map(classroomTabsRef.current)
    updatedClassroomTabs.set(tabKey, `${classId}/student/${studentSlug}`)
    classroomTabsRef.current = updatedClassroomTabs
    setClassroomTabs(updatedClassroomTabs)

    const updatedStudentProfileTabs = new Map(studentProfileTabsRef.current)
    updatedStudentProfileTabs.set(tabKey, studentName)
    studentProfileTabsRef.current = updatedStudentProfileTabs
    setStudentProfileTabs(updatedStudentProfileTabs)

    handleNavigate(tabKey, true) // Replace parent tab
  }

  const handleAssistantMessage = (message: string) => {
    setPendingAssistantMessage(message)
    setIsAssistantOpen(true)
    if (assistantMode === 'floating') {
      setAssistantMode('sidebar')
    }
  }

  const handleMessageProcessed = () => {
    setPendingAssistantMessage(null)
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

      openTabsRef.current = filteredTabs // Update ref when closing tabs
      sessionStorage.setItem('openTabs', JSON.stringify(filteredTabs)) // Persist to sessionStorage
      return filteredTabs
    })
  }, [])

  // Measure tab container width
  useLayoutEffect(() => {
    const container = tabContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  // Calculate visible tab count based on actual available space
  const getVisibleTabCount = () => {
    if (containerWidth === 0) return openTabs.length // Show all by default until measured

    // Constants for UI elements (measuring actual widths from DOM)
    const GAP = 8 // gap-2 (0.5rem = 8px)
    const NEW_TAB_BUTTON_WIDTH = isNewTabActive ? 100 : 36
    const MORE_DROPDOWN_WIDTH = 36 // Only add when we know we'll have overflow
    const ASSISTANT_BUTTON_WIDTH = (!isAssistantTabActive && !isAssistantSidebarOpen) ? 120 : 0

    // Average tab width based on current calculation
    const getTabWidth = (count: number) => {
      if (count <= 2) return 192 // 12rem = 192px
      if (count <= 4) return 144 // 9rem = 144px
      if (count <= 6) return 120 // 7.5rem = 120px
      return 104 // 6.5rem = 104px
    }

    // Start with all tabs and work backwards
    let testCount = openTabs.length

    while (testCount > 0) {
      const tabWidth = getTabWidth(testCount)
      const tabsSpace = testCount * tabWidth + (testCount - 1) * GAP
      const extraSpace = MORE_DROPDOWN_WIDTH + (testCount < openTabs.length ? 0 : -MORE_DROPDOWN_WIDTH)
      const totalRequired = tabsSpace + NEW_TAB_BUTTON_WIDTH + ASSISTANT_BUTTON_WIDTH + extraSpace + (GAP * 3)

      if (totalRequired <= containerWidth) {
        return testCount
      }

      testCount--
    }

    return Math.max(1, openTabs.length) // Always show at least 1 tab
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
    <UserProvider>
    <div className="flex min-h-svh w-full bg-background">
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent className="gap-6">
          <SidebarGroup className="gap-3">
            <div className="flex h-8 w-full items-center justify-between px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <SidebarGroupLabel className="flex-1 truncate px-0 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:hidden">
                Tan&apos;s Space
              </SidebarGroupLabel>
              <SidebarTrigger className="size-7 shrink-0" />
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryPages.slice(0, 3).map((page) => {
                  const Icon = page.icon

                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        tooltip={page.tooltip}
                        isActive={
                          activeTab === page.key ||
                          (page.key === 'classroom' && typeof activeTab === 'string' && activeTab.startsWith('classroom/'))
                        }
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
              <SidebarSeparator className="mx-0 my-2 w-full" />
              <SidebarMenu>
                {primaryPages.slice(3).map((page) => {
                  const Icon = page.icon

                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        tooltip={page.tooltip}
                        isActive={
                          activeTab === page.key ||
                          (page.key === 'classroom' && typeof activeTab === 'string' && activeTab.startsWith('classroom/'))
                        }
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
                      DT
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors group-data-[collapsible=icon]:hidden',
                        isProfileActive && 'text-sidebar-accent-foreground',
                      )}
                    >
                      Daniel Tan
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
              <div ref={tabContainerRef} className="flex items-center gap-2 py-2">
                <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={150}>
                      {visibleTabs.map((tabKey, index) => {
                    const tab = tabConfigMap[tabKey as keyof typeof tabConfigMap]
                    const isStudentProfile = typeof tabKey === 'string' && tabKey.startsWith('student-')
                    const isClassroom = typeof tabKey === 'string' && tabKey.startsWith('classroom/')
                    const studentName = isStudentProfile ? studentProfileTabs.get(tabKey) : undefined
                    const classroomPath = isClassroom ? classroomTabs.get(tabKey) : undefined

                    if (!tab && !isStudentProfile && !isClassroom) {
                      return null
                    }

                    const Icon = tab?.icon ?? (isClassroom ? Users : User)

                    // Parse classroom tab labels
                    let label = ''
                    if (isStudentProfile) {
                      label = studentName ?? 'Student'
                    } else if (isClassroom && classroomPath) {
                      const parts = classroomPath.split('/')
                      const classId = parts[0]
                      // Convert class-5a -> Class 5A
                      const className = classId.replace('class-', '').toUpperCase()
                      if (classroomPath.includes('/student/')) {
                        // classroom/{classId}/student/{studentSlug} -> show student name
                        label = studentProfileTabs.get(tabKey) ?? 'Student'
                      } else if (classroomPath.includes('/students')) {
                        // classroom/{classId}/students
                        label = `Class ${className} Students`
                      } else if (classroomPath.includes('/grades')) {
                        // classroom/{classId}/grades
                        label = `Class ${className} Grades`
                      } else {
                        // classroom/{classId}
                        label = `Class ${className}`
                      }
                    } else {
                      label = tab?.label ?? ''
                    }
                    const isActive = activeTab === tabKey
                    const isDragging = draggedTab === tabKey
                    const isDragOver = dragOverTab === tabKey
                    const draggedIndex = draggedTab ? visibleTabs.indexOf(draggedTab) : -1
                    const showIndicatorLeft = isDragOver && draggedIndex > index
                    const showIndicatorRight = isDragOver && draggedIndex < index
                    
                    // Calculate dynamic tab width based on available space
                    const tabCount = visibleTabs.length
                    const maxTabWidth = tabCount <= 2 ? '12rem' : tabCount <= 4 ? '9rem' : tabCount <= 6 ? '7.5rem' : '6.5rem'

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
                        onClick={() => {
                          setActiveTab(tabKey)
                          // Update URL to match the tab
                          const newPath = tabKey === 'home' ? '/' : `/${tabKey}`
                          router.push(newPath, { scroll: false })
                        }}
                        style={{ maxWidth: maxTabWidth }}
                        className={cn(
                          'group relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-200 min-w-[4rem]',
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
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate flex-1 min-w-0">{label}</span>
                        {/* Gradient overlay on hover - adapts to active/inactive state */}
                        <div
                          className={cn(
                            "absolute inset-y-0 right-0 w-12 bg-gradient-to-l pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 rounded-md",
                            isActive
                              ? "from-background via-background/80 to-transparent"
                              : "from-accent via-accent/80 to-transparent"
                          )}
                        />
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
                          className={cn(
                            "absolute right-1 flex size-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 z-10",
                            "text-muted-foreground/80 hover:text-foreground focus-visible:text-foreground",
                            isActive ? "bg-background/95 rounded-md" : "bg-accent/95 rounded-md"
                          )}
                          aria-label={`Close ${label}`}
                        >
                          <X className="size-3.5" />
                        </div>
                      </button>
                    )
                  })}

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
                              <MoreHorizontal className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {hiddenTabs.length} more {hiddenTabs.length === 1 ? 'tab' : 'tabs'}
                        </TooltipContent>
                      <DropdownMenuContent align="start" className="w-56">
                        {hiddenTabs.map((tabKey) => {
                          const tab = tabConfigMap[tabKey as keyof typeof tabConfigMap]
                          const isStudentProfile = typeof tabKey === 'string' && tabKey.startsWith('student-')
                          const isClassroom = typeof tabKey === 'string' && tabKey.startsWith('classroom/')
                          const studentName = isStudentProfile ? studentProfileTabs.get(tabKey) : undefined
                          const classroomPath = isClassroom ? classroomTabs.get(tabKey) : undefined

                          if (!tab && !isStudentProfile && !isClassroom) return null

                          const Icon = tab?.icon ?? (isClassroom ? Users : User)

                          // Parse classroom tab labels
                          let label = ''
                          if (isStudentProfile) {
                            label = studentName ?? 'Student'
                          } else if (isClassroom && classroomPath) {
                            const parts = classroomPath.split('/')
                            const classId = parts[0]
                            // Convert class-5a -> Class 5A
                            const className = classId.replace('class-', '').toUpperCase()
                            if (classroomPath.includes('/student/')) {
                              label = studentProfileTabs.get(tabKey) ?? 'Student'
                            } else if (classroomPath.includes('/students')) {
                              label = `Class ${className} Students`
                            } else if (classroomPath.includes('/grades')) {
                              label = `Class ${className} Grades`
                            } else {
                              label = `Class ${className}`
                            }
                          } else {
                            label = tab?.label ?? ''
                          }

                          const isActive = activeTab === tabKey

                          return (
                            <DropdownMenuItem
                              key={tabKey}
                              className={cn(
                                "flex items-center justify-between",
                                isActive && "bg-accent"
                              )}
                              onClick={() => {
                                setActiveTab(tabKey)
                                // Update URL to match the tab
                                const newPath = tabKey === 'home' ? '/' : `/${tabKey}`
                                router.push(newPath, { scroll: false })
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="size-4" />
                                <span>{label}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCloseTab(tabKey)
                                }}
                                className="ml-2 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                                aria-label={`Close ${label}`}
                              >
                                <X className="size-3" />
                              </button>
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuContent>
                      </DropdownMenu>
                    </Tooltip>
                  )}

                  <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleNewTab}
                        className={cn(
                          'flex h-9 items-center rounded-md transition-colors',
                          isNewTabActive
                            ? 'gap-2 px-3 py-1.5 text-sm bg-background text-foreground shadow-sm ring-1 ring-border'
                            : 'w-9 justify-center text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                        aria-label="Open new tab"
                      >
                        <Plus className="size-4" />
                        {isNewTabActive && <span className="truncate">{newTabConfig.label}</span>}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">New Tab</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                </div>

                {!isAssistantTabActive && !isAssistantSidebarOpen && (
                  <div className="ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={handleAssistantButtonClick}
                      aria-expanded={isAssistantOpen}
                      aria-controls="assistant-panel"
                    >
                      <MessageSquare className="size-4" />
                      Assistant
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col border-b bg-background">
              {/* Page Header */}
              <div className="flex h-16 items-center gap-3 px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden flex-1 md:flex flex-col gap-1">
                  {/* Breadcrumbs */}
                  {pageBreadcrumbs && pageBreadcrumbs.length > 0 && (
                    <div className="mb-1">
                      <Breadcrumbs items={pageBreadcrumbs} />
                    </div>
                  )}
                  {/* Title */}
                  <h1 className="text-lg font-semibold tracking-tight">
                    {typeof activeTab === 'string' && activeTab.startsWith('student-')
                      ? studentProfileTabs.get(activeTab) ?? 'Student Profile'
                      : typeof activeTab === 'string' && activeTab.startsWith('classroom/')
                        ? (() => {
                            const classroomPath = classroomTabs.get(activeTab)
                            if (!classroomPath) return 'Classroom'
                            const parts = classroomPath.split('/')
                            const classId = parts[0]
                            // Convert class-5a -> Class 5A
                            const className = classId.replace('class-', '').toUpperCase()
                            if (classroomPath.includes('/student/')) {
                              return studentProfileTabs.get(activeTab) ?? 'Student Profile'
                            } else if (classroomPath.includes('/students')) {
                              return 'Students'
                            } else if (classroomPath.includes('/grades')) {
                              return 'Grade Entry'
                            } else {
                              return `Class ${className}`
                            }
                          })()
                      : currentState
                        ? currentState.heading
                        : 'New Tab'}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  {/* Page Actions */}
                  {pageActions && pageActions.length > 0 && (
                    <>
                      {pageActions.map((action, index) => {
                        const Icon = action.icon
                        return (
                          <Button
                            key={index}
                            size="sm"
                            variant={action.variant || 'outline'}
                            disabled={action.disabled}
                            onClick={action.onClick}
                            className="hidden sm:flex"
                          >
                            <Icon className="mr-1.5 h-4 w-4" />
                            {action.label}
                          </Button>
                        )
                      })}
                    </>
                  )}
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
                        onStudentClick={handleOpenStudentProfile}
                      />
                    ) : (
                      <AssistantBody showHeading={false} onStudentClick={handleOpenStudentProfile} />
                    )}
                  </div>
                ) : isHomeActive ? (
                  <HomeContent
                    onNavigateToClassroom={() => handleNavigate('classroom')}
                    onNavigateToExplore={() => handleNavigate('explore')}
                    onAssistantMessage={handleAssistantMessage}
                    onStudentClick={handleOpenStudentProfile}
                  />
                ) : activeTab === 'roundup' ? (
                  <RoundupContent onPrepForMeeting={() => handleNavigate('classroom')} />
                ) : activeTab === 'explore' ? (
                  <ExploreContent onAppClick={(appKey) => handleNavigate(appKey as ClosableTabKey)} />
                ) : activeTab === 'classroom' ? (
                  <MyClasses onClassClick={handleOpenClassroom} />
                ) : activeTab === 'records' ? (
                  <RecordsContent />
                ) : typeof activeTab === 'string' && activeTab.startsWith('classroom/') && activeTab.includes('/student/') ? (
                  // classroom/{classId}/student/{studentSlug}
                  (() => {
                    const classroomPath = classroomTabs.get(activeTab)
                    const parts = classroomPath?.split('/') ?? []
                    const classId = parts[0]
                    const studentName = studentProfileTabs.get(activeTab)

                    return (
                      <StudentProfile
                        studentName={studentName ?? 'Unknown Student'}
                        classId={classId}
                        activeTab={activeTab}
                        onNavigate={(path, replace) => handleNavigate(path as ClosableTabKey, replace)}
                        classroomTabs={classroomTabs}
                        studentProfileTabs={studentProfileTabs}
                        onBack={() => {
                          if (classId) {
                            // Navigate back to parent class, replacing current tab
                            const parentTabKey = `classroom/${classId}` as ClassroomTabKey
                            setClassroomTabs((prev) => {
                              const updated = new Map(prev)
                              updated.set(parentTabKey, classId)
                              return updated
                            })
                            setOpenTabs((tabs) => {
                              const currentIndex = tabs.indexOf(activeTab as ClosableTabKey)
                              // Remove both child and any existing parent to prevent duplicates
                              const filteredTabs = tabs.filter((key) => key !== activeTab && key !== parentTabKey)
                              if (currentIndex !== -1) {
                                filteredTabs.splice(currentIndex, 0, parentTabKey)
                              } else {
                                filteredTabs.push(parentTabKey)
                              }
                              openTabsRef.current = filteredTabs
                              sessionStorage.setItem('openTabs', JSON.stringify(filteredTabs))
                              return filteredTabs
                            })
                            router.push(`/classroom/${classId}`, { scroll: false })
                          }
                        }}
                      />
                    )
                  })()
                ) : typeof activeTab === 'string' && activeTab.startsWith('classroom/') && activeTab.includes('/students') ? (
                  // classroom/{classId}/students
                  (() => {
                    const classroomPath = classroomTabs.get(activeTab)
                    const parts = classroomPath?.split('/') ?? []
                    const classId = parts[0]
                    return (
                      <StudentList
                        classId={classId}
                        onNavigate={(path, replace) => handleNavigate(path as ClosableTabKey, replace)}
                        classroomTabs={classroomTabs}
                        onBack={() => {
                          if (classId) {
                            // Navigate back to parent class, replacing current tab
                            const parentTabKey = `classroom/${classId}` as ClassroomTabKey
                            setClassroomTabs((prev) => {
                              const updated = new Map(prev)
                              updated.set(parentTabKey, classId)
                              return updated
                            })
                            setOpenTabs((tabs) => {
                              const currentIndex = tabs.indexOf(activeTab as ClosableTabKey)
                              // Remove both child and any existing parent to prevent duplicates
                              const filteredTabs = tabs.filter((key) => key !== activeTab && key !== parentTabKey)
                              if (currentIndex !== -1) {
                                filteredTabs.splice(currentIndex, 0, parentTabKey)
                              } else {
                                filteredTabs.push(parentTabKey)
                              }
                              openTabsRef.current = filteredTabs
                              sessionStorage.setItem('openTabs', JSON.stringify(filteredTabs))
                              return filteredTabs
                            })
                            router.push(`/classroom/${classId}`, { scroll: false })
                          }
                        }}
                        onStudentClick={(studentName) => handleOpenStudentFromClass(classId, studentName)}
                      />
                    )
                  })()
                ) : typeof activeTab === 'string' && activeTab.startsWith('classroom/') && activeTab.includes('/grades') ? (
                  // classroom/{classId}/grades
                  (() => {
                    const classroomPath = classroomTabs.get(activeTab)
                    const parts = classroomPath?.split('/') ?? []
                    const classId = parts[0]
                    return (
                      <GradeEntry
                        classId={classId}
                        onNavigate={(path, replace) => handleNavigate(path as ClosableTabKey, replace)}
                        classroomTabs={classroomTabs}
                        onBack={() => {
                          if (classId) {
                            // Navigate back to parent class, replacing current tab
                            const parentTabKey = `classroom/${classId}` as ClassroomTabKey
                            setClassroomTabs((prev) => {
                              const updated = new Map(prev)
                              updated.set(parentTabKey, classId)
                              return updated
                            })
                            setOpenTabs((tabs) => {
                              const currentIndex = tabs.indexOf(activeTab as ClosableTabKey)
                              // Remove both child and any existing parent to prevent duplicates
                              const filteredTabs = tabs.filter((key) => key !== activeTab && key !== parentTabKey)
                              if (currentIndex !== -1) {
                                filteredTabs.splice(currentIndex, 0, parentTabKey)
                              } else {
                                filteredTabs.push(parentTabKey)
                              }
                              openTabsRef.current = filteredTabs
                              sessionStorage.setItem('openTabs', JSON.stringify(filteredTabs))
                              return filteredTabs
                            })
                            router.push(`/classroom/${classId}`, { scroll: false })
                          }
                        }}
                      />
                    )
                  })()
                ) : typeof activeTab === 'string' && activeTab.startsWith('classroom/') ? (
                  // classroom/{classId}
                  (() => {
                    const classroomPath = classroomTabs.get(activeTab)
                    const classId = classroomPath ?? activeTab.replace('classroom/', '')
                    return (
                      <ClassOverview
                        classId={classId}
                        onBack={() => {
                          // Navigate back to classroom list, replacing current tab
                          setOpenTabs((tabs) => {
                            const currentIndex = tabs.indexOf(activeTab as ClosableTabKey)
                            // Remove both child and any existing parent to prevent duplicates
                            const filteredTabs = tabs.filter((key) => key !== activeTab && key !== 'classroom')
                            if (currentIndex !== -1) {
                              filteredTabs.splice(currentIndex, 0, 'classroom')
                            } else {
                              filteredTabs.push('classroom')
                            }
                            openTabsRef.current = filteredTabs
                            sessionStorage.setItem('openTabs', JSON.stringify(filteredTabs))
                            return filteredTabs
                          })
                          router.push('/classroom', { scroll: false })
                        }}
                        onNavigateToGrades={handleOpenGrades}
                        onStudentClick={(studentName) => handleOpenStudentFromClass(classId, studentName)}
                        onNavigate={(path, replace) => handleNavigate(path as ClosableTabKey, replace)}
                        classroomTabs={classroomTabs}
                      />
                    )
                  })()
                ) : typeof activeTab === 'string' && activeTab.startsWith('student-') ? (
                  <StudentProfile
                    studentName={studentProfileTabs.get(activeTab) ?? 'Unknown Student'}
                    activeTab={activeTab}
                    onNavigate={(path, replace) => handleNavigate(path as ClosableTabKey, replace)}
                    classroomTabs={classroomTabs}
                    studentProfileTabs={studentProfileTabs}
                    onBack={() => {
                      handleCloseTab(activeTab)
                      handleNavigate('classroom')
                    }}
                  />
                ) : currentState ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full">
                      {ActiveIcon ? <ActiveIcon className="size-7" /> : <Plus className="size-7" />}
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
                              DT
                            </div>
                            <div className="flex flex-1 flex-col">
                              <h3 className="text-base font-semibold">Daniel Tan</h3>
                              <p className="text-muted-foreground text-sm">
                                Math Teacher · Ready to collaborate
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
                          <div className="mt-6 flex flex-wrap items-center gap-2">
                            <Button size="sm">Preview profile</Button>
                            <Button size="sm" variant="ghost">
                              Share profile link
                            </Button>
                            <div className="ml-auto">
                              <ThemeSwitcher />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full">
                      <Plus className="size-7" />
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
                'relative w-[20rem] bg-transparent transition-[width] duration-200 ease-in-out',
                !isAssistantOpen && 'w-0',
              )}
            />
            {/* Sidebar container */}
            <div
              className={cn(
                'fixed inset-y-0 z-10 hidden h-svh w-[20rem] transition-[right,width] duration-200 ease-in-out md:flex',
                'right-0 py-2 pr-2',
                !isAssistantOpen && 'right-[calc(20rem*-1)]',
              )}
            >
              <div className="bg-white border-sidebar-border flex h-full w-full flex-col rounded-2xl border">
                <AssistantPanel
                  mode="sidebar"
                  isOpen={isAssistantOpen}
                  onOpenChange={setIsAssistantOpen}
                  onModeChange={handleAssistantModeChange}
                  className="flex h-full w-full flex-col"
                  onStudentClick={handleOpenStudentProfile}
                  incomingMessage={pendingAssistantMessage}
                  onMessageProcessed={handleMessageProcessed}
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
            onStudentClick={handleOpenStudentProfile}
            incomingMessage={pendingAssistantMessage}
            onMessageProcessed={handleMessageProcessed}
          />
        )}
      </div>
    </UserProvider>
    )
  }
