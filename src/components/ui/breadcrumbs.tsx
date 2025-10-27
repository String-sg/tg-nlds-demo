'use client'

import * as React from 'react'
import { HomeIcon, ArrowLeftIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb'
import type { BreadcrumbItem } from '@/hooks/queries/use-route-breadcrumbs-query'

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  showHomeIcon?: boolean
  maxItems?: number
  isLoading?: boolean
}

export function Breadcrumbs({
  items,
  separator,
  className,
  showHomeIcon = true,
  maxItems,
  isLoading = false,
}: BreadcrumbsProps) {
  // Handle truncation for long breadcrumb trails
  const displayItems = React.useMemo(() => {
    if (!items || items.length === 0) {
      return []
    }

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

  // If no items, don't render anything
  if (!items || items.length === 0 || displayItems.length === 0) {
    return null
  }

  // Check if we should show a back button (for 2nd level and deeper)
  const showBackButton = items.length > 1

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Back button for 2nd level and deeper pages */}
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={items[items.length - 2]?.onClick}
          className="h-8 w-8 p-0"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
      )}

      <Breadcrumb>
        <BreadcrumbList>
          {isLoading && items.length === 0 && (
            <ShadcnBreadcrumbItem>
              <Skeleton className="h-4 w-24" />
            </ShadcnBreadcrumbItem>
          )}
          {displayItems.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <React.Fragment key={`ellipsis-${index}`}>
                  {index > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
                  <ShadcnBreadcrumbItem>
                    <BreadcrumbEllipsis />
                  </ShadcnBreadcrumbItem>
                </React.Fragment>
              )
            }

            const isHome = item.label === 'Home'
            const isLast = index === displayItems.length - 1
            // Never show Home icon
            const shouldShowHomeIcon = false

            return (
              <React.Fragment key={item.path}>
                {index > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
                <ShadcnBreadcrumbItem>
                  {item.isLoading ? (
                    // Show skeleton for loading items
                    <Skeleton className="h-4 w-20" />
                  ) : item.isActive ? (
                    <BreadcrumbPage className={cn(
                      shouldShowHomeIcon ? 'flex items-center gap-1' : '',
                      isHome && 'pl-2'
                    )}>
                      {shouldShowHomeIcon && (
                        <HomeIcon className="h-4 w-4" />
                      )}
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={(e) => {
                        e.preventDefault()
                        item.onClick?.()
                      }}
                      className={cn(
                        'cursor-pointer',
                        shouldShowHomeIcon && 'flex items-center gap-1',
                        isHome && 'pl-2'
                      )}
                    >
                      {shouldShowHomeIcon && (
                        <HomeIcon className="h-4 w-4" />
                      )}
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </ShadcnBreadcrumbItem>
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

// Re-export the renamed component for backward compatibility
export { ShadcnBreadcrumbItem as BreadcrumbItem }
export { BreadcrumbSeparator }