import type { Announcement } from '@/types/announcements'

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'School Bus Route Changes - Effective Next Week',
    content: 'Dear Parents, please be informed that we will be implementing changes to several school bus routes starting next Monday, November 11th. This adjustment is to improve efficiency and reduce travel time for students. Affected families have been contacted individually via email with the updated pick-up and drop-off timings. If you have any questions or concerns, please contact our transport coordinator at transport@school.edu.sg.',
    author: 'Admin Office',
    authorRole: 'School Administration',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    priority: 'high',
    category: 'administrative',
    read: false,
  },
  {
    id: 'ann-2',
    title: 'Parent-Teacher Conference Schedule Released',
    content: 'Dear Parents, the schedule for the upcoming parent-teacher conferences has been released. You can view your assigned time slots in the Meetings tab. We look forward to discussing your child&apos;s progress and development with you. If the scheduled time is not suitable, please contact the school office to arrange an alternative slot.',
    author: 'Principal Lee',
    authorRole: 'Principal',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    priority: 'medium',
    category: 'administrative',
    read: false,
  },
  {
    id: 'ann-3',
    title: 'School Assembly Cancelled - Friday, Nov 8',
    content: 'Dear Parents, due to unforeseen circumstances, the school assembly scheduled for Friday, November 8th has been cancelled. Your child&apos;s regular classes will proceed as normal during the assembly period. There will be no change to the dismissal time.',
    author: 'VP Academic Affairs',
    authorRole: 'Vice Principal',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    priority: 'medium',
    category: 'administrative',
    read: true,
  },
  {
    id: 'ann-4',
    title: 'PSLE Preparation Workshop - Registration Open',
    content: 'Dear Parents, we are pleased to announce that registration is now open for our PSLE preparation workshop series starting next month. The workshops will equip your child with examination techniques, time management skills, and subject-specific strategies. Seats are limited, so please register early. Please refer to the attached schedule for more details.',
    author: 'HOD Mathematics',
    authorRole: 'Head of Department',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    priority: 'medium',
    category: 'academic',
    read: true,
    attachments: [
      {
        name: 'PSLE_Workshop_Schedule.pdf',
        url: '/files/psle-workshop-schedule.pdf',
        type: 'application/pdf',
      },
    ],
  },
  {
    id: 'ann-5',
    title: 'Year-End Concert - Call for Performers',
    content: 'Dear Parents, our school is organizing a year-end concert and we are looking for talented students to showcase their abilities. If your child is interested in performing (singing, dancing, musical instruments, or other talents), please submit their names and performance details by November 15th. This is a wonderful opportunity for your child to build confidence and share their talents with the school community.',
    author: 'CCA Department',
    authorRole: 'CCA Coordinator',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    priority: 'low',
    category: 'event',
    read: true,
  },
  {
    id: 'ann-6',
    title: 'Updated COVID-19 Safety Measures',
    content: 'Dear Parents, please be informed of the updated COVID-19 safety measures effective immediately. All students must wear masks in common areas such as corridors and the canteen. We will continue to maintain social distancing of 1 meter where possible. Please ensure your child brings extra masks to school daily. Thank you for your continued cooperation in keeping our school community safe.',
    author: 'Admin Office',
    authorRole: 'School Administration',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    priority: 'high',
    category: 'administrative',
    read: true,
  },
  {
    id: 'ann-7',
    title: 'Science Fair 2025 - Project Submissions',
    content: 'Dear Parents, our annual Science Fair is approaching! If your child wishes to participate, please help them submit their project proposals by December 1st. This is an excellent opportunity for students to explore scientific concepts hands-on. Judging will take place in early January, and all participants will receive certificates. Please see the attached guidelines and project template for more information.',
    author: 'HOD Science',
    authorRole: 'Head of Department',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    priority: 'medium',
    category: 'academic',
    read: true,
    attachments: [
      {
        name: 'Science_Fair_Guidelines.pdf',
        url: '/files/science-fair-guidelines.pdf',
        type: 'application/pdf',
      },
      {
        name: 'Project_Template.docx',
        url: '/files/project-template.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    ],
  },
  {
    id: 'ann-8',
    title: 'School Closure - Staff Professional Development Day',
    content: 'Dear Parents, please be reminded that there will be no classes on November 22nd as our teachers will be attending a Professional Development Day. The school will be closed for all students on this day. Regular classes will resume on November 23rd. Please make alternative arrangements for your child&apos;s care on this day.',
    author: 'Admin Office',
    authorRole: 'School Administration',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    priority: 'medium',
    category: 'administrative',
    read: true,
  },
]

export function getAnnouncementById(id: string): Announcement | undefined {
  return mockAnnouncements.find((announcement) => announcement.id === id)
}

export function getUnreadAnnouncementsCount(): number {
  return mockAnnouncements.filter((announcement) => !announcement.read).length
}

export function getAnnouncementsByCategory(category: string): Announcement[] {
  if (category === 'all') return mockAnnouncements
  return mockAnnouncements.filter((announcement) => announcement.category === category)
}

export function getAnnouncementsByPriority(priority: string): Announcement[] {
  if (priority === 'all') return mockAnnouncements
  return mockAnnouncements.filter((announcement) => announcement.priority === priority)
}
