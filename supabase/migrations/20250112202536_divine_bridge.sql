/*
  # Enhance skills section with comprehensive categories

  1. Changes
    - Add new skill categories for better skill matching
    - Update skill_category enum with new values
    - Add level field for all skill types
    - Add priority field for skill importance

  2. Security
    - Maintains existing RLS policies
    - No security changes needed
*/

-- Add new values to skill_category enum
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'certification';
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'technical';
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'methodology';
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'industry';
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'compliance';

-- Add new columns to gig_skills table
ALTER TABLE gig_skills 
  ADD COLUMN IF NOT EXISTS priority smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS years_experience text,
  ADD COLUMN IF NOT EXISTS certification_date date,
  ADD COLUMN IF NOT EXISTS expiration_date date;

-- Add check constraint for priority levels
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_priority_check'
  ) THEN
    ALTER TABLE gig_skills
      ADD CONSTRAINT valid_priority_check
      CHECK (priority BETWEEN 0 AND 5);
  END IF;
END $$;