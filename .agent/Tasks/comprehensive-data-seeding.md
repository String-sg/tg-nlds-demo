# Comprehensive Data Seeding Plan

**Date**: November 4, 2025
**Branch**: `comprehensive-data-seeding`
**Status**: Planning Phase
**Objective**: Fill all empty and sparse data across all 36+ students in the database

---

## Executive Summary

This plan creates comprehensive seed data for all students in Class 5A, covering attendance records, academic results, physical fitness (NAPFA), medical conditions, behavior observations, and friend relationships. All data will be realistic, diverse, and aligned with Singapore education system standards.

### Scope
- **36+ students** in Class 5A (12 case students + 24 regular students)
- **7 data categories** to seed
- **60 days** of attendance data per student
- **5-10 assessments** per subject per student
- **Realistic distributions** based on Singapore school norms

---

## Current State Analysis

### Well-Populated (No Action Needed) ✅
1. `parents_guardians` - 36+ records
2. `students` - 36+ records
3. `student_guardians` - Fully linked
4. `student_classes` - All enrolled in 5A
5. `teachers` - Daniel Tan (form teacher)
6. `classes` - Form, subject, and CCA classes

### Needs Seeding (Priority 1) 🔴
1. **Attendance** - Need 60 days per student (2,160+ records)
2. **Academic Results** - Need 5-10 per student (180-360 records)
3. **Physical Fitness** - Need 1 NAPFA per student (36+ records)
4. **Student Overview** - Enhance medical/family data (36+ updates)

### Needs Seeding (Priority 2) 🟡
1. **Behavior Observations** - Need 3-5 per student (108-180 records)
2. **Friend Relationships** - Need 2-4 per student (72-144 records)
3. **CCE Results** - Need 2-3 per student (72-108 records)

---

## Implementation Plan

### Phase 1: Attendance Records (2,160+ records)

**File**: `supabase/migrations/20251104000001_seed_attendance_data_all_students.sql`

**Strategy**:
- Generate last 60 school days (excluding weekends/holidays)
- Realistic attendance patterns by student type:
  - **High performers** (40%): 95-100% attendance
  - **Average students** (40%): 90-95% attendance
  - **Concern students** (15%): 80-90% attendance
  - **Critical cases** (5%): 60-80% attendance

**Status Distribution**:
- 85% `present`
- 8% `absent`
- 5% `late`
- 2% `early_dismissal`

**Fields**:
```sql
- student_id (UUID)
- class_id (UUID) -- 5A form class
- date (DATE) -- Last 60 school days
- type ('daily')
- status (present/absent/late/early_dismissal)
- is_official (BOOLEAN)
- reason (TEXT, nullable)
- remarks (TEXT, nullable)
- check_in_time (TIME)
- check_out_time (TIME)
- recorded_by (teacher_id)
```

**Sample Pattern** (High Performer):
```
Day 1-50: Present
Day 51: Late (Reason: "Medical appointment")
Day 52-55: Present
Day 56: Absent (Reason: "Sick leave - doctor's note")
Day 57-60: Present
```

---

### Phase 2: Academic Results (180-360 records)

**File**: `supabase/migrations/20251104000002_seed_academic_results_all_students.sql`

**Strategy**:
- **Subjects**: Mathematics, Science, English, Mother Tongue, Humanities, PE
- **Assessment Types**:
  - Weekly Quiz (10 marks)
  - Topic Test (50 marks)
  - Mid-Year Exam (100 marks)
  - End-of-Year Exam (100 marks)
- **Terms**: Term 1 2025, Term 2 2025

**Grade Distribution** (HDP Standards):
- A (80-100%): 20% of students
- B (60-80%): 40% of students
- C (40-60%): 30% of students
- D (<40%): 10% of students

**Per Student**:
- 6 subjects × 2 terms × 2-3 assessments = ~24-36 results per student
- Adjusted: **5-10 key assessments** to avoid over-seeding

**Fields**:
```sql
- student_id (UUID)
- class_id (UUID) -- subject class
- assessment_type ('exam'/'test'/'quiz')
- assessment_name (TEXT)
- assessment_date (DATE)
- term (TEXT)
- score (NUMERIC)
- max_score (NUMERIC)
- percentage (NUMERIC)
- grade (TEXT) -- A/B/C/D
- remarks (JSONB) -- { strengths, areas_for_improvement, teacher_comments }
- subject (TEXT)
- created_by (teacher_id)
```

