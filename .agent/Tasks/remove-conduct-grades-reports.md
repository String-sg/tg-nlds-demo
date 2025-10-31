# Removal Plan: Conduct Grades & Report Features

## Executive Summary

This document outlines the comprehensive plan to remove conduct grade functionality and report features from the MOE-TG-VX system. The removal involves database schema changes, UI component updates, type definitions cleanup, and elimination of dead code.

## PTM Prioritization Decision ✅

**Decision**: Remove conduct grades from PTM prioritization entirely (Option A)

**Current PTM Priority Scoring:**
- Attendance: Very low (<70%) = 50 pts, Low (70-84%) = 30 pts
- Active Cases: 30 pts per case (max 3 cases)
- Conduct Grade: Poor = 20 pts, Fair = 10 pts
- **Max Score**: 140 points

**After Removal:**
- Attendance: Very low (<70%) = 50 pts, Low (70-84%) = 30 pts
- Active Cases: 30 pts per case (max 3 cases)
- **Max Score**: 120 points

**Impact**: Minimal - attendance and active cases are the dominant factors. PTM feature continues working effectively without conduct grade scoring.

---

## Scope

### Features to Remove
1. **Conduct Grades** - 5-tier Singapore MOE conduct grading system (Excellent, Very Good, Good, Fair, Poor)
2. **Report Features** - HDP report slips, report generation, report approval workflow, report comments

### Impact Assessment
- **Database Tables Affected**: 3 tables (student_overview, reports, report_comments)
- **Migration Files**: 3 files
- **Type Definition Files**: 5 files
- **UI Components**: 7 components (including PTM assistant panel)
- **Server Actions**: 1 file
- **Query Functions**: 2 files
- **Hooks**: 2 files
- **Utility Functions**: 1 file

---

## Phase 1: Database Schema Changes

### 1.1 Remove Conduct Grade Column

**File**: Create new migration `remove_conduct_grade.sql`

```sql
-- Remove conduct_grade column from student_overview
ALTER TABLE student_overview
DROP COLUMN IF EXISTS conduct_grade;
```

**Migration files to note** (historical reference only, no changes needed):
- `/supabase/migrations/20250112000001_add_conduct_grade_to_student_overview.sql`
- `/supabase/migrations/20250113000001_add_24_students_to_class_5a.sql` (lines 301-326)

### 1.2 Remove Reports Tables

**File**: Create new migration `remove_reports_system.sql`

```sql
-- Drop report_comments table first (has foreign key to reports)
DROP TABLE IF EXISTS report_comments CASCADE;

-- Drop reports table
DROP TABLE IF EXISTS reports CASCADE;
```

**Migration file to note** (historical reference):
- `/supabase/migrations/20250110000005_create_reports_system.sql`

---

## Phase 2: Type Definitions Cleanup

### 2.1 Remove Conduct Grade Types

**File**: `/src/types/classroom.ts`

**Remove:**
- Line 32: `export type ConductGrade = 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor'`
- Line 119: `conduct_grade: ConductGrade` field from Student interface

**File**: `/src/types/ptm.ts`

**Remove:**
- Line 3: Import of `ConductGrade`
- Line 77: `conductGrade: ConductGrade` field from PTMStudent interface
- Lines 201-206: `poorConduct: number` and `fairConduct: number` fields from PTMPriorityWeights interface

**File**: `/src/types/database.ts` (auto-generated)

**Action**: Regenerate types after database migration
```bash
npx supabase gen types typescript --local > src/types/database.ts
```

This will automatically remove:
- `student_overview.conduct_grade` field
- `reports` table types
- `report_comments` table types

### 2.2 Remove Report Types

**File**: `/src/types/classroom.ts`

**Remove:**
- Lines 340-356: `Report` interface (entire interface)

**File**: `/src/types/student-records.ts`

**Remove:**
- Lines 175-222: All report-related types:
  - `ReportSlipStatus` type
  - `Term` type
  - `SubjectGrade` interface
  - `AttendanceSummary` interface
  - `ReportSlip` interface

---

## Phase 3: UI Component Removal & Updates

### 3.1 Remove Report Components

