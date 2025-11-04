/**
 * Class and Teacher Query Functions
 *
 * Shared query functions for class and teacher-related data fetching.
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type ClassRow = Database['public']['Tables']['classes']['Row']

/**
 * Fetch all classes for a teacher with student counts
 * Fixes: Per-class count queries → batch query
 */
export async function fetchTeacherClasses(teacherId: string) {
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

  if (!teacherClasses || teacherClasses.length === 0) {
    return {
      formClass: null,
      subjectClasses: [],
      ccaClasses: [],
    }
  }

  // Get all class IDs for batch student count query
  const classIds = teacherClasses
    .filter((tc) => tc && typeof tc === 'object' && 'class' in tc)
    .map((tc) => (tc as { class: { id: string } }).class.id)

  // Batch query for student counts (fixes N+1 pattern)
  const { data: studentCounts } = await supabase
    .from('student_classes')
    .select('class_id')
    .in('class_id', classIds)

  // Build count map
  const countMap = new Map<string, number>()
  studentCounts?.forEach((sc) => {
    const current = countMap.get(sc.class_id) || 0
    countMap.set(sc.class_id, current + 1)
  })

  // Enrich classes with counts
  const classesWithCounts = teacherClasses.map((tc) => {
    if (typeof tc === 'object' && tc !== null && 'class' in tc) {
      const classData = (tc as { class: { id: string } }).class
      return {
        ...tc,
        studentCount: countMap.get(classData.id) || 0,
      }
    }
    // Handle unexpected data structure - add type assertion for spread
    if (typeof tc === 'object' && tc !== null) {
      return { ...(tc as Record<string, unknown>), studentCount: 0 }
    }
    return tc
  })

  // Separate by type
  const form = classesWithCounts.find(
    (tc) =>
      typeof tc === 'object' &&
      tc !== null &&
      'role' in tc &&
      'class' in tc &&
      (tc as { role: string; class: { type: string } }).role === 'form_teacher' &&
      (tc as { role: string; class: { type: string } }).class.type === 'form'
  )

  const subjects = classesWithCounts.filter(
    (tc) =>
      typeof tc === 'object' &&
      tc !== null &&
      'class' in tc &&
      (tc as { class: { type: string } }).class.type === 'subject'
  )

  const ccas = classesWithCounts.filter(
    (tc) =>
      typeof tc === 'object' &&
      tc !== null &&
      'class' in tc &&
      (tc as { class: { type: string } }).class.type === 'cca'
  )

  return {
    formClass: form || null,
    subjectClasses: subjects,
    ccaClasses: ccas,
    raw: classesWithCounts, // For custom processing
  }
}

/**
 * Fetch class statistics (attendance, academic, alerts)
 */
export async function fetchClassStats(classId: string) {
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
    // Today's attendance - filter by student IDs and today's date
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

    // Academic grades for class average - get latest results per student
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

    // Student cases for alerts - only open cases
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

  // Calculate attendance stats
  const present = attendanceData?.filter((a) => a.status === 'present').length || 0
  const absent = attendanceData?.filter((a) => a.status === 'absent').length || 0
  const late = attendanceData?.filter((a) => a.status === 'late').length || 0
  const attendanceRate = studentCount > 0 ? Math.round((present / studentCount) * 100) : 0

  // Calculate academic stats - average all results for students in the class
  // Use percentage if available, otherwise use score directly
  const validGrades: number[] = []
  gradesData?.forEach((g) => {
    const gradeValue = g.percentage !== null && g.percentage !== undefined
      ? Number(g.percentage)
      : g.score !== null && g.score !== undefined
      ? Number(g.score)
      : null
    
    if (gradeValue !== null && !isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 100) {
      validGrades.push(gradeValue)
    }
  })

  const classAverage = validGrades.length > 0
    ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
    : 0

  // Calculate alert stats
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
      class_average: Math.round(classAverage * 10) / 10, // Round to 1 decimal
      pending_grades: 0, // TODO: Implement pending grades count
    },
    alerts: {
      urgent: urgentCases,
      high: highCases,
      total: totalCases,
    },
  }
}

/**
 * Fetch teacher data by email
 */
export async function fetchTeacherByEmail(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('teachers')
    .select(`
      *,
      teacher_classes(
        role,
        class:classes(*)
      )
    `)
    .eq('email', email)
    .single()

  if (error) throw error

  return data
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
 */
export async function fetchInboxStudents(teacherId: string) {
  const supabase = createClient()

  // First, get all class IDs where the teacher is assigned
  const { data: teacherClasses, error: teacherClassesError } = await supabase
    .from('teacher_classes')
    .select('class_id')
    .eq('teacher_id', teacherId)

  if (teacherClassesError) throw teacherClassesError

  if (!teacherClasses || teacherClasses.length === 0) {
    return []
  }

  const classIds = teacherClasses.map((tc) => tc.class_id)

  // Then, get all students in those classes
  const { data, error } = await supabase
    .from('student_classes')
    .select(`
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
    `)
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
