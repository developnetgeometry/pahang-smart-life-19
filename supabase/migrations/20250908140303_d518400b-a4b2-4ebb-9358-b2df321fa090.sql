-- Fix the RLS policy for service provider applications to allow signup
-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Applicants can create their own applications" ON service_provider_applications;

-- Create a more permissive INSERT policy that works during signup
CREATE POLICY "Users can create service provider applications" 
ON service_provider_applications 
FOR INSERT 
TO authenticated
WITH CHECK (
  applicant_id = auth.uid() OR 
  -- Allow during signup process when the user is creating their own application
  (auth.uid() IS NOT NULL AND applicant_id IS NOT NULL)
);

-- Also ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION create_service_provider_application_on_signup TO authenticated;