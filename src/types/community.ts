/**
 * Community Platform Types
 * Content sharing and collaboration between teachers
 */

export interface Post {
  id: string
  title: string
  description: string
  content: string
  author: string
  authorRole: string
  authorAvatar?: string
  category: PostCategory
  tags: string[]
  subject?: string // e.g., "Mathematics", "English"
  gradeLevel?: string // e.g., "Year 1-2", "Year 3-4"
  createdDate: string
  updatedDate?: string
  likes: number
  comments: Comment[]
  downloads: number
  views: number
  attachments: PostAttachment[]
  isBookmarked: boolean
  isPinned: boolean
  status: 'published' | 'draft' | 'archived'
}

export type PostCategory =
  | 'lesson-plan'
  | 'worksheet'
  | 'activity'
  | 'assessment'
  | 'teaching-tip'
  | 'discussion'
  | 'resource'
  | 'question'

export interface PostAttachment {
  id: string
  name: string
  type: AttachmentType
  url: string
  fileSize: string
  format: string // e.g., "PDF", "DOCX", "PNG"
  thumbnailUrl?: string
  downloads: number
}

export type AttachmentType =
  | 'document'
  | 'image'
  | 'video'
  | 'presentation'
  | 'spreadsheet'
  | 'zip'
  | 'link'

export interface Comment {
  id: string
  postId: string
  author: string
  authorRole: string
  authorAvatar?: string
  content: string
  createdDate: string
  updatedDate?: string
  likes: number
  replies: Reply[]
  isEdited: boolean
}

export interface Reply {
  id: string
  commentId: string
  author: string
  authorRole: string
  authorAvatar?: string
  content: string
  createdDate: string
  likes: number
}

export interface UserContribution {
  userId: string
  totalPosts: number
  totalComments: number
  totalLikes: number
  totalDownloads: number
  joinedDate: string
  reputation: number
  badges: Badge[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedDate: string
  category: 'contributor' | 'expert' | 'helpful' | 'milestone'
}

export interface CommunityStats {
  totalMembers: number
  totalPosts: number
  totalResources: number
  activeToday: number
  topContributors: TopContributor[]
}

export interface TopContributor {
  userId: string
  name: string
  role: string
  avatar?: string
  posts: number
  helpfulness: number // Based on likes and downloads
}

// Filter and search types
export interface PostFilters {
  category?: PostCategory
  subject?: string
  gradeLevel?: string
  tags?: string[]
  author?: string
  dateRange?: {
    start: string
    end: string
  }
  hasAttachments?: boolean
  isPinned?: boolean
  isBookmarked?: boolean
}

export interface PostSortOptions {
  by: 'recent' | 'popular' | 'mostLiked' | 'mostDownloaded' | 'mostCommented'
  order: 'asc' | 'desc'
}

// Activity feed types
export interface ActivityItem {
  id: string
  type: ActivityType
  actor: string
  actorRole: string
  actorAvatar?: string
  action: string
  targetType: 'post' | 'comment' | 'user'
  targetId: string
  targetTitle?: string
  timestamp: string
}

export type ActivityType =
  | 'post-created'
  | 'post-liked'
  | 'comment-added'
  | 'resource-shared'
  | 'user-followed'
  | 'badge-earned'
