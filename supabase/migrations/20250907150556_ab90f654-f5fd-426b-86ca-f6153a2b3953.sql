-- Add status column to profiles table for user approval workflow
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending' 
CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Update existing users to approved status if they don't have a status
UPDATE public.profiles 
SET account_status = 'approved' 
WHERE account_status IS NULL;

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- Create function to check if user account is approved
CREATE OR REPLACE FUNCTION public.is_user_account_approved(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_status = 'approved' 
  FROM profiles 
  WHERE id = user_id;
$$;