-- Add the missing performed_by column to module_activities table
ALTER TABLE public.module_activities ADD COLUMN IF NOT EXISTS performed_by UUID REFERENCES auth.users(id);