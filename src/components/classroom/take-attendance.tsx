'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, CheckCircle2Icon, XCircleIcon, ClockIcon, CheckIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getClassById, getStudentsByClassId } from '@/lib/mock-data/classroom-data'
import { cn } from '@/lib/utils'
import type { AttendanceStatus, AbsenceReason } from '@/types/classroom'

interface TakeAttendanceProps {
  classId: string
}

interface StudentAttendance {
  student_id: string
  student_name: string
  status: AttendanceStatus
  reason?: AbsenceReason
  notes?: string
}

export function TakeAttendance({ classId }: TakeAttendanceProps) {
  const classData = getClassById(classId)
  const students = getStudentsByClassId(classId)

  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendance[]>(
    students.map((student) => ({
      student_id: student.student_id,
      student_name: student.name,
      status: 'Present' as AttendanceStatus,
    }))
  )

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  if (!classData) {
    return <div>Class not found</div>
  }

  const handleMarkAllPresent = () => {
    setAttendanceRecords((records) =>
      records.map((record) => ({
        ...record,
        status: 'Present' as AttendanceStatus,
        reason: undefined,
        notes: undefined,
      }))
    )
  }

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords((records) =>
      records.map((record) =>
        record.student_id === studentId
          ? { ...record, status, reason: status === 'Present' ? undefined : record.reason }
          : record
      )
    )
  }

  const handleReasonChange = (studentId: string, reason: AbsenceReason) => {
    setAttendanceRecords((records) =>
      records.map((record) =>
        record.student_id === studentId ? { ...record, reason } : record
      )
    )
  }

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceRecords((records) =>
      records.map((record) =>
        record.student_id === studentId ? { ...record, notes } : record
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastSaved(new Date())
    setIsSaving(false)
    // In production, this would call a server action to save attendance
  }

  const stats = {
    present: attendanceRecords.filter((r) => r.status === 'Present').length,
    absent: attendanceRecords.filter((r) => r.status === 'Absent').length,
    late: attendanceRecords.filter((r) => r.status === 'Late').length,
    excused: attendanceRecords.filter((r) => r.status === 'Excused').length,
  }

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return <CheckCircle2Icon className="h-4 w-4 text-green-600" />
      case 'Absent':
        return <XCircleIcon className="h-4 w-4 text-red-600" />
      case 'Late':
        return <ClockIcon className="h-4 w-4 text-amber-600" />
      case 'Excused':
        return <CheckIcon className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Absent':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'Late':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Excused':
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/classroom/${classId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Class Overview
          </Button>
        </Link>
      </div>

      {/* Title & Info */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Take Attendance</h1>
          <p className="text-sm text-stone-600 mt-1">
            Class {classData.class_name} · {classData.subject} · {new Date().toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <p className="text-xs text-stone-500">
              Last saved: {lastSaved.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <Button onClick={handleMarkAllPresent} variant="outline" size="sm">
            Mark All Present
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-600">Present</p>
                <p className="text-2xl font-bold text-green-700">{stats.present}</p>
              </div>
              <CheckCircle2Icon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-600">Absent</p>
                <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-600">Late</p>
                <p className="text-2xl font-bold text-amber-700">{stats.late}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-600">Excused</p>
                <p className="text-2xl font-bold text-blue-700">{stats.excused}</p>
              </div>
              <CheckIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-stone-900">
            Students ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-stone-100">
            {attendanceRecords.map((record, index) => (
              <div
                key={record.student_id}
                className={cn(
                  "p-4 hover:bg-stone-50 transition-colors",
                  record.status !== 'Present' && "bg-stone-50/50"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Student Number */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-700">
                    {index + 1}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-stone-900">{record.student_name}</p>
                      <Badge variant="outline" className={cn("border", getStatusColor(record.status))}>
                        <span className="mr-1">{getStatusIcon(record.status)}</span>
                        {record.status}
                      </Badge>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        size="sm"
                        variant={record.status === 'Present' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(record.student_id, 'Present')}
                        className={cn(
                          "h-8",
                          record.status === 'Present' && "bg-green-600 hover:bg-green-700"
                        )}
                      >
                        <CheckCircle2Icon className="h-3 w-3 mr-1" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={record.status === 'Absent' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(record.student_id, 'Absent')}
                        className={cn(
                          "h-8",
                          record.status === 'Absent' && "bg-red-600 hover:bg-red-700"
                        )}
                      >
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Absent
                      </Button>
                      <Button
                        size="sm"
                        variant={record.status === 'Late' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(record.student_id, 'Late')}
                        className={cn(
                          "h-8",
                          record.status === 'Late' && "bg-amber-600 hover:bg-amber-700"
                        )}
                      >
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Late
                      </Button>
                      <Button
                        size="sm"
                        variant={record.status === 'Excused' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(record.student_id, 'Excused')}
                        className={cn(
                          "h-8",
                          record.status === 'Excused' && "bg-blue-600 hover:bg-blue-700"
                        )}
                      >
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Excused
                      </Button>
                    </div>

                    {/* Reason & Notes (shown for non-present statuses) */}
                    {record.status !== 'Present' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-stone-600 mb-1 block">
                              Reason
                            </label>
                            <Select
                              value={record.reason}
                              onValueChange={(value) => handleReasonChange(record.student_id, value as AbsenceReason)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sick">Sick</SelectItem>
                                <SelectItem value="Medical Appointment">Medical Appointment</SelectItem>
                                <SelectItem value="Family Emergency">Family Emergency</SelectItem>
                                <SelectItem value="School Event">School Event</SelectItem>
                                <SelectItem value="Pre-approved Leave">Pre-approved Leave</SelectItem>
                                <SelectItem value="Transport Issues">Transport Issues</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-stone-600 mb-1 block">
                            Notes (optional)
                          </label>
                          <Textarea
                            placeholder="Add any additional notes..."
                            value={record.notes || ''}
                            onChange={(e) => handleNotesChange(record.student_id, e.target.value)}
                            className="h-20 resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-600">Attendance Rate:</span>
            <span className="font-semibold text-stone-900">
              {((stats.present / students.length) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/classroom/${classId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>
    </div>
  )
}
