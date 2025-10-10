-- Migration: Social & Behaviour Tables
-- Description: Friend relationships and behaviour observations

-- =====================================================
-- FRIEND_RELATIONSHIPS TABLE
-- =====================================================
CREATE TABLE friend_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Relationship details
  relationship_type TEXT, -- 'close', 'peer', 'study_partner', etc.
  closeness_level TEXT CHECK (closeness_level IN ('very_close', 'close', 'acquaintance')),

  -- Observations
  notes TEXT,
  observed_by UUID REFERENCES teachers(id),
  observation_date DATE DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate relationships and self-relationships
  CHECK (student_id != friend_id),
  UNIQUE(student_id, friend_id)
);

-- Indexes for queries
CREATE INDEX idx_friend_relationships_student ON friend_relationships(student_id);
CREATE INDEX idx_friend_relationships_friend ON friend_relationships(friend_id);
CREATE INDEX idx_friend_relationships_type ON friend_relationships(relationship_type);

-- =====================================================
-- BEHAVIOUR_OBSERVATIONS TABLE
-- =====================================================
CREATE TABLE behaviour_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Observation details
  observation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL, -- 'positive', 'concern', 'neutral', 'discipline'
  title TEXT NOT NULL, -- Brief summary
  description TEXT NOT NULL, -- Detailed observation

  -- Severity (for concerning behaviours)
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),

  -- Context
  location TEXT, -- 'classroom', 'playground', 'canteen', etc.
  witnesses TEXT[], -- Other teachers/staff who witnessed

  -- Follow-up
  action_taken TEXT, -- What was done about it
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_date DATE,

  -- Who observed
  observed_by UUID NOT NULL REFERENCES teachers(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_behaviour_observations_student ON behaviour_observations(student_id, observation_date DESC);
CREATE INDEX idx_behaviour_observations_date ON behaviour_observations(observation_date DESC);
CREATE INDEX idx_behaviour_observations_category ON behaviour_observations(category);
CREATE INDEX idx_behaviour_observations_severity ON behaviour_observations(severity);
CREATE INDEX idx_behaviour_observations_follow_up ON behaviour_observations(requires_follow_up, follow_up_date);

-- =====================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGERS
-- =====================================================

CREATE TRIGGER friend_relationships_updated_at
  BEFORE UPDATE ON friend_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER behaviour_observations_updated_at
  BEFORE UPDATE ON behaviour_observations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE friend_relationships IS 'Student friendship and peer relationships';
COMMENT ON TABLE behaviour_observations IS 'Teacher observations of student behaviour (positive and concerning)';
COMMENT ON COLUMN friend_relationships.closeness_level IS 'How close the friendship is';
COMMENT ON COLUMN behaviour_observations.category IS 'Type of observation: positive, concern, neutral, discipline';
COMMENT ON COLUMN behaviour_observations.severity IS 'For concerning behaviours: low, medium, or high severity';
COMMENT ON COLUMN behaviour_observations.requires_follow_up IS 'Whether this observation needs follow-up action';
