-- Migration: Remove Dangerous Development Policies
-- Description: SECURITY FIX - Remove all public access DEV policies
-- These policies were allowing unauthenticated access to all sensitive data

-- Drop all DEV policies from 20250110000007_add_dev_policies.sql
DROP POLICY IF EXISTS "DEV: Public read teachers" ON teachers;
DROP POLICY IF EXISTS "DEV: Public read classes" ON classes;
DROP POLICY IF EXISTS "DEV: Public read teacher_classes" ON teacher_classes;
DROP POLICY IF EXISTS "DEV: Public read students" ON students;
DROP POLICY IF EXISTS "DEV: Public read guardians" ON parents_guardians;
DROP POLICY IF EXISTS "DEV: Public read student_guardians" ON student_guardians;
DROP POLICY IF EXISTS "DEV: Public read student_classes" ON student_classes;
DROP POLICY IF EXISTS "DEV: Public read student_overview" ON student_overview;
DROP POLICY IF EXISTS "DEV: Public read student_private_notes" ON student_private_notes;
DROP POLICY IF EXISTS "DEV: Public read attendance" ON attendance;
DROP POLICY IF EXISTS "DEV: Public read academic_results" ON academic_results;
DROP POLICY IF EXISTS "DEV: Public read physical_fitness" ON physical_fitness;
DROP POLICY IF EXISTS "DEV: Public read cce_results" ON cce_results;
DROP POLICY IF EXISTS "DEV: Public read cases" ON cases;
DROP POLICY IF EXISTS "DEV: Public read case_issues" ON case_issues;
DROP POLICY IF EXISTS "DEV: Public read reports" ON reports;
DROP POLICY IF EXISTS "DEV: Public read report_comments" ON report_comments;

-- Drop all DEV policies from 20250110000008_add_remaining_dev_policies.sql
DROP POLICY IF EXISTS "DEV: Public read friend_relationships" ON friend_relationships;
DROP POLICY IF EXISTS "DEV: Public read behaviour_observations" ON behaviour_observations;

-- The proper RLS policies from 20250110000006_create_rls_policies.sql will now be enforced
