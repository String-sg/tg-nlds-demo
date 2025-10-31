'use server'

// PTM (Parent-Teacher Meeting) Server Actions

import { createClient } from '@/lib/supabase/server'
import {
  getFormClassStudents,
  getStudentAttendance,
  getStudentCases,
  getStudentResultsByTerm,
} from '@/lib/supabase/queries'
import type { PTMStudentData, PTMStudent, PTMGrade, PTMConfig } from '@/types/ptm'
import type { Student, Case } from '@/types/classroom'
import {
  calculatePriorityScore,
  getPriorityLevel,
  getPriorityReasons,
  getPriorityBadgeColor,
  generateConcernAreas,
  generateStrengths,
  generateStudentTags,
} from '@/lib/utils/ptm-utils'

/**
 * Calculate attendance rate for a student
 * Checks attendance from the start of the current academic year
 */
async function calculateAttendanceRate(
  studentId: string,
  lowAttendanceThreshold: number = 85
): Promise<number> {
  const supabase = await createClient()

  // Get attendance from start of academic year (January 1st of current year)
  const currentYear = new Date().getFullYear()
  const startDate = `${currentYear}-01-01`
  const endDate = new Date().toISOString().split('T')[0]

  const { data: attendanceRecords, error } = await getStudentAttendance(
    supabase,
    studentId,
    startDate,
    endDate
  )

  if (error || !attendanceRecords || attendanceRecords.length === 0) {
    // If no attendance data, assume 100% (benefit of doubt)
    return 100
  }

  // Calculate attendance rate
  const presentCount = attendanceRecords.filter(
    (record: any) => record.status === 'present'
  ).length
  const totalCount = attendanceRecords.length

  if (totalCount === 0) return 100

  return Math.round((presentCount / totalCount) * 100)
}

/**
 * Get active cases for a student
 */
async function getActiveCases(studentId: string): Promise<Case[]> {
  const supabase = await createClient()

  const { data: cases, error } = await getStudentCases(supabase, studentId)

  if (error || !cases) {
    return []
  }

  // Filter for active cases only
  // In the database, status might be 'open' or similar - adjust as needed
  const activeCases = cases.filter((c: any) => c.status === 'open')

  // Map to Case type format
  return activeCases.map((c: any) => ({
    case_id: c.id,
    student_id: c.student_id,
    case_type: c.case_type as 'Academic' | 'Behavioral' | 'Wellbeing',
    severity: c.severity as 'Critical' | 'High' | 'Medium' | 'Low',
    status: 'Active' as const,
    title: c.title || '',
    description: c.description || '',
    created_by: c.created_by,
    created_date: c.opened_date || '',
    owner: c.assigned_to || c.created_by,
    notes: [],
  }))
}

/**
 * Get recent academic grades for a student
 */
async function getRecentGrades(studentId: string): Promise<PTMGrade[]> {
  const supabase = await createClient()

  // Get current term - for simplicity, using "Term 1 2025"
  // In production, this should be dynamically determined
  const currentTerm = 'Term 1 2025'

  const { data: results, error } = await getStudentResultsByTerm(
    supabase,
    studentId,
    currentTerm
  )

  if (error || !results) {
    return []
  }

  // Map to PTMGrade format
  return results
    .slice(0, 5) // Get latest 5 results
    .map((result: any) => ({
      subject: result.class?.subject || 'Unknown',
      grade: result.grade || '',
      score: result.score || 0,
      percentage: result.percentage || 0,
      assessment_name: result.assessment_name,
      assessment_date: result.assessment_date,
    }))
}

/**
 * Calculate average grade from recent grades
 */
function calculateAverageGrade(grades: PTMGrade[]): number {
  if (grades.length === 0) return 0

  const total = grades.reduce((sum, grade) => sum + grade.percentage, 0)
  return Math.round(total / grades.length)
}

/**
 * Enrich a student with PTM-specific data
 */