**Student Performance Profiles**:
1. **Strong Performers** (8 students): Consistent A/B grades
2. **Average Students** (16 students): B/C grades
3. **Struggling Students** (8 students): C/D grades
4. **Mixed Performers** (4 students): Vary by subject (strong in Math, weak in English)

---

### Phase 3: Physical Fitness - NAPFA (36+ records)

**File**: `supabase/migrations/20251104000003_seed_napfa_physical_fitness.sql`

**Strategy**:
- Annual NAPFA assessment (March 2025)
- Age group: Primary 5 (10-11 years old)
- **6 stations**: Sit-ups, Standing Broad Jump, Sit & Reach, Shuttle Run, Pull-ups, 1.6km Run

**NAPFA Grading** (Primary 5):
- **Gold**: ≥15 points (top 20%)
- **Silver**: 10-14 points (30%)
- **Bronze**: 6-9 points (30%)
- **Pass**: 2-5 points (15%)
- **Fail**: 0-1 points (5%)

**Metrics Structure** (JSONB):
```json
{
  "sit_ups": 35,
  "standing_broad_jump": 165,
  "sit_and_reach": 42,
  "shuttle_run": "10.5s",
  "pull_ups": 6,
  "1.6km_run": "9m 15s",
  "total_points": 18
}
```

**Fields**:
```sql
- student_id (UUID)
- assessment_date (DATE) -- March 2025
- assessment_type ('NAPFA')
- metrics (JSONB)
- overall_grade ('Gold'/'Silver'/'Bronze'/'Pass'/'Fail')
- pass_status (BOOLEAN)
- remarks (TEXT)
- assessed_by (teacher_id)
```

---

### Phase 4: Enhanced Student Overview (36+ updates)

**File**: `supabase/migrations/20251104000004_enhance_student_overview_data.sql`

**Strategy**:
- Update existing `student_overview` records
- Fill in medical conditions, health declarations, family background
- Realistic diversity across students

**Medical Conditions** (JSONB):
```json
{
  "notes": "Frequent nurse visits for stress-related complaints",
  "allergies": ["Peanuts", "Shellfish"],
  "conditions": ["Asthma", "ADHD"],
  "medications": ["Ventolin inhaler (blue)", "Ritalin 10mg daily"]
}
```

**Distribution**:
- 60% - No medical conditions (empty object)
- 25% - Minor allergies only
- 10% - Chronic conditions (asthma, eczema)
- 5% - Serious conditions (ADHD, diabetes, epilepsy)

**Family Background** (JSONB):
```json
{
  "siblings": 2,
  "home_situation": "Both parents working professionals",
  "notes": "Supportive family environment, high academic expectations"
}
```

**Housing/Finance** (JSONB):
```json
{
  "housing_type": "HDB 4-room",
  "financial_assistance": false,
  "notes": "Middle-income family"
}
```

**SWAN (Students with Additional Needs)**:
- 5-8 students flagged as SWAN
- Types: Learning Disability, Behavioral, Sensory, Giftedness

---

### Phase 5: Behavior Observations (108-180 records)

**File**: `supabase/migrations/20251104000005_seed_behavior_observations.sql`

**Strategy**:
- 3-5 observations per student
- Mix of positive, concern, neutral, discipline
- Realistic school scenarios

**Category Distribution**:
- 50% `positive` - Academic achievement, leadership, kindness
- 30% `concern` - Late homework, inattention, peer conflict
- 15% `neutral` - General observations
- 5% `discipline` - Serious incidents

**Severity**:
- 70% `low` - Minor incidents
- 25% `medium` - Moderate concerns
- 5% `high` - Serious issues

**Sample Positive Observation**:
```
Title: "Exceptional peer support"
Description: "Helped struggling classmate with math homework during recess"
Category: positive
Severity: low
Location: "Classroom"
```

