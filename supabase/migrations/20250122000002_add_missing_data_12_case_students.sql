-- Migration: Add Missing Data for 12 Case Students in Primary Class 5A
-- Description: Add student overview, academic results, and attendance records for students S050101-S050112
-- This completes the data that was missing from the initial case students migration

-- =====================================================
-- STEP 1: Add Student Overview Records
-- =====================================================

WITH new_students AS (
  SELECT id, student_id, name FROM students WHERE student_id LIKE 'S0501%' AND student_id BETWEEN 'S050101' AND 'S050112'
)
INSERT INTO student_overview (student_id, background, medical_conditions, is_swan, conduct_grade)
SELECT
  ns.id,
  CASE
    -- Eric Lim - SWAN mental health case
    WHEN ns.student_id = 'S050101' THEN 'High-achieving family background. Both parents are medical professionals with advanced degrees. Older sibling excelling in university. Student experiences high academic pressure and family expectations. Limited emotional support at home. Recent family tensions noted.'
    -- Lim Hui Ling - Low attendance counselling case
    WHEN ns.student_id = 'S050102' THEN 'Single parent household. Mother works retail management. Family facing economic challenges. Student helps care for younger siblings. Supportive but stressed home environment.'
    -- Siti Nurul Ain - Behavioral/discipline case
    WHEN ns.student_id = 'S050103' THEN 'Stable two-parent household. Both parents working professionals. Student is middle child of three. Active in community activities. Generally supportive family environment.'
    -- Chen Jia Yi - Counselling case (now closed)
    WHEN ns.student_id = 'S050104' THEN 'Single parent household. Mother is accountant. Student is only child. Close relationship with mother. Previously had peer relationship challenges, now resolved.'
    -- Nicholas Loh - Attendance counselling case
    WHEN ns.student_id = 'S050105' THEN 'Affluent family. Parents are business owners. Student has access to many resources but parents travel frequently for work. Often cared for by domestic helper.'
    -- Muhammad Iskandar - GEP/career guidance (closed)
    WHEN ns.student_id = 'S050106' THEN 'Highly educated family. Father is IT manager. Strong emphasis on academic excellence and leadership development. Supportive and engaged parents.'
    -- Tan Wei Jie - STEM career guidance
    WHEN ns.student_id = 'S050107' THEN 'Two-parent household. Mother is pharmacist. Strong support for STEM interests. Parents encourage academic exploration and extracurricular activities in science.'
    -- Alice Wong - High achiever, career guidance (closed)
    WHEN ns.student_id = 'S050108' THEN 'High-achieving professional family. Parents are surgeon and lawyer. Excellent resources and strong academic support. Student is self-motivated and driven. Healthy family dynamics with balanced expectations.'
    -- Priya Krishnan - SEN support case
    WHEN ns.student_id = 'S050109' THEN 'Single parent household. Father is software engineer. Student has learning support needs. Father is very involved and advocates strongly for student. Receives appropriate accommodations.'
    -- Reza Halim - Counselling (closed, exam anxiety)
    WHEN ns.student_id = 'S050110' THEN 'Single parent household. Mother is nurse working shifts. Student has shown growth in managing stress and anxiety. Completed successful counselling program. Strong resilience and positive attitude.'
    -- Wong Kai Xuan - Academic support counselling
    WHEN ns.student_id = 'S050111' THEN 'Two-parent household. Parents are teacher and accountant. Student struggles with math concepts but has strong parental support. Enrolled in intervention programs.'
    -- Ryan Tan - Disciplinary case, CMT intervention
    WHEN ns.student_id = 'S050112' THEN 'Single parent household. Father is warehouse supervisor working long hours. Limited supervision after school. Student has shown significant behavioral improvement with structured support and mentorship.'
    ELSE 'Stable family background. Both parents working.'
  END as background,
  CASE
    -- Eric Lim - Stress-related psychosomatic symptoms
    WHEN ns.student_id = 'S050101' THEN '{"allergies": [], "medications": [], "conditions": [], "notes": "Frequent nurse visits for stress-related complaints (headaches, stomach aches). No chronic physical conditions. Mental health related."}'::jsonb
    -- Priya Krishnan - Learning support needs
    WHEN ns.student_id = 'S050109' THEN '{"allergies": [], "medications": [], "conditions": ["learning support"], "notes": "Receives additional time for examinations. Coordinating with learning support team."}'::jsonb
    ELSE '{}'::jsonb
  END as medical_conditions,
  CASE
    -- Eric Lim is SWAN for mental health
    WHEN ns.student_id = 'S050101' THEN true
    ELSE false
  END as is_swan,
  CASE
    -- Excellent conduct grades
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 'Excellent' -- Muhammad Iskandar (GEP), Alice Wong (top achiever)
    -- Very Good conduct grades
    WHEN ns.student_id IN ('S050104', 'S050107', 'S050110') THEN 'Very Good' -- Chen Jia Yi (resolved case), Tan Wei Jie, Reza Halim (improved)
    -- Good conduct grades (most students)
    WHEN ns.student_id IN ('S050101', 'S050102', 'S050105', 'S050109', 'S050111') THEN 'Good' -- Eric (SWAN but polite), Lim Hui Ling, Nicholas Loh, Priya, Wong Kai Xuan
    -- Fair conduct grade (behavioral issues)
    WHEN ns.student_id = 'S050103' THEN 'Fair' -- Siti (active discipline case)
    -- Fair improving to Good (Ryan - showing improvement per case notes)
    WHEN ns.student_id = 'S050112' THEN 'Good' -- Ryan Tan (recent improvement noted in case)
    ELSE 'Good'
  END as conduct_grade
