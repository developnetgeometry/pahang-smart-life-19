-- Community Management Module Enhancements

-- 1. Profile Privacy Settings Table
CREATE TABLE IF NOT EXISTS profile_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  show_full_name BOOLEAN DEFAULT true,
  show_phone BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false,
  show_address BOOLEAN DEFAULT false,
  allow_messages BOOLEAN DEFAULT true,
  allow_event_invites BOOLEAN DEFAULT true,
  profile_visibility TEXT DEFAULT 'community' CHECK (profile_visibility IN ('public', 'community', 'friends', 'private')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Enhanced Events System - Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES community_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'cancelled', 'attended')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 3. Discussion Moderation System
-- Add moderation fields to discussions table
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT false;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'removed'));
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id);
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS moderation_reason TEXT;

-- Discussion Reports Table
CREATE TABLE IF NOT EXISTS discussion_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_reason TEXT NOT NULL CHECK (report_reason IN ('spam', 'inappropriate', 'harassment', 'misinformation', 'off_topic', 'other')),
  report_details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK ((discussion_id IS NOT NULL) OR (reply_id IS NOT NULL))
);

-- Discussion Moderation Actions Table
CREATE TABLE IF NOT EXISTS discussion_moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('approve', 'flag', 'remove', 'pin', 'unpin', 'lock', 'unlock', 'warn_author')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK ((discussion_id IS NOT NULL) OR (reply_id IS NOT NULL))
);

-- 4. Enhanced Profile Search with Privacy
-- Add search-friendly fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_searchable BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Enable RLS on new tables
ALTER TABLE profile_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_moderation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profile Privacy Settings
CREATE POLICY "Users can manage their own privacy settings" ON profile_privacy_settings
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for Event Registrations
CREATE POLICY "Users can manage their own event registrations" ON event_registrations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Event organizers can view registrations for their events" ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_activities ca 
      WHERE ca.id = event_registrations.event_id 
      AND ca.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all event registrations" ON event_registrations
  FOR ALL USING (
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
  );

-- RLS Policies for Discussion Reports
CREATE POLICY "Users can create reports" ON discussion_reports
  FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users can view their own reports" ON discussion_reports
  FOR SELECT USING (reported_by = auth.uid());

CREATE POLICY "Moderators can manage reports" ON discussion_reports
  FOR ALL USING (
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
  );

-- RLS Policies for Moderation Actions
CREATE POLICY "Moderators can create moderation actions" ON discussion_moderation_actions
  FOR INSERT WITH CHECK (
    moderator_id = auth.uid() AND (
      has_enhanced_role('community_admin') OR 
      has_enhanced_role('district_coordinator') OR 
      has_enhanced_role('state_admin')
    )
  );

CREATE POLICY "Moderators can view moderation actions" ON discussion_moderation_actions
  FOR SELECT USING (
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
  );

-- Functions for enhanced functionality
CREATE OR REPLACE FUNCTION get_user_profile_with_privacy(target_user_id UUID, viewer_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  profile_bio TEXT,
  interests TEXT[],
  skills TEXT[],
  avatar_url TEXT,
  can_message BOOLEAN,
  can_invite BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  privacy_settings RECORD;
  profile_data RECORD;
BEGIN
  -- Get profile data
  SELECT * INTO profile_data
  FROM profiles p
  WHERE p.id = target_user_id;
  
  -- Get privacy settings (defaults if none exist)
  SELECT 
    COALESCE(pps.show_full_name, true) as show_full_name,
    COALESCE(pps.show_phone, false) as show_phone,
    COALESCE(pps.show_email, false) as show_email,
    COALESCE(pps.allow_messages, true) as allow_messages,
    COALESCE(pps.allow_event_invites, true) as allow_event_invites,
    COALESCE(pps.profile_visibility, 'community') as profile_visibility
  INTO privacy_settings
  FROM profile_privacy_settings pps
  WHERE pps.user_id = target_user_id;
  
  -- Check if viewer can see this profile
  IF privacy_settings.profile_visibility = 'private' AND viewer_id != target_user_id THEN
    RETURN;
  END IF;
  
  -- Return filtered data based on privacy settings
  RETURN QUERY SELECT
    profile_data.id,
    CASE WHEN privacy_settings.show_full_name OR viewer_id = target_user_id 
         THEN profile_data.full_name 
         ELSE 'Private User' END,
    CASE WHEN privacy_settings.show_email OR viewer_id = target_user_id 
         THEN profile_data.email 
         ELSE NULL END,
    CASE WHEN privacy_settings.show_phone OR viewer_id = target_user_id 
         THEN profile_data.phone 
         ELSE NULL END,
    profile_data.profile_bio,
    profile_data.interests,
    profile_data.skills,
    profile_data.avatar_url,
    privacy_settings.allow_messages,
    privacy_settings.allow_event_invites;
END;
$$;

-- Trigger to update discussion report count
CREATE OR REPLACE FUNCTION update_discussion_report_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE discussions 
    SET 
      report_count = report_count + 1,
      is_reported = true
    WHERE id = NEW.discussion_id;
    
    -- Auto-flag if reports exceed threshold
    UPDATE discussions 
    SET moderation_status = 'flagged'
    WHERE id = NEW.discussion_id 
    AND report_count >= 3 
    AND moderation_status = 'approved';
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_discussion_report_count
  AFTER INSERT ON discussion_reports
  FOR EACH ROW EXECUTE FUNCTION update_discussion_report_count();