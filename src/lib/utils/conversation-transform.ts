import type { EnrichedConversation, DbMessage } from '@/types/inbox'
import type { ConversationGroup, StudentInfo, ConversationThread, Priority } from '@/types/inbox'
import type { Conversation, Message, Participant } from '@/types/chat'

/**
 * Transforms database conversations into ConversationGroup format for the inbox UI
 *
 * Groups conversations by student and transforms the data structure to match
 * the existing UI expectations.
 */
export function transformToConversationGroups(
  dbConversations: EnrichedConversation[]
): ConversationGroup[] {
  // Group conversations by student_id
  const groupedByStudent = dbConversations.reduce((acc, conv) => {
    const studentId = conv.student_id
    if (!acc[studentId]) {
      acc[studentId] = []
    }
    acc[studentId].push(conv)
    return acc
  }, {} as Record<string, EnrichedConversation[]>)

  // Transform each group into ConversationGroup format
  return Object.entries(groupedByStudent).map(([studentId, conversations]) => {
    const firstConv = conversations[0]

    // Build student info from the first conversation
    const student: StudentInfo = {
      id: studentId,
      name: firstConv.student?.name || 'Unknown Student',
      class: firstConv.student?.class_name || '',
      class_id: firstConv.student?.class_id || '',
      class_name: firstConv.student?.class_name || '',
      avatar: undefined,
      recentGrade: undefined,
      attendance: undefined,
      alerts: [],
    }

    // Transform each conversation into a thread
    const threads: ConversationThread[] = conversations.map((conv) =>
      transformConversationToThread(conv)
    )

    // Determine priority from conversations
    const priority: Priority = determinePriority(conversations)

    // Calculate unread count
    const unreadCount = conversations.reduce(
      (sum, conv) => sum + (conv.unread_count || 0),
      0
    )

    // Get latest activity timestamp
    const lastActivityAt = new Date(
      Math.max(...conversations.map((c) => new Date(c.last_message_at).getTime()))
    )

    // Check if any conversation needs reply (has unread parent messages)
    const needsReply = unreadCount > 0

    return {
      student,
      threads,
      priority,
      unreadCount,
      lastActivityAt,
      needsReply,
    }
  })
}

/**
 * Transforms a single database conversation into a ConversationThread
 */
function transformConversationToThread(conv: EnrichedConversation): ConversationThread {
  // Build participants list from database participants or fallback to messages
  const participants: Participant[] = []

  // Use participants from database if available
  if (conv.participants && conv.participants.length > 0) {
    conv.participants.forEach((p) => {
      participants.push({
        userId: p.participant_type === 'teacher' ? conv.teacher_id : 'parent-' + conv.student_id,
        role: p.participant_type === 'teacher' ? 'teacher' : 'parent',
        studentId: conv.student_id,
        name: p.participant_name,
        avatar: undefined,
        joinedAt: new Date(p.created_at),
      })
    })
  } else {
    // Fallback: Add teacher participant
    participants.push({
      userId: conv.teacher_id,
      role: 'teacher',
      studentId: conv.student_id,
      name: 'Teacher', // TODO: Get actual teacher name
      avatar: undefined,
      joinedAt: new Date(conv.created_at),
    })

    // Add parent participant (inferred from messages)
    const parentMessages = conv.messages?.filter((m) => m.sender_type === 'parent')
    if (parentMessages && parentMessages.length > 0) {
      const parentName = parentMessages[0].sender_name
      participants.push({
        userId: 'parent-' + conv.student_id,
        role: 'parent',
        studentId: conv.student_id,
        name: parentName,
        avatar: undefined,
        joinedAt: new Date(conv.created_at),
      })
    }
  }

  // Transform messages
  const messages: Message[] = (conv.messages || []).map(transformDbMessage)

  // Build base conversation
  const baseConversation: Conversation = {
    id: conv.id,
    type: '1:1', // Always 1:1 for parent-teacher chats
    participants,
    studentContext: {
      studentId: conv.student_id,
      studentName: conv.student?.name || 'Unknown',
      className: conv.student?.class_name,
    },
    lastMessage: messages[messages.length - 1],
    lastMessageAt: new Date(conv.last_message_at),
    unreadCount: conv.unread_count || 0,
    isPinned: false,
    isArchived: conv.status === 'archived',
    isMuted: false,
    createdAt: new Date(conv.created_at),
  }

  // Build conversation thread
  const thread: ConversationThread = {
    ...baseConversation,
    messages,
    metadata: {
      subject: conv.subject || undefined,
      priority: mapStatusToPriority(conv.status),
      status: conv.status === 'archived' ? 'archived' : 'active',
      assignee: undefined,
      team: undefined,
      tags: [],
      linkedResources: [],
    },
  }

  return thread
}

/**
 * Transforms a database message into the Message format expected by the UI
 */
function transformDbMessage(dbMessage: DbMessage): Message {
  return {
    id: dbMessage.id,
    conversationId: dbMessage.conversation_id,
    senderId: dbMessage.sender_type === 'teacher' ? 'teacher' : 'parent',
    senderName: dbMessage.sender_name,
    senderRole: dbMessage.sender_type,
    type: 'text',
    content: dbMessage.content,
    attachments: [],
    sentAt: new Date(dbMessage.created_at),
    status: 'delivered',
    readBy: dbMessage.read
      ? [{ userId: 'current-user', readAt: new Date(dbMessage.created_at) }]
      : [],
  }
}

/**
 * Determines the overall priority for a group of conversations
 */
function determinePriority(conversations: EnrichedConversation[]): Priority {
  // If any conversation is unresolved and has unread messages, it's urgent
  const hasUnreadActive = conversations.some(
    (c) => c.status === 'active' && (c.unread_count || 0) > 0
  )
  if (hasUnreadActive) return 'urgent'

  // If any conversation is active without unread, it's active
  const hasActive = conversations.some((c) => c.status === 'active')
  if (hasActive) return 'active'

  // If all conversations are resolved, it's resolved
  const allResolved = conversations.every((c) => c.status === 'resolved')
  if (allResolved) return 'resolved'

  // Default to follow-up
  return 'follow-up'
}

/**
 * Maps database conversation status to UI priority
 */
function mapStatusToPriority(status: string): Priority {
  switch (status) {
    case 'active':
      return 'active'
    case 'resolved':
      return 'resolved'
    case 'archived':
      return 'resolved'
    default:
      return 'active'
  }
}
