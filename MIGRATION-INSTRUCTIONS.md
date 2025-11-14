# Database Migration Instructions

## 🎯 Overview

Two database migrations need to be applied to complete the conduct grades and report features removal.

**Project**: YOUR_PROJECT_REF
**Database**: Supabase (Production)
**Branch**: `remove-conduct-reports`

---

## 📋 Migrations to Apply

### Migration 1: Remove Conduct Grade Column
**File**: `supabase/migrations/20251031000001_remove_conduct_grade.sql`

```sql
-- Remove conduct_grade column from student_overview table
ALTER TABLE student_overview
DROP COLUMN IF EXISTS conduct_grade;

-- Add comment explaining the removal
COMMENT ON TABLE student_overview IS 'Student overview information (conduct_grade column removed on 2025-10-31)';
```

### Migration 2: Remove Reports System Tables
**File**: `supabase/migrations/20251031000002_remove_reports_system.sql`

```sql
-- Drop report_comments table first (has foreign key to reports)
DROP TABLE IF EXISTS report_comments CASCADE;

-- Drop reports table
DROP TABLE IF EXISTS reports CASCADE;

-- Add audit log comment
COMMENT ON SCHEMA public IS 'Public schema (reports system removed on 2025-10-31)';
```

---

## 🚀 How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://app.supabase.com/project/YOUR_PROJECT_REF/sql/new

2. **Run Migration 1**
   - Copy the SQL from `supabase/migrations/20251031000001_remove_conduct_grade.sql`
   - Paste into SQL Editor
   - Click "Run" button
   - ✅ Verify: "Success. No rows returned" message

3. **Run Migration 2**
   - Copy the SQL from `supabase/migrations/20251031000002_remove_reports_system.sql`
   - Paste into SQL Editor
   - Click "Run" button
   - ✅ Verify: "Success. No rows returned" message

### Option 2: Supabase CLI (If you have access token)

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link to project
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Push migrations
npx supabase db push
```

### Option 3: Using psql (If you have it installed)

```bash
# Load environment variables
source .env

# Run migration 1
psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/20251031000001_remove_conduct_grade.sql

# Run migration 2
psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/20251031000002_remove_reports_system.sql
```

---

## ✅ Verification Steps

After applying migrations, verify the changes:

### 1. Check Conduct Grade Column Removed

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'student_overview'
  AND column_name = 'conduct_grade';
```

**Expected Result**: No rows returned (column doesn't exist)

### 2. Check Reports Tables Removed

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('reports', 'report_comments')
  AND table_schema = 'public';
```

**Expected Result**: No rows returned (tables don't exist)

### 3. Test Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test these features:
   - ✅ Student profile page (should have 5 tabs, not 6)
   - ✅ Student list (no conduct grade column)
   - ✅ Class overview (no conduct grade column)
   - ✅ PTM `/ptm` command in assistant (no conduct badge)
   - ✅ No TypeScript errors in console

---

## 🔄 Rollback Plan (If Needed)

If you need to rollback the migrations:

### Rollback Migration 1: Restore Conduct Grade Column

```sql
ALTER TABLE student_overview
ADD COLUMN conduct_grade TEXT CHECK (conduct_grade IN ('Excellent', 'Very Good', 'Good', 'Fair', 'Poor'));

COMMENT ON COLUMN student_overview.conduct_grade IS 'Singapore MOE conduct grading system';
```

### Rollback Migration 2: Restore Reports Tables

```sql
-- Recreate reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES teachers(id),
  reviewed_by UUID REFERENCES teachers(id),
  approved_by UUID REFERENCES teachers(id),
  review_requested_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  published_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate report_comments table
CREATE TABLE report_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  commenter_id UUID NOT NULL REFERENCES teachers(id),
  comment TEXT NOT NULL,
  comment_type TEXT NOT NULL,
  parent_comment_id UUID REFERENCES report_comments(id),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES teachers(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_report_comments_report_id ON report_comments(report_id);
```

---

## 📊 Migration Status

- [x] Code changes completed and tested
- [x] TypeScript type check passing
- [x] Migration files created
- [x] **Migrations applied to database** ✅ **COMPLETED**
- [ ] Application tested in production
- [ ] Code merged to main branch

---

## 🆘 Troubleshooting

### Issue: "Column does not exist" error when applying Migration 1

**Solution**: This means the column was already removed. This is safe to ignore - migration uses `DROP COLUMN IF EXISTS`.

### Issue: "Table does not exist" error when applying Migration 2

**Solution**: This means the tables were already removed. This is safe to ignore - migration uses `DROP TABLE IF EXISTS`.

### Issue: Application still showing old features

**Solution**:
1. Clear browser cache
2. Restart development server
3. Check that you're on the `remove-conduct-reports` branch

### Issue: TypeScript errors after migration

**Solution**:
1. Run `npm run type-check` to see errors
2. Most likely outdated types - run `npm install` again
3. Check that all code changes were applied correctly

---

## 📞 Support

If you encounter issues:

1. Check the implementation summary: `.agent/Tasks/IMPLEMENTATION-SUMMARY.md`
2. Review the planning document: `.agent/Tasks/remove-conduct-grades-reports.md`
3. Verify all code changes are on the `remove-conduct-reports` branch
4. Check Supabase logs for migration errors

---

**Last Updated**: 2025-10-31
**Status**: Ready to apply migrations
