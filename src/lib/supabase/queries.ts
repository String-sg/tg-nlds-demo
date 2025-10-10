// Common database queries with type safety
import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

type Client = SupabaseClient<Database>

// =====================================================
// STUDENT QUERIES
// =====================================================

/**
 * Get student with all guardian information
 */
export async function getStudentWithGuardians(
  supabase: Client,
  studentId: string
) {
  const { data, error } = await supabase
    .from('students')
    .select(
      `
      *,
      primary_guardian:parents_guardians!primary_guardian_id(*),
      form_teacher:teachers!form_teacher_id(*),
      guardians:student_guardians(
        emergency_contact_priority,
        can_pickup,
        is_primary,
        notes,
        guardian:parents_guardians(*)
      )
    `
    )
    .eq('id', studentId)
    .single()

  return { data, error }
}

/**
 * Get student with full profile data
 */
export async function getStudentFullProfile(
  supabase: Client,
  studentId: string
) {
  const { data, error } = await supabase
    .from('students')
    .select(
      `
      *,
      overview:student_overview(*),
      form_teacher:teachers!form_teacher_id(*),
      primary_guardian:parents_guardians!primary_guardian_id(*)
    `
    )
    .eq('id', studentId)
    .single()

  return { data, error }
}

/**
 * Get all students for a teacher (includes students in their classes)
 */
export async function getStudentsForTeacher(
  supabase: Client,
  teacherId: string
) {
  const { data, error } = await supabase
    .from('students')
    .select(
      `
      *,
      form_teacher:teachers!form_teacher_id(*),
      classes:student_classes!inner(
        class:classes!inner(
          *,
          teacher_class:teacher_classes!inner(
            teacher_id
          )
        )
      )
    `
    )
    .eq('classes.class.teacher_class.teacher_id', teacherId)

  return { data, error }
}

/**
 * Get students where teacher is form teacher
 */
export async function getFormClassStudents(
  supabase: Client,
  teacherId: string
) {
  const { data, error } = await supabase
    .from('students')
    .select(
      `
      *,
      primary_guardian:parents_guardians!primary_guardian_id(*),
      overview:student_overview(*)
    `
    )
    .eq('form_teacher_id', teacherId)
    .order('name')

  return { data, error }
}

// =====================================================
// ATTENDANCE QUERIES
// =====================================================

/**
 * Get attendance records for a student in a date range
 */
