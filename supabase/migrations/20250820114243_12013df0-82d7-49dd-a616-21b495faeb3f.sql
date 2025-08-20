-- Create push subscriptions table to store user notification endpoints
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh_key text NOT NULL,
  auth_key text NOT NULL,
  device_type text DEFAULT 'web',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Create notifications table to store notification history
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  icon text,
  url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  district_id uuid REFERENCES public.districts(id) ON DELETE CASCADE,
  notification_type text DEFAULT 'general',
  is_read boolean DEFAULT false,
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  announcements boolean DEFAULT true,
  bookings boolean DEFAULT true,
  complaints boolean DEFAULT true,
  events boolean DEFAULT true,
  maintenance boolean DEFAULT true,
  security boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for push_subscriptions
CREATE POLICY "Users can manage their own subscriptions" 
ON public.push_subscriptions 
FOR ALL 
USING (user_id = auth.uid());

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Management can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (has_role('admin'::user_role) OR has_role('manager'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));

CREATE POLICY "Users can update their notification read status" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

-- RLS policies for notification_preferences
CREATE POLICY "Users can manage their own preferences" 
ON public.notification_preferences 
FOR ALL 
USING (user_id = auth.uid());

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();