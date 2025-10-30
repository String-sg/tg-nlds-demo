import type { Meeting } from '@/types/meetings'

export const mockMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Academic Performance Discussion',
    parentName: 'Mrs. Tan',
    studentName: 'Ryan Tan',
    studentClass: '5A',
    date: '2024-11-02',
    time: '14:00',
    duration: 30,
    location: 'In-Person',
    status: 'scheduled',
    notes: 'Discuss Ryan&apos;s recent improvement in Mathematics',
    agenda: [
      'Review latest test scores',
      'Discuss study habits',
      'Set goals for next term',
    ],
  },
  {
    id: 'meet-2',
    title: 'Behavioral Concerns',
    parentName: 'Ms. Koh',
    studentName: 'Layla Koh',
    studentClass: '4B',
    date: '2024-11-05',
    time: '10:00',
    duration: 45,
    location: 'Virtual',
    meetingLink: 'https://zoom.us/j/123456789',
    status: 'scheduled',
    notes: 'Address recent behavioral incidents in class',
    agenda: [
      'Discuss classroom behavior',
      'Review school conduct policy',
      'Create action plan',
    ],
  },
  {
    id: 'meet-3',
    title: 'Parent-Teacher Conference',
    parentName: 'Mrs. Wong',
    studentName: 'Alice Wong',
    studentClass: '6C',
    date: '2024-11-08',
    time: '15:30',
    duration: 30,
    location: 'In-Person',
    status: 'scheduled',
    agenda: [
      'Overall academic progress',
      'PSLE preparation strategy',
      'Extracurricular activities',
    ],
  },
  {
    id: 'meet-4',
    title: 'Academic Progress Review',
    parentName: 'Mr. Lim',
    studentName: 'Brandon Lim',
    studentClass: '5B',
    date: '2024-10-28',
    time: '11:00',
    duration: 30,
    location: 'In-Person',
    status: 'completed',
    notes: 'Brandon showing good progress in Science. Continue encouraging his curiosity.',
    agenda: [
      'Semester performance review',
      'Identify strengths and areas for improvement',
    ],
  },
  {
    id: 'meet-5',
    title: 'Special Education Needs Discussion',
    parentName: 'Mrs. Chen',
    studentName: 'Emily Chen',
    studentClass: '3A',
    date: '2024-10-25',
    time: '09:00',
    duration: 60,
    location: 'Virtual',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'completed',
    notes: 'Agreed on additional learning support. Follow-up meeting in 6 weeks.',
    agenda: [
      'Review IEP progress',
      'Discuss accommodations',
      'Plan for next semester',
    ],
  },
  {
    id: 'meet-6',
    title: 'Attendance Issues',
    parentName: 'Mr. Singh',
    studentName: 'Arjun Singh',
    studentClass: '4A',
    date: '2024-10-20',
    time: '13:00',
    duration: 30,
    location: 'In-Person',
    status: 'cancelled',
    notes: 'Rescheduled to November 12th due to parent emergency.',
  },
  {
    id: 'meet-7',
    title: 'Gifted Education Program Consultation',
    parentName: 'Mrs. Ng',
    studentName: 'Sarah Ng',
    studentClass: '6A',
    date: '2024-11-12',
    time: '10:30',
    duration: 45,
    location: 'In-Person',
    status: 'scheduled',
    agenda: [
      'GEP program details',
      'Enrollment requirements',
      'Q&A session',
    ],
  },
  {
    id: 'meet-8',
    title: 'Mid-Year Performance Review',
    parentName: 'Mr. Kumar',
    studentName: 'Priya Kumar',
    studentClass: '5C',
    date: '2024-11-15',
    time: '16:00',
    duration: 30,
    location: 'Virtual',
    meetingLink: 'https://zoom.us/j/987654321',
    status: 'scheduled',
    notes: 'Regular check-in on Priya&apos;s overall performance',
    agenda: [
      'Academic progress across all subjects',
      'CCA participation',
      'Social development',
    ],
  },
]

export function getMeetingById(id: string): Meeting | undefined {
  return mockMeetings.find((meeting) => meeting.id === id)
}

export function getUpcomingMeetings(): Meeting[] {
  const today = new Date()
  return mockMeetings
    .filter((meeting) => {
      const meetingDate = new Date(meeting.date)
      return meeting.status === 'scheduled' && meetingDate >= today
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getPastMeetings(): Meeting[] {
  const today = new Date()
  return mockMeetings
    .filter((meeting) => {
      const meetingDate = new Date(meeting.date)
      return meeting.status === 'completed' || meetingDate < today
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getMeetingsByStatus(status: string): Meeting[] {
  if (status === 'all') return mockMeetings
  return mockMeetings.filter((meeting) => meeting.status === status)
}

export function getMeetingsByMonth(year: number, month: number): Meeting[] {
  return mockMeetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date)
    return meetingDate.getFullYear() === year && meetingDate.getMonth() === month
  })
}
