export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academic_results: {
        Row: {
          assessment_date: string
          assessment_name: string
          assessment_type: string
          class_id: string | null
          created_at: string
          created_by: string | null
          grade: string | null
          id: string
          max_score: number | null
          percentage: number | null
          remarks: Json | null
          score: number | null
          student_id: string
          subject: string | null
          term: string | null
          updated_at: string
        }
        Insert: {
          assessment_date: string
          assessment_name: string
          assessment_type: string
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          grade?: string | null
          id?: string
          max_score?: number | null
          percentage?: number | null
          remarks?: Json | null
          score?: number | null
          student_id: string
          subject?: string | null
          term?: string | null
          updated_at?: string
        }
        Update: {
          assessment_date?: string
          assessment_name?: string
          assessment_type?: string
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          grade?: string | null
          id?: string
          max_score?: number | null
          percentage?: number | null
          remarks?: Json | null
          score?: number | null
          student_id?: string
          subject?: string | null
          term?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_results_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_results_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          class_id: string | null
          created_at: string
          date: string
          id: string
          is_official: boolean | null
          reason: string | null
          recorded_by: string | null
          remarks: string | null
          status: string
          student_id: string
          type: string
          updated_at: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          class_id?: string | null
          created_at?: string
          date: string
          id?: string
          is_official?: boolean | null
          reason?: string | null
          recorded_by?: string | null
          remarks?: string | null
          status: string
          student_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          is_official?: boolean | null
          reason?: string | null
          recorded_by?: string | null
          remarks?: string | null
          status?: string
          student_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      behaviour_observations: {
        Row: {
          action_taken: string | null
          category: string
          created_at: string
          description: string
          follow_up_date: string | null
          id: string
          location: string | null
          observation_date: string
          observed_by: string
          requires_follow_up: boolean | null
          severity: string | null
          student_id: string
          title: string
          updated_at: string
          witnesses: string[] | null
        }
        Insert: {
          action_taken?: string | null
          category: string
          created_at?: string
          description: string
          follow_up_date?: string | null
          id?: string
          location?: string | null
          observation_date?: string
          observed_by: string
          requires_follow_up?: boolean | null
          severity?: string | null
          student_id: string
          title: string
          updated_at?: string
          witnesses?: string[] | null
        }
        Update: {
          action_taken?: string | null
          category?: string
          created_at?: string
          description?: string
          follow_up_date?: string | null
          id?: string
          location?: string | null
          observation_date?: string
          observed_by?: string
          requires_follow_up?: boolean | null
          severity?: string | null
          student_id?: string
          title?: string
          updated_at?: string
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "behaviour_observations_observed_by_fkey"
            columns: ["observed_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behaviour_observations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      case_issues: {
        Row: {
          action_taken: string | null
          attachments: Json | null
          case_id: string
          created_at: string
          created_by: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          issue_description: string | null
          issue_title: string
          issue_type: string | null
          location: string | null
          occurred_date: string
          outcome: string | null
          severity: string
          updated_at: string
          witnesses: string[] | null
        }
        Insert: {
          action_taken?: string | null
          attachments?: Json | null
          case_id: string
          created_at?: string
          created_by: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          issue_description?: string | null
          issue_title: string
          issue_type?: string | null
          location?: string | null
          occurred_date?: string
          outcome?: string | null
          severity: string
          updated_at?: string
          witnesses?: string[] | null
        }
        Update: {
          action_taken?: string | null
          attachments?: Json | null
          case_id?: string
          created_at?: string
          created_by?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          issue_description?: string | null
          issue_title?: string
          issue_type?: string | null
          location?: string | null
          occurred_date?: string
          outcome?: string | null
          severity?: string
          updated_at?: string
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "case_issues_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_issues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          case_number: string
          case_type: string
          closed_date: string | null
          created_at: string
          created_by: string
          description: string | null
          guardian_notification_method: string | null
          guardian_notified: boolean | null
          guardian_notified_date: string | null
          id: string
          opened_date: string
          related_cases: string[] | null
          severity: string | null
          status: string
          student_id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          case_number: string
          case_type: string
          closed_date?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          guardian_notification_method?: string | null
          guardian_notified?: boolean | null
          guardian_notified_date?: string | null
          id?: string
          opened_date?: string
          related_cases?: string[] | null
          severity?: string | null
          status?: string
          student_id: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          case_number?: string
          case_type?: string
          closed_date?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          guardian_notification_method?: string | null
          guardian_notified?: boolean | null
          guardian_notified_date?: string | null
          id?: string
          opened_date?: string
          related_cases?: string[] | null
          severity?: string | null
          status?: string
          student_id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      cce_results: {
        Row: {
          academic_year: string
          assessed_by: string | null
          character: string | null
          citizenship: string | null
          comments: string | null
          created_at: string
          education: string | null
          id: string
          overall_grade: string | null
          student_id: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          assessed_by?: string | null
          character?: string | null
          citizenship?: string | null
          comments?: string | null
          created_at?: string
          education?: string | null
          id?: string
          overall_grade?: string | null
          student_id: string
          term: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          assessed_by?: string | null
          character?: string | null
          citizenship?: string | null
          comments?: string | null
          created_at?: string
          education?: string | null
          id?: string
          overall_grade?: string | null
          student_id?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cce_results_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cce_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          created_at: string
          id: string
          name: string
          schedule: Json | null
          subject_name: string | null
          type: string
          updated_at: string
          year_level: string | null
        }
        Insert: {
          academic_year?: string
          created_at?: string
          id?: string
          name: string
          schedule?: Json | null
          subject_name?: string | null
          type: string
          updated_at?: string
          year_level?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string
          id?: string
          name?: string
          schedule?: Json | null
          subject_name?: string | null
          type?: string
          updated_at?: string
          year_level?: string | null
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read: boolean | null
          sender_name: string
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_name: string
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_name?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          last_read_at: string | null
          participant_name: string
          participant_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          participant_name: string
          participant_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          participant_name?: string
          participant_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          status: string
          student_id: string
          subject: string | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string
          student_id: string
          subject?: string | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string
          student_id?: string
          subject?: string | null
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_relationships: {
        Row: {
          closeness_level: string | null
          created_at: string
          friend_id: string
          id: string
          notes: string | null
          observation_date: string | null
          observed_by: string | null
          relationship_type: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          closeness_level?: string | null
          created_at?: string
          friend_id: string
          id?: string
          notes?: string | null
          observation_date?: string | null
          observed_by?: string | null
          relationship_type?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          closeness_level?: string | null
          created_at?: string
          friend_id?: string
          id?: string
          notes?: string | null
          observation_date?: string | null
          observed_by?: string | null
          relationship_type?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_relationships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_relationships_observed_by_fkey"
            columns: ["observed_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_relationships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parents_guardians: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          occupation: string | null
          phone: string
          relationship: string
          updated_at: string
          work_phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          occupation?: string | null
          phone: string
          relationship: string
          updated_at?: string
          work_phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          occupation?: string | null
          phone?: string
          relationship?: string
          updated_at?: string
          work_phone?: string | null
        }
        Relationships: []
      }
      physical_fitness: {
        Row: {
          assessed_by: string | null
          assessment_date: string
          assessment_type: string
          created_at: string
          id: string
          metrics: Json
          overall_grade: string | null
          pass_status: boolean | null
          remarks: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          assessed_by?: string | null
          assessment_date: string
          assessment_type: string
          created_at?: string
          id?: string
          metrics: Json
          overall_grade?: string | null
          pass_status?: boolean | null
          remarks?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          assessed_by?: string | null
          assessment_date?: string
          assessment_type?: string
          created_at?: string
          id?: string
          metrics?: Json
          overall_grade?: string | null
          pass_status?: boolean | null
          remarks?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "physical_fitness_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_fitness_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      report_comments: {
        Row: {
          comment: string
          comment_type: string
          commenter_id: string
          created_at: string
          id: string
          is_resolved: boolean | null
          parent_comment_id: string | null
          report_id: string
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
        }
        Insert: {
          comment: string
          comment_type?: string
          commenter_id: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          parent_comment_id?: string | null
          report_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string
          comment_type?: string
          commenter_id?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          parent_comment_id?: string | null
          report_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_comments_commenter_id_fkey"
            columns: ["commenter_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "report_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_comments_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          academic_year: string
          approved_at: string | null
          approved_by: string | null
          content: Json
          created_at: string
          created_by: string
          id: string
          published_date: string | null
          report_type: string
          review_requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          student_id: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          approved_at?: string | null
          approved_by?: string | null
          content?: Json
          created_at?: string
          created_by: string
          id?: string
          published_date?: string | null
          report_type?: string
          review_requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id: string
          term: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          approved_at?: string | null
          approved_by?: string | null
          content?: Json
          created_at?: string
          created_by?: string
          id?: string
          published_date?: string | null
          report_type?: string
          review_requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_classes: {
        Row: {
          class_id: string
          created_at: string
          enrollment_date: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          enrollment_date?: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          enrollment_date?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          can_pickup: boolean
          created_at: string
          emergency_contact_priority: number
          guardian_id: string
          id: string
          is_primary: boolean
          notes: string | null
          student_id: string
        }
        Insert: {
          can_pickup?: boolean
          created_at?: string
          emergency_contact_priority?: number
          guardian_id: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          student_id: string
        }
        Update: {
          can_pickup?: boolean
          created_at?: string
          emergency_contact_priority?: number
          guardian_id?: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "parents_guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_overview: {
        Row: {
          background: string | null
          conduct_grade: string | null
          created_at: string
          family: Json | null
          health_declaration: Json | null
          housing_finance: Json | null
          id: string
          is_swan: boolean | null
          medical_conditions: Json | null
          mental_wellness: Json | null
          student_id: string
          swan_details: Json | null
          updated_at: string
        }
        Insert: {
          background?: string | null
          conduct_grade?: string | null
          created_at?: string
          family?: Json | null
          health_declaration?: Json | null
          housing_finance?: Json | null
          id?: string
          is_swan?: boolean | null
          medical_conditions?: Json | null
          mental_wellness?: Json | null
          student_id: string
          swan_details?: Json | null
          updated_at?: string
        }
        Update: {
          background?: string | null
          conduct_grade?: string | null
          created_at?: string
          family?: Json | null
          health_declaration?: Json | null
          housing_finance?: Json | null
          id?: string
          is_swan?: boolean | null
          medical_conditions?: Json | null
          mental_wellness?: Json | null
          student_id?: string
          swan_details?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_overview_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_private_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          note: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          note: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          note?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_private_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_private_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year: string
          created_at: string
          date_of_birth: string | null
          form_teacher_id: string | null
          gender: string | null
          id: string
          name: string
          nationality: string | null
          primary_guardian_id: string
          profile_photo: string | null
          student_id: string
          updated_at: string
          year_level: string | null
        }
        Insert: {
          academic_year?: string
          created_at?: string
          date_of_birth?: string | null
          form_teacher_id?: string | null
          gender?: string | null
          id?: string
          name: string
          nationality?: string | null
          primary_guardian_id: string
          profile_photo?: string | null
          student_id: string
          updated_at?: string
          year_level?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string
          date_of_birth?: string | null
          form_teacher_id?: string | null
          gender?: string | null
          id?: string
          name?: string
          nationality?: string | null
          primary_guardian_id?: string
          profile_photo?: string | null
          student_id?: string
          updated_at?: string
          year_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_form_teacher_id_fkey"
            columns: ["form_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_primary_guardian_id_fkey"
            columns: ["primary_guardian_id"]
            isOneToOne: false
            referencedRelation: "parents_guardians"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_classes: {
        Row: {
          class_id: string
          created_at: string
          id: string
          role: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          role?: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          role?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          avatar: string | null
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          department?: string | null
          email: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      teacher_has_access_to_student: {
        Args: { student_uuid: string; teacher_uuid: string }
        Returns: boolean
      }
      teacher_is_form_teacher: {
        Args: { student_uuid: string; teacher_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
