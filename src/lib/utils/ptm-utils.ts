// PTM (Parent-Teacher Meeting) Utility Functions

import type {
  PTMStudent,
  PTMPriorityLevel,
  PTMPriorityReason,
  PTMPriorityWeights,
  DEFAULT_PTM_WEIGHTS,
} from '@/types/ptm'
import type { Case } from '@/types/classroom'

/**
 * Calculate priority score for a student based on multiple factors
 *
 * Score breakdown:
 * - Very low attendance (<70%): 50 points
 * - Low attendance (70-84%): 30 points
 * - Active cases: 30 points per case (max 3 cases)
 *
 * Maximum score: 120 points (50 + 30 + 30 + 30)
 *
 * @param student - Student data with attendance and cases
 * @param weights - Custom weights (optional, uses defaults if not provided)
 * @returns Priority score (0-120)
 */
export function calculatePriorityScore(
  student: {
    attendanceRate: number
    activeCases?: Case[]
  },
  weights: PTMPriorityWeights = {
    veryLowAttendance: 50,
    lowAttendance: 30,
    perCase: 30,
  }
): number {
  let score = 0

  // Attendance component (0-50 points)
  if (student.attendanceRate < 70) {
    score += weights.veryLowAttendance
  } else if (student.attendanceRate < 85) {
    score += weights.lowAttendance
  }

  // Cases component (0-90 points, max 3 cases counted)
  const activeCaseCount = student.activeCases?.length || 0
  const caseCount = Math.min(activeCaseCount, 3)
  score += caseCount * weights.perCase

  // Cap at 100
  return Math.min(score, 100)
}

/**
 * Determine priority level based on score
 *
 * @param score - Priority score (0-100)
 * @returns Priority level: 'high', 'medium', or 'low'
 */
export function getPriorityLevel(score: number): PTMPriorityLevel {
  if (score >= 80) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

/**
 * Generate human-readable priority reasons
 *
 * @param student - Student data
 * @returns Array of priority reasons
 */
export function getPriorityReasons(student: {
  attendanceRate: number
  activeCases?: Case[]
}): PTMPriorityReason[] {
  const reasons: PTMPriorityReason[] = []

  // Attendance reasons
  if (student.attendanceRate < 70) {
    reasons.push('Very Low Attendance')
  } else if (student.attendanceRate < 85) {
    reasons.push('Low Attendance')
  }

  // Case reasons
  const activeCaseCount = student.activeCases?.length || 0
  if (activeCaseCount > 1) {
    reasons.push('Multiple Cases')
  } else if (activeCaseCount === 1) {
    reasons.push('Active Case')
  }

  return reasons
}

/**
 * Get badge color based on priority level
 *
 * @param priorityLevel - Priority level ('high', 'medium', 'low')
 * @returns Color class name for badge
 */
export function getPriorityBadgeColor(priorityLevel: PTMPriorityLevel): string {
  switch (priorityLevel) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

/**
 * Generate student initials from full name
 *
 * @param name - Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '??'

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    // Single name - take first 2 characters
    return parts[0].substring(0, 2).toUpperCase()
  }

  // Multiple names - take first letter of first and last name
  const first = parts[0][0]
  const last = parts[parts.length - 1][0]
  return (first + last).toUpperCase()
}

/**
 * Generate consistent avatar background color based on name
 *
 * @param name - Student name
 * @returns Tailwind color class
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-yellow-100 text-yellow-700',
    'bg-lime-100 text-lime-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-sky-100 text-sky-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-purple-100 text-purple-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-pink-100 text-pink-700',
    'bg-rose-100 text-rose-700',
  ]

  // Generate consistent index based on name
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

/**
 * Format attendance rate as percentage string
 *
 * @param rate - Attendance rate (0-100)
 * @returns Formatted string (e.g., "85%")
 */
export function formatAttendanceRate(rate: number): string {
  return `${Math.round(rate)}%`
}

/**
 * Get attendance status color based on rate
 *
 * @param rate - Attendance rate (0-100)
 * @returns Color class name
 */
export function getAttendanceColor(rate: number): string {
  if (rate >= 95) return 'text-green-600'
  if (rate >= 85) return 'text-blue-600'
  if (rate >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Generate concern areas based on student data
 *
 * @param student - PTM student data
 * @returns Array of concern descriptions
 */
export function generateConcernAreas(student: {
  attendanceRate: number
  activeCases?: Case[]
  average_grade?: number
  recentGrades?: { score: number; percentage: number }[]
}): string[] {
  const concerns: string[] = []

  // Attendance concerns
  if (student.attendanceRate < 70) {
    concerns.push(`Very low attendance (${formatAttendanceRate(student.attendanceRate)})`)
  } else if (student.attendanceRate < 85) {
    concerns.push(`Below-average attendance (${formatAttendanceRate(student.attendanceRate)})`)
  }

  // Case concerns
  if (student.activeCases && student.activeCases.length > 0) {
    const caseTypes = student.activeCases.map((c) => c.case_type).join(', ')
    concerns.push(`${student.activeCases.length} active case${student.activeCases.length > 1 ? 's' : ''}: ${caseTypes}`)
  }

  // Academic concerns
  if (student.average_grade && student.average_grade < 50) {
    concerns.push(`Low academic performance (avg: ${student.average_grade}%)`)
  }

  return concerns
}

/**
 * Generate student strengths based on student data
 *
 * @param student - PTM student data
 * @returns Array of strength descriptions
 */
export function generateStrengths(student: {
  attendanceRate: number
  average_grade?: number
  recentGrades?: { score: number; percentage: number; subject?: string }[]
}): string[] {
  const strengths: string[] = []

  // Attendance strengths
  if (student.attendanceRate >= 95) {
    strengths.push('Excellent attendance')
  } else if (student.attendanceRate >= 85) {
    strengths.push('Good attendance')
  }

  // Academic strengths
  if (student.average_grade && student.average_grade >= 75) {
    strengths.push(`Strong academic performance (avg: ${student.average_grade}%)`)
  }

  // Subject-specific strengths
  if (student.recentGrades) {
    const topSubjects = student.recentGrades
      .filter((g) => g.percentage >= 80)
      .map((g) => g.subject)
      .filter((s): s is string => !!s)
      .slice(0, 2)

    if (topSubjects.length > 0) {
      strengths.push(`Excels in ${topSubjects.join(' and ')}`)
    }
  }

  return strengths.length > 0 ? strengths : ['Consistent student']
}

/**
 * Generate tags for student card display
 *
 * @param student - PTM student data
 * @returns Array of tag strings
 */
export function generateStudentTags(student: {
  attendanceRate: number
  activeCases?: Case[]
  status?: string
}): string[] {
  const tags: string[] = []

  // Priority tags based on concerns
  if (student.attendanceRate < 85) {
    tags.push('Attendance')
  }

  if (student.activeCases && student.activeCases.length > 0) {
    tags.push('Active Case')
  }

  // Status tags
  if (student.status === 'SWAN') {
    tags.push('SWAN')
  } else if (student.status === 'SEN') {
    tags.push('SEN')
  } else if (student.status === 'GEP') {
    tags.push('GEP')
  }

  return tags
}
