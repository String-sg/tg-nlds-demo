import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface StudentAlert {
  student_id: string
  student_name: string
  initials: string
  message: string
  priority: 'high' | 'medium' | 'info'
  alert_type: 'attendance' | 'case' | 'behaviour' | 'performance'
  class_id: string | null
  class_name: string | null
}

interface TeacherClass {
  class_id: string
}

interface StudentClass {
  student_id: string
}

interface StudentWithClass {
  id: string
  name: string
  student_id: string
  student_classes?: Array<{ class: { id: string; name: string } }>
}

interface AttendanceRecord {
  student_id: string
  status: string
  date: string
}

interface CaseRecord {
  student_id: string
  status: string
  severity: string
  case_type: string
}

interface SwanStudent {
  student_id: string
}

interface AcademicResult {
  score: number
  subject: string
  term: string
}

interface BehaviourRecord {
  student_id: string
  category: string
  severity: string
  observation_date: string
}

interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  rate: number
}

// GET /api/student-alerts - Get student alerts for dashboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 3

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient()

    // Get current week's date range
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    // Get students taught by this teacher
    const { data: teacherClasses } = await supabase
      .from('teacher_classes')
      .select('class_id')
      .eq('teacher_id', teacherId)

    if (!teacherClasses || teacherClasses.length === 0) {
      return NextResponse.json({ success: true, alerts: [] })
    }

    const classIds = (teacherClasses as TeacherClass[]).map((tc) => tc.class_id)

    // Get students in these classes
    const { data: studentClasses } = await supabase
      .from('student_classes')
      .select('student_id')
      .in('class_id', classIds)
      .eq('status', 'active')

    if (!studentClasses || studentClasses.length === 0) {
      return NextResponse.json({ success: true, alerts: [] })
    }

    const studentIds = [...new Set((studentClasses as StudentClass[]).map((sc) => sc.student_id))]

    // Get students with names and their primary class
    const { data: students } = await supabase
      .from('students')
      .select(`
        id,
        name,
        student_id,
        student_classes!inner(
          class:classes(
            id,
            name
          )
        )
      `)
      .in('id', studentIds)

    if (!students) {
      return NextResponse.json({ success: true, alerts: [] })
    }

    // Transform to simpler structure with primary class
    const studentsWithClasses = (students as StudentWithClass[]).map((s) => {
      const primaryClass = s.student_classes?.[0]?.class
      return {
        id: s.id,
        name: s.name,
        student_id: s.student_id,
        class_id: primaryClass?.id || null,
        class_name: primaryClass?.name || null,
      }
    })

    const alerts: StudentAlert[] = []

    // Check overall attendance rates for all students
    const { data: allAttendanceData } = await supabase
      .from('attendance')
      .select('student_id, status, date')
      .in('student_id', studentIds)
      .order('date', { ascending: false })

    // Calculate attendance rates per student
    const attendanceStats: Record<string, AttendanceStats> = {}
    if (allAttendanceData) {
      for (const record of allAttendanceData as AttendanceRecord[]) {
        if (!attendanceStats[record.student_id]) {
          attendanceStats[record.student_id] = { total: 0, present: 0, absent: 0, late: 0, rate: 0 }
        }
        attendanceStats[record.student_id].total++
        if (record.status === 'present') {
          attendanceStats[record.student_id].present++
        } else if (record.status === 'absent') {
          attendanceStats[record.student_id].absent++
        } else if (record.status === 'late') {
          attendanceStats[record.student_id].late++
        }
      }

      // Calculate rates
      for (const studentId in attendanceStats) {
        const stats = attendanceStats[studentId]
        stats.rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
      }
    }

    // Add attendance alerts for students with low attendance rates
    const sortedAttendance = Object.entries(attendanceStats)
      .filter(([, stats]) => stats.rate < 90)
      .sort(([, a], [, b]) => a.rate - b.rate)

    for (const [studentId, stats] of sortedAttendance) {
      const student = studentsWithClasses.find((s) => s.id === studentId)
      if (student) {
        const nameParts = student.name.split(' ')
        const initials =
          nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
            : student.name.substring(0, 2).toUpperCase()

        let priority: 'high' | 'medium' | 'info' = 'medium'
        let message = ''

        if (stats.rate < 60) {
          priority = 'high'
          message = `Critical attendance issue: ${stats.absent} absences in the past ${stats.total} school days. Immediate family intervention required`
        } else if (stats.rate < 80) {
          priority = 'high'
          message = `Low attendance: ${stats.absent} absences in the past ${stats.total} school days. Requires follow-up with family and support plan.`
        } else if (stats.rate < 90) {
          priority = 'medium'
          message = `Attendance concern: ${stats.absent} absences in the past ${stats.total} school days. Monitor pattern and check for underlying issues.`
        }

        alerts.push({
          student_id: student.id,
          student_name: student.name,
          initials: initials.toUpperCase(),
          message: message,
          priority: priority,
          alert_type: 'attendance',
          class_id: student.class_id,
          class_name: student.class_name,
        })

        if (alerts.length >= limit) break
      }
    }

    // Identify SWAN students with open cases
    const { data: swanStudents } = await supabase
      .from('student_overview')
      .select('student_id, is_swan')
      .in('student_id', studentIds)
      .eq('is_swan', true)

    const swanStudentIds = swanStudents ? (swanStudents as SwanStudent[]).map((s) => s.student_id) : []

    // Check for open cases
    const { data: casesData } = await supabase
      .from('cases')
      .select('student_id, status, severity, case_type')
      .in('student_id', studentIds)
      .in('status', ['open', 'in_progress'])
      .order('severity', { ascending: false })

    if (casesData && casesData.length > 0) {
      const sortedCases = [...(casesData as CaseRecord[])]
      sortedCases.sort((a, b) => {
        const aIsSwan = swanStudentIds.includes(a.student_id)
        const bIsSwan = swanStudentIds.includes(b.student_id)
        if (aIsSwan && !bIsSwan) return -1
        if (!aIsSwan && bIsSwan) return 1
        return 0
      })

      for (const caseRecord of sortedCases) {
        if (alerts.some((a) => a.student_id === caseRecord.student_id)) {
          continue
        }

        const student = studentsWithClasses.find((s) => s.id === caseRecord.student_id)
        if (student) {
          const nameParts = student.name.split(' ')
          const initials =
            nameParts.length >= 2
              ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
              : student.name.substring(0, 2).toUpperCase()

          const priorityMap = {
            high: 'high' as const,
            medium: 'medium' as const,
            low: 'info' as const,
          }

          let message = `Open ${caseRecord.case_type} case`
          if (caseRecord.case_type === 'discipline') {
            message = 'Open discipline case - behavioral support and monitoring ongoing'
          } else if (caseRecord.case_type === 'counselling') {
            message = 'Open counselling case - emotional/social support in progress'
          } else if (caseRecord.case_type === 'sen') {
            message = 'SEN support case - learning accommodations and interventions active'
          }

          alerts.push({
            student_id: student.id,
            student_name: student.name,
            initials: initials.toUpperCase(),
            message: message,
            priority: priorityMap[(caseRecord.severity || 'medium') as 'high' | 'medium' | 'low'],
            alert_type: 'case',
            class_id: student.class_id,
            class_name: student.class_name,
          })
        }

        if (alerts.length >= limit) break
      }
    }

    // Enrich alerts for SWAN students
    if (alerts.length > 0 && swanStudentIds.length > 0) {
      const alertStudentIds = alerts.map(a => a.student_id)
      const swanAlertsIds = alertStudentIds.filter(id => swanStudentIds.includes(id))

      if (swanAlertsIds.length > 0) {
        for (const swanStudentId of swanAlertsIds) {
          const alertIndex = alerts.findIndex(a => a.student_id === swanStudentId)
          if (alertIndex !== -1) {
            const student = studentsWithClasses.find(s => s.id === swanStudentId)
            if (student) {
              const { data: academicResults } = await supabase
                .from('academic_results')
                .select('score, subject, term')
                .eq('student_id', swanStudentId)
                .order('assessment_date', { ascending: false })
                .limit(8)

              let academicContext = ''
              if (academicResults && academicResults.length > 0) {
                const recentScores = (academicResults as AcademicResult[]).slice(0, 4)
                const avgScore = Math.round(recentScores.reduce((sum, r) => sum + (r.score || 0), 0) / recentScores.length)

                if (academicResults.length >= 8) {
                  const olderScores = (academicResults as AcademicResult[]).slice(4, 8)
                  const oldAvg = Math.round(olderScores.reduce((sum, r) => sum + (r.score || 0), 0) / olderScores.length)
                  const change = avgScore - oldAvg
                  if (change < -10) {
                    academicContext = ` Declining academic performance (${oldAvg}% → ${avgScore}% avg).`
                  } else if (change < 0) {
                    academicContext = ` Academic performance slightly declined (${oldAvg}% → ${avgScore}%).`
                  }
                } else {
                  academicContext = ` Current academic average: ${avgScore}%.`
                }
              }

              alerts[alertIndex] = {
                ...alerts[alertIndex],
                message: `SWAN mental health case.${academicContext} Experiencing high family pressure, anxiety, and stress-related symptoms. Bi-weekly counseling ongoing. PTM scheduled.`,
                priority: 'high',
              }
            }
          }
        }
      }
    }

    // Check for positive behavior observations
    if (alerts.length < limit) {
      const { data: behaviorData } = await supabase
        .from('behaviour_observations')
        .select('student_id, category, severity, observation_date')
        .in('student_id', studentIds)
        .gte('observation_date', weekAgoStr)
        .order('observation_date', { ascending: false })
        .limit(10)

      if (behaviorData && behaviorData.length > 0) {
        const positiveCategories = ['excellence', 'achievement', 'improvement', 'positive']

        for (const obs of behaviorData as BehaviourRecord[]) {
          if (alerts.some((a) => a.student_id === obs.student_id)) {
            continue
          }

          const isPositive = positiveCategories.some((cat) =>
            obs.category.toLowerCase().includes(cat)
          )

          if (isPositive || obs.severity === 'low') {
            const student = studentsWithClasses.find((s) => s.id === obs.student_id)
            if (student) {
              const nameParts = student.name.split(' ')
              const initials =
                nameParts.length >= 2
                  ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                  : student.name.substring(0, 2).toUpperCase()

              alerts.push({
                student_id: student.id,
                student_name: student.name,
                initials: initials.toUpperCase(),
                message: 'Excellent progress',
                priority: 'info',
                alert_type: 'behaviour',
                class_id: student.class_id,
                class_name: student.class_name,
              })
            }

            if (alerts.length >= limit) break
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      alerts: alerts.slice(0, limit),
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/student-alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student alerts' },
      { status: 500 }
    )
  }
}
