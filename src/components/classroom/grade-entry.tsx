'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeftIcon,
  SaveIcon,
  UploadIcon,
  DownloadIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  CalculatorIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStudentsByClassId } from '@/lib/mock-data/classroom-data'
import { PageLayout, PageAction } from '@/components/layout/page-layout'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'

interface GradeEntryProps {
  classId: string
  onBack?: () => void
  onNavigate?: (path: string, replaceTab?: boolean) => void
  classroomTabs?: Map<string, string>
}

interface GradeEntry {
  studentId: string
  score: string
  maxScore: number
  percentage: number
  letterGrade: string
  isDirty: boolean
}

const assessmentTypes = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Exam' },
  { value: 'project', label: 'Project' },
  { value: 'participation', label: 'Class Participation' },
]

export function GradeEntry({ classId, onBack, onNavigate, classroomTabs }: GradeEntryProps) {
  const [assessmentType, setAssessmentType] = useState<string>('assignment')
  const [assessmentName, setAssessmentName] = useState<string>('')
  const [maxScore, setMaxScore] = useState<string>('100')
  const [weightage, setWeightage] = useState<string>('10')
  const [isDraft, setIsDraft] = useState(true)

  // Get students for this class
  const students = getStudentsByClassId(classId)

  // Initialize grades state
  const [grades, setGrades] = useState<GradeEntry[]>(
    students.map((student) => ({
      studentId: student.student_id,
      score: '',
      maxScore: 100,
      percentage: 0,
      letterGrade: '-',
      isDirty: false,
    }))
  )

  const calculateLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    if (percentage >= 50) return 'E'
    return 'F'
  }

  const calculatePercentage = (score: number, max: number): number => {
    if (max === 0) return 0
    return Math.round((score / max) * 100)
  }

  const handleScoreChange = useCallback(
    (studentId: string, value: string) => {
      setGrades((prev) =>
        prev.map((grade) => {
          if (grade.studentId === studentId) {
            const score = parseFloat(value) || 0
            const max = parseFloat(maxScore) || 100
            const percentage = calculatePercentage(score, max)
            const letterGrade = value ? calculateLetterGrade(percentage) : '-'

            return {
              ...grade,
              score: value,
              maxScore: max,
              percentage,
              letterGrade,
              isDirty: true,
            }
          }
          return grade
        })
      )
    },
    [maxScore]
  )

  const handleSaveDraft = () => {
    setIsDraft(true)
    // TODO: Implement actual save logic
  }

  const handlePublish = () => {
    setIsDraft(false)
    // TODO: Implement actual publish logic
  }

  const handleBulkFill = (value: string) => {
    const score = parseFloat(value) || 0
    const max = parseFloat(maxScore) || 100
    const percentage = calculatePercentage(score, max)
    const letterGrade = calculateLetterGrade(percentage)

    setGrades((prev) =>
      prev.map((grade) => ({
        ...grade,
        score: value,
        maxScore: max,
        percentage,
        letterGrade,
        isDirty: true,
      }))
    )
  }

  const classInfo = students[0]
    ? `${students[0].class_id} · ${students[0].class_id.includes('5A') ? 'Mathematics' : 'Science'}`
    : classId

  const dirtyCount = grades.filter((g) => g.isDirty).length
  const completedCount = grades.filter((g) => g.score !== '').length
  const averageScore =
    completedCount > 0
      ? Math.round(
          grades.reduce((sum, g) => sum + (parseFloat(g.score) || 0), 0) /
            completedCount
        )
      : 0

  // Define page actions
  const pageActions: PageAction[] = [
    {
      label: 'Import CSV',
      icon: UploadIcon,
      onClick: undefined, // To be implemented
      variant: 'outline',
    },
    {
      label: 'Export',
      icon: DownloadIcon,
      onClick: undefined, // To be implemented
      variant: 'outline',
    },
  ]

  // Get breadcrumbs
  const { breadcrumbs } = useBreadcrumbs({
    activeTab: `classroom/${classId}/grades`,
    classroomTabs,
    onNavigate,
  })

  return (
    <PageLayout
      title="Grade Entry"
      subtitle={classInfo}
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      backButton={
        onBack && !breadcrumbs.length
          ? {
              label: 'Back to Class Overview',
              onClick: onBack,
              icon: ArrowLeftIcon,
            }
          : undefined
      }
      contentClassName="px-6 py-6"
    >
      <div className="mx-auto w-full max-w-7xl space-y-6">

      {/* Assessment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assessment Type</label>
              <Select value={assessmentType} onValueChange={setAssessmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assessmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assessment Name</label>
              <Input
                placeholder="e.g., Mid-Term Exam"
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Score</label>
              <Input
                type="number"
                placeholder="100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Weightage (%)</label>
              <Input
                type="number"
                placeholder="10"
                value={weightage}
                onChange={(e) => setWeightage(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CalculatorIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Average Score</p>
                <p className="text-2xl font-semibold">{averageScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2Icon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Completed</p>
                <p className="text-2xl font-semibold">
                  {completedCount}/{students.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertCircleIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Unsaved Changes</p>
                <p className="text-2xl font-semibold">{dirtyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <SaveIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Status</p>
                <Badge variant={isDraft ? 'secondary' : 'default'}>
                  {isDraft ? 'Draft' : 'Published'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkFill(maxScore)}
        >
          Fill All Max Score
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkFill('0')}
        >
          Clear All
        </Button>
      </div>

      {/* Grade Entry Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="min-w-[200px]">Student Name</TableHead>
                <TableHead className="w-32">Score</TableHead>
                <TableHead className="w-24">Percentage</TableHead>
                <TableHead className="w-24">Grade</TableHead>
                <TableHead className="w-20">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => {
                const grade = grades.find(
                  (g) => g.studentId === student.student_id
                )
                if (!grade) return null

                return (
                  <TableRow key={student.student_id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={grade.score}
                        onChange={(e) =>
                          handleScoreChange(student.student_id, e.target.value)
                        }
                        className={cn(
                          'w-24',
                          grade.isDirty && 'border-amber-300 bg-amber-50'
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-medium',
                          grade.percentage >= 50
                            ? 'text-green-600'
                            : 'text-red-600'
                        )}
                      >
                        {grade.score ? `${grade.percentage}%` : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          grade.letterGrade === 'A' || grade.letterGrade === 'B'
                            ? 'default'
                            : grade.letterGrade === 'F'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {grade.letterGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {grade.isDirty && (
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-6">
        <p className="text-sm text-stone-600">
          {dirtyCount > 0 && `${dirtyCount} unsaved changes`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={dirtyCount === 0}>
            <SaveIcon className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button onClick={handlePublish} disabled={completedCount < students.length}>
            <CheckCircle2Icon className="mr-2 h-4 w-4" />
            Publish Grades
          </Button>
        </div>
      </div>
      </div>
    </PageLayout>
  )
}
