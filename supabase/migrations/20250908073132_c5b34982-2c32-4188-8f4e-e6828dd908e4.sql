-- Add the missing metadata column to module_activities table
ALTER TABLE public.module_activities ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;