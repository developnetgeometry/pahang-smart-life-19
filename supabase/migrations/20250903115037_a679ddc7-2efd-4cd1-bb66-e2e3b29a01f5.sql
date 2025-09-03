-- Create work_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'assigned')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    work_order_type TEXT NOT NULL DEFAULT 'maintenance',
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    complaint_id UUID REFERENCES complaints(id),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    materials_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    community_id UUID REFERENCES communities(id),
    district_id UUID REFERENCES districts(id)
);

-- Create work_order_activities table for tracking status changes
CREATE TABLE IF NOT EXISTS public.work_order_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB
);

-- Enable RLS on both tables
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for work_orders
CREATE POLICY "Users can view work orders assigned to them or created by them" 
ON public.work_orders 
FOR SELECT 
USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    EXISTS (
        SELECT 1 FROM enhanced_user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('maintenance_staff', 'facility_manager', 'community_admin', 'state_admin')
        AND is_active = true
    )
);

CREATE POLICY "Authorized users can create work orders" 
ON public.work_orders 
FOR INSERT 
WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
        SELECT 1 FROM enhanced_user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('maintenance_staff', 'facility_manager', 'community_admin', 'state_admin')
        AND is_active = true
    )
);

CREATE POLICY "Assigned staff can update their work orders" 
ON public.work_orders 
FOR UPDATE 
USING (
    auth.uid() = assigned_to OR
    EXISTS (
        SELECT 1 FROM enhanced_user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('facility_manager', 'community_admin', 'state_admin')
        AND is_active = true
    )
);

-- Create policies for work_order_activities
CREATE POLICY "Users can view activities for work orders they have access to" 
ON public.work_order_activities 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM work_orders wo
        WHERE wo.id = work_order_id
        AND (
            auth.uid() = wo.assigned_to OR 
            auth.uid() = wo.created_by OR
            EXISTS (
                SELECT 1 FROM enhanced_user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('maintenance_staff', 'facility_manager', 'community_admin', 'state_admin')
                AND is_active = true
            )
        )
    )
);

CREATE POLICY "Authorized users can create work order activities" 
ON public.work_order_activities 
FOR INSERT 
WITH CHECK (
    auth.uid() = performed_by AND
    EXISTS (
        SELECT 1 FROM enhanced_user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('maintenance_staff', 'facility_manager', 'community_admin', 'state_admin')
        AND is_active = true
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_by ON work_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_complaint_id ON work_orders(complaint_id);
CREATE INDEX IF NOT EXISTS idx_work_order_activities_work_order_id ON work_order_activities(work_order_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_work_orders_updated_at
    BEFORE UPDATE ON public.work_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();