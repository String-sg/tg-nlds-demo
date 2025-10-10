-- Migration: Core Tables (Teachers, Classes, Teacher-Class Relationships)
-- Description: Foundation tables for the teacher-student management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TEACHERS TABLE
-- =====================================================
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT,
  avatar TEXT, -- Initials or avatar URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_teachers_email ON teachers(email);

-- =====================================================
-- CLASSES TABLE
-- =====================================================
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g., "5A", "6B", "Math Club"
  type TEXT NOT NULL CHECK (type IN ('subject', 'form', 'cca')),
  subject_name TEXT, -- For subject classes
  year_level TEXT, -- e.g., "5", "6", "7"
  academic_year TEXT NOT NULL DEFAULT '2025',
  schedule JSONB, -- [{ day, start_time, end_time, location }]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_classes_type ON classes(type);
CREATE INDEX idx_classes_year_level ON classes(year_level);
CREATE INDEX idx_classes_academic_year ON classes(academic_year);

-- =====================================================
-- TEACHER_CLASSES (Junction Table)
-- =====================================================
CREATE TABLE teacher_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'form_teacher')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate assignments
  UNIQUE(teacher_id, class_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_teacher_classes_teacher ON teacher_classes(teacher_id);
CREATE INDEX idx_teacher_classes_class ON teacher_classes(class_id);
CREATE INDEX idx_teacher_classes_role ON teacher_classes(role);

-- =====================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to teachers table
CREATE TRIGGER teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to classes table
CREATE TRIGGER classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE teachers IS 'All teachers in the system';
COMMENT ON TABLE classes IS 'All classes (subject, form, and CCA classes)';
COMMENT ON TABLE teacher_classes IS 'Junction table mapping teachers to their assigned classes';
COMMENT ON COLUMN classes.type IS 'Type of class: subject (academic), form (homeroom), or cca (co-curricular activity)';
COMMENT ON COLUMN teacher_classes.role IS 'Teacher role in class: teacher (regular) or form_teacher (homeroom teacher)';
