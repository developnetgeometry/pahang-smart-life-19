-- Create additional tables for a complete community management system

-- Events and Activities Management
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'general', -- general, workshop, meeting, celebration
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    max_participants INTEGER,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    is_registration_required BOOLEAN DEFAULT false,
    organizer_id UUID,
    district_id UUID,
    status TEXT DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event Registrations
CREATE TABLE public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    attendance_status TEXT DEFAULT 'registered', -- registered, attended, absent
    notes TEXT
);

-- Payment and Billing System
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    district_id UUID,
    payment_type TEXT NOT NULL, -- facility_booking, maintenance_fee, event_fee, penalty
    reference_id UUID, -- booking_id, event_id, etc.
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'MYR',
    status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method TEXT, -- bank_transfer, credit_card, cash, cheque
    payment_date TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    description TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community Documents Management
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    document_type TEXT NOT NULL, -- policy, meeting_minutes, notice, form, guideline
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT, -- pdf, doc, image
    uploaded_by UUID,
    district_id UUID,
    is_public BOOLEAN DEFAULT false,
    access_roles TEXT[] DEFAULT ARRAY['resident'], -- roles that can access
    tags TEXT[],
    version TEXT DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Parking Management System
CREATE TABLE public.parking_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_number TEXT NOT NULL,
    zone TEXT NOT NULL, -- A, B, C, Visitor, etc.
    slot_type TEXT DEFAULT 'standard', -- standard, handicapped, visitor, reserved
    district_id UUID,
    is_occupied BOOLEAN DEFAULT false,
    assigned_user_id UUID,
    vehicle_plate TEXT,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    monthly_rate DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(district_id, slot_number)
);

-- Package/Delivery Management
CREATE TABLE public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    district_id UUID,
    tracking_number TEXT,
    sender_name TEXT NOT NULL,
    courier_company TEXT,
    package_type TEXT DEFAULT 'package', -- package, letter, food, grocery
    delivery_date DATE NOT NULL,
    delivery_time TIME,
    status TEXT DEFAULT 'pending', -- pending, collected, returned
    collection_method TEXT DEFAULT 'pickup', -- pickup, delivered
    collected_by TEXT,
    collected_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    photos TEXT[],
    received_by_staff UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Emergency Contacts Management
CREATE TABLE public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_type TEXT NOT NULL, -- police, fire, hospital, ambulance, utility
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    address TEXT,
    district_id UUID,
    is_24_hours BOOLEAN DEFAULT true,
    priority_level INTEGER DEFAULT 1, -- 1=highest, 5=lowest
    services TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community Polls and Voting
CREATE TABLE public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    poll_type TEXT DEFAULT 'single_choice', -- single_choice, multiple_choice, rating
    options JSONB NOT NULL, -- {"options": [{"id": 1, "text": "Option A"}, ...]}
    created_by UUID,
    district_id UUID,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    is_anonymous BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Poll Votes
CREATE TABLE public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    selected_options INTEGER[], -- array of option IDs
    rating INTEGER, -- for rating type polls
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(poll_id, user_id)
);

-- Feedback and Surveys
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    feedback_type TEXT DEFAULT 'general', -- general, suggestion, complaint, compliment
    category TEXT, -- facilities, services, management, maintenance
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    submitted_by UUID,
    district_id UUID,
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending', -- pending, reviewed, responded, closed
    response TEXT,
    responded_by UUID,
    responded_at TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Asset Management
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    asset_type TEXT NOT NULL, -- equipment, furniture, vehicle, technology
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    location TEXT NOT NULL,
    district_id UUID,
    condition_status TEXT DEFAULT 'good', -- excellent, good, fair, poor, broken
    maintenance_schedule TEXT, -- weekly, monthly, quarterly, annually
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    assigned_to UUID,
    warranty_expiry DATE,
    is_active BOOLEAN DEFAULT true,
    photos TEXT[],
    documents TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Meeting Minutes