**Files to DELETE entirely:**
1. `/src/components/student/report-slip.tsx` - Complete report slip display component
2. `/src/hooks/use-report-slip.ts` - Report slip data fetching hook

### 3.2 Update Student Profile Component

**File**: `/src/components/student-profile.tsx`

**Changes:**
1. Remove "Reports" tab from navigation (Line ~50-60)
   - Keep tabs: Overview, Attendance, Performance, Social & Behaviour, Cases
   - Remove: Reports tab
2. Remove conduct grade badge from Overview tab
   - Remove `getConductColor()` function
   - Remove "Conduct Grade" card section
3. Update tab navigation logic to reflect 5 tabs instead of 6

### 3.3 Update Student List Component

**File**: `/src/components/classroom/student-list.tsx`

**Changes:**
1. Remove "Conduct grade" column from table
2. Remove `getConductColor()` function
3. Remove conduct grade from sort options
4. Update column definitions to remove conduct_grade field

### 3.4 Update Class Overview Component

**File**: `/src/components/classroom/class-overview.tsx`

**Changes:**
1. Remove "Conduct Grade" column from student table
2. Remove conduct badge styling logic
3. Remove conduct from sort options
4. Update student data mapping to exclude conduct_grade

### 3.5 Update School Dashboard

**File**: `/src/components/school-dashboard.tsx`

**Changes:**
1. Remove "View Full Reports" button (coming soon feature)
2. Remove "View Attendance Details" button if report-related
3. Remove "View Health Records" button if report-related
4. Update dashboard layout after button removal

### 3.6 Update Assistant Panel (PTM Feature)

**File**: `/src/components/assistant-panel.tsx`

**Changes:**
1. Remove conduct grade badge from PTMResponseContent component (lines ~235-245)
2. Keep priority badge, attendance rate, and student tags
3. Update concern areas to exclude conduct-related concerns
4. Update strengths to exclude conduct-related strengths
5. Remove conduct from student tags

**Note**: PTM `/ptm` command continues to work with simplified priority scoring (attendance + cases only)

---

## Phase 4: Server Actions & Query Functions Cleanup

### 4.1 Update PTM Server Actions

**File**: `/src/app/actions/ptm-actions.ts`

**Changes:**
1. Remove `conductGrade` field from PTMStudent enrichment
2. Remove conduct grade from default values (currently: `'Good'`)
3. Update `enrichStudentWithPTMData()` function to exclude conduct grade
4. Update PTM priority calculation to remove conduct grade weights

### 4.2 Update Query Functions

**File**: `/src/lib/supabase/queries.ts`

**Remove entirely:**
1. `getStudentReports()` function (lines 331-346)
2. `getReportWithComments()` function (lines 352-369)
3. `getReportsByTermAndStatus()` function (lines 375-393)

**Update:**
1. `getStudentFullProfile()` - Remove conduct_grade from select query
2. `getFormClassStudents()` - Remove conduct_grade from overview data

**File**: `/src/lib/queries/student-queries.ts`

**Changes:**
1. `fetchStudentProfile()` (lines 16-259):
   - Remove conduct_grade from overview mapping
   - Remove conduct grade from return object
2. `fetchStudentsInClass()` (lines 353-541):
   - Remove conduct_grade from batch query (line 425)
   - Remove conduct_grade from overview object mapping (lines 449, 501-509, 522)

---

## Phase 5: Utility Functions Cleanup

### 5.1 Update PTM Utilities

**File**: `/src/lib/utils/ptm-utils.ts`

**Remove entirely:**
1. `getConductBadgeColor()` function (lines 140-155)

**Update:**
1. `calculatePriorityScore()` (lines 26-63):
   - Remove conduct grade scoring logic (lines 54-59)
   - Remove `poorConduct` and `fairConduct` weight parameters
2. `getPriorityReasons()` (lines 83-113):
   - Remove conduct grade reason generation (lines 105-110)
3. `generateConcernAreas()` (lines 244-277):
   - Remove conduct from concern areas logic (lines 267-269)
4. `generateStrengths()` (lines 285-324):
   - Remove conduct from strengths logic (lines 301-302)
5. `generateStudentTags()` (lines 332-363):
   - Remove 'Conduct' tag generation (lines 349-350)

