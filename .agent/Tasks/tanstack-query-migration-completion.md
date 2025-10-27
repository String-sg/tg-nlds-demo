# TanStack Query Migration - Completion & Fixes

## Overview
Complete the TanStack Query migration by fixing TypeScript errors, restoring breadcrumbs functionality, and correcting attendance calculations.

**Status**: ✅ Completed
**Date**: October 27, 2025

## Problem Statement
After the initial TanStack Query migration (commit 0fc90dd), several issues remained:
1. TypeScript errors from database schema mismatches
2. Breadcrumbs degraded to showing only class names (lost full navigation trails)
3. Student attendance showing 0% for most students

## Research Findings

### TypeScript Errors
**Root Causes**:
- Database migrations added `subject` (to `academic_results`) and `conduct_grade` (to `student_overview`) fields on January 12, 2025
- TypeScript type definitions in `src/types/database.ts` were never updated
- Query files using wrong table names:
  - `grades` should be `academic_results`
  - `student_cases` should be `cases`

**Impact**:
- 50+ TypeScript errors across query files
- Type inference failures causing `never` types
- Properties inaccessible despite existing in database

### Breadcrumbs Issue
**Root Cause**: Minimal TanStack Query wrapper only fetched class names, lost sophisticated route parsing logic

**Comparison**:
| Aspect | Old Implementation | New Minimal Version | Issue |
|--------|-------------------|---------------------|-------|
| File | `use-breadcrumbs.ts` | `use-breadcrumbs-query.ts` | Incomplete migration |
| Lines of code | 313 | 47 | Lost 85% of logic |
| Data returned | `BreadcrumbItem[]` | `{ className }` | Wrong structure |
| Route parsing | ✅ Full logic | ❌ None | No hierarchy |
| Click navigation | ✅ onClick handlers | ❌ None | Not clickable |
| Breadcrumb trail | ✅ Full hierarchy | ❌ Single item | Degraded UX |

**Missing Features**:
- Route parsing and segment analysis
- Full navigation hierarchy generation
- Click navigation callbacks
- Context awareness (student profiles, inbox conversations, etc.)

**What Was Lost**:
- Home → Pulse
- Home → My Classes → Class Name
- Home → My Classes → Class Name → Student Name
- Messages → Conversation
- And more nested routes

### Attendance Issue
**Root Cause**: Query fetching ALL historical attendance records without date filter

```typescript
// BEFORE (broken)
supabase
  .from('attendance')
  .select('student_id, status')
  .in('student_id', studentIds)  // No date filter!
  .then((res) => res.data)
```

**Problems**:
- Students with no records showed 0%
- Students with records calculated lifetime attendance (years of data)
- No filtering by attendance type (included CCA, events)
- Performance issues with large datasets

**Impact on UI**:
- Most students showed 0% attendance in red
- Unrealistic percentages (lifetime vs current term)
- Teachers confused by inaccurate data

## Implementation Plan

### Phase 1: Fix TypeScript Errors ✅

**Tasks Completed**:
1. ✅ Updated `src/types/database.ts`:
   - Added `subject?: string | null` to `academic_results` (Row, Insert, Update)
   - Added `conduct_grade?: string | null` to `student_overview` (Row, Insert, Update)

2. ✅ Fixed `src/lib/queries/class-queries.ts`:
   - Line 136: Changed `.from('grades')` → `.from('academic_results')`
   - Line 151: Changed `.from('student_cases')` → `.from('cases')`

3. ✅ Verified with `npm run type-check`
   - Reduced from 50+ errors to remaining type inference issues
   - Core schema mismatches resolved

### Phase 2: Restore Breadcrumbs ✅

**Created New Hook**: `src/hooks/queries/use-route-breadcrumbs-query.ts` (242 lines)

**Architecture - Hybrid Approach**:
```typescript
// Route parsing → Determine breadcrumb structure
// TanStack Query → Fetch display names (cached)
// Generate BreadcrumbItem[] → Full clickable trail
```

**Features Implemented**:
- ✅ TanStack Query for class name fetching (1 hour cache)
- ✅ Route segment parsing from URL
- ✅ Full breadcrumb hierarchy generation
- ✅ Click navigation with callbacks
- ✅ Loading states with skeletons
- ✅ Support for all routes:
  - Home, Pulse
  - Classroom (with class ID)
  - Student profiles (with student names)
  - Inbox conversations
  - Calendar, Reports, Settings

