-- Migration: Add conduct_grade to student_overview
-- Description: Add conduct_grade column to track student conduct/behavior assessment
-- Based on Singapore MOE conduct grading system

ALTER TABLE student_overview
ADD COLUMN conduct_grade TEXT CHECK (conduct_grade IN ('Excellent', 'Very Good', 'Good', 'Fair', 'Poor'));

COMMENT ON COLUMN student_overview.conduct_grade IS 'Overall conduct/behavior grade for the student (Singapore MOE system)';
