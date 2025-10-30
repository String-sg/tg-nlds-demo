export interface Notification {
  id: string
  type: 'alert' | 'message' | 'reminder' | 'announcement'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  relatedStudent?: {
    id: string
    name: string
    class: string
  }
}

export interface NotificationGroup {
  date: string
  notifications: Notification[]
}
