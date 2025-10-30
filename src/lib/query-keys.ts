/**
 * Query Keys Factory
 *
 * Centralized query key management for TanStack Query.
 * Follows best practices from TanStack Query docs.
 *
 * Benefits:
 * - Type-safe query keys
 * - Consistent naming across the app
 * - Easy cache invalidation (invalidate all students, specific student, etc.)
 * - Prevents key collisions
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
 */

export const queryKeys = {
  /**
   * Student-related queries
   */
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (classId: string) => [...queryKeys.students.lists(), classId] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (studentName: string) => [...queryKeys.students.details(), studentName] as const,
    profile: (studentName: string) => [...queryKeys.students.detail(studentName), 'profile'] as const,
  },

  /**
   * Class-related queries
   */
  classes: {
    all: ['classes'] as const,
    lists: () => [...queryKeys.classes.all, 'list'] as const,
    list: (teacherId: string) => [...queryKeys.classes.lists(), teacherId] as const,
    stats: (classId: string) => [...queryKeys.classes.all, 'stats', classId] as const,
    detail: (classId: string) => [...queryKeys.classes.all, 'detail', classId] as const,
  },

  /**
   * Teacher-related queries
   */
  teachers: {
    all: ['teachers'] as const,
    detail: (email: string) => [...queryKeys.teachers.all, email] as const,
  },

  /**
   * Parent-Teacher Meeting related queries
   */
  ptm: {
    all: ['ptm'] as const,
    students: (teacherId: string, config?: PTMQueryConfig) =>
      [...queryKeys.ptm.all, 'students', teacherId, config] as const,
  },

  /**
   * Student alerts for home page
   */
  alerts: {
    all: ['alerts'] as const,
    list: (userId: string, limit: number) =>
      [...queryKeys.alerts.all, userId, limit] as const,
  },

  /**
   * Conversations (already using TanStack Query)
   */
  conversations: {
    all: ['conversations'] as const,
    list: (teacherId: string) => [...queryKeys.conversations.all, teacherId] as const,
    detail: (conversationId: string) => [...queryKeys.conversations.all, conversationId] as const,
  },

  /**
   * Breadcrumbs (class name lookups)
   */
  breadcrumbs: {
    all: ['breadcrumbs'] as const,
    class: (classId: string) => [...queryKeys.breadcrumbs.all, 'class', classId] as const,
  },

  /**
   * Inbox-related queries
   */
  inbox: {
    all: ['inbox'] as const,
    students: (teacherId: string) => [...queryKeys.inbox.all, 'students', teacherId] as const,
  },

  /**
   * Timetable-related queries
   */
  timetable: {
    all: ['timetable'] as const,
    teacher: (teacherId: string) => [...queryKeys.timetable.all, 'teacher', teacherId] as const,
    teacherWeek: (teacherId: string, weekStart: Date) =>
      [...queryKeys.timetable.teacher(teacherId), 'week', weekStart.toISOString()] as const,
    teacherDay: (teacherId: string, date: Date) =>
      [...queryKeys.timetable.teacher(teacherId), 'day', date.toISOString()] as const,
    teacherMonth: (teacherId: string, monthDate: Date) =>
      [...queryKeys.timetable.teacher(teacherId), 'month', monthDate.toISOString()] as const,
    classSchedule: (classId: string) =>
      [...queryKeys.timetable.all, 'class', classId] as const,
    teacherStats: (teacherId: string) =>
      [...queryKeys.timetable.teacher(teacherId), 'stats'] as const,
  },
} as const

/**
 * Type for PTM query filter configuration
 */
interface PTMQueryConfig {
  includeMetrics?: {
    attendance?: boolean
    grades?: boolean
    behaviour?: boolean
    cases?: boolean
  }
  sortBy?: 'priority' | 'name' | 'recent'
  filterBy?: {
    hasCases?: boolean
    lowAttendance?: boolean
    failingGrades?: boolean
  }
}

/**
 * Mutation keys for cache invalidation
 */
export const mutationKeys = {
  attendance: {
    mark: ['attendance', 'mark'] as const,
    update: ['attendance', 'update'] as const,
  },
  grades: {
    update: ['grades', 'update'] as const,
    create: ['grades', 'create'] as const,
  },
  messages: {
    send: (conversationId: string) => ['sendMessage', conversationId] as const,
  },
  students: {
    update: ['students', 'update'] as const,
  },
  classes: {
    update: ['classes', 'update'] as const,
  },
} as const
