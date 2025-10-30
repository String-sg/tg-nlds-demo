'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export type TabKey =
  | 'home'
  | 'explore'
  | 'records'
  | 'daily-roundup'
  | ClassroomTabKey
  | `student/${string}`

export type ClassroomTabKey =
  | `classroom/${string}`
  | `classroom/${string}/student/${string}`

export type ClosableTabKey = Exclude<TabKey, 'home'>

interface UseTabManagementProps {
  initialTab?: TabKey
  params?: { slug?: string | string[] }
}

interface UseTabManagementReturn {
  activeTab: TabKey
  openTabs: ClosableTabKey[]
  dragOverTab: ClosableTabKey | null
  studentProfileTabs: Map<string, string>
  classroomTabs: Map<string, string>
  setActiveTab: (tab: TabKey) => void
  setOpenTabs: (tabs: ClosableTabKey[] | ((prev: ClosableTabKey[]) => ClosableTabKey[])) => void
  setDragOverTab: (tab: ClosableTabKey | null) => void
  handleNavigate: (tab: TabKey, replaceTab?: boolean) => void
  handleCloseTab: (pageKey: TabKey) => void
  handleOpenClassroom: (classId: string, className: string) => void
  handleOpenStudentProfile: (studentName: string) => void
  handleOpenStudentFromClass: (classId: string, studentName: string) => void
  openTabsRef: React.MutableRefObject<ClosableTabKey[]>
  studentProfileTabsRef: React.MutableRefObject<Map<string, string>>
  classroomTabsRef: React.MutableRefObject<Map<string, string>>
}

