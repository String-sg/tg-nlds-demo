-- Migration: Guardian and Student Tables
-- Description: Parent/guardian information and student records with relationships

-- =====================================================
-- PARENTS_GUARDIANS TABLE
-- =====================================================
CREATE TABLE parents_guardians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- e.g., 'father', 'mother', 'guardian', 'grandparent'
  phone TEXT NOT NULL,
  email TEXT,
  occupation TEXT,
  work_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for searching
CREATE INDEX idx_parents_guardians_name ON parents_guardians(name);
CREATE INDEX idx_parents_guardians_phone ON parents_guardians(phone);

-- =====================================================
-- STUDENTS TABLE
-- =====================================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT UNIQUE NOT NULL, -- School's student ID (e.g., "S12345")
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  nationality TEXT,
  form_teacher_id UUID REFERENCES teachers(id), -- Main form teacher
  primary_guardian_id UUID NOT NULL REFERENCES parents_guardians(id), -- Main contact
  academic_year TEXT NOT NULL DEFAULT '2025',
  year_level TEXT, -- e.g., "5", "6", "7"
  profile_photo TEXT, -- URL or path to photo
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_students_form_teacher ON students(form_teacher_id);
CREATE INDEX idx_students_year_level ON students(year_level);
CREATE INDEX idx_students_primary_guardian ON students(primary_guardian_id);

-- =====================================================
-- STUDENT_GUARDIANS (Junction Table - Additional Guardians)
-- =====================================================
CREATE TABLE student_guardians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES parents_guardians(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false, -- Denormalized for quick queries
  emergency_contact_priority INTEGER NOT NULL DEFAULT 1, -- 1 = first contact, 2 = second, etc.
  can_pickup BOOLEAN NOT NULL DEFAULT true, -- Authorized to pick up student
  notes TEXT, -- Special notes about this guardian relationship
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate guardian assignments
  UNIQUE(student_id, guardian_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_student_guardians_student ON student_guardians(student_id);
CREATE INDEX idx_student_guardians_guardian ON student_guardians(guardian_id);
CREATE INDEX idx_student_guardians_priority ON student_guardians(student_id, emergency_contact_priority);

-- =====================================================
-- STUDENT_CLASSES (Junction Table - Student Enrollments)
-- =====================================================
CREATE TABLE student_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate enrollments
  UNIQUE(student_id, class_id)
);

-- Indexes for common queries
CREATE INDEX idx_student_classes_student ON student_classes(student_id);
CREATE INDEX idx_student_classes_class ON student_classes(class_id);
CREATE INDEX idx_student_classes_status ON student_classes(status);

-- =====================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGERS
-- =====================================================

-- Parents/Guardians
CREATE TRIGGER parents_guardians_updated_at
  BEFORE UPDATE ON parents_guardians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Students
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTION: Auto-sync primary guardian in student_guardians
-- =====================================================
CREATE OR REPLACE FUNCTION sync_primary_guardian()
RETURNS TRIGGER AS $$
BEGIN
  -- When primary_guardian_id changes, ensure it exists in student_guardians with is_primary=true
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.primary_guardian_id IS DISTINCT FROM NEW.primary_guardian_id)) THEN

    -- Unmark all other guardians as primary
    UPDATE student_guardians
    SET is_primary = false
    WHERE student_id = NEW.id;

    -- Insert or update the primary guardian
    INSERT INTO student_guardians (student_id, guardian_id, is_primary, emergency_contact_priority)
    VALUES (NEW.id, NEW.primary_guardian_id, true, 1)
    ON CONFLICT (student_id, guardian_id)
    DO UPDATE SET is_primary = true, emergency_contact_priority = 1;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to students table
CREATE TRIGGER sync_primary_guardian_trigger
  AFTER INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION sync_primary_guardian();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE parents_guardians IS 'Parent and guardian contact information';
COMMENT ON TABLE students IS 'All students in the school with primary contact and form teacher';
COMMENT ON TABLE student_guardians IS 'Junction table linking students to multiple guardians with emergency contact priority';
COMMENT ON TABLE student_classes IS 'Junction table linking students to their enrolled classes';
COMMENT ON COLUMN students.primary_guardian_id IS 'Main contact guardian (required, also synced to student_guardians)';
COMMENT ON COLUMN student_guardians.emergency_contact_priority IS 'Order to contact in emergencies (1=first, 2=second, etc.)';
COMMENT ON COLUMN student_guardians.can_pickup IS 'Whether this guardian is authorized to pick up the student';
