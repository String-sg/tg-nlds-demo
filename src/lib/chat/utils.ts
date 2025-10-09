import type { Message } from '@/types/chat'
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from 'date-fns'

/**
 * Format message timestamp to relative or absolute time
 */
export function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    const distance = formatDistanceToNow(date, { addSuffix: true })
    if (distance.includes('less than a minute')) {
      return 'Just now'
    }
    if (distance.includes('minute')) {
      return distance.replace(' ago', '')
    }
    return format(date, 'h:mm a')
  }

  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`
  }

  return format(date, 'MMM d, h:mm a')
}

/**
 * Format last message timestamp for conversation list
 */
export function formatLastMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'h:mm a')
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff < 7) {
    return format(date, 'EEE') // Mon, Tue, etc.
  }

  return format(date, 'MMM d')
}

/**
 * Get date separator text for message groups
 */
export function getDateSeparator(date: Date): string {
  if (isToday(date)) {
    return 'Today'
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  return format(date, 'EEEE, MMMM d, yyyy')
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: Message[]): Array<{ date: Date; messages: Message[] }> {
  const groups: Array<{ date: Date; messages: Message[] }> = []

  messages.forEach((message) => {
    const existingGroup = groups.find((g) => isSameDay(g.date, message.sentAt))

    if (existingGroup) {
      existingGroup.messages.push(message)
    } else {
      groups.push({
        date: message.sentAt,
        messages: [message],
      })
    }
  })

  return groups
}

/**
 * Truncate message preview
 */
export function truncateMessage(content: string, maxLength: number = 80): string {
  if (content.length <= maxLength) {
    return content
  }
  return content.substring(0, maxLength) + '...'
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType === 'application/pdf') return '📄'
  if (fileType.includes('word') || fileType.includes('document')) return '📝'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️'
  return '📎'
}

/**
 * Validate file type
 */
export function isValidFileType(fileType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/heic',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ]

  return allowedTypes.includes(fileType)
}

/**
 * Validate file size (max 10MB)
 */
export function isValidFileSize(fileSize: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return fileSize <= maxSize
}

/**
 * Get color class for user role
 */
export function getRoleColor(role: 'teacher' | 'parent'): string {
  return role === 'teacher' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
}

/**
 * Get avatar background color based on name
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-cyan-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-red-500',
    'bg-yellow-500',
  ]

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Get conversation display name
 */
export function getConversationDisplayName(
  participants: Array<{ name: string; role: string }>,
  currentUserId: string,
  groupName?: string
): string {
  if (groupName) {
    return groupName
  }

  const otherParticipants = participants.filter((p) => p.name !== currentUserId)
  if (otherParticipants.length === 1) {
    return otherParticipants[0].name
  }

  return otherParticipants.map((p) => p.name).join(', ')
}

/**
 * Format unread count (99+)
 */
export function formatUnreadCount(count: number): string {
  if (count > 99) {
    return '99+'
  }
  return count.toString()
}
