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
  Users,
  Briefcase,
  School,
  Building2,
  DollarSign,
  TrendingUp,
  Globe,
  Shield,
  MonitorSmartphone,
  Video,
  MessageCircle,
  Bot,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AppDetail } from '@/components/explore/app-detail'
import { comingSoonToast } from '@/lib/coming-soon-toast'

interface Developer {
  name: string
  website?: string
  support?: string
}

interface AppMetadata {
  rating?: number
  ratingCount?: number
  ageRating?: string
  chartPosition?: number
  chartCategory?: string
  languages: string[]
  size?: string
}

interface App {
  key: string
  name: string
  description: string
  tagline: string
  fullDescription: string
  icon: LucideIcon
  category: string
  gradient?: string
  thirdParty?: boolean
  developer: Developer
  metadata: AppMetadata
  features?: string[]
  screenshots?: string[]
  inAppPurchases?: boolean
  platforms?: string[]
}

const categoryDescriptions: Record<string, string> = {
  'Recommended for you': "Because it's an exam period",
  'Classes and students': 'Tools for classroom management, student assessment, and academic support',
  'Parents and communications': 'Connect with parents and manage school-home communication',
  'School life & Admin': 'Administrative tools and school management systems',
  'Growth and community': 'Professional development and community engagement platforms',
  'Digital innovation and enhancements': 'Cutting-edge digital tools and productivity enhancers',
}

