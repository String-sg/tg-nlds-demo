import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/conversations - List all conversations for current teacher
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    let userId: string

    // Check if in mock/demo mode
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID

    if (mockMode && mockTeacherId) {
      // Use mock teacher ID for demo mode
      userId = mockTeacherId
    } else {
      // Production: require authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }
      userId = user.id
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')

    // Build query to fetch conversations with enriched data including participants
    let query = supabase
      .from('conversations')
      .select(`
        *,
        student:students!student_id (
          id,
          name,
          student_id,
          profile_photo
        ),
        class:classes!class_id (
          id,
          name
        ),
        messages:conversation_messages (
          id,
          content,
          sender_name,
          sender_type,
          created_at,
          read
        ),
        participants:conversation_participants (
          id,
          participant_type,
          participant_name,
          last_read_at,
          created_at
        )
      `)
      .order('last_message_at', { ascending: false })
      .eq('teacher_id', userId)

    // Filter by student if provided
    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { data: conversations, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch conversations',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // Calculate unread count for each conversation and add class info to student
    const enrichedConversations = conversations?.map((conv) => ({
      ...conv,
      student: conv.student ? {
        ...conv.student,
        class_id: conv.class_id, // Add class_id from conversation
        class_name: conv.class?.name || '', // Add class_name from conversation's class
      } : undefined,
      unread_count: conv.messages?.filter((m) => !m.read && m.sender_type === 'parent').length || 0,
      latest_message: conv.messages?.[0] || null,
    })) || []

    return NextResponse.json({
      success: true,
      conversations: enrichedConversations,
      total: enrichedConversations.length,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/conversations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversations',
      },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Create new conversation
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    let userId: string

    // Check if in mock/demo mode
    const mockMode = process.env.NEXT_PUBLIC_PTM_MOCK_MODE === 'true'
    const mockTeacherId = process.env.NEXT_PUBLIC_PTM_MOCK_TEACHER_ID

    if (mockMode && mockTeacherId) {
      // Use mock teacher ID for demo mode
      userId = mockTeacherId
    } else {
      // Production: require authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }
      userId = user.id
    }

    const body = await request.json()
    const { student_id, class_id, subject, guardian_name, teacher_name } = body

    // Validate required fields
    if (!student_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student ID is required',
        },
        { status: 400 }
      )
    }

    if (!class_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Class ID is required',
        },
        { status: 400 }
      )
    }

    // Create conversation in database
    const { data: conversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        student_id,
        class_id,
        teacher_id: userId,
        subject: subject || null,
        status: 'active',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating conversation:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create conversation',
          details: insertError.message,
        },
        { status: 500 }
      )
    }

    // Create initial participants for the conversation
    if (guardian_name || teacher_name) {
      const participants = []

      if (guardian_name) {
        participants.push({
          conversation_id: conversation.id,
          participant_type: 'parent',
          participant_name: guardian_name,
        })
      }

      if (teacher_name) {
        participants.push({
          conversation_id: conversation.id,
          participant_type: 'teacher',
          participant_name: teacher_name,
        })
      }

      if (participants.length > 0) {
        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert(participants)

        if (participantsError) {
          console.error('Error creating participants:', participantsError)
          // Don't fail the whole request, just log the error
        }
      }
    }

    // Fetch the full enriched conversation with all joined data including participants
    const { data: enrichedConversation, error: fetchError } = await supabase
      .from('conversations')
      .select(`
        *,
        student:students!student_id (
          id,
          name,
          student_id,
          profile_photo
        ),
        class:classes!class_id (
          id,
          name
        ),
        messages:conversation_messages (
          id,
          content,
          sender_name,
          sender_type,
          created_at,
          read
        ),
        participants:conversation_participants (
          id,
          participant_type,
          participant_name,
          last_read_at,
          created_at
        )
      `)
      .eq('id', conversation.id)
      .single()

    if (fetchError) {
      console.error('Error fetching enriched conversation:', fetchError)
      // Return basic conversation even if enrichment fails
      return NextResponse.json(
        {
          success: true,
          conversation: { id: conversation.id },
        },
        { status: 201 }
      )
    }

    // Add class info to student object
    const finalConversation = {
      ...enrichedConversation,
      student: enrichedConversation.student ? {
        ...enrichedConversation.student,
        class_id: enrichedConversation.class_id,
        class_name: enrichedConversation.class?.name || '',
      } : undefined,
    }

    return NextResponse.json(
      {
        success: true,
        conversation: finalConversation,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/conversations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create conversation',
      },
      { status: 500 }
    )
  }
}
