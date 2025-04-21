/*
  # Make org_id Optional for Development

  1. Changes
    - Make org_id column nullable for development purposes
    - Update existing constraint
  
  2. Security
    - This is a temporary change for development
    - In production, org_id should be required
*/

-- Make org_id nullable for development
ALTER TABLE gigs
  ALTER COLUMN org_id DROP NOT NULL;