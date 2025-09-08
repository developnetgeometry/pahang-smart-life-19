-- Create household_accounts table for managing spouse and tenant accounts
CREATE TABLE public.household_accounts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    primary_account_id uuid NOT NULL,
    linked_account_id uuid NOT NULL,
    relationship_type text NOT NULL CHECK (relationship_type IN ('spouse', 'tenant')),
    permissions jsonb NOT NULL DEFAULT '{
        "marketplace": true,
        "bookings": true,
        "announcements": true,
        "complaints": true,
        "discussions": true
    }'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    
    -- Ensure no duplicate active accounts of same type for same primary user
    UNIQUE(primary_account_id, linked_account_id, relationship_type)
);

-- Enable Row Level Security
ALTER TABLE public.household_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for household_accounts
CREATE POLICY "Users can view their household accounts"
ON public.household_accounts
FOR SELECT
USING (primary_account_id = auth.uid() OR linked_account_id = auth.uid());

CREATE POLICY "Primary account holders can create household accounts"
ON public.household_accounts
FOR INSERT
WITH CHECK (primary_account_id = auth.uid() AND created_by = auth.uid());

CREATE POLICY "Primary account holders can update their household accounts"
ON public.household_accounts
FOR UPDATE
USING (primary_account_id = auth.uid());

CREATE POLICY "Primary account holders can delete their household accounts"
ON public.household_accounts
FOR DELETE
USING (primary_account_id = auth.uid());

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_household_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_household_accounts_updated_at
    BEFORE UPDATE ON public.household_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_household_accounts_updated_at();

-- Create helper functions for household account management
CREATE OR REPLACE FUNCTION public.get_primary_account_id(check_user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT primary_account_id FROM household_accounts WHERE linked_account_id = check_user_id AND is_active = true),
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
     WHERE linked_account_id = check_user_id AND is_active = true),
    true -- Primary accounts have all permissions
  );
$$;