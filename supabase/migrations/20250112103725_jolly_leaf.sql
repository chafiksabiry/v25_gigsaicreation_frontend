/*
  # Initial schema for gigs management system

  1. New Tables
    - gigs: Main table for gig information
    - gig_skills: Skills requirements for gigs
    - gig_documentation: Documentation related to gigs
    - gig_leads: Lead information for gigs

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access control
*/

-- Create enum types for various categorizations
CREATE TYPE skill_category AS ENUM ('language', 'soft', 'professional', 'industry');
CREATE TYPE lead_type AS ENUM ('hot', 'warm', 'cold');
CREATE TYPE doc_type AS ENUM ('product', 'sales');

-- Main gigs table
CREATE TABLE IF NOT EXISTS gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  seniority_level text NOT NULL,
  years_experience text NOT NULL,
  schedule_days text[] NOT NULL,
  schedule_hours text NOT NULL,
  schedule_timezone text[] NOT NULL,
  schedule_flexibility text,
  commission_base text NOT NULL,
  commission_bonus text,
  commission_structure text,
  team_size text NOT NULL,
  team_structure jsonb NOT NULL,
  team_territories text[] NOT NULL,
  prerequisites text[] NOT NULL,
  call_types text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills requirements table
CREATE TABLE IF NOT EXISTS gig_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE,
  category skill_category NOT NULL,
  name text NOT NULL,
  level text,
  created_at timestamptz DEFAULT now()
);

-- Documentation table
CREATE TABLE IF NOT EXISTS gig_documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE,
  doc_type doc_type NOT NULL,
  name text NOT NULL,
  url text,
  created_at timestamptz DEFAULT now()
);

-- Leads information table
CREATE TABLE IF NOT EXISTS gig_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE,
  lead_type lead_type NOT NULL,
  percentage integer NOT NULL,
  description text NOT NULL,
  sources text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organizations can manage their own gigs"
  ON gigs
  FOR ALL
  TO authenticated
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid)
  WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "Organizations can manage their gigs' skills"
  ON gig_skills
  FOR ALL
  TO authenticated
  USING (gig_id IN (
    SELECT id 
    FROM gigs 
    WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
  ))
  WITH CHECK (gig_id IN (
    SELECT id 
    FROM gigs 
    WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
  ));

CREATE POLICY "Organizations can manage their gigs' documentation"
  ON gig_documentation
  FOR ALL
  TO authenticated
  USING (gig_id IN (
    SELECT id 
    FROM gigs 
    WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
  ))
  WITH CHECK (gig_id IN (
    SELECT id 
    FROM gigs 
    WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
  ));

CREATE POLICY "Organizations can manage their gigs' leads"
  ON gig_leads
  FOR ALL
  TO authenticated
  USING (gig_id IN (
    SELECT id 
    FROM gigs 
    WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
  ))
  WITH CHECK (gig_id IN (
    SELECT id 
    FROM gigs 
    WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
  ));