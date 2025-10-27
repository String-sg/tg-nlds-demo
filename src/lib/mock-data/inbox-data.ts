// Mock data for Inbox

import type {
  InboxView,
  ConversationGroup,
  ConversationThread,
  StudentInfo,
  Alert,
  ConversationMetadata,
  LinkedResource,
} from '@/types/inbox'
import type { Message, Participant } from '@/types/chat'

// Inbox Views
export const inboxViews: InboxView[] = [
  { id: 'inbox', name: 'Your inbox', icon: '📥', count: 4 },
  { id: 'needs-reply', name: 'Needs reply', icon: '📌', count: 3 },
  { id: 'mentions', name: 'Mentions', icon: '@', count: 0 },
  { id: 'created', name: 'Created by you', icon: '✏️', count: 3 },
  { id: 'all', name: 'All', icon: '👥', count: 17 },
  { id: 'unassigned', name: 'Unassigned', icon: '📋', count: 6 },
]

export const classViews: InboxView[] = [
  { id: 'active', name: 'Class 5A', icon: '🎓', count: 8 },
  { id: 'active', name: 'Class 4B', icon: '🎓', count: 4 },
  { id: 'active', name: 'Class 3C', icon: '🎓', count: 2 },
]

export const priorityViews: InboxView[] = [
  { id: 'urgent', name: 'Urgent', icon: '🔥', count: 3, color: 'red' },
  { id: 'follow-up', name: 'Follow up', icon: '⏰', count: 2, color: 'yellow' },
  { id: 'resolved', name: 'Resolved', icon: '✅', count: 12, color: 'green' },
]

export const statusViews: InboxView[] = [
  { id: 'active', name: 'Active', icon: '🟢', count: 15 },
  { id: 'archived', name: 'Archive', icon: '📦', count: 8 },
]

// Student Info
const students: Record<string, StudentInfo> = {
  'student-1': {
    id: 'student-1',
    name: 'Bryan Yeo',
    class: '5A',
    recentGrade: 'B-',
    attendance: 95,
    alerts: [
      {
        id: 'alert-1',
        type: 'academic',
        severity: 'high',
        message: 'Math assistance needed',
        createdAt: new Date('2025-10-09T10:00:00'),
      },
    ],
  },
  'student-2': {
    id: 'student-2',
    name: 'Emily Tan',
    class: '4B',
    recentGrade: 'A',
    attendance: 98,
    alerts: [],
  },
  'student-3': {
    id: 'student-3',
    name: 'David Chen',
    class: '5A',
    recentGrade: 'B+',
    attendance: 92,
    alerts: [
      {
        id: 'alert-2',
        type: 'behavioral',
        severity: 'medium',
        message: 'Additional support recommended',
        createdAt: new Date('2025-10-07T14:00:00'),
      },
    ],
  },
  'student-4': {
    id: 'student-4',
    name: 'Aisha Kumar',
    class: '3C',
    recentGrade: 'A',
    attendance: 100,
    alerts: [],
  },
  'student-5': {
    id: 'student-5',
    name: 'Sofia Tan',
    class: '5A',
    recentGrade: 'B',
    attendance: 94,
    alerts: [],
  },
}

// Participants
const createParticipant = (
  userId: string,
  name: string,
  studentId: string,
  role: 'teacher' | 'parent' = 'parent'
): Participant => ({
  userId,
  name,
  role,
  studentId,
  joinedAt: new Date('2025-09-01'),
})

const participants: Record<string, Participant> = {
  'parent-1': createParticipant('parent-1', 'Mrs. Yeo', 'student-1'),
  'parent-2': createParticipant('parent-2', 'Mrs. Tan', 'student-2'),
  'parent-3': createParticipant('parent-3', 'Mr. Chen', 'student-3'),
  'parent-4': createParticipant('parent-4', 'Mrs. Chen', 'student-3'),
  'parent-5': createParticipant('parent-5', 'Mr. Kumar', 'student-4'),
  'parent-6': createParticipant('parent-6', 'Mrs. Sofia', 'student-5'),
  teacher: createParticipant('teacher-1', 'You', 'teacher-1', 'teacher'),
}

