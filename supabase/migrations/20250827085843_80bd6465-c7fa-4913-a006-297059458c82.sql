-- Create communities table first
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
  description TEXT,
  address TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Create policies for communities
CREATE POLICY "Everyone can view communities"
ON public.communities
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage communities"
ON public.communities
FOR ALL
USING (has_enhanced_role('state_admin') OR has_enhanced_role('district_coordinator'));

-- Add community_id to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'community_id') THEN
    ALTER TABLE public.profiles ADD COLUMN community_id UUID REFERENCES public.communities(id);
  END IF;
END $$;

-- Update get_user_community function to work with profiles table
CREATE OR REPLACE FUNCTION public.get_user_community()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT community_id FROM profiles WHERE id = auth.uid();
$$;

-- Add trigger for communities updated_at
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();