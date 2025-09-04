-- Drop the existing restrictive policy for panic alerts INSERT
DROP POLICY IF EXISTS "Users can create panic alerts" ON public.panic_alerts;

-- Create a more permissive policy allowing all authenticated users to create panic alerts
CREATE POLICY "All authenticated users can create panic alerts" 
ON public.panic_alerts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update the notification function to handle cases where users might not have profiles
-- Also ensure the edge function works for any authenticated user