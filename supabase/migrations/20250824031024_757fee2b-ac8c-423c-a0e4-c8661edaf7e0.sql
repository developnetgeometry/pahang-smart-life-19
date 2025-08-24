-- Create storage bucket for activity images
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-images', 'activity-images', true);

-- Create storage policies for activity images
CREATE POLICY "Activity images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'activity-images');

CREATE POLICY "Authenticated users can upload activity images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'activity-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update activity images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'activity-images' AND has_enhanced_role('community_admin'));

CREATE POLICY "Admins can delete activity images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'activity-images' AND has_enhanced_role('community_admin'));

-- Create community activities table
CREATE TABLE IF NOT EXISTS public.community_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('event', 'announcement', 'community', 'sports')),
    date_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    image_url TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    district_id UUID REFERENCES public.districts(id),
    created_by UUID REFERENCES auth.users(id),
    is_published BOOLEAN DEFAULT true,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_required BOOLEAN DEFAULT false,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dashboard metrics table
CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    metric_type TEXT NOT NULL,
    metric_value TEXT NOT NULL,
    trend_text TEXT,
    status TEXT,
    icon_name TEXT,
    district_id UUID REFERENCES public.districts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community updates table  
CREATE TABLE IF NOT EXISTS public.community_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    update_type TEXT NOT NULL CHECK (update_type IN ('maintenance', 'event', 'announcement', 'security', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    district_id UUID REFERENCES public.districts(id),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    details JSONB,
    affected_areas TEXT[],
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recent activities log table
CREATE TABLE IF NOT EXISTS public.recent_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    reference_id UUID,
    reference_table TEXT,
    district_id UUID REFERENCES public.districts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_activities
CREATE POLICY "Users can view activities in their district" 
ON public.community_activities 
FOR SELECT 
USING (district_id = get_user_district() AND is_published = true);

CREATE POLICY "Admins can manage community activities" 
ON public.community_activities 
FOR ALL 
USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

-- RLS policies for dashboard_metrics
CREATE POLICY "Users can view their own metrics" 
ON public.dashboard_metrics 
FOR SELECT 
USING (user_id = auth.uid() OR district_id = get_user_district());

CREATE POLICY "System can insert metrics" 
ON public.dashboard_metrics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage metrics" 
ON public.dashboard_metrics 
FOR ALL 
USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator'));

-- RLS policies for community_updates
CREATE POLICY "Users can view updates in their district" 
ON public.community_updates 
FOR SELECT 
USING (district_id = get_user_district() AND is_active = true);

CREATE POLICY "Admins can manage community updates" 
ON public.community_updates 
FOR ALL 
USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

-- RLS policies for recent_activities
CREATE POLICY "Users can view their own activities" 
ON public.recent_activities 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can log activities" 
ON public.recent_activities 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_community_activities_district ON public.community_activities (district_id, is_published, status);
CREATE INDEX idx_community_activities_date ON public.community_activities (date_time, status);
CREATE INDEX idx_dashboard_metrics_user ON public.dashboard_metrics (user_id, metric_type);
CREATE INDEX idx_community_updates_district ON public.community_updates (district_id, is_active, priority);
CREATE INDEX idx_recent_activities_user ON public.recent_activities (user_id, created_at DESC);

-- Create triggers for updated_at columns
CREATE TRIGGER update_community_activities_updated_at
    BEFORE UPDATE ON public.community_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_metrics_updated_at
    BEFORE UPDATE ON public.dashboard_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_updates_updated_at
    BEFORE UPDATE ON public.community_updates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();