/*
  # Update category validation

  1. Changes
    - Add check constraint for predefined categories
    - Ensures only valid categories can be inserted
    - Categories match the application's predefined list

  2. Security
    - Maintains existing RLS policies
    - No security changes needed
*/

DO $$ BEGIN
  -- Create temp type for category validation
  CREATE TYPE valid_category AS ENUM (
    'Inbound Sales',
    'Outbound Sales',
    'Customer Service',
    'Technical Support',
    'Account Management',
    'Lead Generation',
    'Market Research',
    'Appointment Setting',
    'Order Processing',
    'Customer Retention',
    'Billing Support',
    'Product Support',
    'Help Desk',
    'Chat Support',
    'Email Support',
    'Social Media Support',
    'Survey Calls',
    'Welcome Calls',
    'Follow-up Calls',
    'Complaint Resolution',
    'Warranty Support',
    'Collections',
    'Dispatch Services',
    'Emergency Support',
    'Multilingual Support'
  );

  -- Add check constraint to ensure category is valid
  ALTER TABLE gigs
    ADD CONSTRAINT valid_category_check
    CHECK (category = ANY(
      ARRAY[
        'Inbound Sales',
        'Outbound Sales',
        'Customer Service',
        'Technical Support',
        'Account Management',
        'Lead Generation',
        'Market Research',
        'Appointment Setting',
        'Order Processing',
        'Customer Retention',
        'Billing Support',
        'Product Support',
        'Help Desk',
        'Chat Support',
        'Email Support',
        'Social Media Support',
        'Survey Calls',
        'Welcome Calls',
        'Follow-up Calls',
        'Complaint Resolution',
        'Warranty Support',
        'Collections',
        'Dispatch Services',
        'Emergency Support',
        'Multilingual Support'
      ]
    ));
END $$;