import type { Conversation, Message } from '@/types/chat'

// Mock conversations data
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: '1:1',
    participants: [
      {
        userId: 'teacher-1',
        role: 'teacher',
        studentId: 'student-1',
        name: 'Mdm Amanda Loh',
        avatar: '/avatars/amanda.jpg',
        joinedAt: new Date('2025-10-01'),
      },
      {
        userId: 'parent-1',
        role: 'parent',
        studentId: 'student-1',
        name: 'Mrs. Yeo',
        avatar: '/avatars/mrs-yeo.jpg',
        joinedAt: new Date('2025-10-01'),
      },
    ],
    studentContext: {
      studentId: 'student-1',
      studentName: 'Bryan Yeo',
      className: '5A',
    },
    lastMessage: {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'parent-1',
      senderName: 'Mrs. Yeo',
      senderRole: 'parent',
      type: 'text',
      content: 'Thank you for the update. We will work with him on this.',
      attachments: [],
      sentAt: new Date('2025-10-09T15:30:00'),
      status: 'delivered',
      readBy: [],
    },
    lastMessageAt: new Date('2025-10-09T15:30:00'),
    unreadCount: 0,
    isPinned: true,
    isArchived: false,
    isMuted: false,
    createdAt: new Date('2025-10-01'),
  },
  {
    id: 'conv-2',
    type: '1:1',
    participants: [
      {
        userId: 'teacher-2',
        role: 'teacher',
        studentId: 'student-2',
        name: 'Mr. Ethan Lim',
        avatar: '/avatars/ethan.jpg',
        joinedAt: new Date('2025-10-05'),
      },
      {
        userId: 'parent-2',
        role: 'parent',
        studentId: 'student-2',
        name: 'Mrs. Tan',
        avatar: '/avatars/mrs-tan.jpg',
        joinedAt: new Date('2025-10-05'),
      },
    ],
    studentContext: {
      studentId: 'student-2',
      studentName: 'Emily Tan',
      className: '4B',
    },
    lastMessage: {
      id: 'msg-5',
      conversationId: 'conv-2',
      senderId: 'teacher-2',
      senderName: 'Mr. Ethan Lim',
      senderRole: 'teacher',
      type: 'file',
      content: 'Here is the permission slip for the field trip.',
      attachments: [
        {
          id: 'file-1',
          fileName: 'Permission_Slip_ScienceCentre.pdf',
          fileType: 'application/pdf',
          fileSize: 245000,
          fileUrl: '/files/permission-slip.pdf',
        },
      ],
      sentAt: new Date('2025-10-09T10:15:00'),
      status: 'delivered',
      readBy: [
        {
          userId: 'parent-2',
          readAt: new Date('2025-10-09T10:20:00'),
        },
      ],
    },
    lastMessageAt: new Date('2025-10-09T10:15:00'),
    unreadCount: 2,
    isPinned: false,
    isArchived: false,
    isMuted: false,
    createdAt: new Date('2025-10-05'),
  },
  {
    id: 'conv-3',
    type: 'group',
    participants: [
      {
        userId: 'teacher-1',
        role: 'teacher',
        studentId: 'student-3',
        name: 'Ms. Ling Ling',
        avatar: '/avatars/ling.jpg',
        joinedAt: new Date('2025-10-08'),
      },
      {
        userId: 'teacher-2',
        role: 'teacher',
        studentId: 'student-3',
        name: 'Mr. Ethan Lim',
        avatar: '/avatars/ethan.jpg',
        joinedAt: new Date('2025-10-08'),
      },
      {
        userId: 'parent-3',
        role: 'parent',
        studentId: 'student-3',
        name: 'Mrs. Chen',
        avatar: '/avatars/mrs-chen.jpg',
        joinedAt: new Date('2025-10-08'),
      },
    ],
    groupName: "David's Support Team",
    studentContext: {
      studentId: 'student-3',
      studentName: 'David Chen',
      className: '5A',
    },
    lastMessage: {
      id: 'msg-8',
      conversationId: 'conv-3',
      senderId: 'parent-3',
      senderName: 'Mrs. Chen',
      senderRole: 'parent',
      type: 'text',
      content: 'Thank you both for your support. When can we schedule a meeting?',
      attachments: [],
      sentAt: new Date('2025-10-08T16:45:00'),
      status: 'delivered',
      readBy: [],
    },
    lastMessageAt: new Date('2025-10-08T16:45:00'),
    unreadCount: 1,
    isPinned: false,
    isArchived: false,
    isMuted: false,
    createdAt: new Date('2025-10-08'),
  },
  {
    id: 'conv-4',
    type: '1:1',
    participants: [
      {
        userId: 'teacher-3',
        role: 'teacher',
        studentId: 'student-4',
        name: 'Mrs. Sarah Wong',
        avatar: '/avatars/sarah.jpg',
        joinedAt: new Date('2025-10-07'),
      },
      {
        userId: 'parent-4',
        role: 'parent',
        studentId: 'student-4',
        name: 'Mr. Kumar',
        avatar: '/avatars/mr-kumar.jpg',
        joinedAt: new Date('2025-10-07'),
      },
    ],
    studentContext: {
      studentId: 'student-4',
      studentName: 'Aisha Kumar',
      className: '3C',
    },
    lastMessage: {
      id: 'msg-10',
      conversationId: 'conv-4',
      senderId: 'teacher-3',
      senderName: 'Mrs. Sarah Wong',
      senderRole: 'teacher',
      type: 'text',
      content: "Aisha did exceptionally well on her Math test! She scored 95%.",
      attachments: [],
      sentAt: new Date('2025-10-07T14:20:00'),
      status: 'delivered',
      readBy: [
        {
          userId: 'parent-4',
          readAt: new Date('2025-10-07T14:25:00'),
        },
      ],
    },
    lastMessageAt: new Date('2025-10-07T14:20:00'),
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
    isMuted: false,
    createdAt: new Date('2025-10-07'),
  },
]

