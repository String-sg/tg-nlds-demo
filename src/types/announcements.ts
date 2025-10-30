export type AnnouncementPriority = 'high' | 'medium' | 'low'
export type AnnouncementCategory = 'academic' | 'administrative' | 'event' | 'emergency'

export interface Attachment {
  name: string
  url: string
  type: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  author: string
  authorRole: string
  date: string
  priority: AnnouncementPriority
  category: AnnouncementCategory
  read: boolean
  attachments?: Attachment[]
}
