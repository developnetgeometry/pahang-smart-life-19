-- Fix RLS policies for units table to ensure all users can see their community data

-- First, check if RLS policies exist and drop them if they're restrictive
DROP POLICY IF EXISTS "Units are viewable by everyone" ON public.units;
DROP POLICY IF EXISTS "Users can view units" ON public.units;
DROP POLICY IF EXISTS "Users can insert units" ON public.units;
DROP POLICY IF EXISTS "Users can update units" ON public.units;
DROP POLICY IF EXISTS "Users can delete units" ON public.units;

-- Create comprehensive RLS policies for units table
-- Allow users to view all units in their community/district
CREATE POLICY "Users can view all units in their district" 
ON public.units 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    district_id IN (
      SELECT DISTINCT district_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
    OR district_id IS NULL  -- Allow units without district assignment
    OR auth.uid() = created_by  -- Allow users to see units they created
  )
);

-- Allow authenticated users to insert units
CREATE POLICY "Authenticated users can insert units" 
ON public.units 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid()
);

-- Allow users to update units they created or in their district
CREATE POLICY "Users can update units in their district" 
ON public.units 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid()
    OR district_id IN (
      SELECT DISTINCT district_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Allow users to delete units they created or in their district  
CREATE POLICY "Users can delete units in their district" 
ON public.units 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid()
    OR district_id IN (
      SELECT DISTINCT district_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
);