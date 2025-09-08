-- Drop existing policies and create simpler ones for household_accounts
DROP POLICY IF EXISTS "Users can create household accounts" ON public.household_accounts;
DROP POLICY IF EXISTS "Users can view their household connections" ON public.household_accounts;
DROP POLICY IF EXISTS "Primary users can manage their household accounts" ON public.household_accounts;
DROP POLICY IF EXISTS "Primary users can remove their household accounts" ON public.household_accounts;

-- Create more permissive policies for household_accounts
CREATE POLICY "authenticated_users_can_insert_household_accounts" 
ON public.household_accounts 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = primary_account_id);

CREATE POLICY "authenticated_users_can_select_household_accounts" 
ON public.household_accounts 
FOR SELECT 
TO authenticated 
USING (auth.uid() = primary_account_id OR auth.uid() = linked_account_id);

CREATE POLICY "authenticated_users_can_update_household_accounts" 
ON public.household_accounts 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = primary_account_id)
WITH CHECK (auth.uid() = primary_account_id);

CREATE POLICY "authenticated_users_can_delete_household_accounts" 
ON public.household_accounts 
FOR DELETE 
TO authenticated 
USING (auth.uid() = primary_account_id);