/*
  # Fix Language Level Validation

  1. Changes
    - Update the language level check constraint to match UI options
    - Ensure consistency between UI and database validation

  2. Security
    - Maintains existing RLS policies
    - No security changes needed
*/

-- Drop existing constraint if it exists
ALTER TABLE gig_skills DROP CONSTRAINT IF EXISTS valid_language_level_check;

-- Add updated constraint
ALTER TABLE gig_skills
  ADD CONSTRAINT valid_language_level_check
  CHECK (
    category != 'language' OR
    level = ANY(ARRAY[
      'Basic',
      'Conversational',
      'Professional',
      'Native/Bilingual'
    ])
  );