### 5.2 Remove Coming Soon Toast Utilities

**File**: `/src/lib/coming-soon-toast.ts`

**Changes:**
1. Remove `comingSoonToast.report()` function if it exists
2. Remove any report-related toast messages

---

## Phase 6: Hook & Mutation Cleanup

### 6.1 Remove Report Hooks

**Files to DELETE entirely:**
1. `/src/hooks/use-report-slip.ts` - Report slip data hook (already listed in Phase 3.1)

### 6.2 Update Student Profile Query Hook

**File**: `/src/hooks/queries/use-student-profile-query.ts`

**Changes:**
1. Remove conduct_grade from query selection
2. Remove conduct_grade from data mapping
3. Update TypeScript types to remove ConductGrade references

---

## Phase 7: Navigation & Routes Cleanup

### 7.1 Remove Report Routes (if any)

**Check for:**
- `/src/app/(routes)/reports/` directory - DELETE if exists
- Any route handlers in `/src/app/api/reports/` - DELETE if exists

### 7.2 Update Navigation Components

**Search for and update:**
- Any sidebar/menu items linking to reports
- Breadcrumb components mentioning reports
- Navigation guards or route configurations

---

## Phase 8: Dead Code Identification & Removal

### 8.1 Search for Orphaned Code

**Search patterns to check:**
1. `grep -r "ConductGrade" src/` - Find any remaining conduct grade references
2. `grep -r "conduct_grade" src/` - Find snake_case conduct grade references
3. `grep -r "conductGrade" src/` - Find camelCase conduct grade references
4. `grep -r "report" src/ --include="*.ts" --include="*.tsx"` - Find remaining report references
5. `grep -r "Report" src/ --include="*.ts" --include="*.tsx"` - Find PascalCase report references

### 8.2 Common Dead Code Locations

**Check these areas:**
1. Mock data files (`/src/lib/mock-data/`) - Remove conduct grades from mock student data
2. Test files - Remove tests for conduct grades and reports
3. Storybook stories - Remove stories for report components
4. Constants files - Remove conduct grade constants
5. Validation schemas - Remove Zod/Yup schemas for conduct grades

**Specific files to check:**
- `/src/lib/mock-data/eric-records.ts` - Remove report-related mock data

---

## Phase 9: Testing & Verification

### 9.1 Build Verification

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

### 9.2 Manual Testing Checklist

- [ ] Student profile page loads without errors
- [ ] Student list displays correctly without conduct column
- [ ] Class overview displays correctly without conduct column
- [ ] PTM functionality works without conduct grade prioritization
- [ ] No broken navigation links to reports
- [ ] Dashboard displays correctly without report buttons
- [ ] No TypeScript errors in console
- [ ] No runtime errors in console
- [ ] Database queries execute successfully

### 9.3 Database Verification

```sql
-- Verify conduct_grade column is removed
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'student_overview'
  AND column_name = 'conduct_grade';
-- Should return no rows

-- Verify reports tables are removed
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('reports', 'report_comments');
-- Should return no rows
```

---

## Phase 10: Documentation Updates

### 10.1 Update Agent Documentation

**File**: `.agent/System/database-schema.md` (if exists)
- Remove conduct_grade column documentation
- Remove reports and report_comments table documentation

**File**: `.agent/System/features.md` (if exists)
- Remove conduct grade feature documentation
- Remove report generation feature documentation

### 10.2 Update Project Documentation

**File**: `README.md` (if exists)
- Remove mentions of conduct grade tracking
- Remove mentions of report generation features

**File**: `CLAUDE.md` (if exists)
- No specific changes needed (contains general guidelines)

---

## Implementation Order

### Recommended Sequence

1. **Phase 8** - Dead Code Identification (run searches first)
2. **Phase 2** - Type Definitions Cleanup
3. **Phase 3** - UI Component Removal & Updates
4. **Phase 4** - Server Actions & Query Functions Cleanup
5. **Phase 5** - Utility Functions Cleanup
6. **Phase 6** - Hook & Mutation Cleanup
7. **Phase 7** - Navigation & Routes Cleanup
8. **Phase 1** - Database Schema Changes (run migrations)
9. **Phase 9** - Testing & Verification
10. **Phase 10** - Documentation Updates

