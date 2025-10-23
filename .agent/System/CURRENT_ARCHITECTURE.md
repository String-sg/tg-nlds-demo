# Current Architecture (As-Implemented)

**Last Updated**: October 23, 2025 (Navigation & Breadcrumbs Update)
**Status**: Living Document - Updated as codebase evolves

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Component Architecture](#component-architecture)
4. [Routing System](#routing-system)
   - [Multi-Tab Navigation System](#multi-tab-navigation-system)
   - [Breadcrumb Navigation System](#breadcrumb-navigation-system)
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
- Next.js 16 App Router with dynamic routing
- Client-heavy architecture with hybrid data sourcing

### File Statistics
- **Components**: 57 TSX files
- **Hooks**: 14 custom hooks (including useBreadcrumbs, useTabManagement)
- **Contexts**: 6 context providers
- **API Routes**: 4 endpoints
- **Database Tables**: 19 Supabase tables
- **Migration Files**: 17 migrations
- **Main Page Component**: 2,300+ lines (multi-tab + routing implementation)

---

## Technology Stack

### Core Framework
```json
{
  "next": "^16.0.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "typescript": "^5"
}
```

### UI Framework
- **shadcn/ui**: Component library (copy-paste components, not npm package)
- **Radix UI**: Primitives used by shadcn/ui (Dialog, Select, Tabs, etc.)
- **Tailwind CSS**: 4.x for styling
- **lucide-react**: Icon library

```json
{
  "shadcn/ui": "Components in src/components/ui/",
  "@radix-ui/*": "Multiple packages (primitives)",
  "tailwindcss": "^4",
  "lucide-react": "^0.544.0"
}
```

### Database & Auth
```json
{
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.75.0"
}
```

### Data Fetching
```json
{
  "swr": "^2.3.6"
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

### Multi-Tab Navigation System

The application implements a **browser-tab-like navigation system** allowing users to work with multiple pages simultaneously. This is a sophisticated custom implementation built specifically for the Teacher Guide application.

#### Architecture Overview

**Implementation Location**: `src/app/[[...slug]]/page.tsx` (lines 752-2124)

**Core Philosophy**:
- URL is the source of truth (driven by Next.js useParams)
- Parent-child tab relationships prevent duplicate tabs
- Tabs persist across page refreshes via sessionStorage
- Active tab always remains visible even during overflow

#### Tab State Management

**Primary State Variables** (lines 752-769):
```typescript
const [openTabs, setOpenTabs] = useState<ClosableTabKey[]>([])
const openTabsRef = useRef<ClosableTabKey[]>([])  // Ref for immediate access
const [activeTab, setActiveTab] = useState<TabKey>(initialTab as TabKey)
const [draggedTab, setDraggedTab] = useState<ClosableTabKey | null>(null)
const [dragOverTab, setDragOverTab] = useState<ClosableTabKey | null>(null)
const [studentProfileTabs, setStudentProfileTabs] = useState<Map<string, string>>(new Map())
const [classroomTabs, setClassroomTabs] = useState<Map<string, string>>(new Map())
const [classroomNames, setClassroomNames] = useState<Map<string, string>>(new Map())
```

**Dual State Pattern**: Both `state` and `refs` are used to prevent race conditions during rapid navigation

**Three Metadata Maps**:
1. `studentProfileTabs`: Maps student tab keys to student names
2. `classroomTabs`: Maps classroom tab keys to encoded paths (format: "classId:className")
3. `classroomNames`: Caches classId to className mappings for breadcrumbs

#### Tab Types

```typescript
export type TabKey =
  | 'home'
  | 'explore'
  | 'records'
  | 'pulse'
  | ClassroomTabKey
  | `student/${string}`

export type ClassroomTabKey =
  | `classroom/${string}`
  | `classroom/${string}/student/${string}`

export type ClosableTabKey = Exclude<TabKey, 'home'>  // Home cannot be closed
```

#### Persistence (sessionStorage)

**Storage Keys**:
- `openTabs`: Array of open tab keys
- `studentProfileTabs`: Map entries of student profile mappings
- `classroomTabs`: Map entries of classroom tab paths
- `classroomNames`: Map entries of cached classroom names

**Initialization** (lines 826-857 - useLayoutEffect):
```typescript
useLayoutEffect(() => {
  const storedTabs = sessionStorage.getItem('openTabs')
  if (storedTabs) {
    const parsedTabs = JSON.parse(storedTabs) as ClosableTabKey[]
    setOpenTabs(parsedTabs)
    openTabsRef.current = parsedTabs
  }
  // Restore maps...
  setIsMounted(true)
}, [])
```

**Debounced Persistence** (1-second debounce to avoid performance issues):
```typescript
useEffect(() => {
  if (!isMounted) return

  const timeoutId = setTimeout(() => {
    sessionStorage.setItem('openTabs', JSON.stringify(openTabs))
    sessionStorage.setItem('studentProfileTabs', JSON.stringify(Array.from(studentProfileTabs.entries())))
    sessionStorage.setItem('classroomTabs', JSON.stringify(Array.from(classroomTabs.entries())))
    sessionStorage.setItem('classroomNames', JSON.stringify(Array.from(classroomNames.entries())))
  }, 1000)

  return () => clearTimeout(timeoutId)
}, [openTabs, studentProfileTabs, classroomTabs, classroomNames, isMounted])
```

#### Parent-Child Tab Hierarchy

**Hierarchy Structure**:
```
home
  ├─ pulse (child of home)
inbox
  └─ inbox/{conversationId} (child of inbox)
classroom
  └─ classroom/{classId} (child of classroom)
      ├─ classroom/{classId}/students
      ├─ classroom/{classId}/grades
      ├─ classroom/{classId}/attendance
      └─ classroom/{classId}/student/{studentSlug}
student-{slug} (standalone, no parent)
```

**Smart Parent Detection** (lines 773-824):
```typescript
const getParentTab = (tabKey: string): string | null => {
  if (tabKey === 'pulse') return 'home'
  if (tabKey.startsWith('inbox/')) return 'inbox'
  if (tabKey.startsWith('classroom/')) {
    const parts = tabKey.split('/')
    if (parts.length > 2) {
      return `${parts[0]}/${parts[1]}`  // Return parent classroom
    }
    return 'classroom'
  }
  return null
}

const hasAnyParentInTabs = (tabKey: string, openTabs: ClosableTabKey[]): boolean => {
  let currentKey = tabKey
  while (currentKey) {
    const parent = getParentTab(currentKey)
    if (!parent) break
    if (openTabs.includes(parent as ClosableTabKey)) return true
    currentKey = parent
  }
  return false
}
```

**Behavior**: Child pages navigate within parent tabs rather than creating new tabs

#### Tab Opening Logic

**Primary Handler**: `handleNavigate()` (lines 1049-1077)

**Tab-Specific Handlers** (lines 1244-1300):
- `handleOpenClassroom(classId, className)`: Opens classroom tab with metadata
- `handleOpenStudentProfile(studentName)`: Opens standalone student profile
- `handleOpenStudentFromClass(classId, studentName)`: Opens student within classroom tab

**Smart Tab Addition** (lines 1004-1021):
```typescript
const tabExists = currentTabsFromRef.includes(tabFromUrl as ClosableTabKey)

if (!tabExists) {
  const parentInTabsForAddition = hasAnyParentInTabs(tabFromUrl, currentTabsFromRef)

  // Only add tab if no parent exists
  if (!parentInTabsForAddition) {
    const filteredTabs = currentTabsFromRef.filter(t => t !== (tabFromUrl as ClosableTabKey))
    const newTabs = [...filteredTabs, tabFromUrl as ClosableTabKey]
    openTabsRef.current = newTabs
    setOpenTabs(newTabs)
  }
}
```

#### Tab Closing Logic

**Handler**: `handleCloseTab()` (lines 1337-1378)

**Process**:
1. Filter out the closed tab from openTabs
2. Mark tab as closing (prevents re-adding during navigation)
3. **Immediately** persist to sessionStorage (no debounce)
4. If closing the active tab, navigate to previous or next tab
5. Clear closing marker after 500ms

**Smart Active Tab Selection**:
```typescript
const closingIndex = currentTabs.indexOf(pageKey as ClosableTabKey)
const newActiveTab =
  filteredTabs[closingIndex - 1] ??  // Previous tab
  filteredTabs[closingIndex] ??       // Same position (shifted)
  (filteredTabs.length > 0 ? filteredTabs[filteredTabs.length - 1] : 'home')
```

#### Tab Switching & URL Sync

**URL → Tab Synchronization** (lines 904-1022):

The system syncs URL changes to active tab state:
```typescript
useEffect(() => {
  const tabFromUrl = !currentSlug || currentSlug.length === 0 ? 'home' : currentSlug.join('/')

  const parentInTabs = hasAnyParentInTabs(tabFromUrl, openTabsRef.current)

  if (parentInTabs) {
    // Child page - keep parent tab active
    let foundParent = findParentInTabs(tabFromUrl)
    if (foundParent && activeTab !== foundParent) {
      setActiveTab(foundParent as TabKey)
    }
  } else {
    // Top-level page - set as active tab
    if (activeTab !== tabFromUrl) {
      setActiveTab(tabFromUrl as TabKey)
    }
  }
}, [params, activeTab, isMounted, closingTabs])
```

**Tab Click → URL Navigation** (lines 1913-1918):
```typescript
onClick={() => {
  setActiveTab(tabKey)
  const newPath = tabKey === 'home' ? '/' : `/${tabKey}`
  router.push(newPath, { scroll: false })
}}
```

#### Drag-and-Drop Reordering

**Implementation** (lines 1578-1631):

Full HTML5 drag-and-drop support:
```typescript
const handleDrop = (event: React.DragEvent, targetTabKey: ClosableTabKey) => {
  event.preventDefault()

  if (!draggedTab || draggedTab === targetTabKey) return

  setOpenTabs((tabs) => {
    const draggedIndex = tabs.indexOf(draggedTab)
    const targetIndex = tabs.indexOf(targetTabKey)

    const newTabs = [...tabs]
    newTabs.splice(draggedIndex, 1)           // Remove from source
    newTabs.splice(targetIndex, 0, draggedTab) // Insert at target

    return newTabs
  })
}
```

**Visual Indicators**: 3px blue vertical bars appear on left/right during drag

#### Responsive Tab Overflow

**Intelligent Visibility Calculation** (lines 1475-1537):

Calculates how many tabs can fit based on:
- Container width
- Gap spacing (8px)
- Fixed element widths (New Tab button, Assistant button)
- Minimum tab width (120px)

**Features**:
- Ensures active tab always visible
- Swaps hidden active tab with last visible tab if needed
- Shows "More" dropdown for hidden tabs

**Hidden Tabs Dropdown** (lines 1976-2063):
- Displays overflow tabs in a dropdown menu
- Click to navigate to hidden tab

#### Tab Rendering

**Dynamic Label Generation** (lines 1836-1932):

Tab labels are computed based on tab type:
- Student profiles: Show student name
- Classroom tabs: Show class name (e.g., "Class 5A")
- Nested routes: Show context (e.g., "Class 5A Students", "Class 5A Grades")

**Close Button**: Appears on hover, positioned absolute right

**Styling**:
- Active tab: white background with ring border
- Inactive tabs: muted colors, hover effects
- Dragging tab: 30% opacity

#### Content Rendering Pattern

**Separation of Concerns**:

```typescript
// activeTab = currently highlighted tab in tab bar
// currentUrl = actual URL path driving content

// This allows child pages to render while parent tab stays active
if (currentUrl === 'home') {
  return <HomeContent />
} else if (currentUrl.startsWith('classroom/') && currentUrl.includes('/student/')) {
  return <StudentProfile studentName={studentName} classId={classId} />
}
// ... etc
```

**Key Insight**: Content is rendered based on `currentUrl`, not `activeTab`. This enables parent tabs to stay active while navigating to child pages.

#### Keyboard Shortcuts

**Cmd/Ctrl + K**: Toggle Assistant panel (lines 1633-1648)

#### Performance Optimizations

1. **Memoization**: Heavy use of `useMemo` and `useCallback`
2. **Refs for Immediate Access**: Avoids stale closures
3. **Debounced Persistence**: 1-second debounce for sessionStorage writes
4. **TabContent Memoization**: Prevents unnecessary re-renders

### Breadcrumb Navigation System

The breadcrumb system provides context-aware navigation trails that automatically update based on the current URL and integrate seamlessly with the multi-tab system.

#### Architecture Overview

**Implementation Files**:
- Hook: `src/hooks/use-breadcrumbs.ts` (313 lines)
- UI Components:
  - `src/components/ui/breadcrumb.tsx` (shadcn/ui primitives)
  - `src/components/ui/breadcrumbs.tsx` (custom wrapper)
- Integration: `src/app/[[...slug]]/page.tsx` (lines 1036-1046, 2132-2134)

#### Breadcrumb Data Structure

**Type Definition** (use-breadcrumbs.ts:7-13):
```typescript
interface BreadcrumbItem {
  label: string           // Display text (e.g., "Home", "Classroom", "Class 5A")
  path: string            // Route path (e.g., "home", "classroom/abc123")
  isActive: boolean       // Current page indicator
  isLoading?: boolean     // Loading state for skeleton
  onClick?: () => void    // Navigation callback
}
```

#### Hook Configuration

**useBreadcrumbs Parameters**:
```typescript
interface UseBreadcrumbsConfig {
  activeTab: string                        // Current active tab/path
  classroomTabs: Map<string, string>       // Classroom route → encoded path
  studentProfileTabs: Map<string, string>  // Student route → student name
  classroomNames: Map<string, string>      // ClassId → class name (cache)
  onNavigate: (path: string, replace?: boolean) => void  // Navigation handler
}
```

#### Async Class Name Resolution

**Smart Name Fetching** (use-breadcrumbs.ts:48-80):

The hook fetches class names from Supabase when navigating to classroom routes:

```typescript
const fetchClassName = async (classId: string) => {
  const supabase = createClient()
  const { data, error } = await getClassDetails(supabase, classId)

  if (!error && data) {
    const newNames = new Map(classNames)
    newNames.set(classId, data.name)
    setClassNames(newNames)

    // Cache in sessionStorage
    sessionStorage.setItem('classroomNames', JSON.stringify(Array.from(newNames.entries())))
  }
}
```

**Loading States**: Shows `<Skeleton>` components while fetching class names

#### Route Parsing & Breadcrumb Generation

**Path Mapping Logic** (use-breadcrumbs.ts:90-307):

The hook parses URL paths and generates appropriate breadcrumb chains:

**Top-Level Pages**:
```typescript
// URL: /home → Breadcrumbs: [Home (active)]
// URL: /pulse → Breadcrumbs: [Home, Pulse (active)]
// URL: /inbox → Breadcrumbs: [Inbox (active)]
// URL: /classroom → Breadcrumbs: [Classroom (active)]
```

**Classroom Nested Routes**:
```typescript
// URL: /classroom/abc123
// Breadcrumbs: [Home, Classroom, Class Name (active)]

// URL: /classroom/abc123/students
// Breadcrumbs: [Home, Classroom, Class Name, Students (active)]

// URL: /classroom/abc123/student/john-doe
// Breadcrumbs: [Home, Classroom, Class Name, John Doe (active)]

// URL: /classroom/abc123/grades
// Breadcrumbs: [Home, Classroom, Class Name, Grade Entry (active)]
```

**Student Standalone Routes**:
```typescript
// URL: /student-john-doe
// Breadcrumbs: [Students, John Doe (active)]
```

**Inbox Routes**:
```typescript
// URL: /inbox/conv-123
// Breadcrumbs: [Inbox, Conversation Title (active)]
```

#### Name Resolution Priority

**Multi-Source Lookup** (use-breadcrumbs.ts:202-206):

For classroom names, the hook checks multiple sources in order:
1. `classroomNames` (from props/cache)
2. `classNames` (from async fetch)
3. `encodedClassName` (from URL encoding)
4. `null` (shows skeleton when still loading)

```typescript
const className =
  classroomNamesFromProps.get(classId) ||  // Check props first
  classNames.get(classId) ||                // Then local state
  encodedClassName ||                       // Then URL
  null                                      // Loading
```

#### Breadcrumb Component Features

**Custom Wrapper** (breadcrumbs.tsx:28-148):

1. **Back Button** (lines 68-79): Shows for 2nd level+ pages
2. **Loading Skeletons** (lines 109-111): While breadcrumb data loads
3. **Active State Styling**: Distinguishes current page vs clickable breadcrumbs
4. **Click Handlers**: Execute onClick callbacks for navigation
5. **Truncation Support**: Handles maxItems with ellipsis

**shadcn/ui Primitives** (breadcrumb.tsx):
- `Breadcrumb`: Root nav with `aria-label="breadcrumb"`
- `BreadcrumbList`: Ordered list container
- `BreadcrumbItem`: Individual breadcrumb wrapper
- `BreadcrumbLink`: Clickable breadcrumb with hover effects
- `BreadcrumbPage`: Current page with `aria-current="page"`
- `BreadcrumbSeparator`: Chevron separator (default)
- `BreadcrumbEllipsis`: For truncated breadcrumbs

#### Integration with Tab System

**Hook Usage** (page.tsx:1036-1046):
```typescript
const { breadcrumbs: pageBreadcrumbs, isLoading: breadcrumbsLoading } = useBreadcrumbs({
  activeTab: currentUrl as string,
  classroomTabs,
  studentProfileTabs,
  classroomNames,
  onNavigate: useCallback((path: string, replace?: boolean) => {
    const newPath = path === 'home' ? '/' : `/${path}`
    router.push(newPath, { scroll: false })
  }, [router]),
})
```

**Rendering** (page.tsx:2132-2134):
```typescript
{pageBreadcrumbs && pageBreadcrumbs.length > 0 && (
  <Breadcrumbs items={pageBreadcrumbs} isLoading={breadcrumbsLoading} />
)}
```

#### Data Flow

```
URL Change (useParams)
    ↓
Page Component receives params
    ↓
useBreadcrumbs Hook
    ├─ Parse pathname (useMemo)
    ├─ Check name caches (classroomNames, studentProfileTabs)
    ├─ Fetch async data if needed (Supabase class names)
    └─ Return: BreadcrumbItem[] + isLoading boolean
    ↓
Breadcrumbs Component
    ├─ Handle truncation (maxItems)
    ├─ Show loading skeletons
    ├─ Render back button (depth > 1)
    └─ Execute onClick callbacks on navigation
    ↓
Router.push() updates URL → cycle repeats
```

#### Accessibility

1. **Semantic HTML**: `<nav aria-label="breadcrumb">`
2. **Current Page**: `aria-current="page"` on active breadcrumb
3. **Separators**: `role="presentation"` and `aria-hidden="true"`
4. **Keyboard Navigation**: Full keyboard support via native elements

#### Performance Optimizations

1. **Memoization**: `useMemo` prevents unnecessary breadcrumb recalculation
2. **Caching**: sessionStorage caches classroom names across sessions
3. **Lazy Loading**: Only fetches class names when needed
4. **Skeleton States**: Prevents layout shift during loading

### Navigation Methods

1. **Sidebar Click** → Opens new tab (if no parent exists) + navigates
2. **In-page Link** → Updates URL + navigates within existing tab
3. **Breadcrumb Click** → Navigates within current tab (no new tab)
4. **Tab Click** → Switches active tab + updates URL
5. **Tab Close** → Removes tab, navigates to adjacent tab or home

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
