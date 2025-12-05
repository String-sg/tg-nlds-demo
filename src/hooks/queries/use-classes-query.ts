'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchTeacherClasses } from '@/lib/queries/class-queries'
import { mapSupabaseClassToClass, mapSupabaseClassToCCAClass } from '@/lib/supabase/adapters'
import type { Class, CCAClass } from '@/types/classroom'
import type { Database } from '@/types/database'

type ClassRow = Database['public']['Tables']['classes']['Row']

interface TeacherClassData {
  class: ClassRow
  studentCount: number
}

interface UseClassesResult {
  formClass: Class | null
  subjectClasses: Class[]
  ccaClasses: CCAClass[]
  loading: boolean
  error: Error | null
}

/**
 * TanStack Query hook for fetching teacher's classes
 *
 * Performance improvements over old hook:
 * - Per-class student count queries → single batch query (faster!)
 * - Added 30-second cache with background revalidation
 * - Parallel batch queries for student counts
 * - Proper error handling with retries
 *
 * @param teacherId - Teacher ID to fetch classes for
 * @returns Query result with form class, subject classes, and CCA classes
 */
export function useClassesQuery(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.classes.list(teacherId),
    queryFn: async () => {
      if (!teacherId) {
        return {
          formClass: null,
          subjectClasses: [],
          ccaClasses: [],
        }
      }

      // Fetch all classes with student counts in batch
      const { formClass, subjectClasses, ccaClasses } =
        await fetchTeacherClasses(teacherId)

      // Map to frontend types
      let mappedFormClass: Class | null = null
      if (formClass && typeof formClass === 'object' && 'class' in formClass && 'studentCount' in formClass) {
        const classData = (formClass as { class: ClassRow; studentCount: number }).class
        const studentCount = (formClass as { studentCount: number }).studentCount
        mappedFormClass = mapSupabaseClassToClass(
          classData,
          teacherId,
          teacherId,
          studentCount
        )
      }

      const mappedSubjectClasses = subjectClasses
        .filter((tc: TeacherClassData) => typeof tc === 'object' && 'class' in tc && 'studentCount' in tc)
        .map((tc: TeacherClassData) => {
          const classData = tc.class
          const studentCount = tc.studentCount
          return mapSupabaseClassToClass(classData, teacherId, undefined, studentCount)
        })

      const mappedCcaClasses = ccaClasses
        .filter((tc: TeacherClassData) => typeof tc === 'object' && 'class' in tc)
        .map((tc: TeacherClassData) => {
          const classData = tc.class
          return mapSupabaseClassToCCAClass(classData, teacherId, [])
        })

      return {
        formClass: mappedFormClass,
        subjectClasses: mappedSubjectClasses,
        ccaClasses: mappedCcaClasses,
      }
    },
    enabled: Boolean(teacherId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2,
    refetchOnMount: true,
  })
}

/**
 * Hook wrapper with legacy API for backward compatibility
 */
export function useClasses(teacherId: string): UseClassesResult {
  const { data, error, isLoading } = useClassesQuery(teacherId)

  if (!teacherId || isLoading) {
    return {
      formClass: null,
      subjectClasses: [],
      ccaClasses: [],
      loading: true,
      error: null,
    }
  }

  if (error) {
    return {
      formClass: null,
      subjectClasses: [],
      ccaClasses: [],
      loading: false,
      error: error as Error,
    }
  }

  return {
    formClass: data?.formClass ?? null,
    subjectClasses: data?.subjectClasses ?? [],
    ccaClasses: data?.ccaClasses ?? [],
    loading: false,
    error: null,
  }
}
