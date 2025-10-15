'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/types/database'
import { ericStudentRecords } from '@/lib/mock-data/eric-records'

export interface StudentProfileData {
  // Basic info
  id: string
  student_id: string
  name: string
  class_name: string
  year_level: string
  form_class_id: string | null

  // Overview data
  overview: {
    background: string | null
    medical_conditions: Json | null
    health_declaration: Json | null
    mental_wellness: Json | null
    family: Json | null
    housing_finance: Json | null
    is_swan: boolean
    swan_details: Json | null
  } | null

  // Guardian info
  guardian: {
    name: string
    email: string
    phone: string
    relationship: string
  } | null

  // Academic results
  academic_results: Array<{
    id: string
    assessment_type: string
    assessment_name: string
    assessment_date: string
    term: string | null
    score: number | null
    max_score: number | null
    percentage: number | null
    grade: string | null
    remarks: string | null
  }>

  // Attendance
  attendance: {
    total_days: number
    present: number
    absent: number
    late: number
    early_dismissal: number
    attendance_rate: number
    recent_records: Array<{
      date: string
      status: string
      type: string
      reason: string | null
    }>
  }

  // Physical fitness
  physical_fitness: Array<{
    id: string
    assessment_date: string
    assessment_type: string
    metrics: Json
    overall_grade: string | null
    pass_status: boolean | null
  }>

  // CCE results
  cce_results: Array<{
    id: string
    term: string
    academic_year: string
    character: string | null
    citizenship: string | null
    education: string | null
    overall_grade: string | null
    comments: string | null
  }>

  // Behaviour observations
  behaviour_observations: Array<{
    id: string
    observation_date: string
    category: string
    title: string
    description: string
    severity: string | null
    action_taken: string | null
  }>

  // Friend relationships
  friend_relationships: Array<{
    friend_name: string
    relationship_type: string | null
    closeness_level: string | null
    notes: string | null
  }>

  // Private notes
  private_notes: Array<{
    id: string
    note: string
    created_by: string
    created_at: string
    updated_at: string
  }>

  // Cases
  cases: Array<{
    id: string
    case_number: string
    case_type: string
    title: string
    description: string | null
    status: string
    severity: string | null
    opened_date: string
    closed_date: string | null
    guardian_notified: boolean
  }>

  // AI Summary
  ai_summary: {
    generated_at: string
    insights: string[]
  } | null
}

