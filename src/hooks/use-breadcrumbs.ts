'use client'

import { useMemo, useCallback, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export interface BreadcrumbItem {
  label: string
  path: string
  isActive: boolean
  isLoading?: boolean // Indicates this item is still loading
  onClick?: () => void
}

interface UseBreadcrumbsProps {
  activeTab?: string
  classroomTabs?: Map<string, string>
  studentProfileTabs?: Map<string, string>
  classroomNames?: Map<string, string>
  onNavigate?: (path: string, replaceTab?: boolean) => void
}

interface UseBreadcrumbsReturn {
  breadcrumbs: BreadcrumbItem[]
  isLoading: boolean
}

/**
 * Hook to generate breadcrumb navigation based on current route
 * Handles multi-tab navigation model with parent-child relationships
 */
export function useBreadcrumbs({
  activeTab,
  classroomTabs,
  studentProfileTabs,
  classroomNames,
  onNavigate,
}: UseBreadcrumbsProps = {}): UseBreadcrumbsReturn {
  const router = useRouter()
  const pathname = usePathname()
  const [classNames, setClassNames] = useState<Map<string, string>>(new Map())
  const [isLoadingClassNames, setIsLoadingClassNames] = useState(false)

  // Use pathname if activeTab not provided
  const currentPath = activeTab || pathname.slice(1) || 'home'

  // Fetch class name when navigating to a classroom route
  useEffect(() => {
    async function fetchClassName() {
      if (!currentPath.startsWith('classroom/')) return

      const segments = currentPath.split('/')
      if (segments.length < 2) return

      const classId = segments[1]

      // Check if we already have this class name
      if (classNames.has(classId)) return

      setIsLoadingClassNames(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('classes')
          .select('name')
          .eq('id', classId)
          .single()

        if (!error && data && typeof data === 'object' && 'name' in data) {
          setClassNames(prev => new Map(prev).set(classId, (data as { name: string }).name))
        }
      } catch (err) {
        console.error('Error fetching class name:', err)
      } finally {
        setIsLoadingClassNames(false)
      }
    }

    fetchClassName()
  }, [currentPath, classNames])

  const handleNavigate = useCallback((path: string, replaceTab: boolean = false) => {
    if (onNavigate) {
      onNavigate(path, replaceTab)
    } else {
      router.push(path === 'home' ? '/' : `/${path}`)
    }
  }, [onNavigate, router])

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = []

    // Always add Home as first item (unless we're on home page)
    if (currentPath !== 'home') {
      // Check if current path is a child of home (e.g., roundup/pulse)
      const isHomeChild = currentPath === 'roundup'
      items.push({
        label: 'Home',
        path: 'home',
        isActive: false,
        // Replace tab if navigating from home child back to home
        onClick: () => handleNavigate('home', isHomeChild),
      })
    }

    // Parse the current path to determine breadcrumb structure
    if (currentPath === 'home') {
      // Show "Home" as the only breadcrumb
      items.push({
        label: 'Home',
        path: 'home',
        isActive: true,
      })
    } else if (currentPath === 'explore') {
      items.push({
        label: 'Explore',
        path: 'explore',
        isActive: true,
      })
    } else if (currentPath === 'records') {
      items.push({
        label: 'Records',
        path: 'records',
        isActive: true,
      })
    } else if (currentPath === 'roundup') {
      // Roundup/Pulse is a child of Home
      items.push({
        label: 'Pulse',
        path: 'roundup',
        isActive: true,
      })
    } else if (currentPath === 'classroom') {
      // Main classroom page
      items.push({
        label: 'Classroom',
        path: 'classroom',
        isActive: true,
      })
    } else if (currentPath.startsWith('classroom/')) {
      // Classroom sub-pages
      const segments = currentPath.split('/')

      // Add Classroom root
      items.push({
        label: 'Classroom',
        path: 'classroom',
        isActive: false,
        onClick: () => handleNavigate('classroom', true),
      })

      if (segments.length >= 2) {
        const classId = segments[1]
        // Try multiple sources for the class name
        const className =
          classroomNames?.get(classId) ||  // First check cached names from navigation
          classNames.get(classId) ||        // Then check async fetched names
          classroomTabs?.get(`classroom/${classId}`) || // Fallback to tab path
          null                               // Use null to indicate loading

        // Check if this is a nested student view
        if (segments.length >= 4 && segments[2] === 'student') {
          // classroom/{classId}/student/{studentSlug}
          const studentSlug = segments[3]
          const studentName = studentProfileTabs?.get(currentPath) ||
                             studentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

          // Add class breadcrumb - show skeleton if loading
          items.push({
            label: className || 'Loading',
            path: `classroom/${classId}`,
            isActive: false,
            isLoading: !className,
            onClick: () => handleNavigate(`classroom/${classId}`, true),
          })

          // Add student breadcrumb
          items.push({
            label: studentName,
            path: currentPath,
            isActive: true,
          })
        } else if (segments.length >= 3 && segments[2] === 'students') {
          // classroom/{classId}/students
          items.push({
            label: className || 'Loading',
            path: `classroom/${classId}`,
            isActive: false,
            isLoading: !className,
            onClick: () => handleNavigate(`classroom/${classId}`, true),
          })

          items.push({
            label: 'Students',
            path: currentPath,
            isActive: true,
          })
        } else if (segments.length >= 3 && segments[2] === 'grades') {
          // classroom/{classId}/grades
          items.push({
            label: className || 'Loading',
            path: `classroom/${classId}`,
            isActive: false,
            isLoading: !className,
            onClick: () => handleNavigate(`classroom/${classId}`, true),
          })

          items.push({
            label: 'Grade Entry',
            path: currentPath,
            isActive: true,
          })
        } else if (segments.length >= 3 && segments[2] === 'attendance') {
          // classroom/{classId}/attendance
          items.push({
            label: className || 'Loading',
            path: `classroom/${classId}`,
            isActive: false,
            isLoading: !className,
            onClick: () => handleNavigate(`classroom/${classId}`, true),
          })

          items.push({
            label: 'Attendance',
            path: currentPath,
            isActive: true,
          })
        } else {
          // Just classroom/{classId}
          items.push({
            label: className || 'Loading',
            path: currentPath,
            isActive: true,
            isLoading: !className,
          })
        }
      }
    } else if (currentPath.startsWith('student/')) {
      // Direct student profile access (not through classroom)
      const segments = currentPath.split('/')
      const studentSlug = segments[1]
      const studentName = studentProfileTabs?.get(currentPath) ||
                         studentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

      items.push({
        label: 'Students',
        path: 'students',
        isActive: false,
        onClick: () => handleNavigate('explore', true), // Navigate to explore page which might have students
      })

      items.push({
        label: studentName,
        path: currentPath,
        isActive: true,
      })
    }

    return items
  }, [currentPath, classNames, classroomTabs, studentProfileTabs, classroomNames, handleNavigate])

  return {
    breadcrumbs,
    isLoading: isLoadingClassNames,
  }
}