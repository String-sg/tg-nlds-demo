# Classroom Module - Iteration Plan

**Date:** October 8, 2025
**Last Updated:** October 23, 2025
**Status:** ✅ Phase 1 Complete, 🟡 Phase 2 Partial
**Version:** 1.1

---

## Table of Contents

1. [Implementation Status Update](#implementation-status-update) ⭐ **NEW**
2. [Executive Summary](#executive-summary)
3. [Current State Analysis](#current-state-analysis)
4. [Gap Analysis](#gap-analysis)
5. [Architectural Changes](#architectural-changes)
6. [Implementation Phases](#implementation-phases)
7. [Technical Considerations](#technical-considerations)

---

## Implementation Status Update

**Updated:** October 23, 2025

This section tracks actual progress against the original iteration plan. For complete current architecture details, see [CURRENT_ARCHITECTURE.md](../System/CURRENT_ARCHITECTURE.md).

### Phase 1: Foundation & Navigation ✅ **COMPLETE**

**Status**: All deliverables completed

✅ **Classroom navigation structure**
- Implemented via catch-all route `app/[[...slug]]/page.tsx`
- Dynamic tab system with URL routing
- Breadcrumb navigation with caching (see Archive/BREADCRUMB_FIX_SUMMARY.md)

✅ **My Classes component**
- **File**: `src/components/classroom/my-classes.tsx`
- Displays form class, subject classes, and CCAs
- Data: Integrated with Supabase via `useClasses` hook
- Updated design (see Archive/CLASSROOM_DESIGN_UPDATE_SUMMARY.md)
- Features:
  - Form class with 2-column layout (main + overall status)
  - Subject classes in 3-column grid
  - Full-width CCA cards
  - AI notification placeholders

✅ **Class Overview dashboard**
- **File**: `src/components/classroom/class-overview.tsx`
- Today&apos;s snapshot with quick stats
- Student list with filtering/sorting
- Data: Integrated with Supabase (`useStudents`, `useClassStats`)
- Features:
  - Attendance statistics
  - Performance indicators
  - Class alerts integration
  - Quick action buttons

✅ **Role-based permissions**
- **Context**: `src/contexts/user-context.tsx`
- User role from Supabase `teachers` table
- Form teacher identification (`isFormTeacher`, `isFormTeacherFor()`)
- Conditional feature visibility based on role

**Database**:
- 19 Supabase tables created
- 17 migration files
- Row-Level Security (RLS) policies (currently bypassed for dev)

---

### Phase 2: Core Teaching Functions 🟡 **PARTIAL**

**Status**: 2/4 deliverables implemented, 2 in progress

✅ **Class alerts dashboard**
- **File**: `src/components/classroom/class-alerts.tsx`
- Priority-based alert display
- Integrated with `getStudentAlerts` query
- Features:
  - Attendance issue detection (< 90%)
  - Open cases prioritization
  - SWAN student enrichment
  - Positive behavior observations
- **Location**: Home page widget (top 3 alerts)

🟡 **Attendance system** - PARTIALLY IMPLEMENTED
- **File**: `src/components/classroom/take-attendance.tsx`
- Database: `attendance` table exists
- UI component created
- ❌ **Missing**:
  - Full marking workflow integration
  - Parent notification triggers
  - Attendance analytics views
  - Weekly/monthly views

🟡 **Grade entry interface** - PARTIALLY IMPLEMENTED
- **Files**:
  - `src/components/classroom/grade-entry.tsx`
  - `src/components/classroom/academic-record-entry.tsx`
- Database: `academic_results` table exists
- UI components created with spreadsheet interface
- ❌ **Missing**:
  - Full Supabase integration for saving
  - Bulk import functionality
  - Draft/publish workflow
  - Auto-calculations

❌ **Assignment management** - NOT STARTED
- No UI components
- No database tables
- Not in current implementation

**Notes**:
- Attendance and grades have UI + database foundation
- Need full workflow implementation
- Assignment management deferred

---

### Phase 3: Student Support ❌ **NOT STARTED**

**Status**: 0/4 deliverables

❌ **Wellbeing dashboard and check-ins**
- No dedicated wellbeing dashboard component
- Basic wellness data in student profile
- `behaviour_observations` table exists but limited UI

❌ **Parent communication system**
- Inbox UI complete (`src/components/inbox/`) but uses mock data
- No Supabase messaging tables
- No communication history tracking
- No PTM scheduling

❌ **Enhanced case management**
- Basic case management exists (`case-management-table.tsx`)
- `cases` and `case_issues` tables exist
- Missing: Evidence attachment, advanced workflows

❌ **Incident reporting workflow**
- No dedicated incident reporting form
- Can create cases manually
- No approval process

**Notes**:
- Parent communication has full UI (5 components) waiting for database
- Case management has foundation but needs enhancement
- Wellbeing features need design and implementation

---

### Phase 4: Reporting & Documents ❌ **NOT STARTED**

**Status**: 0/4 deliverables

🟡 **PTM report generator** - FOUNDATION ONLY
- **File**: `src/components/student/report-slip.tsx`
- Singapore MOE report format component
- Database: `reports` and `report_comments` tables exist
- ❌ **Missing**:
  - Full generation workflow
  - Draft management
  - Approval process
  - Publishing system

❌ **Draft reports workspace** - NOT STARTED

❌ **Document management system** - NOT STARTED
- No medical forms storage
- No parent correspondence archive
- No document workflows

❌ **Published reports archive** - NOT STARTED

**Notes**:
- Report slip UI component exists
- Database schema ready
- Workflow implementation needed

---

### Phase 5: Analytics & Enhancement ❌ **NOT STARTED**

**Status**: Not yet initiated

All advanced features deferred until Phase 1-4 complete.

---

### Summary of Current State

#### ✅ Fully Implemented Components

1. **my-classes.tsx** - Class listing with Supabase integration
2. **class-overview.tsx** - Detailed class view with stats
3. **student-list.tsx** - Sortable student table
4. **student-profile.tsx** - Full student profile with tabs
5. **class-alerts.tsx** - Priority alert system
6. **home-content.tsx** - Dashboard with student alerts widget

#### 🟡 Partially Implemented

1. **take-attendance.tsx** - UI exists, needs workflow completion
2. **grade-entry.tsx** - UI exists, needs Supabase integration
3. **academic-record-entry.tsx** - Bulk entry UI needs completion
4. **report-slip.tsx** - Display component, needs workflow

#### ❌ Not Started

1. Assignment management
2. Wellbeing dashboard
3. Parent communication backend
4. Incident reporting
5. Document management
6. Advanced analytics

#### 📊 Database Status

- **19 tables**: All created in Supabase
- **17 migrations**: Applied and seeded with test data
- **Mock data usage**: Inbox/messaging only
- **Authentication**: Not yet implemented (hardcoded user)

#### 🔗 Related Documentation

- [CURRENT_ARCHITECTURE.md](../System/CURRENT_ARCHITECTURE.md) - Complete system state
- [SUPABASE_IMPLEMENTATION.md](../System/SUPABASE_IMPLEMENTATION.md) - Database schema
- [CLASSROOM_DESIGN_UPDATE_SUMMARY.md](../Archive/CLASSROOM_DESIGN_UPDATE_SUMMARY.md) - Design update
- [student-alerts-logic.md](./student-alerts-logic.md) - Alert system spec

#### 🎯 Next Priority Actions

1. **Complete Phase 2**: Finish attendance and grade entry workflows
2. **Implement Authentication**: Add Supabase Auth and enable RLS
3. **Start Phase 3**: Parent communication database integration
4. **Assignment System**: Design and implement assignment management

---

---

## Executive Summary

This document outlines the iteration plan for the Classroom module based on the PRD requirements. The current implementation provides a basic foundation with student listing and profiles, but requires significant expansion to meet the comprehensive requirements outlined in the PRD.

### Current Implementation
- Basic classroom view with student list (34+ students)
- Student profile with 5 tabs (Overview, Academic, Attendance, Wellness, Cases)
- Summary cards for SEN, Nurture, and Attendance insights
- Search, filter, and sort functionality
- Mock data structure

### Target State (Per PRD)
- Comprehensive classroom management system
- Form Teacher vs Subject Teacher role differentiation
- Student wellbeing tracking and support
- Parent communication hub
- Attendance system with multiple views
- Academic grading and assessment tools
- Case and records management
- Report generation (including PTM reports)
- Document management

---

## Current State Analysis

### ✅ **What We Have**

#### 1. **ClassView Component** (`src/components/class-view.tsx`)
- Student list table with 34+ mock students
- **Features:**
  - Search functionality
  - Filter by status (GEP, SEN, None)
  - Sort by name, attendance, grades, conduct
  - Bulk selection with checkboxes
  - Summary cards showing:
    - SEN students (with attention badges)
    - Low math performance (Nurture)
    - Attendance statistics
- **Tab Navigation:**
  - Overview (active)
  - Statistics (empty state)
  - Timetable (empty state)

#### 2. **StudentProfile Component** (`src/components/student-profile.tsx`)
- **5 Tab Structure:**
  1. **Overview Tab:**
     - Parent/Guardian information
     - Background (Health, Friends, Family, Housing)
  2. **Academic Tab:**
     - Performance scores (English, Math, Science, Conduct)
     - Recent activities with grades
     - Strengths and areas for improvement
  3. **Attendance Tab:**
     - Daily attendance percentage
     - Temperature monitoring
     - CCA attendance
     - School events attendance
     - Early dismissal tracking
  4. **Wellness Tab:**
     - Counselling status
     - Disciplinary status
     - SEN status
     - Teacher notes
  5. **Cases Tab:**
     - Case management table integration

#### 3. **Data Structure**
- Mock student data with:
  - Basic info (name, ID, class)
  - Academic scores
  - Attendance percentage
  - Conduct grades
  - Status flags (GEP, SEN)
  - Parent information
  - Background details

### ❌ **What's Missing**

See detailed [Gap Analysis](#gap-analysis) section below.

---

## Gap Analysis

### **Priority 0 (MVP) - Critical Missing Features**

#### 1. **My Classes Structure** ⛔ MISSING
**Current:** Single flat "Classroom" view
**Required:**
- Form class identification and display
- Subject classes categorization (e.g., 6B Math, 7A Math)
- CCA class management
- Class-level quick actions
- Class overview dashboard with today's snapshot
- Visual indicator for form class (🏠 icon)

**Impact:** High - Fundamental navigation structure

---

#### 2. **Class Overview Dashboard** ⛔ MISSING
**Current:** Summary cards only
**Required:**
- Today's snapshot (attendance, pending grades, alerts)
- Quick action buttons (Take Attendance, Enter Grades, Message Parents)
- Recent activity feed
- Upcoming deadlines and events
- Performance indicators (class average, grade distribution)
- Attendance trends

**Impact:** High - Primary teacher workspace

---

#### 3. **Attendance System** ⛔ MISSING
**Current:** Display only
**Required:**
- **Take Attendance:**
  - Quick mark interface (<2 minutes for 30 students)
  - "Mark All Present" button
  - Individual toggles (Present, Absent, Late, Excused)
  - Reason selection for absences
  - Auto-save with timestamp
  - Parent notifications
- **View Attendance:**
  - Daily view
  - Weekly grid view
  - Monthly calendar view
  - By student view with patterns
  - Export functionality

**Impact:** Critical - Daily essential function

---

#### 4. **Student Directory** ✅ PARTIAL
**Current:** Basic list with search/filter
**Missing:**
- Quick stats on student cards
- Bulk actions (message parents, export)
- Status indicators (alerts, concerns)
- Enhanced filtering options

**Impact:** Medium - Enhancement needed

---

#### 5. **Academic Grading** ⛔ MISSING
**Current:** Display only
**Required:**
- **Grade Entry:**
  - Spreadsheet-like interface
  - Keyboard navigation
  - Auto-calculate percentages
  - Bulk import from Excel/CSV
  - Draft and publish
- **Grade Book:**
  - Matrix view (students × assessments)
  - Color-coded performance
  - Weightage calculations
  - Export options

**Impact:** Critical - Core teaching function

---

#### 6. **Assignment Management** ⛔ MISSING
**Required:**
- Create assignments with details
- Track submissions (Submitted, Pending, Late)
- Grading interface
- Send reminders
- Late submission handling

**Impact:** High - Core teaching function

---

### **Priority 1 (Critical) - Missing Features**

#### 7. **Student Wellbeing System** ⛔ MISSING
**Current:** Basic wellness tab in profile
**Required:**
- Wellbeing dashboard for all students
- Multi-dimensional check-ins:
  - Emotional state
  - Social wellbeing
  - Academic stress
  - Physical health
- Trend tracking with graphs
- Alert triggers
- Support plans creation and tracking
- Counseling integration

**Impact:** High - Form teacher essential

---

#### 8. **Parent Communication Hub** ⛔ MISSING
**Required:**
- Individual and bulk messaging
- Message templates library
- Communication history tracking
- Parent engagement monitoring
- PTM scheduling
- Automated reminders
- Attachment support

**Impact:** High - Form teacher essential

---

#### 9. **Class Alerts System** ⛔ MISSING
**Required:**
- Centralized alert dashboard
- Categorization by urgency (🔴 Urgent, 🟡 High, 🟢 Medium)
- Alert types:
  - Academic (failing grades, missing assignments)
  - Attendance (excessive absences)
  - Behavioral (incidents)
  - Wellbeing (emotional distress)
  - Administrative (deadlines)
- Quick action buttons per alert
- Alert history and audit trail
- Automatic triggers

**Impact:** High - Proactive student support

---

#### 10. **Cases & Records Management** ✅ PARTIAL
**Current:** Case management table exists
**Missing:**
- **Academic Records:**
  - Student achievements
  - Academic history
  - Certificates & transcripts
- **Behavioral Cases:**
  - Incident reporting form
  - Disciplinary action workflow
  - Evidence attachment
  - Approval process
- **Wellbeing Records:**
  - Check-in history
  - Support plans
  - Crisis incidents
- Active/Resolved categorization

**Impact:** High - Compliance and documentation

---

#### 11. **Exam Management** ⛔ MISSING
**Required:**
- Exam schedule view
- Results entry interface
- Exam analysis and reports
- Result card generation
- Moderation capabilities
- Approval workflow

**Impact:** Medium-High - Assessment period critical

---

#### 12. **Report Generation** ⛔ MISSING
**Required:**
- **Report Types:**
  - PTM (Parent-Teacher Meeting) reports
  - Class performance reports
  - Individual student reports
  - Custom reports
- **Draft Workspace:**
  - Save and edit drafts
  - Progress tracking (% complete)
  - Collaboration features
  - Version history
- **Published Archive:**
  - Lock published reports
  - Reprint/resend capability
  - Parent acknowledgment tracking

**Impact:** Critical - PTM preparation

---

#### 13. **Documents Management** ⛔ MISSING
**Required:**
- **Medical Forms:**
  - Encrypted storage
  - Submission tracking
  - Critical condition flags
  - Emergency info quick access
- **Parent Correspondence:**
  - Archive all communications
  - Search functionality
  - Link to student records
- **Official Letters:**
  - Template library
  - Approval workflow
  - Distribution tracking

**Impact:** Medium-High - Compliance

---

### **Priority 2 (Nice to Have) - Missing Features**

#### 14. **CCA Class Management** ⛔ MISSING
**Required:**
- CCA group management
- CCA-specific attendance
- Activity/session planning
- Achievement records
- Competition tracking

**Impact:** Low-Medium - CCA teachers only

---

## Architectural Changes

### 1. **Navigation Structure Overhaul**

**Current:**
```
Classroom (single tab)
  └── Student list view
```

**Required:**
```
MY CLASSROOM
├── My Classes
│   ├── Form class (if form teacher)
│   ├── Subject classes
│   └── CCA class (if applicable)
├── Class overview
├── Student wellbeing
├── Parent communication
├── Attendance
│   ├── Take attendance
│   └── View attendance
├── Class alerts
├── Students (student list)
├── Academic
│   ├── Grades & Results
│   ├── Assignments
│   └── Exams
├── Cases & Records
│   ├── Academic records
│   ├── Student wellbeing records
│   └── All cases
│       ├── Active cases
│       ├── Resolved cases
│       └── Behavioural cases
├── Reports
│   ├── Generate report
│   ├── Draft reports
│   └── Published report
└── Documents
    ├── Medical forms
    ├── Parents correspondence
    └── Official letters
```

**Implementation Approach:**
- Create nested routing structure
- Use sidebar navigation for main sections
- Implement breadcrumb navigation
- Add quick access patterns

---

### 2. **Role-Based Access Control**

**Required Roles:**
- **Regular Teacher:** Access to subject classes only
- **Form Teacher:** Enhanced access for form class
  - Cross-subject visibility
  - Student wellbeing dashboard
  - Parent communication hub
  - Full student profiles

**Implementation:**
- Add user role context
- Conditional rendering based on role
- Permission checks for sensitive data
- Enhanced features for form teachers

---

### 3. **Data Model Expansion**

**Current:** Simple mock objects
**Required:** Comprehensive entity structure

#### Core Entities Needed:

**User/Teacher:**
```typescript
{
  user_id: UUID
  name: string
  email: string
  role: 'Teacher' | 'FormTeacher' | 'HOD' | 'YearHead'
  department: string
  classes_assigned: Class[]
  form_class_id?: UUID
  cca_classes: CCAClass[]
  permissions: Permission[]
}
```

**Class:**
```typescript
{
  class_id: UUID
  class_name: string
  subject: string
  year_level: number
  teacher_id: UUID
  form_teacher_id: UUID
  students: Student[]
  schedule: ClassSchedule[]
  is_form_class: boolean
}
```

**Attendance:**
```typescript
{
  attendance_id: UUID
  student_id: UUID
  class_id: UUID
  date: Date
  status: 'Present' | 'Absent' | 'Late' | 'Excused'
  reason?: string
  notes?: string
  recorded_by: UUID
  parent_notified: boolean
}
```

**Grade/Assessment:**
```typescript
{
  grade_id: UUID
  student_id: UUID
  class_id: UUID
  assessment_type: 'Assignment' | 'Quiz' | 'Exam'
  assessment_name: string
  score: number
  max_score: number
  weightage: number
  graded_date: Date
  published: boolean
}
```

**Case/Record:**
```typescript
{
  case_id: UUID
  student_id: UUID
  case_type: 'Academic' | 'Behavioral' | 'Wellbeing'
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Active' | 'Resolved'
  description: string
  created_by: UUID
  created_date: Date
  resolution?: string
  resolved_date?: Date
}
```

**Communication Log:**
```typescript
{
  comm_id: UUID
  student_id: UUID
  parent_id: UUID
  teacher_id: UUID
  type: 'Email' | 'Phone' | 'Meeting' | 'SMS'
  subject: string
  content: string
  date: Date
  attachments?: string[]
}
```

---

### 4. **Component Architecture**

**Proposed Structure:**
```
src/
├── app/
│   └── classroom/
│       ├── page.tsx                    # My Classes overview
│       ├── [classId]/
│       │   ├── page.tsx               # Class overview
│       │   ├── wellbeing/page.tsx
│       │   ├── attendance/
│       │   │   ├── take/page.tsx
│       │   │   └── view/page.tsx
│       │   ├── alerts/page.tsx
│       │   ├── academic/
│       │   │   ├── grades/page.tsx
│       │   │   ├── assignments/page.tsx
│       │   │   └── exams/page.tsx
│       │   ├── cases/page.tsx
│       │   ├── reports/page.tsx
│       │   └── documents/page.tsx
│       └── students/[studentId]/page.tsx
│
├── components/
│   ├── classroom/
│   │   ├── class-card.tsx
│   │   ├── class-overview-dashboard.tsx
│   │   ├── attendance-quick-mark.tsx
│   │   ├── grade-entry-spreadsheet.tsx
│   │   ├── alert-card.tsx
│   │   ├── wellbeing-dashboard.tsx
│   │   ├── parent-message-composer.tsx
│   │   ├── incident-report-form.tsx
│   │   └── ptm-report-generator.tsx
│   └── ui/                             # shadcn/ui components
│
├── lib/
│   ├── actions/
│   │   ├── attendance.ts              # Server actions
│   │   ├── grades.ts
│   │   ├── communications.ts
│   │   └── cases.ts
│   └── utils/
│       ├── classroom-helpers.ts
│       └── grade-calculations.ts
│
└── types/
    └── classroom.ts                    # TypeScript definitions
```

---

## Implementation Phases

### **Phase 1: Foundation & Navigation**

**Goal:** Establish core structure and role-based access

**Tasks:**
1. Create hierarchical navigation structure
   - Implement nested routes for classroom module
   - Add sidebar navigation for classroom sections
   - Create breadcrumb navigation

2. Implement "My Classes" section
   - Form class identification
   - Subject classes listing
   - CCA classes (if applicable)
   - Class cards with quick stats

3. Build Class Overview Dashboard
   - Today's snapshot section
   - Quick action buttons
   - Recent activity feed
   - Performance indicators

4. Add role-based access control
   - User context with role information
   - Permission checks
   - Conditional feature visibility
   - Enhanced form teacher features

**Deliverables:**
- [ ] Classroom navigation structure
- [ ] My Classes component
- [ ] Class Overview dashboard
- [ ] Role-based permissions

---

### **Phase 2: Core Teaching Functions**

**Goal:** Enable daily teaching workflows

**Tasks:**
5. Implement Attendance System
   - Quick mark interface (Take Attendance)
   - Attendance views (Daily, Weekly, Monthly, By Student)
   - Reason selection and notes
   - Parent notification triggers
   - Attendance analytics

6. Build Grade Entry System
   - Spreadsheet-like grade entry interface
   - Keyboard navigation
   - Auto-calculations (percentage, letter grades)
   - Bulk import functionality
   - Draft and publish workflow

7. Create Assignment Management
   - Assignment creation form
   - Submission tracking dashboard
   - Grading interface
   - Reminder system
   - Late submission handling

8. Add Class Alerts System
   - Alert dashboard with categorization
   - Automatic alert triggers
   - Quick action buttons
   - Alert history

**Deliverables:**
- [ ] Attendance system (Take & View)
- [ ] Grade entry interface
- [ ] Assignment management
- [ ] Class alerts dashboard

---

### **Phase 3: Student Support**

**Goal:** Enable comprehensive student wellbeing and parent communication

**Tasks:**
9. Implement Student Wellbeing Dashboard
   - Wellbeing overview for all students
   - Multi-dimensional check-in forms
   - Trend visualization
   - Alert triggers

10. Build Parent Communication Hub
    - Message composer (individual/bulk)
    - Message templates library
    - Communication history
    - Engagement tracking
    - PTM scheduling

11. Enhance Case Management
    - Active/Resolved case views
    - Case creation and updates
    - Evidence attachment
    - Status tracking

12. Add Behavioral Incident Reporting
    - Incident report form
    - Disciplinary action workflow
    - Approval process
    - Integration with cases

**Deliverables:**
- [ ] Wellbeing dashboard and check-ins
- [ ] Parent communication system
- [ ] Enhanced case management
- [ ] Incident reporting workflow

---

### **Phase 4: Reporting & Documents**

**Goal:** Enable comprehensive reporting and document management

**Tasks:**
13. Create Report Generation System
    - PTM report generator
    - Report templates
    - Custom report builder
    - Preview functionality

14. Implement Reports Workspace
    - Draft reports management
    - Progress tracking
    - Collaboration features
    - Version history

15. Build Document Management
    - Medical forms (encrypted storage)
    - Parent correspondence archive
    - Official letter templates
    - Approval workflows

16. Add Published Reports Archive
    - Report locking
    - Reprint/resend capability
    - Parent acknowledgment tracking
    - Archive search

**Deliverables:**
- [ ] PTM report generator
- [ ] Draft reports workspace
- [ ] Document management system
- [ ] Published reports archive

---

### **Phase 5: Analytics & Enhancement**

**Goal:** Advanced features and optimization

**Tasks:**
17. Implement Exam Management
    - Exam schedule view
    - Results entry interface
    - Exam analysis
    - Result card generation

18. Add Analytics Dashboards
    - Performance trends
    - Attendance patterns
    - Grade distribution
    - Comparative analysis

19. Performance Optimization
    - Code splitting
    - Lazy loading
    - Caching strategy
    - Database query optimization

20. UI/UX Refinements
    - Accessibility improvements
    - Mobile responsiveness
    - Loading states
    - Error handling

**Deliverables:**
- [ ] Exam management system
- [ ] Analytics dashboards
- [ ] Performance optimizations
- [ ] UI/UX enhancements

---

## Technical Considerations

### **1. Technology Stack**

**Framework:** Next.js 15.5.4 with App Router
- Use Server Components by default
- Client Components only when needed (interactivity, hooks)
- Server Actions for mutations

**UI Library:** shadcn/ui + Tailwind CSS 4
- Maintain consistent component usage
- Follow design system guidelines
- Ensure accessibility (WCAG 2.1 AA)

**State Management:**
- React Context for global state
- URL state for filters/sorting
- Server state with Server Components

**Data Fetching:**
- Server Components for initial data
- Parallel data fetching with Promise.all
- Streaming with Suspense for better UX

---

### **2. Performance Requirements**

Per PRD specifications:
- Page load time: <3 seconds
- Search results: <2 seconds
- Attendance save: <2 seconds
- Grade entry auto-save: every 30 seconds
- Support 500+ concurrent users
- Handle classes with up to 40 students

**Strategies:**
- Implement caching (ISR where appropriate)
- Use pagination for large lists
- Optimize database queries
- Lazy load heavy components
- Use virtual scrolling for large tables

---

### **3. Data Security & Privacy**

**Sensitive Data Handling:**
- Encrypt medical forms and wellbeing data
- Role-based access control (RBAC)
- Audit trail for all data access
- Auto-timeout after 30 minutes inactivity
- Comply with PDPA and MOE policies

**Implementation:**
- Use middleware for authentication
- Server-side permission checks
- Encrypted database fields
- Secure API routes

---

### **4. Mobile Responsiveness**

**Breakpoints:**
- Desktop: ≥1024px
- Tablet: 768px - 1023px
- Mobile: <768px

**Mobile Considerations:**
- Touch-friendly interfaces
- Collapsible sidebar (hamburger menu)
- Bottom navigation for key actions
- Optimized layouts for small screens
- Simplified forms on mobile

---

### **5. Integration Points**

**External Systems:**
- Email service (parent notifications)
- SMS gateway (urgent alerts)
- Document storage (S3/similar)
- School calendar system
- Student information system

**APIs to Consider:**
- RESTful endpoints for external integrations
- Webhooks for real-time updates
- Export APIs (CSV, PDF, Excel)

---

### **6. Testing Strategy**

**Unit Testing:**
- Utility functions
- Helper methods
- Calculation logic

**Integration Testing:**
- Server Actions
- API routes
- Database operations

**E2E Testing:**
- Critical user flows
- Attendance marking
- Grade entry
- Report generation

**Tools:**
- Jest for unit tests
- Playwright for E2E
- React Testing Library

---

### **7. Migration Strategy**

**From Current to New Structure:**

1. **Phase 1:** Add new navigation alongside existing
2. **Phase 2:** Migrate components incrementally
3. **Phase 3:** Update data model progressively
4. **Phase 4:** Feature flag new functionality
5. **Phase 5:** Gradual rollout and deprecation

**Data Migration:**
- Map existing mock data to new schema
- Maintain backward compatibility
- Gradual data transformation
- Validation and testing

---

## Success Criteria

### **Key Metrics (Per PRD)**

- ✅ Time Savings: 50% reduction in administrative tasks
- ✅ Adoption: 95% daily active usage among teachers
- ✅ Efficiency: <3 clicks to complete common tasks
- ✅ Accuracy: 98% data accuracy in records
- ✅ User Satisfaction: 90%+ satisfaction score

### **Feature Completeness**

- [ ] All P0 (MVP) features implemented
- [ ] All P1 (Critical) features implemented
- [ ] P2 (Nice to Have) features as capacity allows

### **Quality Gates**

- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Security audit passed
- [ ] User acceptance testing completed

---

## Next Steps

1. **Review & Approval**
   - Stakeholder review of this plan
   - Priority confirmation
   - Timeline alignment

2. **Preparation**
   - Set up development environment
   - Database schema design
   - Component design mockups

3. **Phase 1 Kickoff**
   - Create feature branches
   - Begin implementation
   - Regular progress reviews

---

## Appendix

### **Reference Documents**
- Classroom Module PRD (Full specification)
- Current codebase:
  - `src/components/class-view.tsx`
  - `src/components/student-profile.tsx`
  - `src/app/page.tsx`

### **Design Assets**
- UI mockups (to be created)
- Component specifications
- User flow diagrams

### **Dependencies**
- shadcn/ui component library
- Next.js 15 documentation
- TypeScript types
- Database schema

---

*Last Updated: October 8, 2025*
