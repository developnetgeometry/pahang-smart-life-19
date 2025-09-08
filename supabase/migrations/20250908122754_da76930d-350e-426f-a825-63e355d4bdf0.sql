-- Add missing foreign key constraints to household_accounts table
ALTER TABLE public.household_accounts 
ADD CONSTRAINT household_accounts_primary_account_id_fkey 
FOREIGN KEY (primary_account_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.household_accounts 
ADD CONSTRAINT household_accounts_linked_account_id_fkey 
FOREIGN KEY (linked_account_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.household_accounts 
ADD CONSTRAINT household_accounts_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;