**Key Functions**:
```typescript
// Parse URL into segments
function parseRouteSegments(url: string): string[]

// Fetch class name with caching
function useClassNameQuery(classId: string | null)

// Generate full breadcrumb trail
function generateBreadcrumbs(
  segments: string[],
  className: string | null | undefined,
  isLoadingClass: boolean,
  config: UseBreadcrumbsConfig
): BreadcrumbItem[]

// Main hook
export function useRouteBreadcrumbsQuery(config: UseBreadcrumbsConfig)
```

**Updated `src/app/[[...slug]]/page.tsx`**:
```typescript
// BEFORE (broken)
const classIdMatch = (currentUrl as string).match(/^classroom\/([^/]+)/)
const classIdForBreadcrumb = classIdMatch ? classIdMatch[1] : ''
const { breadcrumbs: breadcrumbData, isLoading: breadcrumbsLoading } =
  useBreadcrumbs(classIdForBreadcrumb)
const pageBreadcrumbs = breadcrumbData?.className ?
  [{ label: breadcrumbData.className, path: `/classroom/${classIdForBreadcrumb}`, isActive: true }]
  : []

// AFTER (fixed)
const { breadcrumbs: pageBreadcrumbs, isLoading: breadcrumbsLoading } =
  useRouteBreadcrumbs({
    currentUrl: currentUrl as string,
    onNavigate: (path) => handleNavigate(path as ClosableTabKey),
    studentProfileTabs,
    classroomNames: classroomTabs,
  })
```

### Phase 3: Fix Attendance Calculation ✅

**Solution**: Add date and type filters to attendance query

**Changes in `src/lib/queries/student-queries.ts`**:
```typescript
// BEFORE (broken)
supabase
  .from('attendance')
  .select('student_id, status')
  .in('student_id', studentIds)
  .then((res) => res.data)

// AFTER (fixed)
// Calculate date range for current term (last 60 days)
const today = new Date()
const termStartDate = new Date(today)
termStartDate.setDate(today.getDate() - 60)
const termStartStr = termStartDate.toISOString().split('T')[0]

supabase
  .from('attendance')
  .select('student_id, status, date')
  .in('student_id', studentIds)
  .eq('type', 'daily')              // Only daily attendance
  .gte('date', termStartStr)        // Last 60 days
  .then((res) => res.data)
```

**Rationale**:
- **60-day window**: Represents current term, balances recency with sample size
- **Daily attendance only**: CCA and event attendance shouldn't affect class attendance rate
- **Date field included**: Allows for future date-based analysis if needed

## Technical Details

### Files Created
- `/src/hooks/queries/use-route-breadcrumbs-query.ts` (242 lines)
  - Exports: `useRouteBreadcrumbsQuery`, `useRouteBreadcrumbs`, `BreadcrumbItem` interface

### Files Modified
1. `/src/types/database.ts`
   - Added `subject` field to `academic_results` table definition
   - Added `conduct_grade` field to `student_overview` table definition

2. `/src/lib/queries/class-queries.ts`
   - Fixed table name: `grades` → `academic_results`
   - Fixed table name: `student_cases` → `cases`

3. `/src/lib/queries/student-queries.ts`
   - Added date range calculation (60 days)
   - Added filters to attendance query: `.eq('type', 'daily').gte('date', termStartStr)`

4. `/src/app/[[...slug]]/page.tsx`
   - Updated import: `use-breadcrumbs-query` → `use-route-breadcrumbs-query`
   - Replaced breadcrumb hook call with new API
   - Moved hook call after `handleNavigate` definition (fixed hoisting issue)

### Key Decisions

**1. Hybrid Approach for Breadcrumbs**
- **Why**: Separates concerns - TanStack Query for caching, route parsing for logic
- **Benefits**:
  - Keeps TanStack Query migration benefits (DevTools, caching)
  - Restores full breadcrumb functionality
  - Easy to extend with new routes

**2. 60-Day Attendance Window**
- **Why**: Balances current term data with reasonable sample size
- **Alternatives considered**:
  - Academic year: Too long, includes summer/breaks
  - 30 days: Too short, not enough data
  - 90 days: Too long, includes previous term
- **Chosen**: 60 days ≈ 1 school term

**3. Daily Attendance Only**
- **Why**: CCA and event attendance are separate concerns
- **Impact**: Class attendance rate reflects actual class attendance, not extracurricular

**4. Keep Old Hook in Codebase**
- **Decision**: Leave `use-breadcrumbs.ts` for reference but unused
- **Why**: Documents original implementation, useful for future reference
- **Future**: Can be deleted after confirming new hook is stable

## Testing Results

### Chrome DevTools Testing

**Pages Tested**:
1. ✅ **Pulse page** (`/pulse`)
   - Breadcrumbs: Home > Pulse
   - Back button hidden (only 2 levels)
   - Navigation working

