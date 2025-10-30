'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useStudents } from '@/hooks/queries/use-students-query'
import { PageLayout } from '@/components/layout/page-layout'
import { cn } from '@/lib/utils'

interface AcademicRecordEntryProps {
  classId: string
  className: string
  subject?: string
  onBack?: () => void
}

interface AssessmentComponent {
  id: string
  name: string
  weightage: number
  maxMarks: number
}

interface StudentScore {
  studentId: string
  scores: Record<string, number | null>
}

const ASSESSMENT_COMPONENTS: AssessmentComponent[] = [
  { id: 'paper1', name: 'PAPER 1 (MCQ)', weightage: 40, maxMarks: 40 },
  { id: 'paper2', name: 'PAPER 2 (STRUCTURED)', weightage: 60, maxMarks: 60 },
]

const ASSESSMENTS = [
  { value: 'term1-wa', label: 'Term 1 WA' },
  { value: 'term1-exam', label: 'Term 1 Exam' },
  { value: 'term2-wa', label: 'Term 2 WA' },
  { value: 'term2-exam', label: 'Term 2 Exam' },
]

export function AcademicRecordEntry({ classId, className, subject, onBack }: AcademicRecordEntryProps) {
  const { students, loading } = useStudents(classId)
  const [selectedAssessment, setSelectedAssessment] = useState('term1-wa')
  const [studentScores, setStudentScores] = useState<Record<string, StudentScore>>({})
  const [unsavedChanges, setUnsavedChanges] = useState(0)

  // Calculate total marks for a student
  const calculateTotal = (studentId: string): { total: number; percentage: number } => {
    const scores = studentScores[studentId]?.scores || {}
    let total = 0
    let maxTotal = 0

    ASSESSMENT_COMPONENTS.forEach(component => {
      const score = scores[component.id]
      if (score !== null && score !== undefined) {
        total += score
      }
      maxTotal += component.maxMarks
    })

    const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0
    return { total, percentage }
  }

  // Calculate score percentage for a component
  const calculatePercentage = (score: number | null, maxMarks: number): number => {
    if (score === null || score === undefined) return 0
    return (score / maxMarks) * 100
  }

  // Handle score input
  const handleScoreChange = (studentId: string, componentId: string, value: string) => {
    const numValue = value === '' ? null : Number(value)

    setStudentScores(prev => ({
      ...prev,
      [studentId]: {
        studentId,
        scores: {
          ...(prev[studentId]?.scores || {}),
          [componentId]: numValue,
        },
      },
    }))

    setUnsavedChanges(prev => prev + 1)
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const completedCount = students.filter(student => {
      const scores = studentScores[student.student_id]?.scores || {}
      return ASSESSMENT_COMPONENTS.every(comp => scores[comp.id] !== null && scores[comp.id] !== undefined)
    }).length

    const totals = students
      .map(student => calculateTotal(student.student_id))
      .filter(t => t.total > 0)

    const average = totals.length > 0
      ? totals.reduce((sum, t) => sum + t.percentage, 0) / totals.length
      : 0

    const sortedTotals = [...totals].sort((a, b) => a.percentage - b.percentage)
    const median = sortedTotals.length > 0
      ? sortedTotals.length % 2 === 0
        ? (sortedTotals[sortedTotals.length / 2 - 1].percentage + sortedTotals[sortedTotals.length / 2].percentage) / 2
        : sortedTotals[Math.floor(sortedTotals.length / 2)].percentage
      : 0

    return { completedCount, average, median }
  }, [students, studentScores])

  const handleClearAll = () => {
    setStudentScores({})
    setUnsavedChanges(0)
  }

  const handleSaveAsDraft = () => {
    // TODO: Implement save as draft
    console.log('Saving as draft...', studentScores)
    setUnsavedChanges(0)
  }

  const handleSubmitResults = () => {
    // TODO: Implement submit results
    console.log('Submitting results...', studentScores)
    setUnsavedChanges(0)
  }

  const titleElement = (
    <div className="flex items-center justify-between w-full">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Result Entry for {subject || 'Mathematics'}</h1>
        <p className="text-sm text-stone-500">Ms Lee • Class {className} • {students.length} Students</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <PageLayout
        title=""
        subtitle={titleElement}
        contentClassName="px-6 py-6"
        headerClassName="border-b-0"
      >
        <div className="text-center py-12">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title=""
      subtitle={titleElement}
      contentClassName="px-6 py-6"
      headerClassName="border-b-0"
    >
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Assessment Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-stone-900">Select Assessment:</label>
          <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSESSMENTS.map(assessment => (
                <SelectItem key={assessment.value} value={assessment.value}>
                  {assessment.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-stone-200">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Entries Completed</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {stats.completedCount}/{students.length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Class Average</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {stats.average > 0 ? `${stats.average.toFixed(1)}%` : '—'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Class Median</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {stats.median > 0 ? `${stats.median.toFixed(1)}%` : '—'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Unsaved Changes</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{unsavedChanges}</p>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Status</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">Draft</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between bg-stone-50 p-4 rounded-lg border border-stone-200">
          <h3 className="text-sm font-semibold text-stone-900">Quick Actions</h3>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClearAll}>
              Clear All
            </Button>
            <Button variant="outline" onClick={handleSaveAsDraft}>
              Save as Draft
            </Button>
            <Button onClick={handleSubmitResults}>
              Submit Results
            </Button>
          </div>
        </div>

        {/* Grade Entry Table */}
        <Card className="border-stone-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">
                      Reg #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide min-w-[200px]">
                      Student Name
                    </th>
                    {ASSESSMENT_COMPONENTS.map(component => (
                      <th key={component.id} colSpan={2} className="px-4 py-3 text-center border-l border-stone-200">
                        <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                          {component.name}
                        </div>
                        <div className="text-xs text-stone-400 mt-1">
                          Weightage: {component.weightage}% | Max: {component.maxMarks} marks
                        </div>
                      </th>
                    ))}
                    <th colSpan={2} className="px-4 py-3 text-center border-l border-stone-200 bg-blue-50">
                      <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Total</div>
                      <div className="text-xs text-stone-400 mt-1">Max: 100 marks</div>
                    </th>
                  </tr>
                  <tr className="bg-stone-50">
                    <th className="px-4 py-2"></th>
                    <th className="px-4 py-2"></th>
                    {ASSESSMENT_COMPONENTS.map(component => (
                      <React.Fragment key={component.id}>
                        <th className="px-2 py-2 text-center text-xs font-medium text-stone-500 border-l border-stone-200">
                          Score
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-stone-500">
                          Score %
                        </th>
                      </React.Fragment>
                    ))}
                    <th className="px-2 py-2 text-center text-xs font-medium text-stone-500 border-l border-stone-200 bg-blue-50">
                      Total
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-stone-500 bg-blue-50">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {students.map((student, index) => {
                    const { total, percentage } = calculateTotal(student.student_id)
                    return (
                      <tr key={student.student_id} className="hover:bg-stone-50">
                        <td className="px-4 py-3 text-sm text-stone-500">
                          {String(index + 1).padStart(3, '0')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-stone-900">
                          {student.name}
                        </td>
                        {ASSESSMENT_COMPONENTS.map(component => {
                          const score = studentScores[student.student_id]?.scores[component.id]
                          const pct = calculatePercentage(score ?? null, component.maxMarks)
                          return (
                            <>
                              <td key={`${student.student_id}-${component.id}-score`} className="px-2 py-3 border-l border-stone-200">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={component.maxMarks}
                                    value={score ?? ''}
                                    onChange={(e) => handleScoreChange(student.student_id, component.id, e.target.value)}
                                    className="w-20 text-center"
                                    placeholder="—"
                                  />
                                  <span className="text-sm text-stone-400">/{component.maxMarks}</span>
                                </div>
                              </td>
                              <td key={`${student.student_id}-${component.id}-pct`} className="px-2 py-3 text-center text-sm text-stone-600">
                                {score !== null && score !== undefined ? `${pct.toFixed(0)}%` : '—'}
                              </td>
                            </>
                          )
                        })}
                        <td className="px-2 py-3 text-center text-sm font-semibold text-stone-900 border-l border-stone-200 bg-blue-50">
                          {total > 0 ? total : '—'}
                        </td>
                        <td className="px-2 py-3 text-center text-sm font-semibold text-blue-700 bg-blue-50">
                          {total > 0 ? `${percentage.toFixed(0)}%` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
