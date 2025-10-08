'use client'

import { useMemo, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getClassById } from '@/lib/mock-data/classroom-data'

export interface BreadcrumbItem {
  label: string
  path: string
  isActive: boolean
  onClick?: () => void
}

interface UseBreadcrumbsProps {
  activeTab?: string
  classroomTabs?: Map<string, string>
  studentProfileTabs?: Map<string, string>
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
  onNavigate,
}: UseBreadcrumbsProps = {}): UseBreadcrumbsReturn {
  const router = useRouter()
  const pathname = usePathname()

  // Use pathname if activeTab not provided
  const currentPath = activeTab || pathname.slice(1) || 'home'

  const handleNavigate = useCallback((path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      router.push(path === 'home' ? '/' : `/${path}`)
    }
  }, [onNavigate, router])

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = []

    // Always add Home as first item (unless we're on home page)
    if (currentPath !== 'home') {
      items.push({
        label: 'Home',
        path: 'home',
        isActive: false,
        onClick: () => handleNavigate('home'),
      })
    }

    // Parse the current path to determine breadcrumb structure
    if (currentPath === 'home') {
      // No breadcrumbs on home page
      return []
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
      items.push({
        label: 'Insights',
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
        onClick: () => handleNavigate('classroom'),
      })

      if (segments.length >= 2) {
        const classId = segments[1]
        const classData = getClassById(classId)
        const className = classData?.class_name || classroomTabs?.get(`classroom/${classId}`) || classId

        // Check if this is a nested student view
        if (segments.length >= 4 && segments[2] === 'student') {
          // classroom/{classId}/student/{studentSlug}
          const studentSlug = segments[3]
          const studentName = studentProfileTabs?.get(currentPath) ||
                             studentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

          // Add class breadcrumb
          items.push({
            label: `Class ${className}`,
            path: `classroom/${classId}`,
            isActive: false,
            onClick: () => handleNavigate(`classroom/${classId}`),
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
            label: `Class ${className}`,
            path: `classroom/${classId}`,
            isActive: false,
            onClick: () => handleNavigate(`classroom/${classId}`),
          })

          items.push({
            label: 'Students',
            path: currentPath,
            isActive: true,
          })
        } else if (segments.length >= 3 && segments[2] === 'grades') {
          // classroom/{classId}/grades
          items.push({
            label: `Class ${className}`,
            path: `classroom/${classId}`,
            isActive: false,
            onClick: () => handleNavigate(`classroom/${classId}`),
          })

          items.push({
            label: 'Grade Entry',
            path: currentPath,
            isActive: true,
          })
        } else if (segments.length >= 3 && segments[2] === 'attendance') {
          // classroom/{classId}/attendance
          items.push({
            label: `Class ${className}`,
            path: `classroom/${classId}`,
            isActive: false,
            onClick: () => handleNavigate(`classroom/${classId}`),
          })

          items.push({
            label: 'Attendance',
            path: currentPath,
            isActive: true,
          })
        } else {
          // Just classroom/{classId}
          items.push({
            label: `Class ${className}`,
            path: currentPath,
            isActive: true,
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
        onClick: () => handleNavigate('explore'), // Navigate to explore page which might have students
      })

      items.push({
        label: studentName,
        path: currentPath,
        isActive: true,
      })
    }

    return items
  }, [currentPath, classroomTabs, studentProfileTabs, handleNavigate])

  return {
    breadcrumbs,
    isLoading: false,
  }
}