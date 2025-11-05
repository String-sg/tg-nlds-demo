'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AvatarItem {
  src?: string
  alt: string
  fallback: string
  fallbackClassName?: string
}

interface AvatarStackProps {
  avatars: AvatarItem[]
  max?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  layout?: 'horizontal' | 'badge' // New layout option
}

interface BadgeSizeConfig {
  parent: string
  student: string
  parentText: string
  studentText: string
  parentRing: string
  studentRing: string
  offset: string
}

// Size configurations for badge layout (parent-student)
const badgeSizes: Record<'sm' | 'md' | 'lg', BadgeSizeConfig> = {
  sm: {
    parent: 'size-10',
    student: 'size-6',
    parentText: 'text-xs',
    studentText: 'text-xs',
    parentRing: 'ring-0',
    studentRing: 'ring-2',
    offset: '-bottom-1.5 -right-0.5',
  },
  md: {
    parent: 'size-12',
    student: 'size-8',
    parentText: 'text-xs',
    studentText: 'text-xs',
    parentRing: 'ring-0',
    studentRing: 'ring-2',
    offset: '-bottom-2 -right-1',
  },
  lg: {
    parent: 'size-14',
    student: 'size-9',
    parentText: 'text-sm',
    studentText: 'text-xs',
    parentRing: 'ring-0',
    studentRing: 'ring-2',
    offset: '-bottom-2.5 -right-1.5',
  },
}

// Original horizontal stack sizes
const sizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
}

const overlapClasses = {
  sm: '-ml-2',
  md: '-ml-3',
  lg: '-ml-4',
}

const borderClasses = {
  sm: 'ring-2',
  md: 'ring-2',
  lg: 'ring-3',
}

const textClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function AvatarStack({ 
  avatars, 
  max = 3, 
  size = 'md',
  className,
  layout = 'badge' // Default to badge layout (parent-student)
}: AvatarStackProps) {
  const displayAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  // Badge layout: Parent avatar with student avatar as small badge
  if (layout === 'badge' && avatars.length >= 2) {
    const parentAvatar = avatars[0] // First avatar is parent (bigger)
    const studentAvatar = avatars[1] // Second avatar is student (smaller badge)
    const config = badgeSizes[size]

    return (
      <div className={cn('relative inline-block', className)}>
        {/* Parent Avatar (larger) - Always relative positioned */}
        <Avatar
          data-avatar-parent
          className={cn(
            config.parent,
            config.parentRing,
            'ring-white'
          )}
        >
          <AvatarImage src={parentAvatar.src} alt={parentAvatar.alt} />
          <AvatarFallback 
            className={cn(
              config.parentText,
              parentAvatar.fallbackClassName
            )}
          >
            {parentAvatar.fallback}
          </AvatarFallback>
        </Avatar>

        {/* Student Avatar Badge (smaller, positioned at bottom-right) */}
        <Avatar
          data-avatar-student
          className={cn(
            config.student,
            config.studentRing,
            'ring-white',
            'absolute',
            config.offset
          )}
        >
          <AvatarImage src={studentAvatar.src} alt={studentAvatar.alt} />
          <AvatarFallback 
            className={cn(
              config.studentText,
              studentAvatar.fallbackClassName
            )}
          >
            {studentAvatar.fallback}
          </AvatarFallback>
        </Avatar>
      </div>
    )
  }

  // Horizontal layout: Traditional side-by-side stack
  return (
    <div className={cn('flex items-center', className)}>
      {displayAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          className={cn(
            sizeClasses[size],
            borderClasses[size],
            'ring-white',
            index > 0 && overlapClasses[size]
          )}
        >
          <AvatarImage src={avatar.src} alt={avatar.alt} />
          <AvatarFallback 
            className={cn(
              textClasses[size],
              avatar.fallbackClassName
            )}
          >
            {avatar.fallback}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={cn(
            sizeClasses[size],
            overlapClasses[size],
            borderClasses[size],
            'ring-white',
            'flex items-center justify-center rounded-full bg-stone-100 text-stone-600 font-medium',
            textClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

