'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import type { BreadcrumbItem } from '@/hooks/use-breadcrumbs'

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
  actions?: PageAction[]
  backButton?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  breadcrumbs?: BreadcrumbItem[]
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function PageLayout({
  title,
  subtitle,
  actions = [],
  backButton,
  breadcrumbs,
  children,
  className,
  headerClassName,
  contentClassName,
}: PageLayoutProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Page Header with Actions */}
      <div className={cn('border-b bg-background', headerClassName)}>
        <div className="flex flex-col px-6 py-4">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="mb-3">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              {/* Back Button */}
              {backButton && !breadcrumbs && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={backButton.onClick}
                  className="w-fit -ml-2 mb-2 text-muted-foreground hover:text-foreground"
                >
                  {backButton.icon && <backButton.icon className="h-4 w-4 mr-2" />}
                  {backButton.label}
                </Button>
              )}

              {/* Title and Subtitle */}
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && (
                <div className="text-sm text-muted-foreground">{subtitle}</div>
              )}
            </div>

            {/* Action Buttons */}
            {actions.length > 0 && (
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn('gap-2', action.className)}
                  >
                    {action.icon && <action.icon className="h-4 w-4" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className={cn('flex-1 overflow-auto', contentClassName)}>
        {children}
      </div>
    </div>
  )
}