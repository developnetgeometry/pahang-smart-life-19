-- Community Management Module Enhancements (Fixed)

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
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'is_reported') THEN
    ALTER TABLE discussions ADD COLUMN is_reported BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'report_count') THEN
    ALTER TABLE discussions ADD COLUMN report_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'moderation_status') THEN
    ALTER TABLE discussions ADD COLUMN moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'removed'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'moderated_by') THEN
    ALTER TABLE discussions ADD COLUMN moderated_by UUID REFERENCES profiles(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'moderated_at') THEN
    ALTER TABLE discussions ADD COLUMN moderated_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'moderation_reason') THEN
    ALTER TABLE discussions ADD COLUMN moderation_reason TEXT;
  END IF;
END $$;

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
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_searchable') THEN
    ALTER TABLE profiles ADD COLUMN is_searchable BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_bio') THEN
    ALTER TABLE profiles ADD COLUMN profile_bio TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
    ALTER TABLE profiles ADD COLUMN interests TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
    ALTER TABLE profiles ADD COLUMN skills TEXT[];
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE profile_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_moderation_actions ENABLE ROW LEVEL SECURITY;