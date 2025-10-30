/**
 * PDF Generation Utility
 *
 * Generates professional PDF timetables for teachers using jsPDF and jspdf-autotable.
 * Creates downloadable weekly timetables with proper formatting and school branding.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { WeekSchedule, DayOfWeek } from '@/types/timetable'
import { WEEKDAYS, DAY_NAMES_SHORT } from '@/types/timetable'
import { formatDate, formatWeekRange } from './date-utils'
import { groupLessonsByDay } from './schedule-adapter'

export interface PDFGenerationOptions {
  teacherName: string
  weekSchedule: WeekSchedule
  includeLocations?: boolean
  schoolName?: string
  orientation?: 'portrait' | 'landscape'
}

/**
 * Generate a weekly timetable PDF
 * Returns a Blob that can be downloaded
 */
export async function generateWeeklyTimetablePDF(
  options: PDFGenerationOptions
): Promise<Blob> {
  const {
    teacherName,
    weekSchedule,
    includeLocations = true,
    schoolName = 'School',
    orientation = 'landscape',
  } = options

  // Create PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Weekly Timetable', pageWidth / 2, 15, { align: 'center' })

  // Teacher name
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Teacher: ${teacherName}`, 14, 25)

  // Week range
  const weekRangeText = formatWeekRange(weekSchedule.weekStart)
  doc.text(`Week: ${weekRangeText}`, pageWidth - 14, 25, { align: 'right' })

  // Generate timetable data
  const tableData = generateTimetableData(weekSchedule, includeLocations)

  // Column headers
  const headers = ['Time', ...WEEKDAYS.map((day) => DAY_NAMES_SHORT[day])]

  // Generate table
  autoTable(doc, {
    startY: 32,
    head: [headers],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [243, 244, 246] }, // Time column
    },
    didParseCell: (data) => {
      // Color-code lesson cells
      if (data.section === 'body' && data.column.index > 0) {
        const cellText = data.cell.text.join(' ')

        // Subject classes - green
        if (cellText && !cellText.includes('Form') && !cellText.includes('CCA')) {
          data.cell.styles.fillColor = [220, 252, 231] // Light green
        }
        // Form classes - orange
        else if (cellText.includes('Form')) {
          data.cell.styles.fillColor = [254, 243, 199] // Light orange
        }
        // CCAs - blue
        else if (cellText.includes('CCA')) {
          data.cell.styles.fillColor = [219, 234, 254] // Light blue
        }
        // Empty cells - gray
        else if (!cellText || cellText === '-') {
          data.cell.styles.fillColor = [249, 250, 251] // Very light gray
        }
      }
    },
  })

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 100
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(
    `Generated on ${formatDate(new Date(), 'MMM d, yyyy')} • ${schoolName}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  // Conflict warning if present
  if (weekSchedule.hasConflicts) {
    doc.setTextColor(220, 38, 38) // Red
    doc.text(
      `⚠ Warning: ${weekSchedule.conflicts.length} scheduling conflict(s) detected`,
      pageWidth / 2,
      finalY + 10,
      { align: 'center' }
    )
  }

  // Return as blob
  return doc.output('blob')
}

/**
 * Generate table data from week schedule
 * Creates rows for each hour with lessons in each day column
 */
function generateTimetableData(
  weekSchedule: WeekSchedule,
  includeLocations: boolean
): string[][] {
  // Determine time range (earliest to latest lesson)
  const allLessons = weekSchedule.days.flatMap((d) => d.lessons)

  if (allLessons.length === 0) {
    return [['08:00 - 16:00', '-', '-', '-', '-', '-']]
  }

  const times = allLessons.flatMap((l) => [l.startTime, l.endTime])
  const earliestHour = Math.min(...times.map(timeToHour))
  const latestHour = Math.max(...times.map(timeToHour))

  // Group lessons by day
  const lessonsByDay: Record<DayOfWeek, Map<string, string[]>> = {} as any

  for (const day of WEEKDAYS) {
    const daySchedule = weekSchedule.days[day]
    const dayLessons = daySchedule ? daySchedule.lessons : []

    const lessonMap = new Map<string, string[]>()

    for (const lesson of dayLessons) {
      const timeSlot = `${lesson.startTime}-${lesson.endTime}`

      if (!lessonMap.has(timeSlot)) {
        lessonMap.set(timeSlot, [])
      }

      const lessonText = includeLocations && lesson.location
        ? `${lesson.className}\n${lesson.location}`
        : lesson.className

      lessonMap.get(timeSlot)!.push(lessonText)
    }

    lessonsByDay[day] = lessonMap
  }

  // Generate rows (one per hour)
  const rows: string[][] = []

  for (let hour = earliestHour; hour <= latestHour; hour++) {
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`
    const row: string[] = [timeLabel]

    for (const day of WEEKDAYS) {
      const dayLessonMap = lessonsByDay[day]

      // Find lesson(s) at this hour
      let cellContent = ''

      for (const [timeSlot, lessons] of dayLessonMap.entries()) {
        const [start] = timeSlot.split('-')
        const startHour = timeToHour(start)

        if (startHour === hour) {
          cellContent = lessons.join('\n\n')
          break
        }
      }

      row.push(cellContent || '-')
    }

    rows.push(row)
  }

  return rows
}

/**
 * Convert time string to hour number
 */
function timeToHour(time: string): number {
  return parseInt(time.split(':')[0], 10)
}

/**
 * Download a blob as a file
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename for PDF
 */
export function generatePDFFilename(
  teacherName: string,
  weekStart: Date
): string {
  const teacherSlug = teacherName.toLowerCase().replace(/\s+/g, '-')
  const dateStr = formatDate(weekStart, 'yyyy-MM-dd')
  return `timetable-${teacherSlug}-${dateStr}.pdf`
}

/**
 * Generate and download weekly timetable PDF
 * Convenience function that combines generation and download
 */
export async function generateAndDownloadTimetable(
  options: PDFGenerationOptions
): Promise<void> {
  try {
    // Generate PDF
    const blob = await generateWeeklyTimetablePDF(options)

    // Generate filename
    const filename = generatePDFFilename(
      options.teacherName,
      options.weekSchedule.weekStart
    )

    // Download
    downloadPDF(blob, filename)
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}
