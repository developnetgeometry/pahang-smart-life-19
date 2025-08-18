-- Add critical missing tables for comprehensive smart community system

-- 1. Access Cards for physical security
CREATE TABLE public.access_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  district_id UUID REFERENCES public.districts(id),
  card_type TEXT NOT NULL DEFAULT 'resident',
  is_active BOOLEAN NOT NULL DEFAULT true,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  access_zones TEXT[] DEFAULT ARRAY['common_areas'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Access Logs for entry tracking
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES public.access_cards(id),
  door_controller_id UUID,
  user_id UUID REFERENCES public.profiles(id),
  access_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_type TEXT NOT NULL CHECK (access_type IN ('entry', 'exit')),
  location TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  failure_reason TEXT,
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Door Controllers for smart locks
CREATE TABLE public.door_controllers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  controller_type TEXT NOT NULL DEFAULT 'card_reader',
  ip_address INET,
  mac_address TEXT,
  is_online BOOLEAN NOT NULL DEFAULT true,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  district_id UUID REFERENCES public.districts(id),
  access_zones TEXT[] DEFAULT ARRAY['common_areas'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Chat Rooms for real-time messaging
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT NOT NULL DEFAULT 'group' CHECK (room_type IN ('private', 'group', 'announcement', 'support')),
  is_private BOOLEAN NOT NULL DEFAULT false,
  district_id UUID REFERENCES public.districts(id),
  created_by UUID REFERENCES public.profiles(id),
  max_members INTEGER DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Chat Messages for message history
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url TEXT,
  reply_to_id UUID REFERENCES public.chat_messages(id),
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Invoices for detailed billing
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  district_id UUID REFERENCES public.districts(id),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
  payment_terms TEXT DEFAULT '30 days',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Payment Plans for installments
CREATE TABLE public.payment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  total_amount NUMERIC(10,2) NOT NULL,
  installments INTEGER NOT NULL DEFAULT 1,
  installment_amount NUMERIC(10,2) NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE NOT NULL,
  paid_installments INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'defaulted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Utility Readings for smart meters
CREATE TABLE public.utility_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meter_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  district_id UUID REFERENCES public.districts(id),
  utility_type TEXT NOT NULL CHECK (utility_type IN ('electricity', 'water', 'gas', 'internet')),
  reading_value NUMERIC(10,3) NOT NULL,
  reading_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unit TEXT NOT NULL DEFAULT 'kWh',
  cost_per_unit NUMERIC(8,4),
  total_cost NUMERIC(10,2),
  is_estimated BOOLEAN NOT NULL DEFAULT false,
  previous_reading NUMERIC(10,3),
  consumption NUMERIC(10,3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Audit Logs for system tracking
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  district_id UUID REFERENCES public.districts(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Community Groups for resident clubs
CREATE TABLE public.community_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL DEFAULT 'interest' CHECK (group_type IN ('interest', 'committee', 'sports', 'social', 'professional')),
  leader_id UUID REFERENCES public.profiles(id),
  district_id UUID REFERENCES public.districts(id),
  max_members INTEGER DEFAULT 50,
  meeting_schedule TEXT,
  contact_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.access_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.door_controllers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Access Cards
CREATE POLICY "Users can view their own access cards" ON public.access_cards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Management can manage access cards" ON public.access_cards
  FOR ALL USING (has_role('admin'::user_role) OR has_role('security'::user_role) OR has_role('manager'::user_role));

-- RLS Policies for Access Logs
CREATE POLICY "Users can view their own access logs" ON public.access_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Security can view all access logs" ON public.access_logs
  FOR ALL USING (has_role('admin'::user_role) OR has_role('security'::user_role) OR has_role('manager'::user_role));

-- RLS Policies for Door Controllers
CREATE POLICY "Residents can view door controllers in their district" ON public.door_controllers
  FOR SELECT USING (district_id = get_user_district());

CREATE POLICY "Security can manage door controllers" ON public.door_controllers
  FOR ALL USING (has_role('admin'::user_role) OR has_role('security'::user_role) OR has_role('manager'::user_role));

-- RLS Policies for Chat Rooms
CREATE POLICY "Users can view chat rooms in their district" ON public.chat_rooms
  FOR SELECT USING (district_id = get_user_district() OR NOT is_private);

CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Management can manage chat rooms" ON public.chat_rooms
  FOR ALL USING (has_role('admin'::user_role) OR has_role('manager'::user_role) OR created_by = auth.uid());

-- RLS Policies for Chat Messages
CREATE POLICY "Users can view messages in accessible rooms" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr 
      WHERE cr.id = chat_messages.room_id 
      AND (cr.district_id = get_user_district() OR NOT cr.is_private)
    )
  );

CREATE POLICY "Users can create messages" ON public.chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON public.chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- RLS Policies for Invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Management can manage invoices" ON public.invoices
  FOR ALL USING (has_role('admin'::user_role) OR has_role('manager'::user_role));

-- RLS Policies for Payment Plans
CREATE POLICY "Users can view their own payment plans" ON public.payment_plans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Management can manage payment plans" ON public.payment_plans
  FOR ALL USING (has_role('admin'::user_role) OR has_role('manager'::user_role));

-- RLS Policies for Utility Readings
CREATE POLICY "Users can view their own utility readings" ON public.utility_readings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Management can manage utility readings" ON public.utility_readings
  FOR ALL USING (has_role('admin'::user_role) OR has_role('manager'::user_role));

-- RLS Policies for Audit Logs
CREATE POLICY "Management can view audit logs" ON public.audit_logs
  FOR SELECT USING (has_role('admin'::user_role) OR has_role('manager'::user_role));

-- RLS Policies for Community Groups
CREATE POLICY "Users can view community groups in their district" ON public.community_groups
  FOR SELECT USING (district_id = get_user_district());

CREATE POLICY "Users can create community groups" ON public.community_groups
  FOR INSERT WITH CHECK (leader_id = auth.uid());

CREATE POLICY "Leaders and management can update groups" ON public.community_groups
  FOR UPDATE USING (leader_id = auth.uid() OR has_role('admin'::user_role) OR has_role('manager'::user_role));

-- Add updated_at triggers
CREATE TRIGGER update_access_cards_updated_at
  BEFORE UPDATE ON public.access_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_door_controllers_updated_at
  BEFORE UPDATE ON public.door_controllers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON public.payment_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();