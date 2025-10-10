-- Migration: Student Data Tables
-- Description: Overview, private notes, attendance, academic results, physical fitness, CCE

-- =====================================================
-- STUDENT_OVERVIEW TABLE
-- =====================================================
CREATE TABLE student_overview (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Background information
  background TEXT,
  medical_conditions JSONB, -- { allergies: [], medications: [], conditions: [] }

  -- Health & Wellness
  health_declaration JSONB, -- { last_updated: date, details: {...} }
  mental_wellness JSONB, -- { assessments: [], notes: [] }

  -- Family & Social
  family JSONB, -- { siblings: [], home_situation: '', notes: '' }
  housing_finance JSONB, -- { housing_type: '', financial_assistance: bool, schemes: [] }

  -- Special Educational Needs
  is_swan BOOLEAN DEFAULT false, -- Student With Additional Needs
  swan_details JSONB, -- { type: '', support_plan: '', accommodations: [] }

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick student lookups
CREATE INDEX idx_student_overview_student ON student_overview(student_id);
CREATE INDEX idx_student_overview_swan ON student_overview(is_swan);

-- =====================================================
-- STUDENT_PRIVATE_NOTES TABLE
-- =====================================================
CREATE TABLE student_private_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES teachers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_private_notes_student ON student_private_notes(student_id, created_at DESC);
CREATE INDEX idx_private_notes_teacher ON student_private_notes(created_by);

-- =====================================================
-- ATTENDANCE TABLE
-- =====================================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL, -- Optional: specific class
  date DATE NOT NULL,

  -- Attendance type
  type TEXT NOT NULL DEFAULT 'daily' CHECK (type IN ('daily', 'cca', 'school_event')),

  -- Status
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'early_dismissal')),

  -- Additional details
  is_official BOOLEAN DEFAULT false, -- Official excuse (medical cert, etc.)
  reason TEXT,
  remarks TEXT,

  -- Timestamps
  check_in_time TIME,
  check_out_time TIME,

  recorded_by UUID REFERENCES teachers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate attendance records
  UNIQUE(student_id, class_id, date, type)
);

-- Indexes for common queries
CREATE INDEX idx_attendance_student ON attendance(student_id, date DESC);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_class ON attendance(class_id, date DESC);
CREATE INDEX idx_attendance_status ON attendance(status);

-- =====================================================
-- ACADEMIC_RESULTS TABLE
-- =====================================================
CREATE TABLE academic_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL, -- Subject class

  -- Assessment details
  assessment_type TEXT NOT NULL, -- 'exam', 'quiz', 'assignment', 'CCA assessment', etc.
  assessment_name TEXT NOT NULL, -- e.g., "Mid-Year Exam", "Math Quiz 3"
  assessment_date DATE NOT NULL,
  term TEXT, -- e.g., "Term 1 2025"

  -- Scoring
  score DECIMAL(5,2), -- e.g., 87.50
  max_score DECIMAL(5,2), -- e.g., 100.00
  percentage DECIMAL(5,2), -- Auto-calculated or manual
  grade TEXT, -- e.g., "A", "B+", "Pass"

  -- Additional info
  remarks JSONB, -- { strengths: [], areas_for_improvement: [], teacher_comments: '' }

  created_by UUID REFERENCES teachers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for queries
CREATE INDEX idx_academic_results_student ON academic_results(student_id, assessment_date DESC);
CREATE INDEX idx_academic_results_class ON academic_results(class_id);
CREATE INDEX idx_academic_results_term ON academic_results(term);
CREATE INDEX idx_academic_results_type ON academic_results(assessment_type);

-- =====================================================
-- PHYSICAL_FITNESS TABLE
-- =====================================================
CREATE TABLE physical_fitness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  assessment_date DATE NOT NULL,
  assessment_type TEXT NOT NULL, -- e.g., "NAPFA", "PE Assessment"

  -- Flexible metrics storage (different assessments have different metrics)
  metrics JSONB NOT NULL, -- { sit_ups: 40, shuttle_run: '9.5s', bmi: 18.2, etc. }

  -- Overall results
  overall_grade TEXT, -- e.g., "Gold", "Silver", "Bronze", "Pass"
  pass_status BOOLEAN,

  remarks TEXT,
  assessed_by UUID REFERENCES teachers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_physical_fitness_student ON physical_fitness(student_id, assessment_date DESC);
CREATE INDEX idx_physical_fitness_type ON physical_fitness(assessment_type);

-- =====================================================
-- CCE_RESULTS TABLE (Character, Citizenship, Education)
-- =====================================================
CREATE TABLE cce_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  term TEXT NOT NULL, -- e.g., "Term 1 2025"
  academic_year TEXT NOT NULL,

  -- CCE Components
  character TEXT, -- Teacher's assessment of character development
  citizenship TEXT, -- Citizenship qualities
  education TEXT, -- Life skills, values education

  -- Overall CCE grade/remarks
  overall_grade TEXT, -- e.g., "Excellent", "Good", "Fair"
  comments TEXT, -- Overall CCE comments

  assessed_by UUID REFERENCES teachers(id), -- Usually form teacher
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One CCE result per student per term
  UNIQUE(student_id, term, academic_year)
);

-- Indexes
CREATE INDEX idx_cce_results_student ON cce_results(student_id, term);
CREATE INDEX idx_cce_results_term ON cce_results(term, academic_year);

-- =====================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGERS
-- =====================================================

CREATE TRIGGER student_overview_updated_at
  BEFORE UPDATE ON student_overview
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER student_private_notes_updated_at
  BEFORE UPDATE ON student_private_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER academic_results_updated_at
  BEFORE UPDATE ON academic_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER physical_fitness_updated_at
  BEFORE UPDATE ON physical_fitness
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cce_results_updated_at
  BEFORE UPDATE ON cce_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE student_overview IS 'Student background, health, family, and SWAN information';
COMMENT ON TABLE student_private_notes IS 'Private teacher notes for students (multi-teacher, chronological)';
COMMENT ON TABLE attendance IS 'Daily attendance, CCA attendance, and school event attendance';
COMMENT ON TABLE academic_results IS 'Academic assessment results across all subjects and classes';
COMMENT ON TABLE physical_fitness IS 'Physical fitness assessments (NAPFA, PE, etc.)';
COMMENT ON TABLE cce_results IS 'Character, Citizenship, Education assessments per term';
COMMENT ON COLUMN student_overview.is_swan IS 'Student With Additional Needs flag';
COMMENT ON COLUMN attendance.is_official IS 'Whether absence has official documentation (MC, etc.)';
