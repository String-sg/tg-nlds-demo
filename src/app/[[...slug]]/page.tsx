'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo, memo, lazy, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'

import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  Compass,
  FilePen,
  FileText,
  GraduationCap,
  Home as HomeIcon,
  Inbox,
  MessageSquare,
  MoreHorizontal,
  PieChart,
  Plus,
  School,
  User,
  Users,
  Users2,
  BookOpen,
  X,
  Zap,
  Award,
  UserCheck,
  TrendingUp,
  UserCircle,
  Briefcase,
  ChevronDown,
  RotateCcw,
  Sparkle,
} from 'lucide-react'

import {
  AssistantBody,
  AssistantModeSwitcher,
  AssistantPanel,
  type AssistantMode,
} from '@/components/assistant-panel'
import { Button } from '@/components/ui/button'
import { HomeContent } from '@/components/home-content'
import { PulseContent } from '@/components/pulse-content'
import { MyClasses } from '@/components/classroom/my-classes'
import { ClassOverview } from '@/components/classroom/class-overview'
import { StudentList } from '@/components/classroom/student-list'
import { GradeEntry } from '@/components/classroom/grade-entry'
import { StudentProfile } from '@/components/student-profile'
import { RecordsContent } from '@/components/records-content'
import { ExploreContent } from '@/components/explore-content'
import { InboxContent } from '@/components/messages/inbox-content'
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
  SidebarMenuBadge,
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
import { createClient } from '@/lib/supabase/client'

const primaryPages = [
  { key: 'home', label: 'Home', icon: HomeIcon, tooltip: 'Home' },
  { key: 'inbox', label: 'Inbox', icon: Inbox, tooltip: 'Inbox' },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays, tooltip: 'Calendar' },
  { key: 'drafts', label: 'Drafts', icon: FileText, tooltip: 'Drafts' },
  { key: 'classroom', label: 'Classroom', icon: Users, tooltip: 'Classroom' },
  { key: 'myschool', label: 'School', icon: School, tooltip: 'School' },
  { key: 'learning', label: 'Learning', icon: BookOpen, tooltip: 'Learning' },
  { key: 'community', label: 'Community', icon: Users2, tooltip: 'Community' },
  { key: 'explore', label: 'Explore', icon: Compass, tooltip: 'Explore' },
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
type PulseTabKey = 'pulse' // Pulse is a child of Home
type LegacyTabKey = 'records' | 'recents' // Legacy tab keys for backward compatibility
type PageKey = PrimaryPageKey | ProfileTabKey
type ClosableTabKey = PageKey | AssistantTabKey | StudentProfileTabKey | ClassroomTabKey | PulseTabKey | LegacyTabKey
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

type DropdownItem = {
  label: string
  icon: LucideIcon
  onClick?: () => void
  disabled?: boolean
}

type PageAction = {
  label: string
  icon: LucideIcon
  onClick?: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'link' | 'secondary' | 'ghost'
  disabled?: boolean
  isDropdown?: boolean
  dropdownItems?: DropdownItem[]
}

