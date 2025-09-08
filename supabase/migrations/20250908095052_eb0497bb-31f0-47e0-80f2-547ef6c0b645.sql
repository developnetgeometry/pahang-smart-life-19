-- Fix RLS policies for household_accounts to allow proper account creation

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view household accounts they're part of" ON public.household_accounts;
DROP POLICY IF EXISTS "Users can create household accounts as primary" ON public.household_accounts;
DROP POLICY IF EXISTS "Primary users can update their household accounts" ON public.household_accounts;
DROP POLICY IF EXISTS "Primary users can delete their household accounts" ON public.household_accounts;

-- Create new policies that handle authentication properly
CREATE POLICY "Users can view their household connections" 
ON public.household_accounts 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = primary_account_id OR 
  auth.uid() = linked_account_id
);

CREATE POLICY "Users can create household accounts" 
ON public.household_accounts 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = primary_account_id AND
  auth.uid() = created_by
);

CREATE POLICY "Primary users can manage their household accounts" 
ON public.household_accounts 
FOR UPDATE 
TO authenticated
USING (auth.uid() = primary_account_id)
WITH CHECK (auth.uid() = primary_account_id);

CREATE POLICY "Primary users can remove their household accounts" 
ON public.household_accounts 
FOR DELETE 
TO authenticated
USING (auth.uid() = primary_account_id);