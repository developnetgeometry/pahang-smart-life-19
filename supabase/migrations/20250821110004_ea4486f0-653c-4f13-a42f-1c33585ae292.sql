-- Update the role approval functions to match the exact hierarchy from the image

-- First, let's update the get_required_approver_role function
CREATE OR REPLACE FUNCTION public.get_required_approver_role(current_user_role user_role, requested_user_role user_role)
 RETURNS user_role
 LANGUAGE sql
 STABLE
AS $function$
  SELECT CASE 
    -- Resident role transitions
    WHEN current_user_role = 'resident' AND requested_user_role = 'community_leader' THEN 'community_admin'::user_role
    WHEN current_user_role = 'resident' AND requested_user_role = 'service_provider' THEN 'community_admin'::user_role
    WHEN current_user_role = 'resident' AND requested_user_role = 'facility_manager' THEN 'community_admin'::user_role
    WHEN current_user_role = 'resident' AND requested_user_role = 'security_officer' THEN 'district_coordinator'::user_role
    
    -- Community Admin to District Coordinator transition
    WHEN current_user_role = 'community_admin' AND requested_user_role = 'district_coordinator' THEN 'state_admin'::user_role
    
    -- District Coordinator to State Admin transition  
    WHEN current_user_role = 'district_coordinator' AND requested_user_role = 'state_admin' THEN 'state_admin'::user_role -- Will require Executive Committee approval
    
    -- Default fallback
    ELSE 'state_admin'::user_role
  END;
$function$;

-- Update the approval requirements function
CREATE OR REPLACE FUNCTION public.get_approval_requirements(current_user_role user_role, requested_user_role user_role)
 RETURNS approval_requirement[]
 LANGUAGE sql
 STABLE
AS $function$
  SELECT CASE 
    -- Resident role transitions with specific requirements
    WHEN current_user_role = 'resident' AND requested_user_role = 'community_leader' THEN ARRAY['community_voting'::approval_requirement]
    WHEN current_user_role = 'resident' AND requested_user_role = 'service_provider' THEN ARRAY['business_verification'::approval_requirement]
    WHEN current_user_role = 'resident' AND requested_user_role = 'facility_manager' THEN ARRAY['interview_process'::approval_requirement]
    WHEN current_user_role = 'resident' AND requested_user_role = 'security_officer' THEN ARRAY['background_check'::approval_requirement]
    
    -- Higher level transitions
    WHEN current_user_role = 'community_admin' AND requested_user_role = 'district_coordinator' THEN ARRAY['performance_evaluation'::approval_requirement]
    WHEN current_user_role = 'district_coordinator' AND requested_user_role = 'state_admin' THEN ARRAY['multi_level_approval'::approval_requirement]
    
    -- Default
    ELSE ARRAY[]::approval_requirement[]
  END;
$function$;

-- Create a function to get pending role requests for an approver
CREATE OR REPLACE FUNCTION public.get_pending_role_requests_for_approver(approver_user_id uuid)
 RETURNS TABLE(
   request_id uuid,
   requester_name text,
   requester_email text,
   user_current_role user_role,
   user_requested_role user_role,
   reason text,
   justification text,
   requirements approval_requirement[],
   created_at timestamp with time zone,
   district_name text
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT 
    rcr.id as request_id,
    p.full_name as requester_name,
    p.email as requester_email,
    rcr.current_user_role as user_current_role,
    rcr.requested_user_role as user_requested_role,
    rcr.reason,
    rcr.justification,
    rcr.approval_requirements as requirements,
    rcr.created_at,
    d.name as district_name
  FROM role_change_requests rcr
  JOIN profiles p ON p.id = rcr.requester_id
  LEFT JOIN districts d ON d.id = rcr.district_id
  WHERE rcr.status = 'pending'
    AND (
      -- Check if the current user has the required approver role for this request
      (rcr.required_approver_role = 'community_admin' AND has_enhanced_role('community_admin', approver_user_id)) OR
      (rcr.required_approver_role = 'district_coordinator' AND has_enhanced_role('district_coordinator', approver_user_id)) OR
      (rcr.required_approver_role = 'state_admin' AND has_enhanced_role('state_admin', approver_user_id))
    )
  ORDER BY rcr.created_at ASC;
$function$;