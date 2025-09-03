-- Add RLS Policies for Enhanced Facility Management Tables

-- RLS Policies for facility_configurations
CREATE POLICY "Facility managers can manage facility configurations"
    ON public.facility_configurations FOR ALL
    USING (
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role)
    );

CREATE POLICY "Users can view facility configurations"
    ON public.facility_configurations FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- RLS Policies for facility_usage_analytics  
CREATE POLICY "Facility managers can view usage analytics"
    ON public.facility_usage_analytics FOR SELECT
    USING (
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role)
    );

CREATE POLICY "System can insert usage analytics"
    ON public.facility_usage_analytics FOR INSERT
    WITH CHECK (true); -- System-generated data

-- RLS Policies for recurring_bookings
CREATE POLICY "Users can manage their recurring bookings"
    ON public.recurring_bookings FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Facility managers can view recurring bookings"
    ON public.recurring_bookings FOR SELECT
    USING (
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role)
    );

-- RLS Policies for facility_equipment
CREATE POLICY "Facility managers can manage equipment"
    ON public.facility_equipment FOR ALL
    USING (
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('maintenance_staff'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role)
    );

CREATE POLICY "Users can view equipment"
    ON public.facility_equipment FOR SELECT
    USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for facility_supplies
CREATE POLICY "Facility managers can manage supplies"
    ON public.facility_supplies FOR ALL
    USING (
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('maintenance_staff'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role)
    );

-- RLS Policies for booking_approvals
CREATE POLICY "Users can view their booking approvals"
    ON public.booking_approvals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = booking_approvals.booking_id 
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Facility managers can manage booking approvals"
    ON public.booking_approvals FOR ALL
    USING (
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role)
    );

-- RLS Policies for booking_waitlist
CREATE POLICY "Users can manage their waitlist entries"
    ON public.booking_waitlist FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Facility managers can view all waitlist entries"
    ON public.booking_waitlist FOR SELECT
    USING (
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role)
    );

-- RLS Policies for maintenance_schedules
CREATE POLICY "Facility and maintenance staff can manage schedules"
    ON public.maintenance_schedules FOR ALL
    USING (
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('maintenance_staff'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role) OR 
        assigned_to = auth.uid()
    );

-- RLS Policies for facility_work_orders
CREATE POLICY "Work order creators and assignees can view"
    ON public.facility_work_orders FOR SELECT
    USING (
        created_by = auth.uid() OR 
        assigned_to = auth.uid() OR
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('maintenance_staff'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role)
    );

CREATE POLICY "Facility managers can create work orders"
    ON public.facility_work_orders FOR INSERT
    WITH CHECK (
        created_by = auth.uid() AND (
            has_enhanced_role('facility_manager'::enhanced_user_role) OR 
            has_enhanced_role('community_admin'::enhanced_user_role) OR 
            has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
            has_enhanced_role('state_admin'::enhanced_user_role)
        )
    );

CREATE POLICY "Work order assignees and managers can update"
    ON public.facility_work_orders FOR UPDATE
    USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid() OR
        has_enhanced_role('facility_manager'::enhanced_user_role) OR 
        has_enhanced_role('maintenance_staff'::enhanced_user_role) OR 
        has_enhanced_role('community_admin'::enhanced_user_role) OR 
        has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
        has_enhanced_role('state_admin'::enhanced_user_role)
    );

-- Add triggers for automatic recurring booking generation
CREATE OR REPLACE FUNCTION public.generate_next_recurring_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate next booking date based on recurrence pattern
    IF NEW.recurrence_pattern = 'daily' THEN
        NEW.next_booking_date := NEW.start_date + (NEW.recurrence_interval || ' days')::INTERVAL;
    ELSIF NEW.recurrence_pattern = 'weekly' THEN
        NEW.next_booking_date := NEW.start_date + (NEW.recurrence_interval || ' weeks')::INTERVAL;
    ELSIF NEW.recurrence_pattern = 'monthly' THEN
        NEW.next_booking_date := NEW.start_date + (NEW.recurrence_interval || ' months')::INTERVAL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_generate_next_recurring_booking
    BEFORE INSERT ON public.recurring_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_next_recurring_booking();

-- Add trigger for facility usage analytics
CREATE OR REPLACE FUNCTION public.log_facility_usage()
RETURNS TRIGGER AS $$
DECLARE
    config_data JSONB;
    pricing JSONB;
    revenue DECIMAL(10,2) := 0;
    peak_rate BOOLEAN := false;
BEGIN
    -- Get facility configuration for pricing
    SELECT pricing_tiers INTO pricing
    FROM public.facility_configurations 
    WHERE facility_id = NEW.facility_id;
    
    -- Calculate revenue based on booking duration and pricing tier
    IF pricing IS NOT NULL THEN
        -- Simple calculation - can be enhanced based on time of day
        revenue := (EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600) * 
                  COALESCE((pricing->'standard'->>'hourly_rate')::DECIMAL, 0);
    END IF;
    
    -- Log usage analytics when booking is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO public.facility_usage_analytics (
            facility_id,
            booking_id,
            usage_date,
            usage_hours,
            revenue_generated
        ) VALUES (
            NEW.facility_id,
            NEW.id,
            NEW.booking_date,
            EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600,
            revenue
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_log_facility_usage
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.log_facility_usage();

-- Add trigger for low stock alerts
CREATE OR REPLACE FUNCTION public.check_low_stock_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for low stock
    IF NEW.current_stock <= NEW.minimum_stock AND OLD.current_stock > NEW.minimum_stock THEN
        INSERT INTO public.notifications (
            recipient_id,
            title,
            message,
            notification_type,
            category,
            reference_id,
            reference_table,
            priority,
            sent_at
        )
        SELECT 
            eur.user_id,
            'Low Stock Alert',
            CONCAT('Supply "', NEW.item_name, '" is running low. Current stock: ', NEW.current_stock, ', Minimum: ', NEW.minimum_stock),
            'supply_alert',
            'facility',
            NEW.id,
            'facility_supplies',
            'high',
            NOW()
        FROM public.enhanced_user_roles eur
        WHERE eur.role = 'facility_manager' 
        AND eur.is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_check_low_stock_alerts
    AFTER UPDATE ON public.facility_supplies
    FOR EACH ROW
    EXECUTE FUNCTION public.check_low_stock_alerts();