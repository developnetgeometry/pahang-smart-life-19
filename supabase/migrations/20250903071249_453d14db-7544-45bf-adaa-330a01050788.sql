-- FINAL comprehensive fix - update ALL possible tables with district_id references

-- Core tables that definitely have references
UPDATE marketplace_listings SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE maintenance_requests SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE community_groups SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE role_change_history SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- All other possible tables (comprehensive list from schema)
UPDATE access_cards SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE access_logs SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE advertisements SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE announcements SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE assets SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE audit_logs SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE cctv_cameras SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE chat_rooms SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE communities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE community_activities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE complaints SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE deliveries SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE directory_contacts SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE discussions SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE documents SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE door_controllers SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE emergency_contacts SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE enhanced_audit_logs SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE enhanced_user_roles SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE events SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE facilities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE facility_work_orders SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE feedback SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE financial_accounts SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE financial_records SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE financial_transactions SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE floor_plans SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE incident_reports SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE inventory SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE inventory_categories SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE inventory_items SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE invoices SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE marketplace_analytics SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE marketplace_items SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE meeting_minutes SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE notifications SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE panic_alerts SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE parking_slots SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE payments SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE performance_metrics SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE polls SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE profiles SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE quality_inspections SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE recent_activities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE role_audit_logs SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE role_change_requests SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE security_alerts SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE security_patrols SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE sensors SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE service_appointments SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE service_categories SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE service_provider_applications SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE service_provider_profiles SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE service_providers SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE service_requests SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE shipping_methods SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE staff SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE system_metrics SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE units SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE user_roles SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE utility_readings SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE visitor_blacklist SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE visitor_entries SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE work_orders SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE dashboard_metrics SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE community_updates SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Finally delete the duplicate district
DELETE FROM districts 
WHERE id = '00000000-0000-0000-0000-000000000001' 
  AND name = 'Pahang Prima North';