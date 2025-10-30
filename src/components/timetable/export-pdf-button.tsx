/**
 * Export PDF Button Component
 *
 * Button component for exporting weekly timetable as PDF.
 * Handles loading state and error handling.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileDown, Loader2 } from 'lucide-react'
import type { WeekSchedule } from '@/types/timetable'
import { generateAndDownloadTimetable } from '@/lib/timetable/pdf-generator'

export interface ExportPDFButtonProps {
  weekSchedule: WeekSchedule
  teacherName: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showDropdown?: boolean
  disabled?: boolean
}

export function ExportPDFButton({
  weekSchedule,
  teacherName,
  variant = 'outline',
  size = 'default',
  showDropdown = false,
  disabled = false,
}: ExportPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExport = async (includeLocations: boolean = true) => {
    setIsGenerating(true)

    try {
      await generateAndDownloadTimetable({
        teacherName,
        weekSchedule,
        includeLocations,
        schoolName: 'Ministry of Education',
      })

      // Success - PDF downloaded
      console.log('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Simple button (no dropdown)
  if (!showDropdown) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleExport(true)}
        disabled={disabled || isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </>
        )}
      </Button>
    )
  }

  // Dropdown with options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Export Options
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport(true)}>
          <Download className="mr-2 h-4 w-4" />
          Export with Locations
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(false)}>
          <Download className="mr-2 h-4 w-4" />
          Export without Locations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Compact export button for toolbars
 */
export function CompactExportPDFButton({
  weekSchedule,
  teacherName,
  disabled = false,
}: {
  weekSchedule: WeekSchedule
  teacherName: string
  disabled?: boolean
}) {
  return (
    <ExportPDFButton
      weekSchedule={weekSchedule}
      teacherName={teacherName}
      variant="ghost"
      size="sm"
      disabled={disabled}
    />
  )
}
