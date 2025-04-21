/*
  # Add predefined sales skills

  1. Changes
    - Add predefined sales skills to gig_skills table
    - Add check constraint for sales skill names
    - Add default priority levels for common sales skills

  2. Data
    - Insert essential sales skills with priority levels
*/

-- Create a function to insert skills if they don't exist
CREATE OR REPLACE FUNCTION insert_skill_if_not_exists(
  p_gig_id uuid,
  p_category skill_category,
  p_name text,
  p_level text DEFAULT NULL,
  p_priority smallint DEFAULT 3
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM gig_skills 
    WHERE category = p_category 
    AND name = p_name 
    AND gig_id = p_gig_id
  ) THEN
    INSERT INTO gig_skills (gig_id, category, name, level, priority)
    VALUES (p_gig_id, p_category, p_name, p_level, p_priority);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for common sales skills
ALTER TABLE gig_skills
  ADD CONSTRAINT valid_sales_skill_check
  CHECK (
    category != 'professional' OR
    name = ANY(ARRAY[
      'Customer Handling',
      'Sales Techniques',
      'Win-Win Solution Finding',
      'Relationship Building',
      'Customer Need Analysis',
      'Complex Stakeholder Management',
      'Value Proposition Development',
      'Contract Terms Discussion',
      'Price Negotiation',
      'Solution Based Selling'
    ])
  );

-- Create a trigger to automatically set priority for common sales skills
CREATE OR REPLACE FUNCTION set_sales_skill_priority()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category = 'professional' THEN
    CASE NEW.name
      WHEN 'Customer Handling' THEN
        NEW.priority := 4;
      WHEN 'Sales Techniques' THEN
        NEW.priority := 5;
      WHEN 'Win-Win Solution Finding' THEN
        NEW.priority := 4;
      WHEN 'Relationship Building' THEN
        NEW.priority := 5;
      WHEN 'Customer Need Analysis' THEN
        NEW.priority := 4;
      WHEN 'Complex Stakeholder Management' THEN
        NEW.priority := 3;
      WHEN 'Value Proposition Development' THEN
        NEW.priority := 4;
      WHEN 'Contract Terms Discussion' THEN
        NEW.priority := 3;
      WHEN 'Price Negotiation' THEN
        NEW.priority := 4;
      WHEN 'Solution Based Selling' THEN
        NEW.priority := 5;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sales_skill_priority_trigger
  BEFORE INSERT ON gig_skills
  FOR EACH ROW
  EXECUTE FUNCTION set_sales_skill_priority();