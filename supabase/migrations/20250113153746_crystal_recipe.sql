-- Create storage bucket for documents if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('documents', 'documents', true)
  ON CONFLICT (id) DO NOTHING;

  -- Create storage policy to allow authenticated users to upload files
  CREATE POLICY "Allow authenticated users to upload files"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'documents');

  -- Create storage policy to allow authenticated users to read files
  CREATE POLICY "Allow authenticated users to read files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'documents');

  -- Create storage policy to allow authenticated users to delete their files
  CREATE POLICY "Allow authenticated users to delete files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'documents');
END $$;