-- Add new roles to the user_role enum
ALTER TYPE user_role ADD VALUE 'state_admin';
ALTER TYPE user_role ADD VALUE 'district_coordinator'; 
ALTER TYPE user_role ADD VALUE 'community_admin';
ALTER TYPE user_role ADD VALUE 'facility_manager';
ALTER TYPE user_role ADD VALUE 'maintenance_staff';
ALTER TYPE user_role ADD VALUE 'service_provider';
ALTER TYPE user_role ADD VALUE 'community_leader';
ALTER TYPE user_role ADD VALUE 'state_service_manager';