-- Fix RLS policies for household_accounts table to resolve the spouse account creation error

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Primary account holders can manage household accounts" ON public.household_accounts;

-- Create more specific and permissive policies
CREATE POLICY "Primary account holders can insert household accounts"
ON public.household_accounts
FOR INSERT
WITH CHECK (
    primary_account_id = auth.uid() 
    AND created_by = auth.uid()
);

CREATE POLICY "Primary account holders can update household accounts"
ON public.household_accounts
FOR UPDATE
USING (primary_account_id = auth.uid())
WITH CHECK (primary_account_id = auth.uid());

CREATE POLICY "Primary account holders can delete household accounts"
ON public.household_accounts
FOR DELETE
USING (primary_account_id = auth.uid());

-- Ensure all required columns are NOT NULL to prevent RLS issues
ALTER TABLE public.household_accounts 
ALTER COLUMN primary_account_id SET NOT NULL,
ALTER COLUMN linked_account_id SET NOT NULL,
ALTER COLUMN created_by SET NOT NULL;