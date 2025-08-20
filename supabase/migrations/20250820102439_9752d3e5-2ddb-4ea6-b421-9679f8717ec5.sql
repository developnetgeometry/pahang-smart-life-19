-- Create RLS policies for all new tables

-- System modules policies
CREATE POLICY "Everyone can view active system modules" ON public.system_modules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage system modules" ON public.system_modules
  FOR ALL USING (has_role('state_admin'::app_role));

-- Role permissions policies  
CREATE POLICY "Users can view their own role permissions" ON public.role_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = role_permissions.role
    )
  );

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (has_role('state_admin'::app_role));

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_role('state_admin'::app_role) OR has_role('district_coordinator'::app_role));

-- Service providers policies
CREATE POLICY "Users can view service providers in their district" ON public.service_providers
  FOR SELECT USING (
    district_id = (SELECT district_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create their own service provider profile" ON public.service_providers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service providers can update their own profile" ON public.service_providers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage service providers" ON public.service_providers
  FOR ALL USING (has_role('state_admin'::app_role) OR has_role('district_coordinator'::app_role));

-- Service appointments policies
CREATE POLICY "Users can view their own appointments" ON public.service_appointments
  FOR SELECT USING (client_id = auth.uid() OR provider_id IN (
    SELECT id FROM public.service_providers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create appointments" ON public.service_appointments
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Service providers can update their appointments" ON public.service_appointments
  FOR UPDATE USING (provider_id IN (
    SELECT id FROM public.service_providers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all appointments" ON public.service_appointments
  FOR SELECT USING (has_role('state_admin'::app_role) OR has_role('district_coordinator'::app_role));

-- Group memberships policies
CREATE POLICY "Users can view group memberships" ON public.group_memberships
  FOR SELECT USING (
    user_id = auth.uid() OR 
    group_id IN (SELECT id FROM public.community_groups WHERE leader_id = auth.uid())
  );

CREATE POLICY "Users can join groups" ON public.group_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership" ON public.group_memberships
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Group leaders can manage memberships" ON public.group_memberships
  FOR ALL USING (group_id IN (SELECT id FROM public.community_groups WHERE leader_id = auth.uid()));

-- Marketplace items policies
CREATE POLICY "Users can view marketplace items in their district" ON public.marketplace_items
  FOR SELECT USING (
    district_id = (SELECT district_id FROM public.profiles WHERE id = auth.uid()) AND is_available = true
  );

CREATE POLICY "Users can create their own marketplace items" ON public.marketplace_items
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own marketplace items" ON public.marketplace_items
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Users can delete their own marketplace items" ON public.marketplace_items
  FOR DELETE USING (seller_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payments" ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (has_role('state_admin'::app_role) OR has_role('district_coordinator'::app_role));

-- Visitor entries policies
CREATE POLICY "Security can manage visitor entries" ON public.visitor_entries
  FOR ALL USING (has_role('security_officer'::app_role));

CREATE POLICY "Users can view their own visitor entries" ON public.visitor_entries
  FOR SELECT USING (
    visitor_id IN (SELECT id FROM public.visitors WHERE host_id = auth.uid())
  );

-- Security patrols policies
CREATE POLICY "Security officers can view their own patrols" ON public.security_patrols
  FOR SELECT USING (officer_id = auth.uid());

CREATE POLICY "Security officers can update their own patrols" ON public.security_patrols
  FOR UPDATE USING (officer_id = auth.uid());

CREATE POLICY "Security admins can manage all patrols" ON public.security_patrols
  FOR ALL USING (has_role('security_officer'::app_role));

-- Quality inspections policies
CREATE POLICY "Inspectors can view their own inspections" ON public.quality_inspections
  FOR SELECT USING (inspector_id = auth.uid());

CREATE POLICY "Inspectors can update their own inspections" ON public.quality_inspections
  FOR UPDATE USING (inspector_id = auth.uid());

CREATE POLICY "Facility managers can manage inspections" ON public.quality_inspections
  FOR ALL USING (has_role('facility_manager'::app_role) OR has_role('maintenance_staff'::app_role));

-- Performance metrics policies
CREATE POLICY "Users can view their own performance metrics" ON public.performance_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all performance metrics" ON public.performance_metrics
  FOR SELECT USING (has_role('state_admin'::app_role) OR has_role('district_coordinator'::app_role));

CREATE POLICY "System can insert performance metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (true);

-- System settings policies
CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (has_role('state_admin'::app_role));

CREATE POLICY "Users can view system settings" ON public.system_settings
  FOR SELECT USING (true);