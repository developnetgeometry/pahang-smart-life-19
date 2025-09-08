-- Add the missing performed_by_role column to module_activities table
ALTER TABLE public.module_activities ADD COLUMN IF NOT EXISTS performed_by_role TEXT;