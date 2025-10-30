'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CaseManagementTable } from '@/components/case-management-table'
import { comingSoonToast } from '@/lib/coming-soon-toast'

type RecordTab = 'attendance' | 'results' | 'cases'

export function RecordsContent() {
  const [activeTab, setActiveTab] = useState<RecordTab>('cases')

  const tabs: { key: RecordTab; label: string }[] = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'results', label: 'Results' },
    { key: 'cases', label: 'Cases' },
  ]

  return (
    <div className="flex h-full w-full flex-col">
      {/* Tab Navigation - Fixed */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-8">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key)
                if (tab.key === 'attendance') {
                  comingSoonToast.feature('Attendance records')
                } else if (tab.key === 'results') {
                  comingSoonToast.feature('Results entry')
                }
              }}
              className={cn(
                'relative px-1 py-4 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'text-stone-900'
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Scrollable */}
      <ScrollArea className="flex-1">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-8 py-10">
        {activeTab === 'attendance' && (
          <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
            <p className="text-stone-500">Attendance records coming soon</p>
          </div>
        )}
        {activeTab === 'results' && (
          <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
            <p className="text-stone-500">Results entry coming soon</p>
          </div>
        )}
        {activeTab === 'cases' && (
          <CaseManagementTable />
        )}
        </div>
      </ScrollArea>
    </div>
  )
}
