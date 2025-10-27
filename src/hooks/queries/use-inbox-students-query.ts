'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchInboxStudents } from '@/lib/queries/class-queries'

/**
 * TanStack Query hook for fetching students for inbox conversations
 *
 * Performance improvements over old hook:
 * - Added 5-minute cache (was no cache before!)
 * - Better error handling
 *
 * @param teacherId - Teacher ID to fetch students for
 * @returns Query result with inbox student data
 */
export function useInboxStudentsQuery(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.inbox.students(teacherId),
    queryFn: async () => {
      if (!teacherId) return []
      return await fetchInboxStudents(teacherId)
    },
    enabled: Boolean(teacherId),
    staleTime: 5 * 60 * 1000, // 5 minutes (student enrollment doesn't change often)
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: 2,
    refetchOnMount: false, // No need to refetch on mount
  })
}

/**
 * Hook wrapper with legacy API for backward compatibility
 */
export function useInboxStudents(teacherId: string) {
  const { data, error, isLoading } = useInboxStudentsQuery(teacherId)

  return {
    students: data ?? [],
    loading: isLoading,
    error: error as Error | null,
  }
}
