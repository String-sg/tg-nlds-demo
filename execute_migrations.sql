-- =====================================================
-- COMBINED MIGRATION EXECUTOR
-- This file combines all pending migrations for execution
-- =====================================================

-- First, check if students already exist to avoid duplicates
DO $$
DECLARE
  student_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO student_count
  FROM students
  WHERE student_id BETWEEN 'S050101' AND 'S050112';

  IF student_count = 0 THEN
    RAISE NOTICE 'No case students found. Will create all 12 students.';
  ELSIF student_count < 12 THEN
    RAISE NOTICE 'Found % students. Some may be missing.', student_count;
  ELSE
    RAISE NOTICE 'All 12 case students already exist.';
  END IF;
END $$;

-- =====================================================
-- STEP 1: Add Student Overview Records (if missing)
-- =====================================================

WITH new_students AS (
  SELECT id, student_id, name FROM students WHERE student_id LIKE 'S0501%' AND student_id BETWEEN 'S050101' AND 'S050112'
)
INSERT INTO student_overview (student_id, background, medical_conditions, is_swan, conduct_grade)
SELECT
  ns.id,
  CASE
    WHEN ns.student_id = 'S050101' THEN 'High-achieving family background. Both parents are medical professionals with advanced degrees. Older sibling excelling in university. Student experiences high academic pressure and family expectations. Limited emotional support at home. Recent family tensions noted.'
    WHEN ns.student_id = 'S050102' THEN 'Single parent household. Mother works retail management. Family facing economic challenges. Student helps care for younger siblings. Supportive but stressed home environment.'
    WHEN ns.student_id = 'S050103' THEN 'Stable two-parent household. Both parents working professionals. Student is middle child of three. Active in community activities. Generally supportive family environment.'
    WHEN ns.student_id = 'S050104' THEN 'Single parent household. Mother is accountant. Student is only child. Close relationship with mother. Previously had peer relationship challenges, now resolved.'
    WHEN ns.student_id = 'S050105' THEN 'Affluent family. Parents are business owners. Student has access to many resources but parents travel frequently for work. Often cared for by domestic helper.'
    WHEN ns.student_id = 'S050106' THEN 'Highly educated family. Father is IT manager. Strong emphasis on academic excellence and leadership development. Supportive and engaged parents.'
    WHEN ns.student_id = 'S050107' THEN 'Two-parent household. Mother is pharmacist. Strong support for STEM interests. Parents encourage academic exploration and extracurricular activities in science.'
    WHEN ns.student_id = 'S050108' THEN 'High-achieving professional family. Parents are surgeon and lawyer. Excellent resources and strong academic support. Student is self-motivated and driven. Healthy family dynamics with balanced expectations.'
    WHEN ns.student_id = 'S050109' THEN 'Single parent household. Father is software engineer. Student has learning support needs. Father is very involved and advocates strongly for student. Receives appropriate accommodations.'
    WHEN ns.student_id = 'S050110' THEN 'Single parent household. Mother is nurse working shifts. Student has shown growth in managing stress and anxiety. Completed successful counselling program. Strong resilience and positive attitude.'
    WHEN ns.student_id = 'S050111' THEN 'Two-parent household. Parents are teacher and accountant. Student struggles with math concepts but has strong parental support. Enrolled in intervention programs.'
    WHEN ns.student_id = 'S050112' THEN 'Single parent household. Father is warehouse supervisor working long hours. Limited supervision after school. Student has shown significant behavioral improvement with structured support and mentorship.'
    ELSE 'Stable family background. Both parents working.'
  END as background,
  CASE
    WHEN ns.student_id = 'S050101' THEN '{"allergies": [], "medications": [], "conditions": [], "notes": "Frequent nurse visits for stress-related complaints (headaches, stomach aches). No chronic physical conditions. Mental health related."}'::jsonb
    WHEN ns.student_id = 'S050109' THEN '{"allergies": [], "medications": [], "conditions": ["learning support"], "notes": "Receives additional time for examinations. Coordinating with learning support team."}'::jsonb
    ELSE '{}'::jsonb
  END as medical_conditions,
  CASE
    WHEN ns.student_id = 'S050101' THEN true
    ELSE false
  END as is_swan,
  CASE
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 'Excellent'
    WHEN ns.student_id IN ('S050104', 'S050107', 'S050110') THEN 'Very Good'
    WHEN ns.student_id IN ('S050101', 'S050102', 'S050105', 'S050109', 'S050111') THEN 'Good'
    WHEN ns.student_id = 'S050103' THEN 'Fair'
    WHEN ns.student_id = 'S050112' THEN 'Good'
    ELSE 'Good'
  END as conduct_grade
