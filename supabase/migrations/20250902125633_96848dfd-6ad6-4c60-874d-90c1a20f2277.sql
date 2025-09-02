-- Add is_pinned column to announcements table
ALTER TABLE announcements ADD COLUMN is_pinned boolean DEFAULT false;

-- Update existing announcements to set pinned status for urgent ones
UPDATE announcements SET is_pinned = true WHERE is_urgent = true;