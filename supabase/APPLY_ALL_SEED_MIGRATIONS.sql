-- ============================================================================
-- ALL-IN-ONE SEED DATA MIGRATION SCRIPT
-- ============================================================================
-- Applies all 6 seed migrations: attendance, academic results, NAPFA,
-- student overview, behavior observations, and friend relationships
-- Total records: ~2,844
-- Estimated time: 1-2 minutes
-- ============================================================================

-- Preflight check: Verify students exist
DO $$
DECLARE
  student_count INT;
BEGIN
  SELECT COUNT(*) INTO student_count FROM students;
  IF student_count < 36 THEN
    RAISE EXCEPTION 'Only % students found. Need 36 students. Apply base migrations first.', student_count;
  END IF;
  RAISE NOTICE '✓ Found % students. Proceeding with seed data...', student_count;
END $$;

-- ============================================================================
-- MIGRATION 1: Attendance Data (~2,160 records)
-- ============================================================================



-- ============================================================================
-- MIGRATION 2: Academic Results (~360 records)
-- ============================================================================



-- ============================================================================
-- MIGRATION 3: NAPFA Physical Fitness (36 records)
-- ============================================================================



-- ============================================================================
-- MIGRATION 4: Student Overview Enhancement (36 updates)
-- ============================================================================



-- ============================================================================
-- MIGRATION 5: Behavior Observations (~144 records)
-- ============================================================================



-- ============================================================================
-- MIGRATION 6: Friend Relationships (~108 records)
-- ============================================================================



-- ============================================================================
-- VERIFICATION: Check inserted data
-- ============================================================================

SELECT 'students' as table_name, COUNT(*) as count FROM students
UNION ALL SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL SELECT 'academic_results', COUNT(*) FROM academic_results
UNION ALL SELECT 'physical_fitness', COUNT(*) FROM physical_fitness
UNION ALL SELECT 'behaviour_observations', COUNT(*) FROM behaviour_observations
UNION ALL SELECT 'friend_relationships', COUNT(*) FROM friend_relationships
ORDER BY table_name;
