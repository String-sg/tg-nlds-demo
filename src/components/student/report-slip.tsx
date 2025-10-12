'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CheckCircle2,
  Clock,
  FileEdit,
  Send,
  Download,
  Eye,
  Loader2,
} from 'lucide-react'
import { useReportSlip } from '@/hooks/use-report-slip'

interface ReportSlipProps {
  studentId: string
  studentName: string
  class: string
}

export function ReportSlip({ studentId, studentName, class: className }: ReportSlipProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { reportSlip, loading, error } = useReportSlip(studentName)

  // Add dateApproved if status is approved
  const dateApproved = reportSlip?.status === 'approved' ? reportSlip.lastUpdated : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (error || !reportSlip) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-600">Unable to load report slip.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        )
      case 'submitted':
        return (
          <Badge
            variant="outline"
            className="gap-1 border-blue-300 bg-blue-50 text-blue-700"
          >
            <Send className="h-3 w-3" />
            Submitted
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        )
      default:
        return null
    }
  }

  const getConductColor = (conduct: string) => {
    switch (conduct) {
      case 'Excellent':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Very Good':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Good':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'Fair':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Poor':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-stone-100 text-stone-600 border-stone-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with status and actions */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-2xl font-semibold">{reportSlip.term} Report Slip</h2>
            {getStatusBadge(reportSlip.status)}
          </div>
          <p className="text-sm text-stone-600">
            Academic Year {reportSlip.academicYear} • Last updated{' '}
            {new Date(reportSlip.lastUpdated).toLocaleDateString('en-SG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex gap-2">
          {reportSlip.status === 'draft' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <FileEdit className="mr-2 h-4 w-4" />
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </Button>
              <Button size="sm">
                <Send className="mr-2 h-4 w-4" />
                Submit for Approval
              </Button>
            </>
          )}

          {reportSlip.status === 'approved' && (
            <>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Student Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="mb-1 text-stone-500">Name</p>
              <p className="font-medium">{studentName}</p>
            </div>
            <div>
              <p className="mb-1 text-stone-500">Class</p>
              <p className="font-medium">{className}</p>
            </div>
            <div>
              <p className="mb-1 text-stone-500">Form Teacher</p>
              <p className="font-medium">{reportSlip.formTeacher}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Academic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Subject Teacher</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportSlip.subjects.map((subject) => (
                <TableRow key={subject.subject}>
                  <TableCell className="font-medium">{subject.subject}</TableCell>
                  <TableCell>{subject.score}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        subject.grade.startsWith('A') ? 'default' : 'secondary'
                      }
                    >
                      {subject.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">
                    {subject.subjectTeacher}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 text-stone-500">Overall Grade</p>
              <p className="text-lg font-semibold">{reportSlip.overallGrade}</p>
            </div>
            {reportSlip.classPosition && (
              <div>
                <p className="mb-1 text-stone-500">Class Position</p>
                <p className="text-lg font-semibold">#{reportSlip.classPosition}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conduct & Attendance */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conduct</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm text-stone-500 mb-2">Overall Conduct Assessment</p>
                <p className="text-xs text-stone-500">Based on Singapore MOE grading system</p>
              </div>
              <span className={cn(
                'inline-flex px-3 py-1.5 text-sm font-medium rounded-full border',
                getConductColor(reportSlip.conduct)
              )}>
                {reportSlip.conduct}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Attendance Rate</span>
                <span className="font-semibold">
                  {reportSlip.attendance.percentage}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Days Present</span>
                <span className="font-medium">
                  {reportSlip.attendance.daysPresent}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Days Absent</span>
                <span className="font-medium">{reportSlip.attendance.daysAbsent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Days Late</span>
                <span className="font-medium">{reportSlip.attendance.daysLate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CCE */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Character & Citizenship Education (CCE)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <p className="mb-1 text-sm text-stone-500">CCE Grade</p>
            <Badge variant="secondary">{reportSlip.cceGrade}</Badge>
          </div>
          <div>
            <p className="mb-2 text-sm text-stone-500">Remarks</p>
            <p className="text-sm">{reportSlip.cceRemarks}</p>
          </div>
        </CardContent>
      </Card>

      {/* Teacher's Remarks (HDP Comments) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Form Teacher&apos;s Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              defaultValue={reportSlip.teacherRemarks}
              rows={6}
              className="text-sm"
              placeholder="Enter your holistic development profile comments..."
            />
          ) : (
            <p className="text-sm leading-relaxed">{reportSlip.teacherRemarks}</p>
          )}
        </CardContent>
      </Card>

      {/* Approval Info */}
      {reportSlip.status === 'approved' && dateApproved && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <span>
                Approved on{' '}
                {new Date(dateApproved).toLocaleDateString('en-SG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit reminder */}
      {reportSlip.status === 'draft' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800">
              <strong>Reminder:</strong> Report slips in submitted state require Key
              Personnel approval before being finalized.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
