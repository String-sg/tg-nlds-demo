'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  GraduationCap,
  BookOpen,
  BotMessageSquare,
  Ear,
  FileText,
  Send,
  Languages,
  Check,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { comingSoonToast } from '@/lib/coming-soon-toast'

interface App {
  key: string
  name: string
  description: string
  icon: LucideIcon
  category: string
  gradient?: string
  thirdParty?: boolean
}

const categoryDescriptions: Record<string, string> = {
  'Teacher workspace apps': 'Core tools for teaching, classroom management, and professional development',
  'Connected apps': 'Official MOE digital services and student support platforms',
  'More teaching tools': 'Additional apps and services to enhance your teaching experience',
}

const allApps: App[] = [
  // Teacher workspace apps
  {
    key: 'record',
    name: 'Record',
    description: 'Track attendance, results, and case management',
    icon: ClipboardList,
    category: 'Teacher workspace apps',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    key: 'marking',
    name: 'Marking',
    description: 'Mark assignments and provide feedback to students',
    icon: Check,
    category: 'Teacher workspace apps',
    gradient: 'from-green-400 to-green-600',
  },
  {
    key: 'calendar',
    name: 'Timetable',
    description: 'Review meetings and plan focus time',
    icon: CalendarDays,
    category: 'Teacher workspace apps',
    gradient: 'from-purple-400 to-purple-600',
  },
  {
    key: 'chat',
    name: 'Chat',
    description: 'Messages and mentions from teammates',
    icon: MessageSquare,
    category: 'Teacher workspace apps',
    gradient: 'from-cyan-400 to-cyan-600',
  },
  {
    key: 'teach',
    name: 'Teach',
    description: 'Create and deliver engaging lessons',
    icon: GraduationCap,
    category: 'Teacher workspace apps',
    gradient: 'from-orange-400 to-orange-600',
  },
  {
    key: 'learn',
    name: 'Learn',
    description: 'Professional development and resources',
    icon: BookOpen,
    category: 'Teacher workspace apps',
    gradient: 'from-pink-400 to-pink-600',
  },
  {
    key: 'assistant',
    name: 'Assistant',
    description: 'AI-powered teaching assistant for your classroom',
    icon: BotMessageSquare,
    category: 'Teacher workspace apps',
    gradient: 'from-indigo-400 to-indigo-600',
  },
  // Connected apps
  {
    key: 'allears',
    name: 'All ears',
    description: 'Student wellbeing and listening support',
    icon: Ear,
    category: 'Connected apps',
    gradient: 'from-teal-400 to-teal-600',
  },
  {
    key: 'termly',
    name: 'Termly checkin',
    description: 'Scheduled student check-ins and surveys',
    icon: FileText,
    category: 'Connected apps',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  {
    key: 'formsg',
    name: 'FormSG',
    description: 'Government digital form service for teachers',
    icon: Send,
    category: 'Connected apps',
    gradient: 'from-red-400 to-red-600',
  },
  // More teaching tools
  {
    key: 'langbuddy',
    name: 'LangBuddy',
    description: 'Language learning companion for students',
    icon: Languages,
    category: 'More teaching tools',
    gradient: 'from-violet-400 to-violet-600',
  },
  {
    key: 'markly',
    name: 'Mark.ly',
    description: 'Automated marking and feedback tool',
    icon: Check,
    category: 'More teaching tools',
    gradient: 'from-amber-400 to-amber-600',
  },
  {
    key: 'notebooklm',
    name: 'NotebookLM',
    description: 'AI-powered research and note-taking assistant',
    icon: Sparkles,
    category: 'More teaching tools',
    gradient: 'from-fuchsia-400 to-fuchsia-600',
    thirdParty: true,
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
    const categoryOrder = ['Teacher workspace apps', 'Connected apps', 'More teaching tools']
    const grouped = new Map<string, App[]>()

    filteredApps.forEach((app) => {
      const existing = grouped.get(app.category) ?? []
      grouped.set(app.category, [...existing, app])
    })

    return Array.from(grouped.entries()).sort(([a], [b]) => {
      const aIndex = categoryOrder.indexOf(a)
      const bIndex = categoryOrder.indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [filteredApps])

  return (
    <ScrollArea className="h-full w-full">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-8 py-10">
      {/* Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps by name or description..."
            className="h-12 rounded-xl border-stone-200 bg-white pl-12 pr-6 text-sm shadow-sm transition-shadow placeholder:text-stone-400 focus-visible:shadow-md"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-500">
            {filteredApps.length === allApps.length
              ? `${allApps.length} apps available`
              : `${filteredApps.length} of ${allApps.length} apps`}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Apps Grid by Category */}
      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="size-12 text-stone-300" />
          <h3 className="mt-4 text-base font-semibold text-stone-900">No apps found</h3>
          <p className="mt-2 text-sm text-stone-500">
            Try adjusting your search to find what you&apos;re looking for
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {appsByCategory.map(([category, apps]) => (
            <div key={category} className="space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-base font-semibold text-stone-900">
                  {category}
                </h2>
                {categoryDescriptions[category] && (
                  <p className="text-sm text-stone-600">
                    {categoryDescriptions[category]}
                  </p>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => {
                  const Icon = app.icon
                  return (
                    <Card
                      key={app.key}
                      className="group cursor-pointer overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => {
                        comingSoonToast.app(app.name)
                        onAppClick?.(app.key)
                      }}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${app.gradient || 'from-stone-400 to-stone-600'} shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md`}>
                            <Icon className="size-6 text-white" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm font-semibold text-stone-900">
                                {app.name}
                              </CardTitle>
                              {app.thirdParty && (
                                <Badge variant="secondary" className="text-[10px] font-medium">
                                  3rd party
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-xs text-stone-500 leading-relaxed">
                              {app.description}
                            </CardDescription>
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
    </ScrollArea>
  )
}
