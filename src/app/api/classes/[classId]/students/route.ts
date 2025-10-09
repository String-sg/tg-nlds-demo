import { NextResponse } from 'next/server'
import { getStudentsByClassId } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params
    const students = await getStudentsByClassId(classId)

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
