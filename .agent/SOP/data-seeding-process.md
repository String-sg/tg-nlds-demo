# Data Seeding Process

**Last Updated**: November 4, 2025
**Branch**: `comprehensive-data-seeding`
**Status**: Ready for execution

---

## Overview

This document describes the comprehensive data seeding process for populating the MOE Teacher-Student Management System database with realistic, production-ready test data.

### What Gets Seeded

1. **Attendance Records** - 60 days per student (~2,160 records)
2. **Academic Results** - 8+ assessments per student (~360 records)
3. **NAPFA Physical Fitness** - 1 assessment per student (36 records)
4. **Student Overview Enhancements** - Medical conditions, family background (36 updates)
5. **Behavior Observations** - 3-5 per student (~144 records)
6. **Friend Relationships** - 3 per student (~108 records)

**Total**: ~2,844 new records for 36 students in Class 5A

---

## Quick Start

### Prerequisites

1. Docker Desktop running
2. Supabase CLI installed (`brew install supabase/tap/supabase`)
3. Node.js 18+ installed
4. Repository cloned and dependencies installed

### Execute All Seed Data

```bash
# 1. Navigate to project root
cd /Users/rezailmi/Documents/GitHub/moe-tg-vx

# 2. Ensure Docker is running
docker ps

# 3. Reset database with all migrations (includes new seed migrations)
supabase db reset

# 4. Verify seed data
npx tsx scripts/verify-comprehensive-seed.ts
```

---

## Step-by-Step Process

### Step 1: Generate Seed SQL Files

The seed generation script creates 6 SQL migration files:

```bash
cd /Users/rezailmi/Documents/GitHub/moe-tg-vx/.conductor/carthage
npx tsx scripts/generate-comprehensive-seed.ts
```

**Output:**
```
✓ 20251104000001_seed_attendance_data_all_students.sql
✓ 20251104000002_seed_academic_results_all_students.sql
✓ 20251104000003_seed_napfa_physical_fitness.sql
✓ 20251104000004_enhance_student_overview_data.sql
✓ 20251104000005_seed_behavior_observations.sql
✓ 20251104000006_seed_friend_relationships.sql
```

**Files are created in:** `supabase/migrations/`

### Step 2: Review Generated SQL

Before applying, review the SQL files to ensure data quality:

```bash
# View a sample migration
less supabase/migrations/20251104000003_seed_napfa_physical_fitness.sql

# Check file sizes
ls -lh supabase/migrations/202511040*
```

**Expected file sizes:**
- Attendance: ~500KB (2,160 records)
- Academic Results: ~200KB (360 records)
- NAPFA: ~20KB (36 records)
- Student Overview: ~15KB (36 updates)
- Behavior Observations: ~50KB (144 records)
- Friend Relationships: ~30KB (108 records)

### Step 3: Apply Migrations

**Option A: Full Database Reset (Recommended)**

This drops and recreates the entire database with all migrations:

```bash
cd /Users/rezailmi/Documents/GitHub/moe-tg-vx
supabase db reset
```

**Option B: Push New Migrations Only**

This applies only new migrations (use with caution):

```bash
supabase db push
```

### Step 4: Verify Data

Run the verification script to check all data was inserted correctly:

```bash
npx tsx scripts/verify-comprehensive-seed.ts
```

**Expected output:**
```
✅ Total students: Expected 36, Actual 36
✅ Attendance records: Expected 2000, Actual 2160
✅ Academic results: Expected 250, Actual 360
✅ NAPFA records: Expected 36, Actual 36
✅ Behavior observations: Expected 100, Actual 144
✅ Friend relationships: Expected 100, Actual 108

📈 Summary: 12 passed, 0 failed
✅ All checks passed! Seed data is complete.
```

---

## File Structure

```
.conductor/carthage/
├── scripts/
│   ├── generate-comprehensive-seed.ts    # Main generation script
│   ├── verify-comprehensive-seed.ts      # Verification script
│   └── utils/
│       ├── seed-generators.ts            # Data generation utilities
│       └── random-utils.ts               # Random value generators
├── supabase/
│   └── migrations/
│       ├── 20251104000001_seed_attendance_data_all_students.sql
│       ├── 20251104000002_seed_academic_results_all_students.sql
│       ├── 20251104000003_seed_napfa_physical_fitness.sql
│       ├── 20251104000004_enhance_student_overview_data.sql
│       ├── 20251104000005_seed_behavior_observations.sql
│       └── 20251104000006_seed_friend_relationships.sql
└── .agent/
    ├── Tasks/comprehensive-data-seeding.md       # Implementation plan
    ├── SOP/data-seeding-process.md               # This file
    └── System/DATABASE_SCHEMA_EXPLORATION.md     # Schema reference
```

