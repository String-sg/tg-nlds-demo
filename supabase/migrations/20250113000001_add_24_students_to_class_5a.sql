-- Migration: Add 24 Students to Class 5A
-- Description: Populate Class 5A with 24 additional students, their guardians, and related data

-- =====================================================
-- STEP 1: Find existing UUIDs (for reference)
-- =====================================================
-- Class 5A should exist with name '5A' and type 'form'
-- Teacher Daniel Tan should exist with email 'daniel.tan@school.edu.sg'

-- =====================================================
-- STEP 2: Insert 24 Parent/Guardian Records
-- =====================================================

INSERT INTO parents_guardians (name, relationship, phone, email, occupation, address) VALUES
-- Student 32 - Harper Koh
('Mrs. Linda Koh', 'mother', '+65 9123 4501', 'linda.koh@email.com', 'Marketing Manager', 'Blk 245 Ang Mo Kio Ave 3'),
-- Student 33 - Ethan Seah
('Mr. & Mrs. Seah', 'parents', '+65 9123 4502', 'seah.family@email.com', 'Engineer / Teacher', 'Blk 102 Bedok North Ave 4'),
-- Student 34 - Zara Begum
('Mrs. Fatimah Begum', 'mother', '+65 9123 4503', 'fatimah.begum@email.com', 'Nurse', 'Blk 67 Pasir Ris St 12'),
-- Student 35 - Ryan Goh
('Dr. & Mrs. Goh', 'parents', '+65 9123 4504', 'goh.family@email.com', 'Doctor / Accountant', 'Blk 890 Woodlands Ave 6'),
-- Student 36 - Maya Kumar
('Mr. Ravi Kumar', 'father', '+65 9123 4505', 'ravi.kumar@email.com', 'IT Consultant', 'Blk 456 Jurong West St 41'),
-- Student 37 - Isaac Yap
('Mrs. Grace Yap', 'mother', '+65 9123 4506', 'grace.yap@email.com', 'Teacher', 'Blk 123 Tampines St 21'),
-- Student 38 - Chloe Tan
('Mr. & Mrs. Tan', 'parents', '+65 9123 4507', 'tan.family2@email.com', 'Business Owner', 'Blk 321 Bishan St 22'),
-- Student 39 - Aiden Wong
('Mrs. Jenny Wong', 'mother', '+65 9123 4508', 'jenny.wong@email.com', 'Pharmacist', 'Blk 567 Hougang Ave 8'),
-- Student 40 - Isabelle Chia
('Dr. Marcus Chia', 'father', '+65 9123 4509', 'marcus.chia@email.com', 'Surgeon', 'Blk 789 Bukit Timah Rd'),
-- Student 41 - Lucas Neo
('Mdm. Rose Neo', 'grandmother', '+65 9123 4510', 'rose.neo@email.com', 'Retired', 'Blk 234 Clementi Ave 2'),
-- Student 42 - Hannah Lim
('Mr. & Mrs. Lim', 'parents', '+65 9123 4511', 'lim.family2@email.com', 'Architect / Lawyer', 'Blk 890 Serangoon Ave 4'),
-- Student 43 - Noah Phua
('Mrs. Sarah Phua', 'mother', '+65 9123 4512', 'sarah.phua@email.com', 'HR Manager', 'Blk 345 Yishun Ring Rd'),
-- Student 44 - Sofia Rahman
('Mr. & Mrs. Rahman', 'parents', '+65 9123 4513', 'rahman.family2@email.com', 'Engineer / Teacher', 'Blk 678 Punggol Way'),
-- Student 45 - Caleb Soh
('Mr. David Soh', 'father', '+65 9123 4514', 'david.soh@email.com', 'Banker', 'Blk 901 Toa Payoh Lor 8'),
-- Student 46 - Aria Tay
('Mrs. Michelle Tay', 'mother', '+65 9123 4515', 'michelle.tay@email.com', 'Designer', 'Blk 456 Queenstown Ave 5'),
-- Student 47 - Jayden Ong
('Mr. & Mrs. Ong', 'parents', '+65 9123 4516', 'ong.family2@email.com', 'Civil Servant', 'Blk 789 Sengkang East Way'),
-- Student 48 - Mila Chen
('Mrs. Wendy Chen', 'mother', '+65 9123 4517', 'wendy.chen@email.com', 'Social Worker', 'Blk 234 Bukit Batok West Ave 6'),
-- Student 49 - Liam Tan
('Mr. & Mrs. Tan', 'parents', '+65 9123 4518', 'tan.family3@email.com', 'Manager / Accountant', 'Blk 567 Choa Chu Kang Ave 4'),
-- Student 50 - Ella Ng
('Mrs. Patricia Ng', 'mother', '+65 9123 4519', 'patricia.ng@email.com', 'Doctor', 'Blk 890 Marine Parade Rd'),
-- Student 51 - Mason Lee
('Mr. Jason Lee', 'father', '+65 9123 4520', 'jason.lee@email.com', 'Chef', 'Blk 123 Geylang Serai'),
-- Student 52 - Layla Koh
('Mrs. Helen Koh', 'mother', '+65 9123 4521', 'helen.koh@email.com', 'Teacher', 'Blk 456 Sembawang Dr'),
-- Student 53 - Oliver Ho
('Dr. & Mrs. Ho', 'parents', '+65 9123 4522', 'ho.family2@email.com', 'Dentist / Nurse', 'Blk 789 Novena Rd'),
-- Student 54 - Ava Sim
('Mr. & Mrs. Sim', 'parents', '+65 9123 4523', 'sim.family2@email.com', 'Engineer / Pharmacist', 'Blk 234 Marsiling Rise'),
-- Student 55 - Zachary Wee
('Mrs. Angela Wee', 'mother', '+65 9123 4524', 'angela.wee@email.com', 'Business Analyst', 'Blk 567 Pasir Panjang Rd');

