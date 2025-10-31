// PTM (Parent-Teacher Meeting) TypeScript Definitions

import type { Student, Case } from './classroom'

/**
 * Priority level for PTM students
 * - High: Students requiring immediate attention (score 80-100)
 * - Medium: Students needing monitoring (score 40-79)
 * - Low: Students doing well (score 0-39)
 */
export type PTMPriorityLevel = 'high' | 'medium' | 'low'

/**
 * Reason for student being flagged in PTM
 */
export type PTMPriorityReason =
  | 'Low Attendance'
  | 'Very Low Attendance'
  | 'Active Case'
  | 'Multiple Cases'
  | 'Academic Decline'

/**
 * Recent grade information for a student
 */
export interface PTMGrade {
  subject: string
  grade: string
  score: number
  percentage: number
  assessment_name?: string
  assessment_date?: string
}

/**
 * Enhanced student data for PTM preparation
 * Extends base Student type with PTM-specific fields
 */
export interface PTMStudent extends Student {
  /**
   * Priority score (0-100)
   * Higher score = higher priority for discussion
   */
  priorityScore: number

  /**
   * Priority level based on score
   */
  priorityLevel: PTMPriorityLevel

  /**
   * Human-readable reasons for priority
   */
  priorityReasons: PTMPriorityReason[]

  /**
   * Calculated attendance rate (0-100)
   * Already in Student type but ensured to be calculated
   */
  attendanceRate: number

  /**
   * List of active cases
   */
  activeCases: Case[]

  /**
   * Recent academic results
   */
  recentGrades: PTMGrade[]

  /**
   * Areas of concern for discussion
   */
  concernAreas: string[]

  /**
   * Student strengths to highlight
   */
  strengths: string[]

  /**
   * Badge color based on priority
   */
  badgeColor: string

  /**
   * Tags to display on student card
   */
  tags: string[]
}

/**
 * Response data for PTM student list
 */
export interface PTMStudentData {
  /**
   * Array of students sorted by priority
   */
  students: PTMStudent[]

  /**
   * Total number of students
   */
  totalCount: number

  /**
   * Count of high priority students
   */
  highPriorityCount: number

  /**
   * Count of medium priority students
   */
  mediumPriorityCount: number

  /**
   * Count of low priority students
   */
  lowPriorityCount: number

  /**
   * Form class ID for routing
   */
  formClassId?: string

  /**
   * Form class name
   */
  formClassName?: string

  /**
   * Teacher information
   */
  teacherInfo?: {
    teacherId: string
    teacherName: string
    formClassName: string
  }

  /**
   * Data fetched timestamp
   */
  fetchedAt: string
}

/**
 * Configuration for PTM student fetching
 */
export interface PTMConfig {
  /**
   * Teacher ID to fetch students for
   * If not provided, will use authenticated teacher
   */
  teacherId?: string

  /**
   * Whether to use mock mode
   */
  useMockMode?: boolean

  /**
   * Attendance threshold for low attendance flag (default: 85%)
   */
  lowAttendanceThreshold?: number

  /**
   * Whether to include inactive cases (default: false)
   */
  includeInactiveCases?: boolean
}

/**
 * PTM priority calculation weights
 */
export interface PTMPriorityWeights {
  /**
   * Points for attendance < 70%
   */
  veryLowAttendance: number

  /**
   * Points for attendance 70-84%
   */
  lowAttendance: number

  /**
   * Points per active case (max 3 cases counted)
   */
  perCase: number
}

/**
 * Default priority calculation weights
 */
export const DEFAULT_PTM_WEIGHTS: PTMPriorityWeights = {
  veryLowAttendance: 50,
  lowAttendance: 30,
  perCase: 30,
}
