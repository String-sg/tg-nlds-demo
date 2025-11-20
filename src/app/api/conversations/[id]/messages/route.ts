import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/conversations/[id]/messages - Get messages for a conversation
export async function GET(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    let userId: string

    // Check if in mock/demo mode
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID

    if (mockMode && mockTeacherId) {
      userId = mockTeacherId
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }
      userId = user.id
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
    const supabase = await createClient()
    const { id } = await context.params
    let userId: string

    // Check if in mock/demo mode
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID

    if (mockMode && mockTeacherId) {
      userId = mockTeacherId
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }
      userId = user.id
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

    const body = await request.json()
    const { content } = body

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
