# Adding New Features - Standard Operating Procedure

**Last Updated**: October 23, 2025

## Overview

This SOP provides a comprehensive workflow for adding new features to the Teacher Guide system. Following these procedures ensures features are properly planned, implemented, tested, and documented while maintaining code quality and architecture consistency.

---

## Table of Contents

1. [Feature Development Workflow](#feature-development-workflow)
2. [Planning Phase](#planning-phase)
3. [Database Design](#database-design)
4. [Component Development](#component-development)
5. [Data Integration](#data-integration)
6. [Type Safety](#type-safety)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Code Review](#code-review)
10. [Deployment](#deployment)

---

## Feature Development Workflow

### Standard Process

```
1. Planning
   ├─ Write PRD/spec → .agent/Tasks/
   ├─ Review architecture
   └─ Define scope

2. Database Design
   ├─ Design schema
   ├─ Create migration
   ├─ Seed test data
   └─ Generate types

3. Component Development
   ├─ Create UI components
   ├─ Add routing
   ├─ Implement state management
   └─ Add error handling

4. Data Integration
   ├─ Write Supabase queries
   ├─ Create custom hooks
   ├─ Add data adapters
   └─ Test with real data

5. Testing
   ├─ Manual testing
   ├─ Edge cases
   ├─ Error scenarios
   └─ Type checking

6. Documentation
   ├─ Update .agent docs
   ├─ Add code comments
   ├─ Update README
   └─ Create summary

7. Code Review & Deploy
   ├─ Self-review
   ├─ Test build
   ├─ Commit changes
   └─ Deploy
```

---

## Planning Phase

### Step 1: Create Feature Specification

**Location**: `.agent/Tasks/<feature-name>.md`

**Template**:
```markdown
# Feature Name

## Overview
Brief description of the feature

## User Stories
- As a [user type], I want [goal] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Database Requirements
Tables and columns needed

## UI Components
List of components to create/modify

## API/Queries Needed
Functions to implement

## Dependencies
Related features or libraries

## Testing Plan
How to verify the feature works

## Implementation Notes
Technical considerations
```

**Example**: `.agent/Tasks/student-alerts-logic.md`

### Step 2: Review Existing Architecture

Read these documents before starting:
- [CURRENT_ARCHITECTURE.md](../System/CURRENT_ARCHITECTURE.md) - Current system state
- [DEVELOPMENT_GUIDE.md](../System/DEVELOPMENT_GUIDE.md) - Code patterns
- [SUPABASE_IMPLEMENTATION.md](../System/SUPABASE_IMPLEMENTATION.md) - Database schema

### Step 3: Define Scope

**Questions to answer**:
- Is this a new feature or enhancement?
- Does it require database changes?
- Which components need updates?
- Does it affect existing features?
- What's the estimated complexity?

---

## Database Design

### Step 1: Design Schema

**Process**:
1. Identify entities and relationships
2. Design tables with proper normalization
3. Plan indexes for performance
4. Define constraints and defaults
5. Consider RLS policies

**Example**:
```sql
-- New feature: Assignment Management

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_score INTEGER,
  weightage NUMERIC(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft, published, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'closed')),
  CONSTRAINT valid_weightage CHECK (weightage >= 0 AND weightage <= 100)
);

CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, submitted, graded, late
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_submission_status CHECK (status IN ('pending', 'submitted', 'graded', 'late')),
  UNIQUE (assignment_id, student_id)
);

-- Indexes
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);

-- Comments
COMMENT ON TABLE assignments IS 'Teacher-created assignments with due dates and grading';
COMMENT ON TABLE assignment_submissions IS 'Student submissions and grading for assignments';
```

### Step 2: Create Migration

Follow [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md) SOP:

```bash
# Create migration
supabase migration new create_assignments_table

# Edit file: supabase/migrations/YYYYMMDDHHMMSS_create_assignments_table.sql
# Add SQL from Step 1

# Test locally
supabase db reset

# Verify
supabase db psql
\dt  # Should see assignments and assignment_submissions
```

### Step 3: Seed Test Data

**Create seed migration**:
```bash
supabase migration new seed_assignments_data
```

**Example seed data**:
```sql
-- Seed assignments for testing
INSERT INTO assignments (id, class_id, teacher_id, title, description, due_date, max_score, status)
VALUES
  ('a1111111-1111-1111-1111-111111111111',
   'be7275c7-7b20-4e13-9dae-fb29ad9ba676',  -- Class 5A
   '550e8400-e29b-41d4-a716-446655440000',  -- Daniel Tan
   'Math Quiz 1',
   'Basic algebra and geometry',
   NOW() + INTERVAL '7 days',
   100,
   'published'),
  ('a2222222-2222-2222-2222-222222222222',
   'be7275c7-7b20-4e13-9dae-fb29ad9ba676',
   '550e8400-e29b-41d4-a716-446655440000',
   'Homework Assignment 3',
   'Complete exercises 1-20',
   NOW() + INTERVAL '3 days',
   50,
   'published')
ON CONFLICT (id) DO NOTHING;

-- Seed submissions
INSERT INTO assignment_submissions (assignment_id, student_id, status, submitted_at, score)
SELECT
  'a1111111-1111-1111-1111-111111111111',
  s.id,
  CASE
    WHEN random() < 0.7 THEN 'submitted'
    WHEN random() < 0.9 THEN 'graded'
    ELSE 'pending'
  END,
  CASE WHEN random() < 0.8 THEN NOW() - INTERVAL '2 days' ELSE NULL END,
  CASE WHEN random() < 0.5 THEN (random() * 100)::NUMERIC(5,2) ELSE NULL END
FROM students s
WHERE s.id IN (
  SELECT student_id FROM student_classes WHERE class_id = 'be7275c7-7b20-4e13-9dae-fb29ad9ba676'
)
ON CONFLICT (assignment_id, student_id) DO NOTHING;
```

### Step 4: Generate TypeScript Types

```bash
# Generate types from new schema
npx supabase gen types typescript --local > src/types/database.ts

# Verify no errors
npx tsc --noEmit
```

---

## Component Development

### Step 1: Create UI Components

**Location**: `src/components/<feature>/`

**File Structure**:
```
src/components/assignments/
├── assignment-list.tsx       # List view
├── assignment-card.tsx       # Individual card
├── assignment-form.tsx       # Create/edit form
├── submission-table.tsx      # Student submissions
└── grading-panel.tsx         # Grading interface
```

**Component Template**:
```tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AssignmentListProps {
  classId: string
}

export function AssignmentList({ classId }: AssignmentListProps) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  // TODO: Add data fetching logic

  if (loading) {
    return <Skeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assignments</h2>
        <Button>Create Assignment</Button>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  )
}
```

**Best Practices**:
- ✅ Use TypeScript interfaces for props
- ✅ Add loading/error/empty states
- ✅ Follow existing component patterns
- ✅ Use shadcn/ui components
- ✅ Implement keyboard navigation
- ✅ Add accessibility attributes

### Step 2: Add to Routing

**Update main page** (`src/app/[[...slug]]/page.tsx`):

```tsx
// Add to routing logic
if (segments[0] === 'classroom' && segments[2] === 'assignments') {
  const classId = segments[1]
  return <AssignmentList classId={classId} />
}
```

**Update navigation** (if needed):
```tsx
// Add to classroom sidebar or quick actions
<Button onClick={() => router.push(`/classroom/${classId}/assignments`)}>
  Assignments
</Button>
```

### Step 3: Implement State Management

**Use SWR for data fetching**:
```typescript
import useSWR from 'swr'
import { getAssignments } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'

export function useAssignments(classId: string) {
  return useSWR(
    classId ? `assignments-${classId}` : null,
    async () => {
      const supabase = createClient()
      const { data, error } = await getAssignments(supabase, classId)
      if (error) throw error
      return data
    },
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: true,
    }
  )
}
```

**Use Context for global state** (if needed):
```typescript
// src/contexts/assignment-context.tsx
'use client'

import { createContext, useContext, useState } from 'react'

interface AssignmentContextType {
  selectedAssignment: Assignment | null
  setSelectedAssignment: (assignment: Assignment | null) => void
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined)

export function AssignmentProvider({ children }: { children: React.ReactNode }) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  return (
    <AssignmentContext.Provider value={{ selectedAssignment, setSelectedAssignment }}>
      {children}
    </AssignmentContext.Provider>
  )
}

export function useAssignmentContext() {
  const context = useContext(AssignmentContext)
  if (!context) throw new Error('useAssignmentContext must be used within AssignmentProvider')
  return context
}
```

---

## Data Integration

### Step 1: Write Supabase Query Functions

**Location**: `src/lib/supabase/queries.ts`

**Template**:
```typescript
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type Assignment = Database['public']['Tables']['assignments']['Row']
type Submission = Database['public']['Tables']['assignment_submissions']['Row']

/**
 * Get all assignments for a class
 */
export async function getAssignments(
  supabase: SupabaseClient<Database>,
  classId: string
) {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      teacher:teachers(name, email)
    `)
    .eq('class_id', classId)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching assignments:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Get assignment with submissions
 */
export async function getAssignmentWithSubmissions(
  supabase: SupabaseClient<Database>,
  assignmentId: string
) {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      submissions:assignment_submissions(
        *,
        student:students(id, name, student_id)
      )
    `)
    .eq('id', assignmentId)
    .single()

  if (error) {
    console.error('Error fetching assignment:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Create new assignment
 */
export async function createAssignment(
  supabase: SupabaseClient<Database>,
  assignment: Database['public']['Tables']['assignments']['Insert']
) {
  const { data, error } = await supabase
    .from('assignments')
    .insert(assignment)
    .select()
    .single()

  if (error) {
    console.error('Error creating assignment:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Update assignment
 */
export async function updateAssignment(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database['public']['Tables']['assignments']['Update']
) {
  const { data, error } = await supabase
    .from('assignments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating assignment:', error)
    return { data: null, error }
  }

  return { data, error: null }
}
```

**Best Practices**:
- ✅ Use TypeScript types from Database
- ✅ Add JSDoc comments
- ✅ Return `{ data, error }` pattern
- ✅ Use `.select()` for relations
- ✅ Add error logging
- ✅ Use `.single()` for single results
- ✅ Handle null cases

### Step 2: Create Custom Hooks

**Location**: `src/hooks/use-assignments.ts`

```typescript
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { getAssignments, getAssignmentWithSubmissions } from '@/lib/supabase/queries'

export function useAssignments(classId: string) {
  return useSWR(
    classId ? `assignments-${classId}` : null,
    async () => {
      const supabase = createClient()
      const { data, error } = await getAssignments(supabase, classId)
      if (error) throw error
      return data
    },
    {
      refreshInterval: 300000,
      revalidateOnFocus: true,
      revalidateOnMount: true,
    }
  )
}

export function useAssignmentDetails(assignmentId: string) {
  return useSWR(
    assignmentId ? `assignment-details-${assignmentId}` : null,
    async () => {
      const supabase = createClient()
      const { data, error } = await getAssignmentWithSubmissions(supabase, assignmentId)
      if (error) throw error
      return data
    }
  )
}
```

### Step 3: Add Data Adapters (if needed)

**Location**: `src/lib/supabase/adapters.ts`

```typescript
import type { Database } from '@/types/database'
import type { Assignment } from '@/types/classroom'

type DbAssignment = Database['public']['Tables']['assignments']['Row']

/**
 * Convert database assignment to UI assignment type
 */
export function mapAssignmentToUI(dbAssignment: DbAssignment): Assignment {
  return {
    id: dbAssignment.id,
    title: dbAssignment.title,
    description: dbAssignment.description || '',
    dueDate: new Date(dbAssignment.due_date),
    maxScore: dbAssignment.max_score || 100,
    weightage: Number(dbAssignment.weightage) || 0,
    status: dbAssignment.status as Assignment['status'],
    // ... additional transformations
  }
}
```

---

## Type Safety

### Step 1: Define Application Types

**Location**: `src/types/classroom.ts` (or create new type file)

```typescript
// Application-level types (different from database types)
export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: Date  // Note: Database has string, we convert to Date
  maxScore: number
  weightage: number
  status: 'draft' | 'published' | 'closed'
  submissionCount?: number
  gradedCount?: number
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  submittedAt: Date | null
  score: number | null
  status: 'pending' | 'submitted' | 'graded' | 'late'
  feedback: string | null
}

export interface AssignmentFormData {
  title: string
  description: string
  dueDate: string  // Form uses ISO string
  maxScore: number
  weightage: number
}
```

### Step 2: Use Types in Components

```typescript
import type { Assignment, AssignmentSubmission } from '@/types/classroom'

interface AssignmentCardProps {
  assignment: Assignment
  onEdit: (assignment: Assignment) => void
  onDelete: (id: string) => void
}

export function AssignmentCard({ assignment, onEdit, onDelete }: AssignmentCardProps) {
  // TypeScript will now catch errors
  return (
    <Card>
      <CardHeader>
        <CardTitle>{assignment.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Due: {assignment.dueDate.toLocaleDateString()}</p>
        {/* ... */}
      </CardContent>
    </Card>
  )
}
```

### Step 3: Type-Check Before Committing

```bash
# Run type checker
npx tsc --noEmit

# Should see 0 errors
```

---

## Testing

### Step 1: Manual Testing Checklist

- [ ] Component renders without errors
- [ ] Loading states display correctly
- [ ] Error states handled gracefully
- [ ] Empty states show appropriate message
- [ ] Data fetches and displays correctly
- [ ] Forms validate input
- [ ] Form submission works
- [ ] Data updates in real-time
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Screen reader accessible

### Step 2: Test Edge Cases

- [ ] No data (empty state)
- [ ] Large data sets (100+ items)
- [ ] Network errors (offline mode)
- [ ] Slow network (loading states)
- [ ] Invalid data
- [ ] Duplicate submissions
- [ ] Concurrent updates

### Step 3: Test Error Scenarios

```typescript
// Simulate errors for testing
const { data, error } = useSWR(
  'assignments',
  async () => {
    // Uncomment to test error
    // throw new Error('Database connection failed')
    return await getAssignments(supabase, classId)
  }
)

if (error) {
  return <ErrorDisplay error={error} />
}
```

### Step 4: Verify Build

```bash
# Test production build
npm run build

# Should succeed with no errors
# Check for warnings and fix if needed
```

---

## Documentation

### Step 1: Update .agent Documentation

**Create implementation summary**: `.agent/Archive/<feature-name>-summary.md`

```markdown
# Assignment Management Implementation Summary

**Completed:** October 23, 2025

## Overview
Implemented full assignment management system for teachers to create, track, and grade student assignments.

## What Was Implemented

### Database
- Created `assignments` table
- Created `assignment_submissions` table
- Added indexes for performance
- Seeded test data

### Components
- `assignment-list.tsx` - Assignment list view
- `assignment-form.tsx` - Create/edit form
- `submission-table.tsx` - Student submissions
- `grading-panel.tsx` - Grading interface

### Data Layer
- 4 query functions in `queries.ts`
- 2 custom hooks
- Data adapters for type conversion

### Features
- Create/edit/delete assignments
- Track student submissions
- Grade submissions with feedback
- View statistics (submitted vs pending)
- Filter by status
- Sort by due date

## Files Changed
- Created: `src/components/assignments/` (4 files)
- Modified: `src/app/[[...slug]]/page.tsx` (routing)
- Modified: `src/lib/supabase/queries.ts` (+100 lines)
- Created: `src/hooks/use-assignments.ts`
- Created: `supabase/migrations/YYYYMMDD_create_assignments.sql`

## Testing
- Manual testing: ✅ Passed
- Type checking: ✅ No errors
- Build: ✅ Success

## Known Issues
None

## Future Enhancements
- Bulk grading
- File attachments
- Assignment templates
- Auto-grading for MCQ
```

**Update CURRENT_ARCHITECTURE.md**:
- Add new components to component list
- Add new database tables
- Update implementation status
- Add new hooks

### Step 2: Add Code Comments

```typescript
/**
 * Assignment management component for teachers
 *
 * Allows teachers to:
 * - Create and edit assignments
 * - Track student submissions
 * - Grade submissions
 * - View assignment statistics
 *
 * @param classId - The UUID of the class
 */
export function AssignmentList({ classId }: AssignmentListProps) {
  // ... implementation
}
```

### Step 3: Update README (if needed)

For major features, add to project README:
- New feature description
- How to use
- Screenshots (optional)

---

## Code Review

### Self-Review Checklist

- [ ] Code follows project conventions
- [ ] No console.logs or debug code
- [ ] Proper error handling
- [ ] TypeScript types used correctly
- [ ] Components are accessible
- [ ] Responsive design
- [ ] Performance optimized (memoization, lazy loading)
- [ ] No hardcoded values (use constants)
- [ ] Proper naming (clear, consistent)
- [ ] Comments for complex logic
- [ ] No ESLint errors
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Feature tested manually

### Code Quality

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Format code (if configured)
npm run format

# Test build
npm run build
```

---

## Deployment

### Step 1: Commit Changes

```bash
# Stage files
git add .

# Create descriptive commit
git commit -m "feat: Add assignment management system

- Create assignments table and submissions table
- Add assignment list, form, and grading components
- Implement assignment queries and hooks
- Add routing and navigation
- Update documentation

Refs: #123"

# Push to branch
git push origin feature/assignment-management
```

### Step 2: Deploy Migration to Production

Follow [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md):

```bash
# Link to production
supabase link --project-ref your-project-ref

# Push migration
supabase db push

# Verify in Supabase dashboard
```

### Step 3: Deploy Application

```bash
# Production build
npm run build

# Push to main (triggers Vercel deployment)
git push origin main

# Or create PR for review
gh pr create --title "Add assignment management" --body "..."
```

### Step 4: Verify in Production

- [ ] Navigate to new feature
- [ ] Test basic functionality
- [ ] Check for console errors
- [ ] Verify data loads correctly
- [ ] Test on mobile device

---

## Quick Reference

### Feature Development Checklist

**Planning**:
- [ ] Create spec in `.agent/Tasks/`
- [ ] Review architecture docs
- [ ] Define scope and dependencies

**Database**:
- [ ] Design schema
- [ ] Create migration
- [ ] Seed test data
- [ ] Generate TypeScript types

**Components**:
- [ ] Create UI components
- [ ] Add to routing
- [ ] Implement state management
- [ ] Add loading/error states

**Data**:
- [ ] Write query functions
- [ ] Create custom hooks
- [ ] Add data adapters
- [ ] Test with real data

**Quality**:
- [ ] Add TypeScript types
- [ ] Write code comments
- [ ] Lint and type-check
- [ ] Manual testing
- [ ] Test build

**Documentation**:
- [ ] Create implementation summary
- [ ] Update CURRENT_ARCHITECTURE.md
- [ ] Update related docs

**Deploy**:
- [ ] Commit with clear message
- [ ] Push migration to production
- [ ] Deploy application
- [ ] Verify in production

---

## Related Documentation

- [CURRENT_ARCHITECTURE.md](../System/CURRENT_ARCHITECTURE.md) - System overview
- [DEVELOPMENT_GUIDE.md](../System/DEVELOPMENT_GUIDE.md) - Code patterns
- [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md) - Migration procedures
- [SUPABASE_IMPLEMENTATION.md](../System/SUPABASE_IMPLEMENTATION.md) - Database schema
- [TESTING.md](./TESTING.md) - Testing guidelines

---

**Maintained by**: Development Team
**Next Review**: When major architectural changes are planned
