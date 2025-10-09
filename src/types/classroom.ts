// Classroom Module TypeScript Definitions

export type UserRole = 'Teacher' | 'FormTeacher' | 'HOD' | 'YearHead'

export type ClassType = 'Form' | 'Subject' | 'CCA'

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused'

export type AbsenceReason =
  | 'Sick'
  | 'Medical Appointment'
  | 'Family Emergency'
  | 'School Event'
  | 'Pre-approved Leave'
  | 'Transport Issues'
  | 'Other'

export type AlertSeverity = 'Urgent' | 'High' | 'Medium' | 'Low'

export type AlertType = 'Academic' | 'Attendance' | 'Behavioral' | 'Wellbeing' | 'Administrative'

export type CaseType = 'Academic' | 'Behavioral' | 'Wellbeing'

export type CaseSeverity = 'Critical' | 'High' | 'Medium' | 'Low'

export type CaseStatus = 'Active' | 'Resolved'

export type CommunicationType = 'Email' | 'Phone' | 'Meeting' | 'SMS'

export type AssessmentType = 'Assignment' | 'Quiz' | 'Exam' | 'Project'

export type ConductGrade = 'Excellent' | 'Above average' | 'Average' | 'Needs improvement'

export type StudentStatus = 'None' | 'GEP' | 'SEN' | 'SWAN'

// User/Teacher
export interface User {
  user_id: string
  name: string
  email: string
  role: UserRole
  department: string
  classes_assigned: string[] // Class IDs
  form_class_id?: string
  cca_classes: string[] // CCA Class IDs
  avatar?: string
}

// Class Schedule
export interface ClassSchedule {
  day: string
  start_time: string
  end_time: string
  location: string
}

// Class
export interface Class {
  class_id: string
  class_name: string // e.g., "5A", "6B"
  subject: string // e.g., "Mathematics", "English"
  year_level: number
  teacher_id: string
  form_teacher_id: string
  students: string[] // Student IDs
  schedule: ClassSchedule[]
  academic_year: string
  is_form_class: boolean
  student_count: number
}

// CCA Class
export interface CCAClass {
  cca_id: string
  name: string
  type: 'Sports' | 'Arts' | 'Clubs' | 'Uniformed Groups'
  teacher_in_charge: string
  members: string[] // Student IDs
  schedule: ClassSchedule[]
}

// Student
export interface Student {
  student_id: string
  name: string
  class_id: string
  class_name: string
  year_level: number
  status: StudentStatus
  conduct_grade: ConductGrade

  // Academic
  grades: {
    english?: number
    math?: number
    science?: number
    [subject: string]: number | undefined
  }

  // Attendance
  attendance_rate: number // percentage

  // Parent/Guardian
  parent_name: string
  parent_email: string
  parent_phone: string

  // Background
  health_declaration?: string
  friends: string[]
  family_background?: string
  housing_finance?: string

  // Flags
  has_medical_conditions: boolean
  needs_counselling: boolean
  has_disciplinary_issues: boolean
  has_sen: boolean

  avatar?: string
}

// Attendance Record
export interface AttendanceRecord {
  attendance_id: string
  student_id: string
  class_id: string
  date: string // ISO date string
  status: AttendanceStatus
  reason?: AbsenceReason
  notes?: string
  recorded_by: string
  recorded_at: string
  parent_notified: boolean
}

// Grade/Assessment
export interface Grade {
  grade_id: string
  student_id: string
  class_id: string
  assessment_type: AssessmentType
  assessment_name: string
  score: number
  max_score: number
  weightage: number
  percentage: number
  letter_grade: string
  graded_date: string
  published: boolean
  comments?: string
}

// Assignment
export interface Assignment {
  assignment_id: string
  class_id: string
  title: string
  description: string
  instructions?: string
  total_marks: number
  weightage: number
  due_date: string
  submission_method: 'Paper' | 'Online' | 'In-class'
  created_by: string
  created_date: string
  published: boolean
  attachments?: string[]
}

// Assignment Submission
export interface AssignmentSubmission {
  submission_id: string
  assignment_id: string
  student_id: string
  status: 'Submitted' | 'Pending' | 'Late' | 'Missing'
  submitted_date?: string
  grade?: number
  feedback?: string
  graded_by?: string
  graded_date?: string
}

