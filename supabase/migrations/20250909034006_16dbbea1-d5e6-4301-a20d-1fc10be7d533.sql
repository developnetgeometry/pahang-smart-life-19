-- Enable RLS on districts table (fixing critical security issue)
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;