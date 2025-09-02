-- Fix the profiles table structure and foreign key relationship
-- First, check the existing profiles table structure and update if needed
DO $$
BEGIN
  -- Add user_id column to profiles if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Update existing profiles to set user_id = id if not already set
    UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;
    
    -- Make user_id NOT NULL after updating
    ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Ensure foreign key exists on announcement_comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'announcement_comments_user_id_fkey' 
    AND table_name = 'announcement_comments'
  ) THEN
    ALTER TABLE public.announcement_comments 
    ADD CONSTRAINT announcement_comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcement_comments_user_id 
ON public.announcement_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON public.profiles(user_id);