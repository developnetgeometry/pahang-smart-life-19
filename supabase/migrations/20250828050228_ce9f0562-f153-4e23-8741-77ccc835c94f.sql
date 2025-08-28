-- Create household_accounts table to manage linked accounts
CREATE TABLE public.household_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_account_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  linked_account_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('spouse', 'tenant')),
  permissions JSONB DEFAULT '{"marketplace": false, "bookings": true, "announcements": true, "complaints": true, "discussions": false}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  
  -- Ensure no duplicate relationships
  UNIQUE(primary_account_id, linked_account_id),
  -- Ensure primary account cannot link to itself
  CHECK (primary_account_id != linked_account_id),
  -- Ensure only one spouse per primary account
  UNIQUE(primary_account_id, relationship_type) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS on household_accounts
ALTER TABLE household_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for household_accounts
CREATE POLICY "Primary users can manage their household accounts"
ON household_accounts
FOR ALL
TO authenticated
USING (primary_account_id = auth.uid() OR linked_account_id = auth.uid())
WITH CHECK (primary_account_id = auth.uid());

CREATE POLICY "Linked users can view their household connection"
ON household_accounts
FOR SELECT
TO authenticated
USING (linked_account_id = auth.uid());

-- Function to get primary account for linked users
CREATE OR REPLACE FUNCTION get_primary_account_id(check_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT primary_account_id FROM household_accounts WHERE linked_account_id = check_user_id AND is_active = true),
    check_user_id
  );
$$;

-- Function to check if user has household permission
CREATE OR REPLACE FUNCTION has_household_permission(permission_name TEXT, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT (permissions->>permission_name)::boolean 
     FROM household_accounts 
     WHERE linked_account_id = check_user_id AND is_active = true),
    true -- Primary accounts have all permissions
  );
$$;