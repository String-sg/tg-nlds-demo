import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { mapSupabaseStudentToStudent } from '@/lib/supabase/adapters'
import type { Student } from '@/types/classroom'

/**
 * Hook to fetch students for a class
 */
export function useStudents(classId: string) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!classId) return

    async function fetchStudents() {
      try {
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
        const mappedStudents = (enrollments || []).map((enrollment) => {
          const student = enrollment.student
          const classData = enrollment.class

          return mapSupabaseStudentToStudent(
            student,
            classData.id,
            classData.name
          )
        })

        setStudents(mappedStudents)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [classId])

  return { students, loading, error }
}
