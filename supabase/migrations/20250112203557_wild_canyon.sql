/*
  # Add languages table and data

  1. New Tables
    - `languages`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `code` (text, ISO 639-1 language code)
      - `created_at` (timestamp)

  2. Changes
    - Add reference from gig_skills to languages table for language skills
    - Add check constraint for language levels

  3. Data
    - Insert common languages with their ISO codes
*/

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add language_id to gig_skills
ALTER TABLE gig_skills
  ADD COLUMN IF NOT EXISTS language_id uuid REFERENCES languages(id);

-- Add check constraint for language levels
ALTER TABLE gig_skills
  ADD CONSTRAINT valid_language_level_check
  CHECK (
    category != 'language' OR
    level = ANY(ARRAY['Basic', 'Conversational', 'Professional', 'Native/Bilingual'])
  );

-- Insert common languages
INSERT INTO languages (name, code) VALUES
  ('English', 'en'),
  ('Spanish', 'es'),
  ('French', 'fr'),
  ('German', 'de'),
  ('Italian', 'it'),
  ('Portuguese', 'pt'),
  ('Russian', 'ru'),
  ('Chinese (Mandarin)', 'zh'),
  ('Japanese', 'ja'),
  ('Korean', 'ko'),
  ('Arabic', 'ar'),
  ('Hindi', 'hi'),
  ('Bengali', 'bn'),
  ('Dutch', 'nl'),
  ('Polish', 'pl'),
  ('Turkish', 'tr'),
  ('Vietnamese', 'vi'),
  ('Thai', 'th'),
  ('Swedish', 'sv'),
  ('Danish', 'da'),
  ('Finnish', 'fi'),
  ('Norwegian', 'no'),
  ('Greek', 'el'),
  ('Hebrew', 'he'),
  ('Czech', 'cs'),
  ('Romanian', 'ro'),
  ('Hungarian', 'hu'),
  ('Ukrainian', 'uk'),
  ('Indonesian', 'id'),
  ('Malay', 'ms')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to everyone
CREATE POLICY "Allow read access to everyone"
  ON languages
  FOR SELECT
  TO authenticated
  USING (true);