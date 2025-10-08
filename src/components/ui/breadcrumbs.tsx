'use client'

import * as React from 'react'
import { ChevronRightIcon, HomeIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { BreadcrumbItem } from '@/hooks/use-breadcrumbs'

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  showHomeIcon?: boolean
  maxItems?: number
}

export function Breadcrumbs({
  items,
  separator,
  className,
  showHomeIcon = true,
  maxItems,
}: BreadcrumbsProps) {
  // If no items, don't render anything
  if (!items || items.length === 0) {
    return null
  }

  // Handle truncation for long breadcrumb trails
  const displayItems = React.useMemo(() => {
    if (!maxItems || items.length <= maxItems) {
      return items
    }

    // Keep first, last, and some middle items
    const firstItem = items[0]
    const lastItems = items.slice(-2)
    const truncated: (BreadcrumbItem | 'ellipsis')[] = [
      firstItem,
      'ellipsis',
      ...lastItems,
    ]

    return truncated
  }, [items, maxItems])

  const separatorElement = separator || (
    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
  )

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-2 text-sm">
        {displayItems.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <React.Fragment key={`ellipsis-${index}`}>
                {index > 0 && (
                  <li aria-hidden="true" className="flex items-center">
                    {separatorElement}
                  </li>
                )}
                <li className="flex items-center">
                  <span className="text-muted-foreground">...</span>
                </li>
              </React.Fragment>
            )
          }

          const isHome = item.label === 'Home'
          const isLast = index === displayItems.length - 1

          return (
            <React.Fragment key={item.path}>
              {index > 0 && (
                <li aria-hidden="true" className="flex items-center">
                  {separatorElement}
                </li>
              )}
              <li className="flex items-center">
                {item.isActive ? (
                  <span
                    className={cn(
                      'font-medium text-foreground',
                      isHome && showHomeIcon && 'flex items-center gap-1'
                    )}
                    aria-current="page"
                  >
                    {isHome && showHomeIcon && (
                      <HomeIcon className="h-4 w-4" />
                    )}
                    {item.label}
                  </span>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={item.onClick}
                    className={cn(
                      'h-auto p-0 font-normal text-muted-foreground hover:text-foreground',
                      isHome && showHomeIcon && 'flex items-center gap-1'
                    )}
                  >
                    {isHome && showHomeIcon && (
                      <HomeIcon className="h-4 w-4" />
                    )}
                    {item.label}
                  </Button>
                )}
              </li>
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

// Breadcrumb Item component for more control
export function BreadcrumbItem({
  children,
  isActive = false,
  onClick,
  className,
}: {
  children: React.ReactNode
  isActive?: boolean
  onClick?: () => void
  className?: string
}) {
  if (isActive) {
    return (
      <span
        className={cn('font-medium text-foreground', className)}
        aria-current="page"
      >
        {children}
      </span>
    )
  }

  return (
    <Button
      variant="link"
      size="sm"
      onClick={onClick}
      className={cn(
        'h-auto p-0 font-normal text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </Button>
  )
}

// Breadcrumb Separator component
export function BreadcrumbSeparator({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <span aria-hidden="true" className={cn('text-muted-foreground', className)}>
      {children || <ChevronRightIcon className="h-4 w-4" />}
    </span>
  )
}