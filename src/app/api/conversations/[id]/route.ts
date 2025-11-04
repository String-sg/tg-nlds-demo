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

    // Validate conversation ID
    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
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
