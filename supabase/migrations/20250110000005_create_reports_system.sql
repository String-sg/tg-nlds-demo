-- Migration: Reports System
-- Description: HDP (Holistic Development Profile) reports with approval workflow

-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Report identification
  term TEXT NOT NULL, -- e.g., "Term 1 2025", "Term 2 2025"
  academic_year TEXT NOT NULL, -- e.g., "2025"
  report_type TEXT NOT NULL DEFAULT 'hdp' CHECK (report_type IN ('hdp', 'progress', 'special')),

  -- Workflow status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'needs_review', 'approved', 'published')),

  -- Report content (structured JSON)
  content JSONB NOT NULL DEFAULT '{}', -- Flexible structure for different report sections

  -- Workflow tracking
  created_by UUID NOT NULL REFERENCES teachers(id), -- Usually form teacher
  reviewed_by UUID REFERENCES teachers(id), -- Head of Department, etc.
  approved_by UUID REFERENCES teachers(id), -- Principal, Vice Principal

  -- Dates
  published_date DATE,
  review_requested_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One HDP report per student per term
  UNIQUE(student_id, term, academic_year, report_type)
);

-- Indexes for common queries
CREATE INDEX idx_reports_student ON reports(student_id, term);
CREATE INDEX idx_reports_term ON reports(term, academic_year);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_reviewed_by ON reports(reviewed_by);
CREATE INDEX idx_reports_approved_by ON reports(approved_by);

-- =====================================================
-- REPORT_COMMENTS TABLE
-- =====================================================
CREATE TABLE report_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

  commenter_id UUID NOT NULL REFERENCES teachers(id),
  comment TEXT NOT NULL,

  -- Comment type
  comment_type TEXT NOT NULL DEFAULT 'feedback' CHECK (
    comment_type IN ('feedback', 'revision_request', 'approval', 'question', 'general')
  ),

  -- Is this comment resolved?
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES teachers(id),
  resolved_at TIMESTAMPTZ,

  -- Threading (optional: reply to another comment)
  parent_comment_id UUID REFERENCES report_comments(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for queries
CREATE INDEX idx_report_comments_report ON report_comments(report_id, created_at);
CREATE INDEX idx_report_comments_commenter ON report_comments(commenter_id);
CREATE INDEX idx_report_comments_type ON report_comments(comment_type);
CREATE INDEX idx_report_comments_unresolved ON report_comments(is_resolved, report_id);
CREATE INDEX idx_report_comments_parent ON report_comments(parent_comment_id);

-- =====================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGERS
-- =====================================================

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER report_comments_updated_at
  BEFORE UPDATE ON report_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTION: Auto-set workflow timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_report_workflow_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to 'needs_review'
  IF NEW.status = 'needs_review' AND OLD.status != 'needs_review' THEN
    NEW.review_requested_at := NOW();
  END IF;

  -- When reviewed_by is set
  IF NEW.reviewed_by IS NOT NULL AND OLD.reviewed_by IS DISTINCT FROM NEW.reviewed_by THEN
    NEW.reviewed_at := NOW();
  END IF;

  -- When status changes to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at := NOW();
  END IF;

  -- When status changes to 'published'
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_report_workflow_timestamps_trigger
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_report_workflow_timestamps();

-- =====================================================
-- HELPER FUNCTION: Auto-resolve comment timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_comment_resolved_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- When is_resolved changes to true
  IF NEW.is_resolved = true AND OLD.is_resolved = false THEN
    NEW.resolved_at := NOW();
  END IF;

  -- When is_resolved changes to false, clear resolved_at and resolved_by
  IF NEW.is_resolved = false AND OLD.is_resolved = true THEN
    NEW.resolved_at := NULL;
    NEW.resolved_by := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_resolved_timestamp_trigger
  BEFORE UPDATE ON report_comments
  FOR EACH ROW
  WHEN (OLD.is_resolved IS DISTINCT FROM NEW.is_resolved)
  EXECUTE FUNCTION update_comment_resolved_timestamp();

-- =====================================================
-- EXAMPLE REPORT CONTENT STRUCTURE (documentation)
-- =====================================================
/*
Example report.content JSONB structure:

{
  "student_info": {
    "name": "Eric Lim",
    "class": "5A",
    "year": "2025"
  },
  "academic_performance": {
    "summary": "Eric has shown consistent improvement...",
    "subjects": [
      {
        "name": "Mathematics",
        "grade": "A",
        "comments": "Excellent problem-solving skills..."
      }
    ],
    "strengths": "Strong analytical thinking, good participation",
    "areas_for_improvement": "Time management during exams"
  },
  "attendance": {
    "days_present": 45,
    "days_absent": 2,
    "tardiness": 3,
    "summary": "Generally good attendance with minor tardiness issues"
  },
  "cce": {
    "character": "Shows respect and responsibility...",
    "citizenship": "Active participant in school events...",
    "education": "Demonstrates strong values..."
  },
  "social_emotional": {
    "peer_relationships": "Has close friendships, works well in groups",
    "behaviour": "Generally positive behaviour with occasional...",
    "wellbeing": "Appears well-adjusted and happy"
  },
  "extracurricular": {
    "cca_participation": "Active member of Math Club and Robotics",
    "achievements": [
      "Math Olympiad Bronze Medal",
      "Robotics Competition Finalist"
    ]
  },
  "overall_comments": "Eric is a well-rounded student...",
  "next_term_goals": [
    "Improve time management",
    "Continue strong academic performance",
    "Take on leadership role in Math Club"
  ],
  "private_notes": "CONFIDENTIAL: Eric's family situation requires sensitive handling..."
}
*/

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE reports IS 'HDP and progress reports with approval workflow';
COMMENT ON TABLE report_comments IS 'Comments and feedback on reports during review process';
COMMENT ON COLUMN reports.status IS 'Workflow status: draft → needs_review → approved → published';
COMMENT ON COLUMN reports.content IS 'Structured JSONB content containing all report sections';
COMMENT ON COLUMN report_comments.comment_type IS 'Type of comment: feedback, revision_request, approval, question, general';
COMMENT ON COLUMN report_comments.is_resolved IS 'Whether this comment has been addressed';
COMMENT ON COLUMN report_comments.parent_comment_id IS 'For threaded discussions (replies to comments)';
