/*
  # Add commission amount fields

  1. Changes
    - Add commission_base_amount column to gigs table
    - Add commission_bonus_amount column to gigs table
    - Add commission_currency column to gigs table

  2. Notes
    - All new columns are nullable to maintain backward compatibility
    - Currency codes follow ISO 4217 standard
*/

ALTER TABLE gigs
  ADD COLUMN IF NOT EXISTS commission_base_amount text,
  ADD COLUMN IF NOT EXISTS commission_bonus_amount text,
  ADD COLUMN IF NOT EXISTS commission_currency text;

-- Add check constraint for valid currencies
ALTER TABLE gigs
  ADD CONSTRAINT valid_currency_check
  CHECK (
    commission_currency IS NULL OR
    commission_currency = ANY(ARRAY[
      'USD', 'EUR', 'GBP', 'AUD', 'CAD',
      'SGD', 'HKD', 'JPY', 'INR', 'AED'
    ])
  );