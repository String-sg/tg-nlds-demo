import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/classes/name - Get class name by ID (for breadcrumbs)
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

    const { data, error } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', classId)
      .single()

    if (error) {
      console.error('Error fetching class name:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch class name', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      class: data,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/classes/name:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch class name' },
      { status: 500 }
    )
  }
}
