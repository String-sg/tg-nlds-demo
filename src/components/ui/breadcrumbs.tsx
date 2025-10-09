'use client'

import * as React from 'react'
import { HomeIcon, ArrowLeftIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb'
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
            // Don't show Home icon when we have a back button
            const shouldShowHomeIcon = isHome && showHomeIcon && !showBackButton

            return (
              <React.Fragment key={item.path}>
                {index > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
                <ShadcnBreadcrumbItem>
                  {item.isActive ? (
                    <BreadcrumbPage className={shouldShowHomeIcon ? 'flex items-center gap-1' : ''}>
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
                        shouldShowHomeIcon && 'flex items-center gap-1'
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