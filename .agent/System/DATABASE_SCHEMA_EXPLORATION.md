# Database Schema & Seed Data Exploration Summary

**Date**: November 4, 2025
**Project**: MOE Teacher-Student Management System (Next.js 15 + Supabase)
**Location**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/carthage/`

---

## Executive Summary

The project has a **comprehensive Supabase database schema with 19 tables** spanning student management, academic records, behavior tracking, cases, and reporting. Current seeding includes **36+ students** in Class 5A with full guardian, academic, attendance, and case data. The schema is **production-ready** with RLS policies, migrations, and TypeScript types already in place.

---

## Part 1: Database Schema Overview

### 1.1 Complete Table Structure (19 Tables)

#### **CORE TABLES (3)**
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `teachers` | Staff records | id, name, email, department, avatar, created_at, updated_at |
| `classes` | All class types (form, subject, CCA) | id, name, type, subject_name, year_level, academic_year, schedule (JSONB), created_at, updated_at |
| `teacher_classes` | Teacher-class assignments | id, teacher_id, class_id, role (teacher/form_teacher), created_at |

#### **GUARDIANS & STUDENTS (4)**
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `parents_guardians` | Parent/guardian information | id, name, relationship, phone, email, occupation, work_phone, address, created_at, updated_at |
| `students` | Student master records | id, student_id (unique), name, date_of_birth, gender, nationality, form_teacher_id, primary_guardian_id, academic_year, year_level, profile_photo, created_at, updated_at |
| `student_guardians` | Multi-guardian support (junction) | id, student_id, guardian_id, is_primary, emergency_contact_priority, can_pickup, notes, created_at |
| `student_classes` | Student-class enrollments | id, student_id, class_id, enrollment_date, status (active/dropped/completed), created_at |

**Multi-Guardian Support**: Each student has 1 required primary guardian + unlimited additional guardians with priority ordering and pickup authorization tracking.

#### **STUDENT DATA TABLES (6)**
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `student_overview` | Student profile & health data | id, student_id (UNIQUE), background, medical_conditions (JSONB), health_declaration (JSONB), mental_wellness (JSONB), family (JSONB), housing_finance (JSONB), is_swan (BOOLEAN), swan_details (JSONB), created_at, updated_at |
| `student_private_notes` | Multi-teacher notes with audit trail | id, student_id, note, created_by (teacher_id), created_at, updated_at |
| `attendance` | Daily/CCA/event attendance | id, student_id, class_id, date, type (daily/cca/school_event), status (present/absent/late/early_dismissal), is_official, reason, remarks, check_in_time, check_out_time, recorded_by (teacher_id), created_at, updated_at |
| `academic_results` | Assessment scores & grades | id, student_id, class_id, assessment_type, assessment_name, assessment_date, term, score, max_score, percentage, grade, remarks (JSONB), created_by (teacher_id), created_at, updated_at |
| `physical_fitness` | PE assessments (NAPFA, etc.) | id, student_id, assessment_date, assessment_type, metrics (JSONB), overall_grade, pass_status, remarks, assessed_by (teacher_id), created_at, updated_at |
| `cce_results` | Character/Citizenship/Education assessments | id, student_id, term, academic_year, character, citizenship, education, overall_grade, comments, assessed_by (teacher_id), created_at, updated_at |

**Data Model Notes:**
- `student_overview` is UNIQUE per student (one overview record per student)
- `medical_conditions` stores: `{ allergies: [], medications: [], conditions: [] }`
- `metrics` in physical_fitness is flexible JSONB: `{ sit_ups: 40, shuttle_run: '9.5s', bmi: 18.2, ... }`
- `remarks` in academic_results: `{ strengths: [], areas_for_improvement: [], teacher_comments: '' }`

#### **SOCIAL & BEHAVIOUR TABLES (2)**
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `friend_relationships` | Student peer relationships | id, student_id, friend_id (prevents self), relationship_type, closeness_level (very_close/close/acquaintance), notes, observed_by (teacher_id), observation_date, created_at, updated_at |
| `behaviour_observations` | Teacher behavior notes (positive & concerning) | id, student_id, observation_date, category (positive/concern/neutral/discipline), title, description, severity (low/medium/high), location, witnesses (array), action_taken, requires_follow_up, follow_up_date, observed_by (teacher_id), created_at, updated_at |

#### **CASES SYSTEM (2)**
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `cases` | Case management (discipline, SEN, counselling, career) | id, student_id, case_number (auto-generated: e.g., DIS-2025-0001), case_type (discipline/sen/counselling/career_guidance), title, description, status (open/in_progress/closed), severity (low/medium/high), opened_date, closed_date, created_by (teacher_id), assigned_to (teacher_id), guardian_notified, guardian_notified_date, guardian_notification_method, related_cases (UUID array), attachments (JSONB), tags (array), created_at, updated_at |
| `case_issues` | Individual issues/incidents within cases | id, case_id, issue_title, issue_description, occurred_date, severity (low/medium/high), issue_type, action_taken, outcome, follow_up_required, follow_up_date, location, witnesses (array), attachments (JSONB), created_by (teacher_id), created_at, updated_at |

**Cases Features:**
- **Auto-generated case numbers** with prefix based on type: DIS (discipline), SEN, CNS (counselling), CAR (career)
- **Multiple issues per case** allowing detailed incident tracking
- **Guardian notification workflow** with dates and methods
- **Auto-closed date** set when status changes to 'closed'

#### **CONVERSATIONS SYSTEM (3)** *(Recent Addition)*
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `conversations` | Parent-teacher conversation threads | id, student_id, class_id, teacher_id, status (active/archived/resolved), subject, last_message_at, created_at, updated_at |
| `conversation_messages` | Individual messages in conversations | id, conversation_id, sender_type (teacher/parent), sender_name, content, read, created_at |
| `conversation_participants` | Conversation participants tracking | id, conversation_id, participant_type (teacher/parent), participant_name, last_read_at, created_at |

---

## Part 2: Current Seed Data

### 2.1 What Data Currently Exists

#### **Teachers**
- **1 teacher seeded**: Daniel Tan
  - Email: daniel.tan@school.edu.sg
  - Department: Mathematics
  - Form teacher for Class 5A

#### **Classes**
- **Main class**: 5A (form class, type='form')
  - Year level: 5
  - Academic year: 2025
  - Schedule: Monday-Friday, 07:30-08:00 (morning registration)
- **Subject classes**: 
  - 5A Science (Tuesday & Thursday, 09:00-10:30)
  - 5A Mathematics (Monday, Wednesday, Friday, 08:00-09:30)
  - Others potentially added
- **CCA**: Football CCA (Friday, 15:00-17:00)

#### **Students & Guardians**

**Total Students**: ~36+ students in Class 5A

**Breakdown**:
1. **12 "Case Students"** (from migration `20250122000001_add_12_case_students_primary_5a.sql`)
   - Eric Lim, Lim Hui Ling, Siti Nurul Ain, Chen Jia Yi, Nicholas Loh, Muhammad Iskandar, Tan Wei Jie, Alice Wong, Priya Krishnan, Reza Halim, Wong Kai Xuan, Ryan Tan
   - Each has: guardians, private notes, cases (discipline/SEN/counselling)
   - Multiple case issues per case

2. **24 Additional Students** (from migration `20250113000001_add_24_students_to_class_5a.sql`)
   - Harper Koh, Ethan Seah, Zara Begum, Ryan Goh, Maya Kumar, Isaac Yap, Chloe Tan, Aiden Wong, Isabelle Chia, Lucas Neo, Hannah Lim, Noah Phua, Sofia Rahman, Caleb Soh, Aria Tay, Jayden Ong, Mila Chen, Liam Tan, and 6 more
   - Each has: primary guardian with contact info and occupation
   - Generally fewer case/private notes data

#### **Associated Data with Students**

- **Student Overview**: Background, medical conditions, health declarations, family info, housing/finance
- **Guardians**: 36+ guardians seeded (multi-guardian relationships)
- **Attendance**: Some students have attendance records
- **Academic Results**: Some assessment scores seeded
- **Private Notes**: Multi-teacher notes on case students
- **Cases**: Active discipline, SEN, and counselling cases
- **Case Issues**: Multiple issues per case with actions and outcomes
- **Social & Behaviour**: Observations and friendship relationships

### 2.2 Data Sparsity Assessment

#### **Well-Populated Tables** ✅
1. `parents_guardians` - 36+ records (one per student)
2. `students` - 36+ records (12 case + 24 regular)
3. `student_guardians` - Fully linked
4. `student_classes` - All 36+ students enrolled in 5A
5. `teachers` - 1 main teacher (Daniel Tan)
6. `classes` - Main classes created with schedules

#### **Partially Populated Tables** 🟡
1. `student_overview` - Exists for most students but health/family details sparse
2. `student_private_notes` - Only case students (12) have substantial notes
3. `behaviour_observations` - Some observations for case students
4. `attendance` - Limited records, not comprehensive
5. `academic_results` - Limited assessment records
6. `friend_relationships` - Some peer relationships seeded for case students
7. `cases` - 12 case students have active cases

#### **Empty/Minimal Tables** ⚠️
1. `cce_results` - No CCE assessment data (migration `20251103000001_remove_cce_results.sql` may have removed this)
2. `physical_fitness` - No NAPFA or PE assessment data
3. `conversation_messages` - May have seed script but limited integration
4. `conversation_participants` - May need seeding
5. `report_comments` - May be empty (reports system recently removed per migrations)

---

## Part 3: Schema Files & Migrations Location

### 3.1 Migration Files Directory
**Path**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/carthage/supabase/migrations/`

