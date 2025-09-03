-- Create complaint escalations table
CREATE TABLE complaint_escalations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    from_department TEXT NOT NULL,
    to_department TEXT NOT NULL,
    escalation_reason TEXT NOT NULL,
    escalated_by UUID REFERENCES auth.users(id) NOT NULL,
    escalated_to UUID REFERENCES auth.users(id),
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE complaint_escalations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view escalations for complaints in their district"
ON complaint_escalations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM complaints c 
        WHERE c.id = complaint_escalations.complaint_id 
        AND c.district_id = get_user_district()
    )
);

CREATE POLICY "Facility managers can create escalations"
ON complaint_escalations FOR INSERT
WITH CHECK (
    escalated_by = auth.uid() AND
    (has_enhanced_role('facility_manager') OR 
     has_enhanced_role('maintenance_staff') OR 
     has_enhanced_role('community_admin'))
);

CREATE POLICY "Escalation recipients can update escalations"
ON complaint_escalations FOR UPDATE
USING (
    escalated_to = auth.uid() OR
    escalated_by = auth.uid() OR
    has_enhanced_role('community_admin')
);