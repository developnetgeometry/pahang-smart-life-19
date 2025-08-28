-- Add marital status and spouse information fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN marital_status text,
ADD COLUMN spouse_full_name text,
ADD COLUMN spouse_identity_no text,
ADD COLUMN spouse_identity_no_type text DEFAULT 'ic',
ADD COLUMN spouse_gender text,
ADD COLUMN spouse_dob date,
ADD COLUMN spouse_mobile_no text,
ADD COLUMN spouse_occupation text,
ADD COLUMN spouse_workplace text;