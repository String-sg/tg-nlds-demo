'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchClassName } from '@/lib/queries/class-queries'

/**
 * TanStack Query hook for fetching class names for breadcrumbs
 *
 * Performance improvements over old hook:
 * - Added long cache (was local useState cache before!)
 * - Class names rarely change so we can cache for 1 hour
 * - Better error handling
 *
 * @param classId - Class ID to fetch name for
 * @returns Query result with class name
 */
export function useBreadcrumbsQuery(classId: string) {
  return useQuery({
    queryKey: queryKeys.breadcrumbs.class(classId),
    queryFn: async () => {
      if (!classId) return null
      return await fetchClassName(classId)
    },
    enabled: Boolean(classId),
    staleTime: 60 * 60 * 1000, // 1 hour (class names rarely change)
    gcTime: 2 * 60 * 60 * 1000, // Keep in cache for 2 hours
    retry: 2,
    refetchOnMount: false, // No need to refetch on mount
  })
}

/**
 * Hook wrapper with legacy API for backward compatibility
 */
export function useBreadcrumbs(classId: string) {
  const { data, error, isLoading } = useBreadcrumbsQuery(classId)

  return {
    breadcrumbs: {
      className: data?.name ?? null,
    },
    isLoading,
    error: error as Error | null,
  }
}
