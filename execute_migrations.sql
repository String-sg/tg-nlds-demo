-- Execute Database Migrations
-- This file combines all pending migrations for execution
-- Generated: 2025-10-31

-- ============================================================================
-- Migration 1: Remove conduct_grade column from student_overview table
-- ============================================================================

-- Remove conduct_grade column from student_overview table
ALTER TABLE student_overview
DROP COLUMN IF EXISTS conduct_grade;

-- Add comment explaining the removal
COMMENT ON TABLE student_overview IS 'Student overview information (conduct_grade column removed on 2025-10-31)';

-- ============================================================================
-- Migration 2: Remove reports system tables
-- ============================================================================

-- Drop report_comments table first (has foreign key to reports)
DROP TABLE IF EXISTS report_comments CASCADE;

-- Drop reports table
DROP TABLE IF EXISTS reports CASCADE;

-- Add audit log comment
COMMENT ON SCHEMA public IS 'Public schema (reports system removed on 2025-10-31)';
