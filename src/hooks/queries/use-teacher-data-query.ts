'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchTeacherByEmail } from '@/lib/queries/class-queries'
import { mapTeacherToUser } from '@/lib/supabase/adapters'
import type { User } from '@/types/classroom'

interface TeacherClassRole {
  role: string
  [key: string]: unknown
}

/**
 * TanStack Query hook for fetching teacher data
 *
 * Performance improvements over old hook:
 * - Added long cache (was no cache before!)
 * - Teacher data rarely changes so we can cache for 30 minutes
 *
 * For MVP: Hardcoded to Daniel Tan's email
 * Future: Use Supabase Auth
 *
 * @param email - Teacher email (defaults to Daniel Tan for MVP)
 * @returns Query result with teacher user data
 */
export function useTeacherDataQuery(email: string = 'daniel.tan@school.edu.sg') {
  return useQuery({
    queryKey: queryKeys.teachers.detail(email),
    queryFn: async () => {
      const data = await fetchTeacherByEmail(email)
      // Type assertion: Supabase returns role as string, but we know it's one of these literal types
      const typedData = {
        ...data,
        teacher_classes: data.teacher_classes?.map((tc: TeacherClassRole) => ({
          ...tc,
          role: tc.role as 'teacher' | 'form_teacher'
        }))
      }
      return mapTeacherToUser(typedData)
    },
    enabled: Boolean(email),
    staleTime: 30 * 60 * 1000, // 30 minutes (teacher data rarely changes)
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    retry: 2,
    refetchOnMount: false, // No need to refetch on mount for teacher data
  })
}

/**
 * Hook wrapper with legacy API for backward compatibility
 */
export function useTeacherData() {
  const { data, error, isLoading } = useTeacherDataQuery()

  return {
    teacher: data ?? null,
    loading: isLoading,
    error: error as Error | null,
  }
}
