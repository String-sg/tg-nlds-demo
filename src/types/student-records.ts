// Student Records & Report Slip Type Definitions

export type RecordType = 'attendance' | 'performance' | 'profile' | 'case-related'

export type AttendanceSubType = 'daily' | 'cca' | 'school-events' | 'early-dismissal' | 'medical'
export type PerformanceSubType =
  | 'academic-results'
  | 'character-cce'
  | 'cca'
  | 'physical-fitness'
  | 'academic-concerns'
  | 'behavioral'
  | 'friendship'
export type ProfileSubType =
  | 'health-declaration'
  | 'mental-wellness'
  | 'family'
  | 'housing-finance'
  | 'social-behaviour'
  | 'friend-relationships'
  | 'character-observations'
  | 'wellbeing-checkin'
  | 'general'
export type CaseRelatedSubType =
  | 'counseling'
  | 'sec-case'
  | 'teacher-notes'
  | 'ai-summary'

export type RecordStatus = 'draft' | 'published'
export type RecordVisibility = 'teacher' | 'staff' | 'parent' | 'self'

// Attendance Data
export interface AttendanceData {
  subType: AttendanceSubType
  status?: 'present' | 'absent' | 'late' | 'excused'
  time?: string
  reason?: string
  notifyParent?: boolean
  followUpRequired?: boolean
  complaints?: string[]
  vitals?: Record<string, unknown>
  assessment?: string
  treatment?: string
  followUp?: string
  frequency?: string
  concernLevel?: string
  [key: string]: unknown // Allow additional flexible properties
}

// Performance Data
export interface PerformanceData {
  subType: PerformanceSubType
  subject?: string
  assessmentType?: 'quiz' | 'test' | 'exam' | 'project'
  score?: number
  maxScore?: number
  grade?: string
  area?: string
  rating?: number
  observation?: string
  observations?: string[]
  strengths?: string[]
  improvements?: string[]
  previousAverage?: number
  currentAverage?: number
  decline?: number
  subjectsAffected?: string[] | Array<Record<string, unknown>>
  possibleCauses?: string[]
  interventionPlan?: string
  concernLevel?: string
  frequency?: string
  impact?: string
  actionTaken?: string
  closeFriends?: string[]
  socialCircle?: string
  socialBehaviors?: string[]
  concerns?: string[]
  recommendations?: string
  comparison?: string
  triggers?: string
  overallAverage?: number
  results?: Array<Record<string, unknown>>
  teacherComment?: string
  parentMeetingNotes?: string
  [key: string]: unknown // Allow additional flexible properties
}

// Profile Data
export interface ProfileData {
  subType: ProfileSubType
  category?: string
  severity?: 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high'
  observation?: string
  actionRequired?: boolean
  actionTaken?: string
  relatedContacts?: string[]
  attachments?: string[]
  moodRating?: number
  concerns?: string[]
  strengths?: string[]
  followUpRequired?: boolean
  followUpDate?: string
  parentNotified?: boolean
  socialCircle?: string
  socialBehaviors?: string[]
  recommendations?: string
  concernLevel?: string
  generalObservations?: string[]
  areasToMonitor?: string[]
  initialConcernLevel?: string
  followUpPlan?: string
  [key: string]: unknown // Allow additional flexible properties
}

// Case Related Data
export interface CaseRelatedData {
  subType?: CaseRelatedSubType
  caseId?: string
  caseType?: 'discipline' | 'sen' | 'counselling' | 'career-guidance' | 'Wellbeing/Mental Health'
  category?: string
  sessionType?: 'intervention' | 'check-in' | 'progress-review' | 'parent-meeting'
  sessionNumber?: number
  duration?: number
  attendees?: string[]
  discussion?: string
  interventions?: string[]
  progress?: 'improving' | 'stable' | 'declining'
  nextSteps?: string[]
  nextSession?: string
  focusAreas?: string[]
  techniques?: string[]
  keyInsights?: string
  progressNotes?: string
  homeworkAssigned?: string
  concernLevel?: string
  severity?: 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high' | 'Critical' | 'Medium'
  supportPlan?: Record<string, unknown>
  teamMembers?: string[]
  reviewDate?: string
  notes?: string[]
  actionRequired?: boolean
  followUpDate?: string
  sensitivity?: string
  summary?: string
  generatedAt?: string
  confidence?: string
  sentiment?: string
  complaints?: string[]
  vitals?: Record<string, unknown>
  assessment?: string
  treatment?: string
  followUp?: string
  frequency?: string
  [key: string]: unknown // Allow additional flexible properties
}

// Base Student Record
export interface StudentRecord {
  id: string
  studentId: string
  type: RecordType
  subType: string
  date: string
  title: string
  description: string
  createdBy: string
  createdAt: string
  status: RecordStatus
  visibility: RecordVisibility
  tags?: string[]
  data: AttendanceData | PerformanceData | ProfileData | CaseRelatedData
}