2. ✅ **Classroom page** (`/classroom/be7275c7-7b20-4e13-9dae-fb29ad9ba676`)
   - Breadcrumbs: Home > My Classes > 5A
   - Class name "5A" fetched via TanStack Query (cached)
   - Back button visible
   - Navigation working

3. ✅ **Student profile** (`/classroom/.../student/chen-mei-ling`)
   - Breadcrumbs: Home > My Classes > 5A > Chen Mei Ling
   - Full hierarchy displayed
   - Student name from URL slug
   - All breadcrumb levels clickable

4. ✅ **Student list with corrected attendance**
   - Before: Most students 0% (red)
   - After: Realistic distribution (green/amber):
     - 90% (Aiden Wong, Ava Sim, Chen Jia Yi, Chloe Tan, etc.)
     - 95% (Alice Wong, Chen Jia Yi, Eric Lim, etc.)
     - 100% (Aria Tay, Ethan Seah, Harper Koh, etc.)
     - 85% (Caleb Soh, Ella Ng, Hannah Lim, etc.)
     - Lower rates: 41%, 65%, 73%, 77% for some students

**Console Errors**: None found ✅

**Performance Verified**:
- TanStack Query caching working (1 hour for class names)
- Parallel batch queries for student data
- No N+1 query patterns
- Fast refresh working correctly

### Network Analysis
- Attendance query now includes date filter: `?date=gte.2025-08-28`
- Query properly batches student IDs: `.in(student_id, [id1, id2, ...])`
- Class name fetched once, cached for 1 hour

## Lessons Learned

### 1. Migration Completeness
**Lesson**: When migrating data fetching libraries, ensure ALL logic is migrated, not just fetching.

**What Happened**:
- Initial migration focused on "data fetching" (API calls)
- Breadcrumb generation logic was separate from data fetching
- Result: Logic was left in old hook, new hook only fetched data

**Prevention**:
- Identify all concerns: data fetching, caching, transformation, UI logic
- Create checklist of features to migrate
- Test full user flows, not just data loading

### 2. Query Filters Are Critical
**Lesson**: Always add appropriate filters to queries (date, type) to avoid performance and correctness issues.

**What Happened**:
- Attendance query fetched ALL records (potentially years of data)
- No type filtering (included CCA, events)
- Result: 0% for students without records, or lifetime averages

**Prevention**:
- Always define query scope (date ranges, entity types)
- Document filter rationale in code comments
- Consider query performance at scale

### 3. Type Synchronization
**Lesson**: Database migrations should immediately update TypeScript types.

**What Happened**:
- Migrations added fields on Jan 12, 2025
- TypeScript types never updated
- Result: Type errors accumulated, developer confusion

**Prevention**:
- Add TypeScript type updates to migration checklist
- Use database introspection tools (Supabase CLI can generate types)
- Run type-check in CI/CD after migrations

### 4. Testing User Journeys
**Lesson**: Test full user journeys, not just individual components.

**What Happened**:
- Breadcrumbs component rendered correctly
- But only received single item instead of full trail
- Individual component worked, but integration broken

**Prevention**:
- Create E2E test scenarios for critical user paths
- Use Chrome DevTools to verify full flows
- Check actual DOM output, not just component props

## Follow-up Tasks

### Immediate
- [x] Create task documentation (this file)
- [ ] Update `.agent/System/CURRENT_ARCHITECTURE.md` to reflect breadcrumbs changes
- [ ] Mark SWR migration as fully complete in system docs

### Short-term
- [ ] Add unit tests for breadcrumb route parsing logic
- [ ] Add integration tests for attendance calculation
- [ ] Document breadcrumb extension pattern for new routes

### Long-term
- [ ] Consider making attendance date range configurable (per teacher/school preference)
- [ ] Add ability to filter by attendance status (present/absent/late)
- [ ] Explore using Supabase type generation CLI for automatic type sync

## References
- Initial TanStack Query migration: commit `0fc90dd`
- Database migrations: `20250112000001_add_conduct_grade`, `20250112000002_add_subject`
- Original breadcrumbs hook: `src/hooks/use-breadcrumbs.ts` (313 lines, now unused)
- TanStack Query docs: https://tanstack.com/query/latest
- Breadcrumb UI component: `src/components/ui/breadcrumbs.tsx`

## Screenshots

### Before Fix
- Breadcrumbs: Only showing single item (class name)
- Attendance: Most students showing 0% in red

### After Fix
- Breadcrumbs: Full hierarchy (Home > My Classes > 5A > Student Name)
- Attendance: Realistic distribution (41%-100%) in green/amber
- Back button visible and functional
- Click navigation working on all breadcrumb items
