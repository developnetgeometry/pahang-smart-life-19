-- Enable RLS on household_accounts table - this was the missing piece!
ALTER TABLE public.household_accounts ENABLE ROW LEVEL SECURITY;