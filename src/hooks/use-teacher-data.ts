import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { mapTeacherToUser } from '@/lib/supabase/adapters'
import type { User } from '@/types/classroom'

/**
 * Hook to fetch current teacher data
 * For MVP: Hardcoded to Daniel Tan's email
 * Future: Use Supabase Auth
 */
export function useTeacherData() {
  const [teacher, setTeacher] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchTeacher() {
      try {
        const supabase = createClient()

        // Hardcoded for MVP - Daniel Tan
        const { data, error: queryError } = await supabase
          .from('teachers')
          .select(`
            *,
            teacher_classes(
              role,
              class:classes(*)
            )
          `)
          .eq('email', 'daniel.tan@school.edu.sg')
          .single()

        if (queryError) throw queryError

        const user = mapTeacherToUser(data)
        setTeacher(user)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacher()
  }, [])

  return { teacher, loading, error }
}