FROM new_students ns
WHERE NOT EXISTS (
  SELECT 1 FROM student_overview WHERE student_id = ns.id
);

-- =====================================================
-- STEP 2: Add Academic Results (Term 4 2024)
-- =====================================================

WITH new_students AS (
  SELECT id, student_id FROM students WHERE student_id LIKE 'S0501%' AND student_id BETWEEN 'S050101' AND 'S050112'
),
class_info AS (
  SELECT id as class_uuid FROM classes WHERE name = '5A' AND type = 'form' AND academic_year = '2025' LIMIT 1
),
teacher_info AS (
  SELECT id as teacher_uuid FROM teachers WHERE email = 'daniel.tan@school.edu.sg' LIMIT 1
),
existing_results AS (
  SELECT DISTINCT ar.student_id FROM academic_results ar
  JOIN new_students ns ON ar.student_id = ns.id
)
INSERT INTO academic_results (student_id, class_id, assessment_type, assessment_name, assessment_date, term, score, max_score, percentage, grade, subject, created_by)
SELECT
  ns.id,
  ci.class_uuid,
  'exam',
  subject_data.subject_name || ' Term 4 Exam',
  '2024-11-15'::date,
  'Term 4 2024',
  subject_data.score,
  100,
  subject_data.score,
  CASE
    WHEN subject_data.score >= 90 THEN 'A'
    WHEN subject_data.score >= 80 THEN 'B'
    WHEN subject_data.score >= 70 THEN 'C'
    WHEN subject_data.score >= 60 THEN 'D'
    ELSE 'E'
  END,
  subject_data.subject_name,
  ti.teacher_uuid
FROM new_students ns
CROSS JOIN class_info ci
CROSS JOIN teacher_info ti
CROSS JOIN LATERAL (VALUES
  ('English', CASE
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 92
    WHEN ns.student_id IN ('S050104', 'S050107') THEN 87
    WHEN ns.student_id IN ('S050110') THEN 82
    WHEN ns.student_id IN ('S050102', 'S050105', 'S050109', 'S050111', 'S050112') THEN 68
    WHEN ns.student_id = 'S050101' THEN 65
    WHEN ns.student_id = 'S050103' THEN 75
    ELSE 75
  END),
  ('Math', CASE
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 93
    WHEN ns.student_id IN ('S050104', 'S050107') THEN 86
    WHEN ns.student_id IN ('S050110') THEN 81
    WHEN ns.student_id IN ('S050102', 'S050105', 'S050111', 'S050112') THEN 65
    WHEN ns.student_id = 'S050109' THEN 70
    WHEN ns.student_id = 'S050101' THEN 68
    WHEN ns.student_id = 'S050103' THEN 73
    ELSE 73
  END),
  ('Science', CASE
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 91
    WHEN ns.student_id IN ('S050104', 'S050107') THEN 85
    WHEN ns.student_id IN ('S050110') THEN 80
    WHEN ns.student_id IN ('S050102', 'S050105', 'S050109', 'S050111', 'S050112') THEN 70
    WHEN ns.student_id = 'S050101' THEN 62
    WHEN ns.student_id = 'S050103' THEN 72
    ELSE 72
  END),
  ('Chinese', CASE
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 89
    WHEN ns.student_id IN ('S050104', 'S050107') THEN 84
    WHEN ns.student_id IN ('S050110') THEN 79
    WHEN ns.student_id IN ('S050102', 'S050105', 'S050109', 'S050111', 'S050112') THEN 62
    WHEN ns.student_id = 'S050101' THEN 60
    WHEN ns.student_id = 'S050103' THEN 70
    ELSE 70
  END)
) AS subject_data(subject_name, score)
WHERE NOT EXISTS (
  SELECT 1 FROM existing_results WHERE student_id = ns.id
);

