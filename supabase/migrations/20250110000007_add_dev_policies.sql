-- Migration: Temporary Development Policies
-- Description: Allow public access for development (REMOVE IN PRODUCTION!)
-- TODO: Remove these policies when proper authentication is implemented

-- Allow public read access to all tables for development
-- This bypasses RLS for anon/public users

-- Teachers
CREATE POLICY "DEV: Public read teachers"
  ON teachers FOR SELECT
  TO anon, authenticated
  USING (true);

-- Classes
CREATE POLICY "DEV: Public read classes"
  ON classes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Teacher Classes
CREATE POLICY "DEV: Public read teacher_classes"
  ON teacher_classes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Students
CREATE POLICY "DEV: Public read students"
  ON students FOR SELECT
  TO anon, authenticated
  USING (true);

-- Parents/Guardians
CREATE POLICY "DEV: Public read guardians"
  ON parents_guardians FOR SELECT
  TO anon, authenticated
  USING (true);

-- Student Guardians
CREATE POLICY "DEV: Public read student_guardians"
  ON student_guardians FOR SELECT
  TO anon, authenticated
  USING (true);

-- Student Classes
CREATE POLICY "DEV: Public read student_classes"
  ON student_classes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Student Overview
CREATE POLICY "DEV: Public read student_overview"
  ON student_overview FOR SELECT
  TO anon, authenticated
  USING (true);

-- Attendance
CREATE POLICY "DEV: Public read attendance"
  ON attendance FOR SELECT
  TO anon, authenticated
  USING (true);

-- Academic Results
CREATE POLICY "DEV: Public read academic_results"
  ON academic_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- Physical Fitness
CREATE POLICY "DEV: Public read physical_fitness"
  ON physical_fitness FOR SELECT
  TO anon, authenticated
  USING (true);

-- CCE Results
CREATE POLICY "DEV: Public read cce_results"
  ON cce_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- Cases
CREATE POLICY "DEV: Public read cases"
  ON cases FOR SELECT
  TO anon, authenticated
  USING (true);

-- Case Issues
CREATE POLICY "DEV: Public read case_issues"
  ON case_issues FOR SELECT
  TO anon, authenticated
  USING (true);

-- Reports
CREATE POLICY "DEV: Public read reports"
  ON reports FOR SELECT
  TO anon, authenticated
  USING (true);

-- Report Comments
CREATE POLICY "DEV: Public read report_comments"
  ON report_comments FOR SELECT
  TO anon, authenticated
  USING (true);

-- NOTE: These policies allow unauthenticated access!
-- Remove this migration when implementing proper authentication
