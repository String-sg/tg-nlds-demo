// Inbox Type Definitions

import type { Conversation, Message, Participant } from './chat'

// Database-aligned types
export type ConversationStatus = 'active' | 'archived' | 'resolved'
export type Priority = 'urgent' | 'follow-up' | 'active' | 'resolved'
export type AlertSeverity = 'high' | 'medium' | 'low'
export type AlertType = 'academic' | 'behavioral' | 'attendance' | 'health'
export type ViewType =
  | 'inbox'
  | 'needs-reply'
  | 'mentions'
  | 'created'
  | 'all'
  | 'unassigned'
  | 'urgent'
  | 'follow-up'
  | 'resolved'
  | 'active'
  | 'archived'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  message: string
  createdAt: Date
}

export interface StudentInfo {
  id: string
  name: string
  class: string // For backward compatibility with mock data
  class_id?: string // Real class ID from database
  class_name?: string // Real class name from database
  avatar?: string
  recentGrade?: string
  attendance?: number
  alerts: Alert[]
}

export interface LinkedResource {
  id: string
  type: 'student_profile' | 'grade_report' | 'meeting_notes' | 'document'
  title: string
  url: string
  icon: string
}

export interface ConversationMetadata {
  subject?: string
  topic?: string
  priority: Priority
  status: ConversationStatus
  assignee?: string
  team?: string
  tags: string[]
  linkedResources: LinkedResource[]
}

export interface ConversationThread extends Conversation {
  messages: Message[]
  metadata: ConversationMetadata
}

export interface ConversationGroup {
  student: StudentInfo
  threads: ConversationThread[]
  priority: Priority
  unreadCount: number
  lastActivityAt: Date
  needsReply: boolean
}

export interface InboxView {
  id: ViewType
  name: string
  icon: string
  count: number
  color?: string
}

export interface ConversationFilter {
  viewType?: ViewType
  classId?: string
  priority?: Priority
  status?: ConversationStatus
  searchQuery?: string
}

// =====================================================
// Database-Aligned Types (from new schema)
// =====================================================

// Database conversation record (matches conversations table)
export interface DbConversation {
  id: string
  student_id: string
  class_id: string
  teacher_id: string
  status: ConversationStatus
  subject?: string | null
  last_message_at: string
  created_at: string
  updated_at: string
}

// Database message record (matches conversation_messages table)
export interface DbMessage {
  id: string
  conversation_id: string
  sender_type: 'teacher' | 'parent'
  sender_name: string
  content: string
  read: boolean
  created_at: string
}

// Database participant record (matches conversation_participants table)
export interface DbParticipant {
  id: string
  conversation_id: string
  participant_type: 'teacher' | 'parent'
  participant_name: string
  last_read_at?: string | null
  created_at: string
}

// Enriched conversation with joined data (from API)
export interface EnrichedConversation extends DbConversation {
  student?: {
    id: string
    name: string
    class_id: string
    class_name: string
    profile_photo?: string | null
  }
  messages?: DbMessage[]
  participants?: DbParticipant[]
  unread_count?: number
}

// API response types
export interface ConversationsListResponse {
  conversations: EnrichedConversation[]
}

export interface MessagesListResponse {
  messages: DbMessage[]
}

export interface CreateConversationRequest {
  student_id: string
  class_id: string
  teacher_id: string
  subject?: string
}

export interface SendMessageRequest {
  sender_type: 'teacher' | 'parent'
  sender_name: string
  content: string
}
