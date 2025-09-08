-- Fix RLS policies for household_accounts table to handle authentication properly

-- Drop existing policies
DROP POLICY IF EXISTS "Primary users can manage their household accounts" ON public.household_accounts;
DROP POLICY IF EXISTS "Linked users can view their household connection" ON public.household_accounts;

-- Create more robust policies that handle authentication better
CREATE POLICY "Users can view household accounts they're part of" 
ON public.household_accounts 
FOR SELECT 
TO authenticated
USING (
  primary_account_id = auth.uid() OR 
  linked_account_id = auth.uid()
);

CREATE POLICY "Users can create household accounts as primary" 
ON public.household_accounts 
FOR INSERT 
TO authenticated
WITH CHECK (primary_account_id = auth.uid());

CREATE POLICY "Primary users can update their household accounts" 
ON public.household_accounts 
FOR UPDATE 
TO authenticated
USING (primary_account_id = auth.uid())
WITH CHECK (primary_account_id = auth.uid());

CREATE POLICY "Primary users can delete their household accounts" 
ON public.household_accounts 
FOR DELETE 
TO authenticated
USING (primary_account_id = auth.uid());