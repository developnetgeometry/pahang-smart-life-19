-- Drop the problematic policy and create a simple one
DROP POLICY IF EXISTS "Users can create service provider applications" ON service_provider_applications;
DROP POLICY IF EXISTS "Applicants can create their own applications" ON service_provider_applications;

-- Create a simple policy that allows users to create applications for themselves
CREATE POLICY "Users can create their own service provider application" 
ON service_provider_applications 
FOR INSERT 
TO authenticated
WITH CHECK (applicant_id = auth.uid());