// Linked Resources
const linkedResources: LinkedResource[] = [
  {
    id: 'resource-1',
    type: 'student_profile',
    title: 'Student Profile',
    url: '/students/student-1',
    icon: '👤',
  },
  {
    id: 'resource-2',
    type: 'grade_report',
    title: 'Grade Report',
    url: '/reports/student-1',
    icon: '📊',
  },
  {
    id: 'resource-3',
    type: 'meeting_notes',
    title: 'Parent Meeting Notes',
    url: '/meetings/student-1',
    icon: '📝',
  },
]

// Messages
const createMessage = (
  id: string,
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: 'teacher' | 'parent',
  content: string,
  hoursAgo: number
): Message => ({
  id,
  conversationId,
  senderId,
  senderName,
  senderRole,
  type: 'text',
  content,
  attachments: [],
  sentAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
  status: 'delivered',
  readBy: [],
})

// Conversation 1: Bryan Yeo (Urgent - needs reply)
const conversation1: ConversationThread = {
  id: 'conv-1',
  type: '1:1',
  participants: [participants['parent-1'], participants.teacher],
  studentContext: {
    studentId: 'student-1',
    studentName: 'Bryan Yeo',
    className: '5A',
  },
  lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  unreadCount: 1,
  isPinned: false,
  isArchived: false,
  isMuted: false,
  createdAt: new Date('2025-10-09T14:30:00'),
  messages: [
    createMessage(
      'msg-1',
      'conv-1',
      'teacher-1',
      'You',
      'teacher',
      "Dear Mrs. Yeo, I wanted to discuss Bryan's recent Math performance. He's been struggling with fractions.",
      6
    ),
    createMessage(
      'msg-2',
      'conv-1',
      'parent-1',
      'Mrs. Yeo',
      'parent',
      'Thank you for reaching out, Mdm Loh. We noticed this too. What can we do to help him improve?',
      5
    ),
    createMessage(
      'msg-3',
      'conv-1',
      'teacher-1',
      'You',
      'teacher',
      'I recommend practicing with him for 15 minutes daily. I can share some worksheets if that helps.',
      4
    ),
    createMessage(
      'msg-4',
      'conv-1',
      'parent-1',
      'Mrs. Yeo',
      'parent',
      'Thank you for the update. We will work with him on this.',
      2
    ),
  ],
  metadata: {
    subject: 'Math Performance Concerns',
    topic: 'Mathematics',
    priority: 'urgent',
    status: 'active',
    assignee: 'Jane Smith',
    team: 'Class 5A',
    tags: ['math', 'academic'],
    linkedResources,
  },
  lastMessage: createMessage(
    'msg-4',
    'conv-1',
    'parent-1',
    'Mrs. Yeo',
    'parent',
    'Thank you for the update. We will work with him on this.',
    2
  ),
}

// Conversation 2: Emily Tan (Recent - has files)
const conversation2: ConversationThread = {
  id: 'conv-2',
  type: '1:1',
  participants: [participants['parent-2'], participants.teacher],
  studentContext: {
    studentId: 'student-2',
    studentName: 'Emily Tan',
    className: '4B',
  },
  lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  unreadCount: 2,
  isPinned: true,
  isArchived: false,
  isMuted: false,
  createdAt: new Date('2025-10-08T10:00:00'),
  messages: [
    createMessage(
      'msg-5',
      'conv-2',
      'teacher-1',
      'You',
      'teacher',
      'Hi Mrs. Tan, I wanted to share Emily\'s progress report with you.',
      48
    ),
    createMessage(
      'msg-6',
      'conv-2',
      'parent-2',
      'Mrs. Tan',
      'parent',
      'Thank you! We are very proud of her progress.',
      24
    ),
  ],
  metadata: {
    subject: 'Progress Report',
    topic: 'General',
    priority: 'follow-up',
    status: 'active',
    assignee: 'Jane Smith',
    team: 'Class 4B',
    tags: ['report', 'progress'],
    linkedResources: linkedResources.slice(0, 2),
  },
  lastMessage: createMessage(
    'msg-6',
    'conv-2',
    'parent-2',
    'Mrs. Tan',
    'parent',
    'Thank you! We are very proud of her progress.',
    24
  ),
}

