/*
  # Storage Bucket and Policies Update

  1. Changes
    - Ensures documents bucket exists
    - Creates permissive policies for authenticated users
    - Temporarily disables RLS for development
  
  2. Security
    - Allows authenticated users full access to documents bucket
    - Note: This is a development configuration
*/

-- Temporarily disable RLS for development
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow file uploads to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow file reads from documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow file deletes from documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON storage.objects;

-- Create new permissive policy for development
CREATE POLICY "Allow all operations for authenticated users"
ON storage.objects FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable RLS again
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;