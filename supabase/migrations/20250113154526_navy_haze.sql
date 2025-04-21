/*
  # Storage Permissions Update

  1. Changes
    - Disables RLS temporarily for development
    - Ensures documents bucket exists and is public
    - Creates fully permissive policies for development
  
  2. Security
    - Note: This is a development-only configuration
    - Allows all operations for authenticated users
*/

-- Temporarily disable RLS
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow file uploads to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow file reads from documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow file deletes from documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON storage.objects;

-- Create a single permissive policy for development
CREATE POLICY "Enable all operations for development"
ON storage.objects FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;