export function useStudentProfile(studentName: string) {
  const [student, setStudent] = useState<StudentProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchStudentProfile() {
      try {
        setLoading(true)
        setError(null)

        if (!studentName || studentName.trim() === '') {
          throw new Error('Student name is required')
        }

        const supabase = createClient()

        // 1. Get basic student info with guardian
        // Use ilike for case-insensitive search since URL slugs may have different casing
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select(`
            id,
            student_id,
            name,
            year_level,
            parents_guardians:primary_guardian_id(
              name,
              email,
              phone,
              relationship
            )
          `)
          .ilike('name', studentName)
          .single()

        if (studentError) {
          console.error('Supabase error fetching student:', {
            searchTerm: studentName,
            error: studentError,
            message: studentError.message,
            code: studentError.code,
            details: studentError.details,
            hint: studentError.hint,
          })
          throw new Error(`Failed to fetch student data for "${studentName}": ${studentError.message || 'Unknown error'}`)
        }
        
        if (!studentData || typeof studentData !== 'object' || !('id' in studentData)) {
          console.error('Student not found in database:', {
            searchTerm: studentName,
            searchLength: studentName.length,
            charCodes: Array.from(studentName).map(c => `${c}(${c.charCodeAt(0)})`).join(' '),
          })
          throw new Error(`Student "${studentName}" not found in database`)
        }

        const typedStudentData = studentData as { id: string; name: string; student_id: string; year_level: string; parents_guardians?: { name: string; email: string; phone: string; relationship: string } | null }

        // 1b. Get form class through student_classes junction table
        const { data: formClassData } = await supabase
          .from('student_classes')
          .select(`
            classes(
              id,
              name
            )
          `)
          .eq('student_id', typedStudentData.id)
          .limit(1)
          .single()

        const formClass = formClassData ? (formClassData as { classes: { id: string; name: string } }).classes : null

        // 2. Get student overview
        const { data: overviewData } = await supabase
          .from('student_overview')
          .select('*')
          .eq('student_id', typedStudentData.id)
          .single()

        // 3. Get academic results
        const { data: academicData } = await supabase
          .from('academic_results')
          .select('*')
          .eq('student_id', typedStudentData.id)
          .order('assessment_date', { ascending: false })

        // 4. Get attendance stats
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', typedStudentData.id)
          .order('date', { ascending: false })

        // Calculate attendance stats
        const totalDays = attendanceData?.length || 0
        const present = attendanceData?.filter(a => typeof a === 'object' && a !== null && 'status' in a && (a as { status: string }).status === 'present').length || 0
        const absent = attendanceData?.filter(a => typeof a === 'object' && a !== null && 'status' in a && (a as { status: string }).status === 'absent').length || 0
        const late = attendanceData?.filter(a => typeof a === 'object' && a !== null && 'status' in a && (a as { status: string }).status === 'late').length || 0
        const early_dismissal = attendanceData?.filter(a => typeof a === 'object' && a !== null && 'status' in a && (a as { status: string }).status === 'early_dismissal').length || 0
        const attendance_rate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0

        // 5. Get physical fitness
        const { data: fitnessData } = await supabase
          .from('physical_fitness')
          .select('*')
          .eq('student_id', typedStudentData.id)
          .order('assessment_date', { ascending: false })

        // 6. Get CCE results
        const { data: cceData } = await supabase
          .from('cce_results')
          .select('*')
          .eq('student_id', typedStudentData.id)
          .order('academic_year', { ascending: false })
          .order('term', { ascending: false })

        // 7. Get behaviour observations
        const { data: behaviourData } = await supabase
          .from('behaviour_observations')
          .select('*')
          .eq('student_id', typedStudentData.id)
          .order('observation_date', { ascending: false })

        // 8. Get friend relationships
        const { data: friendsData } = await supabase
          .from('friend_relationships')
          .select(`
            friend:students!friend_id(
              name
            ),
            relationship_type,
            closeness_level,
            notes
          `)
          .eq('student_id', typedStudentData.id)

        // 9. Get private notes
        const { data: privateNotesData } = await supabase
          .from('student_private_notes')
          .select('*')
          .eq('student_id', typedStudentData.id)
          .order('updated_at', { ascending: false })

        // 10. Get cases
        const { data: casesData } = await supabase
          .from('cases')
          .select('*')
          .eq('student_id', typedStudentData.id)
          .order('opened_date', { ascending: false })

        // 10b. If this is Eric Lim, merge in mock case data
        let finalCasesData = casesData || []
        if (typedStudentData.student_id === 'student-031') {
          // Extract case-related records from Eric's mock data
          const ericCaseRecords = ericStudentRecords.filter(
            (record) => record.type === 'case-related' && record.data.subType === 'sec-case'
          )

          // Convert to case format expected by the component
          const mockCases = ericCaseRecords.map((record) => ({
            id: record.id,
            case_number: record.id.toUpperCase(),
            case_type: record.data.caseType?.toLowerCase().replace(/\//g, '_').replace(/ /g, '_') || 'counselling',
            title: record.title,
            description: record.description,
            status: 'open',
            severity: record.data.severity?.toLowerCase() || 'medium',
            opened_date: record.date,
            closed_date: null,
            guardian_notified: false,
          }))

          // Use mock cases for Eric
          finalCasesData = mockCases
        }

        // Generate AI summary insights based on student data
        const generateAISummary = () => {
          const insights: string[] = []

          // Attendance insights
          if (attendance_rate < 85) {
            insights.push(`Attendance at ${attendance_rate}% - below expected threshold, may need follow-up`)
          } else if (attendance_rate >= 95) {
            insights.push(`Excellent attendance record at ${attendance_rate}%`)
          }

          // Academic insights
          if (academicData && academicData.length > 0) {
            type AcademicResult = { percentage?: number | null; score?: number | null }
            const recentScores = academicData.slice(0, 3) as AcademicResult[]
            const avgScore = recentScores.reduce((sum, r) => sum + (r.percentage || r.score || 0), 0) / recentScores.length
            if (avgScore < 60) {
              insights.push('Recent academic performance below average - intervention may be needed')
            } else if (avgScore >= 80) {
              insights.push('Strong academic performance across recent assessments')
            }
          }

          // Behavior insights
          if (behaviourData && behaviourData.length > 0) {
            type BehaviorObservation = { category?: string }
            const typedBehaviorData = behaviourData as BehaviorObservation[]
            const concernBehaviors = typedBehaviorData.filter(b => b.category === 'concern')
            if (concernBehaviors.length > 2) {
              insights.push(`${concernBehaviors.length} behavioral concerns recorded this term`)
            }
          }

          // Social insights
          if (friendsData && friendsData.length > 0) {
            const closeFriends = friendsData.filter((f: { closeness_level: string | null }) => f.closeness_level === 'very_close' || f.closeness_level === 'close')
            if (closeFriends.length === 0) {
              insights.push('Limited close friendships - may benefit from social integration support')
            } else if (closeFriends.length >= 3) {
              insights.push(`Healthy social network with ${closeFriends.length} close friends`)
            }
          } else {
            insights.push('No friend relationships recorded - consider monitoring social integration')
          }

          // SWAN status
          type OverviewData = { is_swan?: boolean }
          const typedOverviewData = overviewData as OverviewData | null
          if (typedOverviewData?.is_swan) {
            insights.push('Student With Additional Needs (SWAN) - receiving appropriate support and monitoring')
          }

          // Cases insights
          if (finalCasesData && finalCasesData.length > 0) {
            type CaseData = { status?: string }
            const typedCasesData = finalCasesData as CaseData[]
            const openCases = typedCasesData.filter(c => c.status === 'open' || c.status === 'in_progress')
            if (openCases.length > 0) {
              insights.push(`${openCases.length} active case(s) requiring ongoing attention`)
            }
          }

          // Default message if no insights
          if (insights.length === 0) {
            insights.push('Student performing well overall with no major concerns flagged')
            insights.push('Continue regular monitoring and support')
          }

          return {
            generated_at: new Date().toISOString(),
            insights: insights.slice(0, 4) // Limit to 4 insights
          }
        }

        // Assemble the profile data
        const profileData: StudentProfileData = {
          id: typedStudentData.id,
          student_id: typedStudentData.student_id,
          name: typedStudentData.name,
          class_name: formClass?.name || 'N/A',
          year_level: typedStudentData.year_level,
          form_class_id: formClass?.id || null,
          overview: overviewData || null,
          guardian: typedStudentData.parents_guardians || null,
          academic_results: academicData || [],
          attendance: {
            total_days: totalDays,
            present,
            absent,
            late,
            early_dismissal,
            attendance_rate,
            recent_records: (attendanceData || []).slice(0, 10)
              .filter(a => typeof a === 'object' && a !== null)
              .map(a => {
                const record = a as { date?: string; status?: string; type?: string; reason?: string | null }
                return {
                  date: record.date || '',
                  status: record.status || '',
                  type: record.type || '',
                  reason: record.reason || '',
                }
              }),
          },
          physical_fitness: fitnessData || [],
          cce_results: cceData || [],
          behaviour_observations: behaviourData || [],
          friend_relationships: (friendsData || []).map((f: { friend?: { name: string }; relationship_type: string | null; closeness_level: string | null; notes: string | null }) => ({
            friend_name: f.friend?.name || 'Unknown',
            relationship_type: f.relationship_type,
            closeness_level: f.closeness_level,
            notes: f.notes,
          })),
          private_notes: privateNotesData || [],
          cases: finalCasesData || [],
          ai_summary: generateAISummary(),
        }

        setStudent(profileData)
      } catch (err) {
        console.error('Error fetching student profile:', {
          error: err,
          errorType: typeof err,
          errorConstructor: err?.constructor?.name,
          studentName,
          stack: err instanceof Error ? err.stack : undefined,
        })
        
        // Create a more informative error message
        let errorMessage = 'Failed to fetch student profile'
        if (err instanceof Error) {
          errorMessage = err.message
        } else if (typeof err === 'object' && err !== null) {
          errorMessage = JSON.stringify(err)
        }
        
        setError(new Error(errorMessage))
      } finally {
        setLoading(false)
      }
    }

    if (studentName && studentName.trim() !== '') {
      fetchStudentProfile()
    } else {
      setLoading(false)
    }
  }, [studentName])

  return { student, loading, error }
}
