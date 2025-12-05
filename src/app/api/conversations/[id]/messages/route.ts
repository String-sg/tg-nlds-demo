import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/conversations/[id]/messages - Get messages for a conversation
export async function GET(request: Request, context: RouteContext) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceClient()
    const { id } = await context.params

    // Get teacher ID from query params or use mock teacher ID
    const { searchParams } = new URL(request.url)
    const teacherIdParam = searchParams.get('teacherId')
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID
    const userId = teacherIdParam || mockTeacherId

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('teacher_id')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (conversation.teacher_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this conversation' },
        { status: 403 }
      )
    }

    // Fetch messages for this conversation
    const { data: messages, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch messages',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
      total: messages?.length || 0,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/conversations/[id]/messages:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages',
      },
      { status: 500 }
    )
  }
}

// POST /api/conversations/[id]/messages - Send a new message
export async function POST(request: Request, context: RouteContext) {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceClient()
    const { id } = await context.params

    const body = await request.json()
    const { content, teacher_id } = body

    // Get teacher ID from body or use mock teacher ID
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID
    const userId = teacher_id || mockTeacherId

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('teacher_id')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (conversation.teacher_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this conversation' },
        { status: 403 }
      )
    }

    // Get teacher's name from database
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('name')
      .eq('id', userId)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!content || content.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Message content is required',
        },
        { status: 400 }
      )
    }

    // Validate content length to prevent DoS
    if (content.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message content exceeds maximum length (5000 characters)',
        },
        { status: 400 }
      )
    }

    // Insert message into database
    // SECURITY: Server determines sender_type and sender_name
    const { data: message, error: insertError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: id,
        sender_type: 'teacher',
        sender_name: teacher.name,
        content: content.trim(),
        read: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating message:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send message',
          details: insertError.message,
        },
        { status: 500 }
      )
    }

    // Update conversation last_message_at timestamp
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating conversation timestamp:', updateError)
      // Don't fail the request if timestamp update fails
    }

    return NextResponse.json(
      {
        success: true,
        message,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/conversations/[id]/messages:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send message',
      },
      { status: 500 }
    )
  }
}
