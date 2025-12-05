'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchStudentsInClass } from '@/lib/queries/student-queries'
import { mapSupabaseStudentToStudent } from '@/lib/supabase/adapters'
import type { Student } from '@/types/classroom'

interface EnrichedStudentData {
  student_id: string
  name: string
  class_id: string
  class_name: string
  year_level: string
  profile_photo: string | null
  gender: string | null
  nationality: string | null
  attendance_rate: number
  grades: { [subject: string]: number }
  average_grade?: number
  status?: string
  has_sen: boolean
  guardian?: {
    name: string
    email: string
    phone: string
  }
}

/**
 * TanStack Query hook for fetching students in a class
 *
 * Performance improvements over old hook:
 * - N+1 attendance queries (30+ queries) → 2 batch queries (20-30 fewer requests!)
 * - Added 30-second cache with background revalidation
 * - Parallel batch queries for all enrichment data
 * - Proper error handling with retries
 *
 * @param classId - Class ID to fetch students for
 * @returns Query result with enriched student data
 */
export function useStudentsQuery(classId: string) {
  return useQuery({
    queryKey: queryKeys.students.list(classId),
    queryFn: async () => {
      if (!classId) return []

      // Fetch students with all enrichment data in parallel batches
      const enrichedStudents = await fetchStudentsInClass(classId)

      // Map to Student type expected by components
      return enrichedStudents.map((s: EnrichedStudentData) => {
        const student: Student = {
          student_id: s.student_id,
          name: s.name,
          class_id: s.class_id,
          class_name: s.class_name,
          year_level: parseInt(s.year_level) || 1,
          profile_photo: s.profile_photo ?? null,
          gender: s.gender ?? null,
          nationality: s.nationality ?? null,
          attendance_rate: s.attendance_rate,
          grades: s.grades,
          average_grade: s.average_grade,
          status: (s.status || 'None') as Student['status'],
          has_sen: s.has_sen,
          parent_name: s.guardian?.name || '',
          parent_email: s.guardian?.email || '',
          parent_phone: s.guardian?.phone || '',
          friends: [],
          has_medical_conditions: false,
          needs_counselling: false,
          has_disciplinary_issues: false,
        }
        return student
      })
    },
    enabled: Boolean(classId),
    staleTime: 30 * 1000, // 30 seconds (attendance changes during class)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2,
    refetchOnMount: true, // Always check for fresh data on mount
  })
}

/**
 * Hook wrapper with legacy API for backward compatibility
 */
export function useStudents(classId: string) {
  const { data, error, isLoading, refetch } = useStudentsQuery(classId)

  return {
    students: data ?? [],
    loading: isLoading,
    error: error as Error | null,
    mutate: refetch, // Map refetch to mutate for SWR compatibility
  }
}