-- =====================================================
-- STEP 3: Add Attendance Records (Last 30 Days)
-- =====================================================

WITH new_students AS (
  SELECT id, student_id FROM students WHERE student_id LIKE 'S0501%' AND student_id BETWEEN 'S050101' AND 'S050112'
),
class_info AS (
  SELECT id as class_uuid FROM classes WHERE name = '5A' AND type = 'form' AND academic_year = '2025' LIMIT 1
),
teacher_info AS (
  SELECT id as teacher_uuid FROM teachers WHERE email = 'daniel.tan@school.edu.sg' LIMIT 1
),
date_series AS (
  SELECT date_val::date as attendance_date
  FROM generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '1 day',
    '1 day'::interval
  ) as date_val
  WHERE EXTRACT(DOW FROM date_val::date) NOT IN (0, 6)
),
existing_attendance AS (
  SELECT DISTINCT a.student_id FROM attendance a
  JOIN new_students ns ON a.student_id = ns.id
)
INSERT INTO attendance (student_id, class_id, date, type, status, recorded_by)
SELECT
  ns.id,
  ci.class_uuid,
  ds.attendance_date,
  'daily',
  CASE
    WHEN ns.student_id = 'S050102' AND RANDOM() < 0.50 THEN 'absent'
    WHEN ns.student_id = 'S050102' AND RANDOM() < 0.10 THEN 'late'
    WHEN ns.student_id = 'S050105' AND RANDOM() < 0.30 THEN 'absent'
    WHEN ns.student_id = 'S050105' AND RANDOM() < 0.08 THEN 'late'
    WHEN ns.student_id = 'S050101' AND RANDOM() < 0.11 THEN 'absent'
    WHEN ns.student_id = 'S050101' AND RANDOM() < 0.05 THEN 'late'
    WHEN ns.student_id = 'S050112' AND RANDOM() < 0.08 THEN 'absent'
    WHEN ns.student_id = 'S050112' AND RANDOM() < 0.04 THEN 'late'
    WHEN ns.student_id = 'S050103' AND RANDOM() < 0.05 THEN 'absent'
    WHEN ns.student_id = 'S050103' AND RANDOM() < 0.12 THEN 'late'
    WHEN ns.student_id IN ('S050104', 'S050106', 'S050107', 'S050108', 'S050109', 'S050110', 'S050111') AND RANDOM() < 0.02 THEN 'absent'
    WHEN ns.student_id IN ('S050104', 'S050106', 'S050107', 'S050108', 'S050109', 'S050110', 'S050111') AND RANDOM() < 0.03 THEN 'late'
    ELSE 'present'
  END,
  ti.teacher_uuid
FROM new_students ns
CROSS JOIN class_info ci
CROSS JOIN date_series ds
CROSS JOIN teacher_info ti
WHERE NOT EXISTS (
  SELECT 1 FROM existing_attendance WHERE student_id = ns.id
);

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

SELECT
  'VERIFICATION COMPLETE' as status,
  COUNT(DISTINCT s.id) as students_count,
  COUNT(DISTINCT so.id) as overview_count,
  COUNT(DISTINCT ar.id) as academic_results_count,
  COUNT(DISTINCT a.id) as attendance_count
FROM students s
LEFT JOIN student_overview so ON s.id = so.student_id
LEFT JOIN academic_results ar ON s.id = ar.student_id
LEFT JOIN attendance a ON s.id = a.student_id
WHERE s.student_id BETWEEN 'S050101' AND 'S050112';
