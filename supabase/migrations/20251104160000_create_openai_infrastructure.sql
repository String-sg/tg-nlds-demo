-- Migration: OpenAI Infrastructure
-- Description: Set up storage bucket, rate limiting, and usage tracking for OpenAI integration
-- Date: 2025-11-04

-- =====================================================
-- STORAGE BUCKET: Student Photos
-- =====================================================

-- Create public bucket for student profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-photos',
  'student-photos',
  true,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- RLS POLICIES: Storage
-- =====================================================

-- Allow public read access to student photos
CREATE POLICY "Allow public read access to student photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-photos');

-- Allow authenticated teachers to upload student photos
CREATE POLICY "Allow authenticated upload to student photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-photos');

-- Allow authenticated teachers to update student photos
CREATE POLICY "Allow authenticated update of student photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-photos');

-- Allow authenticated teachers to delete student photos
CREATE POLICY "Allow authenticated delete of student photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-photos');

-- =====================================================
-- TABLE: Rate Limits
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chat', 'image')),
  endpoint TEXT, -- Optional: specific endpoint that was called
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient rate limit checks (user + type + recent time window)
CREATE INDEX idx_rate_limits_user_type_time ON rate_limits(user_id, type, created_at DESC);

-- Index for cleanup queries
CREATE INDEX idx_rate_limits_created_at ON rate_limits(created_at);

-- Comment
COMMENT ON TABLE rate_limits IS 'Tracks API requests for rate limiting (10 chat/min, 5 images/min)';
COMMENT ON COLUMN rate_limits.type IS 'Type of request: chat or image';
COMMENT ON COLUMN rate_limits.endpoint IS 'Optional: API endpoint that was called';

-- =====================================================
-- TABLE: OpenAI Usage Tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS openai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chat', 'image')),

  -- Chat-specific fields
  model TEXT, -- e.g., 'gpt-4o-mini', 'dall-e-3'
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,

  -- Cost tracking
  estimated_cost NUMERIC(10, 6) DEFAULT 0, -- Cost in USD

  -- Request metadata
  request_data JSONB, -- Store request parameters
  response_data JSONB, -- Store response metadata

  -- Error tracking
  error TEXT, -- If request failed

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_openai_usage_user_id ON openai_usage(user_id, created_at DESC);
CREATE INDEX idx_openai_usage_type ON openai_usage(type, created_at DESC);
CREATE INDEX idx_openai_usage_created_at ON openai_usage(created_at);
CREATE INDEX idx_openai_usage_model ON openai_usage(model);

-- Comment
COMMENT ON TABLE openai_usage IS 'Tracks all OpenAI API usage for cost monitoring and analytics';
COMMENT ON COLUMN openai_usage.prompt_tokens IS 'Input tokens (chat only)';
COMMENT ON COLUMN openai_usage.completion_tokens IS 'Output tokens (chat only)';
COMMENT ON COLUMN openai_usage.estimated_cost IS 'Estimated cost in USD based on token usage';

-- =====================================================
-- FUNCTION: Clean up old rate limit records
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete rate limit records older than 1 hour
  DELETE FROM rate_limits
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$;

COMMENT ON FUNCTION cleanup_old_rate_limits() IS 'Cleanup function to remove old rate limit records (call via cron)';

-- =====================================================
-- VIEW: Usage Summary by User
-- =====================================================

CREATE OR REPLACE VIEW openai_usage_summary AS
SELECT
  u.user_id,
  t.name as teacher_name,
  COUNT(*) FILTER (WHERE u.type = 'chat') as total_chat_requests,
  COUNT(*) FILTER (WHERE u.type = 'image') as total_image_requests,
  SUM(u.total_tokens) FILTER (WHERE u.type = 'chat') as total_chat_tokens,
  SUM(u.estimated_cost) as total_cost,
  MAX(u.created_at) as last_request_at
FROM openai_usage u
JOIN teachers t ON u.user_id = t.id
GROUP BY u.user_id, t.name;

COMMENT ON VIEW openai_usage_summary IS 'Summary of OpenAI usage by teacher for analytics dashboard';

-- =====================================================
-- VIEW: Daily Usage Statistics
-- =====================================================

CREATE OR REPLACE VIEW openai_daily_stats AS
SELECT
  DATE(created_at) as date,
  type,
  COUNT(*) as request_count,
  SUM(total_tokens) FILTER (WHERE type = 'chat') as total_tokens,
  SUM(estimated_cost) as total_cost,
  AVG(estimated_cost) as avg_cost_per_request
FROM openai_usage
GROUP BY DATE(created_at), type
ORDER BY date DESC, type;

COMMENT ON VIEW openai_daily_stats IS 'Daily statistics for monitoring OpenAI usage trends and costs';

-- =====================================================
-- RLS POLICIES: Usage Tables
-- =====================================================

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE openai_usage ENABLE ROW LEVEL SECURITY;

-- Teachers can only see their own rate limits
CREATE POLICY "Teachers can view own rate limits"
ON rate_limits FOR SELECT
TO authenticated
USING (user_id = auth.uid()::uuid);

-- Teachers can only see their own usage
CREATE POLICY "Teachers can view own usage"
ON openai_usage FOR SELECT
TO authenticated
USING (user_id = auth.uid()::uuid);

-- Service role can access all (for admin/monitoring)
CREATE POLICY "Service role has full access to rate_limits"
ON rate_limits FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to openai_usage"
ON openai_usage FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