**Sample Concern Observation**:
```
Title: "Incomplete homework - 3rd occurrence"
Description: "Did not submit Science worksheet. Parent note required."
Category: concern
Severity: medium
Location: "Science Lab"
Action Taken: "Spoke to student, sent note to parent"
Follow-up Required: true
Follow-up Date: 2025-02-15
```

---

### Phase 6: Friend Relationships (72-144 records)

**File**: `supabase/migrations/20251104000006_seed_friend_relationships.sql`

**Strategy**:
- Create realistic friend clusters (groups of 3-5 students)
- 2-4 friendships per student
- Closeness levels: very_close, close, acquaintance

**Friend Groups** (Examples):
- **Group 1** (Academic achievers): Harper Koh, Ethan Seah, Maya Kumar
- **Group 2** (Sports enthusiasts): Ryan Goh, Aiden Wong, Lucas Neo
- **Group 3** (Arts & music): Isabelle Chia, Hannah Lim, Sofia Rahman
- **Group 4** (Mixed group): Zara Begum, Chloe Tan, Aria Tay

**Relationship Types**:
- 50% `close_friend`
- 30% `classmate`
- 15% `study_partner`
- 5% `sports_teammate`

**Closeness Distribution**:
- 30% `very_close` - Best friends
- 50% `close` - Good friends
- 20% `acquaintance` - Casual friends

**Bidirectional**: Ensure reciprocal relationships (if A is friend with B, B is friend with A)

---

### Phase 7: CCE Results (72-108 records)

**File**: `supabase/migrations/20251104000007_seed_cce_results.sql`

**Note**: CCE table was removed in migration `20251103000001_remove_cce_results.sql`. We need to:
1. Re-create the table if needed
2. OR skip this phase if CCE is deprecated

**If Re-creating CCE**:

**Strategy**:
- 2-3 CCE assessments per student (Term 1, Term 2)
- Grades: A, B, C, D
- Categories: Character, Citizenship, Education

**Fields**:
```sql
- student_id (UUID)
- term (TEXT) -- 'Term 1 2025', 'Term 2 2025'
- academic_year (TEXT) -- '2025'
- character (TEXT) -- Grade A-D
- citizenship (TEXT) -- Grade A-D
- education (TEXT) -- Grade A-D
- overall_grade (TEXT) -- Average grade
- comments (TEXT)
- assessed_by (teacher_id)
```

**Grade Distribution**:
- A: 25%
- B: 50%
- C: 20%
- D: 5%

---

## Technical Implementation

### Approach: Supabase CLI Migrations

All seed data will be added via **SQL migration files** executed through Supabase CLI:

```bash
# Generate migration file
supabase migration new seed_attendance_data_all_students

# Edit the .sql file with INSERT statements

# Apply migration locally
supabase db reset

# Or push to remote
supabase db push
```

### Data Generation Scripts

For complex data generation, we'll create **TypeScript helper scripts**:

```typescript
// scripts/generate-attendance-seed.ts
import { writeFileSync } from 'fs'
import { generateAttendanceRecords } from './utils/attendance-generator'

const students = [...] // All 36+ students
const sqlStatements = generateAttendanceRecords(students, 60)

writeFileSync(
  'supabase/migrations/20251104000001_seed_attendance_data_all_students.sql',
  sqlStatements
)
```

### Helper Utilities

**File**: `scripts/utils/seed-generators.ts`

Functions:
- `generateAttendancePattern(studentType, days)` → attendance records
- `generateAcademicResults(studentProfile, subjects)` → result records
- `generateNAPFAScores(fitnessLevel)` → NAPFA metrics
- `generateMedicalConditions(severity)` → medical data
- `generateBehaviorObservations(studentType, count)` → observations
- `generateFriendClusters(students)` → relationship records

---

## Data Quality Standards

### Realism
- Names match Singapore context (Chinese, Malay, Indian, Others)
- Addresses use Singapore postal codes
- Phone numbers follow +65 format
- Grades follow HDP standards (A: 80-100, B: 60-80, C: 40-60, D: <40)

### Diversity
- Gender balance (50/50)
- Ethnic diversity (65% Chinese, 15% Malay, 10% Indian, 10% Others)
- Performance diversity (bell curve distribution)
- Medical conditions (realistic prevalence rates)

