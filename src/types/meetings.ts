export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled'
export type MeetingLocation = 'In-Person' | 'Virtual'

export interface Meeting {
  id: string
  title: string
  parentName: string
  studentName: string
  studentClass: string
  date: string
  time: string
  duration: number // minutes
  location: MeetingLocation
  meetingLink?: string
  status: MeetingStatus
  notes?: string
  agenda?: string[]
}
