import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface TeacherClassRow {
  class_id: string
}

interface GuardianData {
  id: string
  name: string
  email: string
  phone: string
  relationship: string
}

interface StudentData {
  id: string
  student_id: string
  name: string
  year_level: string
  primary_guardian: GuardianData | null
}

interface ClassData {
  id: string
  name: string
}

interface EnrollmentData {
  student: StudentData
  class: ClassData
}

// GET /api/inbox-students - Get students for inbox (conversations)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient()

    // First, get all class IDs where the teacher is assigned
    const { data: teacherClasses, error: teacherClassesError } = await supabase
      .from('teacher_classes')
      .select('class_id')
      .eq('teacher_id', teacherId)

    if (teacherClassesError) {
      console.error('Error fetching teacher classes:', teacherClassesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch teacher classes', details: teacherClassesError.message },
        { status: 500 }
      )
    }

    if (!teacherClasses || teacherClasses.length === 0) {
      return NextResponse.json({
        success: true,
        students: [],
      })
    }

    const classIds = (teacherClasses as TeacherClassRow[]).map((tc: TeacherClassRow) => tc.class_id)

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

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students', details: error.message },
        { status: 500 }
      )
    }

    const typedData = data as unknown as EnrollmentData[]
    const students = typedData?.map((enrollment: EnrollmentData) => ({
      id: enrollment.student.id,
      student_id: enrollment.student.student_id,
      name: enrollment.student.name,
      class_id: enrollment.class.id,
      class_name: enrollment.class.name,
      year_level: enrollment.student.year_level,
      primary_guardian: enrollment.student.primary_guardian,
    })) || []

    return NextResponse.json({
      success: true,
      students,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/inbox-students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inbox students' },
      { status: 500 }
    )
  }
}
