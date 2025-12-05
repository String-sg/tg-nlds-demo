import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/teachers - Get teacher by email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        teacher_classes(
          role,
          class:classes(*)
        )
      `)
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching teacher:', error)
      return NextResponse.json(
        { success: false, error: 'Teacher not found', details: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      teacher: data,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/teachers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teacher' },
      { status: 500 }
    )
  }
}
