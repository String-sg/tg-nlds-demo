-- Migration: Cases System
-- Description: Case management (discipline, SEN, counselling, career guidance) with issues

-- =====================================================
-- CASES TABLE
-- =====================================================
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Case identification
  case_number TEXT UNIQUE NOT NULL, -- e.g., "DIS-2025-001", "SEN-2025-042"
  case_type TEXT NOT NULL CHECK (case_type IN ('discipline', 'sen', 'counselling', 'career_guidance')),

  -- Case details
  title TEXT NOT NULL, -- Brief summary of case
  description TEXT, -- Detailed case description
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),

  -- Dates
  opened_date DATE NOT NULL DEFAULT CURRENT_DATE,
  closed_date DATE,

  -- Ownership
  created_by UUID NOT NULL REFERENCES teachers(id), -- Who opened the case
  assigned_to UUID REFERENCES teachers(id), -- Case officer (teacher handling the case)

  -- Guardian notification
  guardian_notified BOOLEAN DEFAULT false,
  guardian_notified_date DATE,
  guardian_notification_method TEXT, -- 'phone', 'email', 'meeting', 'letter'

  -- Additional context
  related_cases UUID[], -- Array of related case IDs
  attachments JSONB, -- [{ name, url, type, uploaded_at }]
  tags TEXT[], -- Custom tags for categorization

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_cases_student ON cases(student_id, opened_date DESC);
CREATE INDEX idx_cases_type ON cases(case_type);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_assigned ON cases(assigned_to);
CREATE INDEX idx_cases_opened_date ON cases(opened_date DESC);
CREATE INDEX idx_cases_case_number ON cases(case_number);

-- =====================================================
-- CASE_ISSUES TABLE (renamed from case_notes)
-- =====================================================
CREATE TABLE case_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

  -- Issue details
  issue_title TEXT NOT NULL, -- Brief description of this specific issue/incident
  issue_description TEXT, -- Detailed description
  occurred_date DATE NOT NULL DEFAULT CURRENT_DATE, -- When this issue occurred

  -- Severity of this specific issue
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),

  -- Issue type (specific to the case type)
  issue_type TEXT, -- e.g., 'incident', 'progress_note', 'session', 'intervention'

  -- Actions & Outcomes
  action_taken TEXT, -- What was done about this issue
  outcome TEXT, -- Result of the action
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,

  -- Context
  location TEXT, -- Where did this occur
  witnesses TEXT[], -- Who witnessed/was involved

  -- Attachments specific to this issue
  attachments JSONB, -- [{ name, url, type, uploaded_at }]

  -- Who recorded this issue
  created_by UUID NOT NULL REFERENCES teachers(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_case_issues_case ON case_issues(case_id, occurred_date DESC);
CREATE INDEX idx_case_issues_occurred_date ON case_issues(occurred_date DESC);
CREATE INDEX idx_case_issues_severity ON case_issues(severity);
CREATE INDEX idx_case_issues_follow_up ON case_issues(follow_up_required, follow_up_date);

-- =====================================================
-- HELPER FUNCTION: Auto-generate case numbers
-- =====================================================
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  year TEXT;
  sequence_num INTEGER;
  new_case_number TEXT;
BEGIN
  -- Determine prefix based on case type
  prefix := CASE NEW.case_type
    WHEN 'discipline' THEN 'DIS'
    WHEN 'sen' THEN 'SEN'
    WHEN 'counselling' THEN 'CNS'
    WHEN 'career_guidance' THEN 'CAR'
    ELSE 'CASE'
  END;

  -- Get current year
  year := TO_CHAR(NEW.opened_date, 'YYYY');

  -- Get next sequence number for this type and year
  SELECT COALESCE(MAX(SUBSTRING(case_number FROM '[0-9]+$')::INTEGER), 0) + 1
  INTO sequence_num
  FROM cases
  WHERE case_number LIKE prefix || '-' || year || '-%';

  -- Generate new case number
  new_case_number := prefix || '-' || year || '-' || LPAD(sequence_num::TEXT, 4, '0');

  NEW.case_number := new_case_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger only if case_number is not provided
CREATE TRIGGER auto_generate_case_number
  BEFORE INSERT ON cases
  FOR EACH ROW
  WHEN (NEW.case_number IS NULL OR NEW.case_number = '')
  EXECUTE FUNCTION generate_case_number();

-- =====================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGERS
-- =====================================================

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER case_issues_updated_at
  BEFORE UPDATE ON case_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTION: Auto-close case when resolved
-- =====================================================
CREATE OR REPLACE FUNCTION auto_set_closed_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'closed' and closed_date is not set
  IF NEW.status = 'closed' AND OLD.status != 'closed' AND NEW.closed_date IS NULL THEN
    NEW.closed_date := CURRENT_DATE;
  END IF;

  -- If status changed from 'closed' to something else, clear closed_date
  IF NEW.status != 'closed' AND OLD.status = 'closed' THEN
    NEW.closed_date := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_set_closed_date_trigger
  BEFORE UPDATE ON cases
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION auto_set_closed_date();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE cases IS 'Case management for discipline, SEN, counselling, and career guidance';
COMMENT ON TABLE case_issues IS 'Individual issues/incidents/notes within a case';
COMMENT ON COLUMN cases.case_number IS 'Auto-generated unique case number (e.g., DIS-2025-0001)';
COMMENT ON COLUMN cases.case_type IS 'Type of case: discipline, sen, counselling, career_guidance';
COMMENT ON COLUMN cases.assigned_to IS 'Teacher assigned as case officer';
COMMENT ON COLUMN case_issues.issue_title IS 'Brief description of this specific issue/incident';
COMMENT ON COLUMN case_issues.action_taken IS 'What was done to address this issue';
COMMENT ON COLUMN case_issues.outcome IS 'Result of the action taken';