**All 21 Migration Files** (in order):

1. `20250110000000_create_core_tables.sql` - Teachers, classes, teacher_classes
2. `20250110000001_create_guardian_student_tables.sql` - Parents, students, guardians, enrollments
3. `20250110000002_create_student_data_tables.sql` - Overview, notes, attendance, results, fitness, CCE
4. `20250110000003_create_social_behaviour_tables.sql` - Friendships, behavior observations
5. `20250110000004_create_cases_system.sql` - Cases and case issues
6. `20250110000005_create_reports_system.sql` - Reports (recently removed)
7. `20250110000006_create_rls_policies.sql` - Row-level security policies
8. `20250110000007_add_dev_policies.sql` - Development RLS bypass
9. `20250110000008_add_remaining_dev_policies.sql` - Additional dev policies
10. `20250112000001_add_conduct_grade_to_student_overview.sql` - Conduct grade field (later removed)
11. `20250112000002_add_subject_to_academic_results.sql` - Subject field added
12. `20250113000001_add_24_students_to_class_5a.sql` - **24 student data seed**
13. `20250122000001_add_12_case_students_primary_5a.sql` - **12 case student data seed**
14. `20250122000002_add_missing_data_12_case_students.sql` - Complete case student data
15. `20250122000003_verify_ryan_tan_data.sql` - Ryan Tan verification
16. `20250122000004_add_social_behaviour_data_5a.sql` - Social/behavior data
17. `20250122120000_add_additional_cases_primary_5a.sql` - Additional cases
18. `20250130000001_seed_class_schedules.sql` - Class schedules (JSON)
19. `20251027112648_create_conversations_tables.sql` - Conversations system (new)
20. `20251031000001_remove_conduct_grade.sql` - Remove conduct grade
21. `20251103000001_remove_cce_results.sql` - Remove CCE results

