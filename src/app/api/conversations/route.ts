import { NextResponse } from 'next/server'
import { getFilteredConversations } from '@/lib/mock-data/chat-data'

// GET /api/conversations - List all conversations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const showUnreadOnly = searchParams.get('unreadOnly') === 'true'
    const searchQuery = searchParams.get('q') || ''

    const conversations = getFilteredConversations(showUnreadOnly, searchQuery)

    return NextResponse.json({
      success: true,
      data: conversations,
      total: conversations.length,
    })
  } catch (error) {
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
    const body = await request.json()
    const { participantIds, studentId, groupName, initialMessage } = body

    // Validate required fields
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Participant IDs are required',
        },
        { status: 400 }
      )
    }

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student ID is required',
        },
        { status: 400 }
      )
    }

    // TODO: Create conversation in database
    // For now, return mock response
    const newConversation = {
      id: `conv-${Date.now()}`,
      type: participantIds.length > 1 ? 'group' : '1:1',
      participants: participantIds,
      studentId,
      groupName,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: newConversation,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create conversation',
      },
      { status: 500 }
    )
  }
}