// Conversation 3: David Chen (Group conversation - needs reply)
const conversation3: ConversationThread = {
  id: 'conv-3',
  type: 'group',
  participants: [participants['parent-3'], participants['parent-4'], participants.teacher],
  groupName: "David's Support Team",
  studentContext: {
    studentId: 'student-3',
    studentName: 'David Chen',
    className: '5A',
  },
  lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  unreadCount: 1,
  isPinned: false,
  isArchived: false,
  isMuted: false,
  createdAt: new Date('2025-10-07T09:00:00'),
  messages: [
    createMessage(
      'msg-7',
      'conv-3',
      'teacher-1',
      'You',
      'teacher',
      'Hello both, I wanted to discuss David\'s progress and how we can support him better.',
      72
    ),
    createMessage(
      'msg-8',
      'conv-3',
      'parent-3',
      'Mr. Chen',
      'parent',
      'Thank you for bringing this up. We would like to schedule a meeting.',
      48
    ),
    createMessage(
      'msg-9',
      'conv-3',
      'parent-4',
      'Mrs. Chen',
      'parent',
      'Yes, we agree. When can we schedule this?',
      48
    ),
  ],
  metadata: {
    subject: 'Support Meeting',
    topic: 'General',
    priority: 'urgent',
    status: 'active',
    assignee: 'Jane Smith',
    team: 'Class 5A',
    tags: ['meeting', 'support'],
    linkedResources: linkedResources.slice(0, 3),
  },
  lastMessage: createMessage(
    'msg-9',
    'conv-3',
    'parent-4',
    'Mrs. Chen',
    'parent',
    'Yes, we agree. When can we schedule this?',
    48
  ),
}

// Conversation 4: Aisha Kumar (Resolved - no reply needed)
const conversation4: ConversationThread = {
  id: 'conv-4',
  type: '1:1',
  participants: [participants['parent-5'], participants.teacher],
  studentContext: {
    studentId: 'student-4',
    studentName: 'Aisha Kumar',
    className: '3C',
  },
  lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  unreadCount: 0,
  isPinned: false,
  isArchived: false,
  isMuted: false,
  createdAt: new Date('2025-10-06T11:00:00'),
  messages: [
    createMessage(
      'msg-10',
      'conv-4',
      'parent-5',
      'Mr. Kumar',
      'parent',
      'Hi, how is Aisha doing in class?',
      96
    ),
    createMessage(
      'msg-11',
      'conv-4',
      'teacher-1',
      'You',
      'teacher',
      'Aisha did exceptionally well on her Math test! She scored 98%.',
      72
    ),
    createMessage(
      'msg-12',
      'conv-4',
      'parent-5',
      'Mr. Kumar',
      'parent',
      'That\'s wonderful news! Thank you for letting us know.',
      72
    ),
  ],
  metadata: {
    subject: 'Academic Performance',
    topic: 'Mathematics',
    priority: 'resolved',
    status: 'resolved',
    team: 'Class 3C',
    tags: ['math', 'excellent'],
    linkedResources: linkedResources.slice(0, 1),
  },
  lastMessage: createMessage(
    'msg-12',
    'conv-4',
    'parent-5',
    'Mr. Kumar',
    'parent',
    'That\'s wonderful news! Thank you for letting us know.',
    72
  ),
}

// Conversation 5: Sofia Tan (Active)
const conversation5: ConversationThread = {
  id: 'conv-5',
  type: '1:1',
  participants: [participants['parent-6'], participants.teacher],
  studentContext: {
    studentId: 'student-5',
    studentName: 'Sofia Tan',
    className: '5A',
  },
  lastMessageAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  unreadCount: 0,
  isPinned: false,
  isArchived: false,
  isMuted: false,
  createdAt: new Date('2025-10-05T14:00:00'),
  messages: [
    createMessage(
      'msg-13',
      'conv-5',
      'teacher-1',
      'You',
      'teacher',
      'Hello Mrs. Sofia, Sofia has been doing well in class. Keep up the good work!',
      96
    ),
    createMessage(
      'msg-14',
      'conv-5',
      'parent-6',
      'Mrs. Sofia',
      'parent',
      'Thank you so much! We appreciate your support.',
      96
    ),
  ],
  metadata: {
    subject: 'General Update',
    topic: 'General',
    priority: 'active',
    status: 'active',
    team: 'Class 5A',
    tags: ['update'],
    linkedResources: [],
  },
  lastMessage: createMessage(
    'msg-14',
    'conv-5',
    'parent-6',
    'Mrs. Sofia',
    'parent',
    'Thank you so much! We appreciate your support.',
    96
  ),
}

