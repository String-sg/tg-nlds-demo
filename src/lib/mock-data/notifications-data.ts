import type { Notification } from '@/types/notification'

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    title: 'Student Absence Alert',
    message: 'Bryan Yeo has been absent for 3 consecutive days',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: false,
    priority: 'high',
    actionUrl: '/classroom/5a/student/bryan-yeo',
    relatedStudent: {
      id: 'student-1',
      name: 'Bryan Yeo',
      class: '5A',
    },
  },
  {
    id: 'notif-2',
    type: 'message',
    title: 'New Parent Message',
    message: 'Mrs. Chen wants to schedule a meeting to discuss Emily&apos;s progress',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    priority: 'medium',
    actionUrl: '/inbox',
  },
  {
    id: 'notif-3',
    type: 'reminder',
    title: 'Assignment Due Tomorrow',
    message: 'Class 5A - Mathematics assignment deadline is approaching',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    priority: 'medium',
    actionUrl: '/teaching',
  },
  {
    id: 'notif-4',
    type: 'announcement',
    title: 'Staff Meeting Scheduled',
    message: 'Year group meeting scheduled for Friday at 2:00 PM',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    read: true,
    priority: 'low',
    actionUrl: '/calendar',
  },
  {
    id: 'notif-5',
    type: 'alert',
    title: 'Grade Drop Alert',
    message: 'Michael Wong&apos;s science grade has dropped from A to C',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    priority: 'high',
    actionUrl: '/classroom/5a/student/michael-wong',
    relatedStudent: {
      id: 'student-2',
      name: 'Michael Wong',
      class: '5A',
    },
  },
  {
    id: 'notif-6',
    type: 'message',
    title: 'Form Submission',
    message: 'New field trip consent form submitted by 12 parents',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    priority: 'low',
    actionUrl: '/forms',
  },
]
