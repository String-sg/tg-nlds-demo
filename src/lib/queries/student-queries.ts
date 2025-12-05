/**
 * Student Query Functions
 *
 * Shared query functions for student-related data fetching.
 * Uses API routes with service role client to bypass RLS.
 */

import { createClient } from '@/lib/supabase/client'
import { ericStudentRecords } from '@/lib/mock-data/eric-records'

/**
 * Fetch comprehensive student profile with all related data in parallel
 * Uses API route with service role client
 */
export async function fetchStudentProfile(studentName: string) {
  const response = await fetch(
    `/api/student-profile?name=${encodeURIComponent(studentName)}`
  )

  if (!response.ok) {
    // Fall back to direct query if API route doesn't exist yet
    return fetchStudentProfileDirect(studentName)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch student profile')
  }

  return data.profile
}

/**
 * Direct database query for student profile (fallback)
 */
async function fetchStudentProfileDirect(studentName: string) {
  const supabase = createClient()

  // 1. Get basic student info (required first to get student ID)
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select(
      `
      id,
      student_id,
      name,
      year_level,
      profile_photo,
      gender,
      nationality,
      parents_guardians:primary_guardian_id(
        name,
        email,
        phone,
        relationship
      )
    `
    )
    .ilike('name', studentName)
    .single()

  if (studentError) {
    throw new Error(
      `Failed to fetch student data for "${studentName}": ${studentError.message || 'Unknown error'}`
    )
  }

  if (!studentData) {
    throw new Error(`Student "${studentName}" not found in database`)
  }

  const studentId = studentData.id

  // Calculate date range for current term (last 60 days)
  const today = new Date()
  const termStartDate = new Date(today)
  termStartDate.setDate(today.getDate() - 60)
  const termStartStr = termStartDate.toISOString().split('T')[0]

  // 2-10. Fetch all other data in parallel
  const [
    formClassData,
    overviewData,
    academicData,
    attendanceData,
    behaviourData,
    friendsData,
    privateNotesData,
    casesData,
  ] = await Promise.all([
    // Form class
    supabase
      .from('student_classes')
      .select(
        `
        classes(
          id,
          name
        )
      `
      )
      .eq('student_id', studentId)
      .limit(1)
      .single()
      .then((res) => res.data),

    // Overview
    supabase
      .from('student_overview')
      .select('*')
      .eq('student_id', studentId)
      .single()
      .then((res) => res.data),

    // Academic results
    supabase
      .from('academic_results')
      .select('*')
      .eq('student_id', studentId)
      .order('assessment_date', { ascending: false })
      .then((res) => res.data),

    // Attendance - filtered by last 60 days and daily type only
    supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('type', 'daily')
      .gte('date', termStartStr)
      .order('date', { ascending: false })
      .then((res) => res.data),

    // Behaviour observations
    supabase
      .from('behaviour_observations')
      .select('*')
      .eq('student_id', studentId)
      .order('observation_date', { ascending: false })
      .then((res) => res.data),

    // Friend relationships
    supabase
      .from('friend_relationships')
      .select(
        `
        friend:students!friend_id(
          name
        ),
        relationship_type,
        closeness_level,
        notes
      `
      )
      .eq('student_id', studentId)
      .then((res) => res.data),

    // Private notes
    supabase
      .from('student_private_notes')
      .select('*')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false })
      .then((res) => res.data),

    // Cases
    supabase
      .from('cases')
      .select('*')
      .eq('student_id', studentId)
      .order('opened_date', { ascending: false })
      .then((res) => res.data),
  ])

  // Handle Eric Lim mock case data
  let finalCasesData = casesData || []
  if (studentData.student_id === 'student-031') {
    const ericCaseRecords = ericStudentRecords.filter(
      (record) => record.type === 'case-related' && record.data.subType === 'sec-case'
    )

    const mockCases = ericCaseRecords.map((record) => {
      const data = record.data as { caseType?: string; severity?: string; subType?: string }
      return {
        id: record.id,
        case_number: record.id.toUpperCase(),
        case_type:
          data.caseType?.toLowerCase().replace(/\//g, '_').replace(/ /g, '_') || 'counselling',
        title: record.title,
        description: record.description,
        status: 'open',
        severity: data.severity?.toLowerCase() || 'medium',
        opened_date: record.date,
        closed_date: null,
        guardian_notified: false,
      }
    })

    // Type cast to match database schema (mock cases have minimal fields)
    finalCasesData = mockCases as NonNullable<typeof casesData>
  }

  // Calculate attendance stats
  const totalDays = attendanceData?.length || 0
  const present =
    attendanceData?.filter((a) => (a as { status: string }).status === 'present').length || 0
  const absent =
    attendanceData?.filter((a) => (a as { status: string }).status === 'absent').length || 0
  const late =
    attendanceData?.filter((a) => (a as { status: string }).status === 'late').length || 0
  const early_dismissal =
    attendanceData?.filter((a) => (a as { status: string }).status === 'early_dismissal').length ||
    0
  const attendance_rate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0

  const formClass = formClassData
    ? (formClassData as { classes: { id: string; name: string } }).classes
    : null

  return {
    id: studentId,
    student_id: studentData.student_id,
    name: studentData.name,
    class_name: formClass?.name || 'N/A',
    year_level: studentData.year_level,
    form_class_id: formClass?.id || null,
    profile_photo: studentData.profile_photo,
    gender: studentData.gender,
    nationality: studentData.nationality,
    overview: overviewData || null,
    guardian: studentData.parents_guardians || null,
    academic_results: academicData || [],
    attendance: {
      total_days: totalDays,
      present,
      absent,
      late,
      early_dismissal,
      attendance_rate,
      recent_records: (attendanceData || []).slice(0, 10).map((a) => {
        const record = a as {
          date?: string
          status?: string
          type?: string
          reason?: string | null
        }
        return {
          date: record.date || '',
          status: record.status || '',
          type: record.type || '',
          reason: record.reason || '',
        }
      }),
    },
    behaviour_observations: behaviourData || [],
    friend_relationships: (
      friendsData || []
    ).map(
      (f: {
        friend?: { name: string }
        relationship_type: string | null
        closeness_level: string | null
        notes: string | null
      }) => ({
        friend_name: f.friend?.name || 'Unknown',
        relationship_type: f.relationship_type,
        closeness_level: f.closeness_level,
        notes: f.notes,
      })
    ),
    private_notes: privateNotesData || [],
    cases: finalCasesData || [],
  }
}

