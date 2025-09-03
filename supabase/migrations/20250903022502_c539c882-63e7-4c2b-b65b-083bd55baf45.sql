-- Create work orders system for complaint management
CREATE TYPE work_order_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE work_order_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE work_order_type AS ENUM ('maintenance', 'repair', 'inspection', 'emergency', 'general');

-- Work Orders table
CREATE TABLE work_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    work_order_type work_order_type NOT NULL DEFAULT 'general',
    priority work_order_priority NOT NULL DEFAULT 'medium',
    status work_order_status NOT NULL DEFAULT 'pending',
    location TEXT NOT NULL,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- Relationships
    complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    assigned_to UUID REFERENCES auth.users(id),
    district_id UUID REFERENCES districts(id),
    
    -- Metadata
    scheduled_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    materials_needed TEXT[],
    photos TEXT[] DEFAULT '{}',
    notes TEXT,
    completion_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Work Order Activities/Log table for tracking progress
CREATE TABLE work_order_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'created', 'assigned', 'status_changed', 'comment', 'completed'
    description TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Work Order Escalations table
CREATE TABLE work_order_escalations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    from_department TEXT NOT NULL, -- maintenance, security, facilities, etc.
    to_department TEXT NOT NULL,
    escalation_reason TEXT NOT NULL,
    escalated_by UUID REFERENCES auth.users(id) NOT NULL,
    escalated_to UUID REFERENCES auth.users(id),
    notes TEXT,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_escalations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_orders
CREATE POLICY "Users can view work orders in their district"
ON work_orders FOR SELECT
USING (district_id = get_user_district());

CREATE POLICY "Facility managers can create work orders"
ON work_orders FOR INSERT
WITH CHECK (
    has_enhanced_role('facility_manager') OR 
    has_enhanced_role('maintenance_staff') OR 
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

CREATE POLICY "Management can update work orders"
ON work_orders FOR UPDATE
USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    has_enhanced_role('facility_manager') OR 
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

CREATE POLICY "Management can delete work orders"
ON work_orders FOR DELETE
USING (
    created_by = auth.uid() OR
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

-- RLS Policies for work_order_activities
CREATE POLICY "Users can view activities for work orders they can see"
ON work_order_activities FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM work_orders wo 
        WHERE wo.id = work_order_activities.work_order_id 
        AND wo.district_id = get_user_district()
    )
);

CREATE POLICY "Users can create activities for work orders they can access"
ON work_order_activities FOR INSERT
WITH CHECK (
    performed_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM work_orders wo 
        WHERE wo.id = work_order_activities.work_order_id 
        AND (
            wo.assigned_to = auth.uid() OR
            wo.created_by = auth.uid() OR
            has_enhanced_role('facility_manager') OR 
            has_enhanced_role('community_admin')
        )
    )
);

-- RLS Policies for work_order_escalations
CREATE POLICY "Users can view escalations for work orders they can see"
ON work_order_escalations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM work_orders wo 
        WHERE wo.id = work_order_escalations.work_order_id 
        AND wo.district_id = get_user_district()
    )
);

CREATE POLICY "Facility managers can create escalations"
ON work_order_escalations FOR INSERT
WITH CHECK (
    escalated_by = auth.uid() AND
    (has_enhanced_role('facility_manager') OR 
     has_enhanced_role('maintenance_staff') OR 
     has_enhanced_role('community_admin'))
);

CREATE POLICY "Escalation recipients can update escalations"
ON work_order_escalations FOR UPDATE
USING (
    escalated_to = auth.uid() OR
    escalated_by = auth.uid() OR
    has_enhanced_role('community_admin')
);

-- Triggers for work order activities
CREATE OR REPLACE FUNCTION log_work_order_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO work_order_activities (work_order_id, activity_type, description, performed_by)
        VALUES (NEW.id, 'created', 'Work order created', NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log status changes
        IF OLD.status != NEW.status THEN
            INSERT INTO work_order_activities (work_order_id, activity_type, description, performed_by, metadata)
            VALUES (NEW.id, 'status_changed', 
                   CONCAT('Status changed from ', OLD.status, ' to ', NEW.status),
                   COALESCE(NEW.assigned_to, NEW.created_by),
                   jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
        END IF;
        
        -- Log assignment changes
        IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
            INSERT INTO work_order_activities (work_order_id, activity_type, description, performed_by, metadata)
            VALUES (NEW.id, 'assigned', 
                   'Work order assignment changed',
                   COALESCE(NEW.assigned_to, NEW.created_by),
                   jsonb_build_object('assigned_to', NEW.assigned_to));
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER work_order_activity_log
    AFTER INSERT OR UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_work_order_activity();

-- Function to create work order from complaint
CREATE OR REPLACE FUNCTION create_work_order_from_complaint(
    p_complaint_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_work_order_type work_order_type DEFAULT 'general',
    p_priority work_order_priority DEFAULT 'medium',
    p_location TEXT DEFAULT NULL,
    p_assigned_to UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    work_order_id UUID;
    complaint_location TEXT;
    complaint_district UUID;
BEGIN
    -- Get complaint details
    SELECT location, district_id INTO complaint_location, complaint_district
    FROM complaints WHERE id = p_complaint_id;
    
    -- Create work order
    INSERT INTO work_orders (
        complaint_id, title, description, work_order_type, priority, 
        location, assigned_to, created_by, district_id
    ) VALUES (
        p_complaint_id, p_title, p_description, p_work_order_type, p_priority,
        COALESCE(p_location, complaint_location), p_assigned_to, auth.uid(), complaint_district
    ) RETURNING id INTO work_order_id;
    
    -- Update complaint status
    UPDATE complaints 
    SET status = 'in_progress', updated_at = now()
    WHERE id = p_complaint_id;
    
    RETURN work_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;