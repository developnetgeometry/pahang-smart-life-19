-- Add internal_comments column to complaint_responses table
ALTER TABLE public.complaint_responses 
ADD COLUMN internal_comments TEXT;