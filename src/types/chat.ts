// Chat Type Definitions

export type ConversationType = '1:1' | 'group'
export type MessageType = 'text' | 'file' | 'system'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed'
export type UserRole = 'teacher' | 'parent'

export interface Participant {
  userId: string
  role: UserRole
  studentId: string
  name: string
  avatar?: string
  joinedAt: Date
}

export interface StudentContext {
  studentId: string
  studentName: string
  className?: string
}

export interface Conversation {
  id: string
  type: ConversationType
  participants: Participant[]
  groupName?: string
  studentContext: StudentContext
  lastMessage?: Message
  lastMessageAt: Date
  unreadCount: number
  isPinned: boolean
  isArchived: boolean
  isMuted: boolean
  createdAt: Date
}

export interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  thumbnailUrl?: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: UserRole
  type: MessageType
  content: string
  attachments: Attachment[]
  sentAt: Date
  status: MessageStatus
  readBy: Array<{ userId: string; readAt: Date }>
}

export interface ConversationListFilter {
  showUnreadOnly: boolean
  searchQuery: string
  sortBy: 'date' | 'student'
}

export interface NewConversationData {
  participantIds: string[]
  studentId: string
  groupName?: string
  initialMessage?: string
}
