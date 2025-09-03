-- Implement comprehensive workflow system for all modules (Fixed version)

-- 1. Service Requests Management
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    location TEXT,
    preferred_date DATE,
    preferred_time TIME,
    budget_range TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    community_id UUID REFERENCES communities(id),
    district_id UUID REFERENCES districts(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT
);

-- 2. Emergency Alerts (Panic Alerts & Security Incidents)
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('panic', 'security', 'fire', 'medical', 'maintenance')),
    severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_alarm')),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    coordinates POINT,
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    responder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    community_id UUID REFERENCES communities(id),
    district_id UUID REFERENCES districts(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    response_notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb
);

-- 3. Visitor Management System
CREATE TABLE IF NOT EXISTS public.visitor_registrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT,
    visitor_ic TEXT,
    visitor_vehicle TEXT,
    visit_purpose TEXT,
    visit_date DATE NOT NULL,
    visit_time_from TIME NOT NULL,
    visit_time_to TIME NOT NULL,
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    host_unit TEXT NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    actual_checkin TIMESTAMP WITH TIME ZONE,
    actual_checkout TIMESTAMP WITH TIME ZONE,
    security_notes TEXT,
    community_id UUID REFERENCES communities(id),
    district_id UUID REFERENCES districts(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Maintenance Schedules for Assets
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    frequency_value INTEGER NOT NULL DEFAULT 1,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    estimated_duration_hours INTEGER,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    next_due_date DATE NOT NULL,
    last_completed DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Marketplace Disputes
CREATE TABLE IF NOT EXISTS public.marketplace_disputes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID, -- Will reference marketplace orders when implemented
    item_id UUID, -- Will reference marketplace items when implemented
    complainant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    respondent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    dispute_type TEXT NOT NULL CHECK (dispute_type IN ('quality', 'delivery', 'payment', 'description', 'other')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    resolution TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    community_id UUID REFERENCES communities(id),
    district_id UUID REFERENCES districts(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Workflow State Management (Universal workflow tracking)
CREATE TABLE IF NOT EXISTS public.workflow_states (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_table TEXT NOT NULL,
    reference_id UUID NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 0,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_role enhanced_user_role,
    status TEXT NOT NULL,
    sla_due_at TIMESTAMP WITH TIME ZONE,
    escalated_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(reference_table, reference_id)
);

-- 7. SLA Configuration
CREATE TABLE IF NOT EXISTS public.sla_configurations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_name TEXT NOT NULL,
    category TEXT,
    priority TEXT NOT NULL,
    level_0_timeout_hours INTEGER NOT NULL DEFAULT 24,
    level_1_timeout_hours INTEGER NOT NULL DEFAULT 48,
    level_2_timeout_hours INTEGER NOT NULL DEFAULT 72,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(module_name, category, priority)
);

-- Enable RLS on all new tables
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_configurations ENABLE ROW LEVEL SECURITY;