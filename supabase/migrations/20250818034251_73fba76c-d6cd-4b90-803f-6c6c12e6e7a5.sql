-- Enable Row Level Security (RLS) and create policies for all new tables

-- Enable RLS on all new tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Events table policies
CREATE POLICY "Users can view events in their district" ON public.events
FOR SELECT USING (district_id = get_user_district());

CREATE POLICY "Managers can manage events" ON public.events
FOR ALL USING (has_role('manager') OR has_role('admin'));

CREATE POLICY "Users can create events" ON public.events
FOR INSERT WITH CHECK (organizer_id = auth.uid());

-- Event registrations policies
CREATE POLICY "Users can view their own registrations" ON public.event_registrations
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can register for events" ON public.event_registrations
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can view all registrations" ON public.event_registrations
FOR SELECT USING (has_role('manager') OR has_role('admin'));

CREATE POLICY "Users can update their registrations" ON public.event_registrations
FOR UPDATE USING (user_id = auth.uid());

-- Payments table policies
CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view all payments" ON public.payments
FOR SELECT USING (has_role('manager') OR has_role('admin'));

CREATE POLICY "Managers can manage payments" ON public.payments
FOR ALL USING (has_role('manager') OR has_role('admin'));

-- Documents table policies
CREATE POLICY "Users can view public documents" ON public.documents
FOR SELECT USING (is_public = true OR district_id = get_user_district());

CREATE POLICY "Users can view documents by role" ON public.documents
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM unnest(access_roles) AS role 
        WHERE has_role(role::user_role)
    )
);

CREATE POLICY "Managers can manage documents" ON public.documents
FOR ALL USING (has_role('manager') OR has_role('admin'));

-- Parking slots policies
CREATE POLICY "Users can view parking slots in their district" ON public.parking_slots
FOR SELECT USING (district_id = get_user_district());

CREATE POLICY "Users can view their assigned slots" ON public.parking_slots
FOR SELECT USING (assigned_user_id = auth.uid());

CREATE POLICY "Managers can manage parking slots" ON public.parking_slots
FOR ALL USING (has_role('manager') OR has_role('admin'));

-- Deliveries policies
CREATE POLICY "Users can view their own deliveries" ON public.deliveries
FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Security can manage deliveries" ON public.deliveries
FOR ALL USING (has_role('security') OR has_role('admin'));

CREATE POLICY "Users can create delivery records" ON public.deliveries
FOR INSERT WITH CHECK (recipient_id = auth.uid());

-- Emergency contacts policies
CREATE POLICY "Everyone can view emergency contacts" ON public.emergency_contacts
FOR SELECT USING (true);

CREATE POLICY "Managers can manage emergency contacts" ON public.emergency_contacts
FOR ALL USING (has_role('manager') OR has_role('admin'));

-- Polls policies
CREATE POLICY "Users can view active polls in their district" ON public.polls
FOR SELECT USING (district_id = get_user_district() AND is_active = true);

CREATE POLICY "Managers can manage polls" ON public.polls
FOR ALL USING (has_role('manager') OR has_role('admin'));

CREATE POLICY "Users can create polls" ON public.polls
FOR INSERT WITH CHECK (created_by = auth.uid());

-- Poll votes policies
CREATE POLICY "Users can view their own votes" ON public.poll_votes
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create votes" ON public.poll_votes
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can view all votes" ON public.poll_votes
FOR SELECT USING (has_role('manager') OR has_role('admin'));

-- Feedback policies
CREATE POLICY "Users can view their own feedback" ON public.feedback
FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Users can create feedback" ON public.feedback
FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Managers can view all feedback" ON public.feedback
FOR SELECT USING (has_role('manager') OR has_role('admin'));

CREATE POLICY "Managers can update feedback" ON public.feedback
FOR UPDATE USING (has_role('manager') OR has_role('admin'));

-- Assets policies
CREATE POLICY "Users can view assets in their district" ON public.assets
FOR SELECT USING (district_id = get_user_district());

CREATE POLICY "Managers can manage assets" ON public.assets
FOR ALL USING (has_role('manager') OR has_role('admin'));

-- Meeting minutes policies
CREATE POLICY "Users can view published meeting minutes" ON public.meeting_minutes
FOR SELECT USING (district_id = get_user_district() AND status = 'published');

CREATE POLICY "Managers can manage meeting minutes" ON public.meeting_minutes
FOR ALL USING (has_role('manager') OR has_role('admin'));

-- Staff policies
CREATE POLICY "Managers can manage staff" ON public.staff
FOR ALL USING (has_role('manager') OR has_role('admin'));

CREATE POLICY "Staff can view their own record" ON public.staff
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() AND p.email = staff.email
    )
);

-- Inventory policies
CREATE POLICY "Staff can view inventory" ON public.inventory
FOR SELECT USING (has_role('manager') OR has_role('admin') OR has_role('security'));

CREATE POLICY "Managers can manage inventory" ON public.inventory
FOR ALL USING (has_role('manager') OR has_role('admin'));

-- Inventory movements policies
CREATE POLICY "Staff can view inventory movements" ON public.inventory_movements
FOR SELECT USING (has_role('manager') OR has_role('admin') OR has_role('security'));

CREATE POLICY "Staff can create movements" ON public.inventory_movements
FOR INSERT WITH CHECK (moved_by = auth.uid());

CREATE POLICY "Managers can manage movements" ON public.inventory_movements
FOR ALL USING (has_role('manager') OR has_role('admin'));

-- Financial records policies
CREATE POLICY "Managers can manage financial records" ON public.financial_records
FOR ALL USING (has_role('manager') OR has_role('admin'));

-- Incident reports policies
CREATE POLICY "Users can view their own incident reports" ON public.incident_reports
FOR SELECT USING (reported_by = auth.uid());

CREATE POLICY "Users can create incident reports" ON public.incident_reports
FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Security can manage incident reports" ON public.incident_reports
FOR ALL USING (has_role('security') OR has_role('manager') OR has_role('admin'));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (
    recipient_id = auth.uid() OR 
    recipient_type = 'all' OR
    (recipient_type = 'district' AND district_id = get_user_district()) OR
    (recipient_type = 'role' AND EXISTS (
        SELECT 1 FROM unnest(recipient_roles) AS role 
        WHERE has_role(role::user_role)
    ))
);

CREATE POLICY "Users can update their notification read status" ON public.notifications
FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY "Managers can manage notifications" ON public.notifications
FOR ALL USING (has_role('manager') OR has_role('admin'));