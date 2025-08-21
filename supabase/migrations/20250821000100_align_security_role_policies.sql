-- Align RLS policies to use security_officer instead of security
-- This migration updates existing policies where 'security' was used, replacing with 'security_officer'.

-- Visitors policies
DROP POLICY IF EXISTS "Security can view all visitors" ON public.visitors;
CREATE POLICY "Security can view all visitors"
ON public.visitors
FOR ALL
USING (
  has_role('security_officer'::user_role) OR has_role('admin'::user_role)
);

DROP POLICY IF EXISTS "Security can manage visitors in district" ON public.visitors;
CREATE POLICY "Security can manage visitors in district"
ON public.visitors
FOR ALL
USING (
  (has_role('security_officer'::user_role) OR has_role('admin'::user_role)) AND 
  district_id = get_user_district()
);

-- Visitor logs
DROP POLICY IF EXISTS "Users can view relevant visitor logs" ON public.visitor_logs;
CREATE POLICY "Users can view relevant visitor logs"
ON public.visitor_logs
FOR SELECT  
USING (
  EXISTS (
    SELECT 1 FROM public.visitors v 
    WHERE v.id = visitor_logs.visitor_id 
    AND v.user_id = auth.uid()
  ) OR
  (
    has_role('security_officer'::user_role) OR
    has_role('manager'::user_role) OR 
    has_role('admin'::user_role) OR 
    has_role('state_admin'::user_role) OR 
    has_role('district_coordinator'::user_role) OR 
    has_role('community_admin'::user_role)
  )
);

DROP POLICY IF EXISTS "Security can create visitor logs" ON public.visitor_logs;
CREATE POLICY "Security can create visitor logs"
ON public.visitor_logs
FOR INSERT
WITH CHECK (
  has_role('security_officer'::user_role) OR
  has_role('admin'::user_role) OR
  has_role('manager'::user_role)
);

-- Visitor blacklist
DROP POLICY IF EXISTS "Security can manage blacklist" ON public.visitor_blacklist;
CREATE POLICY "Security can manage blacklist"
ON public.visitor_blacklist
FOR ALL
USING (
  has_role('security_officer'::user_role) OR
  has_role('admin'::user_role) OR 
  has_role('manager'::user_role) OR
  has_role('state_admin'::user_role)
);

-- Door controllers
DROP POLICY IF EXISTS "Security can manage door controllers" ON public.door_controllers;
CREATE POLICY "Security can manage door controllers" ON public.door_controllers
  FOR ALL USING (has_role('admin'::user_role) OR has_role('security_officer'::user_role) OR has_role('manager'::user_role));

-- Access logs
DROP POLICY IF EXISTS "Security can view all access logs" ON public.access_logs;
CREATE POLICY "Security can view all access logs" ON public.access_logs
  FOR ALL USING (has_role('admin'::user_role) OR has_role('security_officer'::user_role) OR has_role('manager'::user_role));

-- Inventory policies
DROP POLICY IF EXISTS "Staff can view inventory" ON public.inventory;
CREATE POLICY "Staff can view inventory" ON public.inventory
  FOR SELECT USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('security_officer'::user_role));

DROP POLICY IF EXISTS "Staff can view inventory movements" ON public.inventory_movements;
CREATE POLICY "Staff can view inventory movements" ON public.inventory_movements
  FOR SELECT USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('security_officer'::user_role));

-- Incident reports
DROP POLICY IF EXISTS "Security can manage incident reports" ON public.incident_reports;
CREATE POLICY "Security can manage incident reports" ON public.incident_reports
  FOR ALL USING (has_role('security_officer'::user_role) OR has_role('manager'::user_role) OR has_role('admin'::user_role));

-- CCTV cameras: ensure manage + view policies include security_officer
DROP POLICY IF EXISTS "CCTV manageable by security and state admin" ON public.cctv_cameras;
CREATE POLICY "CCTV manageable by security and state admin"
ON public.cctv_cameras
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'security_officer'::public.app_role)
);

DROP POLICY IF EXISTS "CCTV viewable by security" ON public.cctv_cameras;
CREATE POLICY "CCTV viewable by security"
ON public.cctv_cameras
FOR SELECT
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'security_officer'::public.app_role)
);
