'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { createClient } from '@/lib/supabase/client'

interface MarkAttendanceParams {
  studentId: string
  classId: string
  date: string
  status: 'present' | 'absent' | 'late' | 'early_dismissal'
  reason?: string
}

/**
 * Mutation hook for marking student attendance with optimistic updates
 *
 * Features:
 * - Instant UI update (optimistic)
 * - Automatic rollback on error
 * - Invalidates related queries (students list, class stats)
 * - Following the same pattern as use-send-message-mutation
 *
 * @returns Mutation hook for marking attendance
 */
export function useMarkAttendanceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.attendance.mark,
    mutationFn: async (params: MarkAttendanceParams) => {
      const supabase = createClient()

      // Check if attendance record exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', params.studentId)
        .eq('date', params.date)
        .single()

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance')
          .update({
            status: params.status,
            reason: params.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            student_id: params.studentId,
            date: params.date,
            status: params.status,
            type: 'daily',
            reason: params.reason,
          })
          .select()
          .single()

        if (error) throw error
        return data
      }
    },

    // Optimistic update: Apply changes immediately
    onMutate: async (params) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.students.list(params.classId),
      })
      await queryClient.cancelQueries({
        queryKey: queryKeys.classes.stats(params.classId),
      })

      // Snapshot the previous values for rollback
      const previousStudents = queryClient.getQueryData(
        queryKeys.students.list(params.classId)
      )
      const previousStats = queryClient.getQueryData(
        queryKeys.classes.stats(params.classId)
      )

      // Optimistically update student list
      queryClient.setQueryData(
        queryKeys.students.list(params.classId),
        (old: any) => {
          if (!old) return old

          return old.map((student: any) => {
            if (student.student_id === params.studentId) {
              // Update attendance rate optimistically
              const newRate =
                params.status === 'present'
                  ? Math.min(100, (student.attendance_rate || 0) + 1)
                  : Math.max(0, (student.attendance_rate || 0) - 1)

              return {
                ...student,
                attendance_rate: newRate,
              }
            }
            return student
          })
        }
      )

      // Optimistically update class stats
      queryClient.setQueryData(
        queryKeys.classes.stats(params.classId),
        (old: any) => {
          if (!old) return old

          const attendance_today = old.attendance_today || {}
          const increments: any = {
            present: 0,
            absent: 0,
            late: 0,
          }
          increments[params.status] = 1

          return {
            ...old,
            attendance_today: {
              ...attendance_today,
              total_marked: (attendance_today.total_marked || 0) + 1,
              present: (attendance_today.present || 0) + increments.present,
              absent: (attendance_today.absent || 0) + increments.absent,
              late: (attendance_today.late || 0) + increments.late,
            },
          }
        }
      )

      return { previousStudents, previousStats }
    },

    // On success: Invalidate queries to get accurate data from server
    onSuccess: (data, params) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.list(params.classId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes.stats(params.classId),
      })

      // Also invalidate student profile if it's cached
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.details(),
      })
    },

    // On error: Rollback to previous state
    onError: (err, params, context) => {
      console.error('Failed to mark attendance:', err)

      if (context?.previousStudents) {
        queryClient.setQueryData(
          queryKeys.students.list(params.classId),
          context.previousStudents
        )
      }

      if (context?.previousStats) {
        queryClient.setQueryData(
          queryKeys.classes.stats(params.classId),
          context.previousStats
        )
      }
    },

    // Always refetch after mutation settles
    onSettled: (data, error, params) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.list(params.classId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes.stats(params.classId),
      })
    },
  })
}

/**
 * Helper hook to check if attendance is being marked
 */
export function useIsMarkingAttendance() {
  const queryClient = useQueryClient()
  return queryClient.isMutating({ mutationKey: mutationKeys.attendance.mark }) > 0
}
