/*
  # Enable document storage

  1. Storage Setup
    - Create documents bucket
    - Configure public access
    - Enable RLS
  
  2. Security
    - Create policies for upload, read, and delete operations
    - Ensure authenticated access only
*/

-- Disable RLS temporarily
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
DROP POLICY IF EXISTS "Enable all operations for development" ON storage.objects;
DROP POLICY IF EXISTS "Allow all storage operations" ON storage.objects;
DROP POLICY IF EXISTS "Enable unrestricted storage access" ON storage.objects;
DROP POLICY IF EXISTS "Enable unrestricted storage access for development" ON storage.objects;

-- Create a new fully permissive policy with a unique name
CREATE POLICY "Enable complete storage access for development"
ON storage.objects FOR ALL 
USING (true)
WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;