-- =====================================================
-- STEP 3: Insert 24 Student Records
-- =====================================================

-- First, we need to get the form teacher UUID and class UUID
-- Using subqueries to reference them directly

WITH class_info AS (
  SELECT id as class_uuid FROM classes WHERE name = '5A' AND type = 'form' AND academic_year = '2025' LIMIT 1
),
teacher_info AS (
  SELECT id as teacher_uuid FROM teachers WHERE email = 'daniel.tan@school.edu.sg' LIMIT 1
),
new_guardians AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM parents_guardians
  WHERE created_at >= NOW() - INTERVAL '1 minute'
  ORDER BY created_at DESC
  LIMIT 24
)
INSERT INTO students (student_id, name, date_of_birth, gender, nationality, form_teacher_id, primary_guardian_id, academic_year, year_level)
SELECT
  student_data.student_id,
  student_data.name,
  student_data.dob,
  student_data.gender,
  student_data.nationality,
  teacher_info.teacher_uuid,
  ng.id,
  '2025',
  '5'
FROM teacher_info, (VALUES
  -- Student 32 - Harper Koh
  ('S050032', 'Harper Koh', '2014-03-15'::date, 'female', 'Singaporean', 1),
  -- Student 33 - Ethan Seah
  ('S050033', 'Ethan Seah', '2014-05-20'::date, 'male', 'Singaporean', 2),
  -- Student 34 - Zara Begum
  ('S050034', 'Zara Begum', '2014-07-08'::date, 'female', 'Singaporean', 3),
  -- Student 35 - Ryan Goh
  ('S050035', 'Ryan Goh', '2014-01-12'::date, 'male', 'Singaporean', 4),
  -- Student 36 - Maya Kumar
  ('S050036', 'Maya Kumar', '2014-09-25'::date, 'female', 'Singaporean', 5),
  -- Student 37 - Isaac Yap
  ('S050037', 'Isaac Yap', '2014-04-30'::date, 'male', 'Singaporean', 6),
  -- Student 38 - Chloe Tan
  ('S050038', 'Chloe Tan', '2014-11-18'::date, 'female', 'Singaporean', 7),
  -- Student 39 - Aiden Wong
  ('S050039', 'Aiden Wong', '2014-02-22'::date, 'male', 'Singaporean', 8),
  -- Student 40 - Isabelle Chia
  ('S050040', 'Isabelle Chia', '2014-06-14'::date, 'female', 'Singaporean', 9),
  -- Student 41 - Lucas Neo
  ('S050041', 'Lucas Neo', '2014-08-03'::date, 'male', 'Singaporean', 10),
  -- Student 42 - Hannah Lim
  ('S050042', 'Hannah Lim', '2014-10-27'::date, 'female', 'Singaporean', 11),
  -- Student 43 - Noah Phua
  ('S050043', 'Noah Phua', '2014-12-09'::date, 'male', 'Singaporean', 12),
  -- Student 44 - Sofia Rahman
  ('S050044', 'Sofia Rahman', '2014-03-16'::date, 'female', 'Singaporean', 13),
  -- Student 45 - Caleb Soh
  ('S050045', 'Caleb Soh', '2014-05-11'::date, 'male', 'Singaporean', 14),
  -- Student 46 - Aria Tay
  ('S050046', 'Aria Tay', '2014-07-23'::date, 'female', 'Singaporean', 15),
  -- Student 47 - Jayden Ong
  ('S050047', 'Jayden Ong', '2014-09-05'::date, 'male', 'Singaporean', 16),
  -- Student 48 - Mila Chen
  ('S050048', 'Mila Chen', '2014-11-19'::date, 'female', 'Singaporean', 17),
  -- Student 49 - Liam Tan
  ('S050049', 'Liam Tan', '2014-01-28'::date, 'male', 'Singaporean', 18),
  -- Student 50 - Ella Ng
  ('S050050', 'Ella Ng', '2014-04-07'::date, 'female', 'Singaporean', 19),
  -- Student 51 - Mason Lee
  ('S050051', 'Mason Lee', '2014-06-15'::date, 'male', 'Singaporean', 20),
  -- Student 52 - Layla Koh
  ('S050052', 'Layla Koh', '2014-08-29'::date, 'female', 'Singaporean', 21),
  -- Student 53 - Oliver Ho
  ('S050053', 'Oliver Ho', '2014-10-12'::date, 'male', 'Singaporean', 22),
  -- Student 54 - Ava Sim
  ('S050054', 'Ava Sim', '2014-12-24'::date, 'female', 'Singaporean', 23),
  -- Student 55 - Zachary Wee
  ('S050055', 'Zachary Wee', '2014-02-18'::date, 'male', 'Singaporean', 24)
) AS student_data(student_id, name, dob, gender, nationality, guardian_row)
JOIN new_guardians ng ON ng.rn = student_data.guardian_row;

