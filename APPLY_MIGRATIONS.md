# Apply Seed Migrations to Supabase

Since we don't have Docker or Supabase MCP configured, here's how to manually apply the migrations through the Supabase Dashboard.

## Option 1: Using Supabase Dashboard SQL Editor (Recommended)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `YOUR_PROJECT_REF`
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run Each Migration File

Run these migrations **in order** by copying the SQL from each file and pasting into the SQL Editor:

#### Migration 1: Attendance Data
**File:** `supabase/migrations/20251104000001_seed_attendance_data_all_students.sql`
- Records: ~2,160 attendance records
- Time: ~30 seconds

#### Migration 2: Academic Results
**File:** `supabase/migrations/20251104000002_seed_academic_results_all_students.sql`
- Records: ~360 academic results
- Time: ~10 seconds

#### Migration 3: NAPFA Physical Fitness
**File:** `supabase/migrations/20251104000003_seed_napfa_physical_fitness.sql`
- Records: 36 NAPFA records
- Time: ~2 seconds

#### Migration 4: Student Overview Enhancement
**File:** `supabase/migrations/20251104000004_enhance_student_overview_data.sql`
- Records: 36 UPDATE statements
- Time: ~2 seconds

#### Migration 5: Behavior Observations
**File:** `supabase/migrations/20251104000005_seed_behavior_observations.sql`
- Records: ~144 behavior observations
- Time: ~5 seconds

#### Migration 6: Friend Relationships
**File:** `supabase/migrations/20251104000006_seed_friend_relationships.sql`
- Records: ~108 friend relationships
- Time: ~3 seconds

### Step 3: Verify Data

After running all migrations, verify the data:

```sql
-- Check record counts
SELECT 'students' as table_name, COUNT(*) as count FROM students
UNION ALL
SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'academic_results', COUNT(*) FROM academic_results
UNION ALL
SELECT 'physical_fitness', COUNT(*) FROM physical_fitness
UNION ALL
SELECT 'behaviour_observations', COUNT(*) FROM behaviour_observations
UNION ALL
SELECT 'friend_relationships', COUNT(*) FROM friend_relationships;
```

Expected results:
```
students                36
attendance             2160
academic_results        360
physical_fitness         36
behaviour_observations  144
friend_relationships    108
```

## Option 2: Using psql Command Line

If you have `psql` installed:

```bash
# Set the database URL
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Apply each migration
cd /Users/rezailmi/Documents/GitHub/moe-tg-vx

psql "$DATABASE_URL" < supabase/migrations/20251104000001_seed_attendance_data_all_students.sql
psql "$DATABASE_URL" < supabase/migrations/20251104000002_seed_academic_results_all_students.sql
psql "$DATABASE_URL" < supabase/migrations/20251104000003_seed_napfa_physical_fitness.sql
psql "$DATABASE_URL" < supabase/migrations/20251104000004_enhance_student_overview_data.sql
psql "$DATABASE_URL" < supabase/migrations/20251104000005_seed_behavior_observations.sql
psql "$DATABASE_URL" < supabase/migrations/20251104000006_seed_friend_relationships.sql
```

## Option 3: All-in-One SQL Script

I've created a consolidated script that runs all migrations at once:

**File:** `supabase/APPLY_ALL_SEED_MIGRATIONS.sql`

Just copy the entire contents of this file and paste into the Supabase SQL Editor.

## Troubleshooting

### Error: "relation does not exist"
**Cause:** Base tables haven't been created yet.
**Solution:** Make sure all previous migrations (01-21) have been applied first.

### Error: "duplicate key value violates unique constraint"
**Cause:** Data already exists in the database.
**Solution:** Either skip the migration or delete existing seed data first:
```sql
DELETE FROM attendance WHERE created_at >= '2025-11-04';
DELETE FROM academic_results WHERE created_at >= '2025-11-04';
DELETE FROM physical_fitness WHERE created_at >= '2025-11-04';
DELETE FROM behaviour_observations WHERE created_at >= '2025-11-04';
DELETE FROM friend_relationships WHERE created_at >= '2025-11-04';
```

### Error: "student_id not found"
**Cause:** Student records don't exist.
**Solution:** Ensure migrations 12 and 13 have been applied:
- `20250113000001_add_24_students_to_class_5a.sql`
- `20250122000001_add_12_case_students_primary_5a.sql`

## Migration Status Tracking

You can check which migrations have been applied:

```sql
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
```

The 6 new migrations should show:
- `20251104000001`
- `20251104000002`
- `20251104000003`
- `20251104000004`
- `20251104000005`
- `20251104000006`

---

**Total Time:** ~1-2 minutes to apply all migrations
**Total Records:** ~2,844 new records
