-- Migration: Add subject column to academic_results
-- Description: Add subject field to academic_results for easier querying

ALTER TABLE academic_results
ADD COLUMN subject TEXT;

COMMENT ON COLUMN academic_results.subject IS 'Subject name (e.g., English, Mathematics, Science)';

-- Update existing records to populate subject from classes table
UPDATE academic_results ar
SET subject = c.subject_name
FROM classes c
WHERE ar.class_id = c.id
AND ar.subject IS NULL;