// Case/Record
export interface Case {
  case_id: string
  student_id: string
  case_type: CaseType
  severity: CaseSeverity
  status: CaseStatus
  title: string
  description: string
  created_by: string
  created_date: string
  owner: string
  due_date?: string
  resolution?: string
  resolved_by?: string
  resolved_date?: string
  notes: CaseNote[]
  attachments?: string[]
}

// Case Note
export interface CaseNote {
  note_id: string
  case_id: string
  author: string
  date: string
  content: string
}

// Behavioral Incident
export interface BehavioralIncident {
  incident_id: string
  student_ids: string[]
  type: 'Minor' | 'Major' | 'Severe'
  category: 'Disruption' | 'Bullying' | 'Vandalism' | 'Insubordination' | 'Fighting' | 'Truancy' | 'Academic Dishonesty' | 'Other'
  date: string
  time: string
  location: string
  description: string
  actions_taken: string
  follow_up_required: boolean
  follow_up_action?: string
  reported_by: string
  witnesses?: string[]
  evidence?: string[]
}

// Communication Log
export interface CommunicationLog {
  comm_id: string
  student_id: string
  parent_id: string
  teacher_id: string
  type: CommunicationType
  subject: string
  content: string
  date: string
  attachments?: string[]
  acknowledged: boolean
  acknowledged_date?: string
}

// Class Alert
export interface ClassAlert {
  alert_id: string
  class_id: string
  student_id?: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  created_date: string
  due_date?: string
  status: 'Active' | 'Dismissed' | 'Resolved'
  dismissed_by?: string
  dismissed_date?: string
  quick_actions?: AlertAction[]
}

// Alert Action
export interface AlertAction {
  action_id: string
  label: string
  action: string // URL or action identifier
  variant?: 'default' | 'destructive' | 'outline'
}

// Wellbeing Check-in
export interface WellbeingCheckIn {
  checkin_id: string
  student_id: string
  date: string
  conducted_by: string
  emotional_state: 1 | 2 | 3 | 4 | 5 // 1=Very Concerned, 5=Excellent
  social_wellbeing: 1 | 2 | 3 | 4 | 5
  academic_stress: 1 | 2 | 3 | 4 | 5
  physical_health: 1 | 2 | 3 | 4 | 5
  observations: string
  requires_followup: boolean
  followup_action?: string
  notify_counselor: boolean
}

// Support Plan
export interface SupportPlan {
  plan_id: string
  student_id: string
  created_by: string
  created_date: string
  goals: string[]
  interventions: string[]
  responsibilities: {
    role: string
    name: string
    tasks: string[]
  }[]
  milestones: {
    milestone: string
    target_date: string
    completed: boolean
    completed_date?: string
  }[]
  review_date: string
  status: 'Active' | 'Completed' | 'On Hold'
}

// Report
export interface Report {
  report_id: string
  type: 'PTM' | 'Class Performance' | 'Individual Student' | 'Custom'
  title: string
  class_id?: string
  student_ids: string[]
  period: string
  created_by: string
  created_date: string
  status: 'Draft' | 'Published'
  progress: number // 0-100
  last_edited: string
  published_date?: string
  content?: string
  format: 'PDF' | 'Word' | 'Excel'
}

// Document
export interface Document {
  document_id: string
  type: 'Medical Form' | 'Parent Correspondence' | 'Official Letter'
  title: string
  student_id?: string
  uploaded_by: string
  upload_date: string
  file_url: string
  file_type: string
  file_size: number
  status?: 'Pending' | 'Approved' | 'Rejected'
  approved_by?: string
  approval_date?: string
  tags?: string[]
}

// Class Overview Stats
export interface ClassOverviewStats {
  class_id: string
  date: string
  attendance: {
    present: number
    absent: number
    late: number
    excused: number
    rate: number
  }
  academic: {
    pending_grades: number
    class_average: number
    upcoming_assessments: number
  }
  alerts: {
    urgent: number
    high: number
    medium: number
    low: number
    total: number
  }
}

// Activity Log
export interface ActivityLog {
  activity_id: string
  class_id?: string
  student_id?: string
  type: 'Attendance' | 'Grade' | 'Assignment' | 'Communication' | 'Case' | 'Alert'
  description: string
  performed_by: string
  date: string
  icon?: string
}