const allApps: App[] = [
  // Teacher workspace apps
  {
    key: 'record',
    name: 'Record',
    tagline: 'Track everything that matters',
    description: 'Track attendance, results, and case management',
    fullDescription: `Record is your comprehensive student tracking system that brings together attendance, academic results, and case management in one unified platform. Monitor student progress, identify at-risk learners, and maintain detailed records with ease.

Built specifically for Singapore educators, Record integrates seamlessly with MOE systems and follows data protection guidelines. Track daily attendance, record academic results across multiple assessment types, and manage student welfare cases with full confidentiality.

With intelligent analytics and automated reports, Record helps you focus on what matters most—supporting your students' growth and wellbeing.`,
    icon: ClipboardList,
    category: 'Teacher workspace apps',
    gradient: 'from-blue-400 to-blue-600',
    developer: {
      name: 'MOE Technology Division',
      website: 'https://record.moe.gov.sg',
      support: 'https://support.record.moe.gov.sg',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 523,
      ageRating: '4+',
      chartPosition: 3,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '38 MB',
    },
    features: [
      'Daily attendance tracking',
      'Academic results management',
      'Student case management',
      'Automated reports and analytics',
      'MOE system integration',
    ],
    platforms: ['Web', 'iPad', 'iPhone'],
    inAppPurchases: false,
  },
  {
    key: 'marking',
    name: 'Marking',
    tagline: 'Grade smarter, not harder',
    description: 'Mark assignments and provide feedback to students',
    fullDescription: `Marking transforms the way you assess student work with intelligent tools that speed up grading while maintaining the personal touch your students deserve. From quick quizzes to detailed essay assessments, Marking adapts to your teaching style.

Use customizable rubrics, provide rich feedback with text and audio comments, and track student progress over time. The platform supports all assessment types including multiple choice, short answer, essays, and project work—all accessible on any device.

With offline mode and batch processing capabilities, Marking helps you get through stacks of assignments efficiently while providing meaningful feedback that helps students grow.`,
    icon: Check,
    category: 'Teacher workspace apps',
    gradient: 'from-green-400 to-green-600',
    developer: {
      name: 'MOE Technology Division',
      website: 'https://marking.moe.gov.sg',
      support: 'https://support.marking.moe.gov.sg',
    },
    metadata: {
      rating: 4.8,
      ratingCount: 687,
      ageRating: '4+',
      chartPosition: 1,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '52 MB',
    },
    features: [
      'Customizable rubrics',
      'Audio and text feedback',
      'Batch grading',
      'Offline mode',
      'Progress tracking',
    ],
    platforms: ['Web', 'iPad', 'iPhone', 'Mac'],
    inAppPurchases: false,
  },
  {
    key: 'calendar',
    name: 'Timetable',
    tagline: 'Your schedule, simplified',
    description: 'Review meetings and plan focus time',
    fullDescription: `Timetable is your intelligent scheduling companion that brings clarity to your busy teaching day. View your class schedule, meetings, and deadlines in one beautiful interface that works across all your devices.

Plan your lessons, block focus time, and coordinate with colleagues effortlessly. Timetable automatically syncs with school calendars and reminds you of upcoming commitments. See your week at a glance or dive into daily agendas with smart suggestions for optimal time management.

Integration with other MOE tools means your attendance records, marking deadlines, and meeting requests all appear in one unified calendar view.`,
    icon: CalendarDays,
    category: 'Teacher workspace apps',
    gradient: 'from-purple-400 to-purple-600',
    developer: {
      name: 'MOE Technology Division',
      website: 'https://timetable.moe.gov.sg',
      support: 'https://support.timetable.moe.gov.sg',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 412,
      ageRating: '4+',
      chartPosition: 7,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '28 MB',
    },
    features: [
      'Unified calendar view',
      'Smart reminders',
      'Meeting coordination',
      'Focus time blocking',
      'Cross-device sync',
    ],
    platforms: ['Web', 'iPad', 'iPhone', 'Mac'],
    inAppPurchases: false,
  },
  {
    key: 'chat',
    name: 'Chat',
    tagline: 'Connect with your team instantly',
    description: 'Messages and mentions from teammates',
    fullDescription: `Chat keeps you connected with colleagues, students, and parents through secure, professional messaging. Create channels for different purposes, share resources, and coordinate activities with real-time communication.

Built with education in mind, Chat includes moderation tools, scheduled messages, and read receipts to ensure clear communication. Group chats for class projects, direct messages for quick questions, and broadcast channels for important announcements all in one platform.

With end-to-end encryption and compliance with data protection regulations, Chat provides a safe space for educational communication that respects privacy and confidentiality.`,
    icon: MessageSquare,
    category: 'Teacher workspace apps',
    gradient: 'from-cyan-400 to-cyan-600',
    developer: {
      name: 'MOE Technology Division',
      website: 'https://chat.moe.gov.sg',
      support: 'https://support.chat.moe.gov.sg',
    },
    metadata: {
      rating: 4.4,
      ratingCount: 892,
      ageRating: '4+',
      chartPosition: 12,
      chartCategory: 'Social Networking',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '65 MB',
    },
    features: [
      'Real-time messaging',
      'Channel organization',
      'File sharing',
      'Moderation tools',
      'End-to-end encryption',
    ],
    platforms: ['Web', 'iPad', 'iPhone', 'Mac', 'Android'],
    inAppPurchases: false,
  },
  {
    key: 'teach',
    name: 'Teach',
    tagline: 'Create lessons that inspire',
    description: 'Create and deliver engaging lessons',
    fullDescription: `Teach empowers you to create, organize, and deliver engaging lessons that captivate your students. Build interactive presentations, incorporate multimedia content, and adapt your teaching materials for different learning styles—all from one intuitive platform.

Access a library of curriculum-aligned resources, collaborate with fellow educators, and track student engagement in real-time during lessons. From traditional slides to interactive activities, Teach supports diverse teaching methodologies and makes lesson planning efficient.

With offline access and seamless device switching, you can prepare lessons at home and deliver them in class without missing a beat. Your teaching materials are always available when inspiration strikes.`,
    icon: GraduationCap,
    category: 'Teacher workspace apps',
    gradient: 'from-orange-400 to-orange-600',
    developer: {
      name: 'MOE Technology Division',
      website: 'https://teach.moe.gov.sg',
      support: 'https://support.teach.moe.gov.sg',
    },
    metadata: {
      rating: 4.7,
      ratingCount: 634,
      ageRating: '4+',
      chartPosition: 5,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '78 MB',
    },
    features: [
      'Interactive lesson builder',
      'Curriculum-aligned resources',
      'Multimedia support',
      'Real-time engagement tracking',
      'Offline access',
    ],
    platforms: ['Web', 'iPad', 'Mac'],
    inAppPurchases: false,
  },
  {
    key: 'learn',
    name: 'Learn',
    tagline: 'Grow as an educator',
    description: 'Professional development and resources',
    fullDescription: `Learn is your gateway to continuous professional development, offering courses, workshops, and resources tailored to Singapore educators. From classroom management techniques to subject-specific pedagogies, Learn helps you stay current with educational best practices.

Earn professional development hours, connect with mentors, and join communities of practice around topics that matter to you. Access video tutorials, research articles, and practical guides created by experienced educators and MOE specialists.

Track your learning journey, set development goals, and receive personalized recommendations based on your interests and teaching context. Invest in yourself and your students with Learn.`,
    icon: BookOpen,
    category: 'Teacher workspace apps',
    gradient: 'from-pink-400 to-pink-600',
    developer: {
      name: 'MOE Academy',
      website: 'https://learn.moe.gov.sg',
      support: 'https://support.learn.moe.gov.sg',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 445,
      ageRating: '4+',
      chartPosition: 15,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '42 MB',
    },
    features: [
      'Professional development courses',
      'Mentorship programs',
      'Communities of practice',
      'Resource library',
      'Learning pathway tracking',
    ],
    platforms: ['Web', 'iPad', 'iPhone'],
    inAppPurchases: false,
  },
  {
    key: 'assistant',
    name: 'Assistant',
    tagline: 'Your AI teaching companion',
    description: 'AI-powered teaching assistant for your classroom',
    fullDescription: `Assistant brings the power of artificial intelligence to your classroom, helping you work smarter with personalized insights, automated administrative tasks, and intelligent recommendations. From generating lesson ideas to analyzing student performance patterns, Assistant is your trusted teaching companion.

Get help drafting worksheets, creating differentiated materials, and finding relevant resources. Assistant learns from your teaching style and suggests improvements while respecting your pedagogical approach. All AI-generated content is curriculum-aligned and reviewed for appropriateness.

With privacy at its core, Assistant processes data securely and never shares student information. It's designed to augment—not replace—your professional judgment, giving you more time for what matters: meaningful interactions with students.`,
    icon: BotMessageSquare,
    category: 'Teacher workspace apps',
    gradient: 'from-indigo-400 to-indigo-600',
    developer: {
      name: 'MOE AI Lab',
      website: 'https://assistant.moe.gov.sg',
      support: 'https://support.assistant.moe.gov.sg',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 289,
      ageRating: '4+',
      chartPosition: 18,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '56 MB',
    },
    features: [
      'AI-powered lesson planning',
      'Automated worksheet generation',
      'Student performance insights',
      'Differentiated material creation',
      'Privacy-first design',
    ],
    platforms: ['Web', 'iPad', 'Mac'],
    inAppPurchases: false,
  },
  // Connected apps
  {
    key: 'allears',
    name: 'All Ears',
    tagline: 'Listen, support, empower',
    description: 'Student wellbeing and listening support',
    fullDescription: `All Ears provides a safe, confidential platform for students to express their concerns and seek support. As an educator, you can monitor student wellbeing indicators, respond to concerns promptly, and coordinate with counselors and support staff seamlessly.

The platform uses evidence-based screening tools and creates a supportive environment where students feel heard. Early warning systems alert you to students who may need additional support, while respecting privacy and maintaining appropriate boundaries.

Integrated with school counseling services, All Ears ensures that student welfare concerns are addressed holistically with proper documentation and follow-up protocols in place.`,
    icon: Ear,
    category: 'Connected apps',
    gradient: 'from-teal-400 to-teal-600',
    developer: {
      name: 'MOE Student Support Services',
      website: 'https://allears.moe.gov.sg',
      support: 'https://support.allears.moe.gov.sg',
    },
    metadata: {
      rating: 4.8,
      ratingCount: 567,
      ageRating: '12+',
      chartPosition: 4,
      chartCategory: 'Health & Fitness',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '34 MB',
    },
    features: [
      'Confidential student check-ins',
      'Wellbeing indicators',
      'Counselor coordination',
      'Early warning system',
      'Documentation tools',
    ],
    platforms: ['Web', 'iPad', 'iPhone'],
    inAppPurchases: false,
  },
  {
    key: 'termly',
    name: 'Termly Check-in',
    tagline: 'Regular touchpoints for growth',
    description: 'Scheduled student check-ins and surveys',
    fullDescription: `Termly Check-in helps you maintain regular, meaningful conversations with every student through structured surveys and reflection activities. Gather feedback on student experiences, identify areas for improvement, and track social-emotional development over time.

Customizable check-in templates align with school objectives while giving students voice in their learning journey. Aggregate responses provide class-level insights while protecting individual privacy. Set up automated schedules or deploy check-ins as needed throughout the term.

Results integrate with student records, helping you prepare for parent-teacher conferences and identify students who would benefit from additional support or enrichment opportunities.`,
    icon: FileText,
    category: 'Connected apps',
    gradient: 'from-emerald-400 to-emerald-600',
    developer: {
      name: 'MOE Student Services',
      website: 'https://termly.moe.gov.sg',
      support: 'https://support.termly.moe.gov.sg',
    },
    metadata: {
      rating: 4.3,
      ratingCount: 234,
      ageRating: '4+',
      chartPosition: 28,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '22 MB',
    },
    features: [
      'Scheduled surveys',
      'Reflection activities',
      'Social-emotional tracking',
      'Class-level analytics',
      'Conference preparation',
    ],
    platforms: ['Web', 'iPad', 'iPhone'],
    inAppPurchases: false,
  },
  {
    key: 'formsg',
    name: 'FormSG',
    tagline: 'Government forms made simple',
    description: 'Government digital form service for teachers',
    fullDescription: `FormSG is Singapore's trusted government digital form service, now optimized for educators. Create secure forms for consent collection, event registration, surveys, and administrative requests with built-in data protection and compliance features.

No coding required—build forms with drag-and-drop simplicity while maintaining government-grade security. All data is encrypted and stored securely, meeting strict public sector requirements. Form responses can be integrated with school systems or exported for further analysis.

Whether collecting trip consent forms, gathering feedback, or managing school event registrations, FormSG provides a professional, secure solution that parents and staff trust.`,
    icon: Send,
    category: 'Connected apps',
    gradient: 'from-red-400 to-red-600',
    developer: {
      name: 'GovTech Singapore',
      website: 'https://form.gov.sg',
      support: 'https://go.gov.sg/formsg-help',
    },
    metadata: {
      rating: 4.7,
      ratingCount: 1243,
      ageRating: '4+',
      chartPosition: 2,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '18 MB',
    },
    features: [
      'Drag-and-drop form builder',
      'Government-grade security',
      'Data encryption',
      'Response management',
      'System integration',
    ],
    platforms: ['Web', 'iPad', 'iPhone'],
    inAppPurchases: false,
  },
  // More teaching tools
  {
    key: 'langbuddy',
    name: 'LangBuddy',
    tagline: 'Master languages with AI',
    description: 'Language learning companion for students',
    fullDescription: `LangBuddy is an AI-powered language learning companion that helps students master English, Mother Tongue Languages, and foreign languages through personalized practice and instant feedback. Students practice speaking, writing, and comprehension at their own pace with intelligent tutoring.

The platform adapts to each student's proficiency level, providing appropriate challenges and scaffolded support. Voice recognition technology gives pronunciation feedback, while natural language processing helps with grammar and composition. Teachers can assign specific practice modules and monitor student progress.

Aligned with MOE language syllabuses, LangBuddy supplements classroom instruction with engaging practice that builds confidence and fluency outside regular lesson time.`,
    icon: Languages,
    category: 'More teaching tools',
    gradient: 'from-violet-400 to-violet-600',
    developer: {
      name: 'EdTech Innovations',
      website: 'https://langbuddy.com.sg',
      support: 'https://support.langbuddy.com.sg',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 378,
      ageRating: '4+',
      chartPosition: 11,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA', 'JA', 'FR', 'ES'],
      size: '95 MB',
    },
    features: [
      'AI-powered conversation practice',
      'Pronunciation feedback',
      'Grammar assistance',
      'Personalized learning paths',
      'Progress tracking for teachers',
    ],
    platforms: ['Web', 'iPad', 'iPhone', 'Android'],
    inAppPurchases: true,
  },
  {
    key: 'markly',
    name: 'Mark.ly',
    tagline: 'Reimagining marking with AI',
    description: 'Automated marking and feedback tool',
    fullDescription: `Mark.ly is an AI-powered assessment tool that transforms how educators provide feedback to students. With advanced natural language processing, it can grade written assignments, provide constructive feedback, and identify learning gaps—all while maintaining the personal touch that students need.

The platform supports multiple assessment types including essays, short answers, and creative writing. Teachers can customize rubrics, set grading criteria, and review AI suggestions before finalizing marks. Mark.ly learns from your feedback style over time, becoming more aligned with your teaching philosophy.

Designed specifically for Singapore MOE educators, Mark.ly integrates seamlessly with existing systems and follows local curriculum guidelines. Save hours on marking while providing more detailed, actionable feedback to every student.`,
    icon: Check,
    category: 'More teaching tools',
    gradient: 'from-amber-400 to-amber-600',
    developer: {
      name: 'MOE Digital Innovation',
      website: 'https://markly.moe.gov.sg',
      support: 'https://support.markly.moe.gov.sg',
    },
    metadata: {
      rating: 4.7,
      ratingCount: 342,
      ageRating: '4+',
      chartPosition: 8,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '45 MB',
    },
    features: [
      'AI-powered essay grading',
      'Customizable rubrics',
      'Batch marking support',
      'Detailed analytics',
      'Integration with Student Learning Space',
    ],
    platforms: ['Web', 'iPad', 'Mac'],
    inAppPurchases: false,
  },
  {
    key: 'notebooklm',
    name: 'NotebookLM',
    tagline: 'AI research assistant',
    description: 'AI-powered research and note-taking assistant',
    fullDescription: `NotebookLM is Google's AI-powered research and note-taking tool that helps educators and students organize information, synthesize ideas, and generate insights from documents. Upload your teaching materials, research papers, or curriculum documents, and let NotebookLM help you extract key information and make connections.

The AI assistant can answer questions about your documents, create summaries, suggest related concepts, and help you prepare lesson materials. Unlike generic AI tools, NotebookLM grounds all responses in your uploaded sources, ensuring accuracy and relevance to your specific teaching context.

Perfect for curriculum research, professional development, and preparing comprehensive lesson plans. NotebookLM keeps your sources organized and makes information retrieval effortless.`,
    icon: Sparkles,
    category: 'More teaching tools',
    gradient: 'from-fuchsia-400 to-fuchsia-600',
    thirdParty: true,
    developer: {
      name: 'Google Labs',
      website: 'https://notebooklm.google.com',
      support: 'https://support.google.com/notebooklm',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 189,
      ageRating: '12+',
      chartPosition: 24,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'JA', 'ES', 'FR', 'DE', 'IT', 'PT', 'KO'],
      size: '12 MB',
    },
    features: [
      'Document-grounded AI responses',
      'Automatic summarization',
      'Source organization',
      'Question answering',
      'Concept mapping',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
]

interface ExploreContentProps {
  onAppClick?: (appKey: string) => void
}

export function ExploreContent({ onAppClick }: ExploreContentProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<App | null>(null)

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
    const categoryOrder = [
      'Recommended for you',
      'Classes and students',
      'Parents and communications',
      'School life & Admin',
      'Growth and community',
      'Digital innovation and enhancements',
    ]
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
    <>
      <ScrollArea className="h-full w-full">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-8 py-10">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-stone-900">Discover</h1>
            <p className="text-base text-stone-600">
              Find all MOE digital solutions for educator related jobs
            </p>
          </div>

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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => {
                      const Icon = app.icon
                      return (
                        <Card
                          key={app.key}
                          className="group cursor-pointer overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          onClick={() => {
                            setSelectedApp(app)
                            onAppClick?.(app.key)
                          }}
                        >
                          <CardHeader className="p-5">
                            <div className="flex items-start gap-4">
                              {/* Logo Area */}
                              <div className={`flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${app.gradient || 'from-stone-400 to-stone-600'} shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md`}>
                                <Icon className="size-8 text-white" />
                              </div>

                              {/* App Info */}
                              <div className="flex-1 space-y-1.5 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <CardTitle className="text-base font-semibold text-stone-900 leading-tight">
                                    {app.name}
                                  </CardTitle>
                                  {app.thirdParty && (
                                    <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
                                      3rd party
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="text-sm text-stone-600 leading-snug line-clamp-2">
                                  {app.tagline}
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

      {/* App Detail Dialog - Outside ScrollArea for proper portal behavior */}
      <Dialog open={selectedApp !== null} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="h-[90vh] max-w-4xl p-0">
          {selectedApp && (
            <AppDetail
              app={selectedApp}
              onClose={() => setSelectedApp(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