FROM new_students ns;

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
  -- English scores
  ('English', CASE
    -- Top performers (A range: 90-95)
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 90 + FLOOR(RANDOM() * 5)::int -- Muhammad Iskandar, Alice Wong
    -- Very good (B+ range: 85-89)
    WHEN ns.student_id IN ('S050104', 'S050107') THEN 85 + FLOOR(RANDOM() * 4)::int -- Chen Jia Yi, Tan Wei Jie
    -- Good performers (B range: 80-84)
    WHEN ns.student_id IN ('S050110') THEN 80 + FLOOR(RANDOM() * 4)::int -- Reza Halim
    -- Struggling students (C-D range: 60-75)
    WHEN ns.student_id IN ('S050102', 'S050105', 'S050109', 'S050111', 'S050112') THEN 60 + FLOOR(RANDOM() * 15)::int -- Lim Hui Ling, Nicholas, Priya, Wong Kai Xuan, Ryan
    -- Eric Lim - declining performance (was 78%, now 65%)
    WHEN ns.student_id = 'S050101' THEN 65
    -- Behavioral issue student (varied)
    WHEN ns.student_id = 'S050103' THEN 70 + FLOOR(RANDOM() * 8)::int -- Siti
    ELSE 72 + FLOOR(RANDOM() * 10)::int
  END),
  -- Math scores
  ('Math', CASE
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 88 + FLOOR(RANDOM() * 7)::int
    WHEN ns.student_id IN ('S050104', 'S050107') THEN 83 + FLOOR(RANDOM() * 6)::int
    WHEN ns.student_id IN ('S050110') THEN 78 + FLOOR(RANDOM() * 6)::int
    -- Struggling with math specifically
    WHEN ns.student_id IN ('S050102', 'S050105', 'S050111', 'S050112') THEN 58 + FLOOR(RANDOM() * 15)::int
    WHEN ns.student_id = 'S050109' THEN 65 + FLOOR(RANDOM() * 8)::int -- Priya (SEN support)
    -- Eric Lim - declining (was ~78%, now 68%)
    WHEN ns.student_id = 'S050101' THEN 68
    WHEN ns.student_id = 'S050103' THEN 68 + FLOOR(RANDOM() * 10)::int
    ELSE 70 + FLOOR(RANDOM() * 12)::int
  END),
  -- Science scores
  ('Science', CASE
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 87 + FLOOR(RANDOM() * 8)::int
    WHEN ns.student_id IN ('S050104', 'S050107') THEN 82 + FLOOR(RANDOM() * 7)::int -- Tan Wei Jie strong in STEM
    WHEN ns.student_id IN ('S050110') THEN 77 + FLOOR(RANDOM() * 7)::int
    WHEN ns.student_id IN ('S050102', 'S050105', 'S050109', 'S050111', 'S050112') THEN 57 + FLOOR(RANDOM() * 16)::int
    -- Eric Lim - declining (was ~78%, now 62%)
    WHEN ns.student_id = 'S050101' THEN 62
    WHEN ns.student_id = 'S050103' THEN 67 + FLOOR(RANDOM() * 11)::int
    ELSE 69 + FLOOR(RANDOM() * 13)::int
  END),
  -- Chinese scores
  ('Chinese', CASE
    WHEN ns.student_id IN ('S050106', 'S050108') THEN 85 + FLOOR(RANDOM() * 8)::int
    WHEN ns.student_id IN ('S050104', 'S050107') THEN 80 + FLOOR(RANDOM() * 8)::int
    WHEN ns.student_id IN ('S050110') THEN 75 + FLOOR(RANDOM() * 8)::int
    WHEN ns.student_id IN ('S050102', 'S050105', 'S050109', 'S050111', 'S050112') THEN 55 + FLOOR(RANDOM() * 17)::int
    -- Eric Lim - declining (was ~78%, now 60%)
    WHEN ns.student_id = 'S050101' THEN 60
    WHEN ns.student_id = 'S050103' THEN 65 + FLOOR(RANDOM() * 13)::int
    ELSE 67 + FLOOR(RANDOM() * 15)::int
  END)
) AS subject_data(subject_name, score);

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
  WHERE EXTRACT(DOW FROM date_val::date) NOT IN (0, 6) -- Exclude weekends
)
INSERT INTO attendance (student_id, class_id, date, type, status, recorded_by)
SELECT
  ns.id,
  ci.class_uuid,
  ds.attendance_date,
  'daily',
  CASE
    -- Lim Hui Ling - 50% attendance (severe case)
    WHEN ns.student_id = 'S050102' AND RANDOM() < 0.50 THEN 'absent'
    WHEN ns.student_id = 'S050102' AND RANDOM() < 0.10 THEN 'late'
    -- Nicholas Loh - 70% attendance (irregular pattern)
    WHEN ns.student_id = 'S050105' AND RANDOM() < 0.30 THEN 'absent'
    WHEN ns.student_id = 'S050105' AND RANDOM() < 0.08 THEN 'late'
    -- Eric Lim - 89% attendance (SWAN, some stress-related absences)
    WHEN ns.student_id = 'S050101' AND RANDOM() < 0.11 THEN 'absent'
    WHEN ns.student_id = 'S050101' AND RANDOM() < 0.05 THEN 'late'
    -- Ryan Tan - Improved attendance recently (now ~92%)
    WHEN ns.student_id = 'S050112' AND RANDOM() < 0.08 THEN 'absent'
    WHEN ns.student_id = 'S050112' AND RANDOM() < 0.04 THEN 'late'
    -- Siti Nurul Ain - Some tardiness issues
    WHEN ns.student_id = 'S050103' AND RANDOM() < 0.05 THEN 'absent'
    WHEN ns.student_id = 'S050103' AND RANDOM() < 0.12 THEN 'late'
    -- Other students - regular good attendance (95%+)
    WHEN ns.student_id IN ('S050104', 'S050106', 'S050107', 'S050108', 'S050109', 'S050110', 'S050111') AND RANDOM() < 0.02 THEN 'absent'
    WHEN ns.student_id IN ('S050104', 'S050106', 'S050107', 'S050108', 'S050109', 'S050110', 'S050111') AND RANDOM() < 0.03 THEN 'late'
    ELSE 'present'
  END,
  ti.teacher_uuid
