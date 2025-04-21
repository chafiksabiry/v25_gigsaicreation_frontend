/*
  # Fix storage configuration

  1. Storage Setup
    - Create documents bucket
    - Configure public access
    - Set up proper policies
  
  2. Security
    - Enable RLS
    - Create permissive policy for development
*/

-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop all existing policies to start fresh
DO $$ 
BEGIN
  -- Drop all existing policies
  DROP POLICY IF EXISTS "Allow file uploads to documents" ON storage.objects;
  DROP POLICY IF EXISTS "Allow file reads from documents" ON storage.objects;
  DROP POLICY IF EXISTS "Allow file deletes from documents" ON storage.objects;
  DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON storage.objects;
  DROP POLICY IF EXISTS "Enable all operations for development" ON storage.objects;
  DROP POLICY IF EXISTS "Allow all storage operations" ON storage.objects;
  DROP POLICY IF EXISTS "Enable unrestricted storage access" ON storage.objects;
  DROP POLICY IF EXISTS "Enable unrestricted storage access for development" ON storage.objects;
  DROP POLICY IF EXISTS "Enable complete storage access for development" ON storage.objects;
  DROP POLICY IF EXISTS "Enable storage access for development" ON storage.objects;
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Development Access" ON storage.objects;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Disable RLS temporarily
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create a new development policy
CREATE POLICY "Development Access"
ON storage.objects
FOR ALL
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;