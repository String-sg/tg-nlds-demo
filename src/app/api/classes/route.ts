import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type ClassRow = Database['public']['Tables']['classes']['Row']

interface TeacherClassWithClass {
  role: string
  class: ClassRow
}

interface StudentClassRow {
  class_id: string
}

// GET /api/classes - List all classes for a teacher
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

    // Fetch all classes where teacher is assigned
    const { data: teacherClasses, error: queryError } = await supabase
      .from('teacher_classes')
      .select(`
        role,
        class:classes(*)
      `)
      .eq('teacher_id', teacherId)

    if (queryError) {
      console.error('Error fetching teacher classes:', queryError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch classes', details: queryError.message },
        { status: 500 }
      )
    }

    if (!teacherClasses || teacherClasses.length === 0) {
      return NextResponse.json({
        success: true,
        formClass: null,
        subjectClasses: [],
        ccaClasses: [],
        raw: [],
      })
    }

    // Get all class IDs for batch student count query
    const classIds = (teacherClasses as unknown as TeacherClassWithClass[])
      .filter((tc: TeacherClassWithClass) => tc && tc.class)
      .map((tc: TeacherClassWithClass) => tc.class.id)

    // Batch query for student counts
    const { data: studentCounts } = await supabase
      .from('student_classes')
      .select('class_id')
      .in('class_id', classIds)
      .eq('status', 'active')

    // Build count map
    const countMap = new Map<string, number>()
    ;(studentCounts as StudentClassRow[] | null)?.forEach((sc: StudentClassRow) => {
      const current = countMap.get(sc.class_id) || 0
      countMap.set(sc.class_id, current + 1)
    })

    // Enrich classes with counts
    const classesWithCounts = (teacherClasses as unknown as TeacherClassWithClass[]).map(
      (tc: TeacherClassWithClass) => {
        if (tc && tc.class) {
          return {
            ...tc,
            studentCount: countMap.get(tc.class.id) || 0,
          }
        }
        return { ...tc, studentCount: 0 }
      }
    )

    // Separate by type
    const form = classesWithCounts.find(
      (tc) => tc.role === 'form_teacher' && tc.class?.type === 'form'
    )

    const subjects = classesWithCounts.filter((tc) => tc.class?.type === 'subject')

    const ccas = classesWithCounts.filter((tc) => tc.class?.type === 'cca')

    return NextResponse.json({
      success: true,
      formClass: form || null,
      subjectClasses: subjects,
      ccaClasses: ccas,
      raw: classesWithCounts,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/classes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}