// Mock messages for each conversation
export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'teacher-1',
      senderName: 'Mdm Amanda Loh',
      senderRole: 'teacher',
      type: 'text',
      content:
        "Dear Mrs. Yeo, I wanted to discuss Bryan's recent Math performance. He's been struggling with fractions.",
      attachments: [],
      sentAt: new Date('2025-10-09T14:30:00'),
      status: 'delivered',
      readBy: [
        {
          userId: 'parent-1',
          readAt: new Date('2025-10-09T14:35:00'),
        },
      ],
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'parent-1',
      senderName: 'Mrs. Yeo',
      senderRole: 'parent',
      type: 'text',
      content:
        'Thank you for reaching out, Mdm Loh. We noticed this too. What can we do to help him improve?',
      attachments: [],
      sentAt: new Date('2025-10-09T15:00:00'),
      status: 'delivered',
      readBy: [
        {
          userId: 'teacher-1',
          readAt: new Date('2025-10-09T15:05:00'),
        },
      ],
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'teacher-1',
      senderName: 'Mdm Amanda Loh',
      senderRole: 'teacher',
      type: 'text',
      content:
        'I recommend practicing with him for 15 minutes daily. I can share some worksheets if that helps.',
      attachments: [],
      sentAt: new Date('2025-10-09T15:15:00'),
      status: 'delivered',
      readBy: [],
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'parent-1',
      senderName: 'Mrs. Yeo',
      senderRole: 'parent',
      type: 'text',
      content: 'Thank you for the update. We will work with him on this.',
      attachments: [],
      sentAt: new Date('2025-10-09T15:30:00'),
      status: 'delivered',
      readBy: [],
    },
  ],
  'conv-2': [
    {
      id: 'msg-5',
      conversationId: 'conv-2',
      senderId: 'teacher-2',
      senderName: 'Mr. Ethan Lim',
      senderRole: 'teacher',
      type: 'file',
      content: 'Here is the permission slip for the field trip.',
      attachments: [
        {
          id: 'file-1',
          fileName: 'Permission_Slip_ScienceCentre.pdf',
          fileType: 'application/pdf',
          fileSize: 245000,
          fileUrl: '/files/permission-slip.pdf',
        },
      ],
      sentAt: new Date('2025-10-09T10:15:00'),
      status: 'delivered',
      readBy: [
        {
          userId: 'parent-2',
          readAt: new Date('2025-10-09T10:20:00'),
        },
      ],
    },
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'parent-2',
      senderName: 'Mrs. Tan',
      senderRole: 'parent',
      type: 'text',
      content: "Thank you Mr Lim. I'll sign and return tomorrow.",
      attachments: [],
      sentAt: new Date('2025-10-09T10:30:00'),
      status: 'sent',
      readBy: [],
    },
  ],
  'conv-3': [
    {
      id: 'msg-7',
      conversationId: 'conv-3',
      senderId: 'teacher-1',
      senderName: 'Ms. Ling Ling',
      senderRole: 'teacher',
      type: 'text',
      content:
        "Dear Mrs. Chen and Mr Ethan, I wanted to create this group to discuss David's progress across subjects.",
      attachments: [],
      sentAt: new Date('2025-10-08T16:00:00'),
      status: 'delivered',
      readBy: [
        {
          userId: 'parent-3',
          readAt: new Date('2025-10-08T16:10:00'),
        },
        {
          userId: 'teacher-2',
          readAt: new Date('2025-10-08T16:05:00'),
        },
      ],
    },
    {
      id: 'msg-8',
      conversationId: 'conv-3',
      senderId: 'parent-3',
      senderName: 'Mrs. Chen',
      senderRole: 'parent',
      type: 'text',
      content: 'Thank you both for your support. When can we schedule a meeting?',
      attachments: [],
      sentAt: new Date('2025-10-08T16:45:00'),
      status: 'delivered',
      readBy: [],
    },
  ],
  'conv-4': [
    {
      id: 'msg-9',
      conversationId: 'conv-4',
      senderId: 'teacher-3',
      senderName: 'Mrs. Sarah Wong',
      senderRole: 'teacher',
      type: 'text',
      content: "Dear Mr Kumar, I wanted to share some good news about Aisha's progress.",
      attachments: [],
      sentAt: new Date('2025-10-07T14:15:00'),
      status: 'delivered',
      readBy: [
        {
          userId: 'parent-4',
          readAt: new Date('2025-10-07T14:25:00'),
        },
      ],
    },
    {
      id: 'msg-10',
      conversationId: 'conv-4',
      senderId: 'teacher-3',
      senderName: 'Mrs. Sarah Wong',
      senderRole: 'teacher',
      type: 'text',
      content: "Aisha did exceptionally well on her Math test! She scored 95%.",
      attachments: [],
      sentAt: new Date('2025-10-07T14:20:00'),
      status: 'delivered',
      readBy: [
        {
          userId: 'parent-4',
          readAt: new Date('2025-10-07T14:25:00'),
        },
      ],
    },
  ],
}

// Helper function to get conversations with filters
export function getFilteredConversations(
  showUnreadOnly: boolean = false,
  searchQuery: string = ''
): Conversation[] {
  let filtered = [...mockConversations]

  if (showUnreadOnly) {
    filtered = filtered.filter((conv) => conv.unreadCount > 0)
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (conv) =>
        conv.studentContext.studentName.toLowerCase().includes(query) ||
        conv.participants.some((p) => p.name.toLowerCase().includes(query)) ||
        conv.lastMessage?.content.toLowerCase().includes(query)
    )
  }

  return filtered.sort((a, b) => {
    // Pinned conversations first
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    // Then sort by last message date
    return b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  })
}

// Helper function to get messages for a conversation
export function getConversationMessages(conversationId: string): Message[] {
  return mockMessages[conversationId] || []
}

// Helper function to get a single conversation
export function getConversation(conversationId: string): Conversation | undefined {
  return mockConversations.find((conv) => conv.id === conversationId)
}
