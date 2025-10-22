-- Verification and Fix: Ensure Ryan Tan has complete data
-- Run this to verify and add missing data for Ryan Tan (S050112)

-- =====================================================
-- STEP 1: Verify Ryan Tan exists
-- =====================================================

DO $$
DECLARE
  ryan_student_id UUID;
  class_id UUID;
  teacher_id UUID;
  ryan_data_count INT;
BEGIN
  -- Get Ryan Tan's UUID
  SELECT id INTO ryan_student_id
  FROM students
  WHERE student_id = 'S050112'
  LIMIT 1;

  IF ryan_student_id IS NULL THEN
    RAISE NOTICE 'ERROR: Ryan Tan (S050112) not found in students table!';
    RAISE NOTICE 'Please run migration 20250122000001 first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found Ryan Tan with UUID: %', ryan_student_id;

  -- Get class and teacher IDs
  SELECT id INTO class_id FROM classes WHERE name = '5A' AND type = 'form' AND academic_year = '2025' LIMIT 1;
  SELECT id INTO teacher_id FROM teachers WHERE email = 'daniel.tan@school.edu.sg' LIMIT 1;

  -- =====================================================
  -- STEP 2: Check existing data
  -- =====================================================

  -- Check academic results
  SELECT COUNT(*) INTO ryan_data_count
  FROM academic_results
  WHERE student_id = ryan_student_id;

  RAISE NOTICE 'Ryan Tan has % academic result records', ryan_data_count;

  -- Check attendance
  SELECT COUNT(*) INTO ryan_data_count
  FROM attendance
  WHERE student_id = ryan_student_id;

  RAISE NOTICE 'Ryan Tan has % attendance records', ryan_data_count;

  -- Check student overview
  SELECT COUNT(*) INTO ryan_data_count
  FROM student_overview
  WHERE student_id = ryan_student_id;

  RAISE NOTICE 'Ryan Tan has % student_overview record', ryan_data_count;

  -- =====================================================
  -- STEP 3: Add student overview if missing
  -- =====================================================

  INSERT INTO student_overview (student_id, background, medical_conditions, is_swan, conduct_grade)
  SELECT
    ryan_student_id,
    'Single parent household. Father is warehouse supervisor working long hours. Limited supervision after school. Student has shown significant behavioral improvement with structured support and mentorship.',
    '{}'::jsonb,
    false,
    'Good'
  WHERE NOT EXISTS (
    SELECT 1 FROM student_overview WHERE student_id = ryan_student_id
  );

  -- =====================================================
  -- STEP 4: Add academic results if missing
  -- =====================================================

  -- Only insert if no academic results exist
  IF NOT EXISTS (SELECT 1 FROM academic_results WHERE student_id = ryan_student_id) THEN
    INSERT INTO academic_results (student_id, class_id, assessment_type, assessment_name, assessment_date, term, score, max_score, percentage, grade, subject, created_by)
    VALUES
      -- English
      (ryan_student_id, class_id, 'exam', 'English Term 4 Exam', '2024-11-15'::date, 'Term 4 2024', 68, 100, 68, 'C', 'English', teacher_id),
      -- Math
      (ryan_student_id, class_id, 'exam', 'Math Term 4 Exam', '2024-11-15'::date, 'Term 4 2024', 65, 100, 65, 'D', 'Math', teacher_id),
      -- Science
      (ryan_student_id, class_id, 'exam', 'Science Term 4 Exam', '2024-11-15'::date, 'Term 4 2024', 70, 100, 70, 'C', 'Science', teacher_id),
      -- Chinese
      (ryan_student_id, class_id, 'exam', 'Chinese Term 4 Exam', '2024-11-15'::date, 'Term 4 2024', 62, 100, 62, 'D', 'Chinese', teacher_id);

    RAISE NOTICE 'Added 4 academic result records for Ryan Tan';
  ELSE
    RAISE NOTICE 'Academic results already exist for Ryan Tan, skipping...';
  END IF;

  -- =====================================================
  -- STEP 5: Add attendance records if missing
  -- =====================================================

  -- Only insert if no attendance records exist
  IF NOT EXISTS (SELECT 1 FROM attendance WHERE student_id = ryan_student_id) THEN
    -- Insert attendance for last 30 school days (excluding weekends)
    INSERT INTO attendance (student_id, class_id, date, type, status, recorded_by)
    SELECT
      ryan_student_id,
      class_id,
      date_val::date,
      'daily',
      CASE
        -- Ryan has improved attendance (92%)
        WHEN RANDOM() < 0.08 THEN 'absent'
        WHEN RANDOM() < 0.04 THEN 'late'
        ELSE 'present'
      END,
      teacher_id
    FROM generate_series(
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE - INTERVAL '1 day',
      '1 day'::interval
    ) as date_val
    WHERE EXTRACT(DOW FROM date_val::date) NOT IN (0, 6); -- Exclude weekends

    RAISE NOTICE 'Added attendance records for Ryan Tan (last 30 days)';
  ELSE
    RAISE NOTICE 'Attendance records already exist for Ryan Tan, skipping...';
  END IF;

  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Ryan Tan data verification complete!';
  RAISE NOTICE '===========================================';

END $$;

-- =====================================================
-- VERIFICATION QUERY (Uncomment to check results)
-- =====================================================

-- Check all Ryan Tan's data
SELECT
  s.student_id,
  s.name,
  so.conduct_grade,
  COUNT(DISTINCT ar.id) as academic_results_count,
  COUNT(DISTINCT a.id) as attendance_count,
  ROUND(
    (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::numeric /
     NULLIF(COUNT(a.id), 0)) * 100,
    1
  ) as attendance_rate
FROM students s
LEFT JOIN student_overview so ON s.id = so.student_id
LEFT JOIN academic_results ar ON s.id = ar.student_id
LEFT JOIN attendance a ON s.id = a.student_id
WHERE s.student_id = 'S050112'
GROUP BY s.student_id, s.name, so.conduct_grade;