### 3.2 TypeScript Type Definitions
**Path**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/carthage/src/types/database.ts`

Auto-generated database types from Supabase schema.

### 3.3 Query Helpers
**Path**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/carthage/src/lib/supabase/queries.ts`

19 pre-built query functions covering:
- Students (with guardians, full profile, form class, teacher students)
- Attendance (student attendance, class attendance)
- Academic results (results by term)
- Private notes
- Cases (get cases, get with issues, create case, create issue)
- Reports (get reports, with comments, by term/status)
- Classes (teacher classes, class details, form class)
- Social (behavior observations, friendships)
- Dashboard (student alerts with multi-table joins)

### 3.4 Data Adapters
**Path**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/carthage/src/lib/supabase/adapters.ts`

6 transformation functions:
- `mapTeacherToUser` - Database teacher → UI User
- `mapSupabaseClassToClass` - Database class → UI Class
- `mapSupabaseClassToCCAClass` - Database class → UI CCAClass
- `mapSupabaseStudentToStudent` - Database student → UI Student
- `enrichStudentWithGrades` - Add academic results
- `enrichStudentWithAttendance` - Add attendance rate

### 3.5 Supabase Client Files
- **Browser Client**: `src/lib/supabase/client.ts`
- **Server Client**: `src/lib/supabase/server.ts`
- **Middleware**: `src/lib/supabase/middleware.ts`

### 3.6 Existing Seed Scripts
**Path**: `/Users/rezailmi/Documents/GitHub/moe-tg-vx/scripts/`

1. `seed-supabase.ts` - Main seeding script (clears & repopulates all tables)
2. `seed-student-data.ts` - Additional student data
3. `seed-private-notes.ts` - Private notes seeding
4. `seed-attendance-for-new-students.ts` - Attendance records
5. `seed-eric-ryan-students.ts` - Specific case students
6. `seed-conversations.js` - Conversation data
7. `verify-seeded-data.ts` - Data verification

---

## Part 4: Data Structure Deep Dive

### 4.1 Student Record Example

```typescript
// Complete student with related data
{
  // Student basic info
  id: "uuid-123",
  student_id: "S0012345",
  name: "Eric Lim",
  date_of_birth: "2013-05-15",
  gender: "male",
  nationality: "Singaporean",
  year_level: "5",
  academic_year: "2025",
  
  // Teachers & Classes
  form_teacher_id: "uuid-daniel-tan",
  form_teacher: {
    id: "uuid-daniel-tan",
    name: "Daniel Tan",
    email: "daniel.tan@school.edu.sg",
    department: "Mathematics"
  },
  
  // Guardian relationships
  primary_guardian_id: "uuid-guardian-1",
  primary_guardian: {
    id: "uuid-guardian-1",
    name: "Dr. & Mrs. Lim",
    relationship: "parents",
    phone: "+65 9123 5001",
    email: "dr.lim@email.com",
    occupation: "Medical Professionals",
    address: "Blk 101 Bukit Timah Ave 5"
  },
  
  // Additional guardians
  guardians: [
    {
      guardian: { /* full guardian object */ },
      is_primary: true,
      emergency_contact_priority: 1,
      can_pickup: true,
      notes: null
    }
  ],
  
  // Student classes
  classes: [
    {
      class_id: "uuid-5a",
      enrollment_date: "2025-01-01",
      status: "active",
      class: {
        id: "uuid-5a",
        name: "5A",
        type: "form",
        schedule: [
          { day: 1, start_time: "07:30", end_time: "08:00", location: "Classroom 5A" },
          // ... more days
        ]
      }
    }
  ],
  
  // Overview data
  overview: {
    student_id: "uuid-123",
    background: "SWAN case - requires additional support",
    medical_conditions: {
      allergies: ["Peanuts"],
      medications: ["Asthma inhaler (blue)"],
      conditions: ["Asthma", "ADHD"]
    },
    family: {
      siblings: 1,
      home_situation: "Both parents working professionals",
      notes: "Supportive family environment"
    },
    is_swan: true,
    swan_details: {
      type: "Learning Disability",
      support_plan: "1-to-1 mentor support",
      accommodations: ["Extended time for exams"]
    }
  }
}
```

### 4.2 Case Record Example

```typescript
{
  id: "uuid-case-1",
  student_id: "uuid-eric",
  case_number: "DIS-2025-0001",  // Auto-generated
  case_type: "discipline",
  title: "Repeated tardiness and classroom disruption",
  description: "Student has been late 5+ times this month and disrupts class",
  status: "open",
  severity: "medium",
  opened_date: "2025-01-15",
  closed_date: null,
  created_by: "uuid-daniel-tan",
  assigned_to: "uuid-daniel-tan",
  guardian_notified: true,
  guardian_notified_date: "2025-01-16",
  guardian_notification_method: "phone",
  related_cases: [],
  attachments: [],
  tags: ["attendance", "behavior"],
  
  // Associated issues
  issues: [
    {
      id: "uuid-issue-1",
      case_id: "uuid-case-1",
      issue_title: "Late to school - 5 occurrences",
      issue_description: "Student arrived after 8:00am on 5 occasions",
      occurred_date: "2025-01-15",
      severity: "medium",
      issue_type: "incident",
      action_taken: "Guardian meeting scheduled",
      outcome: "Parent acknowledged, agreed to monitor",
      follow_up_required: true,
      follow_up_date: "2025-02-01",
      location: "School entrance",
      witnesses: ["Security guard"]
    },
    {
      id: "uuid-issue-2",
      case_id: "uuid-case-1",
      issue_title: "Classroom disruption",
      issue_description: "Student talks out of turn, interrupts peers",
      occurred_date: "2025-01-16",
      severity: "low",
      issue_type: "incident",
      action_taken: "Moved seat to front",
      outcome: "Behavior improved next day",
      follow_up_required: false
    }
  ]
}
```

### 4.3 Attendance Record Example

```typescript
{
  id: "uuid-att-1",
  student_id: "uuid-eric",
  class_id: "uuid-5a",
  date: "2025-01-20",
  type: "daily",  // 'daily', 'cca', 'school_event'
  status: "late",  // 'present', 'absent', 'late', 'early_dismissal'
  is_official: false,
  reason: null,
  remarks: "Arrived 15 minutes late",
  check_in_time: "08:15",
  check_out_time: null,
  recorded_by: "uuid-daniel-tan",
  created_at: "2025-01-20T08:20:00Z"
}
```

### 4.4 Academic Result Example

```typescript
{
  id: "uuid-acad-1",
  student_id: "uuid-eric",
  class_id: "uuid-5a-math",
  assessment_type: "exam",
  assessment_name: "Mid-Year Examination",
  assessment_date: "2025-06-15",
  term: "Term 2 2025",
  score: 78.5,
  max_score: 100,
  percentage: 78.5,
  grade: "B+",
  remarks: {
    strengths: ["Good problem-solving skills", "Shows improvement"],
    areas_for_improvement: ["Careless errors in calculations", "Time management"],
    teacher_comments: "Eric needs to double-check his work before submission"
  },
  created_by: "uuid-daniel-tan",
  subject: "Mathematics"
}
```

---

## Part 5: Missing/Sparse Data Analysis

### 5.1 What's Needed for Comprehensive Seeding

#### **Priority 1: High-Value Data** (Most Impactful)

1. **Attendance Records** (Critical)
   - Current: Minimal or empty
   - Needed: 60 days of daily attendance for each student
   - Impact: Essential for "Attendance %" calculations, analytics
   - Suggestion: Generate last 60 days with realistic patterns (90-100% attendance typical)

2. **Academic Results** (Critical)
   - Current: Sparse/limited
   - Needed: Results for multiple assessments per subject
   - Subjects: Mathematics, Science, English, other core subjects
   - Terms: Term 1, Term 2, (maybe Term 3)
   - Suggestion: Generate 5-10 assessments per student across subjects

3. **Physical Fitness (NAPFA)** (Important for PE tracking)
   - Current: Empty
   - Needed: One NAPFA assessment per student (annual)
   - Metrics: Sit-ups, shuttle run, standing broad jump, etc.
   - Grades: Gold, Silver, Bronze, Pass, Fail
   - Suggestion: Generate realistic NAPFA scores by year level

4. **CCE Results** (Was removed - check if needed)
   - Current: Removed by migration `20251103000001_remove_cce_results.sql`
   - Status: May be intentionally removed
   - Decision needed: Should this be re-added?

#### **Priority 2: Medium-Value Data** (Good to Have)

1. **Private Notes** (Currently only for case students)
   - Current: 12 case students have notes
   - Needed: 2-3 notes per regular student (36+ more notes)
   - Teachers: Different teachers should write notes
   - Timeline: Spread across academic year

2. **Student Overview** (Exists but sparse)
   - Current: Basic structure, limited actual data
   - Needed: Fill in background, health, family info
   - Health data: Allergies, medications, conditions
   - Family: Sibling count, home situation notes
   - Suggestion: Generate realistic family scenarios

3. **Behaviour Observations** (Currently partial)
   - Current: Some for case students
   - Needed: 3-5 observations per student (mix positive, concern, neutral)
   - Categories: balanced distribution
   - Suggestion: Generate with realistic school scenarios

4. **Friend Relationships** (Currently partial)
   - Current: Some for case students
   - Needed: 2-4 friendships per student
   - Closeness levels: Mix of very_close, close, acquaintance
   - Suggestion: Create clusters of friend groups in class

#### **Priority 3: Nice-to-Have Data** (Enhancement)

1. **Conversations & Messages** (New feature)
   - Current: Tables created, limited data
   - Needed: 3-5 conversations per teacher covering different topics
   - Messages: 5-10 messages per conversation
   - Participants: Teacher + parent(s)

2. **Report Data** (May be removed)
   - Current: System removed per recent migrations
   - Status: Unclear if still needed
   - Decision: Check if report workflow is still active

3. **Case Details** (Currently seeded for 12 students)
   - Current: Good structure for case students
   - Suggestion: Could expand with more varied case types
   - More SEN cases, more career guidance cases

### 5.2 Data Generation Strategy

#### **Realistic Attendance Patterns**
```
Typical student: 92-98% attendance (4-10 days absent/late in 60 days)
Special cases: 
  - Chronic absentee: 75-85%
  - Perfect: 100%
  - Medical: 80-90%