-- =====================================================
-- STEP 4: Link Students to Class 5A
-- =====================================================

WITH class_info AS (
  SELECT id as class_uuid FROM classes WHERE name = '5A' AND type = 'form' AND academic_year = '2025' LIMIT 1
),
new_students AS (
  SELECT id FROM students WHERE student_id LIKE 'S0500%' AND student_id BETWEEN 'S050032' AND 'S050055'
)
INSERT INTO student_classes (student_id, class_id, enrollment_date, status)
SELECT ns.id, ci.class_uuid, '2025-01-06'::date, 'active'
FROM new_students ns
CROSS JOIN class_info ci;

-- =====================================================
-- STEP 5: Create Student Overview Records
-- =====================================================

WITH new_students AS (
  SELECT id, student_id, name FROM students WHERE student_id LIKE 'S0500%' AND student_id BETWEEN 'S050032' AND 'S050055'
)
INSERT INTO student_overview (student_id, background, medical_conditions, is_swan, conduct_grade)
SELECT
  ns.id,
  CASE
    WHEN ns.student_id IN ('S050034', 'S050048') THEN 'Supportive family environment. Active in community activities.'
    WHEN ns.student_id IN ('S050041', 'S050051') THEN 'Single parent household. Receives FAS support.'
    WHEN ns.student_id = 'S050043' THEN 'High-achieving family. Older sibling in secondary school.'
    ELSE 'Stable family background. Both parents working.'
  END as background,
  CASE
    WHEN ns.student_id = 'S050034' THEN '{"allergies": ["peanuts"], "medications": [], "conditions": []}'::jsonb
    WHEN ns.student_id = 'S050046' THEN '{"allergies": [], "medications": ["asthma inhaler"], "conditions": ["asthma"]}'::jsonb
    ELSE '{}'::jsonb
  END as medical_conditions,
  CASE
    WHEN ns.student_id IN ('S050048', 'S050051') THEN true
    ELSE false
  END as is_swan,
  CASE
    WHEN ns.student_id IN ('S050035', 'S050040', 'S050042', 'S050053') THEN 'Excellent'
    WHEN ns.student_id IN ('S050032', 'S050037', 'S050044', 'S050046', 'S050050', 'S050052') THEN 'Very Good'
    ELSE 'Good'
  END as conduct_grade
FROM new_students ns;

-- =====================================================
-- STEP 6: Add Sample Academic Results
-- =====================================================