async function enrichStudentWithPTMData(
  student: any,
  config: PTMConfig
): Promise<PTMStudent> {
  // Fetch all enrichment data in parallel
  const [attendanceRate, activeCases, recentGrades] = await Promise.all([
    calculateAttendanceRate(student.id, config.lowAttendanceThreshold),
    getActiveCases(student.id),
    getRecentGrades(student.id),
  ])

  // Calculate priority
  const priorityScore = calculatePriorityScore({
    attendanceRate,
    activeCases,
  })

  const priorityLevel = getPriorityLevel(priorityScore)
  const priorityReasons = getPriorityReasons({
    attendanceRate,
    activeCases,
  })

  // Generate concerns and strengths
  const averageGrade = calculateAverageGrade(recentGrades)
  const concernAreas = generateConcernAreas({
    attendanceRate,
    activeCases,
    average_grade: averageGrade,
    recentGrades,
  })

  const strengths = generateStrengths({
    attendanceRate,
    average_grade: averageGrade,
    recentGrades,
  })

  // Generate tags and badge color
  const status = student.overview?.is_swan ? 'SWAN' : 'None'
  const tags = generateStudentTags({
    attendanceRate,
    activeCases,
    status,
  })

  const badgeColor = getPriorityBadgeColor(priorityLevel)

  // Get guardian info
  const primaryGuardian = student.primary_guardian

  // Map grades to Student interface format
  const gradesMap: { [subject: string]: number | undefined } = {}
  recentGrades.forEach((grade) => {
    gradesMap[grade.subject.toLowerCase()] = grade.percentage
  })

  // Build base Student object
  const baseStudent: Student = {
    student_id: student.student_id || student.id,
    name: student.name,
    class_id: 'form-class', // Form class, not a specific subject class
    class_name: 'Form Class',
    year_level: parseInt(student.year_level || '5'),
    status: status as any,
    grades: gradesMap,
    average_grade: averageGrade,
    attendance_rate: attendanceRate,
    parent_name: primaryGuardian?.name || '',
    parent_email: primaryGuardian?.email || '',
    parent_phone: primaryGuardian?.phone || '',
    health_declaration: student.overview?.health_declaration,
    friends: [],
    family_background: student.overview?.family?.notes || '',
    has_medical_conditions: !!(
      student.overview?.medical_conditions &&
      Object.keys(student.overview.medical_conditions).length > 0
    ),
    needs_counselling: activeCases.some((c) => c.case_type === 'Wellbeing'),
    has_disciplinary_issues: activeCases.some(
      (c) => c.case_type === 'Behavioral'
    ),
    has_sen: student.overview?.is_swan || false,
    avatar: student.profile_photo,
  }

  // Build PTMStudent object
  const ptmStudent: PTMStudent = {
    ...baseStudent,
    priorityScore,
    priorityLevel,
    priorityReasons,
    attendanceRate,
    activeCases,
    recentGrades,
    concernAreas,
    strengths,
    badgeColor,
    tags,
  }

  return ptmStudent
}

/**
 * Get PTM student data for a teacher's form class
 *
 * @param teacherId - Teacher ID (optional, uses mock if not provided and mock mode enabled)
 * @param config - Configuration options
 * @returns PTM student data sorted by priority
 */
export async function getPTMStudents(
  teacherId?: string,
  config: PTMConfig = {}
): Promise<PTMStudentData> {
  const supabase = await createClient()

  // Determine teacher ID based on config and parameters
  let effectiveTeacherId = teacherId

  if (!effectiveTeacherId && config.useMockMode) {
    // In mock mode, use mock teacher ID from config
    effectiveTeacherId = config.teacherId
  }

  if (!effectiveTeacherId) {
    throw new Error('Teacher ID is required')
  }

  // Set default config values
  const finalConfig: PTMConfig = {
    lowAttendanceThreshold: 85,
    includeInactiveCases: false,
    ...config,
  }

  // Get form class ID by finding where this teacher is the form teacher
  // Method 1: Check teacher_classes table for form_teacher role
  let formClassId: string | undefined
  let formClassName: string | undefined

  const { data: teacherClassData } = await supabase
    .from('teacher_classes')
    .select(`
      class:classes(id, name, type)
    `)
    .eq('teacher_id', effectiveTeacherId)
    .eq('role', 'form_teacher')
    .limit(1)
    .single()

  if ((teacherClassData as any)?.class) {
    formClassId = (teacherClassData as any).class.id
    formClassName = (teacherClassData as any).class.name
  }

  // Method 2: If not found, find the form class by looking at students' form_teacher_id
  if (!formClassId) {
    // Get one student where this teacher is the form teacher
    const { data: studentData } = await supabase
      .from('students')
      .select('id')
      .eq('form_teacher_id', effectiveTeacherId)
      .limit(1)
      .single()

    if ((studentData as any)?.id) {
      // Now find the form class this student is enrolled in
      const { data: enrollmentData } = await supabase
        .from('student_classes')
        .select(`
          class:classes(id, name, type)
        `)
        .eq('student_id', (studentData as any).id)
        .eq('status', 'active')
        .limit(10) // Get multiple to find the form class

      // Find the form class (type = 'form')
      const formClassEnrollment = (enrollmentData as any)?.find(
        (item: any) => item.class?.type === 'form'
      )

      if (formClassEnrollment?.class) {
        formClassId = formClassEnrollment.class.id
        formClassName = formClassEnrollment.class.name
      }
    }
  }

  // Get form class students
  const { data: students, error } = await getFormClassStudents(
    supabase,
    effectiveTeacherId
  )

  if (error) {
    console.error('Error fetching form class students:', error)
    throw new Error('Failed to fetch students')
  }

  if (!students || students.length === 0) {
    return {
      students: [],
      totalCount: 0,
      highPriorityCount: 0,
      mediumPriorityCount: 0,
      lowPriorityCount: 0,
      formClassId,
      formClassName,
      fetchedAt: new Date().toISOString(),
    }
  }

  // Enrich all students with PTM data (in parallel for performance)
  const enrichedStudents = await Promise.all(
    students.map((student) => enrichStudentWithPTMData(student, finalConfig))
  )

  // Sort by priority score (highest first)
  const sortedStudents = enrichedStudents.sort(
    (a, b) => b.priorityScore - a.priorityScore
  )

  // Calculate priority counts
  const highPriorityCount = sortedStudents.filter(
    (s) => s.priorityLevel === 'high'
  ).length
  const mediumPriorityCount = sortedStudents.filter(
    (s) => s.priorityLevel === 'medium'
  ).length
  const lowPriorityCount = sortedStudents.filter(
    (s) => s.priorityLevel === 'low'
  ).length

  return {
    students: sortedStudents,
    totalCount: sortedStudents.length,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,
    formClassId,
    formClassName,
    fetchedAt: new Date().toISOString(),
  }
}
