'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getPTMStudents } from '@/app/actions/ptm-actions'

export interface PTMConfig {
  includeMetrics?: {
    attendance?: boolean
    grades?: boolean
    behaviour?: boolean
    cases?: boolean
  }
  sortBy?: 'priority' | 'name' | 'recent'
  filterBy?: {
    hasCases?: boolean
    lowAttendance?: boolean
    failingGrades?: boolean
  }
}

/**
 * TanStack Query hook for fetching PTM student data
 *
 * Migrated from SWR to TanStack Query for consistency.
 * Maintains 5-minute background refresh.
 *
 * @param teacherId - Teacher ID
 * @param config - PTM configuration options
 * @returns Query result with PTM student data
 */
export function usePTMStudentsQuery(teacherId: string, config?: PTMConfig) {
  return useQuery({
    queryKey: queryKeys.ptm.students(teacherId, config),
    queryFn: async () => {
      if (!teacherId) return []
      return await getPTMStudents(teacherId, config)
    },
    enabled: Boolean(teacherId),
    staleTime: 5 * 60 * 1000, // 5 minutes (PTM data doesn't change frequently)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
    refetchOnMount: true,
  })
}

/**
 * Hook wrapper with legacy API for backward compatibility
 */
export function usePTMStudents(teacherId: string, config?: PTMConfig) {
  const { data, error, isLoading, refetch } = usePTMStudentsQuery(teacherId, config)

  return {
    students: data?.students ?? [],
    isEmpty: data?.totalCount === 0,
    highPriorityCount: data?.highPriorityCount ?? 0,
    mediumPriorityCount: data?.mediumPriorityCount ?? 0,
    totalCount: data?.totalCount ?? 0,
    formClassId: data?.formClassId ?? null,
    loading: isLoading,
    error: error as Error | null,
    mutate: refetch,
  }
}
