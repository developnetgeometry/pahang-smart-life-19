-- Create RLS policies for panic_alerts table
CREATE POLICY "Users can create their own panic alerts" 
ON public.panic_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own panic alerts" 
ON public.panic_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Security and admin can view all panic alerts" 
ON public.panic_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enhanced_user_roles eur 
    WHERE eur.user_id = auth.uid() 
    AND eur.role IN ('security_officer', 'community_admin', 'district_coordinator', 'state_admin')
    AND eur.is_active = true
  )
);

CREATE POLICY "Security and admin can update panic alerts" 
ON public.panic_alerts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM enhanced_user_roles eur 
    WHERE eur.user_id = auth.uid() 
    AND eur.role IN ('security_officer', 'community_admin', 'district_coordinator', 'state_admin')
    AND eur.is_active = true
  )
);