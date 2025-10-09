import { NextResponse } from 'next/server'
import { getStudentByName } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    // Decode URL-encoded name (e.g., "Eric%20Lim" -> "Eric Lim")
    const decodedName = decodeURIComponent(name)

    const student = await getStudentByName(decodedName)

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
