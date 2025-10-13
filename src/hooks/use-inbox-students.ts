import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface InboxStudent {
  student_id: string
  name: string
  class_id: string
  class_name: string
  attendance_rate?: number
  average_grade?: number
}

/**
 * Hook to fetch real students for inbox conversations
 * Returns a map of student IDs to student data
 */
export function useInboxStudents() {
  const [students, setStudents] = useState<Map<string, InboxStudent>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchStudents() {
      try {
        const supabase = createClient()

        // Fetch some students with their class information
        const { data: enrollments, error: queryError } = await supabase
          .from('student_classes')
          .select(`
            student:students(id, name),
            class:classes(id, name)
          `)
          .eq('status', 'active')
          .limit(10)

        if (queryError) throw queryError

        // Map to InboxStudent format
        const studentMap = new Map<string, InboxStudent>()

        enrollments?.forEach((enrollment) => {
          if (
            typeof enrollment === 'object' &&
            enrollment !== null &&
            'student' in enrollment &&
            'class' in enrollment
          ) {
            const typedEnrollment = enrollment as {
              student: { id: string; name: string }
              class: { id: string; name: string }
            }

            const student = typedEnrollment.student
            const classData = typedEnrollment.class

            studentMap.set(student.id, {
              student_id: student.id,
              name: student.name,
              class_id: classData.id,
              class_name: classData.name,
            })
          }
        })

        setStudents(studentMap)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  return { students, loading, error }
}
