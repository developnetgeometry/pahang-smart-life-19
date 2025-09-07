-- Update RLS policy to allow viewing global facilities (null district_id) in addition to district-specific ones
DROP POLICY IF EXISTS "Users can view facilities in their district" ON facilities;

CREATE POLICY "Users can view facilities in their district or global facilities"
ON facilities FOR SELECT
USING (district_id = get_user_district() OR district_id IS NULL);