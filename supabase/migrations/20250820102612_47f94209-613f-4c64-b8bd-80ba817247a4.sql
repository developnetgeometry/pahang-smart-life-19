-- Create basic RLS policies for new tables with simplified logic

-- System modules policies (open access for now)
CREATE POLICY "Public can view active system modules" ON public.system_modules
  FOR SELECT USING (is_active = true);

-- Profiles policies - essential for user management
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

-- Service providers policies
CREATE POLICY "Service providers manage own data" ON public.service_providers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public view active service providers" ON public.service_providers
  FOR SELECT USING (is_active = true AND is_verified = true);

-- Service appointments policies  
CREATE POLICY "Users manage own appointments as client" ON public.service_appointments
  FOR ALL USING (client_id = auth.uid());

CREATE POLICY "Service providers manage their appointments" ON public.service_appointments
  FOR ALL USING (provider_id IN (
    SELECT id FROM public.service_providers WHERE user_id = auth.uid()
  ));

-- Group memberships policies
CREATE POLICY "Users manage own group memberships" ON public.group_memberships
  FOR ALL USING (user_id = auth.uid());

-- Marketplace items policies
CREATE POLICY "Users manage own marketplace items" ON public.marketplace_items
  FOR ALL USING (seller_id = auth.uid());

CREATE POLICY "Public view available marketplace items" ON public.marketplace_items
  FOR SELECT USING (is_available = true);

-- Payments policies
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

-- Visitor entries policies
CREATE POLICY "Users view visitor entries for their visitors" ON public.visitor_entries
  FOR SELECT USING (
    visitor_id IN (SELECT id FROM public.visitors WHERE host_id = auth.uid())
  );

-- Security patrols policies
CREATE POLICY "Officers manage own patrols" ON public.security_patrols
  FOR ALL USING (officer_id = auth.uid());

-- Quality inspections policies
CREATE POLICY "Inspectors manage own inspections" ON public.quality_inspections
  FOR ALL USING (inspector_id = auth.uid());

-- Performance metrics policies
CREATE POLICY "Users view own performance metrics" ON public.performance_metrics
  FOR SELECT USING (user_id = auth.uid());

-- System settings policies
CREATE POLICY "Public view system settings" ON public.system_settings
  FOR SELECT USING (true);

-- Role permissions policies (simplified)
CREATE POLICY "Public view role permissions" ON public.role_permissions
  FOR SELECT USING (true);