export async function getStudentAttendance(
  supabase: Client,
  studentId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('attendance')
    .select(
      `
      *,
      class:classes(*),
      recorded_by_teacher:teachers!recorded_by(name)
    `
    )
    .eq('student_id', studentId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  return { data, error }
}

/**
 * Get today's attendance for a class
 */
export async function getClassAttendanceToday(
  supabase: Client,
  classId: string
) {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('attendance')
    .select(
      `
      *,
      student:students(*)
    `
    )
    .eq('class_id', classId)
    .eq('date', today)
    .order('status')

  return { data, error }
}

// =====================================================
// ACADEMIC RESULTS QUERIES
// =====================================================

/**
 * Get student's academic results for a term
 */
export async function getStudentResultsByTerm(
  supabase: Client,
  studentId: string,
  term: string
) {
  const { data, error } = await supabase
    .from('academic_results')
    .select(
      `
      *,
      class:classes(*),
      created_by_teacher:teachers!created_by(name)
    `
    )
    .eq('student_id', studentId)
    .eq('term', term)
    .order('assessment_date', { ascending: false })

  return { data, error }
}

// =====================================================
// PRIVATE NOTES QUERIES
// =====================================================

/**
 * Get private notes for a student (teacher sees only theirs unless form teacher)
 */
export async function getStudentPrivateNotes(
  supabase: Client,
  studentId: string
) {
  const { data, error } = await supabase
    .from('student_private_notes')
    .select(
      `
      *,
      teacher:teachers!created_by(name, avatar)
    `
    )
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Create a private note
 */
export async function createPrivateNote(
  supabase: Client,
  studentId: string,
  note: string,
  teacherId: string
) {
  const { data, error } = await supabase
    .from('student_private_notes')
    .insert({
      student_id: studentId,
      note,
      created_by: teacherId,
    })
    .select()
    .single()

  return { data, error }
}

// =====================================================
// CASES QUERIES
// =====================================================

/**
 * Get all cases for a student
 */
export async function getStudentCases(supabase: Client, studentId: string) {
  const { data, error } = await supabase
    .from('cases')
    .select(
      `
      *,
      created_by_teacher:teachers!created_by(name),
      assigned_teacher:teachers!assigned_to(name),
      issues:case_issues(count)
    `
    )
    .eq('student_id', studentId)
    .order('opened_date', { ascending: false })

  return { data, error }
}

/**
 * Get case with all issues
 */
export async function getCaseWithIssues(supabase: Client, caseId: string) {
  const { data, error } = await supabase
    .from('cases')
    .select(
      `
      *,
      student:students(*),
      created_by_teacher:teachers!created_by(name),
      assigned_teacher:teachers!assigned_to(name),
      issues:case_issues(
        *,
        created_by_teacher:teachers!created_by(name)
      )
    `
    )
    .eq('id', caseId)
    .single()

  return { data, error }
}

/**
 * Create a new case
 */
export async function createCase(
  supabase: Client,
  caseData: Database['public']['Tables']['cases']['Insert']
) {
  const { data, error } = await supabase
    .from('cases')
    .insert(caseData)
    .select()
    .single()

  return { data, error }
}

/**
 * Add an issue to a case
 */
export async function createCaseIssue(
  supabase: Client,
  issueData: Database['public']['Tables']['case_issues']['Insert']
) {
  const { data, error } = await supabase
    .from('case_issues')
    .insert(issueData)
    .select()
    .single()

  return { data, error }
}

// =====================================================
// REPORTS QUERIES
// =====================================================

/**
 * Get reports for a student
 */
export async function getStudentReports(supabase: Client, studentId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `
      *,
      created_by_teacher:teachers!created_by(name),
      reviewed_by_teacher:teachers!reviewed_by(name),
      approved_by_teacher:teachers!approved_by(name),
      comments:report_comments(count)
    `
    )
    .eq('student_id', studentId)
    .order('term', { ascending: false })

  return { data, error }
}

/**
 * Get report with comments
 */
export async function getReportWithComments(supabase: Client, reportId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `
      *,
      student:students(*),
      created_by_teacher:teachers!created_by(*),
      comments:report_comments(
        *,
        commenter:teachers!commenter_id(name, avatar)
      )
    `
    )
    .eq('id', reportId)
    .single()

  return { data, error }
}

/**
 * Get reports by term and status (for form teacher dashboard)
 */
export async function getReportsByTermAndStatus(
  supabase: Client,
  term: string,
  status: Database['public']['Tables']['reports']['Row']['status']
) {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `
      *,
      student:students(name, student_id),
      comments:report_comments(count)
    `
    )
    .eq('term', term)
    .eq('status', status)
    .order('updated_at', { ascending: false })

  return { data, error }
}

// =====================================================
// CLASSES QUERIES
// =====================================================

/**
 * Get classes taught by teacher
 */
export async function getTeacherClasses(supabase: Client, teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_classes')
    .select(
      `
      role,
      class:classes(
        *,
        students:student_classes(
          student:students(*)
        )
      )
    `
    )
    .eq('teacher_id', teacherId)

  return { data, error }
}

/**
 * Get class with students and teacher
 */
export async function getClassDetails(supabase: Client, classId: string) {
  const { data, error } = await supabase
    .from('classes')
    .select(
      `
      *,
      teachers:teacher_classes(
        role,
        teacher:teachers(*)
      ),
      students:student_classes(
        student:students(
          *,
          primary_guardian:parents_guardians!primary_guardian_id(*)
        )
      )
    `
    )
    .eq('id', classId)
    .single()

  return { data, error }
}

// =====================================================
// BEHAVIOUR & SOCIAL QUERIES
// =====================================================

/**
 * Get behaviour observations for a student
 */
export async function getStudentBehaviourObservations(
  supabase: Client,
  studentId: string,
  limit = 20
) {
  const { data, error } = await supabase
    .from('behaviour_observations')
    .select(
      `
      *,
      observer:teachers!observed_by(name, avatar)
    `
    )
    .eq('student_id', studentId)
    .order('observation_date', { ascending: false })
    .limit(limit)

  return { data, error }
}

/**
 * Get friend relationships for a student
 */
export async function getStudentFriendships(
  supabase: Client,
  studentId: string
) {
  const { data, error } = await supabase
    .from('friend_relationships')
    .select(
      `
      *,
      friend:students!friend_id(name, student_id),
      observed_by_teacher:teachers!observed_by(name)
    `
    )
    .eq('student_id', studentId)
    .order('closeness_level')

  return { data, error }
}
