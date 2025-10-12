'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ReportSlipData {
  studentId: string
  studentName: string
  class: string
  term: string
  academicYear: string
  status: 'draft' | 'submitted' | 'approved'
  lastUpdated: string

  subjects: Array<{
    subject: string
    grade: string
    score: number
    subjectTeacher: string
  }>

  overallGrade: string
  classPosition: number | null

  conduct: string
  attendance: {
    percentage: number
    daysPresent: number
    daysAbsent: number
    daysLate: number
  }

  teacherRemarks: string
  cceGrade: string
  cceRemarks: string
  formTeacher: string
}

export function useReportSlip(studentName: string) {
  const [reportSlip, setReportSlip] = useState<ReportSlipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchReportSlip() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()

        // 1. Get student basic info
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select(`
            id,
            student_id,
            name,
            form_teacher:teachers!form_teacher_id(name)
          `)
          .eq('name', studentName)
          .single()

        if (studentError) throw studentError
        if (!student || typeof student !== 'object' || !('id' in student)) {
          throw new Error('Student data is invalid')
        }

        // 2. Get class info
        const { data: classData } = await supabase
          .from('student_classes')
          .select(`
            classes(name)
          `)
          .eq('student_id', (student as { id: string }).id)
          .limit(1)
          .single()

        const className = classData ? (classData as { classes?: { name: string } }).classes?.name || 'N/A' : 'N/A'

        const studentId = (student as { id: string }).id

        // 3. Get academic results for Term 2 (most recent)
        const { data: academicResults } = await supabase
          .from('academic_results')
          .select('*')
          .eq('student_id', studentId)
          .eq('term', 'Term 2')
          .eq('assessment_type', 'End-of-Year Examination')

        // Group by subject and get average
        const subjectMap = new Map<string, { scores: number[], grades: string[] }>()
        academicResults?.forEach(result => {
          if (typeof result === 'object' && result !== null && 'assessment_name' in result) {
            const typedResult = result as { assessment_name: string; score?: number; grade?: string }
            const subject = typedResult.assessment_name.split(' ')[0] // Extract subject name
            if (!subjectMap.has(subject)) {
              subjectMap.set(subject, { scores: [], grades: [] })
            }
            const data = subjectMap.get(subject)!
            if (typedResult.score) data.scores.push(typedResult.score)
            if (typedResult.grade) data.grades.push(typedResult.grade)
          }
        })

        const subjects = Array.from(subjectMap.entries()).map(([subject, data]) => ({
          subject,
          score: data.scores.length > 0
            ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
            : 0,
          grade: data.grades[0] || 'N/A',
          subjectTeacher: 'Subject Teacher', // TODO: Add subject teachers to database
        }))

        // Calculate overall grade
        const avgScore = subjects.length > 0
          ? subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length
          : 0
        const overallGrade = calculateGrade(avgScore)

        // 4. Get attendance data
        const { data: attendanceRecords } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', studentId)

        const totalDays = attendanceRecords?.length || 0
        const daysPresent = attendanceRecords?.filter(a => typeof a === 'object' && a !== null && 'status' in a && (a as { status: string }).status === 'present').length || 0
        const daysAbsent = attendanceRecords?.filter(a => typeof a === 'object' && a !== null && 'status' in a && (a as { status: string }).status === 'absent').length || 0
        const daysLate = attendanceRecords?.filter(a => typeof a === 'object' && a !== null && 'status' in a && (a as { status: string }).status === 'late').length || 0
        const attendancePercentage = totalDays > 0 ? Math.round((daysPresent / totalDays) * 100) : 0

        // 5. Get CCE results
        const { data: cceResults } = await supabase
          .from('cce_results')
          .select('*')
          .eq('student_id', studentId)
          .eq('term', 'Term 2')
          .eq('academic_year', '2024')
          .single()

        // 6. Get student overview for conduct grade
        const { data: studentOverview } = await supabase
          .from('student_overview')
          .select('conduct_grade')
          .eq('student_id', studentId)
          .single()

        // 7. Get behaviour observations for teacher remarks
        const { data: behaviourObs } = await supabase
          .from('behaviour_observations')
          .select('*')
          .eq('student_id', studentId)
          .order('observation_date', { ascending: false })
          .limit(3)

        // Generate teacher remarks from behaviour observations and academic performance
        const positiveObs = behaviourObs?.filter(o => typeof o === 'object' && o !== null && 'category' in o && (o as { category: string }).category === 'positive') || []
        const concernObs = behaviourObs?.filter(o => typeof o === 'object' && o !== null && 'category' in o && (o as { category: string }).category === 'concern') || []

        let teacherRemarks = `${studentName} has shown `
        if (avgScore >= 75) {
          teacherRemarks += 'excellent academic performance this term. '
        } else if (avgScore >= 60) {
          teacherRemarks += 'good progress this term. '
        } else {
          teacherRemarks += 'steady effort this term. '
        }

        if (positiveObs.length > 0) {
          const firstObs = positiveObs[0]
          if (typeof firstObs === 'object' && firstObs !== null && 'description' in firstObs) {
            teacherRemarks += (firstObs as { description: string }).description + ' '
          }
        }

        if (concernObs.length > 0) {
          const firstConcern = concernObs[0]
          if (typeof firstConcern === 'object' && firstConcern !== null && 'description' in firstConcern) {
            teacherRemarks += `Areas for improvement: ${(firstConcern as { description: string }).description} `
          }
        }

        teacherRemarks += 'Continue to encourage their learning journey.'

        // Get conduct grade from student_overview (Singapore MOE 5-tier system)
        const conduct = (studentOverview && typeof studentOverview === 'object' && 'conduct_grade' in studentOverview)
          ? (studentOverview as { conduct_grade?: string }).conduct_grade || 'Good'
          : 'Good'

        const studentData = student as { student_id: string; name: string; form_teacher?: { name: string } | null }

        const reportSlipData: ReportSlipData = {
          studentId: studentData.student_id,
          studentName: studentData.name,
          class: className,
          term: 'Term 2',
          academicYear: '2024',
          status: 'draft',
          lastUpdated: new Date().toISOString().split('T')[0],
          subjects,
          overallGrade,
          classPosition: null, // TODO: Calculate class position
          conduct,
          attendance: {
            percentage: attendancePercentage,
            daysPresent,
            daysAbsent,
            daysLate,
          },
          teacherRemarks,
          cceGrade: (cceResults && typeof cceResults === 'object' && 'overall_grade' in cceResults) ? (cceResults as { overall_grade?: string }).overall_grade || 'Good' : 'Good',
          cceRemarks: (cceResults && typeof cceResults === 'object' && 'comments' in cceResults) ? (cceResults as { comments?: string }).comments || 'Demonstrates good character values.' : 'Demonstrates good character values.',
          formTeacher: studentData.form_teacher?.name || 'Form Teacher',
        }

        setReportSlip(reportSlipData)
      } catch (err) {
        console.error('Error fetching report slip:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch report slip'))
      } finally {
        setLoading(false)
      }
    }

    if (studentName) {
      fetchReportSlip()
    }
  }, [studentName])

  return { reportSlip, loading, error }
}

function calculateGrade(score: number): string {
  if (score >= 85) return 'A'
  if (score >= 75) return 'B+'
  if (score >= 65) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}
