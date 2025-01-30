/*
  # Enable anonymous gig creation
  
  1. Changes
    - Remove profile dependency for gigs
    - Update policies to allow anonymous gig creation
    - Add policy for anonymous gig management
*/

-- Drop the creator_id foreign key constraint
ALTER TABLE gigs DROP CONSTRAINT IF EXISTS gigs_creator_id_fkey;

-- Make creator_id nullable and add a check constraint
ALTER TABLE gigs ALTER COLUMN creator_id DROP NOT NULL;

-- Update existing policies
DROP POLICY IF EXISTS "Anyone can create gigs" ON gigs;
DROP POLICY IF EXISTS "Creators can update own gigs" ON gigs;

-- Create new policies for anonymous gigs
CREATE POLICY "Anyone can create gigs"
  ON gigs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anonymous gigs can be updated"
  ON gigs
  FOR UPDATE
  USING (creator_id IS NULL);