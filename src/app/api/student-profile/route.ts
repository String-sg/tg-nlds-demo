import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface AttendanceRecord {
  date?: string
  status?: string
  type?: string
  reason?: string | null
}

interface FriendRelationship {
  friend?: { name: string }
  relationship_type: string | null
  closeness_level: string | null
  notes: string | null
}

interface FormClassData {
  classes: { id: string; name: string }
}

// GET /api/student-profile - Get comprehensive student profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('name')

    if (!studentName) {
      return NextResponse.json(
        { success: false, error: 'Student name is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient()

    // 1. Get basic student info (required first to get student ID)
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select(`
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
      `)
      .ilike('name', studentName)
      .single()

    if (studentError) {
      console.error('Error fetching student:', studentError)
      return NextResponse.json(
        { success: false, error: `Student "${studentName}" not found`, details: studentError.message },
        { status: 404 }
      )
    }

    if (!studentData) {
      return NextResponse.json(
        { success: false, error: `Student "${studentName}" not found` },
        { status: 404 }
      )
    }

    const studentId = studentData.id

    // Use academic year 2025 start date for attendance filtering
    const termStartStr = '2025-01-01'

    // 2-10. Fetch all other data in parallel
    const [
      formClassResult,
      overviewResult,
      academicResult,
      attendanceResult,
      behaviourResult,
      friendsResult,
      privateNotesResult,
      casesResult,
    ] = await Promise.all([
      // Form class
      supabase
        .from('student_classes')
        .select(`
          classes(
            id,
            name
          )
        `)
        .eq('student_id', studentId)
        .limit(1)
        .single(),

      // Overview
      supabase
        .from('student_overview')
        .select('*')
        .eq('student_id', studentId)
        .single(),

      // Academic results
      supabase
        .from('academic_results')
        .select('*')
        .eq('student_id', studentId)
        .order('assessment_date', { ascending: false }),

      // Attendance - filtered by last 60 days and daily type only
      supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .eq('type', 'daily')
        .gte('date', termStartStr)
        .order('date', { ascending: false }),

      // Behaviour observations
      supabase
        .from('behaviour_observations')
        .select('*')
        .eq('student_id', studentId)
        .order('observation_date', { ascending: false }),

      // Friend relationships
      supabase
        .from('friend_relationships')
        .select(`
          friend:students!friend_id(
            name
          ),
          relationship_type,
          closeness_level,
          notes
        `)
        .eq('student_id', studentId),

      // Private notes
      supabase
        .from('student_private_notes')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false }),

      // Cases
      supabase
        .from('cases')
        .select('*')
        .eq('student_id', studentId)
        .order('opened_date', { ascending: false }),
    ])

    const formClassData = formClassResult.data
    const overviewData = overviewResult.data
    const academicData = academicResult.data
    const attendanceData = attendanceResult.data
    const behaviourData = behaviourResult.data
    const friendsData = friendsResult.data
    const privateNotesData = privateNotesResult.data
    const casesData = casesResult.data

    // Calculate attendance stats
    const totalDays = attendanceData?.length || 0
    const present = attendanceData?.filter((a: AttendanceRecord) => a.status === 'present').length || 0
    const absent = attendanceData?.filter((a: AttendanceRecord) => a.status === 'absent').length || 0
    const late = attendanceData?.filter((a: AttendanceRecord) => a.status === 'late').length || 0
    const early_dismissal = attendanceData?.filter((a: AttendanceRecord) => a.status === 'early_dismissal').length || 0
    const attendance_rate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0

    const formClass = formClassData
      ? (formClassData as FormClassData).classes
      : null

    const profile = {
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
        recent_records: (attendanceData || []).slice(0, 10).map((a: AttendanceRecord) => ({
          date: a.date || '',
          status: a.status || '',
          type: a.type || '',
          reason: a.reason || '',
        })),
      },
      behaviour_observations: behaviourData || [],
      friend_relationships: (friendsData || []).map((f: FriendRelationship) => ({
        friend_name: f.friend?.name || 'Unknown',
        relationship_type: f.relationship_type,
        closeness_level: f.closeness_level,
        notes: f.notes,
      })),
      private_notes: privateNotesData || [],
      cases: casesData || [],
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/student-profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student profile' },
      { status: 500 }
    )
  }
}
