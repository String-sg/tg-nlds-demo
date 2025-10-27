'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { createClient } from '@/lib/supabase/client'

interface UpdateGradeParams {
  studentId: string
  studentName: string
  classId?: string
  assessmentType: string
  assessmentName: string
  assessmentDate: string
  term?: string
  score?: number
  maxScore?: number
  percentage?: number
  grade?: string
  remarks?: string
}

/**
 * Mutation hook for updating student grades with optimistic updates
 *
 * Features:
 * - Instant UI update (optimistic)
 * - Automatic rollback on error
 * - Invalidates related queries (student profile, students list)
 *
 * @returns Mutation hook for updating grades
 */
export function useUpdateGradeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.grades.update,
    mutationFn: async (params: UpdateGradeParams) => {
      const supabase = createClient()

      // Insert new academic result
      const { data, error } = await supabase
        .from('academic_results')
        .insert({
          student_id: params.studentId,
          assessment_type: params.assessmentType,
          assessment_name: params.assessmentName,
          assessment_date: params.assessmentDate,
          term: params.term,
          score: params.score,
          max_score: params.maxScore,
          percentage: params.percentage,
          grade: params.grade,
          remarks: params.remarks,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    // Optimistic update: Add grade immediately to UI
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.students.profile(params.studentName),
      })

      if (params.classId) {
        await queryClient.cancelQueries({
          queryKey: queryKeys.students.list(params.classId),
        })
      }

      // Snapshot previous values
      const previousProfile = queryClient.getQueryData(
        queryKeys.students.profile(params.studentName)
      )
      const previousStudents = params.classId
        ? queryClient.getQueryData(queryKeys.students.list(params.classId))
        : null

      // Optimistically update student profile
      queryClient.setQueryData(
        queryKeys.students.profile(params.studentName),
        (old: any) => {
          if (!old) return old

          // Add new academic result to the beginning of the list
          const newResult = {
            id: `temp-${Date.now()}`,
            assessment_type: params.assessmentType,
            assessment_name: params.assessmentName,
            assessment_date: params.assessmentDate,
            term: params.term,
            score: params.score,
            max_score: params.maxScore,
            percentage: params.percentage,
            grade: params.grade,
            remarks: params.remarks,
          }

          return {
            ...old,
            academic_results: [newResult, ...(old.academic_results || [])],
          }
        }
      )

      // Optimistically update students list if classId provided
      if (params.classId) {
        queryClient.setQueryData(
          queryKeys.students.list(params.classId),
          (old: any) => {
            if (!old) return old

            return old.map((student: any) => {
              if (student.student_id === params.studentId) {
                // Recalculate average grade with new score
                const currentGrades = Object.values(student.grades || {}) as number[]
                const newAverage =
                  params.score && currentGrades.length > 0
                    ? Math.round(
                        ([...currentGrades, params.score].reduce((a, b) => a + b, 0) /
                          (currentGrades.length + 1))
                      )
                    : student.average_grade

                return {
                  ...student,
                  average_grade: newAverage,
                }
              }
              return student
            })
          }
        )
      }

      return { previousProfile, previousStudents, classId: params.classId }
    },

    // On success: Invalidate queries
    onSuccess: (data, params) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.profile(params.studentName),
      })

      if (params.classId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.students.list(params.classId),
        })
      }
    },

    // On error: Rollback
    onError: (err, params, context) => {
      console.error('Failed to update grade:', err)

      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.students.profile(params.studentName),
          context.previousProfile
        )
      }

      if (context?.classId && context?.previousStudents) {
        queryClient.setQueryData(
          queryKeys.students.list(context.classId),
          context.previousStudents
        )
      }
    },

    // Always refetch after settled
    onSettled: (data, error, params) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.profile(params.studentName),
      })

      if (params.classId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.students.list(params.classId),
        })
      }
    },
  })
}

/**
 * Helper hook to check if grade is being updated
 */
export function useIsUpdatingGrade() {
  const queryClient = useQueryClient()
  return queryClient.isMutating({ mutationKey: mutationKeys.grades.update }) > 0
}
