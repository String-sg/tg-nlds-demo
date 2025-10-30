-- Migration: Seed Class Schedules
-- Description: Add realistic weekly schedule data to existing classes
-- Date: 2025-01-30

-- =====================================================
-- UPDATE CLASS SCHEDULES WITH SAMPLE DATA
-- =====================================================

-- Note: schedule JSONB format: [{ day: number (0-6), start_time: string, end_time: string, location: string }]
-- Day numbers: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

-- Update 5A (Form Class) - Morning registration every weekday
-- Monday to Friday, 7:30-8:00, Classroom 5A
UPDATE classes
SET schedule = '[
  {"day": 1, "start_time": "07:30", "end_time": "08:00", "location": "Classroom 5A"},
  {"day": 2, "start_time": "07:30", "end_time": "08:00", "location": "Classroom 5A"},
  {"day": 3, "start_time": "07:30", "end_time": "08:00", "location": "Classroom 5A"},
  {"day": 4, "start_time": "07:30", "end_time": "08:00", "location": "Classroom 5A"},
  {"day": 5, "start_time": "07:30", "end_time": "08:00", "location": "Classroom 5A"}
]'::jsonb
WHERE name = '5A' AND type = 'form';

-- Update 5A Science Class - Tuesday and Thursday lessons
-- Tuesday 9:00-10:30, Thursday 9:00-10:30, Science Lab 1
UPDATE classes
SET schedule = '[
  {"day": 2, "start_time": "09:00", "end_time": "10:30", "location": "Science Lab 1"},
  {"day": 4, "start_time": "09:00", "end_time": "10:30", "location": "Science Lab 1"}
]'::jsonb
WHERE name = '5A Science' AND type = 'subject';

-- Update Football CCA - Friday afternoon
-- Friday 15:00-17:00, School Field
UPDATE classes
SET schedule = '[
  {"day": 5, "start_time": "15:00", "end_time": "17:00", "location": "School Field"}
]'::jsonb
WHERE name = 'Football CCA' AND type = 'cca';

-- =====================================================
-- ADD MORE REALISTIC SCHEDULE DATA FOR DANIEL TAN
-- =====================================================

-- Let's add a few more subject classes to make the timetable interesting
-- These will be inserted if they don't exist

-- Mathematics Class - Monday, Wednesday, Friday (8:00-9:30)
INSERT INTO classes (name, type, subject_name, year_level, academic_year, schedule)
VALUES (
  '5A Mathematics',
  'subject',
  'Mathematics',
  '5',
  '2025',
  '[
    {"day": 1, "start_time": "08:00", "end_time": "09:30", "location": "Room 204"},
    {"day": 3, "start_time": "08:00", "end_time": "09:30", "location": "Room 204"},
    {"day": 5, "start_time": "08:00", "end_time": "09:30", "location": "Room 204"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- English Class - Tuesday and Thursday (11:00-12:30)
INSERT INTO classes (name, type, subject_name, year_level, academic_year, schedule)
VALUES (
  '5A English',
  'subject',
  'English',
  '5',
  '2025',
  '[
    {"day": 2, "start_time": "11:00", "end_time": "12:30", "location": "Room 302"},
    {"day": 4, "start_time": "11:00", "end_time": "12:30", "location": "Room 302"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Social Studies - Wednesday (13:30-15:00)
INSERT INTO classes (name, type, subject_name, year_level, academic_year, schedule)
VALUES (
  '5A Social Studies',
  'subject',
  'Social Studies',
  '5',
  '2025',
  '[
    {"day": 3, "start_time": "13:30", "end_time": "15:00", "location": "Room 105"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Physical Education - Monday (13:30-15:00)
INSERT INTO classes (name, type, subject_name, year_level, academic_year, schedule)
VALUES (
  '5A Physical Education',
  'subject',
  'Physical Education',
  '5',
  '2025',
  '[
    {"day": 1, "start_time": "13:30", "end_time": "15:00", "location": "Sports Hall"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Art Class - Friday (10:30-12:00)
INSERT INTO classes (name, type, subject_name, year_level, academic_year, schedule)
VALUES (
  '5A Art',
  'subject',
  'Art',
  '5',
  '2025',
  '[
    {"day": 5, "start_time": "10:30", "end_time": "12:00", "location": "Art Studio"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ASSIGN NEW CLASSES TO DANIEL TAN
-- =====================================================

-- First, get Daniel Tan's teacher ID and new class IDs
-- Then assign him to the new subject classes

-- Assign Daniel Tan to Mathematics (already form teacher of 5A)
INSERT INTO teacher_classes (teacher_id, class_id, role)
SELECT
  t.id as teacher_id,
  c.id as class_id,
  'teacher' as role
FROM teachers t
CROSS JOIN classes c
WHERE t.email = 'daniel.tan@school.edu.sg'
  AND c.name = '5A Mathematics'
ON CONFLICT (teacher_id, class_id) DO NOTHING;

-- Assign Daniel Tan to English
INSERT INTO teacher_classes (teacher_id, class_id, role)
SELECT
  t.id as teacher_id,
  c.id as class_id,
  'teacher' as role
FROM teachers t
CROSS JOIN classes c
WHERE t.email = 'daniel.tan@school.edu.sg'
  AND c.name = '5A English'
ON CONFLICT (teacher_id, class_id) DO NOTHING;

-- Assign Daniel Tan to Social Studies
INSERT INTO teacher_classes (teacher_id, class_id, role)
SELECT
  t.id as teacher_id,
  c.id as class_id,
  'teacher' as role
FROM teachers t
CROSS JOIN classes c
WHERE t.email = 'daniel.tan@school.edu.sg'
  AND c.name = '5A Social Studies'
ON CONFLICT (teacher_id, class_id) DO NOTHING;

-- Assign Daniel Tan to Physical Education
INSERT INTO teacher_classes (teacher_id, class_id, role)
SELECT
  t.id as teacher_id,
  c.id as class_id,
  'teacher' as role
FROM teachers t
CROSS JOIN classes c
WHERE t.email = 'daniel.tan@school.edu.sg'
  AND c.name = '5A Physical Education'
ON CONFLICT (teacher_id, class_id) DO NOTHING;

-- Assign Daniel Tan to Art
INSERT INTO teacher_classes (teacher_id, class_id, role)
SELECT
  t.id as teacher_id,
  c.id as class_id,
  'teacher' as role
FROM teachers t
CROSS JOIN classes c
WHERE t.email = 'daniel.tan@school.edu.sg'
  AND c.name = '5A Art'
ON CONFLICT (teacher_id, class_id) DO NOTHING;

-- Assign Daniel Tan to Football CCA (he's the coach!)
INSERT INTO teacher_classes (teacher_id, class_id, role)
SELECT
  t.id as teacher_id,
  c.id as class_id,
  'teacher' as role
FROM teachers t
CROSS JOIN classes c
WHERE t.email = 'daniel.tan@school.edu.sg'
  AND c.name = 'Football CCA'
ON CONFLICT (teacher_id, class_id) DO NOTHING;

-- =====================================================
-- VERIFICATION COMMENT
-- =====================================================

COMMENT ON COLUMN classes.schedule IS
'Weekly recurring schedule in JSONB format.
Array of objects: [{ day: 0-6 (Sun-Sat), start_time: "HH:MM", end_time: "HH:MM", location: "Room" }]
Example: [{"day": 1, "start_time": "09:00", "end_time": "10:30", "location": "Room 204"}]';
