/**
 * Learning Platform Types
 * Professional development courses and resources for teachers
 */

export interface Course {
  id: string
  title: string
  description: string
  subject: string // e.g., "Mathematics", "Science"
  level: string // e.g., "Primary", "Secondary"
  category: CourseCategory
  duration: string // e.g., "4 weeks", "12 hours"
  instructor: string
  instructorRole: string
  thumbnail: string
  enrolledDate?: string
  progress: number // 0-100
  completed: boolean
  certificateUrl?: string
  modules: Module[]
  tags: string[]
}

export type CourseCategory =
  | 'pedagogy'
  | 'subject-knowledge'
  | 'assessment'
  | 'technology'
  | 'classroom-management'
  | 'special-education'

export interface Module {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  duration: string // e.g., "2 hours"
  lessons: Lesson[]
  completed: boolean
  progress: number // 0-100
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  order: number
  type: LessonType
  duration: string // e.g., "30 minutes"
  content: LessonContent
  completed: boolean
  resources: Resource[]
}

export type LessonType = 'video' | 'reading' | 'quiz' | 'activity' | 'discussion'

export interface LessonContent {
  text?: string
  videoUrl?: string
  audioUrl?: string
  slides?: string[]
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer?: string | number
  explanation?: string
}

export interface Resource {
  id: string
  title: string
  description?: string
  type: ResourceType
  url: string
  fileSize?: string
  format?: string // e.g., "PDF", "DOCX", "MP4"
  downloadable: boolean
  tags: string[]
}

export type ResourceType =
  | 'document'
  | 'video'
  | 'audio'
  | 'presentation'
  | 'worksheet'
  | 'template'
  | 'assessment'
  | 'external-link'

export interface Certificate {
  id: string
  courseId: string
  courseName: string
  issuedDate: string
  certificateUrl: string
  credentialId: string
}

export interface CourseEnrollment {
  userId: string
  courseId: string
  enrolledDate: string
  lastAccessedDate: string
  progress: number
  completed: boolean
  completedDate?: string
}

// Helper types for filtering and sorting
export interface CourseFilters {
  category?: CourseCategory
  level?: string
  subject?: string
  completed?: boolean
  inProgress?: boolean
  tags?: string[]
}

export interface CourseSortOptions {
  by: 'title' | 'enrolledDate' | 'progress' | 'duration'
  order: 'asc' | 'desc'
}
