/**
 * Class and Teacher Query Functions
 *
 * Shared query functions for class and teacher-related data fetching.
 * Uses API routes with service role client to bypass RLS.
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Fetch all classes for a teacher with student counts
 * Uses API route with service role client
 */
export async function fetchTeacherClasses(teacherId: string) {
  const response = await fetch(`/api/classes?teacherId=${teacherId}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch classes' }))
    throw new Error(errorData.error || 'Failed to fetch classes')
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch classes')
  }

  return {
    formClass: data.formClass,
    subjectClasses: data.subjectClasses,
    ccaClasses: data.ccaClasses,
    raw: data.raw,
  }
}

/**
 * Fetch class statistics (attendance, academic, alerts)
 * Uses API route with service role client
 */
export async function fetchClassStats(classId: string) {
  const response = await fetch(`/api/classes/stats?classId=${classId}`)

  if (!response.ok) {
    // Fall back to direct query if API route doesn't exist yet
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    // First, get all student IDs for this class
    const { data: studentClasses, error: studentClassesError } = await supabase
      .from('student_classes')
      .select('student_id')
      .eq('class_id', classId)
      .eq('status', 'active')

    if (studentClassesError) {
      console.error('Error fetching student classes:', studentClassesError)
      throw studentClassesError
    }

    const studentIds = studentClasses?.map((sc) => sc.student_id) || []
    const studentCount = studentIds.length

    if (studentCount === 0) {
      return {
        total_students: 0,
        attendance: {
          rate: 0,
          present: 0,
          absent: 0,
          late: 0,
        },
        academic: {
          class_average: 0,
          pending_grades: 0,
        },
        alerts: {
          urgent: 0,
          high: 0,
          total: 0,
        },
      }
    }

    // Fetch stats in parallel using student IDs
    const [attendanceData, gradesData, casesData] = await Promise.all([
      supabase
        .from('attendance')
        .select('status')
        .in('student_id', studentIds)
        .eq('date', today)
        .eq('type', 'daily')
        .then((res) => {
          if (res.error) {
            console.error('Error fetching attendance:', res.error)
            return []
          }
          return res.data || []
        }),

      supabase
        .from('academic_results')
        .select('score, percentage, student_id, assessment_date')
        .in('student_id', studentIds)
        .order('assessment_date', { ascending: false })
        .then((res) => {
          if (res.error) {
            console.error('Error fetching academic results:', res.error)
            return []
          }
          return res.data || []
        }),

      supabase
        .from('cases')
        .select('severity, status')
        .in('student_id', studentIds)
        .eq('status', 'open')
        .then((res) => {
          if (res.error) {
            console.error('Error fetching cases:', res.error)
            return []
          }
          return res.data || []
        }),
    ])

    const present = attendanceData?.filter((a) => a.status === 'present').length || 0
    const absent = attendanceData?.filter((a) => a.status === 'absent').length || 0
    const late = attendanceData?.filter((a) => a.status === 'late').length || 0
    const attendanceRate = studentCount > 0 ? Math.round((present / studentCount) * 100) : 0

    const validGrades: number[] = []
    gradesData?.forEach((g) => {
      const gradeValue =
        g.percentage !== null && g.percentage !== undefined
          ? Number(g.percentage)
          : g.score !== null && g.score !== undefined
            ? Number(g.score)
            : null

      if (gradeValue !== null && !isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 100) {
        validGrades.push(gradeValue)
      }
    })

    const classAverage =
      validGrades.length > 0
        ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
        : 0

    const urgentCases = casesData?.filter((c) => c.severity === 'urgent').length || 0
    const highCases = casesData?.filter((c) => c.severity === 'high').length || 0
    const totalCases = casesData?.length || 0

    return {
      total_students: studentCount,
      attendance: {
        rate: attendanceRate,
        present,
        absent,
        late,
      },
      academic: {
        class_average: Math.round(classAverage * 10) / 10,
        pending_grades: 0,
      },
      alerts: {
        urgent: urgentCases,
        high: highCases,
        total: totalCases,
      },
    }
  }

  const data = await response.json()
  return data
}

/**
 * Fetch teacher data by email
 * Uses API route with service role client
 */
export async function fetchTeacherByEmail(email: string) {
  const response = await fetch(`/api/teachers?email=${encodeURIComponent(email)}`)

  if (!response.ok) {
    // Fall back to direct query if API route doesn't exist yet
    const supabase = createClient()

    const { data, error } = await supabase
      .from('teachers')
      .select(
        `
      *,
      teacher_classes(
        role,
        class:classes(*)
      )
    `
      )
      .eq('email', email)
      .single()

    if (error) throw error

    return data
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch teacher')
  }

  return data.teacher
}

/**
 * Fetch class name for breadcrumbs
 */
export async function fetchClassName(classId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('id', classId)
    .single()

  if (error) throw error

  return data
}

/**
 * Fetch students for inbox (conversations)
 * Uses API route with service role client
 */
export async function fetchInboxStudents(teacherId: string) {
  const response = await fetch(`/api/inbox-students?teacherId=${teacherId}`)

  if (!response.ok) {
    // Fall back to direct query if API route doesn't exist yet
    const supabase = createClient()

    const { data: teacherClasses, error: teacherClassesError } = await supabase
      .from('teacher_classes')
      .select('class_id')
      .eq('teacher_id', teacherId)

    if (teacherClassesError) throw teacherClassesError

    if (!teacherClasses || teacherClasses.length === 0) {
      return []
    }

    const classIds = teacherClasses.map((tc) => tc.class_id)

    const { data, error } = await supabase
      .from('student_classes')
      .select(
        `
      student:students(
        id,
        student_id,
        name,
        year_level,
        primary_guardian:parents_guardians!primary_guardian_id(
          id,
          name,
          email,
          phone,
          relationship
        )
      ),
      class:classes(
        id,
        name
      )
    `
      )
      .in('class_id', classIds)
      .eq('status', 'active')

    if (error) throw error

    return (
      data?.map((enrollment) => ({
        id: enrollment.student.id,
        student_id: enrollment.student.student_id,
        name: enrollment.student.name,
        class_id: enrollment.class.id,
        class_name: enrollment.class.name,
        year_level: enrollment.student.year_level,
        primary_guardian: enrollment.student.primary_guardian,
      })) || []
    )
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch inbox students')
  }

  return data.students
}