**Rationale**: Start from UI/application layer and work down to database layer. This allows intermediate testing and reduces risk of breaking changes.

---

## Risk Assessment

### High Risk Areas

1. **PTM Priority Calculation** - Removing conduct grade scoring will change PTM student prioritization
2. **Student Profile Display** - May have hardcoded references to 6 tabs that need updating
3. **Type Imports** - Many files import ConductGrade type; must find and update all

### Mitigation Strategies

1. Run comprehensive grep searches before starting
2. Use TypeScript compiler to identify broken imports
3. Test PTM functionality thoroughly after changes
4. Create database migration backups before running
5. Use feature flags if gradual rollout is needed

---

## Rollback Plan

### If Issues Arise

1. **Database Level**: Create reverse migrations to add columns/tables back
2. **Code Level**: Git revert to previous commit
3. **Partial Rollback**: Use git to selectively restore specific files

### Backup Commands

```bash
# Create backup branch before starting
git checkout -b backup-before-removal

# If rollback needed
git checkout main
git reset --hard backup-before-removal
```

---

## File Summary

### Files to DELETE (8 files)
1. `/src/components/student/report-slip.tsx`
2. `/src/hooks/use-report-slip.ts`
3. `/src/app/(routes)/reports/*` (if exists)
4. `/src/app/api/reports/*` (if exists)

### Files to MODIFY (15+ files)

**Type Definitions (3 files):**
1. `/src/types/classroom.ts`
2. `/src/types/ptm.ts`
3. `/src/types/student-records.ts`

**UI Components (5 files):**
1. `/src/components/student-profile.tsx`
2. `/src/components/classroom/student-list.tsx`
3. `/src/components/classroom/class-overview.tsx`
4. `/src/components/school-dashboard.tsx`
5. `/src/components/assistant-panel.tsx` (PTM feature)

**Server & Queries (3 files):**
1. `/src/app/actions/ptm-actions.ts`
2. `/src/lib/supabase/queries.ts`
3. `/src/lib/queries/student-queries.ts`

**Utilities (1 file):**
1. `/src/lib/utils/ptm-utils.ts`

**Hooks (1 file):**
1. `/src/hooks/queries/use-student-profile-query.ts`

**Mock Data (1 file):**
1. `/src/lib/mock-data/eric-records.ts`

**Database Migrations (2 new files):**
1. Create: `/supabase/migrations/[timestamp]_remove_conduct_grade.sql`
2. Create: `/supabase/migrations/[timestamp]_remove_reports_system.sql`

### Files to REGENERATE (1 file)
1. `/src/types/database.ts` (auto-generate after migrations)

---

## Estimated Effort

- **Planning**: 2 hours ✅ (completed)
- **Implementation**: 6-8 hours
- **Testing**: 2-3 hours
- **Documentation**: 1 hour
- **Total**: 11-14 hours

---

## Questions for Review

1. ✅ **PTM Prioritization**: Remove conduct grade scoring entirely (Option A - Approved)
2. **Historical Data**: Should we preserve conduct grade data in archived/backup tables? → **Recommendation**: No need, can restore from git history if needed
3. **Migration Strategy**: Should we run migrations immediately or schedule for maintenance window? → **Recommendation**: Run immediately, low-risk changes
4. **Feature Flags**: Should we implement feature flags for gradual rollout? → **Recommendation**: Not needed, clean removal
5. **User Communication**: Do we need to notify users about feature removal? → **Recommendation**: Optional, features appear minimally used

---

## Next Steps

After plan approval:
1. Create feature branch: `remove-conduct-reports`
2. Run dead code searches (Phase 8)
3. Begin implementation starting with Phase 2
4. Create pull request with detailed changelist
5. Request code review
6. Deploy to staging for testing
7. Deploy to production after approval

---

**Document Version**: 1.1
**Created**: 2025-10-31
**Updated**: 2025-10-31
**Status**: ✅ Approved - Ready for Implementation
**Estimated Complexity**: High (database + UI + business logic)
**Decision**: Option A - Remove conduct grades from PTM prioritization entirely
