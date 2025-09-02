-- Fix the get_complaint_recipients function to properly handle role arrays
CREATE OR REPLACE FUNCTION public.get_complaint_recipients(p_category text, p_district_id uuid, p_escalation_level integer DEFAULT 0)
 RETURNS TABLE(user_id uuid, role enhanced_user_role, priority_order integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH role_mapping AS (
    SELECT UNNEST(CASE p_category
      WHEN 'maintenance' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['maintenance_staff'::enhanced_user_role, 'facility_manager'::enhanced_user_role]
          WHEN 1 THEN ARRAY['facility_manager'::enhanced_user_role, 'community_admin'::enhanced_user_role]
          ELSE ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
      WHEN 'security' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['security_officer'::enhanced_user_role, 'community_admin'::enhanced_user_role]
          WHEN 1 THEN ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role]
          ELSE ARRAY['district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
      WHEN 'facilities' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['facility_manager'::enhanced_user_role, 'community_admin'::enhanced_user_role]
          WHEN 1 THEN ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role]
          ELSE ARRAY['district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
      WHEN 'noise' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['community_admin'::enhanced_user_role]
          WHEN 1 THEN ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role]
          ELSE ARRAY['district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
      ELSE -- general and others
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['community_admin'::enhanced_user_role]
          WHEN 1 THEN ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role]
          ELSE ARRAY['district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
    END) AS target_role,
    generate_series(1, array_length(CASE p_category
      WHEN 'maintenance' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['maintenance_staff'::enhanced_user_role, 'facility_manager'::enhanced_user_role]
          WHEN 1 THEN ARRAY['facility_manager'::enhanced_user_role, 'community_admin'::enhanced_user_role]
          ELSE ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
      WHEN 'security' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['security_officer'::enhanced_user_role, 'community_admin'::enhanced_user_role]
          WHEN 1 THEN ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role]
          ELSE ARRAY['district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
      WHEN 'facilities' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['facility_manager'::enhanced_user_role, 'community_admin'::enhanced_user_role]
          WHEN 1 THEN ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role]
          ELSE ARRAY['district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
      WHEN 'noise' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['community_admin'::enhanced_user_role]
          WHEN 1 THEN ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role]
          ELSE ARRAY['district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
      ELSE -- general and others
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['community_admin'::enhanced_user_role]
          WHEN 1 THEN ARRAY['community_admin'::enhanced_user_role, 'district_coordinator'::enhanced_user_role]
          ELSE ARRAY['district_coordinator'::enhanced_user_role, 'state_admin'::enhanced_user_role]
        END
    END, 1)) AS priority_order
  )
  SELECT 
    eur.user_id,
    rm.target_role,
    rm.priority_order
  FROM role_mapping rm
  JOIN enhanced_user_roles eur ON eur.role = rm.target_role
  JOIN profiles p ON p.id = eur.user_id
  WHERE eur.is_active = true
    AND (p.district_id = p_district_id OR rm.target_role IN ('state_admin'))
  ORDER BY rm.priority_order, eur.created_at;
END;
$function$;