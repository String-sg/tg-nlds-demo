import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ClassOverviewStats } from '@/types/classroom'

/**
 * Hook to fetch class statistics and overview data
 */
export function useClassStats(classId: string) {
  const [stats, setStats] = useState<ClassOverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!classId) return

    async function fetchStats() {
      try {
        const supabase = createClient()
        const today = new Date().toISOString().split('T')[0]

        // Get student count
        const { count: totalStudents } = await supabase
          .from('student_classes')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classId)
          .eq('status', 'active')

        // Get today's attendance (if exists)
        const { data: attendanceRecords } = await supabase
          .from('attendance')
          .select('status')
          .eq('class_id', classId)
          .eq('date', today)

        const present = attendanceRecords?.filter((r) => r.status === 'present').length || 0
        const absent = attendanceRecords?.filter((r) => r.status === 'absent').length || 0
        const late = attendanceRecords?.filter((r) => r.status === 'late').length || 0
        const total = totalStudents || 0
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0

        // Construct stats object
        const classStats: ClassOverviewStats = {
          class_id: classId,
          date: today,
          attendance: {
            present,
            absent,
            late,
            excused: 0,
            rate: attendanceRate,
          },
          academic: {
            pending_grades: 0, // TODO: Query pending grades
            class_average: 0, // TODO: Calculate from academic_results
            upcoming_assessments: 0, // TODO: Query assignments
          },
          alerts: {
            urgent: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: 0,
          },
        }

        setStats(classStats)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [classId])

  return { stats, loading, error }
}
