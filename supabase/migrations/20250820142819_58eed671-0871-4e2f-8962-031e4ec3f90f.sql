-- Fix RLS policies for panic_alerts to use correct role names and enum
DROP POLICY IF EXISTS "Security can view all panic alerts" ON panic_alerts;
DROP POLICY IF EXISTS "Security can update panic alerts" ON panic_alerts;

-- Create updated policies with correct role names
CREATE POLICY "Security can view all panic alerts" 
ON panic_alerts 
FOR SELECT 
USING (
  has_role('security_officer'::app_role) OR 
  has_role('state_admin'::app_role) OR 
  has_role('district_coordinator'::app_role) OR 
  has_role('community_admin'::app_role)
);

CREATE POLICY "Security can update panic alerts" 
ON panic_alerts 
FOR UPDATE 
USING (
  has_role('security_officer'::app_role) OR 
  has_role('state_admin'::app_role) OR 
  has_role('district_coordinator'::app_role) OR 
  has_role('community_admin'::app_role)
);