CREATE TABLE public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_title TEXT NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_time TIME,
    location TEXT,
    meeting_type TEXT NOT NULL, -- agm, committee, emergency, workshop
    chairperson TEXT,
    secretary TEXT,
    attendees TEXT[],
    agenda TEXT NOT NULL,
    discussions TEXT NOT NULL,
    decisions TEXT NOT NULL,
    action_items JSONB, -- [{"task": "", "assignee": "", "deadline": ""}]
    next_meeting_date DATE,
    district_id UUID,
    status TEXT DEFAULT 'draft', -- draft, approved, published
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Staff Management
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL, -- security, maintenance, cleaning, administration
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    hire_date DATE NOT NULL,
    employment_type TEXT DEFAULT 'full_time', -- full_time, part_time, contract
    salary DECIMAL(10,2),
    district_id UUID,
    supervisor_id UUID REFERENCES staff(id),
    is_active BOOLEAN DEFAULT true,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    skills TEXT[],
    certifications TEXT[],
    shift_schedule JSONB, -- {"monday": "9:00-17:00", ...}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inventory Management
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- cleaning, maintenance, office, safety
    brand TEXT,
    unit TEXT NOT NULL, -- pieces, kg, liters, etc.
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    unit_price DECIMAL(10,2),
    supplier TEXT,
    storage_location TEXT NOT NULL,
    district_id UUID,
    expiry_date DATE,
    last_restocked DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inventory Movements
CREATE TABLE public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL, -- in, out, adjustment
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT, -- purchase, usage, damaged, expired, adjustment
    reference_document TEXT,
    moved_by UUID,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT
);

-- Financial Records
CREATE TABLE public.financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type TEXT NOT NULL, -- income, expense
    category TEXT NOT NULL, -- maintenance_fee, utility, salary, equipment, service
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'MYR',
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    payment_method TEXT, -- bank_transfer, cash, cheque
    reference_number TEXT,
    vendor_supplier TEXT,
    district_id UUID,
    fiscal_year INTEGER,
    fiscal_month INTEGER,
    budget_category TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency TEXT, -- monthly, quarterly, annually
    approved_by UUID,
    recorded_by UUID,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Incident Reports
CREATE TABLE public.incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type TEXT NOT NULL, -- security, safety, property_damage, noise, dispute
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    location TEXT NOT NULL,
    incident_date DATE NOT NULL,
    incident_time TIME,
    reported_by UUID,
    witnesses TEXT[],
    district_id UUID,
    status TEXT DEFAULT 'reported', -- reported, investigating, resolved, closed
    assigned_to UUID,
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    photos TEXT[],
    documents TEXT[],
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notification System
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID,
    recipient_type TEXT DEFAULT 'user', -- user, role, district, all
    recipient_roles TEXT[], -- for role-based notifications
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info', -- info, warning, success, error
    category TEXT, -- announcement, booking, complaint, payment, etc.
    reference_id UUID, -- ID of related record
    reference_table TEXT, -- table name of related record
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_method TEXT[] DEFAULT ARRAY['in_app'], -- in_app, email, sms, push
    district_id UUID,
    created_by UUID,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_events_district_date ON events(district_id, start_date);
CREATE INDEX idx_event_registrations_event_user ON event_registrations(event_id, user_id);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
CREATE INDEX idx_payments_due_date ON payments(due_date) WHERE status = 'pending';
CREATE INDEX idx_documents_district_type ON documents(district_id, document_type);
CREATE INDEX idx_parking_slots_district_occupied ON parking_slots(district_id, is_occupied);
CREATE INDEX idx_deliveries_recipient_status ON deliveries(recipient_id, status);
CREATE INDEX idx_polls_district_active ON polls(district_id, is_active);
CREATE INDEX idx_feedback_district_status ON feedback(district_id, status);
CREATE INDEX idx_assets_district_condition ON assets(district_id, condition_status);
CREATE INDEX idx_staff_district_active ON staff(district_id, is_active);
CREATE INDEX idx_inventory_district_stock ON inventory(district_id, current_stock);
CREATE INDEX idx_financial_records_date_type ON financial_records(transaction_date, transaction_type);
CREATE INDEX idx_incident_reports_district_status ON incident_reports(district_id, status);
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);

-- Add updated_at triggers
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parking_slots_updated_at BEFORE UPDATE ON parking_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON polls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_minutes_updated_at BEFORE UPDATE ON meeting_minutes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON financial_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incident_reports_updated_at BEFORE UPDATE ON incident_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();