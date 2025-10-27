'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchClassName } from '@/lib/queries/class-queries'

export interface BreadcrumbItem {
  label: string
  path: string
  isActive: boolean
  isLoading?: boolean
  onClick?: () => void
}

interface UseBreadcrumbsConfig {
  currentUrl: string
  onNavigate?: (path: string, replaceTab?: boolean) => void
  studentProfileTabs?: Map<string, string>
  classroomNames?: Map<string, string>
}

/**
 * Parse route segments from URL
 */
function parseRouteSegments(url: string): string[] {
  return url.split('/').filter(Boolean)
}

/**
 * Hook to fetch class name with TanStack Query caching
 */
function useClassNameQuery(classId: string | null) {
  return useQuery({
    queryKey: queryKeys.breadcrumbs.class(classId || ''),
    queryFn: async () => {
      if (!classId) return null
      return await fetchClassName(classId)
    },
    enabled: Boolean(classId),
    staleTime: 60 * 60 * 1000, // 1 hour cache
    gcTime: 2 * 60 * 60 * 1000,
    retry: 2,
    refetchOnMount: false,
  })
}

/**
 * Generate breadcrumb items from route segments
 */
function generateBreadcrumbs(
  segments: string[],
  className: string | null | undefined,
  isLoadingClass: boolean,
  config: UseBreadcrumbsConfig
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = []
  const { onNavigate, studentProfileTabs } = config

  // Home breadcrumb
  if (segments.length === 0 || segments[0] !== 'home') {
    breadcrumbs.push({
      label: 'Home',
      path: 'home',
      isActive: segments.length === 0 || (segments.length === 1 && segments[0] === 'home'),
      onClick: onNavigate ? () => onNavigate('home') : undefined,
    })
  }

  // Process route segments
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const isLast = i === segments.length - 1

    switch (segment) {
      case 'home':
        if (i === 0) {
          breadcrumbs.push({
            label: 'Home',
            path: 'home',
            isActive: isLast,
            onClick: onNavigate && !isLast ? () => onNavigate('home') : undefined,
          })
        }
        break

      case 'pulse':
        breadcrumbs.push({
          label: 'Pulse',
          path: 'pulse',
          isActive: isLast,
          onClick: onNavigate && !isLast ? () => onNavigate('pulse') : undefined,
        })
        break

      case 'classroom':
        // Add "My Classes" breadcrumb
        breadcrumbs.push({
          label: 'My Classes',
          path: 'classroom',
          isActive: isLast,
          onClick: onNavigate && !isLast ? () => onNavigate('classroom') : undefined,
        })

        // If there's a class ID next, add class name breadcrumb
        if (i + 1 < segments.length) {
          const classId = segments[i + 1]
          const isClassActive = i + 2 === segments.length

          if (isLoadingClass) {
            breadcrumbs.push({
              label: 'Loading...',
              path: `classroom/${classId}`,
              isActive: isClassActive,
              isLoading: true,
            })
          } else {
            breadcrumbs.push({
              label: className || classId.substring(0, 8),
              path: `classroom/${classId}`,
              isActive: isClassActive,
              onClick: onNavigate && !isClassActive ? () => onNavigate(`classroom/${classId}`) : undefined,
            })
          }

          i++ // Skip the class ID segment since we processed it
        }
        break

      case 'student':
        // Student profile breadcrumb
        if (i + 1 < segments.length) {
          const studentSlug = segments[i + 1]
          const isStudentActive = i + 2 === segments.length

          // Get student name from map if available
          const studentName = studentProfileTabs?.get(studentSlug) ||
            studentSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

          breadcrumbs.push({
            label: studentName,
            path: `${segments.slice(0, i + 2).join('/')}`,
            isActive: isStudentActive,
            onClick: onNavigate && !isStudentActive ? () => onNavigate(`${segments.slice(0, i + 2).join('/')}`) : undefined,
          })

          i++ // Skip the student slug segment
        }
        break

      case 'inbox':
        breadcrumbs.push({
          label: 'Messages',
          path: 'inbox',
          isActive: isLast,
          onClick: onNavigate && !isLast ? () => onNavigate('inbox') : undefined,
        })

        // If there's a conversation ID next
        if (i + 1 < segments.length) {
          const conversationId = segments[i + 1]
          const isConvActive = i + 2 === segments.length

          breadcrumbs.push({
            label: 'Conversation',
            path: `inbox/${conversationId}`,
            isActive: isConvActive,
            onClick: onNavigate && !isConvActive ? () => onNavigate(`inbox/${conversationId}`) : undefined,
          })

          i++ // Skip the conversation ID segment
        }
        break

      case 'calendar':
        breadcrumbs.push({
          label: 'Calendar',
          path: 'calendar',
          isActive: isLast,
          onClick: onNavigate && !isLast ? () => onNavigate('calendar') : undefined,
        })
        break

      case 'reports':
        breadcrumbs.push({
          label: 'Reports',
          path: 'reports',
          isActive: isLast,
          onClick: onNavigate && !isLast ? () => onNavigate('reports') : undefined,
        })
        break

      case 'settings':
        breadcrumbs.push({
          label: 'Settings',
          path: 'settings',
          isActive: isLast,
          onClick: onNavigate && !isLast ? () => onNavigate('settings') : undefined,
        })
        break

      default:
        // Unknown segment - skip
        break
    }
  }

  return breadcrumbs
}

/**
 * TanStack Query-powered breadcrumbs hook with route parsing
 *
 * This hook combines:
 * - TanStack Query for caching class names (1 hour cache)
 * - Route parsing logic to generate full breadcrumb trails
 * - Click navigation support
 * - Loading states with skeletons
 *
 * @param config - Configuration including current URL and navigation callback
 * @returns Breadcrumb items array and loading state
 */
export function useRouteBreadcrumbsQuery(config: UseBreadcrumbsConfig) {
  const segments = parseRouteSegments(config.currentUrl)

  // Extract class ID if present
  const classIdIndex = segments.indexOf('classroom')
  const classId = classIdIndex !== -1 && classIdIndex + 1 < segments.length
    ? segments[classIdIndex + 1]
    : null

  // Fetch class name with TanStack Query
  const { data: classData, isLoading: isLoadingClass } = useClassNameQuery(classId)

  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(
    segments,
    classData?.name,
    isLoadingClass,
    config
  )

  return {
    breadcrumbs,
    isLoading: isLoadingClass && classId !== null,
  }
}

/**
 * Legacy wrapper for backward compatibility
 */
export function useRouteBreadcrumbs(config: UseBreadcrumbsConfig) {
  return useRouteBreadcrumbsQuery(config)
}
