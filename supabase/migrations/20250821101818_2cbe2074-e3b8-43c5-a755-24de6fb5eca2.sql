-- Temporarily make the RLS policies more permissive for testing
-- Allow all authenticated users to view service provider applications for now

CREATE POLICY "Authenticated users can view all applications (temp)"
ON service_provider_applications FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view all service provider profiles (temp)"  
ON service_provider_profiles FOR SELECT
TO authenticated
USING (true);