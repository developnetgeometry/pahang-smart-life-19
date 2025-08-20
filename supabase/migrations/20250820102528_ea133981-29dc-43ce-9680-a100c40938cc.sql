-- Create RLS policies for new tables (with careful handling of existing policies)

-- System modules policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_modules' AND policyname = 'Everyone can view active system modules') THEN
    CREATE POLICY "Everyone can view active system modules" ON public.system_modules
      FOR SELECT USING (is_active = true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_modules' AND policyname = 'Admins can manage system modules') THEN
    CREATE POLICY "Admins can manage system modules" ON public.system_modules
      FOR ALL USING (has_role('state_admin'::app_role));
  END IF;
END $$;

-- Role permissions policies  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'role_permissions' AND policyname = 'Users can view their own role permissions') THEN
    CREATE POLICY "Users can view their own role permissions" ON public.role_permissions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur 
          WHERE ur.user_id = auth.uid() AND ur.role = role_permissions.role
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'role_permissions' AND policyname = 'Admins can manage role permissions') THEN
    CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
      FOR ALL USING (has_role('state_admin'::app_role));
  END IF;
END $$;

-- Profiles policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON public.profiles
      FOR SELECT USING (id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles
      FOR UPDATE USING (id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles
      FOR INSERT WITH CHECK (id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles') THEN
    CREATE POLICY "Admins can view all profiles" ON public.profiles
      FOR SELECT USING (has_role('state_admin'::app_role) OR has_role('district_coordinator'::app_role));
  END IF;
END $$;

-- Service providers policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_providers' AND policyname = 'Users can view service providers in their district') THEN
    CREATE POLICY "Users can view service providers in their district" ON public.service_providers
      FOR SELECT USING (
        district_id = (SELECT district_id FROM public.profiles WHERE id = auth.uid())
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_providers' AND policyname = 'Users can create their own service provider profile') THEN
    CREATE POLICY "Users can create their own service provider profile" ON public.service_providers
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_providers' AND policyname = 'Service providers can update their own profile') THEN
    CREATE POLICY "Service providers can update their own profile" ON public.service_providers
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_providers' AND policyname = 'Admins can manage service providers') THEN
    CREATE POLICY "Admins can manage service providers" ON public.service_providers
      FOR ALL USING (has_role('state_admin'::app_role) OR has_role('district_coordinator'::app_role));
  END IF;
END $$;

-- Continue with remaining policies
DO $$ 
BEGIN
  -- Service appointments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_appointments' AND policyname = 'Users can view their own appointments') THEN
    CREATE POLICY "Users can view their own appointments" ON public.service_appointments
      FOR SELECT USING (client_id = auth.uid() OR provider_id IN (
        SELECT id FROM public.service_providers WHERE user_id = auth.uid()
      ));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_appointments' AND policyname = 'Users can create appointments') THEN
    CREATE POLICY "Users can create appointments" ON public.service_appointments
      FOR INSERT WITH CHECK (client_id = auth.uid());
  END IF;
  
  -- Marketplace items policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'Users can view marketplace items in their district') THEN
    CREATE POLICY "Users can view marketplace items in their district" ON public.marketplace_items
      FOR SELECT USING (
        district_id = (SELECT district_id FROM public.profiles WHERE id = auth.uid()) AND is_available = true
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'Users can create their own marketplace items') THEN
    CREATE POLICY "Users can create their own marketplace items" ON public.marketplace_items
      FOR INSERT WITH CHECK (seller_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'Users can update their own marketplace items') THEN
    CREATE POLICY "Users can update their own marketplace items" ON public.marketplace_items
      FOR UPDATE USING (seller_id = auth.uid());
  END IF;
  
  -- Payments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view their own payments') THEN
    CREATE POLICY "Users can view their own payments" ON public.payments
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Admins can manage all payments') THEN
    CREATE POLICY "Admins can manage all payments" ON public.payments
      FOR ALL USING (has_role('state_admin'::app_role) OR has_role('district_coordinator'::app_role));
  END IF;
  
  -- Security patrols policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_patrols' AND policyname = 'Security officers can view their own patrols') THEN
    CREATE POLICY "Security officers can view their own patrols" ON public.security_patrols
      FOR SELECT USING (officer_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_patrols' AND policyname = 'Security admins can manage all patrols') THEN
    CREATE POLICY "Security admins can manage all patrols" ON public.security_patrols
      FOR ALL USING (has_role('security_officer'::app_role));
  END IF;
  
  -- System settings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Admins can manage system settings') THEN
    CREATE POLICY "Admins can manage system settings" ON public.system_settings
      FOR ALL USING (has_role('state_admin'::app_role));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Users can view system settings') THEN
    CREATE POLICY "Users can view system settings" ON public.system_settings
      FOR SELECT USING (true);
  END IF;
END $$;