FROM new_students ns
CROSS JOIN class_info ci
CROSS JOIN date_series ds
CROSS JOIN teacher_info ti;

-- =====================================================
-- VERIFICATION QUERIES (Comment out after verification)
-- =====================================================

-- Verify student overview records
-- SELECT s.student_id, s.name, so.conduct_grade, so.is_swan, LENGTH(so.background) as background_length
-- FROM students s
-- JOIN student_overview so ON s.id = so.student_id
-- WHERE s.student_id BETWEEN 'S050101' AND 'S050112'
-- ORDER BY s.student_id;

-- Verify academic results
-- SELECT s.student_id, s.name, ar.subject, ar.score, ar.grade
-- FROM students s
-- JOIN academic_results ar ON s.id = ar.student_id
-- WHERE s.student_id BETWEEN 'S050101' AND 'S050112'
-- ORDER BY s.student_id, ar.subject;

-- Verify attendance records and rates
-- SELECT
--   s.student_id,
--   s.name,
--   COUNT(*) as total_days,
--   SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
--   ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 1) as attendance_rate
-- FROM students s
-- JOIN attendance a ON s.id = a.student_id
-- WHERE s.student_id BETWEEN 'S050101' AND 'S050112'
-- GROUP BY s.student_id, s.name
-- ORDER BY s.student_id;
