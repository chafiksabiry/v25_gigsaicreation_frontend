/*
  # Add Status Field to Gigs Table

  1. Changes
    - Create gig_status enum type with values: 'to_activate', 'active', 'inactive', 'archived'
    - Add status column to gigs table with default value 'to_activate'
  
  2. Purpose
    - Allow tracking of gig lifecycle states
    - Default status is 'to_activate' for new gigs
*/

-- Create gig status enum type
CREATE TYPE gig_status AS ENUM ('to_activate', 'active', 'inactive', 'archived');

-- Add status column to gigs table
ALTER TABLE gigs
  ADD COLUMN status gig_status NOT NULL DEFAULT 'to_activate';

-- Add comment for documentation
COMMENT ON COLUMN gigs.status IS 'Gig lifecycle status: to_activate, active, inactive, archived'; 