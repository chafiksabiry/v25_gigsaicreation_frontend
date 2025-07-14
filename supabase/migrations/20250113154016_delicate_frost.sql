/*
  # Storage Bucket and Policies Setup

  1. Changes
    - Creates documents storage bucket
    - Sets up RLS policies for file operations
  
  2. Security
    - Enables public access to bucket
    - Allows authenticated users to upload/read/delete files
*/

-- Create documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for file uploads
CREATE POLICY "Allow file uploads to documents"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Create policy for file reads
CREATE POLICY "Allow file reads from documents"
ON storage.objects FOR SELECT 
TO authenticated
USING (bucket_id = 'documents');

-- Create policy for file deletes
CREATE POLICY "Allow file deletes from documents"
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'documents');