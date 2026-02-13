import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface StudentData {
  id: string
  student_id: string
  name: string
  year_level: string
  profile_photo: string | null
  gender: string | null
  nationality: string | null
  primary_guardian?: {
    id: string
    name: string
    email: string
    phone: string
    relationship: string
  }
  form_teacher?: {
    id: string
    name: string
    email: string
  }
}

interface ClassData {
  id: string
  name: string
}

interface EnrollmentData {
  student: StudentData
  class: ClassData
}

interface AttendanceRecord {
  student_id: string
  status: string
  date: string
}

interface AcademicRecord {
  student_id: string
  subject: string | null
  score: number | null
}

interface OverviewRecord {
  student_id: string
  is_swan: boolean | null
}

// GET /api/students - List all students in a class
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient()

    // Get students enrolled in this class
    const { data: enrollments, error: queryError } = await supabase
      .from('student_classes')
      .select(`
        student:students(
          id,
          student_id,
          name,
          year_level,
          profile_photo,
          gender,
          nationality,
          primary_guardian:parents_guardians!primary_guardian_id(
            id,
            name,
            email,
            phone,
            relationship
          ),
          form_teacher:teachers!form_teacher_id(
            id,
            name,
            email
          )
        ),
        class:classes(
          id,
          name
        )
      `)
      .eq('class_id', classId)
      .eq('status', 'active')

    if (queryError) {
      console.error('Error fetching students:', queryError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students', details: queryError.message },
        { status: 500 }
      )
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        students: [],
      })
    }

    // Get student IDs for batch enrichment
    const typedEnrollments = enrollments as unknown as EnrollmentData[]
    const studentIds = typedEnrollments
      .filter((e: EnrollmentData) => e && e.student)
      .map((e: EnrollmentData) => e.student.id)

    // Use academic year 2025 start date for attendance filtering
    const termStartStr = '2025-01-01'

    // Fetch all enrichment data in parallel using batch queries
    const [attendanceResult, academicResult, overviewResult] = await Promise.all([
      // Batch attendance query
      supabase
        .from('attendance')
        .select('student_id, status, date')
        .in('student_id', studentIds)
        .eq('type', 'daily')
        .gte('date', termStartStr),

      // Batch academic results query
      supabase
        .from('academic_results')
        .select('student_id, subject, score')
        .in('student_id', studentIds),

      // Batch overview query
      supabase
        .from('student_overview')
        .select('student_id, is_swan')
        .in('student_id', studentIds),
    ])

    const attendanceData = attendanceResult.data as AttendanceRecord[] | null
    const academicData = academicResult.data as AcademicRecord[] | null
    const overviewData = overviewResult.data as OverviewRecord[] | null

    // Build lookup maps for O(1) access
    const attendanceMap = new Map<string, { total: number; present: number }>()
    attendanceData?.forEach((a: AttendanceRecord) => {
      const current = attendanceMap.get(a.student_id) || { total: 0, present: 0 }
      current.total++
      if (a.status === 'present') current.present++
      attendanceMap.set(a.student_id, current)
    })

    const gradesMap = new Map<string, Array<{ subject: string; score: number }>>()
    academicData?.forEach((result: AcademicRecord) => {
      if (!result.subject || result.score === null || result.score === undefined) return
      const current = gradesMap.get(result.student_id) || []
      current.push({ subject: result.subject, score: result.score })
      gradesMap.set(result.student_id, current)
    })

    const overviewMap = new Map<string, { is_swan: boolean }>()
    overviewData?.forEach((overview: OverviewRecord) => {
      overviewMap.set(overview.student_id, {
        is_swan: overview.is_swan || false,
      })
    })

    // Map and enrich students
    const students = typedEnrollments
      .filter((e: EnrollmentData) => e && e.student && e.class)
      .map((enrollment: EnrollmentData) => {
        const student = enrollment.student
        const classData = enrollment.class

        // Add attendance
        const attendance = attendanceMap.get(student.id)
        const attendance_rate =
          attendance && attendance.total > 0
            ? Math.round((attendance.present / attendance.total) * 100)
            : 0

        // Add grades and calculate average
        const grades: { [subject: string]: number } = {}
        let average_grade: number | undefined
        const studentGrades = gradesMap.get(student.id)
        if (studentGrades && studentGrades.length > 0) {
          studentGrades.forEach((g) => {
            const subjectKey =
              g.subject.toLowerCase() === 'mathematics' ? 'math' : g.subject.toLowerCase()
            grades[subjectKey] = g.score
          })
          const total = studentGrades.reduce((sum, g) => sum + g.score, 0)
          average_grade = Math.round(total / studentGrades.length)
        }

        // Add status
        const overview = overviewMap.get(student.id)
        let status: string | undefined
        let has_sen = false

        if (overview) {
          if (overview.is_swan) {
            status = 'SWAN'
            has_sen = true
          }
        }

        return {
          student_id: student.student_id,
          name: student.name,
          class_id: classData.id,
          class_name: classData.name,
          year_level: student.year_level,
          profile_photo: student.profile_photo,
          gender: student.gender,
          nationality: student.nationality,
          attendance_rate,
          grades,
          average_grade,
          status,
          has_sen,
          guardian: student.primary_guardian
            ? {
                id: student.primary_guardian.id,
                name: student.primary_guardian.name,
                email: student.primary_guardian.email,
                phone: student.primary_guardian.phone,
                relationship: student.primary_guardian.relationship,
              }
            : undefined,
          form_teacher: student.form_teacher
            ? {
                id: student.form_teacher.id,
                name: student.form_teacher.name,
                email: student.form_teacher.email,
              }
            : undefined,
        }
      })

    return NextResponse.json({
      success: true,
      students,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}
