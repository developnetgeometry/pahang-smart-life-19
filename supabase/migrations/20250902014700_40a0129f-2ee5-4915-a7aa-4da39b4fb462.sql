-- Create polls table for announcement polls
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  allow_multiple_choices BOOLEAN NOT NULL DEFAULT false,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  district_id UUID,
  community_id UUID,
  scope TEXT NOT NULL DEFAULT 'district' CHECK (scope IN ('state', 'district', 'community'))
);

-- Create poll options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id, option_id)
);

-- Enable RLS on all poll tables
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for polls
CREATE POLICY "Users can view polls by scope" ON public.polls
FOR SELECT USING (
  (is_active = true) AND
  (expires_at IS NULL OR expires_at > now()) AND
  (
    (scope = 'state') OR
    (scope = 'district' AND district_id = get_user_district()) OR
    (scope = 'community' AND community_id = get_user_community())
  )
);

CREATE POLICY "Management can create polls" ON public.polls
FOR INSERT WITH CHECK (
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

CREATE POLICY "Authors can update their polls" ON public.polls
FOR UPDATE USING (
  created_by = auth.uid() OR 
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- RLS policies for poll options
CREATE POLICY "Users can view poll options" ON public.poll_options
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.polls p 
    WHERE p.id = poll_options.poll_id 
    AND p.is_active = true
    AND (p.expires_at IS NULL OR p.expires_at > now())
    AND (
      (p.scope = 'state') OR
      (p.scope = 'district' AND p.district_id = get_user_district()) OR
      (p.scope = 'community' AND p.community_id = get_user_community())
    )
  )
);

CREATE POLICY "Poll creators can insert options" ON public.poll_options
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.polls p 
    WHERE p.id = poll_options.poll_id 
    AND (
      p.created_by = auth.uid() OR
      has_enhanced_role('community_admin'::enhanced_user_role) OR 
      has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
      has_enhanced_role('state_admin'::enhanced_user_role)
    )
  )
);

-- RLS policies for poll votes
CREATE POLICY "Users can view poll results" ON public.poll_votes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.polls p 
    WHERE p.id = poll_votes.poll_id 
    AND p.is_active = true
    AND (
      (p.scope = 'state') OR
      (p.scope = 'district' AND p.district_id = get_user_district()) OR
      (p.scope = 'community' AND p.community_id = get_user_community())
    )
  )
);

CREATE POLICY "Users can vote on polls" ON public.poll_votes
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.polls p 
    WHERE p.id = poll_votes.poll_id 
    AND p.is_active = true
    AND (p.expires_at IS NULL OR p.expires_at > now())
    AND (
      (p.scope = 'state') OR
      (p.scope = 'district' AND p.district_id = get_user_district()) OR
      (p.scope = 'community' AND p.community_id = get_user_community())
    )
  )
);

CREATE POLICY "Users can update their own votes" ON public.poll_votes
FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_polls_scope ON public.polls(scope);
CREATE INDEX idx_polls_district_id ON public.polls(district_id);
CREATE INDEX idx_polls_community_id ON public.polls(community_id);
CREATE INDEX idx_polls_expires_at ON public.polls(expires_at);
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user_id ON public.poll_votes(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON public.polls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get poll results
CREATE OR REPLACE FUNCTION public.get_poll_results(poll_id uuid)
RETURNS TABLE(
  option_id uuid,
  option_text text,
  vote_count bigint,
  percentage numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH poll_stats AS (
    SELECT 
      po.id as option_id,
      po.option_text,
      COUNT(pv.id) as vote_count,
      (SELECT COUNT(*) FROM poll_votes WHERE poll_votes.poll_id = $1) as total_votes
    FROM poll_options po
    LEFT JOIN poll_votes pv ON po.id = pv.option_id
    WHERE po.poll_id = $1
    GROUP BY po.id, po.option_text, po.option_order
    ORDER BY po.option_order
  )
  SELECT 
    ps.option_id,
    ps.option_text,
    ps.vote_count,
    CASE 
      WHEN ps.total_votes = 0 THEN 0
      ELSE ROUND((ps.vote_count::numeric / ps.total_votes::numeric) * 100, 1)
    END as percentage
  FROM poll_stats ps;
$$;