const emptyStates: Record<TabKey, EmptyState> = {
  'new-tab': {
    heading: 'New Tab',
    title: 'Create your first tab',
    description:
      'Open a page from the sidebar or start with a preselected one to jump into your workspace.',
    icon: Plus,
  },
  pulse: {
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
  drafts: {
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
  inbox: {
    heading: 'Inbox',
    title: 'No updates right now',
    description:
      "When teammates mention you or share docs, they'll show up here for quick triage.",
    icon: Inbox,
    primaryAction: 'Compose a note',
  },
  recents: {
    heading: 'Recents',
    title: 'No recent files',
    description:
      'Files you open or edit will appear here for quick access.',
    icon: FileText,
    primaryAction: 'Browse files',
  },
  myschool: {
    heading: 'My School',
    title: 'School overview',
    description:
      'View and manage school-wide information, announcements, and resources.',
    icon: School,
    primaryAction: 'View announcements',
  },
  learning: {
    heading: 'Learning',
    title: 'Start your learning journey',
    description:
      'Access courses, resources, and professional development opportunities.',
    icon: BookOpen,
    primaryAction: 'Browse courses',
  },
  community: {
    heading: 'Community',
    title: 'Connect with colleagues',
    description:
      'Engage with your school community, share resources, and collaborate.',
    icon: Users2,
    primaryAction: 'Join discussion',
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

const tabConfigMap: Partial<Record<TabKey, TabConfig>> = {
  [newTabConfig.key]: newTabConfig,
  ...pageConfigMap,
  [assistantTabConfig.key]: assistantTabConfig,
}

// Memoized tab content component to prevent unnecessary re-renders
const TabContent = memo(function TabContent({
  activeTab,
  currentUrl,
  slug,
  isAssistantTabActive,
  assistantMode,
  isAssistantOpen,
  isHomeActive,
  currentState,
  ActiveIcon,
  isProfileActive,
  classroomTabs,
  studentProfileTabs,
  handleNavigate,
  handleOpenStudentProfile,
  handleOpenClassroom,
  handleOpenConversation,
  handleCloseTab,
  handleAssistantMessage,
  handleOpenStudentFromClass,
  handleOpenGrades,
  setIsAssistantOpen,
  handleAssistantModeChange,
  setClassroomTabs,
  setOpenTabs,
  openTabsRef,
  router: routerProp,
}: {
  activeTab: TabKey
  currentUrl: string
  slug?: string[] | undefined
  isAssistantTabActive: boolean
  assistantMode: AssistantMode
  isAssistantOpen: boolean
  isHomeActive: boolean
  currentState: EmptyState | undefined
  ActiveIcon: LucideIcon | undefined
  isProfileActive: boolean
  classroomTabs: Map<string, string>
  studentProfileTabs: Map<string, string>
  handleNavigate: (tab: ClosableTabKey, navigateWithinTab?: boolean) => void
  handleOpenStudentProfile: (studentName: string) => void
  handleOpenClassroom: (classId: string, className?: string) => void
  handleOpenConversation: (conversationId: string) => void
  handleCloseTab: (tab: TabKey) => void
  handleAssistantMessage: (message: string) => void
  handleOpenStudentFromClass: (classId: string, studentName: string) => void
  handleOpenGrades: (classId: string) => void
  setIsAssistantOpen: (open: boolean) => void
  handleAssistantModeChange: (mode: AssistantMode | 'full') => void
  setClassroomTabs: React.Dispatch<React.SetStateAction<Map<string, string>>>
  setOpenTabs: React.Dispatch<React.SetStateAction<ClosableTabKey[]>>
  openTabsRef: React.MutableRefObject<ClosableTabKey[]>
  router: ReturnType<typeof useRouter>
}) {
  // Use currentUrl for content rendering decisions
  // Only render content for the current URL
  if (isAssistantTabActive) {
    return (
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
    )
  }

  if (currentUrl === 'pulse') {
    return <PulseContent onPrepForMeeting={() => handleNavigate('classroom')} />
  }

  if (currentUrl === 'home') {
    return (
      <HomeContent
        onNavigateToClassroom={() => handleNavigate('classroom')}
        onNavigateToExplore={() => handleNavigate('explore')}
        onNavigateToPulse={() => handleNavigate('pulse', true)}
        onAssistantMessage={handleAssistantMessage}
        onStudentClick={handleOpenStudentProfile}
        onStudentClickWithClass={handleOpenStudentFromClass}
      />
    )
  }

  if (currentUrl === 'explore') {
    return <ExploreContent onAppClick={(appKey) => handleNavigate(appKey as ClosableTabKey)} />
  }

  if (currentUrl === 'classroom') {
    return <MyClasses onClassClick={handleOpenClassroom} />
  }

  if (currentUrl === 'records') {
    return <RecordsContent />
  }

  if (currentUrl === 'inbox' || currentUrl.startsWith('inbox/')) {
    const conversationId = slug && slug.length > 1 && slug[0] === 'inbox' ? slug[1] : undefined
    return (
      <InboxContent
        conversationId={conversationId}
        onConversationClick={handleOpenConversation}
      />
    )
  }

  if (typeof currentUrl === 'string' && currentUrl.startsWith('classroom/') && currentUrl.includes('/student/')) {
    const classroomPath = classroomTabs.get(currentUrl)
    const parts = classroomPath?.split('/') ?? []
    // Parse classId from encoded format "classId:className"
    const [classId] = parts[0]?.includes(':') ? parts[0].split(':', 2) : [parts[0]]
    let studentName = studentProfileTabs.get(currentUrl)

    if (!studentName && typeof currentUrl === 'string') {
      const segments = currentUrl.split('/')
      if (segments.length >= 4 && segments[2] === 'student') {
        const studentSlug = segments[3]
        studentName = studentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
    }

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
            const parentTabKey = `classroom/${classId}` as ClassroomTabKey
            setClassroomTabs((prev) => {
              const updated = new Map(prev)
              updated.set(parentTabKey, classId)
              return updated
            })
            setOpenTabs((tabs) => {
              const currentIndex = tabs.indexOf(activeTab as ClosableTabKey)
              const filteredTabs = tabs.filter((key) => key !== activeTab && key !== parentTabKey)
              if (currentIndex !== -1) {
                filteredTabs.splice(currentIndex, 0, parentTabKey)
              } else {
                filteredTabs.push(parentTabKey)
              }
              openTabsRef.current = filteredTabs
              return filteredTabs
            })
            routerProp.push(`/classroom/${classId}`, { scroll: false })
          }
        }}
      />
    )
  }

  if (typeof currentUrl === 'string' && currentUrl.startsWith('classroom/') && currentUrl.includes('/students')) {
    const classroomPath = classroomTabs.get(currentUrl)
    const parts = classroomPath?.split('/') ?? []
    // Parse classId from encoded format "classId:className"
    const [classId] = parts[0]?.includes(':') ? parts[0].split(':', 2) : [parts[0]]
    return (
      <StudentList
        classId={classId}
        onNavigate={(path, replace) => handleNavigate(path as ClosableTabKey, replace)}
        classroomTabs={classroomTabs}
        onBack={() => {
          if (classId) {
            const parentTabKey = `classroom/${classId}` as ClassroomTabKey
            setClassroomTabs((prev) => {
              const updated = new Map(prev)
              updated.set(parentTabKey, classId)
              return updated
            })
            setOpenTabs((tabs) => {
              const currentIndex = tabs.indexOf(activeTab as ClosableTabKey)
              const filteredTabs = tabs.filter((key) => key !== activeTab && key !== parentTabKey)
              if (currentIndex !== -1) {
                filteredTabs.splice(currentIndex, 0, parentTabKey)
              } else {
                filteredTabs.push(parentTabKey)
              }
              openTabsRef.current = filteredTabs
              return filteredTabs
            })
            routerProp.push(`/classroom/${classId}`, { scroll: false })
          }
        }}
        onStudentClick={(studentName) => handleOpenStudentFromClass(classId, studentName)}
      />
    )
  }

  if (typeof currentUrl === 'string' && currentUrl.startsWith('classroom/') && currentUrl.includes('/grades')) {
    const classroomPath = classroomTabs.get(currentUrl)
    const parts = classroomPath?.split('/') ?? []
    // Parse classId from encoded format "classId:className"
    const [classId] = parts[0]?.includes(':') ? parts[0].split(':', 2) : [parts[0]]
    return (
      <GradeEntry
        classId={classId}
        onNavigate={(path, replace) => handleNavigate(path as ClosableTabKey, replace)}
        classroomTabs={classroomTabs}
        onBack={() => {
          if (classId) {
            const parentTabKey = `classroom/${classId}` as ClassroomTabKey
            setClassroomTabs((prev) => {
              const updated = new Map(prev)
              updated.set(parentTabKey, classId)
              return updated
            })
            setOpenTabs((tabs) => {
              const currentIndex = tabs.indexOf(activeTab as ClosableTabKey)
              const filteredTabs = tabs.filter((key) => key !== activeTab && key !== parentTabKey)
              if (currentIndex !== -1) {
                filteredTabs.splice(currentIndex, 0, parentTabKey)
              } else {
                filteredTabs.push(parentTabKey)
              }
              openTabsRef.current = filteredTabs
              return filteredTabs
            })
            routerProp.push(`/classroom/${classId}`, { scroll: false })
          }
        }}
      />
    )
  }

  if (typeof currentUrl === 'string' && currentUrl.startsWith('classroom/')) {
    const classroomPath = classroomTabs.get(currentUrl)
    // Parse classId from encoded format "classId:className"
    const [classId] = classroomPath?.includes(':') ? classroomPath.split(':', 2) : [classroomPath ?? currentUrl.replace('classroom/', '')]
    return (
      <ClassOverview
        classId={classId}
        onBack={() => {
          setOpenTabs((tabs) => {
            const currentIndex = tabs.indexOf(activeTab as ClosableTabKey)
            const filteredTabs = tabs.filter((key) => key !== activeTab && key !== 'classroom')
            if (currentIndex !== -1) {
              filteredTabs.splice(currentIndex, 0, 'classroom')
            } else {
              filteredTabs.push('classroom')
            }
            openTabsRef.current = filteredTabs
            return filteredTabs
          })
          routerProp.push('/classroom', { scroll: false })
        }}
        onNavigateToGrades={handleOpenGrades}
        onStudentClick={(studentName) => handleOpenStudentFromClass(classId, studentName)}
        onNavigate={(path, replace) => handleNavigate(path as ClosableTabKey, replace)}
        classroomTabs={classroomTabs}
      />
    )
  }

  if (typeof currentUrl === 'string' && currentUrl.startsWith('student-')) {
    return (
      <StudentProfile
        studentName={studentProfileTabs.get(currentUrl) ?? 'Unknown Student'}
        activeTab={activeTab}
        onNavigate={(path, replace) => handleNavigate(path as ClosableTabKey, replace)}
        classroomTabs={classroomTabs}
        studentProfileTabs={studentProfileTabs}
        onBack={() => {
          handleCloseTab(activeTab)
          handleNavigate('classroom')
        }}
      />
    )
  }

  if (currentState) {
    return (
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
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm('This will clear all tab data and reload the page. Continue?')) {
                        sessionStorage.clear()
                        window.location.reload()
                      }
                    }}
                    aria-label="Clear cache and reload"
                    className="gap-1.5"
                  >
                    <RotateCcw className="size-3.5" />
                    <span className="text-xs">Clear Cache</span>
                  </Button>
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
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
        <Button size="sm" variant="outline" onClick={() => handleNavigate('pulse')}>
          Open Round-up
        </Button>
      </div>
    </div>
  )
})