### Consistency
- Academic performance correlates with attendance
- NAPFA scores correlate with PE subject results
- Friend groups reflect shared interests/performance levels
- Behavior observations align with case types

### Privacy
- No real student data used
- Generated names from common Singapore name pools
- Synthetic addresses and phone numbers

---

## Execution Plan

### Step 1: Preparation
- [ ] Create feature branch: `comprehensive-data-seeding`
- [ ] Read existing student data to understand IDs and profiles
- [ ] Create helper utilities in `scripts/utils/seed-generators.ts`

### Step 2: Generate Seed Scripts (7 Migrations)
- [ ] Phase 1: Attendance (60 days × 36 students = 2,160 records)
- [ ] Phase 2: Academic Results (10 assessments × 36 students = 360 records)
- [ ] Phase 3: NAPFA (1 assessment × 36 students = 36 records)
- [ ] Phase 4: Student Overview (36 updates)
- [ ] Phase 5: Behavior Observations (3-5 × 36 students = 108-180 records)
- [ ] Phase 6: Friend Relationships (3 × 36 students = 108 records)
- [ ] Phase 7: CCE Results (2-3 × 36 students = 72-108 records) - *if needed*

### Step 3: Validation
- [ ] Create verification script: `scripts/verify-comprehensive-seed.ts`
- [ ] Check record counts per table
- [ ] Verify data integrity (foreign keys, constraints)
- [ ] Test queries used by frontend components

### Step 4: Execution
- [ ] Backup current database
- [ ] Run migrations locally: `supabase db reset`
- [ ] Verify all data in local database
- [ ] Push to remote: `supabase db push`

### Step 5: Documentation
- [ ] Update `.agent/System/DATABASE_SCHEMA_EXPLORATION.md`
- [ ] Create `.agent/SOP/data-seeding-process.md`
- [ ] Document seed data structure in `.agent/System/SEED_DATA_REFERENCE.md`

---

## Success Criteria

### Quantitative Metrics
- ✅ 2,160+ attendance records (60 per student)
- ✅ 360+ academic result records (10 per student)
- ✅ 36+ NAPFA records (1 per student)
- ✅ 36+ enhanced student overview records
- ✅ 108-180 behavior observations (3-5 per student)
- ✅ 108+ friend relationships (3 per student)
- ✅ 72-108 CCE results (2-3 per student) - *if applicable*

### Qualitative Metrics
- All frontend components display realistic data
- Dashboard analytics show meaningful insights
- Attendance percentages calculate correctly
- Grade distributions follow bell curve
- No empty/null data in key fields
- Realistic correlation between related data (attendance ↔ grades)

### Performance
- All queries complete in <500ms
- No database errors or constraint violations
- Migrations execute successfully without rollback

---

## Risk Mitigation

### Risk 1: Data Volume Performance
- **Mitigation**: Use batch INSERTs (500 records per statement)
- **Mitigation**: Create indexes on frequently queried fields

### Risk 2: Constraint Violations
- **Mitigation**: Validate all foreign keys before INSERT
- **Mitigation**: Test migrations on local database first

### Risk 3: Inconsistent Data
- **Mitigation**: Use seed generator utilities for consistency
- **Mitigation**: Run verification scripts after seeding

### Risk 4: CCE Table Restoration
- **Decision needed**: Confirm if CCE results should be restored
- **Fallback**: Skip Phase 7 if CCE is deprecated

---

## Timeline Estimate

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Preparation & utilities | 1 hour |
| 2 | Attendance seed generation | 1.5 hours |
| 3 | Academic results generation | 2 hours |
| 4 | NAPFA generation | 1 hour |
| 5 | Student overview enhancement | 1.5 hours |
| 6 | Behavior observations | 1.5 hours |
| 7 | Friend relationships | 1 hour |
| 8 | CCE results (optional) | 1 hour |
| 9 | Validation & testing | 2 hours |
| 10 | Documentation | 1 hour |
| **Total** | | **13.5 hours** |

---

## Next Steps

1. **User approval** of this plan
2. **Clarify CCE requirements** (restore or skip?)
3. **Create feature branch** and begin implementation
4. **Generate helper utilities** first
5. **Execute phases sequentially** with validation after each

---

**Plan Complete**
Ready for implementation upon approval.
