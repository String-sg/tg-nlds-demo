/**
 * Timetable Query Hooks
 *
 * React hooks for fetching teacher timetable data using TanStack Query.
 * Provides caching, automatic refetching, and loading states.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { WeekSchedule, DaySchedule, LessonSlot } from '@/types/timetable'
import {
  fetchTeacherWeekSchedule,
  fetchTeacherDaySchedule,
  fetchClassSchedule,
  fetchTeacherMonthSchedule,
  fetchTeacherName,
  fetchTeacherScheduleStats,
  hasScheduledClasses,
} from '@/lib/queries/timetable-queries'

/**
 * Hook to fetch teacher's week schedule
 *
 * @param teacherId - Teacher ID
 * @param weekStart - Start date of week (Monday)
 * @returns Query result with week schedule
 *
 * @example
 * const { data: weekSchedule, isLoading } = useTeacherWeekSchedule(teacherId, weekStart)
 */
export function useTeacherWeekSchedule(
  teacherId: string | undefined,
  weekStart: Date
): UseQueryResult<WeekSchedule, Error> {
  return useQuery({
    queryKey: queryKeys.timetable.teacherWeek(teacherId || '', weekStart),
    queryFn: () => fetchTeacherWeekSchedule(teacherId || '', weekStart),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (renamed from cacheTime in v5)
  })
}

/**
 * Hook to fetch teacher's day schedule
 *
 * @param teacherId - Teacher ID
 * @param date - Date to fetch schedule for
 * @returns Query result with day schedule
 *
 * @example
 * const { data: daySchedule } = useTeacherDaySchedule(teacherId, new Date())
 */
export function useTeacherDaySchedule(
  teacherId: string | undefined,
  date: Date
): UseQueryResult<DaySchedule, Error> {
  return useQuery({
    queryKey: queryKeys.timetable.teacherDay(teacherId || '', date),
    queryFn: () => fetchTeacherDaySchedule(teacherId || '', date),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to fetch specific class schedule
 *
 * @param classId - Class ID
 * @returns Query result with class schedule (array of lesson slots)
 *
 * @example
 * const { data: classSchedule } = useClassSchedule(classId)
 */
export function useClassSchedule(
  classId: string | undefined
): UseQueryResult<LessonSlot[], Error> {
  return useQuery({
    queryKey: queryKeys.timetable.classSchedule(classId || ''),
    queryFn: () => fetchClassSchedule(classId || ''),
    enabled: !!classId,
    staleTime: 10 * 60 * 1000, // 10 minutes (class schedules change less frequently)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  })
}

/**
 * Hook to fetch teacher's month schedule
 * Returns lessons grouped by day of week
 *
 * @param teacherId - Teacher ID
 * @param monthDate - Date within the month
 * @returns Query result with month schedule map
 *
 * @example
 * const { data: monthSchedule } = useTeacherMonthSchedule(teacherId, new Date())
 */
export function useTeacherMonthSchedule(
  teacherId: string | undefined,
  monthDate: Date
): UseQueryResult<Map<string, LessonSlot[]>, Error> {
  return useQuery({
    queryKey: queryKeys.timetable.teacherMonth(teacherId || '', monthDate),
    queryFn: () => fetchTeacherMonthSchedule(teacherId || '', monthDate),
    enabled: !!teacherId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to fetch teacher name
 * Useful for PDF export and headers
 *
 * @param teacherId - Teacher ID
 * @returns Query result with teacher name
 *
 * @example
 * const { data: teacherName } = useTeacherName(teacherId)
 */
export function useTeacherName(
  teacherId: string | undefined
): UseQueryResult<string, Error> {
  return useQuery({
    queryKey: queryKeys.teachers.detail(teacherId || ''),
    queryFn: () => fetchTeacherName(teacherId || ''),
    enabled: !!teacherId,
    staleTime: Infinity, // Teacher names rarely change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

/**
 * Hook to fetch teacher schedule statistics
 * Lightweight query for dashboard widget
 *
 * @param teacherId - Teacher ID
 * @returns Query result with schedule stats
 *
 * @example
 * const { data: stats } = useTeacherScheduleStats(teacherId)
 */
export function useTeacherScheduleStats(
  teacherId: string | undefined
): UseQueryResult<
  {
    totalClasses: number
    totalLessons: number
    classesWithSchedule: number
  },
  Error
> {
  return useQuery({
    queryKey: queryKeys.timetable.teacherStats(teacherId || ''),
    queryFn: () => fetchTeacherScheduleStats(teacherId || ''),
    enabled: !!teacherId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to check if teacher has scheduled classes
 * Useful for showing empty states or onboarding
 *
 * @param teacherId - Teacher ID
 * @returns Query result with boolean
 *
 * @example
 * const { data: hasSchedule } = useHasScheduledClasses(teacherId)
 * if (!hasSchedule) return <EmptyState />
 */
export function useHasScheduledClasses(
  teacherId: string | undefined
): UseQueryResult<boolean, Error> {
  return useQuery({
    queryKey: [...queryKeys.timetable.teacher(teacherId || ''), 'has-schedule'],
    queryFn: () => hasScheduledClasses(teacherId || ''),
    enabled: !!teacherId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to fetch today's schedule for a teacher
 * Convenience hook that uses current date
 *
 * @param teacherId - Teacher ID
 * @returns Query result with today's schedule
 *
 * @example
 * const { data: todaySchedule } = useTodaySchedule(teacherId)
 */
export function useTodaySchedule(
  teacherId: string | undefined
): UseQueryResult<DaySchedule, Error> {
  return useTeacherDaySchedule(teacherId, new Date())
}

/**
 * Hook to fetch current week schedule for a teacher
 * Convenience hook that uses current week start
 *
 * @param teacherId - Teacher ID
 * @returns Query result with current week schedule
 *
 * @example
 * const { data: thisWeekSchedule } = useCurrentWeekSchedule(teacherId)
 */
export function useCurrentWeekSchedule(
  teacherId: string | undefined
): UseQueryResult<WeekSchedule, Error> {
  // Get Monday of current week
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const weekStart = new Date(now.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)

  return useTeacherWeekSchedule(teacherId, weekStart)
}
