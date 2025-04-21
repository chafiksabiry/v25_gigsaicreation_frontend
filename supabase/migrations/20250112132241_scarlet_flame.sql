/*
  # Add default policy for testing
  
  1. Changes
    - Add a default policy to allow all operations during development
    - This is temporary and should be replaced with proper auth in production
*/

-- Temporarily disable RLS policies for development
ALTER TABLE gigs DISABLE ROW LEVEL SECURITY;
ALTER TABLE gig_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE gig_documentation DISABLE ROW LEVEL SECURITY;
ALTER TABLE gig_leads DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Organizations can manage their own gigs" ON gigs;
DROP POLICY IF EXISTS "Organizations can manage their gigs' skills" ON gig_skills;
DROP POLICY IF EXISTS "Organizations can manage their gigs' documentation" ON gig_documentation;
DROP POLICY IF EXISTS "Organizations can manage their gigs' leads" ON gig_leads;

-- Add new policies that allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON gigs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON gig_skills
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON gig_documentation
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON gig_leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);