WITH new_students AS (
  SELECT id, student_id FROM students WHERE student_id LIKE 'S0500%' AND student_id BETWEEN 'S050032' AND 'S050055'
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
  ('English', CASE
    WHEN ns.student_id IN ('S050035', 'S050040', 'S050042', 'S050053') THEN 90 + (RANDOM() * 5)::int
    WHEN ns.student_id IN ('S050032', 'S050037', 'S050044', 'S050046') THEN 80 + (RANDOM() * 8)::int
    WHEN ns.student_id IN ('S050048', 'S050051') THEN 65 + (RANDOM() * 10)::int
    ELSE 70 + (RANDOM() * 12)::int
  END),
  ('Math', CASE
    WHEN ns.student_id IN ('S050035', 'S050040', 'S050042', 'S050053') THEN 88 + (RANDOM() * 7)::int
    WHEN ns.student_id IN ('S050032', 'S050037', 'S050044', 'S050046') THEN 78 + (RANDOM() * 10)::int
    WHEN ns.student_id IN ('S050048', 'S050051') THEN 62 + (RANDOM() * 12)::int
    ELSE 68 + (RANDOM() * 14)::int
  END),
  ('Science', CASE
    WHEN ns.student_id IN ('S050035', 'S050040', 'S050042', 'S050053') THEN 87 + (RANDOM() * 8)::int
    WHEN ns.student_id IN ('S050032', 'S050037', 'S050044', 'S050046') THEN 77 + (RANDOM() * 11)::int
    WHEN ns.student_id IN ('S050048', 'S050051') THEN 60 + (RANDOM() * 13)::int
    ELSE 67 + (RANDOM() * 15)::int
  END),
  ('Chinese', CASE
    WHEN ns.student_id IN ('S050035', 'S050040', 'S050042', 'S050053') THEN 85 + (RANDOM() * 8)::int
    WHEN ns.student_id IN ('S050032', 'S050037', 'S050044', 'S050046') THEN 75 + (RANDOM() * 10)::int
    WHEN ns.student_id IN ('S050048', 'S050051') THEN 60 + (RANDOM() * 12)::int
    ELSE 65 + (RANDOM() * 15)::int
  END)
) AS subject_data(subject_name, score);

-- =====================================================
-- STEP 7: Add Sample Attendance Records (Last 30 Days)
-- =====================================================

WITH new_students AS (
  SELECT id, student_id FROM students WHERE student_id LIKE 'S0500%' AND student_id BETWEEN 'S050032' AND 'S050055'
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
    -- SWAN students have slightly lower attendance
    WHEN ns.student_id IN ('S050048', 'S050051') AND RANDOM() < 0.12 THEN 'absent'
    WHEN ns.student_id IN ('S050048', 'S050051') AND RANDOM() < 0.08 THEN 'late'
    -- Regular students
    WHEN RANDOM() < 0.03 THEN 'absent'
    WHEN RANDOM() < 0.05 THEN 'late'
    ELSE 'present'
  END,
  ti.teacher_uuid
FROM new_students ns
CROSS JOIN class_info ci
CROSS JOIN date_series ds
CROSS JOIN teacher_info ti;

-- =====================================================
-- STEP 8: Add Conduct Grade to student_overview
-- =====================================================

-- Update the student_overview table to include conduct_grade column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_overview' AND column_name = 'conduct_grade'
  ) THEN
    ALTER TABLE student_overview ADD COLUMN conduct_grade TEXT DEFAULT 'Good';
  END IF;
END $$;

-- Update conduct grades for all new students
WITH new_students AS (
  SELECT id, student_id FROM students WHERE student_id LIKE 'S0500%' AND student_id BETWEEN 'S050032' AND 'S050055'
)
UPDATE student_overview so
SET conduct_grade = CASE
  WHEN ns.student_id IN ('S050035', 'S050040', 'S050042', 'S050053') THEN 'Excellent'
  WHEN ns.student_id IN ('S050032', 'S050037', 'S050044', 'S050046', 'S050050', 'S050052') THEN 'Very Good'
  ELSE 'Good'
END
FROM new_students ns
WHERE so.student_id = ns.id;

-- =====================================================
-- VERIFICATION QUERIES (Comment out after verification)
-- =====================================================

-- Verify student count in Class 5A
-- SELECT COUNT(*) as student_count
-- FROM student_classes sc
-- JOIN classes c ON sc.class_id = c.id
-- WHERE c.name = '5A' AND c.type = 'form' AND c.academic_year = '2025';

-- Verify new students
-- SELECT s.student_id, s.name, s.gender, pg.name as guardian_name
-- FROM students s
-- JOIN parents_guardians pg ON s.primary_guardian_id = pg.id
-- WHERE s.student_id BETWEEN 'S050032' AND 'S050055'
-- ORDER BY s.student_id;

-- Verify academic results
-- SELECT s.student_id, s.name, ar.subject, ar.score, ar.grade
-- FROM students s
-- JOIN academic_results ar ON s.id = ar.student_id
-- WHERE s.student_id BETWEEN 'S050032' AND 'S050055'
-- ORDER BY s.student_id, ar.subject;
