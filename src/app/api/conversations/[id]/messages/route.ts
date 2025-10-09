import { NextResponse } from 'next/server'
import { getConversationMessages } from '@/lib/mock-data/chat-data'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/conversations/[id]/messages - Get messages for a conversation
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const messages = getConversationMessages(id)

    return NextResponse.json({
      success: true,
      data: messages,
      total: messages.length,
    })
  } catch (error) {
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
    const { id } = await context.params
    const body = await request.json()
    const { content, attachments } = body

    // Validate
    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message content or attachments are required',
        },
        { status: 400 }
      )
    }

    // TODO: Save message to database
    // For now, return mock response
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId: id,
      senderId: 'current-user-id', // TODO: Get from auth
      senderName: 'Current User',
      senderRole: 'teacher',
      type: attachments && attachments.length > 0 ? 'file' : 'text',
      content,
      attachments: attachments || [],
      sentAt: new Date().toISOString(),
      status: 'sent',
      readBy: [],
    }

    return NextResponse.json(
      {
        success: true,
        data: newMessage,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send message',
      },
      { status: 500 }
    )
  }
}
