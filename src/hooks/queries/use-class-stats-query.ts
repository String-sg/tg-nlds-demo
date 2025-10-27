'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchClassStats } from '@/lib/queries/class-queries'

/**
 * TanStack Query hook for fetching class statistics
 *
 * Performance improvements over old hook:
 * - Added 2-minute cache (was no cache before!)
 * - Parallel queries for stats
 * - Background revalidation
 *
 * @param classId - Class ID to fetch stats for
 * @returns Query result with class statistics
 */
export function useClassStatsQuery(classId: string) {
  return useQuery({
    queryKey: queryKeys.classes.stats(classId),
    queryFn: async () => {
      if (!classId) {
        return {
          total_students: 0,
          attendance: {
            rate: 0,
            present: 0,
            absent: 0,
            late: 0,
          },
          academic: {
            class_average: 0,
            pending_grades: 0,
          },
          alerts: {
            urgent: 0,
            high: 0,
            total: 0,
          },
        }
      }

      return await fetchClassStats(classId)
    },
    enabled: Boolean(classId),
    staleTime: 2 * 60 * 1000, // 2 minutes (attendance changes during school hours)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
    refetchOnMount: true,
  })
}

/**
 * Hook wrapper with legacy API for backward compatibility
 */
export function useClassStats(classId: string) {
  const { data, error, isLoading } = useClassStatsQuery(classId)

  return {
    stats: data ?? {
      total_students: 0,
      attendance: {
        rate: 0,
        present: 0,
        absent: 0,
        late: 0,
      },
      academic: {
        class_average: 0,
        pending_grades: 0,
      },
      alerts: {
        urgent: 0,
        high: 0,
        total: 0,
      },
    },
    loading: isLoading,
    error: error as Error | null,
  }
}
