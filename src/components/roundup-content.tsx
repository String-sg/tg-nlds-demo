'use client'

import { useEffect, useRef, useState } from 'react'
import { SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoundupContentProps {
  onPrepForMeeting?: () => void
}

interface RoundupItem {
  id: string
  badge: string
  title: string
  date: string
  description: string
  actions: {
    label: string
    icon?: typeof SparklesIcon
    variant?: 'default' | 'outline'
    onClick?: () => void
  }[]
}

const mockRoundupItems: RoundupItem[] = [
  {
    id: '1',
    badge: 'Parents Engagement',
    title: 'Upcoming Parent Teacher Meeting (PTM)',
    date: '14 Oct 2025 (7 days left)',
    description:
      'On October 14, 2025, you will meet with six parents, and you have 2 outstanding information from two students.',
    actions: [
      { label: 'Prep for Meeting', icon: SparklesIcon, variant: 'outline' },
    ],
  },
  {
    id: '2',
    badge: 'Student Performance',
    title: 'Weekly Progress Review',
    date: '10 Oct 2025 (3 days left)',
    description:
      'Review weekly performance data for all students. Three students need additional support in mathematics.',
    actions: [
      { label: 'Analyze Performance', icon: SparklesIcon, variant: 'outline' },
    ],
  },
  {
    id: '3',
    badge: 'Student Wellbeing',
    title: 'Bullying Case Data Collection',
    date: '20 Oct 2025 (17 days left)',
    description:
      'Prepare documentation for two reported bullying cases requiring follow-up interviews.',
    actions: [
      { label: 'Prepare Documentation', icon: SparklesIcon, variant: 'outline' },
    ],
  },
]

export function RoundupContent({ onPrepForMeeting }: RoundupContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const visualGap = 24
  const scaleStep = 0.035
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  // Update the first roundup item's action onClick
  const roundupItems = mockRoundupItems.map((item) => {
    if (item.id === '1') {
      return {
        ...item,
        actions: item.actions.map((action) => ({
          ...action,
          onClick: action.label === 'Prep for Meeting' ? onPrepForMeeting : undefined,
        })),
      }
    }
    return item
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      if (isScrollingRef.current) return

      // Detect scroll direction
      if (e.deltaY > 0) {
        // Scroll down - next card
        if (currentIndex < mockRoundupItems.length - 1) {
          isScrollingRef.current = true
          setCurrentIndex((prev) => prev + 1)
          setTimeout(() => {
            isScrollingRef.current = false
          }, 600)
        }
      } else if (e.deltaY < 0) {
        // Scroll up - previous card
        if (currentIndex > 0) {
          isScrollingRef.current = true
          setCurrentIndex((prev) => prev - 1)
          setTimeout(() => {
            isScrollingRef.current = false
          }, 600)
        }
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [currentIndex])

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex
    const VISUAL_GAP = visualGap // Visual gap between card edges in pixels
    const SCALE_STEP = scaleStep // Scale reduction per card

    if (diff < 0) {
      // Cards that have been swiped away
      return {
        transform: 'translateY(-120%) scale(0.8)',
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none' as const,
      }
    }

    const scale = 1 - SCALE_STEP * diff
    const opacity = Math.max(0.3, 1 - 0.25 * diff)
    const zIndex = 10 - diff

    // Calculate offset: each card should be VISUAL_GAP below the previous card's bottom edge
    // Since cards scale from center, we need to account for the height reduction
    // Card 1: offset = 0
    // Card 2: offset = VISUAL_GAP (one gap from card 1)
    // Card 3: offset = VISUAL_GAP * 2 (two gaps total: one from card 1 to 2, one from card 2 to 3)
    const offset = VISUAL_GAP * diff

    return {
      transform: `translateY(${offset}px) scale(${scale})`,
      opacity,
      zIndex,
      pointerEvents: diff === 0 ? ('auto' as const) : ('none' as const),
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-white to-[#F5E3DF]"
    >
      {/* Counter badge - Fixed at top */}
      <div className="absolute left-1/2 top-8 z-50 -translate-x-1/2">
        <div className="rounded-md bg-stone-100 px-2.5 py-0.5">
          <span className="text-xs font-semibold text-stone-900">
            {mockRoundupItems.length - currentIndex} left
          </span>
        </div>
      </div>

      {/* Cards stack */}
      <div className="relative flex flex-1 items-center justify-center px-8">
        {roundupItems.map((item, index) => {
          const style = getCardStyle(index)

          return (
            <div
              key={item.id}
              className="absolute flex w-full max-w-[580px] flex-col transition-all duration-500 ease-out"
              style={style}
            >
              <div className="flex w-full flex-col rounded-lg border border-stone-200 bg-white shadow-lg">
                {/* Illustration */}
                <div className="flex h-52 items-center justify-center overflow-hidden rounded-t-lg bg-stone-100">
                  <img
                    src="/roundup-illustration.png"
                    alt="Notification illustration"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3 px-8 py-6">
                  {/* Badge */}
                  <div className="inline-flex w-fit items-center rounded-md bg-stone-200 px-2.5 py-0.5">
                    <span className="text-xs font-semibold text-stone-900">{item.badge}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-normal leading-8 text-stone-900">{item.title}</h2>

                  {/* Date */}
                  <p className="text-xs font-medium leading-4 text-stone-600">{item.date}</p>

                  {/* Description */}
                  <p className="text-base font-medium leading-6 text-stone-900">{item.description}</p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 px-8 pb-8">
                  {item.actions.map((action, actionIndex) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={actionIndex}
                        variant={action.variant || 'outline'}
                        size="sm"
                        className="h-9 gap-1 rounded-xl border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
                        onClick={action.onClick}
                      >
                        {Icon && <Icon className="size-4" />}
                        {action.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom actions - Fixed at bottom */}
      <div className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-stone-300 px-4 py-2 text-sm font-medium text-stone-800"
          onClick={() => {
            if (currentIndex < mockRoundupItems.length - 1) {
              setCurrentIndex((prev) => prev + 1)
            }
          }}
        >
          Skip
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-9 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-zinc-800"
          onClick={() => {
            if (currentIndex < mockRoundupItems.length - 1) {
              setCurrentIndex((prev) => prev + 1)
            }
          }}
        >
          Got it
        </Button>
      </div>
    </div>
  )
}