/**
 * Generate AI insights for a student profile
 */
export function generateStudentAISummary(profileData: {
  attendance: { attendance_rate: number }
  academic_results: Array<{ percentage?: number | null; score?: number | null }>
  behaviour_observations: Array<{ category?: string }>
  friend_relationships: Array<{ closeness_level: string | null }>
  overview: { is_swan?: boolean | null } | null
  cases: Array<{ status?: string }>
}) {
  const insights: string[] = []

  // Attendance insights
  if (profileData.attendance.attendance_rate < 85) {
    insights.push(
      `Attendance at ${profileData.attendance.attendance_rate}% - below expected threshold, may need follow-up`
    )
  } else if (profileData.attendance.attendance_rate >= 95) {
    insights.push(`Excellent attendance record at ${profileData.attendance.attendance_rate}%`)
  }

  // Academic insights
  if (profileData.academic_results.length > 0) {
    const recentScores = profileData.academic_results.slice(0, 3)
    const avgScore =
      recentScores.reduce((sum, r) => sum + (r.percentage || r.score || 0), 0) / recentScores.length
    if (avgScore < 60) {
      insights.push('Recent academic performance below average - intervention may be needed')
    } else if (avgScore >= 80) {
      insights.push('Strong academic performance across recent assessments')
    }
  }

  // Behavior insights
  if (profileData.behaviour_observations.length > 0) {
    const concernBehaviors = profileData.behaviour_observations.filter(
      (b) => b.category === 'concern'
    )
    if (concernBehaviors.length > 2) {
      insights.push(`${concernBehaviors.length} behavioral concerns recorded this term`)
    }
  }

  // Social insights
  if (profileData.friend_relationships.length > 0) {
    const closeFriends = profileData.friend_relationships.filter(
      (f) => f.closeness_level === 'very_close' || f.closeness_level === 'close'
    )
    if (closeFriends.length === 0) {
      insights.push('Limited close friendships - may benefit from social integration support')
    } else if (closeFriends.length >= 3) {
      insights.push(`Healthy social network with ${closeFriends.length} close friends`)
    }
  } else {
    insights.push('No friend relationships recorded - consider monitoring social integration')
  }

  // SWAN status
  if (profileData.overview?.is_swan) {
    insights.push(
      'Student With Additional Needs (SWAN) - receiving appropriate support and monitoring'
    )
  }

  // Cases insights
  if (profileData.cases.length > 0) {
    const openCases = profileData.cases.filter(
      (c) => c.status === 'open' || c.status === 'in_progress'
    )
    if (openCases.length > 0) {
      insights.push(`${openCases.length} active case(s) requiring ongoing attention`)
    }
  }

  // Default message if no insights
  if (insights.length === 0) {
    insights.push('Student performing well overall with no major concerns flagged')
    insights.push('Continue regular monitoring and support')
  }

  return {
    generated_at: new Date().toISOString(),
    insights: insights.slice(0, 4), // Limit to 4 insights
  }
}

/**
 * Fetch students for a class with enriched data
 * Uses API route with service role client
 */
export async function fetchStudentsInClass(classId: string) {
  const response = await fetch(`/api/students?classId=${classId}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch students' }))
    throw new Error(errorData.error || 'Failed to fetch students')
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch students')
  }

  return data.students
}

/**
 * Fetch student alerts for home page
 * TODO: Implement when student_alerts table is added to the schema
 */
export async function fetchStudentAlerts(userId: string, limit: number = 3) {
  // Placeholder: student_alerts table does not exist yet
  // Return empty array until alerts functionality is implemented
  return []
}
