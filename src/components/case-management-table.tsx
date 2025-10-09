'use client'

import React, { useState, useMemo } from 'react'
import { ChevronDownIcon, ChevronUpIcon, SearchIcon, MoreHorizontalIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'

interface Issue {
  type: string
  remarks: string
}

interface CaseData {
  id: string
  createdOn: string
  createdBy: string
  studentName: string
  caseType: string
  school: string
  status: 'Open' | 'Closed'
  issues: Issue[]
}

// Mock data based on student roster
const mockCases: CaseData[] = [
  {
    id: '241015-00016',
    createdOn: '15 Oct 2024',
    createdBy: 'Daniel Tan',
    studentName: 'Eric Lim',
    caseType: 'SWAN (Student With Additional Needs)',
    school: 'Unity Secondary School',
    status: 'Open',
    issues: [
      { type: 'SWAN Activation - Mental Health', remarks: '[Oct 15, 2024] Student activated as SWAN for anxiety and social difficulties. Initial assessment shows high academic pressure from family, limited peer support, and stress-related psychosomatic symptoms.' },
      { type: 'SEC Monitoring Initiated', remarks: '[Oct 15, 2024] Under active Student Engagement and Counselling (SEC) monitoring. Bi-weekly counseling sessions scheduled with Ms. Sarah Wong (School Counselor).' },
      { type: 'Academic Decline Observation', remarks: '[Oct 20, 2024] Baseline academic performance: 78% average across subjects. Teacher observations note decreased class participation and signs of stress during assessments.' },
      { type: 'Family Background Assessment', remarks: '[Oct 28, 2024] Both parents are high-achieving professionals with advanced degrees. Older sibling excelling in university. Eric experiences constant comparison and very high academic expectations. Limited emotional support at home.' },
      { type: 'Health Concerns - Psychosomatic', remarks: '[Nov 5, 2024] Frequent nurse visits with stress-related complaints (headaches, stomach aches). 4 visits in one term. No chronic physical conditions identified. Concerns are mental health-related.' },
      { type: 'Social Isolation Noted', remarks: '[Nov 12, 2024] Very limited peer interactions. Only close friend is Daniel Koh. Student reports feeling socially isolated and difficulty connecting with classmates.' },
      { type: 'Counseling Session 1-4 Summary', remarks: '[Oct 22 - Nov 19, 2024] Completed first 4 counseling sessions. Eric is thoughtful and introspective but struggles with emotional regulation. Working on anxiety management techniques and building self-advocacy skills.' },
      { type: 'Term 3 Academic Review', remarks: '[Dec 18, 2024] End of year results show significant decline: 78% average → 64% average (-14 points). English: 65, Math: 68, Science: 62, Chinese: 60, Humanities: 64. Student is maintaining homework completion despite emotional challenges.' },
      { type: 'Family Tensions Identified', remarks: '[Dec 20, 2024] Recent family tensions noted (possible marital stress between parents). Communication style at home is achievement-focused rather than emotion-focused. Student feels unable to express emotional needs.' },
      { type: 'Counseling Session 5-8 Summary', remarks: '[Nov 26, 2024 - Jan 14, 2025] Sessions 5-8 completed. Progress in identifying stress triggers. Eric showing resilience in attending school regularly (89% attendance) despite difficulties. Building coping strategies for academic pressure.' },
      { type: 'Attendance Monitoring', remarks: '[Jan 20, 2025] Attendance at 89% - regular absences due to stress-related health issues. No disciplinary concerns. Eric is polite, respectful, and maintains average conduct grade despite personal difficulties.' },
      { type: 'PTM Preparation - Feb 14, 2025', remarks: '[Jan 15, 2025] Preparing for sensitive PTM with Dr. & Mrs. Lim. Will recommend family counseling resources and discuss reducing academic pressure. Need to coordinate with Ms. Wong before meeting. Focus on Eric\'s strengths and holistic development.' },
      { type: 'Current Status & Support Plan', remarks: '[Jan 20, 2025] SWAN case remains open. Ongoing bi-weekly counseling with Ms. Wong. Continued monitoring of academic performance, social engagement, and emotional wellbeing. Student shows resilience and is responsive to support. Next review: After Feb 14 PTM.' },
    ],
  },
  {
    id: '251002-00015',
    createdOn: '2 Oct 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Lim Hui Ling',
    caseType: 'Counselling',
    school: 'Unity Secondary School',
    status: 'Open',
    issues: [
      { type: 'Low attendance concern', remarks: 'Student has been absent 50% of school days. Family situation being assessed.' },
      { type: 'Academic support needed', remarks: 'Struggling with keeping up with coursework due to irregular attendance.' },
    ],
  },
  {
    id: '250928-00014',
    createdOn: '28 Sep 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Siti Nurul Ain',
    caseType: 'Disciplinary',
    school: 'Unity Secondary School',
    status: 'Open',
    issues: [
      { type: 'Disruptive behaviour', remarks: 'Repeatedly interrupting class discussions and distracting peers.' },
      { type: 'Late submissions', remarks: 'Multiple assignments submitted past deadline without valid reasons.' },
    ],
  },
  {
    id: '250926-00013',
    createdOn: '26 Sep 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Chen Jia Yi',
    caseType: 'Counselling',
    school: 'Unity Secondary School',
    status: 'Closed',
    issues: [
      { type: 'Attendance monitoring', remarks: 'Worked with family to address attendance issues. Improvement observed over past 2 weeks.' },
      { type: 'Peer relationship support', remarks: 'Participated in peer mediation sessions. Successfully resolved conflicts with classmates.' },
    ],
  },
  {
    id: '250920-00012',
    createdOn: '20 Sep 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Nicholas Loh',
    caseType: 'Counselling',
    school: 'Unity Secondary School',
    status: 'Open',
    issues: [
      { type: 'Irregular attendance pattern', remarks: 'Attendance has dropped to 70%. Meeting scheduled with parents to discuss underlying issues.' },
    ],
  },
  {
    id: '250918-00011',
    createdOn: '18 Sep 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Muhammad Iskandar',
    caseType: 'Education and Career Guidance',
    school: 'Unity Secondary School',
    status: 'Closed',
    issues: [
      { type: 'GEP pathway exploration', remarks: 'Successfully completed advanced placement assessment. Recommended for specialized science program.' },
      { type: 'Leadership development', remarks: 'Enrolled in student council training program. Showing strong potential in peer mentorship.' },
    ],
  },
  {
    id: '250915-00010',
    createdOn: '15 Sep 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Tan Wei Jie',
    caseType: 'Education and Career Guidance',
    school: 'Unity Secondary School',
    status: 'Open',
    issues: [
      { type: 'Academic pathway planning', remarks: 'Interested in STEM subjects. Discussing options for GEP stream advancement.' },
      { type: 'Subject combination guidance', remarks: 'Evaluating strengths in Math and Science for optimal subject selection.' },
    ],
  },
  {
    id: '250912-00009',
    createdOn: '12 Sep 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Alice Wong',
    caseType: 'Education and Career Guidance',
    school: 'Unity Secondary School',
    status: 'Closed',
    issues: [
      { type: 'University pathway planning', remarks: 'Excellent academic performance. Provided guidance on scholarship opportunities and university applications.' },
      { type: 'Leadership portfolio development', remarks: 'Reviewed CCA achievements and academic records for portfolio building.' },
    ],
  },
  {
    id: '250910-00008',
    createdOn: '10 Sep 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Priya Krishnan',
    caseType: 'SEN Support',
    school: 'Unity Secondary School',
    status: 'Open',
    issues: [
      { type: 'Learning support assessment', remarks: 'Initial assessment completed. Recommended for additional time during examinations.' },
      { type: 'Resource allocation', remarks: 'Coordinating with learning support team for specialized resources and materials.' },
    ],
  },
  {
    id: '250905-00007',
    createdOn: '5 Sep 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Reza Halim',
    caseType: 'Counselling',
    school: 'Unity Secondary School',
    status: 'Closed',
    issues: [
      { type: 'Stress management', remarks: 'Student experiencing exam-related anxiety. Referred to school counsellor for coping strategies.' },
      { type: 'Follow-up session', remarks: 'Completed 4-week counselling program. Student reports improved confidence and reduced anxiety levels.' },
    ],
  },
  {
    id: '250901-00006',
    createdOn: '1 Sep 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Wong Kai Xuan',
    caseType: 'Academic Support',
    school: 'Unity Secondary School',
    status: 'Open',
    issues: [
      { type: 'Math intervention program', remarks: 'Enrolled in after-school math support sessions to address gaps in foundational concepts.' },
      { type: 'Study skills workshop', remarks: 'Participating in weekly workshops focusing on time management and effective study techniques.' },
    ],
  },
  {
    id: '250815-00005',
    createdOn: '15 Aug 2025',
    createdBy: 'Daniel Tan',
    studentName: 'Ryan Tan',
    caseType: 'Disciplinary',
    school: 'Unity Secondary School',
    status: 'Open',
    issues: [
      { type: 'Initial incident - Classroom disruption', remarks: '[Aug 15] Repeatedly talking during lessons, distracting peers. Multiple verbal warnings given. Parent contacted.' },
      { type: 'Incomplete homework pattern', remarks: '[Aug 20] Missing 5 out of 8 homework assignments over 2 weeks. Student cited difficulty focusing at home.' },
      { type: 'Talking back to teacher', remarks: '[Aug 25] Responded disrespectfully when reminded about classroom rules. Referred to Year Head.' },
      { type: 'CMT intervention initiated', remarks: '[Sep 1] Case referred to Care Management Team. Initial assessment conducted. Discovered challenging home situation - single parent household, father works long hours.' },
      { type: 'Behavioral support plan', remarks: '[Sep 8] CMT meeting with student and parent. Agreed on check-in system and mentorship program. Student expressed willingness to improve.' },
      { type: 'First positive observation - Ms. Lee', remarks: '[Sep 20] English teacher noted Ryan stayed back voluntarily to complete work. Engaged positively in group discussion.' },
      { type: 'CMT progress update', remarks: '[Sep 25] Weekly check-ins showing consistent attendance. Ryan responding well to structured support. Building rapport with mentor teacher.' },
      { type: 'Homework improvement noted', remarks: '[Oct 1] Math teacher reported 100% homework completion for 2 consecutive weeks. Quality of work also improving.' },
      { type: 'Positive peer interaction - Mr. Kumar', remarks: '[Oct 5] Science teacher observed Ryan helping classmate with lab setup. Demonstrated leadership and patience.' },
      { type: 'Recent CMT review', remarks: '[Oct 8] Significant behavioral improvement over past month. Student more engaged in class, respectful to teachers. Academic performance improving. Recommend continued monitoring with reduced intervention frequency.' },
    ],
  },
]

interface CaseManagementTableProps {
  studentFilter?: string
}

export function CaseManagementTable({ studentFilter }: CaseManagementTableProps) {
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortField, setSortField] = useState<'createdOn' | 'studentName' | 'status'>('createdOn')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and search cases
  const filteredCases = useMemo(() => {
    let filtered = studentFilter
      ? mockCases.filter(c => c.studentName === studentFilter)
      : mockCases

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    return filtered
  }, [studentFilter, searchQuery, filterStatus])

  // Sort cases
  const cases = useMemo(() => {
    return [...filteredCases].sort((a, b) => {
      let compareValue = 0

      if (sortField === 'createdOn') {
        compareValue = new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime()
      } else if (sortField === 'studentName') {
        compareValue = a.studentName.localeCompare(b.studentName)
      } else if (sortField === 'status') {
        compareValue = a.status.localeCompare(b.status)
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })
  }, [filteredCases, sortField, sortOrder])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const toggleRowExpansion = (caseId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(caseId)) {
        next.delete(caseId)
      } else {
        next.add(caseId)
      }
      return next
    })
  }

  const toggleCaseSelection = (caseId: string) => {
    setSelectedCases(prev => {
      const next = new Set(prev)
      if (next.has(caseId)) {
        next.delete(caseId)
      } else {
        next.add(caseId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedCases.size === cases.length) {
      setSelectedCases(new Set())
    } else {
      setSelectedCases(new Set(cases.map(c => c.id)))
    }
  }

  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-stone-900">
            {cases.length} case{cases.length !== 1 ? 's' : ''}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <Input
                type="search"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  Filter <ChevronDownIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Open')}>Open</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Closed')}>Closed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  Sort <ChevronDownIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSort('createdOn')}>Date Created</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('studentName')}>Student Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('status')}>Status</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedCases.size === cases.length && cases.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-xs font-medium text-stone-500">Created On</TableHead>
              <TableHead className="text-xs font-medium text-stone-500">Created By</TableHead>
              <TableHead className="text-xs font-medium text-stone-500">Student Name</TableHead>
              <TableHead className="text-xs font-medium text-stone-500">Case Type</TableHead>
              <TableHead className="text-xs font-medium text-stone-500">Issues</TableHead>
              <TableHead className="text-xs font-medium text-stone-500">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {cases.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-stone-500">No cases found</p>
                  {studentFilter && (
                    <p className="text-xs text-stone-400">This student has no cases recorded</p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            cases.map((caseItem) => {
              const isExpanded = expandedRows.has(caseItem.id)
              const isSelected = selectedCases.has(caseItem.id)

              return (
                <React.Fragment key={caseItem.id}>
                  {/* Main Row */}
                  <TableRow
                    className={cn(
                      'cursor-pointer',
                      isExpanded && 'bg-stone-50'
                    )}
                    onClick={() => toggleRowExpansion(caseItem.id)}
                  >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCaseSelection(caseItem.id)}
                    />
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {caseItem.createdOn}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                          getAvatarColor(caseItem.createdBy)
                        )}
                      >
                        {getInitials(caseItem.createdBy)}
                      </div>
                      <span className="text-stone-900">{caseItem.createdBy}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-stone-900">
                    {caseItem.studentName}
                  </TableCell>
                  <TableCell className="text-stone-900">
                    {caseItem.caseType}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUpIcon className="h-4 w-4 text-stone-400" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-stone-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                        caseItem.status === 'Open'
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-stone-300 bg-stone-50 text-stone-700'
                      )}
                    >
                      {caseItem.status}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit case</DropdownMenuItem>
                        <DropdownMenuItem>Close case</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Expanded Issues Row */}
                {isExpanded && (
                  <TableRow className="bg-stone-50 hover:bg-stone-50">
                    <TableCell colSpan={8} className="p-0">
                      <div className="px-16 py-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-stone-200">
                              <th className="pb-2 text-left text-sm font-semibold text-stone-900">
                                Issue Type
                              </th>
                              <th className="pb-2 text-left text-sm font-semibold text-stone-900">
                                Remarks
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseItem.issues.map((issue, index) => (
                              <tr
                                key={index}
                                className={cn(
                                  'border-b border-stone-100 last:border-0',
                                  index % 2 === 0 ? 'bg-white' : 'bg-stone-50'
                                )}
                              >
                                <td className="py-3 pr-4 text-sm text-stone-900">
                                  {issue.type}
                                </td>
                                <td className="py-3 text-sm text-stone-900">
                                  {issue.remarks}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
      </CardContent>
    </Card>
  )
}
