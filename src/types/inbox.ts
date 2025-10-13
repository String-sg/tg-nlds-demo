// Inbox Type Definitions

import type { Conversation, Message, Participant } from './chat'

export type Priority = 'urgent' | 'follow-up' | 'active' | 'resolved'
export type ConversationStatus = 'open' | 'snoozed' | 'closed'
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
