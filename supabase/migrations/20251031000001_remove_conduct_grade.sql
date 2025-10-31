-- Migration: Remove conduct_grade column from student_overview table
-- Date: 2025-10-31
-- Description: Removes the conduct_grade field as part of the conduct grade feature removal

-- Remove conduct_grade column from student_overview table
ALTER TABLE student_overview
DROP COLUMN IF EXISTS conduct_grade;

-- Add comment explaining the removal
COMMENT ON TABLE student_overview IS 'Student overview information (conduct_grade column removed on 2025-10-31)';
