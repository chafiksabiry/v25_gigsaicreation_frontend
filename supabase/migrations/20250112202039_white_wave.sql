/*
  # Update seniority level validation

  1. Changes
    - Add check constraint for predefined seniority levels
    - Ensures only valid seniority levels can be inserted
    - Seniority levels match the application's predefined list

  2. Security
    - Maintains existing RLS policies
    - No security changes needed
*/

DO $$ BEGIN
  -- Add check constraint to ensure seniority_level is valid
  ALTER TABLE gigs
    ADD CONSTRAINT valid_seniority_level_check
    CHECK (seniority_level = ANY(
      ARRAY[
        'Entry Level',
        'Junior',
        'Mid-Level',
        'Senior',
        'Team Lead',
        'Supervisor',
        'Manager',
        'Director'
      ]
    ));
END $$;