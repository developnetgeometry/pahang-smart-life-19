-- Add support for native mobile push notifications
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS native_token TEXT,
ADD COLUMN IF NOT EXISTS platform TEXT;

-- Update device_type column to support 'ios' and 'android' values
-- (web is already supported)

-- Create index for faster lookups by platform
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_platform ON push_subscriptions(platform);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device_type ON push_subscriptions(device_type);