/*
  # Allow anonymous gig creation
  
  1. Changes
    - Update RLS policy to allow anonymous users to create gigs
    - Add policy for anonymous gig creation with specific UUID
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can create gigs" ON gigs;

-- Create new policy that allows both authenticated and anonymous users
CREATE POLICY "Anyone can create gigs"
  ON gigs
  FOR INSERT
  WITH CHECK (
    creator_id = '00000000-0000-0000-0000-000000000000' OR -- Allow anonymous user
    auth.uid() = creator_id -- Allow authenticated users
  );

-- Update select policy to allow viewing all gigs
DROP POLICY IF EXISTS "Gigs are viewable by everyone" ON gigs;

CREATE POLICY "Gigs are viewable by everyone"
  ON gigs
  FOR SELECT
  USING (true);