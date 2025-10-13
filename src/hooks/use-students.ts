import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { mapSupabaseStudentToStudent } from '@/lib/supabase/adapters'
import type { Student } from '@/types/classroom'

/**
 * Fetcher function for SWR
 */
async function fetchStudentsData(classId: string): Promise<Student[]> {
  if (!classId) return []

  const supabase = createClient()

  // Get students enrolled in this class
  const { data: enrollments, error: queryError } = await supabase
    .from('student_classes')
    .select(`
      student:students(
        *,
        primary_guardian:parents_guardians!primary_guardian_id(*),
        form_teacher:teachers!form_teacher_id(*)
      ),
      class:classes(*)
    `)
    .eq('class_id', classId)
    .eq('status', 'active')

  if (queryError) throw queryError

  // Map to Student type
  let mappedStudents = (enrollments || [])
    .filter(enrollment => typeof enrollment === 'object' && enrollment !== null && 'student' in enrollment && 'class' in enrollment)
    .map((enrollment) => {
      const typedEnrollment = enrollment as { student: { id: string; name: string; year_level?: string; primary_guardian?: unknown; form_teacher?: unknown; student_classes?: unknown[] }; class: { id: string; name: string } }
      const student = typedEnrollment.student as Parameters<typeof mapSupabaseStudentToStudent>[0]
      const classData = typedEnrollment.class

      return mapSupabaseStudentToStudent(
        student,
        classData.id,
        classData.name
      )
    })

  if (mappedStudents.length === 0) {
    return []
  }

  // Get student IDs for enrichment queries
  const studentIds = mappedStudents.map(s => s.student_id)

  // Fetch attendance data for each student individually to avoid row limit issues
  const attendanceMap = new Map<string, { total: number; present: number }>()

  for (const studentId of studentIds) {
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId)

    if (attendanceData && attendanceData.length > 0) {
      const present = attendanceData.filter((a: { status: string }) => a.status === 'present').length
      attendanceMap.set(studentId, {
        total: attendanceData.length,
        present
      })
    }
  }

  // Fetch academic results
  const { data: academicData } = await supabase
    .from('academic_results')
    .select('student_id, subject, score')
    .in('student_id', studentIds)

  // Group academic results by student
  const gradesMap = new Map<string, Array<{ subject: string; score: number }>>()
  academicData?.forEach((result: { student_id: string; subject: string; score: number }) => {
    const current = gradesMap.get(result.student_id) || []
    current.push({ subject: result.subject, score: result.score })
    gradesMap.set(result.student_id, current)
  })

  // Fetch student overviews for status and conduct
  const { data: overviewData } = await supabase
    .from('student_overview')
    .select('student_id, is_swan, conduct_grade')
    .in('student_id', studentIds)

  const overviewMap = new Map<string, { is_swan: boolean; conduct_grade?: string }>()
  overviewData?.forEach((overview: { student_id: string; is_swan: boolean; conduct_grade?: string }) => {
    overviewMap.set(overview.student_id, {
      is_swan: overview.is_swan || false,
      conduct_grade: overview.conduct_grade || undefined
    })
  })

  // Enrich students with fetched data
  mappedStudents = mappedStudents.map(student => {
    const enriched = { ...student }

    // Add attendance - explicitly set rate even if no data
    const attendance = attendanceMap.get(student.student_id)
    const rate = attendance && attendance.total > 0
      ? Math.round((attendance.present / attendance.total) * 100)
      : 0

    enriched.attendance_rate = rate

    // Add grades and calculate average
    const grades = gradesMap.get(student.student_id)
    if (grades && grades.length > 0) {
      const gradeObj: { [subject: string]: number } = {}
      grades.forEach(g => {
        // Map database subject names to Student type property names
        const subjectKey = g.subject.toLowerCase() === 'mathematics'
          ? 'math'
          : g.subject.toLowerCase()
        gradeObj[subjectKey] = g.score
      })
      enriched.grades = gradeObj

      // Calculate average grade
      const total = grades.reduce((sum, g) => sum + g.score, 0)
      enriched.average_grade = Math.round(total / grades.length)
    }

    // Add status and conduct
    const overview = overviewMap.get(student.student_id)
    if (overview) {
      if (overview.is_swan) {
        enriched.status = 'SWAN'
        enriched.has_sen = true
      }
      if (overview.conduct_grade) {
        enriched.conduct_grade = overview.conduct_grade as Student['conduct_grade']
      }
    }

    return enriched
  })

  return mappedStudents
}

/**
 * Hook to fetch students for a class with SWR caching
 */
export function useStudents(classId: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    classId ? `students-${classId}` : null,
    () => fetchStudentsData(classId),
    {
      // Revalidate data every 5 minutes in background
      refreshInterval: 300000,

      // Revalidate on mount to ensure we get fresh data
      revalidateOnMount: true,
    }
  )

  // If classId is not available yet, show loading
  if (!classId) {
    return {
      students: [],
      loading: true,
      error: null,
      mutate,
    }
  }

  // Show loading if validating and no data yet
  const loading = (isLoading || isValidating) && !data

  return {
    students: data ?? [],
    loading,
    error: error as Error | null,
    mutate, // Expose mutate for manual revalidation if needed
  }
}
