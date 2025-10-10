// TypeScript types for Supabase database schema
// Auto-generated types based on our migration files

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string
          name: string
          email: string
          department: string | null
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          department?: string | null
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          department?: string | null
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          type: 'subject' | 'form' | 'cca'
          subject_name: string | null
          year_level: string | null
          academic_year: string
          schedule: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'subject' | 'form' | 'cca'
          subject_name?: string | null
          year_level?: string | null
          academic_year?: string
          schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'subject' | 'form' | 'cca'
          subject_name?: string | null
          year_level?: string | null
          academic_year?: string
          schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      teacher_classes: {
        Row: {
          id: string
          teacher_id: string
          class_id: string
          role: 'teacher' | 'form_teacher'
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id: string
          role?: 'teacher' | 'form_teacher'
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string
          role?: 'teacher' | 'form_teacher'
          created_at?: string
        }
      }
      parents_guardians: {
        Row: {
          id: string
          name: string
          relationship: string
          phone: string
          email: string | null
          occupation: string | null
          work_phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          relationship: string
          phone: string
          email?: string | null
          occupation?: string | null
          work_phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          relationship?: string
          phone?: string
          email?: string | null
          occupation?: string | null
          work_phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          student_id: string
          name: string
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          nationality: string | null
          form_teacher_id: string | null
          primary_guardian_id: string
          academic_year: string
          year_level: string | null
          profile_photo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          name: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          nationality?: string | null
          form_teacher_id?: string | null
          primary_guardian_id: string
          academic_year?: string
          year_level?: string | null
          profile_photo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          name?: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          nationality?: string | null
          form_teacher_id?: string | null
          primary_guardian_id?: string
          academic_year?: string
          year_level?: string | null
          profile_photo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_guardians: {
        Row: {
          id: string
          student_id: string
          guardian_id: string
          is_primary: boolean
          emergency_contact_priority: number
          can_pickup: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          guardian_id: string
          is_primary?: boolean
          emergency_contact_priority?: number
          can_pickup?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          guardian_id?: string
          is_primary?: boolean
          emergency_contact_priority?: number
          can_pickup?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      student_classes: {
        Row: {
          id: string
          student_id: string
          class_id: string
          enrollment_date: string
          status: 'active' | 'dropped' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          enrollment_date?: string
          status?: 'active' | 'dropped' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          enrollment_date?: string
          status?: 'active' | 'dropped' | 'completed'
          created_at?: string
        }
      }
      student_overview: {
        Row: {
          id: string
          student_id: string
          background: string | null
          medical_conditions: Json | null
          health_declaration: Json | null
          mental_wellness: Json | null
          family: Json | null
          housing_finance: Json | null
          is_swan: boolean
          swan_details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          background?: string | null
          medical_conditions?: Json | null
          health_declaration?: Json | null
          mental_wellness?: Json | null
          family?: Json | null
          housing_finance?: Json | null
          is_swan?: boolean
          swan_details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          background?: string | null
          medical_conditions?: Json | null
          health_declaration?: Json | null
          mental_wellness?: Json | null
          family?: Json | null
          housing_finance?: Json | null
          is_swan?: boolean
          swan_details?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      student_private_notes: {
        Row: {
          id: string
          student_id: string
          note: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          note: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          note?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          class_id: string | null
          date: string
          type: 'daily' | 'cca' | 'school_event'
          status: 'present' | 'absent' | 'late' | 'early_dismissal'
          is_official: boolean
          reason: string | null
          remarks: string | null
          check_in_time: string | null
          check_out_time: string | null
          recorded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id?: string | null
          date: string
          type?: 'daily' | 'cca' | 'school_event'
          status: 'present' | 'absent' | 'late' | 'early_dismissal'
          is_official?: boolean
          reason?: string | null
          remarks?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string | null
          date?: string
          type?: 'daily' | 'cca' | 'school_event'
          status?: 'present' | 'absent' | 'late' | 'early_dismissal'
          is_official?: boolean
          reason?: string | null
          remarks?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      academic_results: {
        Row: {
          id: string
          student_id: string
          class_id: string | null
          assessment_type: string
          assessment_name: string
          assessment_date: string
          term: string | null
          score: number | null
          max_score: number | null
          percentage: number | null
          grade: string | null
          remarks: Json | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id?: string | null
          assessment_type: string
          assessment_name: string
          assessment_date: string
          term?: string | null
          score?: number | null
          max_score?: number | null
          percentage?: number | null
          grade?: string | null
          remarks?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string | null
          assessment_type?: string
          assessment_name?: string
          assessment_date?: string
          term?: string | null
          score?: number | null
          max_score?: number | null
          percentage?: number | null
          grade?: string | null
          remarks?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      physical_fitness: {
        Row: {
          id: string
          student_id: string
          assessment_date: string
          assessment_type: string
          metrics: Json
          overall_grade: string | null
          pass_status: boolean | null
          remarks: string | null
          assessed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          assessment_date: string
          assessment_type: string
          metrics: Json
          overall_grade?: string | null
          pass_status?: boolean | null
          remarks?: string | null
          assessed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          assessment_date?: string
          assessment_type?: string
          metrics?: Json
          overall_grade?: string | null
          pass_status?: boolean | null
          remarks?: string | null
          assessed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cce_results: {
        Row: {
          id: string
          student_id: string
          term: string
          academic_year: string
          character: string | null
          citizenship: string | null
          education: string | null
          overall_grade: string | null
          comments: string | null
          assessed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          term: string
          academic_year: string
          character?: string | null
          citizenship?: string | null
          education?: string | null
          overall_grade?: string | null
          comments?: string | null
          assessed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          term?: string
          academic_year?: string
          character?: string | null
          citizenship?: string | null
          education?: string | null
          overall_grade?: string | null
          comments?: string | null
          assessed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      friend_relationships: {
        Row: {
          id: string
          student_id: string
          friend_id: string
          relationship_type: string | null
          closeness_level: 'very_close' | 'close' | 'acquaintance' | null
          notes: string | null
          observed_by: string | null
          observation_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          friend_id: string
          relationship_type?: string | null
          closeness_level?: 'very_close' | 'close' | 'acquaintance' | null
          notes?: string | null
          observed_by?: string | null
          observation_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          friend_id?: string
          relationship_type?: string | null
          closeness_level?: 'very_close' | 'close' | 'acquaintance' | null
          notes?: string | null
          observed_by?: string | null
          observation_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      behaviour_observations: {
        Row: {
          id: string
          student_id: string
          observation_date: string
          category: string
          title: string
          description: string
          severity: 'low' | 'medium' | 'high' | null
          location: string | null
          witnesses: string[] | null
          action_taken: string | null
          requires_follow_up: boolean
          follow_up_date: string | null
          observed_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          observation_date?: string
          category: string
          title: string
          description: string
          severity?: 'low' | 'medium' | 'high' | null
          location?: string | null
          witnesses?: string[] | null
          action_taken?: string | null
          requires_follow_up?: boolean
          follow_up_date?: string | null
          observed_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          observation_date?: string
          category?: string
          title?: string
          description?: string
          severity?: 'low' | 'medium' | 'high' | null
          location?: string | null
          witnesses?: string[] | null
          action_taken?: string | null
          requires_follow_up?: boolean
          follow_up_date?: string | null
          observed_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          student_id: string
          case_number: string
          case_type: 'discipline' | 'sen' | 'counselling' | 'career_guidance'
          title: string
          description: string | null
          status: 'open' | 'in_progress' | 'closed'
          severity: 'low' | 'medium' | 'high' | null
          opened_date: string
          closed_date: string | null
          created_by: string
          assigned_to: string | null
          guardian_notified: boolean
          guardian_notified_date: string | null
          guardian_notification_method: string | null
          related_cases: string[] | null
          attachments: Json | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          case_number?: string
          case_type: 'discipline' | 'sen' | 'counselling' | 'career_guidance'
          title: string
          description?: string | null
          status?: 'open' | 'in_progress' | 'closed'
          severity?: 'low' | 'medium' | 'high' | null
          opened_date?: string
          closed_date?: string | null
          created_by: string
          assigned_to?: string | null
          guardian_notified?: boolean
          guardian_notified_date?: string | null
          guardian_notification_method?: string | null
          related_cases?: string[] | null
          attachments?: Json | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          case_number?: string
          case_type?: 'discipline' | 'sen' | 'counselling' | 'career_guidance'
          title?: string
          description?: string | null
          status?: 'open' | 'in_progress' | 'closed'
          severity?: 'low' | 'medium' | 'high' | null
          opened_date?: string
          closed_date?: string | null
          created_by?: string
          assigned_to?: string | null
          guardian_notified?: boolean
          guardian_notified_date?: string | null
          guardian_notification_method?: string | null
          related_cases?: string[] | null
          attachments?: Json | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      case_issues: {
        Row: {
          id: string
          case_id: string
          issue_title: string
          issue_description: string | null
          occurred_date: string
          severity: 'low' | 'medium' | 'high'
          issue_type: string | null
          action_taken: string | null
          outcome: string | null
          follow_up_required: boolean
          follow_up_date: string | null
          location: string | null
          witnesses: string[] | null
          attachments: Json | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          issue_title: string
          issue_description?: string | null
          occurred_date?: string
          severity: 'low' | 'medium' | 'high'
          issue_type?: string | null
          action_taken?: string | null
          outcome?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          location?: string | null
          witnesses?: string[] | null
          attachments?: Json | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          issue_title?: string
          issue_description?: string | null
          occurred_date?: string
          severity?: 'low' | 'medium' | 'high'
          issue_type?: string | null
          action_taken?: string | null
          outcome?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          location?: string | null
          witnesses?: string[] | null
          attachments?: Json | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          student_id: string
          term: string
          academic_year: string
          report_type: 'hdp' | 'progress' | 'special'
          status: 'draft' | 'needs_review' | 'approved' | 'published'
          content: Json
          created_by: string
          reviewed_by: string | null
          approved_by: string | null
          published_date: string | null
          review_requested_at: string | null
          reviewed_at: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          term: string
          academic_year: string
          report_type?: 'hdp' | 'progress' | 'special'
          status?: 'draft' | 'needs_review' | 'approved' | 'published'
          content?: Json
          created_by: string
          reviewed_by?: string | null
          approved_by?: string | null
          published_date?: string | null
          review_requested_at?: string | null
          reviewed_at?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          term?: string
          academic_year?: string
          report_type?: 'hdp' | 'progress' | 'special'
          status?: 'draft' | 'needs_review' | 'approved' | 'published'
          content?: Json
          created_by?: string
          reviewed_by?: string | null
          approved_by?: string | null
          published_date?: string | null
          review_requested_at?: string | null
          reviewed_at?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      report_comments: {
        Row: {
          id: string
          report_id: string
          commenter_id: string
          comment: string
          comment_type: 'feedback' | 'revision_request' | 'approval' | 'question' | 'general'
          is_resolved: boolean
          resolved_by: string | null
          resolved_at: string | null
          parent_comment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          commenter_id: string
          comment: string
          comment_type?: 'feedback' | 'revision_request' | 'approval' | 'question' | 'general'
          is_resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          commenter_id?: string
          comment?: string
          comment_type?: 'feedback' | 'revision_request' | 'approval' | 'question' | 'general'
          is_resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      teacher_has_access_to_student: {
        Args: {
          teacher_uuid: string
          student_uuid: string
        }
        Returns: boolean
      }
      teacher_is_form_teacher: {
        Args: {
          teacher_uuid: string
          student_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
