-- Add rich content support to announcements table
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS reading_time_minutes integer DEFAULT 1;

-- Create announcement views tracking table
CREATE TABLE IF NOT EXISTS announcement_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  UNIQUE(announcement_id, user_id)
);

-- Create announcement reactions table (like/dislike, not emoji)
CREATE TABLE IF NOT EXISTS announcement_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'important')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(announcement_id, user_id, reaction_type)
);

-- Create announcement comments table
CREATE TABLE IF NOT EXISTS announcement_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  parent_comment_id uuid REFERENCES announcement_comments(id) ON DELETE CASCADE,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create announcement bookmarks table
CREATE TABLE IF NOT EXISTS announcement_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Create announcement read receipts table
CREATE TABLE IF NOT EXISTS announcement_read_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamp with time zone DEFAULT now(),
  read_percentage integer DEFAULT 100,
  UNIQUE(announcement_id, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_read_receipts ENABLE ROW LEVEL SECURITY;

-- Add indexes for better performance
CREATE INDEX idx_announcement_views_announcement_id ON announcement_views(announcement_id);
CREATE INDEX idx_announcement_views_user_id ON announcement_views(user_id);
CREATE INDEX idx_announcement_reactions_announcement_id ON announcement_reactions(announcement_id);
CREATE INDEX idx_announcement_comments_announcement_id ON announcement_comments(announcement_id);
CREATE INDEX idx_announcement_bookmarks_user_id ON announcement_bookmarks(user_id);
CREATE INDEX idx_announcement_read_receipts_announcement_id ON announcement_read_receipts(announcement_id);