-- Create user_services table for residents to offer services
CREATE TABLE public.user_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price_range TEXT,
  availability TEXT,
  contact_method TEXT NOT NULL DEFAULT 'phone',
  phone_number TEXT,
  email TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view services in their district" 
ON public.user_services 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p1, profiles p2 
    WHERE p1.id = auth.uid() 
    AND p2.id = user_services.user_id 
    AND p1.district_id = p2.district_id
  )
);

CREATE POLICY "Users can manage their own services" 
ON public.user_services 
FOR ALL 
USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_user_services_updated_at
BEFORE UPDATE ON public.user_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();