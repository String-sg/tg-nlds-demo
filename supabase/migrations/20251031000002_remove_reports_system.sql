-- Migration: Remove reports system tables
-- Date: 2025-10-31
-- Description: Removes reports and report_comments tables as part of report feature removal

-- Drop report_comments table first (has foreign key to reports)
DROP TABLE IF EXISTS report_comments CASCADE;

-- Drop reports table
DROP TABLE IF EXISTS reports CASCADE;

-- Add audit log comment
COMMENT ON SCHEMA public IS 'Public schema (reports system removed on 2025-10-31)';