Distribution:
  - 70% present
  - 15% absent
  - 10% late
  - 5% early dismissal
```

#### **Realistic Grade Distribution**
```
Strong performer: A/A-, 85-95%
Average: B/B+, 70-80%
Struggling: C/C+, 60-70%
Support needed: D/F, <60%
Distribution across class:
  - 20% A/A-
  - 35% B/B+
  - 30% C/C+
  - 15% D/F
```

#### **Realistic NAPFA Scores** (Primary 5)
```
Gold: Top 20% of class
Silver: 30-40% of class
Bronze: 25-35% of class
Pass: 5-10% of class
```

---

## Part 6: Key Implementation Files Reference

### 6.1 Database Configuration
| File | Purpose |
|------|---------|
| `.env.local` / `env.example` | Supabase credentials (PROJECT_URL, ANON_KEY, SERVICE_ROLE_KEY) |
| `supabase/config.toml` | Supabase project config |
| `tsconfig.json` | TypeScript config (strict mode enabled) |

### 6.2 Type Definitions
| File | Generated From | Contains |
|------|---|---|
| `src/types/database.ts` | Auto-gen from Supabase | All 19 table types, insert/update types |

### 6.3 Client Files
| File | Purpose | Exports |
|------|---------|---------|
| `src/lib/supabase/client.ts` | Browser client | `createClient()` - client-side queries |
| `src/lib/supabase/server.ts` | Server client | `createClient()` - Server Components/Actions |
| `src/lib/supabase/middleware.ts` | Auth middleware | Session management |

### 6.4 Query Builders
| File | Purpose | Contains |
|------|---------|---|
| `src/lib/supabase/queries.ts` | Pre-built queries | 19 query functions for common operations |
| `src/lib/supabase/adapters.ts` | Data transformation | 6 adapter functions (DB → UI types) |

---

## Part 7: Recommendations

### Immediate Actions
1. **Audit current data** - Run queries to count records in each table
2. **Decide on missing fields**:
   - Should CCE results be restored?
   - Should reports be restored?
3. **Backup current data** - Before running new seed scripts
4. **Version control migrations** - Ensure all .sql files are committed

### For Comprehensive Seeding
1. **Create attendance seed migration** (60 days per student)
2. **Create academic results seed migration** (10 assessments per student)
3. **Create physical fitness seed** (NAPFA scores per student)
4. **Enhance student overview** (health, family, background data)
5. **Expand behavior/observations** (3-5 per student)
6. **Add friend group clusters** (realistic groupings)

### Architecture Improvements
1. **Seed script organization** - Consolidate into single comprehensive script
2. **Seed data validation** - Add verification checks
3. **Documentation** - Update seed procedures in `.agent/SOP/`
4. **Idempotent operations** - Prevent duplicate seeding

---

## Quick Reference: Table Relationships

```
teachers (1) ──→ (many) teacher_classes ←── (1) classes
                                                    ↓ (many)
                                           student_classes
                                                    ↓ (many)
                                           students (1) ──→ (1) form_teacher (teachers)
                                                    ├─→ (1) primary_guardian (parents_guardians)
                                                    ├─→ (many) student_guardians ←── (1) parents_guardians
                                                    └─→ (1) student_overview

