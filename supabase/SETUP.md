# Supabase Setup Guide

This guide explains how to set up and deploy the Supabase database for the MOE Teacher-Student Management System.

## Prerequisites

- Supabase account (create at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Supabase CLI installed (already in devDependencies)

## Quick Start

### 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Note down:
   - Project URL (API URL)
   - Anon/Public key
   - Service Role key (keep secret!)

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Link Your Project (Optional - for local development)

```bash
# Login to Supabase CLI
npx supabase login

# Link to your remote project
npx supabase link --project-ref your-project-ref

# Or start local Supabase (requires Docker)
npx supabase start
```

### 4. Run Migrations

**Option A: Push to Remote Supabase**

```bash
# Push all migrations to your remote Supabase project
npx supabase db push
```

**Option B: Run Locally (if using local Supabase)**

```bash
# Migrations are automatically applied when you run:
npx supabase start

# Or reset and reapply:
npx supabase db reset
```

**Option C: Manual SQL Execution**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `20250110000000_create_core_tables.sql`
   - `20250110000001_create_guardian_student_tables.sql`
   - `20250110000002_create_student_data_tables.sql`
   - `20250110000003_create_social_behaviour_tables.sql`
   - `20250110000004_create_cases_system.sql`
   - `20250110000005_create_reports_system.sql`
   - `20250110000006_create_rls_policies.sql`

### 5. Verify Migrations

Check that all tables were created:

```bash
# If using local Supabase
npx supabase db diff

# Or check in Supabase Dashboard → Table Editor
```

You should see these tables:
- Core: `teachers`, `classes`, `teacher_classes`
- Guardians/Students: `parents_guardians`, `students`, `student_guardians`, `student_classes`
- Student Data: `student_overview`, `student_private_notes`, `attendance`, `academic_results`, `physical_fitness`, `cce_results`
- Social: `friend_relationships`, `behaviour_observations`
- Cases: `cases`, `case_issues`
- Reports: `reports`, `report_comments`

**Total: 19 tables**

## Database Schema Overview

### Core Tables (Teacher & Classes)
```
teachers ──┐
           ├── teacher_classes ── classes
students ──┘
```

### Student & Guardian Relationships
```
parents_guardians ──┐
                    ├── student_guardians ── students ── form_teacher (teachers)
                    └── primary_guardian (students)
```

### Student Data
```
students ──┬── student_overview
           ├── student_private_notes (teachers can add notes)
           ├── attendance
           ├── academic_results
           ├── physical_fitness
           ├── cce_results
           ├── friend_relationships
           └── behaviour_observations
```

### Cases System
```
students ── cases ── case_issues
```

### Reports System
```
students ── reports ── report_comments
```

## Row Level Security (RLS)

All tables have RLS enabled with these rules:

### Teacher Access
- **Regular Teacher**: Can view/edit students in their assigned classes only
- **Form Teacher**: Full access to their form class students (all data, all tabs)
- **Private Notes**: Teachers see only their own notes, Form teachers see all notes for their students

### Key Helper Functions
- `teacher_has_access_to_student(teacher_uuid, student_uuid)` - Check if teacher teaches student
- `teacher_is_form_teacher(teacher_uuid, student_uuid)` - Check if teacher is form teacher

## Next Steps

### 1. Seed Data (Optional)

You can create a seed file to populate initial data:

```bash
# Create seed file
touch supabase/seed.sql
```

Example seed data:
```sql
-- Insert a test teacher
INSERT INTO teachers (id, name, email, department)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Daniel Tan', 'daniel.tan@school.edu.sg', 'Mathematics');

-- Insert a test class
INSERT INTO classes (id, name, type, year_level, academic_year)
VALUES
  ('22222222-2222-2222-2222-222222222222', '5A', 'form', '5', '2025');

-- Link teacher to class as form teacher
INSERT INTO teacher_classes (teacher_id, class_id, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'form_teacher');
```

Run seed:
```bash
npx supabase db seed
```

### 2. Enable Authentication

Configure Supabase Auth:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email authentication (or other providers)
3. Configure redirect URLs in Authentication → URL Configuration
4. Add your app URL: `http://localhost:3000`

### 3. Generate TypeScript Types (Auto-update)

If you make schema changes later:

```bash
# Generate updated types
npx supabase gen types typescript --local > src/types/database.ts

# Or from remote:
npx supabase gen types typescript --project-id your-project-ref > src/types/database.ts
```

## Usage in Your App

### Server Component Example

```tsx
import { createClient } from '@/lib/supabase/server'
import { getStudentWithGuardians } from '@/lib/supabase/queries'

export default async function StudentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: student } = await getStudentWithGuardians(supabase, params.id)

  return <div>{student?.name}</div>
}
```

### Client Component Example

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function StudentList() {
  const [students, setStudents] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchStudents() {
      const { data } = await supabase.from('students').select('*')
      setStudents(data || [])
    }
    fetchStudents()
  }, [])

  return <ul>{students.map(s => <li key={s.id}>{s.name}</li>)}</ul>
}
```

### Server Action Example

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { createPrivateNote } from '@/lib/supabase/queries'

export async function addPrivateNote(studentId: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await createPrivateNote(supabase, studentId, note, user.id)

  if (error) throw error
  return data
}
```

## Troubleshooting

### Migration Errors

```bash
# Check migration status
npx supabase migration list

# Repair migrations (if needed)
npx supabase migration repair
```

### RLS Policy Issues

If you get permission errors:
1. Check if RLS is enabled on the table
2. Verify user is authenticated: `supabase.auth.getUser()`
3. Check if user's UUID matches teacher ID in database
4. Review policies in Supabase Dashboard → Authentication → Policies

### Type Mismatches

If TypeScript types don't match database:
```bash
# Regenerate types
npx supabase gen types typescript --project-id your-project-ref > src/types/database.ts
```

## Migration from Dummy Data

To migrate existing mock data, see [migrations/migrate-dummy-data.ts](./migrations/migrate-dummy-data.ts) (coming next).

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
