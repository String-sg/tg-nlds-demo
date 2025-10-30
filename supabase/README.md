# Supabase Database

This directory contains the Supabase database configuration and migrations for the MOE Teacher-Student Management System.

## 📁 Structure

```
supabase/
├── migrations/          # Database migration files
│   ├── 20250110000000_create_core_tables.sql
│   ├── 20250110000001_create_guardian_student_tables.sql
│   ├── 20250110000002_create_student_data_tables.sql
│   ├── 20250110000003_create_social_behaviour_tables.sql
│   ├── 20250110000004_create_cases_system.sql
│   ├── 20250110000005_create_reports_system.sql
│   └── 20250110000006_create_rls_policies.sql
├── config.toml         # Supabase configuration
├── SETUP.md           # Detailed setup instructions
└── README.md          # This file
```

## 🗄️ Database Schema

### 19 Tables in Total

**Core (3 tables)**
- `teachers` - Teacher accounts
- `classes` - Subject/Form/CCA classes
- `teacher_classes` - Teacher-class assignments

**Guardians & Students (4 tables)**
- `parents_guardians` - Parent/guardian contact info
- `students` - Student records
- `student_guardians` - Student-guardian relationships (1 primary + multiple additional)
- `student_classes` - Student enrollments

**Student Data (6 tables)**
- `student_overview` - Background, health, family, SWAN info
- `student_private_notes` - Teacher notes (multi-teacher, audit trail)
- `attendance` - Daily/CCA/event attendance
- `academic_results` - Test scores, grades, assessments
- `physical_fitness` - NAPFA, PE assessments
- `cce_results` - Character, Citizenship, Education per term

**Social & Behaviour (2 tables)**
- `friend_relationships` - Student friendships
- `behaviour_observations` - Teacher observations

**Cases (2 tables)**
- `cases` - Discipline, SEN, counselling, career guidance cases
- `case_issues` - Multiple issues/incidents per case

**Reports (2 tables)**
- `reports` - HDP reports with approval workflow
- `report_comments` - Review/approval comments

## 🔒 Security

All tables have **Row Level Security (RLS)** enabled:

- **Regular Teachers**: View/edit students in assigned classes only
- **Form Teachers**: Full access to their form class students
- **Private Notes**: Teachers see own notes; form teachers see all for their students

Helper functions:
- `teacher_has_access_to_student(teacher_uuid, student_uuid)`
- `teacher_is_form_teacher(teacher_uuid, student_uuid)`

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed instructions.

**TL;DR:**

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Add credentials to `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```
3. Run migrations:
   ```bash
   npx supabase db push
   ```

## 📝 Creating New Migrations

```bash
# Generate new migration file
npx supabase migration new your_migration_name

# Edit the generated file in supabase/migrations/
# Then push to database:
npx supabase db push
```

## 🔄 Updating TypeScript Types

After schema changes:

```bash
npx supabase gen types typescript --project-id your-project-ref > src/types/database.ts
```

## 📚 Usage

### Server Component
```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await supabase.from('students').select('*')
```

### Client Component
```tsx
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase.from('students').select('*')
```

### Helper Queries
```tsx
import { getStudentWithGuardians } from '@/lib/supabase/queries'

const { data } = await getStudentWithGuardians(supabase, studentId)
```

## 🛠️ Troubleshooting

**Migration Errors:**
```bash
npx supabase migration list
npx supabase migration repair
```

**RLS Issues:**
- Verify user is authenticated
- Check user UUID matches teacher ID
- Review policies in Supabase Dashboard

**Type Mismatches:**
```bash
npx supabase gen types typescript --local > src/types/database.ts
```

## 📖 Resources

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Supabase Docs](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
