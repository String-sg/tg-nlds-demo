import type { Json } from '@/types/database'

/**
 * Student Profile Data structure
 * Used for displaying comprehensive student information
 */
export interface StudentProfileData {
  // Basic info
  id: string
  student_id: string
  name: string
  class_name: string
  year_level: string | null
  form_class_id: string | null

  // Overview data
  overview: {
    background: string | null
    medical_conditions: Json | null
    health_declaration: Json | null
    mental_wellness: Json | null
    family: Json | null
    housing_finance: Json | null
    is_swan: boolean | null
    swan_details: Json | null
  } | null

  // Guardian info
  guardian: {
    name: string
    email: string | null
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
    remarks: Json | null
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
