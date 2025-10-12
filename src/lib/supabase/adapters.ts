// Adapters to transform Supabase data types to frontend mock data types
// This minimizes component changes by maintaining compatible interfaces

import type { Database } from '@/types/database'
import type { User, Class, CCAClass, Student, ClassSchedule } from '@/types/classroom'

// Supabase Row types for convenience
type TeacherRow = Database['public']['Tables']['teachers']['Row']
type ClassRow = Database['public']['Tables']['classes']['Row']
type StudentRow = Database['public']['Tables']['students']['Row']
type GuardianRow = Database['public']['Tables']['parents_guardians']['Row']

// Extended types from joins
interface TeacherWithClasses extends TeacherRow {
  teacher_classes?: Array<{
    role: 'teacher' | 'form_teacher'
    class: ClassRow
  }>
}

interface StudentWithRelations extends StudentRow {
  primary_guardian?: GuardianRow
  form_teacher?: TeacherRow
  student_classes?: Array<{
    class: ClassRow
  }>
}

/**
 * Maps Supabase teacher to User type
 */
export function mapTeacherToUser(
  teacher: TeacherWithClasses,
  formClassId?: string
): User {
  const classes = teacher.teacher_classes || []
  const formTeacher = classes.find((tc) => tc.role === 'form_teacher')

  return {
    user_id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    role: formTeacher ? 'FormTeacher' : 'Teacher',
    department: teacher.department || '',
    classes_assigned: classes.map((tc) => tc.class.id),
    form_class_id: formClassId || formTeacher?.class.id,
    cca_classes: classes
      .filter((tc) => tc.class.type === 'cca')
      .map((tc) => tc.class.id),
    avatar: teacher.avatar || undefined,
  }
}

/**
 * Maps Supabase class to Class type (subject/form)
 */
export function mapSupabaseClassToClass(
  classRow: ClassRow,
  teacherId?: string,
  formTeacherId?: string,
  studentCount?: number
): Class {
  const schedule = parseSchedule(classRow.schedule)

  return {
    class_id: classRow.id,
    class_name: classRow.name,
    subject: classRow.subject_name || '',
    year_level: parseInt(classRow.year_level || '0'),
    teacher_id: teacherId || '',
    form_teacher_id: formTeacherId || '',
    students: [], // Will be populated separately
    schedule,
    academic_year: classRow.academic_year,
    is_form_class: classRow.type === 'form',
    student_count: studentCount || 0,
  }
}

/**
 * Maps Supabase class to CCAClass type
 */
export function mapSupabaseClassToCCAClass(
  classRow: ClassRow,
  teacherId?: string,
  memberIds: string[] = []
): CCAClass {
  const schedule = parseSchedule(classRow.schedule)

  return {
    cca_id: classRow.id,
    name: classRow.name,
    type: 'Clubs', // Default, could be enhanced with metadata
    teacher_in_charge: teacherId || '',
    members: memberIds,
    schedule,
  }
}

/**
 * Maps Supabase student to Student type
 */
export function mapSupabaseStudentToStudent(
  student: StudentWithRelations,
  classId?: string,
  className?: string
): Student {
  const guardian = student.primary_guardian

  return {
    student_id: student.id,
    name: student.name,
    class_id: classId || '',
    class_name: className || '',
    year_level: parseInt(student.year_level || '0'),
    status: 'None', // TODO: Add status field to student_overview
    conduct_grade: 'Good', // Default Singapore MOE conduct grade

    // Academic - empty for now, will query academic_results
    grades: {},

    // Attendance - will calculate from attendance table
    attendance_rate: 0,

    // Guardian info
    parent_name: guardian?.name || '',
    parent_email: guardian?.email || '',
    parent_phone: guardian?.phone || '',

    // Background
    friends: [], // TODO: Query friend_relationships

    // Flags - will come from student_overview
    has_medical_conditions: false,
    needs_counselling: false,
    has_disciplinary_issues: false,
    has_sen: false,
  }
}

/**
 * Parse schedule JSON to ClassSchedule array
 */
function parseSchedule(schedule: unknown): ClassSchedule[] {
  if (!schedule || typeof schedule !== 'object') return []

  try {
    const arr = Array.isArray(schedule) ? schedule : [schedule]
    return arr.map((item: { day?: string; start_time?: string; end_time?: string; location?: string }) => ({
      day: item.day || '',
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      location: item.location || '',
    }))
  } catch {
    return []
  }
}

/**
 * Enriches Student with academic results
 */
export function enrichStudentWithGrades(
  student: Student,
  academicResults: Array<{ subject: string; score: number }>
): Student {
  const grades: { [subject: string]: number } = {}

  academicResults.forEach((result) => {
    grades[result.subject.toLowerCase()] = result.score
  })

  return {
    ...student,
    grades,
  }
}

/**
 * Enriches Student with attendance rate
 */
export function enrichStudentWithAttendance(
  student: Student,
  attendanceRecords: { total: number; present: number }
): Student {
  const rate = attendanceRecords.total > 0
    ? Math.round((attendanceRecords.present / attendanceRecords.total) * 100)
    : 0

  return {
    ...student,
    attendance_rate: rate,
  }
}