---

## Data Generation Details

### Attendance Pattern

**Realistic distribution:**
- 85% present
- 8% absent
- 5% late
- 2% early dismissal

**Profile-based rates:**
- High performers: 98% attendance
- Average students: 93% attendance
- Struggling students: 85% attendance
- Mixed performers: 90% attendance

**Date range:** Last 60 school days (excluding weekends)

### Academic Results

**Subjects:** Mathematics, Science, English, Mother Tongue

**Assessment types:**
- Mid-Year Examination (100 marks)
- Term Test (50-100 marks)
- Topic Quiz (50 marks)

**Terms:** Term 1 2025, Term 2 2025

**Grade distribution (HDP standards):**
- A (80-100%): 20% of students
- B (60-80%): 40% of students
- C (40-60%): 30% of students
- D (<40%): 10% of students

### NAPFA Physical Fitness

**6 Stations:**
1. Sit-ups
2. Standing Broad Jump
3. Sit & Reach
4. Shuttle Run
5. Pull-ups
6. 1.6km Run

**Grade distribution:**
- Gold: 20%
- Silver: 40%
- Bronze: 25%
- Pass: 10%
- Fail: 5%

### Medical Conditions

**Distribution:**
- 60% - No medical conditions
- 25% - Minor allergies only
- 10% - Chronic conditions (asthma, eczema)
- 5% - Serious conditions (ADHD, diabetes, epilepsy)

**Common allergies:** Peanuts, Shellfish, Dairy, Eggs, Dust mites

**Common conditions:** Asthma, ADHD, Eczema, Allergic rhinitis

### Behavior Observations

**Categories:**
- 50% Positive - Academic achievement, leadership, peer support
- 30% Concern - Late homework, inattention, peer conflict
- 15% Neutral - General observations
- 5% Discipline - Serious incidents

**Count per student:** 3-5 observations

### Friend Relationships

**Clustering strategy:** Students grouped into clusters of 4

**Closeness levels:**
- 30% very_close (best friends)
- 50% close (good friends)
- 20% acquaintance (casual friends)

**Bidirectional:** All friendships are reciprocal

---

## Troubleshooting

### Issue: "Docker daemon not running"

**Solution:**
```bash
# Start Docker Desktop
open -a Docker

# Wait for Docker to start, then retry
supabase db reset
```

### Issue: "Migration already applied"

**Solution:**
```bash
# Check migration status
supabase migration list

# If needed, rollback to specific migration
supabase db reset
```

### Issue: "Foreign key constraint violation"

**Cause:** Students or classes not found

**Solution:**
```bash
# Ensure earlier migrations are applied
supabase db reset

# Verify student records exist
supabase db execute "SELECT count(*) FROM students;"
```

### Issue: "Verification script fails"

**Check database connection:**
```bash
# Verify .env.local has correct credentials
cat .env.local | grep SUPABASE

# Test connection
supabase db execute "SELECT 1;"
```

---

## Regenerating Seed Data

To regenerate with different random data:

```bash
# 1. Delete old migrations
rm supabase/migrations/202511040000*.sql

# 2. Regenerate
npx tsx scripts/generate-comprehensive-seed.ts

# 3. Apply new migrations
supabase db reset

# 4. Verify
npx tsx scripts/verify-comprehensive-seed.ts
```

---

## Production Considerations

### DO NOT use this seed data in production

This seed data is for **development and testing only**. For production:

1. Use real student data from school management systems
2. Implement proper data import pipelines
3. Follow data privacy regulations (PDPA in Singapore)
4. Use anonymization for sensitive fields
5. Audit all data imports

### Data Privacy Notes

All generated data is **synthetic**:
- Names are common Singapore names (not real people)
- Addresses use fictional block numbers
- Phone numbers follow +65 format but are not real
- Medical conditions are randomized (not based on real students)

---

## Next Steps

After seeding:

1. **Test frontend components** - Verify all pages display data correctly
2. **Run analytics queries** - Test dashboard calculations
3. **Performance testing** - Ensure queries complete in <500ms
4. **Data consistency checks** - Verify relationships and constraints
5. **User acceptance testing** - Let stakeholders review realistic data

---

## References

- **Implementation Plan:** `.agent/Tasks/comprehensive-data-seeding.md`
- **Schema Reference:** `.agent/System/DATABASE_SCHEMA_EXPLORATION.md`
- **Seed Generators:** `scripts/utils/seed-generators.ts`
- **Supabase Docs:** https://supabase.com/docs/guides/cli/local-development
- **HDP Grading Standards:** https://www.moe.gov.sg/primary/curriculum/direct-school-admission

---

**Document Version:** 1.0
**Last Updated:** November 4, 2025
