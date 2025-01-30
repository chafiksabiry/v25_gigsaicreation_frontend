/*
  # Initial Schema Setup for HARX Platform

  1. New Tables
    - `profiles`
      - Extends auth.users with additional user profile information
      - Stores user details, skills, and preferences
    
    - `gigs`
      - Stores all gig listings
      - Contains gig details, requirements, and metrics
    
    - `gig_applications`
      - Tracks applications from workers to gigs
      - Manages application status and communications

  2. Security
    - Enable RLS on all tables
    - Set up policies for:
      - Profiles: Users can read all profiles but only update their own
      - Gigs: Anyone can read, only owners can update
      - Applications: Restricted to involved parties
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  title text,
  bio text,
  skills text[],
  languages jsonb DEFAULT '[]',
  rating decimal(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gigs table
CREATE TABLE IF NOT EXISTS gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  quantity integer NOT NULL,
  timeline text NOT NULL,
  requirements jsonb DEFAULT '[]',
  skills_required text[] DEFAULT '{}',
  languages_required jsonb DEFAULT '[]',
  kpis jsonb DEFAULT '[]',
  compensation jsonb NOT NULL,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gig applications table
CREATE TABLE IF NOT EXISTS gig_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(gig_id, applicant_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Gigs policies
CREATE POLICY "Gigs are viewable by everyone"
  ON gigs
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create gigs"
  ON gigs
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own gigs"
  ON gigs
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Gig applications policies
CREATE POLICY "Users can view their own applications"
  ON gig_applications
  FOR SELECT
  USING (
    auth.uid() = applicant_id OR 
    auth.uid() IN (
      SELECT creator_id FROM gigs WHERE id = gig_id
    )
  );

CREATE POLICY "Users can create applications"
  ON gig_applications
  FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can update their own applications"
  ON gig_applications
  FOR UPDATE
  USING (auth.uid() = applicant_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON gigs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON gig_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();