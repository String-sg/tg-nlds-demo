# How to Apply Seed Migrations to Supabase

Since Supabase MCP is not configured and we're using a remote Supabase instance, here are your options for applying the migrations:

---

## ✅ OPTION 1: Supabase Dashboard SQL Editor (EASIEST)

### Step 1: Open the SQL Editor

1. Go to your Supabase project dashboard → SQL Editor
2. Click **"New query"**

### Step 2: Copy the All-in-One Migration

Open this file:
```
supabase/APPLY_ALL_SEED_MIGRATIONS.sql
```

Copy the entire contents (351KB file).

### Step 3: Paste and Run

1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** (or press Cmd+Enter)
3. Wait ~1-2 minutes for completion

### Step 4: Verify

You should see a verification table at the end showing:

| table_name             | count |
|------------------------|-------|
| academic_results       | 360   |
| attendance             | 2160  |
| behaviour_observations | 144   |
| friend_relationships   | 108   |
| physical_fitness       | 36    |
| students               | 36    |

---

## OPTION 2: Apply Migrations One by One

If the all-in-one file is too large, apply each migration separately:

### Files to run in order:

1. **Attendance** (2,160 records)
   ```
   supabase/migrations/20251104000001_seed_attendance_data_all_students.sql
   ```

2. **Academic Results** (360 records)
   ```
   supabase/migrations/20251104000002_seed_academic_results_all_students.sql
   ```

3. **NAPFA** (36 records)
   ```
   supabase/migrations/20251104000003_seed_napfa_physical_fitness.sql
   ```

4. **Student Overview** (36 updates)
   ```
   supabase/migrations/20251104000004_enhance_student_overview_data.sql
   ```

5. **Behavior Observations** (144 records)
   ```
   supabase/migrations/20251104000005_seed_behavior_observations.sql
   ```

6. **Friend Relationships** (108 records)
   ```
   supabase/migrations/20251104000006_seed_friend_relationships.sql
   ```

For each file:
1. Open the file in your editor
2. Copy the contents
3. Paste into Supabase SQL Editor
4. Run the query
5. Wait for completion
6. Move to next file

---

## OPTION 3: Using psql (If you have PostgreSQL installed)

```bash
# Navigate to project root
cd /path/to/moe-tg-vx

# Set database connection from your environment
# Get these values from: Supabase Dashboard → Project Settings → Database
export PGHOST="your-db-host.supabase.co"
export PGPASSWORD="your-db-password"
export PGUSER="postgres"
export PGDATABASE="postgres"

# Run all migrations at once
psql -f supabase/APPLY_ALL_SEED_MIGRATIONS.sql

# Or run individually
psql -f supabase/migrations/20251104000001_seed_attendance_data_all_students.sql
psql -f supabase/migrations/20251104000002_seed_academic_results_all_students.sql

# ... and so on for remaining migrations
```

---

## Verification Queries

After applying migrations, run these queries in the SQL Editor to verify:

### Check Record Counts

```sql
SELECT 'students' as table_name, COUNT(*) as count FROM students
UNION ALL SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL SELECT 'academic_results', COUNT(*) FROM academic_results
UNION ALL SELECT 'physical_fitness', COUNT(*) FROM physical_fitness
UNION ALL SELECT 'behaviour_observations', COUNT(*) FROM behaviour_observations
UNION ALL SELECT 'friend_relationships', COUNT(*) FROM friend_relationships
ORDER BY table_name;
```

**Expected Results:**
```
academic_results        360
attendance             2160
behaviour_observations  144
friend_relationships    108
physical_fitness         36
students                 36
```

### Check Sample Attendance Data

```sql
SELECT
  s.name,
  a.date,
  a.status,
  a.reason
FROM attendance a
JOIN students s ON s.id = a.student_id
ORDER BY a.date DESC, s.name
LIMIT 10;
```

### Check Sample Academic Results

```sql
SELECT
  s.name,
  ar.subject,
  ar.assessment_name,
  ar.score,
  ar.max_score,
  ar.grade
FROM academic_results ar
JOIN students s ON s.id = ar.student_id
ORDER BY s.name, ar.subject
LIMIT 10;
```

### Check NAPFA Grades Distribution

```sql
SELECT
  overall_grade,
  COUNT(*) as student_count
FROM physical_fitness
GROUP BY overall_grade
ORDER BY overall_grade;
```

**Expected Distribution:**
```
Gold     ~7-8 students
Silver  ~14-15 students
Bronze   ~9-10 students
Pass     ~3-4 students
Fail     ~1-2 students
```

---

## Troubleshooting

### Error: "relation does not exist"

**Problem:** Base tables haven't been created.

**Solution:** Ensure earlier migrations (1-21) have been applied. Check with:

```sql
SELECT version, name
FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

You should see migrations up to `20251103000001`.

### Error: "duplicate key value"

**Problem:** Seed data already exists.

**Solution:** Clear existing seed data first:

```sql
-- Delete existing seed data (created after Nov 4, 2025)
DELETE FROM friend_relationships WHERE created_at >= '2025-11-04';
DELETE FROM behaviour_observations WHERE created_at >= '2025-11-04';
DELETE FROM physical_fitness WHERE created_at >= '2025-11-04';
DELETE FROM academic_results WHERE created_at >= '2025-11-04';
DELETE FROM attendance WHERE created_at >= '2025-11-04';

-- Then run migrations again
```

### Error: "foreign key constraint violation"

**Problem:** Student records don't exist.

**Solution:** Check students table:

```sql
SELECT COUNT(*) FROM students;
```

Should return 36. If not, apply these migrations first:
- `20250113000001_add_24_students_to_class_5a.sql`
- `20250122000001_add_12_case_students_primary_5a.sql`

---

## Summary

- **Fastest:** Option 1 (Supabase Dashboard with all-in-one file)
- **Most reliable:** Option 2 (One migration at a time)
- **Most automated:** Option 3 (psql command line)

Choose whichever works best for your setup!

---

## Files Reference

| File | Location | Size |
|------|----------|------|
| All-in-one | `supabase/APPLY_ALL_SEED_MIGRATIONS.sql` | 351KB |
| Migration 1 | `supabase/migrations/20251104000001_seed_attendance_data_all_students.sql` | 147KB |
| Migration 2 | `supabase/migrations/20251104000002_seed_academic_results_all_students.sql` | 131KB |
| Migration 3 | `supabase/migrations/20251104000003_seed_napfa_physical_fitness.sql` | 8KB |
| Migration 4 | `supabase/migrations/20251104000004_enhance_student_overview_data.sql` | 16KB |
| Migration 5 | `supabase/migrations/20251104000005_seed_behavior_observations.sql` | 29KB |
| Migration 6 | `supabase/migrations/20251104000006_seed_friend_relationships.sql` | 20KB |

---

**Need Help?** Check the documentation:
- `.agent/SOP/data-seeding-process.md` - Complete seeding guide
- `.agent/Tasks/comprehensive-data-seeding.md` - Implementation details
