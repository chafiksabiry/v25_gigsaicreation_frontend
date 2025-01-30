/*
  # Add Gig Workflow Management

  1. Changes
    - Add draft status to gigs
    - Add validation function for gig status transitions
    - Add gig_history table for tracking changes
    
  2. Security
    - Enable RLS on new table
    - Update gigs policies for draft status
*/

-- Add gig_history table for tracking changes
CREATE TABLE IF NOT EXISTS gig_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  old_status text,
  new_status text,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on gig_history
ALTER TABLE gig_history ENABLE ROW LEVEL SECURITY;

-- Add policies for gig_history
CREATE POLICY "Creators can view their gigs history"
  ON gig_history
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT creator_id FROM gigs WHERE id = gig_id
    )
  );

-- Create function to validate gig status transitions
CREATE OR REPLACE FUNCTION validate_gig_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Valid status values: 'draft', 'pending_review', 'published', 'closed'
  IF NEW.status NOT IN ('draft', 'pending_review', 'published', 'closed') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;

  -- Validate status transitions
  IF TG_OP = 'UPDATE' THEN
    -- Can't modify closed gigs
    IF OLD.status = 'closed' THEN
      RAISE EXCEPTION 'Cannot modify closed gigs';
    END IF;

    -- Can't go back to draft from published
    IF OLD.status = 'published' AND NEW.status = 'draft' THEN
      RAISE EXCEPTION 'Cannot revert published gig to draft';
    END IF;
  END IF;

  -- Record the change in history
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO gig_history (
      gig_id,
      changed_by,
      old_status,
      new_status,
      changes
    ) VALUES (
      NEW.id,
      auth.uid(),
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'title', NEW.title,
        'description', NEW.description,
        'requirements', NEW.requirements,
        'compensation', NEW.compensation
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;