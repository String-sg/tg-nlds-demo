'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface PageAction {
  label: string
  icon?: LucideIcon
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  className?: string
}

interface PageLayoutProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  titlePrefix?: React.ReactNode
  titleSuffix?: React.ReactNode
  headerContent?: React.ReactNode
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function PageLayout({
  title,
  subtitle,
  titlePrefix,
  titleSuffix,
  headerContent,
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
          <div className="px-6 py-4">
            <div className="mx-auto w-full max-w-5xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Title Prefix (e.g., avatar) */}
                  {titlePrefix}

                  {/* Title and Subtitle */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                      {/* Title Suffix (e.g., badge) */}
                      {titleSuffix}
                    </div>
                    {subtitle && (
                      <div className="text-sm text-muted-foreground">{subtitle}</div>
                    )}
                  </div>
                </div>
                {/* Additional Header Content */}
                {headerContent && (
                  <div>{headerContent}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className={contentClassName}>
          {children}
        </div>
      </ScrollArea>
    </div>
  )
}