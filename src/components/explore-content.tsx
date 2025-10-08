'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Zap,
  Home,
  Users,
  ClipboardList,
  FilePen,
  CalendarDays,
  PieChart,
  Inbox,
  Folder,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface App {
  key: string
  name: string
  description: string
  icon: LucideIcon
  category: string
  isPinned?: boolean
}

const allApps: App[] = [
  {
    key: 'roundup',
    name: 'Insights',
    description: 'Summaries and noteworthy updates from your team',
    icon: Zap,
    category: 'Overview',
    isPinned: true,
  },
  {
    key: 'home',
    name: 'Home',
    description: 'Your personalized dashboard and quick actions',
    icon: Home,
    category: 'Overview',
    isPinned: true,
  },
  {
    key: 'classroom',
    name: 'Classroom',
    description: 'View and manage students, attendance, and grades',
    icon: Users,
    category: 'Teaching',
    isPinned: true,
  },
  {
    key: 'records',
    name: 'Records',
    description: 'Track attendance, results, and case management',
    icon: ClipboardList,
    category: 'Administration',
    isPinned: true,
  },
  {
    key: 'draft',
    name: 'Drafts',
    description: 'Capture thoughts and save drafts to revisit later',
    icon: FilePen,
    category: 'Communication',
    isPinned: false,
  },
  {
    key: 'calendar',
    name: 'Calendar',
    description: 'Review meetings and plan focus time',
    icon: CalendarDays,
    category: 'Planning',
    isPinned: false,
  },
  {
    key: 'analysis',
    name: 'Analysis',
    description: 'Run reports and review metrics for insights',
    icon: PieChart,
    category: 'Analytics',
    isPinned: false,
  },
  {
    key: 'inbox',
    name: 'Inbox',
    description: 'Messages and mentions from teammates',
    icon: Inbox,
    category: 'Communication',
    isPinned: false,
  },
  {
    key: 'files',
    name: 'Files',
    description: 'Manage and organize your documents',
    icon: Folder,
    category: 'Resources',
    isPinned: false,
  },
]

interface ExploreContentProps {
  onAppClick?: (appKey: string) => void
}

export function ExploreContent({ onAppClick }: ExploreContentProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredApps = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return allApps

    return allApps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const appsByCategory = useMemo(() => {
    const grouped = new Map<string, App[]>()

    filteredApps.forEach((app) => {
      const existing = grouped.get(app.category) ?? []
      grouped.set(app.category, [...existing, app])
    })

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredApps])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-16">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 space-y-4 pt-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps by name, description, or category..."
            className="h-14 rounded-xl border-border bg-background pl-12 pr-6 text-base shadow-sm transition-shadow placeholder:text-muted-foreground focus-visible:shadow-md"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredApps.length === allApps.length
              ? `${allApps.length} apps available`
              : `${filteredApps.length} of ${allApps.length} apps`}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-sm font-medium text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Apps Grid by Category */}
      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No apps found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search to find what you&apos;re looking for
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {appsByCategory.map(([category, apps]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => {
                  const Icon = app.icon
                  return (
                    <Card
                      key={app.key}
                      className="group relative cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                      onClick={() => onAppClick?.(app.key)}
                    >
                      {app.isPinned && (
                        <div className="absolute right-3 top-3 z-10">
                          <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            Pinned
                          </div>
                        </div>
                      )}
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                            <Icon className="size-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <CardTitle className="text-base">{app.name}</CardTitle>
                            <CardDescription className="text-sm">{app.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
