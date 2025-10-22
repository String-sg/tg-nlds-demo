-- Quick check to see if student data exists in your database
-- Run this in Supabase SQL Editor to verify if migrations have been applied

-- 1. Check if 12 case students exist
SELECT
  'Students Created' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 12 THEN '✅ All 12 students exist'
    ELSE '❌ Missing students - run migration 20250122000001'
  END as status
FROM students
WHERE student_id BETWEEN 'S050101' AND 'S050112';

-- 2. Check academic results
SELECT
  'Academic Results' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) >= 48 THEN '✅ Academic data exists (48 records = 12 students × 4 subjects)'
    ELSE '❌ Missing academic data - run migration 20250122000002'
  END as status
FROM academic_results ar
JOIN students s ON ar.student_id = s.id
WHERE s.student_id BETWEEN 'S050101' AND 'S050112';

-- 3. Check attendance records
SELECT
  'Attendance Records' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) > 200 THEN '✅ Attendance data exists'
    ELSE '❌ Missing attendance data - run migration 20250122000002'
  END as status
FROM attendance a
JOIN students s ON a.student_id = s.id
WHERE s.student_id BETWEEN 'S050101' AND 'S050112';

-- 4. Check student overview
SELECT
  'Student Overview' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 12 THEN '✅ All student overviews exist'
    ELSE '❌ Missing student overview data - run migration 20250122000002'
  END as status
FROM student_overview so
JOIN students s ON so.student_id = s.id
WHERE s.student_id BETWEEN 'S050101' AND 'S050112';

-- 5. Specific check for Ryan Tan (S050112)
SELECT
  s.name,
  s.student_id,
  COUNT(DISTINCT ar.id) as academic_results_count,
  COUNT(DISTINCT a.id) as attendance_count,
  CASE WHEN so.id IS NOT NULL THEN '✅ Has overview' ELSE '❌ Missing overview' END as overview_status
FROM students s
LEFT JOIN academic_results ar ON s.id = ar.student_id
LEFT JOIN attendance a ON s.id = a.student_id
LEFT JOIN student_overview so ON s.id = so.student_id
WHERE s.student_id = 'S050112'
GROUP BY s.name, s.student_id, so.id;