export default function Home() {
  const router = useRouter()
  const params = useParams()
  const { state: sidebarState } = useSidebar()

  // Initialize activeTab from URL params to prevent hydration mismatch
  const slug = params.slug as string[] | undefined
  const initialTab = !slug || slug.length === 0 ? 'home' : slug.join('/')

  // Derive currentUrl from params - this is what we use for content rendering
  const currentUrl = !slug || slug.length === 0 ? 'home' : slug.join('/')

  // ALWAYS start with empty state during SSR to prevent hydration mismatch
  // We'll restore from sessionStorage synchronously after mount using useLayoutEffect
  const [openTabs, setOpenTabs] = useState<ClosableTabKey[]>([])
  const openTabsRef = useRef<ClosableTabKey[]>([]) // Track current tabs in ref
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab as TabKey)
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('sidebar')
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [draggedTab, setDraggedTab] = useState<ClosableTabKey | null>(null)
  const [dragOverTab, setDragOverTab] = useState<ClosableTabKey | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  // Initialize with empty maps to prevent hydration mismatch - restore from sessionStorage after mount
  const [studentProfileTabs, setStudentProfileTabs] = useState<Map<string, string>>(new Map())
  const [classroomTabs, setClassroomTabs] = useState<Map<string, string>>(new Map())
  const [classroomNames, setClassroomNames] = useState<Map<string, string>>(new Map()) // Cache class names
  const [closingTabs, setClosingTabs] = useState<Set<string>>(new Set()) // Track tabs being closed
  const studentProfileTabsRef = useRef<Map<string, string>>(new Map()) // Ref for immediate access
  const classroomTabsRef = useRef<Map<string, string>>(new Map()) // Ref for immediate access
  const classroomNamesRef = useRef<Map<string, string>>(new Map()) // Ref for immediate access to class names
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState<string | null>(null)
  const tabContainerRef = useRef<HTMLDivElement>(null)

  // Helper to determine if a tab is a top-level page
  const isTopLevelTab = (tabKey: string): boolean => {
    const topLevelKeys = primaryPages.map((p) => p.key)
    return topLevelKeys.includes(tabKey as PrimaryPageKey) || tabKey === profileTabConfig.key
  }

  // Helper to get parent tab of a child tab
  const getParentTab = (tabKey: string): string | null => {
    if (tabKey === 'pulse') {
      // Pulse is a child of Home
      return 'home'
    }
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

  // Helper to check if any ancestor of tabKey exists in openTabs
  const hasAnyParentInTabs = (tabKey: string, openTabs: ClosableTabKey[]): boolean => {
    let currentKey = tabKey

    // Traverse up the parent hierarchy
    while (currentKey) {
      const parent = getParentTab(currentKey)
      if (!parent) break

      // Check if this parent exists in openTabs
      if (openTabs.includes(parent as ClosableTabKey)) {
        return true
      }

      currentKey = parent
    }

    return false
  }

  // Debounced sessionStorage persistence - only run after mount
  // Use longer debounce and requestIdleCallback for better performance
  useEffect(() => {
    if (!isMounted) return

    const timeoutId = setTimeout(() => {
      const persist = () => {
        try {
          sessionStorage.setItem('openTabs', JSON.stringify(openTabs))
          sessionStorage.setItem('studentProfileTabs', JSON.stringify(Array.from(studentProfileTabs.entries())))
          sessionStorage.setItem('classroomTabs', JSON.stringify(Array.from(classroomTabs.entries())))
          sessionStorage.setItem('classroomNames', JSON.stringify(Array.from(classroomNames.entries())))

          // Sync refs (except classroomTabsRef and classroomNamesRef which are updated synchronously in handlers)
          openTabsRef.current = openTabs
          studentProfileTabsRef.current = studentProfileTabs
          // DO NOT overwrite classroomTabsRef or classroomNamesRef from state - they're updated synchronously in handleOpenClassroom
        } catch (error) {
          console.error('Failed to persist tabs to sessionStorage:', error)
        }
      }

      // Use requestIdleCallback for non-critical persistence
      if ('requestIdleCallback' in window) {
        requestIdleCallback(persist, { timeout: 2000 })
      } else {
        persist()
      }
    }, 1000) // Increased debounce to 1s for better performance

    return () => clearTimeout(timeoutId)
  }, [openTabs, studentProfileTabs, classroomTabs, classroomNames, isMounted])

  // Fetch class names from database for classroom tabs
  useEffect(() => {
    if (!isMounted) return

    // Find all classroom tabs that need names
    const classroomTabKeys = openTabs.filter(tab =>
      typeof tab === 'string' && tab.startsWith('classroom/')
    )

    classroomTabKeys.forEach(async (tabKey) => {
      const classId = (tabKey as string).replace('classroom/', '').split('/')[0]

      // Skip if we already have this class name
      if (classroomNamesRef.current.has(classId)) return

      // Skip if it's already encoded with a name
      const classroomPath = classroomTabsRef.current.get(tabKey)
      if (classroomPath?.includes(':')) {
        const [_, encodedName] = classroomPath.split(':', 2)
        if (encodedName) {
          classroomNamesRef.current.set(classId, encodedName)
          setClassroomNames(new Map(classroomNamesRef.current))
          return
        }
      }

      // Fetch from database
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('classes')
          .select('name')
          .eq('id', classId)
          .single()

        if (!error && data && 'name' in data) {
          classroomNamesRef.current.set(classId, (data as { name: string }).name)
          setClassroomNames(new Map(classroomNamesRef.current))
        }
      } catch (err) {
        console.error('Error fetching class name:', err)
      }
    })
  }, [openTabs, isMounted])

  // Sync URL with active tab on URL changes - only after mount to avoid race conditions
  useEffect(() => {
    // Don't run during SSR or before restoration completes
    if (!isMounted) return

    const currentSlug = params.slug as string[] | undefined
    const tabFromUrl = !currentSlug || currentSlug.length === 0 ? 'home' : currentSlug.join('/')

    // Always check if this URL is a child page and should have its parent active
    const currentTabsFromRef = openTabsRef.current
    const parentInTabs = hasAnyParentInTabs(tabFromUrl, currentTabsFromRef)

    if (parentInTabs) {
      // This is a child page - keep the parent tab active
      let parentKey = tabFromUrl
      let foundParent: string | null = null

      while (parentKey) {
        const parent = getParentTab(parentKey)
        if (!parent) break

        // Found the parent that exists in openTabs
        if (currentTabsFromRef.includes(parent as ClosableTabKey)) {
          foundParent = parent
          break
        }

        parentKey = parent
      }

      // Only update if we found a parent and it's different from current activeTab
      if (foundParent && activeTab !== foundParent) {
        setActiveTab(foundParent as TabKey)
      }
    } else {
      // This is a top-level page - set activeTab to the URL
      if (activeTab !== tabFromUrl) {
        setActiveTab(tabFromUrl as TabKey)
      }
    }

    // Don't add special tabs to openTabs
    if (tabFromUrl === 'new-tab' || tabFromUrl === 'assistant') {
      return
    }

    // Don't re-add a tab that's being closed
    if (closingTabs.has(tabFromUrl)) {
      return
    }

    // Populate classroomTabs and studentProfileTabs Maps for classroom routes
    if (tabFromUrl.startsWith('classroom/')) {
      const segments = tabFromUrl.split('/')
      // Extract the path portion (everything after 'classroom/')
      const classroomPath = segments.slice(1).join('/')

      // Only update if:
      // 1. Tab doesn't exist in map yet
      // 2. OR existing value is NOT encoded (doesn't have className, no colon in first segment)
      const currentValue = classroomTabsRef.current.get(tabFromUrl)
      const isCurrentValueEncoded = currentValue && currentValue.split('/')[0].includes(':')

      if (!classroomTabsRef.current.has(tabFromUrl) || (!isCurrentValueEncoded && currentValue !== classroomPath)) {
        const updatedClassroomTabs = new Map(classroomTabsRef.current)
        updatedClassroomTabs.set(tabFromUrl, classroomPath)
        classroomTabsRef.current = updatedClassroomTabs
        setClassroomTabs(updatedClassroomTabs)
      }

      // If this is a student route, also populate studentProfileTabs
      if (segments.length >= 4 && segments[2] === 'student') {
        const studentSlug = segments[3]
        // Convert slug to name (e.g., 'aisha-rahman' -> 'Aisha Rahman')
        const studentName = studentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

        // Always update to ensure component re-renders with correct data
        if (!studentProfileTabsRef.current.has(tabFromUrl) || studentProfileTabsRef.current.get(tabFromUrl) !== studentName) {
          const updatedStudentProfileTabs = new Map(studentProfileTabsRef.current)
          updatedStudentProfileTabs.set(tabFromUrl, studentName)
          studentProfileTabsRef.current = updatedStudentProfileTabs
          setStudentProfileTabs(updatedStudentProfileTabs)
        }
      }
    }

    // Populate studentProfileTabs for standalone student routes
    if (tabFromUrl.startsWith('student-')) {
      const studentSlug = tabFromUrl.replace('student-', '')
      const studentName = studentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

      // Always update to ensure component re-renders with correct data
      if (!studentProfileTabsRef.current.has(tabFromUrl) || studentProfileTabsRef.current.get(tabFromUrl) !== studentName) {
        const updatedStudentProfileTabs = new Map(studentProfileTabsRef.current)
        updatedStudentProfileTabs.set(tabFromUrl, studentName)
        studentProfileTabsRef.current = updatedStudentProfileTabs
        setStudentProfileTabs(updatedStudentProfileTabs)
      }
    }

    // Smart tab addition: Only add if not already present AND no parent exists in openTabs
    const tabExists = currentTabsFromRef.includes(tabFromUrl as ClosableTabKey)

    if (!tabExists) {
      // Check if any ancestor of this URL exists in openTabs
      const parentInTabsForAddition = hasAnyParentInTabs(tabFromUrl, currentTabsFromRef)

      // Only add tab if no parent exists (this is a top-level navigation)
      if (!parentInTabsForAddition) {
        // Filter out the tab first to prevent any duplicates from race conditions
        const filteredTabs = currentTabsFromRef.filter(t => t !== (tabFromUrl as ClosableTabKey))
        const newTabs = [...filteredTabs, tabFromUrl as ClosableTabKey]
        openTabsRef.current = newTabs // Update ref immediately
        setOpenTabs(newTabs)
        // Note: sessionStorage persistence happens in the debounced effect above
      }
      // If parent exists, don't add tab - we're navigating within an existing tab
    }
  }, [params, activeTab, isMounted, closingTabs])

  // Memoize computed values to prevent unnecessary recalculations
  const currentState = React.useMemo(() => emptyStates[activeTab as keyof typeof emptyStates], [activeTab])
  const ActiveIcon = currentState?.icon
  const isNewTabActive = activeTab === newTabConfig.key
  const isProfileActive = activeTab === profileTabConfig.key
  const isAssistantTabActive = activeTab === assistantTabConfig.key
  const isHomeActive = activeTab === 'home' || activeTab === 'pulse'
  const isSidebarCollapsed = sidebarState === 'collapsed'
  const isAssistantSidebarOpen = assistantMode === 'sidebar' && isAssistantOpen

  // Get breadcrumbs for current tab - declare after handlers are defined
  const { breadcrumbs: pageBreadcrumbs, isLoading: breadcrumbsLoading } = useBreadcrumbs({
    activeTab: currentUrl as string,
    classroomTabs,
    studentProfileTabs,
    classroomNames,
    // Use inline function to avoid hoisting issues
    onNavigate: useCallback((path: string, replace?: boolean) => {
      const newPath = path === 'home' ? '/' : `/${path}`
      router.push(newPath, { scroll: false })
    }, [router]),
  })

  // Memoize page actions - declare after all handlers
  const pageActions = React.useMemo((): PageAction[] => {
    let actions: PageAction[] = []

    if (activeTab === 'home') {
      // Home page actions
      actions = [
        {
          label: 'Pulse',
          icon: Zap,
          onClick: () => handleNavigate('pulse', true),
          variant: 'outline',
        },
      ]
    } else if (typeof activeTab === 'string' && activeTab.startsWith('classroom/')) {
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
        actions = [
          {
            label: 'New record',
            icon: FilePen,
            variant: 'outline',
            isDropdown: true,
            dropdownItems: [
              {
                label: 'Attendance',
                icon: UserCheck,
                onClick: undefined,
                disabled: true,
              },
              {
                label: 'Performance',
                icon: TrendingUp,
                onClick: undefined,
                disabled: true,
              },
              {
                label: 'Profile',
                icon: UserCircle,
                onClick: undefined,
                disabled: true,
              },
              {
                label: 'Cases',
                icon: Briefcase,
                onClick: undefined,
                disabled: true,
              },
            ],
          },
          {
            label: 'Message Parents',
            icon: MessageSquare,
            onClick: undefined,
            disabled: true,
            variant: 'outline',
          },
        ]
      } else {
        // Class overview page actions
        actions = [
          {
            label: 'New record',
            icon: FilePen,
            variant: 'outline',
            isDropdown: true,
            dropdownItems: [
              {
                label: 'Academic',
                icon: Award,
                onClick: classId ? () => handleOpenGrades(classId) : undefined,
                disabled: !classId,
              },
              {
                label: 'Attendance',
                icon: UserCheck,
                onClick: undefined,
                disabled: true,
              },
              {
                label: 'Performance',
                icon: TrendingUp,
                onClick: undefined,
                disabled: true,
              },
              {
                label: 'Profile',
                icon: UserCircle,
                onClick: undefined,
                disabled: true,
              },
              {
                label: 'Cases',
                icon: Briefcase,
                onClick: undefined,
                disabled: true,
              },
            ],
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
      actions = [
        {
          label: 'New record',
          icon: FilePen,
          variant: 'outline',
          isDropdown: true,
          dropdownItems: [
            {
              label: 'Attendance',
              icon: UserCheck,
              onClick: undefined,
              disabled: true,
            },
            {
              label: 'Performance',
              icon: TrendingUp,
              onClick: undefined,
              disabled: true,
            },
            {
              label: 'Profile',
              icon: UserCircle,
              onClick: undefined,
              disabled: true,
            },
            {
              label: 'Cases',
              icon: Briefcase,
              onClick: undefined,
              disabled: true,
            },
          ],
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

    return actions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, classroomTabs])

  const handleNavigate = (tabKey: ClosableTabKey, navigateWithinTab: boolean = false) => {
    // Determine if this is a parent (top-level) page or a child page
    const isParentPage = isTopLevelTab(tabKey)
    const parentOfThisPage = getParentTab(tabKey)

    // If navigateWithinTab is true OR this is a child page, just navigate the URL without changing tabs
    if (navigateWithinTab || (!isParentPage && parentOfThisPage)) {
      // Just navigate the URL - keep the current tab structure
      const newPath = tabKey === 'home' ? '/' : `/${tabKey}`
      router.push(newPath, { scroll: false })
      return
    }

    // For parent pages: Open/switch to the tab
    const newPath = tabKey === 'home' ? '/' : `/${tabKey}`
    router.push(newPath, { scroll: false })
  }

  const handleOpenGrades = useCallback((classId: string) => {
    const tabKey = `classroom/${classId}/grades` as ClassroomTabKey

    setClassroomTabs((prev) => {
      const updated = new Map(prev)
      updated.set(tabKey, `${classId}/grades`)
      return updated
    })

    handleNavigate(tabKey, true) // Navigate within tab
  }, [setClassroomTabs])

  const handleOpenStudentProfile = (studentName: string) => {
    const tabKey = `student-${studentName.toLowerCase().replace(/\s+/g, '-')}` as StudentProfileTabKey

    // Update both state and ref to ensure immediate availability
    const updatedStudentProfileTabs = new Map(studentProfileTabsRef.current)
    updatedStudentProfileTabs.set(tabKey, studentName)
    studentProfileTabsRef.current = updatedStudentProfileTabs
    setStudentProfileTabs(updatedStudentProfileTabs)

    handleNavigate(tabKey)
  }

  const handleOpenClassroom = (classId: string, className?: string) => {
    const tabKey = `classroom/${classId}` as ClassroomTabKey

    // Encode className in the classroomPath using delimiter ":"
    // Format: "classId:className" or just "classId" if no name provided
    const classroomPath = className ? `${classId}:${className}` : classId

    // Update classroomTabs ref AND state synchronously
    const updatedClassroomTabs = new Map(classroomTabsRef.current)
    updatedClassroomTabs.set(tabKey, classroomPath)
    classroomTabsRef.current = updatedClassroomTabs
    setClassroomTabs(updatedClassroomTabs)

    handleNavigate(tabKey, true) // Navigate within tab
  }

  const handleOpenStudentList = (classId: string) => {
    const tabKey = `classroom/${classId}/students` as ClassroomTabKey

    setClassroomTabs((prev) => {
      const updated = new Map(prev)
      updated.set(tabKey, `${classId}/students`)
      return updated
    })

    handleNavigate(tabKey, true) // Navigate within tab
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

    handleNavigate(tabKey, true) // Navigate within tab
  }

  const handleOpenConversation = (conversationId: string) => {
    // Navigate to /inbox/conv-id to show the conversation in the split view
    router.push(`/inbox/${conversationId}`)
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
    const currentTabs = openTabsRef.current
    const filteredTabs = currentTabs.filter((key) => key !== pageKey)

    // Mark tab as closing to prevent re-adding
    setClosingTabs(prev => new Set(prev).add(pageKey as string))

    // Update ref and state
    openTabsRef.current = filteredTabs
    setOpenTabs(filteredTabs)

    // IMMEDIATELY persist to sessionStorage (don't wait for debounced effect)
    try {
      sessionStorage.setItem('openTabs', JSON.stringify(filteredTabs))
    } catch (error) {
      console.error('Failed to persist tabs to sessionStorage:', error)
    }

    // Only navigate if we're closing the currently active tab
    if (activeTab === pageKey) {
      // Determine the new active tab
      const closingIndex = currentTabs.indexOf(pageKey as ClosableTabKey)
      const newActiveTab =
        filteredTabs[closingIndex - 1] ??
        filteredTabs[closingIndex] ??
        (filteredTabs.length > 0 ? filteredTabs[filteredTabs.length - 1] : 'home')

      // Navigate to the new active tab
      const newPath = newActiveTab === 'home' ? '/' : `/${newActiveTab}`
      router.push(newPath, { scroll: false })
      setActiveTab(newActiveTab)
    }

    // Clear the closing marker after navigation completes
    setTimeout(() => {
      setClosingTabs(prev => {
        const next = new Set(prev)
        next.delete(pageKey as string)
        return next
      })
    }, 500)
  }, [activeTab, router])

  // Restore tabs from sessionStorage BEFORE first paint to prevent hydration mismatch
  // Using useLayoutEffect ensures this runs synchronously before the browser paints
  useLayoutEffect(() => {
    // Only run on client-side mount
    if (typeof window === 'undefined') return

    try {
      // Restore open tabs from sessionStorage
      const storedTabs = sessionStorage.getItem('openTabs')
      if (storedTabs) {
        const parsedTabs = JSON.parse(storedTabs) as ClosableTabKey[]
        setOpenTabs(parsedTabs)
        openTabsRef.current = parsedTabs
      }

      // Restore student profile tabs from sessionStorage
      const storedStudentTabs = sessionStorage.getItem('studentProfileTabs')
      if (storedStudentTabs) {
        const parsedMap = new Map<string, string>(JSON.parse(storedStudentTabs))
        setStudentProfileTabs(parsedMap)
        studentProfileTabsRef.current = parsedMap
      }

      // Restore classroom tabs from sessionStorage
      const storedClassroomTabs = sessionStorage.getItem('classroomTabs')
      if (storedClassroomTabs) {
        const parsedMap = new Map<string, string>(JSON.parse(storedClassroomTabs))
        setClassroomTabs(parsedMap)
        classroomTabsRef.current = parsedMap
      }

      // Restore classroom names from sessionStorage
      const storedClassroomNames = sessionStorage.getItem('classroomNames')
      if (storedClassroomNames) {
        const parsedMap = new Map<string, string>(JSON.parse(storedClassroomNames))
        setClassroomNames(parsedMap)
        classroomNamesRef.current = parsedMap
      }
    } catch (error) {
      // If sessionStorage is corrupted or full, clear it and start fresh
      console.error('Failed to restore tabs from sessionStorage:', error)
      try {
        sessionStorage.removeItem('openTabs')
        sessionStorage.removeItem('studentProfileTabs')
        sessionStorage.removeItem('classroomTabs')
        sessionStorage.removeItem('classroomNames')
      } catch {
        // Ignore errors clearing storage
      }
    } finally {
      // Mark as mounted AFTER restoration completes
      setIsMounted(true)
    }
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

  // Memoize visible tab calculation for better performance
  const { visibleTabs, hiddenTabs, visibleTabCount } = React.useMemo(() => {
    const getVisibleTabCount = () => {
      if (containerWidth === 0) return openTabs.length // Show all by default until measured

      // Constants for UI elements
      const GAP = 8 // gap-2 (0.5rem = 8px)
      const NEW_TAB_BUTTON_WIDTH = isNewTabActive ? 100 : 36
      const MORE_DROPDOWN_WIDTH = 36
      const ASSISTANT_BUTTON_WIDTH = (!isAssistantTabActive && !isAssistantSidebarOpen) ? 120 : 0
      const MIN_TAB_WIDTH = 120 // 7.5rem minimum width for each tab (reduced from 160px)

      // The containerWidth already includes everything (tabs + new tab button + assistant button)
      // We need to calculate how much space is available for the actual tabs
      // Layout: [tabs...] [gap] [more?] [gap] [new tab button] [gap] [assistant button]
      const fixedElementsWidth = NEW_TAB_BUTTON_WIDTH + ASSISTANT_BUTTON_WIDTH
      const fixedGapsWidth = ASSISTANT_BUTTON_WIDTH > 0 ? GAP * 2 : GAP // gaps around fixed elements

      // Available space for tabs (including gaps between tabs)
      let availableSpace = containerWidth - fixedElementsWidth - fixedGapsWidth

      // Try to fit all tabs first (no more dropdown)
      const allTabsSpace = openTabs.length * MIN_TAB_WIDTH + Math.max(0, openTabs.length - 1) * GAP

      if (allTabsSpace <= availableSpace) {
        // All tabs fit, show them all
        return openTabs.length
      }

      // Need more dropdown - account for its width and gap
      availableSpace -= (MORE_DROPDOWN_WIDTH + GAP)

      // Calculate how many tabs can fit
      // Formula: (tabCount * MIN_TAB_WIDTH) + ((tabCount - 1) * GAP) <= availableSpace
      // Solving: tabCount * (MIN_TAB_WIDTH + GAP) - GAP <= availableSpace
      //         tabCount <= (availableSpace + GAP) / (MIN_TAB_WIDTH + GAP)
      const maxTabs = Math.floor((availableSpace + GAP) / (MIN_TAB_WIDTH + GAP))

      return Math.max(1, Math.min(maxTabs, openTabs.length))
    }

    const count = getVisibleTabCount()

    // Ensure active tab is always visible
    let visible = [...openTabs]
    let hidden: ClosableTabKey[] = []

    if (openTabs.length > count) {
      const activeIndex = openTabs.indexOf(activeTab as ClosableTabKey)

      if (activeIndex >= count) {
        // If active tab is hidden, swap it with the last visible tab
        visible = [...openTabs]
        ;[visible[count - 1], visible[activeIndex]] =
          [visible[activeIndex], visible[count - 1]]
      }

      hidden = visible.slice(count)
      visible = visible.slice(0, count)
    }

    return { visibleTabs: visible, hiddenTabs: hidden, visibleTabCount: count }
  }, [containerWidth, openTabs, activeTab, isNewTabActive, isAssistantTabActive, isAssistantSidebarOpen])

  const handleNewTab = () => {
    setActiveTab(newTabConfig.key)
    router.push('/new-tab', { scroll: false })
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
    <div className="flex h-svh w-full bg-stone-100 dark:bg-stone-800">
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent className="gap-6">
          <SidebarGroup className="gap-3">
            <div className="flex h-8 w-full items-center justify-between pl-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <SidebarGroupLabel className="flex-1 truncate px-0 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:hidden">
                Tan&apos;s Space
              </SidebarGroupLabel>
              <SidebarTrigger className="size-7 shrink-0" />
            </div>
            <SidebarGroupContent>
              {/* Main navigation items */}
              <SidebarMenu>
                {primaryPages.slice(0, 4).map((page) => {
                  const Icon = page.icon
                  const isInbox = page.key === 'inbox'
                  const urgentMessageCount = isInbox ? 2 : 0 // TODO: Replace with actual urgent conversation count

                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        tooltip={page.tooltip}
                        isActive={
                          activeTab === page.key ||
                          (page.key === 'classroom' && typeof activeTab === 'string' && activeTab.startsWith('classroom/')) ||
                          (page.key === 'home' && activeTab === 'pulse')
                        }
                        onClick={() => handleNavigate(page.key)}
                        type="button"
                      >
                        <Icon className="size-4" />
                        <span>{page.label}</span>
                      </SidebarMenuButton>
                      {isInbox && urgentMessageCount > 0 && (
                        <SidebarMenuBadge>{urgentMessageCount}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>

              <SidebarSeparator className="mx-0 my-2 w-full" />

              {/* School management section */}
              <SidebarGroupLabel className="mb-2">
                School management
              </SidebarGroupLabel>
              <SidebarMenu>
                {primaryPages.slice(4, 6).map((page) => {
                  const Icon = page.icon

                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        tooltip={page.tooltip}
                        isActive={
                          activeTab === page.key ||
                          (page.key === 'classroom' && typeof activeTab === 'string' && activeTab.startsWith('classroom/')) ||
                          (page.key === 'home' && activeTab === 'pulse')
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

              {/* Growth section */}
              <SidebarGroupLabel className="mb-2">
                Growth
              </SidebarGroupLabel>
              <SidebarMenu>
                {primaryPages.slice(6, 8).map((page) => {
                  const Icon = page.icon

                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        tooltip={page.tooltip}
                        isActive={
                          activeTab === page.key ||
                          (page.key === 'classroom' && typeof activeTab === 'string' && activeTab.startsWith('classroom/')) ||
                          (page.key === 'home' && activeTab === 'pulse')
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

              {/* More section */}
              <SidebarGroupLabel className="mb-2">
                More
              </SidebarGroupLabel>
              <SidebarMenu>
                {primaryPages.slice(8).map((page) => {
                  const Icon = page.icon

                  return (
                    <SidebarMenuItem key={page.key}>
                      <SidebarMenuButton
                        tooltip={page.tooltip}
                        isActive={
                          activeTab === page.key ||
                          (page.key === 'classroom' && typeof activeTab === 'string' && activeTab.startsWith('classroom/')) ||
                          (page.key === 'home' && activeTab === 'pulse')
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
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="sticky top-0 z-20 overflow-hidden rounded-t-2xl bg-background">
            <div className="px-4">
              <div ref={tabContainerRef} className="flex items-center gap-2 py-2" suppressHydrationWarning>
                <div className="flex items-center gap-2" suppressHydrationWarning>
                <TooltipProvider delayDuration={150}>
                      {visibleTabs.map((tabKey, index) => {
                    const tab = tabConfigMap[tabKey as keyof typeof tabConfigMap]
                    const isStudentProfile = typeof tabKey === 'string' && tabKey.startsWith('student-')
                    const isClassroom = typeof tabKey === 'string' && tabKey.startsWith('classroom/')
                    const isHomeChild = typeof tabKey === 'string' && tabKey === 'pulse'
                    const studentName = isStudentProfile ? studentProfileTabs.get(tabKey) : undefined
                    // Use ref for immediate access to avoid UUID flicker
                    let classroomPath = isClassroom ? classroomTabsRef.current.get(tabKey) : undefined
                    // Fallback: derive classroomPath from tabKey if not in map
                    if (isClassroom && !classroomPath && typeof tabKey === 'string') {
                      classroomPath = tabKey.replace('classroom/', '')
                    }

                    if (!tab && !isStudentProfile && !isClassroom && !isHomeChild) {
                      return null
                    }

                    const Icon = tab?.icon ?? (isClassroom ? Users : isHomeChild ? Zap : User)

                    // Parse tab labels - show child page label
                    let label = ''
                    if (tabKey === 'pulse') {
                      // Pulse is a child of Home, show "Pulse" in the tab
                      label = 'Pulse'
                    } else if (isStudentProfile) {
                      label = studentName ?? 'Student'
                    } else if (isClassroom && classroomPath) {
                      const parts = classroomPath.split('/')
                      const pathFirst = parts[0] // This is "classId:className" or just "classId"
                      // Parse encoded className from pathFirst (format: "classId:className")
                      const [classId, encodedClassName] = pathFirst.includes(':') ? pathFirst.split(':', 2) : [pathFirst, null]
                      const className = encodedClassName || classroomNamesRef.current.get(classId) || 'Details'
                      if (classroomPath.includes('/student/')) {
                        // classroom/{classId}/student/{studentSlug} -> show student name
                        let studentNameFromMap = studentProfileTabs.get(tabKey)
                        // Fallback: derive from URL if not in map
                        if (!studentNameFromMap && typeof tabKey === 'string') {
                          const segments = tabKey.split('/')
                          if (segments.length >= 4 && segments[2] === 'student') {
                            const studentSlug = segments[3]
                            studentNameFromMap = studentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          }
                        }
                        label = studentNameFromMap ?? 'Student'
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

                    return (
                      <button
                        key={tabKey}
                        type="button"
                        data-tab-item={true}
                        draggable={true}
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
                        className={cn(
                          'group relative flex items-center justify-start gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-200 min-w-[7.5rem] max-w-[20rem] flex-1',
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
                        <span className="truncate text-left flex-1 min-w-0">{label}</span>
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
                            const pathFirst = parts[0] // This is "classId:className" or just "classId"
                            // Parse encoded className from pathFirst (format: "classId:className")
                            const [classId, encodedClassName] = pathFirst.includes(':') ? pathFirst.split(':', 2) : [pathFirst, null]
                            const className = encodedClassName || classroomNamesRef.current.get(classId) || 'Details'
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
                          'group relative flex h-9 items-center rounded-md transition-colors',
                          isNewTabActive
                            ? 'gap-2 px-3 py-1.5 text-sm bg-background text-foreground shadow-sm ring-1 ring-border min-w-[4rem] justify-start'
                            : 'w-9 justify-center text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                        aria-label="Open new tab"
                      >
                        <Plus className="size-4" />
                        {isNewTabActive && <span className="truncate text-left flex-1 min-w-0">{newTabConfig.label}</span>}
                        {isNewTabActive && (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation()
                              handleCloseTab(newTabConfig.key)
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                event.stopPropagation()
                                handleCloseTab(newTabConfig.key)
                              }
                            }}
                            className={cn(
                              "absolute right-1 flex size-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 z-10",
                              "text-muted-foreground/80 hover:text-foreground focus-visible:text-foreground bg-background/95 rounded-md"
                            )}
                            aria-label="Close New Tab"
                          >
                            <X className="size-3.5" />
                          </div>
                        )}
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
                      <Sparkle className="size-4" />
                      Assistant
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col bg-background">
              {/* Page Header */}
              <div className="flex h-16 items-center gap-3 px-4">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden flex-1 md:flex items-center">
                  {/* Breadcrumbs */}
                  {pageBreadcrumbs && pageBreadcrumbs.length > 0 && (
                    <Breadcrumbs items={pageBreadcrumbs} isLoading={breadcrumbsLoading} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Page Actions */}
                  {pageActions && pageActions.length > 0 && (
                    <>
                      {pageActions.map((action, index) => {
                        const Icon = action.icon

                        // Render dropdown if action has dropdown items
                        if (action.isDropdown && action.dropdownItems) {
                          return (
                            <DropdownMenu key={index}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant={action.variant || 'outline'}
                                  className="hidden sm:flex"
                                >
                                  <Icon className="mr-1.5 h-4 w-4" />
                                  {action.label}
                                  <ChevronDown className="ml-1.5 h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {action.dropdownItems.map((item, itemIndex) => {
                                  const ItemIcon = item.icon
                                  return (
                                    <DropdownMenuItem
                                      key={itemIndex}
                                      onClick={item.onClick}
                                      disabled={item.disabled}
                                    >
                                      {ItemIcon && <ItemIcon className="mr-2 h-4 w-4" />}
                                      {item.label}
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )
                        }

                        // Regular button
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
          <div className="flex flex-1 min-h-0 overflow-hidden rounded-b-[15px]">
            <div
                className={cn(
                  'flex flex-1 min-h-0 flex-col',
                  // Remove overflow-y-auto for inbox to allow independent section scrolling
                  activeTab !== 'inbox' && !(typeof activeTab === 'string' && activeTab.startsWith('inbox/')) && 'overflow-y-auto',
                  activeTab === 'pulse' || activeTab === 'home' || activeTab === 'inbox' || (typeof activeTab === 'string' && activeTab.startsWith('inbox/')) ? '' : 'px-8 py-10',
                )}
              >
                <TabContent
                  activeTab={activeTab}
                  currentUrl={currentUrl}
                  slug={slug}
                  isAssistantTabActive={isAssistantTabActive}
                  assistantMode={assistantMode}
                  isAssistantOpen={isAssistantOpen}
                  isHomeActive={isHomeActive}
                  currentState={currentState}
                  ActiveIcon={ActiveIcon}
                  isProfileActive={isProfileActive}
                  classroomTabs={classroomTabs}
                  studentProfileTabs={studentProfileTabs}
                  handleNavigate={handleNavigate}
                  handleOpenStudentProfile={handleOpenStudentProfile}
                  handleOpenClassroom={handleOpenClassroom}
                  handleOpenConversation={handleOpenConversation}
                  handleCloseTab={handleCloseTab}
                  handleAssistantMessage={handleAssistantMessage}
                  handleOpenStudentFromClass={handleOpenStudentFromClass}
                  handleOpenGrades={handleOpenGrades}
                  setIsAssistantOpen={setIsAssistantOpen}
                  handleAssistantModeChange={handleAssistantModeChange}
                  setClassroomTabs={setClassroomTabs}
                  setOpenTabs={setOpenTabs}
                  openTabsRef={openTabsRef}
                  router={router}
                />
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
