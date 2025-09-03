-- Fix foreign key relationships for work_orders table
-- Drop the existing foreign key constraint that points to auth.users
ALTER TABLE public.work_orders 
DROP CONSTRAINT IF EXISTS work_orders_created_by_fkey,
DROP CONSTRAINT IF EXISTS work_orders_assigned_to_fkey;

-- Add proper foreign key constraints that point to profiles table
-- This allows PostgREST to perform joins with profiles table
ALTER TABLE public.work_orders 
ADD CONSTRAINT work_orders_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.work_orders 
ADD CONSTRAINT work_orders_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Also fix work_order_activities table
ALTER TABLE public.work_order_activities 
DROP CONSTRAINT IF EXISTS work_order_activities_performed_by_fkey;

ALTER TABLE public.work_order_activities 
ADD CONSTRAINT work_order_activities_performed_by_fkey 
FOREIGN KEY (performed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;