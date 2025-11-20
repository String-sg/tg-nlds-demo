import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * DELETE /api/conversations/[id]
 * Deletes a conversation and all associated data
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    let userId: string

    // Check if in mock/demo mode
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID

    if (mockMode && mockTeacherId) {
      userId = mockTeacherId
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      userId = user.id
    }

    // Validate conversation ID
    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    // Verify ownership before deleting
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('teacher_id')
      .eq('id', id)
      .single()

    if (fetchError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.teacher_id !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this conversation' }, { status: 403 })
    }

    // Delete the conversation (cascade deletes will handle messages and participants)
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError)
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Conversation deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/conversations/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
