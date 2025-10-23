# Current Architecture (As-Implemented)

**Last Updated**: October 23, 2025
**Status**: Living Document - Updated as codebase evolves

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Component Architecture](#component-architecture)
4. [Routing System](#routing-system)
5. [Data Layer](#data-layer)
6. [State Management](#state-management)
7. [Database Integration Status](#database-integration-status)
8. [Key Patterns](#key-patterns)
9. [Implementation Status](#implementation-status)

---

## Overview

This document reflects the **actual current state** of the Teacher Guide system as implemented in the codebase. It serves as the source of truth for understanding what exists, what works, and what's still in progress.

### Project Type
- Single-Page Application (SPA) with server-side rendering capabilities
- Next.js 15 App Router with dynamic routing
- Client-heavy architecture with hybrid data sourcing

### File Statistics
- **Components**: 57 TSX files
- **Hooks**: 14 custom hooks
- **Contexts**: 6 context providers
- **API Routes**: 4 endpoints
- **Database Tables**: 19 Supabase tables
- **Migration Files**: 17 migrations

---

## Technology Stack

### Core Framework
```json
{
  "next": "15.5.4",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "typescript": "5.7.3"
}
```

### UI Framework
```json
{
  "@radix-ui/*": "Multiple packages (Dialog, Select, etc.)",
  "tailwindcss": "4.x",
  "lucide-react": "Latest"
}
```

### Database & Auth
```json
{
  "@supabase/ssr": "Latest",
  "@supabase/supabase-js": "Latest"
}
```

### Data Fetching
```json
{
  "swr": "Latest"
}
```

### State Management
- React Context API
- SWR for server state
- sessionStorage for UI state persistence
- Local React state (useState, useReducer)

---

## Component Architecture

### Directory Structure

```
src/
├── app/
│   ├── [[...slug]]/
│   │   └── page.tsx              # Main SPA shell (2,300+ lines)
│   ├── api/
│   │   ├── test-db/route.ts      # DB connectivity test
│   │   ├── conversations/route.ts
│   │   └── conversations/[id]/messages/route.ts
│   ├── layout.tsx                # Root layout with providers
│   └── globals.css               # Tailwind + custom styles
├── components/
│   ├── classroom/                # 7 components
│   ├── student/                  # Student-related components
│   ├── records/                  # Records timeline
│   ├── inbox/                    # 5 inbox components
│   ├── messages/                 # Messaging wrappers
│   ├── ui/                       # 25+ shadcn/ui components
│   ├── home-content.tsx
│   ├── student-profile.tsx
│   ├── case-management-table.tsx
│   └── [other feature components]
├── contexts/                     # 6 context providers
├── hooks/                        # 14 custom hooks
├── lib/
│   ├── supabase/                 # Database layer
│   └── mock-data/                # Mock data (being phased out)
└── types/                        # TypeScript definitions
```

### Component Categories

#### 1. Layout & Navigation (1 component)
**File**: `src/app/[[...slug]]/page.tsx`

**Purpose**: Main application shell managing all routing and navigation

**Key Features**:
- Dynamic tab system with drag-and-drop reordering
- Primary sidebar navigation (9 sections)
- Breadcrumb navigation with caching
- Assistant panel integration (3 modes)
- URL-based content routing
- sessionStorage persistence

**State Management**:
- 15+ useState hooks for UI state
- 5+ useRef hooks for imperative access
- useEffect for persistence and sync
- Custom hooks for data fetching

**Routing Handled**:
```
/                      → HomeContent
/pulse                 → PulseContent
/inbox                 → InboxContent
/classroom             → MyClasses
/classroom/:classId    → ClassOverview
/classroom/:classId/student/:slug → StudentProfile
/student-:slug         → StudentProfile (standalone)
/settings              → SettingsContent
/assistant             → AssistantPanel (full mode)
[...and more]
```

#### 2. Classroom Components (7 files)

| Component | Purpose | Supabase | Client/Server |
|-----------|---------|----------|---------------|
| `my-classes.tsx` | Landing page with class list | ✅ Yes | Client |
| `class-overview.tsx` | Detailed class view with stats | ✅ Yes | Client |
| `student-list.tsx` | Sortable student table | ✅ Yes | Client |
| `take-attendance.tsx` | Daily attendance marking | 🟡 Partial | Client |
| `grade-entry.tsx` | Individual grade form | 🟡 Partial | Client |
| `academic-record-entry.tsx` | Bulk grade entry | 🟡 Partial | Client |
| `class-alerts.tsx` | Class-level notifications | ✅ Yes | Client |

**Data Flow**:
```
MyClasses
  ├─ useClasses(teacherId)
  │   └─ Supabase: teacher_classes + classes
  └─ Renders: FormClass + SubjectClasses + CCAs

ClassOverview
  ├─ useStudents(classId)
  │   └─ Supabase: student_classes + students + student_overview
  ├─ useClassStats(classId)
  │   └─ Supabase: attendance + academic_results
  └─ Renders: Stats + StudentList + Actions
```

#### 3. Student Profile Components

**Main Component**: `student-profile.tsx`

**Features**:
- Tabbed interface (Overview, Records, Cases, Reports)
- Guardian contact display
- Academic performance summary
- Case management integration
- Private notes access

**Data Hook**: `useStudentProfile(studentName)`

**Database Queries**:
- `getStudentFullProfile` - Core student data
- `getStudentResultsByTerm` - Academic results
- `getStudentAttendance` - Attendance history
- `getStudentCases` - Open/closed cases
- `getStudentPrivateNotes` - Teacher notes

**Related Components**:
- `report-slip.tsx` - Singapore MOE report format
- `student-records-timeline.tsx` - Chronological record view

#### 4. Home & Dashboard Components

**home-content.tsx**:
- Quick action buttons (5 primary actions)
- Student alerts widget (top 3 priority students)
- Upcoming classes display
- Pulse summary integration

**Data Sources**:
- ✅ Supabase: `getStudentAlerts` (complex query)
- ✅ Supabase: Teacher classes for schedule
- 🟡 Mock: Some quick stats

**Student Alerts Logic**:
```
Priority 1: Attendance issues (2+ absences)
Priority 2: Open cases (high severity first)
Priority 3: Positive behavior (if < 3 alerts)
Max: 3 students shown
Deduplication: One alert per student
```

**Other Dashboard Components**:
- `pulse-content.tsx` - Daily brief view
- `school-dashboard.tsx` - School-wide statistics

#### 5. Inbox/Messaging System (5 components)

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| `inbox-layout.tsx` | 3-column container | Mock |
| `inbox-sidebar.tsx` | View/class filters | Mock |
| `conversation-list.tsx` | Message threads | Mock |
| `conversation-view.tsx` | Message display | Mock |
| `metadata-sidebar.tsx` | Context panel | Mock |

**Status**: ⚠️ **Fully mock data** - Supabase messaging tables not yet created

**Mock Data File**: `src/lib/mock-data/inbox-data.ts`

**API Routes**:
- `GET/POST /api/conversations` - Mock conversation CRUD
- `GET/POST /api/conversations/[id]/messages` - Mock message CRUD

#### 6. Case Management

**Component**: `case-management-table.tsx`

**Features**:
- Table view of student cases
- Status tracking (Open, In Progress, Resolved)
- Severity indicators (Low, Medium, High)
- Type filtering (Academic, Behavioral, Wellbeing)
- Quick actions (View, Edit, Close)

**Database**:
- ✅ Supabase `cases` table
- ✅ Supabase `case_issues` table

#### 7. UI Components (shadcn/ui)

**Location**: `src/components/ui/`

**Installed Components** (25+):
- Layout: card, separator, scroll-area, sidebar
- Forms: button, input, select, textarea, checkbox, switch
- Feedback: dialog, toast, tooltip, popover, sheet, skeleton
- Data: table, tabs, badge, avatar
- Navigation: breadcrumb, breadcrumbs
- Date: calendar

**All components**:
- Client Components ('use client')
- Based on Radix UI primitives
- Fully customizable (copied to project)
- Dark mode support via CSS variables

#### 8. Settings & Configuration

**settings-content.tsx**:
- Accessibility preferences
- Font size control (14-20px)
- High contrast toggle
- Theme switching

**theme-switcher.tsx**:
- Light/dark mode toggle
- System preference detection
- next-themes integration

#### 9. Assistant Panel

**Component**: `assistant-panel.tsx`

**Modes**:
1. Sidebar: Docked right panel
2. Floating: Draggable window
3. Full: Full-screen overlay

**Features**:
- AI chat interface
- Student context awareness
- Message history (mock data)
- Quick action suggestions

**Status**: 🟡 Mock data, no AI backend yet

---

## Routing System

### Single Dynamic Route Pattern

**File**: `src/app/[[...slug]]/page.tsx`

**Pattern**: Optional catch-all `[[...slug]]`

**How It Works**:
```typescript
// URL: /classroom/abc123/student/eric-tan
// Parsed as: ['classroom', 'abc123', 'student', 'eric-tan']

// Routing logic:
if (segments[0] === 'classroom') {
  if (segments[2] === 'student') {
    return <StudentProfile />
  }
  return <ClassOverview classId={segments[1]} />
}
```

### Route Mapping

| URL Pattern | Component | Data Required |
|-------------|-----------|---------------|
| `/` or `/home` | HomeContent | Teacher ID |
| `/pulse` | PulseContent | Teacher ID |
| `/inbox` | InboxContent | Mock |
| `/inbox/:conversationId` | InboxContent | Mock |
| `/classroom` | MyClasses | Teacher ID |
| `/classroom/:classId` | ClassOverview | Class ID |
| `/classroom/:classId/students` | StudentList | Class ID |
| `/classroom/:classId/grades` | AcademicRecordEntry | Class ID |
| `/classroom/:classId/student/:slug` | StudentProfile | Class ID + Name |
| `/student-:slug` | StudentProfile | Name |
| `/myschool` | SchoolDashboard | School ID |
| `/settings` | SettingsContent | User prefs |
| `/assistant` | AssistantPanel | Full mode |

### Tab System

**Persistence**:
```typescript
sessionStorage.setItem('openTabs', JSON.stringify(tabs))
sessionStorage.setItem('studentProfileTabs', JSON.stringify(map))
sessionStorage.setItem('classroomTabs', JSON.stringify(map))
```

**Tab Structure**:
```typescript
interface Tab {
  id: string              // Unique identifier
  title: string           // Display name
  content: string         // URL segment
  isPinned: boolean       // Pin status
  canClose: boolean       // Closable flag
}
```

**Features**:
- Drag-and-drop reordering
- Pin/unpin tabs
- Close tabs (except Home)
- Restore on refresh
- URL sync

### Navigation Methods

1. **Sidebar Click** → Opens new tab + navigates
2. **In-page Link** → Updates URL + existing tab
3. **Breadcrumb Click** → Navigates within tab
4. **Tab Click** → Switches active tab + URL

---

## Data Layer

### Supabase Setup

#### Client-Side (`src/lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Usage**: Client Components (majority of app)

**Features**:
- Browser-based auth
- Real-time subscriptions support
- Automatic token refresh

#### Server-Side (`src/lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(...)
}
```

**Usage**: Server Components, Server Actions, Route Handlers

**Current Use**: Only `/api/test-db` route

#### Middleware (`src/lib/supabase/middleware.ts`)

```typescript
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createServerClient(...)

  // Refresh session
  await supabase.auth.getUser()

  // TODO: Add route protection

  return response
}
```

**Status**: Session refresh only, no auth enforcement

### Query Functions

**File**: `src/lib/supabase/queries.ts`

**Organization**: 19 functions grouped by domain

#### Students (4 functions)

```typescript
getStudentWithGuardians(supabase, studentId)
// Returns: Student + primary guardian + all additional guardians

getStudentFullProfile(supabase, studentName)
// Returns: Student + overview + form teacher info

getStudentsForTeacher(supabase, teacherId)
// Returns: All students in teacher's classes (via student_classes)

getFormClassStudents(supabase, teacherId)
// Returns: Students where teacher is form teacher
```

#### Attendance (2 functions)

```typescript
getStudentAttendance(supabase, studentId, startDate, endDate)
// Returns: Attendance records for date range

getClassAttendanceToday(supabase, classId)
// Returns: Today's attendance for all students in class
```

#### Academic Results (1 function)

```typescript
getStudentResultsByTerm(supabase, studentId, term, year)
// Returns: All subject results for term/year
```

#### Private Notes (2 functions)

```typescript
getStudentPrivateNotes(supabase, studentId, teacherId)
// Returns: All private notes teacher wrote about student

createPrivateNote(supabase, studentId, teacherId, note, visibility)
// Creates: New private note with audit trail
```

#### Cases (3 functions)

```typescript
getStudentCases(supabase, studentId)
// Returns: All cases (open + closed)

getCaseWithIssues(supabase, caseId)
// Returns: Case with all related issues

createCase(supabase, data)
createCaseIssue(supabase, data)
// Creates: New case or issue
```

#### Reports (3 functions)

```typescript
getStudentReports(supabase, studentId)
// Returns: All report slips

getReportWithComments(supabase, reportId)
// Returns: Report + teacher comments + approvals

getReportsByTermAndStatus(supabase, term, year, status)
// Returns: Reports for dashboard filtering
```

#### Classes (3 functions)

```typescript
getTeacherClasses(supabase, teacherId)
// Returns: All classes taught (form + subject + CCA)

getClassDetails(supabase, classId)
// Returns: Class + students + teachers

getTeacherFormClass(supabase, teacherId)
// Returns: Form class where teacher is form teacher
```

#### Behavior & Social (2 functions)

```typescript
getStudentBehaviourObservations(supabase, studentId, startDate, endDate)
// Returns: Behavior observations for date range

getStudentFriendships(supabase, studentId)
// Returns: Friend relationships
```

#### Dashboard Alerts (1 complex function)

```typescript
getStudentAlerts(supabase, teacherId, limit = 3)
// Returns: Priority-based student alerts with enrichment
// Logic:
//   1. Attendance issues (< 90% → medium, < 80% → high)
//   2. Open cases (prioritizes SWAN students)
//   3. SWAN enrichment with academic trends
//   4. Positive behavior observations
//   5. Deduplication (one alert per student)
```

**Return Pattern**:
```typescript
{ data: T | null, error: Error | null }
```

### Data Adapters

**File**: `src/lib/supabase/adapters.ts`

**Purpose**: Bridge Supabase types → UI types

**Functions**:

```typescript
mapTeacherToUser(teacher: Database['teachers']['Row'])
// Converts: Database teacher → User type

mapSupabaseClassToClass(dbClass, teachers)
// Converts: Database class → Class type

mapSupabaseClassToCCAClass(dbClass)
// Converts: Database class → CCAClass type

mapSupabaseStudentToStudent(dbStudent)
// Converts: Database student → Student type

enrichStudentWithGrades(student, results)
// Adds: Academic results to student object

enrichStudentWithAttendance(student, attendanceRate)
// Adds: Attendance percentage to student object
```

**Pattern**:
- Maintains UI type compatibility during migration
- Allows components to stay unchanged
- Centralizes transformation logic

### Custom Hooks

**Location**: `src/hooks/`

**Data Fetching Hooks**:

| Hook | Purpose | SWR | Supabase |
|------|---------|-----|----------|
| `useTeacherData` | Current user data | ✅ | ✅ |
| `useClasses` | Teacher's classes | ✅ | ✅ |
| `useStudents` | Students in class | ✅ | ✅ |
| `useStudentProfile` | Full student data | ✅ | ✅ |
| `useClassStats` | Class statistics | ✅ | ✅ |
| `useReportSlip` | Report slip data | ✅ | 🟡 Mock |

**Configuration Hooks**:
- `useFontSize` - Font size setting
- `useAccessibility` - Accessibility preferences
- `useTheme` - Light/dark theme

**UI Hooks**:
- `useBreadcrumbs` - Breadcrumb navigation with caching
- `useScrollToBottom` - Auto-scroll for chat
- `useResizable` - Resizable panels

**SWR Configuration**:
```typescript
{
  refreshInterval: 300000,    // 5 minutes
  revalidateOnMount: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true
}
```

---

## State Management

### Context Providers

**Location**: App layout wraps all providers

```typescript
<UserProvider>
  <FontSizeProvider>
    <AccessibilityProvider>
      <ThemeProvider>
        <SWRProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </SWRProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  </FontSizeProvider>
</UserProvider>
```

#### 1. UserProvider (`src/contexts/user-context.tsx`)

**Purpose**: Global user/teacher state

**Interface**:
```typescript
{
  user: User | null
  loading: boolean
  isFormTeacher: boolean
  isFormTeacherFor: (classId: string) => boolean
}
```

**Data Source**: `useTeacherData` → Supabase

**Current User**: Daniel Tan (hardcoded email)

#### 2. FontSizeProvider

**Purpose**: Accessibility font sizing

**Values**: 14px - 20px

**Persistence**: localStorage

**Prevention**: Inline script in `<head>` prevents FOUC

#### 3. AccessibilityProvider

**Features**:
- High contrast mode
- Reduced motion
- Keyboard navigation preferences

**Persistence**: localStorage

#### 4. ThemeProvider (next-themes)

**Modes**: light, dark, system

**Storage**: localStorage (`theme` key)

**CSS Variables**: Defined in `globals.css`

#### 5. SWRProvider

**Configuration**:
- Global SWR settings
- Error retry logic
- Deduplication window

#### 6. SidebarProvider (shadcn/ui)

**State**: Collapsed/expanded

**Persistence**: localStorage

**Mobile**: Overlay mode

### Client-Side State

#### sessionStorage (Tab Persistence)

**Keys**:
```typescript
'openTabs'           // Array of tab objects
'studentProfileTabs' // Map: studentSlug → tab info
'classroomTabs'      // Map: classId → tab info
'classroomNames'     // Map: classId → class name
```

**Restoration**:
```typescript
useLayoutEffect(() => {
  const stored = sessionStorage.getItem('openTabs')
  if (stored) {
    const tabs = JSON.parse(stored)
    setOpenTabs(tabs)
  }
}, [])
```

**Persistence** (debounced):
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    sessionStorage.setItem('openTabs', JSON.stringify(openTabs))
  }, 1000)
  return () => clearTimeout(timer)
}, [openTabs])
```

#### Refs for Immediate Access

```typescript
const openTabsRef = useRef(openTabs)
const classroomTabsRef = useRef(classroomTabs)

// Sync on each render
useEffect(() => {
  openTabsRef.current = openTabs
  classroomTabsRef.current = classroomTabs
})
```

**Use Case**: Access current state in callbacks without stale closures

#### SWR Cache

**Cache Keys**:
```typescript
`teacher-${email}`
`classes-${teacherId}`
`students-${classId}`
`student-profile-${studentName}`
`class-stats-${classId}`
```

**Revalidation**:
- On mount: Always
- On focus: Yes
- On interval: Every 5 minutes
- On reconnect: Yes

---

## Database Integration Status

### Supabase Tables (19 total)

| Table | Description | Used in UI |
|-------|-------------|------------|
| `teachers` | Teacher profiles | ✅ UserProvider |
| `classes` | All class types | ✅ MyClasses, ClassOverview |
| `teacher_classes` | Teacher-class assignments | ✅ MyClasses |
| `parents_guardians` | Parent/guardian profiles | ✅ StudentProfile |
| `students` | Student profiles | ✅ StudentList, StudentProfile |
| `student_guardians` | Student-guardian links | ✅ StudentProfile |
| `student_classes` | Class enrollments | ✅ StudentList |
| `student_overview` | Student metadata (SWAN, etc.) | ✅ StudentProfile |
| `attendance` | Daily attendance records | ✅ Attendance widgets |
| `academic_results` | Subject grades | ✅ StudentProfile, ClassOverview |
| `student_private_notes` | Teacher notes | ✅ StudentProfile |
| `cases` | Support cases | ✅ CaseManagementTable |
| `case_issues` | Individual case issues | ✅ Case details |
| `reports` | Report slips | 🟡 Partial |
| `report_comments` | Report comments | 🟡 Partial |
| `behaviour_observations` | Behavior records | ✅ Student alerts |
| `friend_relationships` | Student friendships | 🟡 Not displayed yet |
| `recommendations` | Academic recommendations | 🟡 Not displayed yet |
| `ptm_meetings` | Parent-teacher meetings | 🟡 Not displayed yet |

### Migration Files (17 total)

**Location**: `supabase/migrations/`

**Key Migrations**:
1. `20250107000000_initial_schema.sql` - All 19 tables
2. `20250107000001_add_rls_policies.sql` - Row-level security
3. `20250107000002_seed_teachers.sql` - Daniel Tan
4. `20250107000003_seed_classes.sql` - Form 5A, subjects, CCAs
5. `20250107000004_seed_parents_guardians.sql` - Test guardians
6. `20250107000005_seed_students.sql` - Initial students
7. `20250107000006_seed_data.sql` - Relationships, attendance
8. `20250110000007_dev_bypass_rls.sql` - Dev RLS bypass
9. `20250110000008_add_public_policies.sql` - Public access
10. `20250112000001_add_conduct_grade.sql` - Conduct field
11. `20250112000002_add_subject_to_results.sql` - Subject field
12. `20250113000001_seed_class_5a_students.sql` - 24 students to 5A
13. `20250122000001-20250122120000` - Case students data

### Components by Data Source

#### ✅ Fully Supabase

1. **User/Teacher Data**
   - UserProvider → `teachers` table
   - Authentication pending

2. **Classes**
   - MyClasses → `classes` + `teacher_classes`
   - ClassOverview → `classes` + enrichment

3. **Students**
   - StudentList → `students` + `student_classes` + `student_overview`
   - StudentProfile → `students` + all related tables

4. **Student Alerts**
   - HomeContent → Complex query across 5 tables

5. **Class Statistics**
   - ClassOverview → Aggregated from `attendance` + `academic_results`

#### 🟡 Partial Supabase

1. **Attendance**
   - Table exists
   - UI partially connected
   - Marking interface incomplete

2. **Grade Entry**
   - `academic_results` table exists
   - Bulk entry UI needs full integration

3. **Reports**
   - Tables exist
   - Full workflow not implemented

#### ❌ Mock Data Only

1. **Inbox/Messaging**
   - No Supabase tables
   - Mock data: `inbox-data.ts`
   - API routes use mock

2. **Student Records Timeline**
   - No comprehensive records structure
   - Mock data: `eric-records.ts`

3. **Assistant/Chat**
   - No chat history tables
   - Mock data: `chat-data.ts`

4. **Some Dashboard Stats**
   - Placeholder calculations

### Authentication Status

**Current**: No authentication
- Hardcoded user: `daniel.tan@school.edu.sg`
- Direct database queries
- RLS bypassed for development

**Planned**: Supabase Auth
- Email/password login
- Session management
- RLS enforcement
- Role-based access

---

## Key Patterns

### 1. Data Fetching Pattern

**SWR Hook + Supabase Query**:
```typescript
// Hook: useStudents.ts
export function useStudents(classId: string) {
  return useSWR(
    classId ? `students-${classId}` : null,
    async () => {
      const supabase = createClient()
      const { data, error } = await getStudentsForClass(supabase, classId)
      if (error) throw error
      return data
    },
    { refreshInterval: 300000 }
  )
}

// Component usage
const { data: students, error, isLoading } = useStudents(classId)

if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!students) return <EmptyState />

return <StudentList students={students} />
```

### 2. Adapter Pattern

**Purpose**: Decouple DB types from UI types

```typescript
// Database type
type DbStudent = Database['students']['Row']

// UI type
type Student = {
  id: string
  name: string
  // ... UI-specific fields
}

// Adapter
function mapSupabaseStudentToStudent(db: DbStudent): Student {
  return {
    id: db.id,
    name: db.name,
    // ... transformation logic
  }
}

// Usage in query
const { data: dbStudents } = await supabase.from('students').select('*')
const students = dbStudents.map(mapSupabaseStudentToStudent)
```

### 3. Error Handling Pattern

**Supabase Queries**:
```typescript
const { data, error } = await supabase.from('table').select('*')

if (error) {
  console.error('Database error:', error)
  return { data: null, error }
}

return { data, error: null }
```

**Component Error Display**:
```typescript
if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )
}
```

### 4. Loading States

**Skeleton Pattern**:
```typescript
import { Skeleton } from '@/components/ui/skeleton'

if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}
```

### 5. Type Safety

**Supabase Client with Types**:
```typescript
import type { Database } from '@/types/database'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient<Database>(...)

// Now all queries are type-safe
const { data } = await supabase
  .from('students')  // ✅ Autocomplete
  .select('id, name') // ✅ Type-checked columns

// data is typed as Pick<Student, 'id' | 'name'>[]
```

### 6. Conditional Queries

**SWR Conditional Fetching**:
```typescript
const { data } = useSWR(
  // Only fetch if classId exists
  classId ? `students-${classId}` : null,
  () => fetchStudents(classId)
)
```

### 7. Optimistic UI Updates

**Pattern** (not fully implemented yet):
```typescript
const { mutate } = useSWRConfig()

async function updateStudent(id, data) {
  // Optimistic update
  mutate(`student-${id}`, data, false)

  // Actual API call
  const result = await supabase
    .from('students')
    .update(data)
    .eq('id', id)

  // Revalidate
  mutate(`student-${id}`)

  return result
}
```

---

## Implementation Status

### Classroom Module

#### ✅ Fully Implemented

1. **My Classes Page**
   - Form class display with stats
   - Subject classes grid
   - CCA classes list
   - AI notification placeholders
   - Data: ✅ Supabase

2. **Class Overview**
   - Quick stats (attendance, performance, alerts)
   - Student list with filtering
   - Class actions menu
   - Data: ✅ Supabase

3. **Student List**
   - Sortable table
   - Status indicators (SWAN, SEN, GEP)
   - Click to view profile
   - Data: ✅ Supabase

4. **Class Alerts**
   - Alert display
   - Priority indicators
   - Quick actions
   - Data: ✅ Supabase

#### 🟡 Partially Implemented

1. **Attendance System**
   - UI: ✅ take-attendance.tsx exists
   - Database: ✅ Table exists
   - Integration: 🟡 Needs full connection
   - Marking workflow: 🟡 Incomplete

2. **Grade Entry**
   - UI: ✅ grade-entry.tsx + academic-record-entry.tsx
   - Database: ✅ Table exists
   - Integration: 🟡 Partial
   - Bulk entry: 🟡 Needs work

#### ❌ Not Started

1. **Assignment Management**
   - No UI components
   - No database tables
   - Not in original plan execution

### Student Support Module

#### ✅ Implemented

1. **Student Profile**
   - Overview tab with key info
   - Guardian contact display
   - Academic summary
   - Data: ✅ Supabase

2. **Cases Management**
   - Case table view
   - Status tracking
   - Basic CRUD
   - Data: ✅ Supabase

3. **Private Notes**
   - Note creation
   - Audit trail
   - Visibility controls
   - Data: ✅ Supabase

#### 🟡 Partial

1. **Student Records**
   - UI: ✅ student-records-timeline.tsx
   - Data: 🟡 Mock data
   - Integration: ❌ Not connected

2. **Reports**
   - UI: ✅ report-slip.tsx
   - Database: ✅ Tables exist
   - Integration: 🟡 Partial
   - Workflow: ❌ Not complete

#### ❌ Not Started

1. **Wellbeing Dashboard**
   - No components
   - No specific database structure

2. **Parent Communication Hub**
   - No dedicated UI
   - No messaging integration

### Inbox/Messaging

#### ❌ Not Integrated with Supabase

- UI: ✅ Full 5-component inbox
- Data: ❌ Mock only
- Database: ❌ No tables
- API: ❌ Mock routes

**Status**: Complete UI, waiting for database design

### Home Dashboard

#### ✅ Implemented

1. **Quick Actions**
   - 5 primary action buttons
   - Navigation to key features

2. **Student Alerts Widget**
   - Priority-based alerts
   - 3-level system
   - Supabase integration
   - Complex query logic

3. **Upcoming Classes**
   - Schedule display
   - Class quick actions

#### 🟡 Partial

1. **Pulse Summary**
   - Basic UI exists
   - Some mock data
   - Needs full integration

### Settings & Accessibility

#### ✅ Fully Implemented

1. **Font Size Control**
   - 14-20px range
   - localStorage persistence
   - FOUC prevention

2. **Theme Switching**
   - Light/dark modes
   - System preference
   - CSS variable system

3. **High Contrast Mode**
   - Accessibility toggle
   - Stored in context

4. **Reduced Motion**
   - Animation control
   - Respects user preference

---

## Next Steps

### High Priority

1. **Complete Authentication**
   - Implement Supabase Auth
   - Add login/logout UI
   - Enable RLS policies
   - Remove hardcoded user

2. **Inbox Database Integration**
   - Design messaging tables
   - Create migrations
   - Update API routes
   - Migrate from mock data

3. **Complete Attendance Integration**
   - Full marking workflow
   - Real-time updates
   - Parent notifications
   - Historical view

4. **Complete Grade Entry**
   - Bulk entry validation
   - Save to Supabase
   - Grade calculations
   - Report generation

### Medium Priority

1. **Student Records Integration**
   - Design comprehensive structure
   - Migrate timeline to Supabase
   - Add record types
   - Filtering and search

2. **Report Workflow**
   - Complete 4-stage approval
   - Comment system
   - Draft management
   - Publishing

3. **Real-time Features**
   - Supabase subscriptions
   - Live attendance updates
   - New message notifications
   - Alert updates

### Low Priority

1. **Analytics**
   - Class performance trends
   - Attendance patterns
   - Grade distributions
   - Behavior insights

2. **Advanced Features**
   - Assignment management
   - Wellbeing dashboard
   - Parent portal
   - AI assistant backend

---

## Notes

### Strengths of Current Architecture

1. **Type-Safe** - Full TypeScript coverage
2. **Modular** - Clear component boundaries
3. **Performant** - SWR caching, optimistic UI ready
4. **Maintainable** - Adapter pattern allows gradual migration
5. **Accessible** - Built-in accessibility features
6. **Scalable** - Ready for auth, RLS, real-time

### Technical Debt

1. **Hardcoded User** - No login system yet
2. **Mock Data** - Inbox and some features still use mocks
3. **Client-Heavy** - Most components are client-side
4. **No Tests** - Limited test coverage
5. **No Error Boundaries** - Need better error handling

### Migration Strategy

**Phase 1**: Core Features (Current)
- ✅ User/teacher data
- ✅ Classes
- ✅ Students
- ✅ Student alerts

**Phase 2**: Authentication & Security
- 🔄 Supabase Auth
- 🔄 RLS policies
- 🔄 Route protection

**Phase 3**: Remaining Features
- ⏳ Inbox/messaging
- ⏳ Complete attendance
- ⏳ Complete grades
- ⏳ Student records

**Phase 4**: Enhancement
- ⏳ Real-time updates
- ⏳ Analytics
- ⏳ AI features

---

**Document Maintainers**: Update this document after significant feature additions or architectural changes.

**Related Documents**:
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Framework guidelines
- [SUPABASE_IMPLEMENTATION.md](./SUPABASE_IMPLEMENTATION.md) - Database schema
- [classroom-iteration-plan.md](../ Tasks/classroom-iteration-plan.md) - Original roadmap
