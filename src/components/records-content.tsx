'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CaseManagementTable } from '@/components/case-management-table'

type RecordTab = 'attendance' | 'results' | 'cases'

export function RecordsContent() {
  const [activeTab, setActiveTab] = useState<RecordTab>('cases')

  const tabs: { key: RecordTab; label: string }[] = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'results', label: 'Results' },
    { key: 'cases', label: 'Cases' },
  ]

  return (
    <div className="flex flex-1 flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-stone-200 bg-white px-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
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

      {/* Tab Content */}
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-16 pt-6">
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
    </div>
  )
}
