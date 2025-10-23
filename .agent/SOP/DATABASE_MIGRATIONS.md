# Database Migrations - Standard Operating Procedure

**Last Updated**: October 23, 2025

## Overview

This SOP provides step-by-step instructions for creating, testing, and applying database migrations using Supabase. Following these procedures ensures database schema changes are safe, reversible, and properly documented.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Workflow](#migration-workflow)
3. [Creating Migrations](#creating-migrations)
4. [Testing Migrations](#testing-migrations)
5. [Applying Migrations](#applying-migrations)
6. [Rolling Back Migrations](#rolling-back-migrations)
7. [Naming Conventions](#naming-conventions)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- Supabase CLI installed (`npm install -g supabase`)
- Docker Desktop running (for local Supabase)
- Project linked to Supabase (`supabase link`)
- Access to Supabase project dashboard

### Environment Setup
```bash
# Check Supabase CLI version
supabase --version

# Verify project link
supabase status

# Ensure local database is running
supabase start
```

---

## Migration Workflow

### Standard Process

```
1. Create migration file
   ↓
2. Write SQL (DDL statements)
   ↓
3. Test locally
   ↓
4. Review changes
   ↓
5. Update TypeScript types
   ↓
6. Apply to staging/production
   ↓
7. Verify deployment
   ↓
8. Update documentation
```

---

## Creating Migrations

### Method 1: Using Supabase CLI (Recommended)

```bash
# Create new migration with descriptive name
supabase migration new add_student_notes_table

# This creates: supabase/migrations/YYYYMMDDHHMMSS_add_student_notes_table.sql
```

### Method 2: Manual Creation

```bash
# Create file manually with timestamp
touch supabase/migrations/20250123120000_add_attendance_reasons.sql
```

### File Naming Format

```
YYYYMMDDHHMMSS_descriptive_name.sql

Examples:
20250123120000_add_student_notes_table.sql
20250123120100_add_email_to_teachers.sql
20250123120200_create_messages_table.sql
```

**Rules**:
- Always use UTC timestamp
- Use underscores (not hyphens or spaces)
- Be descriptive but concise
- Use verbs: `add`, `create`, `modify`, `remove`, `seed`

---

## Testing Migrations

### Step 1: Apply to Local Database

```bash
# Start local Supabase (if not running)
supabase start

# Apply new migration
supabase db reset
# OR apply specific migration
supabase migration up
```

### Step 2: Verify Schema Changes

```bash
# Check table structure
supabase db inspect

# Or use psql
supabase db psql
\dt  # List tables
\d tablename  # Describe table
```

### Step 3: Test with Sample Data

```sql
-- Insert test data
INSERT INTO student_notes (student_id, teacher_id, note, visibility)
VALUES ('test-id', 'teacher-id', 'Test note', 'private');

-- Query to verify
SELECT * FROM student_notes;

-- Cleanup
DELETE FROM student_notes WHERE student_id = 'test-id';
```

### Step 4: Update TypeScript Types

```bash
# Generate new types from schema
npx supabase gen types typescript --local > src/types/database.ts
```

### Step 5: Test in Application

1. Start dev server: `npm run dev`
2. Test affected features
3. Verify queries work with new schema
4. Check for type errors

---

## Applying Migrations

### To Local Development

```bash
# Reset database (applies all migrations)
supabase db reset

# Or apply pending migrations only
supabase migration up
```

### To Remote (Staging/Production)

#### Option 1: Via CLI (Recommended)

```bash
# Link to remote project
supabase link --project-ref your-project-ref

# Push migration
supabase db push

# Verify
supabase db remote commit
```

#### Option 2: Via Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy migration SQL
3. Review carefully
4. Click "Run"
5. Verify in Table Editor

#### Option 3: Via Migration Upload

1. Go to Database → Migrations tab
2. Click "Upload migration"
3. Select `.sql` file
4. Review preview
5. Click "Apply"

---

## Rolling Back Migrations

### ⚠️ Warning
Supabase doesn't have automatic rollback. You must create a reverse migration.

### Step 1: Create Rollback Migration

```bash
supabase migration new rollback_add_student_notes_table
```

### Step 2: Write Reverse SQL

```sql
-- Original migration: created table
CREATE TABLE student_notes (...);

-- Rollback migration: drop table
DROP TABLE IF EXISTS student_notes CASCADE;
```

### Step 3: Apply Rollback

```bash
# Local
supabase db reset

# Remote
supabase db push
```

### Best Practice: Include Rollback Instructions

```sql
-- Migration: add_email_to_teachers.sql
-- Rollback: DROP COLUMN email from teachers table

ALTER TABLE teachers ADD COLUMN email TEXT;
```

---

## Naming Conventions

### Migration Prefixes

| Prefix | Purpose | Example |
|--------|---------|---------|
| `create_` | New table | `create_messages_table` |
| `add_` | Add column/constraint | `add_email_to_teachers` |
| `modify_` | Change column type | `modify_student_id_to_uuid` |
| `remove_` | Drop column | `remove_deprecated_fields` |
| `rename_` | Rename table/column | `rename_class_to_classes` |
| `seed_` | Add initial data | `seed_teachers` |
| `update_` | Modify data | `update_student_statuses` |
| `fix_` | Bug fix | `fix_duplicate_students` |

### Table Naming

- **Plural nouns**: `students`, `teachers`, `classes`
- **Snake case**: `student_classes`, `teacher_classes`
- **Relationship tables**: `{entity1}_{entity2}` (e.g., `student_guardians`)

### Column Naming

- **Snake case**: `first_name`, `created_at`, `is_active`
- **Foreign keys**: `{table}_id` (e.g., `student_id`, `class_id`)
- **Booleans**: `is_` or `has_` prefix (e.g., `is_form_teacher`, `has_sen`)
- **Timestamps**: `created_at`, `updated_at`, `deleted_at`

---

## Best Practices

### 1. One Logical Change Per Migration

✅ **Good**:
```sql
-- 20250123120000_add_student_email.sql
ALTER TABLE students ADD COLUMN email TEXT;
ALTER TABLE students ADD CONSTRAINT email_format CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');
```

❌ **Bad**:
```sql
-- 20250123120000_various_changes.sql
ALTER TABLE students ADD COLUMN email TEXT;
CREATE TABLE messages (...);
ALTER TABLE teachers ADD COLUMN phone TEXT;
```

### 2. Always Use IF EXISTS / IF NOT EXISTS

```sql
-- Safe table creation
CREATE TABLE IF NOT EXISTS student_notes (...);

-- Safe column addition
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teachers' AND column_name = 'email'
  ) THEN
    ALTER TABLE teachers ADD COLUMN email TEXT;
  END IF;
END$$;
```

### 3. Add Indexes for Foreign Keys

```sql
CREATE TABLE student_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  class_id UUID REFERENCES classes(id)
);

-- Add indexes for performance
CREATE INDEX idx_student_classes_student_id ON student_classes(student_id);
CREATE INDEX idx_student_classes_class_id ON student_classes(class_id);
```

### 4. Include Comments

```sql
COMMENT ON TABLE student_notes IS 'Private teacher notes about students with audit trail';
COMMENT ON COLUMN student_notes.visibility IS 'Determines who can view this note: private, form_teacher, all_teachers';
```

### 5. Set Default Values

```sql
ALTER TABLE students
ADD COLUMN status TEXT DEFAULT 'active',
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
```

### 6. Test with Real Data Volumes

```sql
-- Don't just test with 1 row
-- Seed realistic data volumes
INSERT INTO students (name, ...)
SELECT
  'Student ' || generate_series AS name,
  ...
FROM generate_series(1, 100);
```

### 7. Use Transactions

```sql
BEGIN;

-- All migration statements
CREATE TABLE messages (...);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- If any statement fails, all roll back
COMMIT;
```

---

## Common Patterns

### Pattern 1: Add Column with Backfill

```sql
-- Step 1: Add column (nullable)
ALTER TABLE students ADD COLUMN email TEXT;

-- Step 2: Backfill data
UPDATE students
SET email = student_id || '@example.com'
WHERE email IS NULL;

-- Step 3: Add constraint
ALTER TABLE students ALTER COLUMN email SET NOT NULL;
```

### Pattern 2: Create Table with Relationships

```sql
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_student_notes_student ON student_notes(student_id);
CREATE INDEX idx_student_notes_teacher ON student_notes(teacher_id);
CREATE INDEX idx_student_notes_created ON student_notes(created_at DESC);

-- Comments
COMMENT ON TABLE student_notes IS 'Teacher notes about students with privacy controls';
```

### Pattern 3: Rename Column Safely

```sql
-- Step 1: Add new column
ALTER TABLE students ADD COLUMN full_name TEXT;

-- Step 2: Backfill
UPDATE students SET full_name = name;

-- Step 3: Make NOT NULL
ALTER TABLE students ALTER COLUMN full_name SET NOT NULL;

-- Step 4: Drop old column (in next migration after verification)
-- ALTER TABLE students DROP COLUMN name;
```

### Pattern 4: Modify Column Type

```sql
-- Step 1: Add new column with new type
ALTER TABLE students ADD COLUMN student_id_new UUID DEFAULT uuid_generate_v4();

-- Step 2: Copy data (with transformation if needed)
UPDATE students SET student_id_new = student_id::UUID;

-- Step 3: Drop old, rename new
ALTER TABLE students DROP COLUMN student_id;
ALTER TABLE students RENAME COLUMN student_id_new TO student_id;
```

### Pattern 5: Seed Data

```sql
-- Insert test teachers
INSERT INTO teachers (id, name, email, department)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Daniel Tan', 'daniel.tan@school.edu.sg', 'Mathematics'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Lee', 'sarah.lee@school.edu.sg', 'English')
ON CONFLICT (id) DO NOTHING;  -- Idempotent
```

---

## Troubleshooting

### Issue 1: Migration Fails Locally

**Symptom**: `supabase db reset` fails

**Solution**:
```bash
# Check migration file syntax
cat supabase/migrations/XXXXXX_filename.sql

# Review error message
supabase db reset --debug

# Test SQL directly
supabase db psql
\i supabase/migrations/XXXXXX_filename.sql
```

### Issue 2: Type Generation Fails

**Symptom**: `gen types typescript` produces errors

**Solution**:
```bash
# Ensure schema is valid
supabase db lint

# Reset and regenerate
supabase db reset
npx supabase gen types typescript --local > src/types/database.ts

# Check for syntax errors in generated file
npx tsc --noEmit
```

### Issue 3: Remote Migration Fails

**Symptom**: Dashboard shows migration error

**Solution**:
1. Check Supabase logs in Dashboard
2. Verify schema compatibility
3. Test locally first
4. Create rollback migration if needed

### Issue 4: Duplicate Migration Timestamps

**Symptom**: Two migrations have same timestamp

**Solution**:
```bash
# Manually increment timestamp
mv supabase/migrations/20250123120000_file1.sql \
   supabase/migrations/20250123120001_file1.sql
```

### Issue 5: Cannot Drop Table (Foreign Key Constraints)

**Symptom**: `ERROR: cannot drop table X because other objects depend on it`

**Solution**:
```sql
-- Use CASCADE to drop dependencies
DROP TABLE student_notes CASCADE;

-- Or drop constraints first
ALTER TABLE student_classes DROP CONSTRAINT fk_student_id;
DROP TABLE students;
```

---

## Checklist

Before applying a migration, verify:

- [ ] Migration has clear, descriptive name
- [ ] SQL syntax is valid (tested locally)
- [ ] Uses `IF EXISTS` / `IF NOT EXISTS` where appropriate
- [ ] Includes indexes for foreign keys
- [ ] Has default values for new columns
- [ ] Includes comments for complex logic
- [ ] Tested with realistic data
- [ ] TypeScript types regenerated
- [ ] Application tested with new schema
- [ ] No hardcoded IDs or sensitive data
- [ ] Rollback plan documented
- [ ] Team notified of schema changes

---

## Quick Reference

### Common Commands

```bash
# Create migration
supabase migration new <name>

# Apply all migrations locally
supabase db reset

# Apply pending migrations
supabase migration up

# Generate TypeScript types
npx supabase gen types typescript --local > src/types/database.ts

# Push to remote
supabase db push

# Inspect schema
supabase db inspect

# Connect to database
supabase db psql
```

### Common SQL Patterns

```sql
-- Add column
ALTER TABLE students ADD COLUMN email TEXT;

-- Add foreign key
ALTER TABLE student_classes
ADD CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id);

-- Create index
CREATE INDEX idx_students_email ON students(email);

-- Add constraint
ALTER TABLE students ADD CONSTRAINT email_unique UNIQUE(email);

-- Rename column
ALTER TABLE students RENAME COLUMN name TO full_name;

-- Change column type
ALTER TABLE students ALTER COLUMN age TYPE INTEGER;

-- Set default
ALTER TABLE students ALTER COLUMN status SET DEFAULT 'active';

-- Add NOT NULL
ALTER TABLE students ALTER COLUMN email SET NOT NULL;
```

---

## Related Documentation

- [SUPABASE_IMPLEMENTATION.md](../System/SUPABASE_IMPLEMENTATION.md) - Database schema reference
- [CURRENT_ARCHITECTURE.md](../System/CURRENT_ARCHITECTURE.md) - System architecture
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Maintained by**: Development Team
**Next Review**: When major schema changes are planned
