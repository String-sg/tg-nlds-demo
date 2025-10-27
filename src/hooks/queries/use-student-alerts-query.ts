'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchStudentAlerts } from '@/lib/queries/student-queries'

/**
 * TanStack Query hook for fetching student alerts for home page
 *
 * Performance improvements over old hook (from home-content.tsx):
 * - Added 1-minute cache (was no cache before!)
 * - Background revalidation
 * - Better error handling
 *
 * @param userId - User/Teacher ID
 * @param limit - Number of alerts to fetch (default: 3)
 * @returns Query result with student alerts
 */
export function useStudentAlertsQuery(userId: string, limit: number = 3) {
  return useQuery({
    queryKey: queryKeys.alerts.list(userId, limit),
    queryFn: async () => {
      if (!userId) return []
      return await fetchStudentAlerts(userId, limit)
    },
    enabled: Boolean(userId),
    staleTime: 1 * 60 * 1000, // 1 minute (alerts can change frequently)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2,
    refetchOnMount: true,
  })
}

/**
 * Hook wrapper for components
 */
export function useStudentAlerts(userId: string, limit?: number) {
  const { data, error, isLoading } = useStudentAlertsQuery(userId, limit)

  return {
    alerts: data ?? [],
    loading: isLoading,
    error: error as Error | null,
  }
}
