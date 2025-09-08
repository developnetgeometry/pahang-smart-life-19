-- Temporarily make the INSERT policy more permissive to debug the issue
DROP POLICY IF EXISTS "Primary account holders can insert household accounts" ON public.household_accounts;

-- Create a more permissive INSERT policy for debugging
CREATE POLICY "Primary account holders can insert household accounts"
ON public.household_accounts
FOR INSERT
WITH CHECK (
    -- Just check that primary_account_id is set to the current user
    primary_account_id = auth.uid()
);

-- Also ensure the existing permissions are correct for other operations
DROP POLICY IF EXISTS "Primary account holders can update household accounts" ON public.household_accounts;
DROP POLICY IF EXISTS "Primary account holders can delete household accounts" ON public.household_accounts;

CREATE POLICY "Primary account holders can update household accounts"
ON public.household_accounts
FOR UPDATE
USING (primary_account_id = auth.uid());

CREATE POLICY "Primary account holders can delete household accounts"
ON public.household_accounts
FOR DELETE
USING (primary_account_id = auth.uid());