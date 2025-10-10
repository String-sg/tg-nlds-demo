import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { mapSupabaseClassToClass, mapSupabaseClassToCCAClass } from '@/lib/supabase/adapters'
import type { Class, CCAClass } from '@/types/classroom'

interface UseClassesResult {
  formClass: Class | null
  subjectClasses: Class[]
  ccaClasses: CCAClass[]
  loading: boolean
  error: Error | null
}

/**
 * Hook to fetch teacher's classes (form, subject, CCA)
 */
export function useClasses(teacherId: string): UseClassesResult {
  const [formClass, setFormClass] = useState<Class | null>(null)
  const [subjectClasses, setSubjectClasses] = useState<Class[]>([])
  const [ccaClasses, setCCAClasses] = useState<CCAClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!teacherId) return

    async function fetchClasses() {
      try {
        const supabase = createClient()

        // Fetch all classes where teacher is assigned
        const { data: teacherClasses, error: queryError } = await supabase
          .from('teacher_classes')
          .select(`
            role,
            class:classes(*)
          `)
          .eq('teacher_id', teacherId)

        if (queryError) throw queryError

        // For each class, get student count
        const classesWithCounts = await Promise.all(
          (teacherClasses || []).map(async (tc) => {
            const { count } = await supabase
              .from('student_classes')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', tc.class.id)

            return { ...tc, studentCount: count || 0 }
          })
        )

        // Separate by type
        const form = classesWithCounts.find((tc) => tc.role === 'form_teacher' && tc.class.type === 'form')
        const subjects = classesWithCounts.filter((tc) => tc.class.type === 'subject')
        const ccas = classesWithCounts.filter((tc) => tc.class.type === 'cca')

        // Map to frontend types
        if (form) {
          setFormClass(mapSupabaseClassToClass(
            form.class,
            teacherId,
            teacherId,
            form.studentCount
          ))
        }

        setSubjectClasses(
          subjects.map((tc) => mapSupabaseClassToClass(
            tc.class,
            teacherId,
            undefined,
            tc.studentCount
          ))
        )

        setCCAClasses(
          ccas.map((tc) => mapSupabaseClassToCCAClass(
            tc.class,
            teacherId,
            [] // TODO: Fetch member IDs
          ))
        )
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [teacherId])

  return { formClass, subjectClasses, ccaClasses, loading, error }
}
