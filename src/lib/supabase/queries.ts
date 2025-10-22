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
  const noteData: Database['public']['Tables']['student_private_notes']['Insert'] = {
    student_id: studentId,
    note,
    created_by: teacherId,
  }

  const { data, error } = await supabase
    .from('student_private_notes')
    // @ts-expect-error - Supabase type inference issue with insert
    .insert(noteData)
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
    // @ts-expect-error - Supabase type inference issue with insert
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
    // @ts-expect-error - Supabase type inference issue with insert
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

/**
 * Get teacher's form class (where they are the form teacher)
 */
export async function getTeacherFormClass(supabase: Client, teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_classes')
    .select(
      `
      class_id,
      class:classes(
        id,
        name,
        type,
        year_level
      )
    `
    )
    .eq('teacher_id', teacherId)
    .eq('role', 'form_teacher')
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

// =====================================================
// DASHBOARD / ALERTS QUERIES
// =====================================================

export type StudentAlert = {
  student_id: string
  student_name: string
  initials: string
  message: string
  priority: 'high' | 'medium' | 'info'
  alert_type: 'attendance' | 'case' | 'behaviour' | 'performance'
  class_id: string | null
  class_name: string | null
}

/**
 * Get students with alerts for teacher dashboard
 * Checks for: attendance issues, open cases, recent behavior observations
 */
export async function getStudentAlerts(
  supabase: Client,
  teacherId: string,
  limit = 3
): Promise<{ data: StudentAlert[] | null; error: unknown }> {
  try {
    // Get current week's date range
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)
    const todayStr = today.toISOString().split('T')[0]
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    // Get students taught by this teacher
    const { data: teacherClasses } = await supabase
      .from('teacher_classes')
      .select('class_id')
      .eq('teacher_id', teacherId)

    if (!teacherClasses || teacherClasses.length === 0) {
      return { data: [], error: null }
    }

    const classIds = teacherClasses.map((tc: { class_id: string }) => tc.class_id)

    // Get students in these classes
    const { data: studentClasses } = await supabase
      .from('student_classes')
      .select('student_id')
      .in('class_id', classIds)
      .eq('status', 'active')

    if (!studentClasses || studentClasses.length === 0) {
      return { data: [], error: null }
    }

    const studentIds = [...new Set(studentClasses.map((sc: { student_id: string }) => sc.student_id))]

    // Get students with names and their primary class
    const { data: students } = await supabase
      .from('students')
      .select(`
        id, 
        name, 
        student_id,
        student_classes!inner(
          class:classes(
            id,
            name
          )
        )
      `)
      .in('id', studentIds)

    if (!students) {
      return { data: [], error: null }
    }

    // Transform to simpler structure with primary class
    const studentsWithClasses = students.map((s: { id: string; name: string; student_id: string; student_classes?: Array<{ class: { id: string; name: string } }> }) => {
      // Get the first class (primary class)
      const primaryClass = s.student_classes?.[0]?.class
      return {
        id: s.id,
        name: s.name,
        student_id: s.student_id,
        class_id: primaryClass?.id || null,
        class_name: primaryClass?.name || null,
      }
    })

    const alerts: StudentAlert[] = []

    // Check overall attendance rates for all students
    const { data: allAttendanceData } = await supabase
      .from('attendance')
      .select('student_id, status, date')
      .in('student_id', studentIds)
      .order('date', { ascending: false })

    // Calculate attendance rates per student
    interface AttendanceStats {
      total: number
      present: number
      absent: number
      late: number
      rate: number
    }

    const attendanceStats: Record<string, AttendanceStats> = {}
    if (allAttendanceData) {
      for (const record of allAttendanceData as Array<{ student_id: string; status: string; date: string }>) {
        if (!attendanceStats[record.student_id]) {
          attendanceStats[record.student_id] = { total: 0, present: 0, absent: 0, late: 0, rate: 0 }
        }
        attendanceStats[record.student_id].total++
        if (record.status === 'present') {
          attendanceStats[record.student_id].present++
        } else if (record.status === 'absent') {
          attendanceStats[record.student_id].absent++
        } else if (record.status === 'late') {
          attendanceStats[record.student_id].late++
        }
      }

      // Calculate rates
      for (const studentId in attendanceStats) {
        const stats = attendanceStats[studentId]
        stats.rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
      }
    }

    // Add attendance alerts for students with low attendance rates
    // Priority: Critical (<60%), High (60-79%), Medium (80-89%)
    const sortedAttendance = Object.entries(attendanceStats)
      .filter(([_, stats]) => stats.rate < 90) // Only show students below 90%
      .sort(([_, a], [__, b]) => a.rate - b.rate) // Sort by lowest rate first

    for (const [studentId, stats] of sortedAttendance) {
      const student = studentsWithClasses.find((s) => s.id === studentId)
      if (student) {
        const nameParts = student.name.split(' ')
        const initials =
          nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
            : student.name.substring(0, 2).toUpperCase()

        // Determine priority and message based on attendance rate
        let priority: 'high' | 'medium' | 'info' = 'medium'
        let message = ''

        if (stats.rate < 60) {
          // Critical attendance issue
          priority = 'high'
          message = `Critical attendance issue: ${stats.rate}% attendance rate (${stats.absent} absences out of ${stats.total} days). Immediate family intervention and support needed.`
        } else if (stats.rate < 80) {
          // High concern
          priority = 'high'
          message = `Low attendance: ${stats.rate}% attendance rate (${stats.absent} absences, ${stats.late} late arrivals). Requires follow-up with family and support plan.`
        } else if (stats.rate < 90) {
          // Moderate concern
          priority = 'medium'
          message = `Attendance concern: ${stats.rate}% attendance rate (${stats.absent} absences, ${stats.late} late). Monitor pattern and check for underlying issues.`
        }

        alerts.push({
          student_id: student.id,
          student_name: student.name,
          initials: initials.toUpperCase(),
          message: message,
          priority: priority,
          alert_type: 'attendance',
          class_id: student.class_id,
          class_name: student.class_name,
        })

        // Only show the worst attendance case
        if (alerts.length >= limit) break
      }
    }

    // First, identify SWAN students with open cases (highest priority)
    const { data: swanStudents } = await supabase
      .from('student_overview')
      .select('student_id, is_swan')
      .in('student_id', studentIds)
      .eq('is_swan', true)

    const swanStudentIds = swanStudents ? swanStudents.map((s: { student_id: string }) => s.student_id) : []

    // Check for open cases, prioritizing SWAN students
    const { data: casesData } = await supabase
      .from('cases')
      .select('student_id, status, severity, case_type')
      .in('student_id', studentIds)
      .in('status', ['open', 'in_progress'])
      .order('severity', { ascending: false })

    if (casesData && casesData.length > 0) {
      // Sort cases to put SWAN students first
      const sortedCases = [...(casesData as Array<{ student_id: string; status: string; severity: string; case_type: string }>)]
      sortedCases.sort((a, b) => {
        const aIsSwan = swanStudentIds.includes(a.student_id)
        const bIsSwan = swanStudentIds.includes(b.student_id)
        if (aIsSwan && !bIsSwan) return -1
        if (!aIsSwan && bIsSwan) return 1
        return 0
      })

      for (const caseRecord of sortedCases) {
        // Skip if student already has an alert
        if (alerts.some((a) => a.student_id === caseRecord.student_id)) {
          continue
        }

        const student = studentsWithClasses.find((s) => s.id === caseRecord.student_id)
        if (student) {
          const nameParts = student.name.split(' ')
          const initials =
            nameParts.length >= 2
              ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
              : student.name.substring(0, 2).toUpperCase()

          const priorityMap = {
            high: 'high' as const,
            medium: 'medium' as const,
            low: 'info' as const,
          }

          // Create a more descriptive message based on case type
          let message = `Open ${caseRecord.case_type} case`
          if (caseRecord.case_type === 'discipline') {
            message = 'Open discipline case - behavioral support and monitoring ongoing'
          } else if (caseRecord.case_type === 'counselling') {
            message = 'Open counselling case - emotional/social support in progress'
          } else if (caseRecord.case_type === 'sen') {
            message = 'SEN support case - learning accommodations and interventions active'
          }

          alerts.push({
            student_id: student.id,
            student_name: student.name,
            initials: initials.toUpperCase(),
            message: message,
            priority: priorityMap[(caseRecord.severity || 'medium') as 'high' | 'medium' | 'low'],
            alert_type: 'case',
            class_id: student.class_id,
            class_name: student.class_name,
          })
        }

        if (alerts.length >= limit) break
      }
    }

    // Enrich alerts for SWAN students with detailed context
    if (alerts.length > 0 && swanStudentIds.length > 0) {
      const alertStudentIds = alerts.map(a => a.student_id)
      const swanAlertsIds = alertStudentIds.filter(id => swanStudentIds.includes(id))

      if (swanAlertsIds.length > 0) {
        for (const swanStudentId of swanAlertsIds) {
          const alertIndex = alerts.findIndex(a => a.student_id === swanStudentId)
          if (alertIndex !== -1) {
            const student = studentsWithClasses.find(s => s.id === swanStudentId)
            if (student) {
              // Get academic results to show performance trend
              const { data: academicResults } = await supabase
                .from('academic_results')
                .select('score, subject, term')
                .eq('student_id', swanStudentId)
                .order('assessment_date', { ascending: false })
                .limit(8) // Last 2 terms (4 subjects each)

              let academicContext = ''
              if (academicResults && academicResults.length > 0) {
                const recentScores = academicResults.slice(0, 4) as Array<{ score: number; subject: string; term: string }>
                const avgScore = Math.round(recentScores.reduce((sum, r) => sum + (r.score || 0), 0) / recentScores.length)

                // Check if we have older scores to compare
                if (academicResults.length >= 8) {
                  const olderScores = academicResults.slice(4, 8) as Array<{ score: number; subject: string; term: string }>
                  const oldAvg = Math.round(olderScores.reduce((sum, r) => sum + (r.score || 0), 0) / olderScores.length)
                  const change = avgScore - oldAvg
                  if (change < -10) {
                    academicContext = ` Declining academic performance (${oldAvg}% → ${avgScore}% avg).`
                  } else if (change < 0) {
                    academicContext = ` Academic performance slightly declined (${oldAvg}% → ${avgScore}%).`
                  }
                } else {
                  academicContext = ` Current academic average: ${avgScore}%.`
                }
              }

              // Enhanced message for SWAN students
              alerts[alertIndex] = {
                ...alerts[alertIndex],
                message: `SWAN mental health case.${academicContext} Experiencing high family pressure, anxiety, and stress-related symptoms. Bi-weekly counseling ongoing. PTM scheduled.`,
                priority: 'high', // Upgrade SWAN cases to high priority
              }
            }
          }
        }
      }
    }

    // Check for recent positive behavior observations (if we haven't hit limit)
    if (alerts.length < limit) {
      const { data: behaviorData } = await supabase
        .from('behaviour_observations')
        .select('student_id, category, severity, observation_date')
        .in('student_id', studentIds)
        .gte('observation_date', weekAgoStr)
        .order('observation_date', { ascending: false })
        .limit(10)

      if (behaviorData && behaviorData.length > 0) {
        // Look for positive observations first
        const positiveCategories = [
          'excellence',
          'achievement',
          'improvement',
          'positive',
        ]

        for (const obs of behaviorData as Array<{ student_id: string; category: string; severity: string; observation_date: string }>) {
          // Skip if student already has an alert
          if (alerts.some((a) => a.student_id === obs.student_id)) {
            continue
          }

          const isPositive = positiveCategories.some((cat) =>
            obs.category.toLowerCase().includes(cat)
          )

          if (isPositive || obs.severity === 'low') {
            const student = studentsWithClasses.find((s) => s.id === obs.student_id)
            if (student) {
              const nameParts = student.name.split(' ')
              const initials =
                nameParts.length >= 2
                  ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                  : student.name.substring(0, 2).toUpperCase()

              alerts.push({
                student_id: student.id,
                student_name: student.name,
                initials: initials.toUpperCase(),
                message: 'Excellent progress',
                priority: 'info',
                alert_type: 'behaviour',
                class_id: student.class_id,
                class_name: student.class_name,
              })
            }

            if (alerts.length >= limit) break
          }
        }
      }
    }

    // Return top alerts up to limit
    return { data: alerts.slice(0, limit), error: null }
  } catch (error) {
    console.error('Error fetching student alerts:', error)
    return { data: null, error }
  }
}
