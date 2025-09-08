-- Check if foreign key constraints exist and add them if missing
DO $$
BEGIN
    -- Add foreign key constraint for primary_account_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'household_accounts_primary_account_id_fkey'
        AND table_name = 'household_accounts'
    ) THEN
        ALTER TABLE public.household_accounts 
        ADD CONSTRAINT household_accounts_primary_account_id_fkey 
        FOREIGN KEY (primary_account_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key constraint for linked_account_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'household_accounts_linked_account_id_fkey'
        AND table_name = 'household_accounts'
    ) THEN
        ALTER TABLE public.household_accounts 
        ADD CONSTRAINT household_accounts_linked_account_id_fkey 
        FOREIGN KEY (linked_account_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key constraint for created_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'household_accounts_created_by_fkey'
        AND table_name = 'household_accounts'
    ) THEN
        ALTER TABLE public.household_accounts 
        ADD CONSTRAINT household_accounts_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update RLS policies to be more permissive and avoid conflicts
DROP POLICY IF EXISTS "Users can view their household accounts" ON public.household_accounts;
DROP POLICY IF EXISTS "Primary account holders can create household accounts" ON public.household_accounts;
DROP POLICY IF EXISTS "Primary account holders can update their household accounts" ON public.household_accounts;
DROP POLICY IF EXISTS "Primary account holders can delete their household accounts" ON public.household_accounts;

-- Create updated RLS policies
CREATE POLICY "Users can view their household accounts"
ON public.household_accounts
FOR SELECT
USING (primary_account_id = auth.uid() OR linked_account_id = auth.uid());

CREATE POLICY "Primary account holders can manage household accounts"
ON public.household_accounts
FOR ALL
USING (primary_account_id = auth.uid())
WITH CHECK (primary_account_id = auth.uid() AND created_by = auth.uid());

-- Ensure the helper functions exist
CREATE OR REPLACE FUNCTION public.get_primary_account_id(check_user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT primary_account_id FROM household_accounts WHERE linked_account_id = check_user_id AND is_active = true LIMIT 1),
    check_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_household_permission(permission_name text, check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (permissions->>permission_name)::boolean 
     FROM household_accounts 
     WHERE linked_account_id = check_user_id AND is_active = true LIMIT 1),
    true -- Primary accounts have all permissions
  );
$$;