students (1) ──→ (many) attendance
students (1) ──→ (many) academic_results
students (1) ──→ (many) physical_fitness
students (1) ──→ (many) cce_results ❌ (removed)
students (1) ──→ (many) student_private_notes ←─ (many) teachers
students (1) ──→ (many) behaviour_observations ←─ (many) teachers
students (1) ──→ (many) friend_relationships → (many) students
students (1) ──→ (many) cases ←─ (many) teachers
cases (1) ──→ (many) case_issues ←─ (many) teachers
students (1) ──→ (many) conversations ←─ (1) teachers
conversations (1) ──→ (many) conversation_messages
conversations (1) ──→ (many) conversation_participants
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Tables** | 19 (or 16 if reports/CCE removed) |
| **Migrations** | 21 files |
| **Teachers** | 1 (Daniel Tan) |
| **Classes** | 4+ (5A form, Science, Math, Football CCA) |
| **Students** | 36+ (12 case + 24 regular) |
| **Guardians** | 36+ (one per student) |
| **Query Helpers** | 19 functions |
| **Data Adapters** | 6 functions |
| **Seed Scripts** | 7 TypeScript/JS files |
| **Well-populated Tables** | 6 |
| **Partially-populated Tables** | 7 |
| **Empty Tables** | 3-5 (depending on removals) |

---

**Document Complete**
All schema files, migration locations, current data, and recommendations documented.