// =============================================================================
// DEPRECATED: Conversation Groups (Mock Data)
// =============================================================================
// ⚠️ DEPRECATED: This mock conversation data is NO LONGER USED by the inbox.
//
// The inbox now uses real database data from the `conversations` and
// `conversation_messages` tables. See:
// - Migration: supabase/migrations/20251027112648_create_conversations_tables.sql
// - Hook: src/hooks/use-inbox-conversations.ts
// - API: src/app/api/conversations/route.ts
//
// This data is kept for reference only and may be removed in the future.
// Last used: October 27, 2025 (before database migration)
// =============================================================================

/**
 * @deprecated Use `useInboxConversations()` hook to fetch real conversations from database
 */
export const conversationGroups: ConversationGroup[] = [
  {
    student: students['student-1'],
    threads: [conversation1],
    priority: 'urgent',
    unreadCount: 1,
    lastActivityAt: conversation1.lastMessageAt,
    needsReply: true,
  },
  {
    student: students['student-2'],
    threads: [conversation2],
    priority: 'follow-up',
    unreadCount: 2,
    lastActivityAt: conversation2.lastMessageAt,
    needsReply: false,
  },
  {
    student: students['student-3'],
    threads: [conversation3],
    priority: 'urgent',
    unreadCount: 1,
    lastActivityAt: conversation3.lastMessageAt,
    needsReply: true,
  },
  {
    student: students['student-4'],
    threads: [conversation4],
    priority: 'resolved',
    unreadCount: 0,
    lastActivityAt: conversation4.lastMessageAt,
    needsReply: false,
  },
  {
    student: students['student-5'],
    threads: [conversation5],
    priority: 'active',
    unreadCount: 0,
    lastActivityAt: conversation5.lastMessageAt,
    needsReply: false,
  },
]

// =============================================================================
// DEPRECATED: Helper Functions
// =============================================================================

/**
 * @deprecated Use `useInboxConversations()` hook and filter the results instead
 */
export function getConversationGroup(conversationId: string): ConversationGroup | undefined {
  return conversationGroups.find((group) => group.threads.some((t) => t.id === conversationId))
}

/**
 * @deprecated Use `useConversationMessages(conversationId)` hook to fetch real messages
 */
export function getConversationThread(conversationId: string): ConversationThread | undefined {
  for (const group of conversationGroups) {
    const thread = group.threads.find((t) => t.id === conversationId)
    if (thread) return thread
  }
  return undefined
}

/**
 * @deprecated Use `useInboxConversations()` and filter by priority in your component
 */
export function filterConversationsByPriority(priority: string): ConversationGroup[] {
  return conversationGroups.filter((group) => group.priority === priority)
}

/**
 * @deprecated Use `useInboxConversations()` and implement view filtering in your component
 */
export function getConversationsByView(viewType: string): ConversationGroup[] {
  switch (viewType) {
    case 'inbox':
      return conversationGroups.filter((g) => !g.threads[0].isArchived)
    case 'needs-reply':
      return conversationGroups.filter((g) => g.needsReply)
    case 'all':
      return conversationGroups
    case 'urgent':
      return conversationGroups.filter((g) => g.priority === 'urgent')
    case 'follow-up':
      return conversationGroups.filter((g) => g.priority === 'follow-up')
    case 'resolved':
      return conversationGroups.filter((g) => g.priority === 'resolved')
    case 'active':
      return conversationGroups.filter((g) => g.priority === 'active')
    default:
      return conversationGroups
  }
}
