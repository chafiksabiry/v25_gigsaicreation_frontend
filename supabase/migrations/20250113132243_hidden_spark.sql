/*
  # Add commission amount fields safely

  1. Changes
    - Add commission amount columns if they don't exist
    - Add currency constraint if it doesn't exist
    - Use DO block to handle constraint conditionally
*/

-- Add columns if they don't exist
ALTER TABLE gigs
  ADD COLUMN IF NOT EXISTS commission_base_amount text,
  ADD COLUMN IF NOT EXISTS commission_bonus_amount text,
  ADD COLUMN IF NOT EXISTS commission_currency text;

-- Safely add constraint if it doesn't exist
DO $$ 
BEGIN
  -- Check if constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_currency_check'
  ) THEN
    -- Add constraint only if it doesn't exist
    ALTER TABLE gigs
      ADD CONSTRAINT valid_currency_check
      CHECK (
        commission_currency IS NULL OR
        commission_currency = ANY(ARRAY[
          'USD', 'EUR', 'GBP', 'AUD', 'CAD',
          'SGD', 'HKD', 'JPY', 'INR', 'AED'
        ])
      );
  END IF;
END $$;