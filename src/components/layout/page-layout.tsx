'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface PageAction {
  label: string
  icon?: LucideIcon
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  className?: string
}

interface PageLayoutProps {
  title: string
  subtitle?: React.ReactNode
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function PageLayout({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  contentClassName,
}: PageLayoutProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Simple Content Header - for pages that still need internal titles */}
      {(title || subtitle) && (
        <div className={cn('border-b bg-background', headerClassName)}>
          <div className="flex flex-col px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {/* Title and Subtitle */}
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {subtitle && (
                  <div className="text-sm text-muted-foreground">{subtitle}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={cn('flex-1 overflow-auto', contentClassName)}>
        {children}
      </div>
    </div>
  )
}