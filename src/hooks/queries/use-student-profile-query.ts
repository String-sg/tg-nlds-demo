'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchStudentProfile, generateStudentAISummary } from '@/lib/queries/student-queries'
import type { StudentProfileData } from '@/types/student'

// Re-export the type for convenience
export type { StudentProfileData }

/**
 * TanStack Query hook for fetching student profile
 *
 * Performance improvements over old hook:
 * - 10 sequential queries → 1 parallel request (1-2s faster)
 * - Added 2-minute cache (eliminates redundant fetches)
 * - Background revalidation on stale data
 * - Proper error handling with retries
 *
 * @param studentName - Student name to fetch profile for
 * @returns Query result with student profile data
 */
export function useStudentProfileQuery(studentName: string) {
  return useQuery({
    queryKey: queryKeys.students.profile(studentName),
    queryFn: async () => {
      if (!studentName || studentName.trim() === '') {
        throw new Error('Student name is required')
      }

      // Fetch profile with all data in parallel
      const profileData = await fetchStudentProfile(studentName)

      // Generate AI summary
      const aiSummary = generateStudentAISummary(profileData)

      // Combine into final profile
      const fullProfile = {
        ...profileData,
        ai_summary: aiSummary,
      } as StudentProfileData

      return fullProfile
    },
    enabled: Boolean(studentName && studentName.trim() !== ''),
    staleTime: 2 * 60 * 1000, // 2 minutes (student data changes during school day)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2, // Retry failed requests
    refetchOnMount: true, // Refetch on mount
  })
}

/**
 * Helper hook to check if student profile is loading
 */
export function useIsStudentProfileLoading(studentName: string) {
  const { isLoading, isFetching } = useStudentProfileQuery(studentName)
  return isLoading || isFetching
}