export function useTabManagement({
  initialTab = 'home',
  params
}: UseTabManagementProps = {}): UseTabManagementReturn {
  const router = useRouter()

  // Initialize tabs from sessionStorage
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
  const [openTabs, setOpenTabs] = useState<ClosableTabKey[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('openTabs')
      if (stored) {
        try {
          return JSON.parse(stored) as ClosableTabKey[]
        } catch {
          // Failed to parse, return empty array
        }
      }
    }
    return []
  })

  const [dragOverTab, setDragOverTab] = useState<ClosableTabKey | null>(null)

  const [studentProfileTabs, setStudentProfileTabs] = useState<Map<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('studentProfileTabs')
      if (stored) {
        try {
          return new Map(JSON.parse(stored))
        } catch {
          // Failed to parse
        }
      }
    }
    return new Map()
  })

  const [classroomTabs, setClassroomTabs] = useState<Map<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('classroomTabs')
      if (stored) {
        try {
          return new Map(JSON.parse(stored))
        } catch {
          // Failed to parse
        }
      }
    }
    return new Map()
  })

  // Refs for immediate access
  const openTabsRef = useRef<ClosableTabKey[]>(openTabs)
  const studentProfileTabsRef = useRef<Map<string, string>>(studentProfileTabs)
  const classroomTabsRef = useRef<Map<string, string>>(classroomTabs)

  // Update refs when state changes
  useEffect(() => {
    openTabsRef.current = openTabs
  }, [openTabs])

  useEffect(() => {
    studentProfileTabsRef.current = studentProfileTabs
  }, [studentProfileTabs])

  useEffect(() => {
    classroomTabsRef.current = classroomTabs
  }, [classroomTabs])

  // Persist to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('studentProfileTabs', JSON.stringify(Array.from(studentProfileTabs)))
    }
  }, [studentProfileTabs])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('classroomTabs', JSON.stringify(Array.from(classroomTabs)))
    }
  }, [classroomTabs])

  // Sync URL with params
  useEffect(() => {
    if (!params) return

    const slug = params.slug as string[] | undefined
    const tabFromUrl = !slug || slug.length === 0 ? 'home' : slug.join('/')

    setActiveTab(tabFromUrl as TabKey)

    // Add tab if not present
    const currentTabsFromRef = openTabsRef.current
    const tabExists = currentTabsFromRef.includes(tabFromUrl as ClosableTabKey)

    if (!tabExists && tabFromUrl !== 'home') {
      const filteredTabs = currentTabsFromRef.filter(t => t !== (tabFromUrl as ClosableTabKey))
      const newTabs = [...filteredTabs, tabFromUrl as ClosableTabKey]
      openTabsRef.current = newTabs
      setOpenTabs(newTabs)
      sessionStorage.setItem('openTabs', JSON.stringify(newTabs))
    }
  }, [params])

  const handleNavigate = useCallback((tab: TabKey, replaceTab = false) => {
    setActiveTab(tab)
    router.push(`/${tab === 'home' ? '' : tab}`)

    if (tab !== 'home') {
      setOpenTabs(current => {
        const currentTabs = [...current]
        const closableTab = tab as ClosableTabKey

        if (replaceTab && currentTabs.length > 0) {
          const currentTabIndex = currentTabs.indexOf(activeTab as ClosableTabKey)
          if (currentTabIndex !== -1) {
            currentTabs[currentTabIndex] = closableTab
          } else {
            currentTabs[currentTabs.length - 1] = closableTab
          }
        } else if (!currentTabs.includes(closableTab)) {
          currentTabs.push(closableTab)
        }

        sessionStorage.setItem('openTabs', JSON.stringify(currentTabs))
        return currentTabs
      })
    }
  }, [activeTab, router])

  const handleCloseTab = useCallback((pageKey: TabKey) => {
    if (pageKey === 'home') return

    const closableKey = pageKey as ClosableTabKey
    const currentTabs = openTabsRef.current
    const tabIndex = currentTabs.indexOf(closableKey)

    if (tabIndex === -1) return

    const newTabs = currentTabs.filter((_, i) => i !== tabIndex)
    openTabsRef.current = newTabs
    setOpenTabs(newTabs)
    sessionStorage.setItem('openTabs', JSON.stringify(newTabs))

    // Clean up associated data
    if (pageKey.startsWith('classroom/')) {
      const updatedClassroomTabs = new Map(classroomTabsRef.current)
      updatedClassroomTabs.delete(pageKey)
      classroomTabsRef.current = updatedClassroomTabs
      setClassroomTabs(updatedClassroomTabs)

      if (pageKey.includes('/student/')) {
        const updatedStudentProfileTabs = new Map(studentProfileTabsRef.current)
        updatedStudentProfileTabs.delete(pageKey)
        studentProfileTabsRef.current = updatedStudentProfileTabs
        setStudentProfileTabs(updatedStudentProfileTabs)
      }
    } else if (pageKey.startsWith('student/')) {
      const updatedStudentProfileTabs = new Map(studentProfileTabsRef.current)
      updatedStudentProfileTabs.delete(pageKey)
      studentProfileTabsRef.current = updatedStudentProfileTabs
      setStudentProfileTabs(updatedStudentProfileTabs)
    }

    // Navigate to appropriate tab
    if (activeTab === pageKey) {
      if (newTabs.length === 0) {
        handleNavigate('home')
      } else if (tabIndex === 0) {
        handleNavigate(newTabs[0])
      } else {
        handleNavigate(newTabs[tabIndex - 1])
      }
    }
  }, [activeTab, handleNavigate, setClassroomTabs, setStudentProfileTabs])

  const handleOpenClassroom = useCallback((classId: string, className: string) => {
    const tabKey = `classroom/${classId}` as ClassroomTabKey
    const updatedClassroomTabs = new Map(classroomTabsRef.current)
    updatedClassroomTabs.set(tabKey, className)
    classroomTabsRef.current = updatedClassroomTabs
    setClassroomTabs(updatedClassroomTabs)
    handleNavigate(tabKey, true)
  }, [handleNavigate, setClassroomTabs])

  const handleOpenStudentProfile = useCallback((studentName: string) => {
    const studentSlug = studentName.toLowerCase().replace(/\s+/g, '-')
    const tabKey = `student/${studentSlug}` as TabKey
    const updatedStudentProfileTabs = new Map(studentProfileTabsRef.current)
    updatedStudentProfileTabs.set(tabKey, studentName)
    studentProfileTabsRef.current = updatedStudentProfileTabs
    setStudentProfileTabs(updatedStudentProfileTabs)
    handleNavigate(tabKey, true)
  }, [handleNavigate, setStudentProfileTabs])

  const handleOpenStudentFromClass = useCallback((classId: string, studentName: string) => {
    const studentSlug = studentName.toLowerCase().replace(/\s+/g, '-')
    const tabKey = `classroom/${classId}/student/${studentSlug}` as ClassroomTabKey

    // Update both maps
    const updatedClassroomTabs = new Map(classroomTabsRef.current)
    updatedClassroomTabs.set(tabKey, `${classId}/student/${studentSlug}`)
    classroomTabsRef.current = updatedClassroomTabs
    setClassroomTabs(updatedClassroomTabs)

    const updatedStudentProfileTabs = new Map(studentProfileTabsRef.current)
    updatedStudentProfileTabs.set(tabKey, studentName)
    studentProfileTabsRef.current = updatedStudentProfileTabs
    setStudentProfileTabs(updatedStudentProfileTabs)

    handleNavigate(tabKey, true)
  }, [handleNavigate, setClassroomTabs, setStudentProfileTabs])

  return {
    activeTab,
    openTabs,
    dragOverTab,
    studentProfileTabs,
    classroomTabs,
    setActiveTab,
    setOpenTabs,
    setDragOverTab,
    handleNavigate,
    handleCloseTab,
    handleOpenClassroom,
    handleOpenStudentProfile,
    handleOpenStudentFromClass,
    openTabsRef,
    studentProfileTabsRef,
    classroomTabsRef,
  }
}