-- Enhanced Facility Management System Database Schema

-- Add enhanced facility configurations
CREATE TABLE IF NOT EXISTS public.facility_configurations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    operating_hours JSONB NOT NULL DEFAULT '{"monday":{"open":"08:00","close":"22:00","closed":false},"tuesday":{"open":"08:00","close":"22:00","closed":false},"wednesday":{"open":"08:00","close":"22:00","closed":false},"thursday":{"open":"08:00","close":"22:00","closed":false},"friday":{"open":"08:00","close":"22:00","closed":false},"saturday":{"open":"08:00","close":"22:00","closed":false},"sunday":{"open":"08:00","close":"22:00","closed":false}}'::jsonb,
    peak_hours JSONB NOT NULL DEFAULT '{"weekday_peak":["18:00","21:00"],"weekend_peak":["10:00","16:00"]}'::jsonb,
    pricing_tiers JSONB NOT NULL DEFAULT '{"standard":{"hourly_rate":50},"peak":{"hourly_rate":75},"off_peak":{"hourly_rate":30}}'::jsonb,
    booking_rules JSONB NOT NULL DEFAULT '{"max_hours_per_booking":4,"advance_booking_days":30,"cancellation_hours":24,"requires_approval":true}'::jsonb,
    equipment_list JSONB DEFAULT '[]'::jsonb,
    safety_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add facility usage analytics
CREATE TABLE IF NOT EXISTS public.facility_usage_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    usage_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
    revenue_generated DECIMAL(10,2) NOT NULL DEFAULT 0,
    occupancy_rate DECIMAL(5,2), -- percentage
    peak_usage_time TIME,
    user_satisfaction_rating DECIMAL(3,2), -- 1-5 scale
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add recurring bookings support
CREATE TABLE IF NOT EXISTS public.recurring_bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    purpose TEXT,
    recurrence_pattern TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    recurrence_interval INTEGER NOT NULL DEFAULT 1, -- every N days/weeks/months
    days_of_week INTEGER[], -- for weekly: [1,2,3,4,5] for Mon-Fri
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE, -- null for indefinite
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    next_booking_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add equipment and asset tracking
CREATE TABLE IF NOT EXISTS public.facility_equipment (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    equipment_type TEXT NOT NULL,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    warranty_expiry DATE,
    qr_code TEXT UNIQUE,
    condition_status TEXT NOT NULL DEFAULT 'good' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'out_of_service')),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_interval_days INTEGER DEFAULT 90,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add supply inventory management
CREATE TABLE IF NOT EXISTS public.facility_supplies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'cleaning', 'maintenance', 'safety', 'consumables'
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 5,
    maximum_stock INTEGER NOT NULL DEFAULT 100,
    unit_cost DECIMAL(10,2),
    supplier TEXT,
    last_restocked_date DATE,
    expiry_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add booking approval workflow
CREATE TABLE IF NOT EXISTS public.booking_approvals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approval_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    escalated BOOLEAN NOT NULL DEFAULT false,
    escalated_to UUID,
    escalated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add booking waitlist
CREATE TABLE IF NOT EXISTS public.booking_waitlist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    requested_date DATE NOT NULL,
    requested_start_time TIME NOT NULL,
    requested_end_time TIME NOT NULL,
    purpose TEXT,
    priority INTEGER NOT NULL DEFAULT 1, -- 1=low, 2=medium, 3=high
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'offered', 'confirmed', 'expired', 'cancelled')),
    offered_at TIMESTAMP WITH TIME ZONE,
    offer_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add maintenance scheduling
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.facility_equipment(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL, -- 'preventive', 'corrective', 'inspection'
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    estimated_duration_hours DECIMAL(4,2),
    assigned_to UUID,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    completion_notes TEXT,
    actual_duration_hours DECIMAL(4,2),
    cost DECIMAL(10,2),
    completed_at TIMESTAMP WITH TIME ZONE,
    next_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT maintenance_target_check CHECK (
        (facility_id IS NOT NULL AND equipment_id IS NULL) OR 
        (facility_id IS NULL AND equipment_id IS NOT NULL)
    )
);

-- Add enhanced work orders for facility management
CREATE TABLE IF NOT EXISTS public.facility_work_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.facility_equipment(id) ON DELETE SET NULL,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    maintenance_schedule_id UUID REFERENCES public.maintenance_schedules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    work_order_type TEXT NOT NULL DEFAULT 'maintenance' CHECK (work_order_type IN ('maintenance', 'repair', 'inspection', 'upgrade', 'emergency')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    created_by UUID NOT NULL,
    assigned_to UUID,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    estimated_duration_hours DECIMAL(4,2),
    actual_duration_hours DECIMAL(4,2),
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_notes TEXT,
    before_photos TEXT[], -- URLs to photos
    after_photos TEXT[],
    required_skills TEXT[],
    safety_requirements TEXT,
    parts_needed JSONB DEFAULT '[]'::jsonb,
    vendor_info JSONB,
    district_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_facility_configurations_facility_id ON public.facility_configurations(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_usage_analytics_facility_date ON public.facility_usage_analytics(facility_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_next_date ON public.recurring_bookings(next_booking_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_facility_equipment_facility_id ON public.facility_equipment(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_equipment_qr_code ON public.facility_equipment(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_facility_supplies_facility_id ON public.facility_supplies(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_supplies_low_stock ON public.facility_supplies(facility_id) WHERE current_stock <= minimum_stock;
CREATE INDEX IF NOT EXISTS idx_booking_approvals_booking_id ON public.booking_approvals(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_waitlist_facility_date ON public.booking_waitlist(facility_id, requested_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_date ON public.maintenance_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_facility_work_orders_facility_id ON public.facility_work_orders(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_work_orders_assigned_to ON public.facility_work_orders(assigned_to);

-- Enable Row Level Security
ALTER TABLE public.facility_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_work_orders ENABLE ROW LEVEL SECURITY;