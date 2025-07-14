/*
  # Update document type enum

  1. Changes
    - Add 'training' and 'process' to doc_type enum
    - Update existing enum to support all document types
    - Safely handle existing data

  Note: Using a temporary column to safely migrate data
*/

-- Create new enum type with all values
CREATE TYPE doc_type_new AS ENUM ('product', 'sales', 'process', 'training');

-- Add new column with new enum type
ALTER TABLE gig_documentation 
  ADD COLUMN doc_type_new doc_type_new;

-- Copy data from old column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gig_documentation' 
    AND column_name = 'doc_type'
  ) THEN
    UPDATE gig_documentation 
    SET doc_type_new = doc_type::text::doc_type_new;
  END IF;
END $$;

-- Drop old column and rename new one
ALTER TABLE gig_documentation 
  DROP COLUMN doc_type;

ALTER TABLE gig_documentation 
  RENAME COLUMN doc_type_new TO doc_type;

-- Drop old enum type if it exists
DROP TYPE IF EXISTS doc_type;