-- Add maintenance dates to existing assets for demonstration
UPDATE assets 
SET 
  next_maintenance_date = CASE 
    WHEN asset_type = 'HVAC' THEN CURRENT_DATE + INTERVAL '7 days'
    WHEN asset_type = 'Elevator' THEN CURRENT_DATE - INTERVAL '2 days' 
    WHEN asset_type = 'Pool Equipment' THEN CURRENT_DATE + INTERVAL '14 days'
    WHEN asset_type = 'Generator' THEN CURRENT_DATE + INTERVAL '30 days'
    WHEN asset_type = 'technology' THEN CURRENT_DATE + INTERVAL '21 days'
    WHEN asset_type = 'equipment' THEN CURRENT_DATE + INTERVAL '10 days'
    WHEN asset_type = 'vehicle' THEN CURRENT_DATE + INTERVAL '45 days'
    ELSE CURRENT_DATE + INTERVAL '30 days'
  END,
  maintenance_schedule = CASE 
    WHEN asset_type = 'HVAC' THEN 'Monthly filter change and system check'
    WHEN asset_type = 'Elevator' THEN 'Quarterly safety inspection and maintenance'
    WHEN asset_type = 'Pool Equipment' THEN 'Bi-weekly chemical balance and filter cleaning'
    WHEN asset_type = 'Generator' THEN 'Monthly load test and oil check'
    WHEN asset_type = 'technology' THEN 'Quarterly system update and camera cleaning'
    WHEN asset_type = 'equipment' THEN 'Monthly blade sharpening and oil change'
    WHEN asset_type = 'vehicle' THEN 'Quarterly service and safety inspection'
    ELSE 'As needed maintenance'
  END,
  last_maintenance_date = CASE 
    WHEN asset_type = 'HVAC' THEN CURRENT_DATE - INTERVAL '23 days'
    WHEN asset_type = 'Elevator' THEN CURRENT_DATE - INTERVAL '92 days'
    WHEN asset_type = 'Pool Equipment' THEN CURRENT_DATE - INTERVAL '12 days'
    WHEN asset_type = 'Generator' THEN CURRENT_DATE - INTERVAL '28 days'
    WHEN asset_type = 'technology' THEN CURRENT_DATE - INTERVAL '65 days'
    WHEN asset_type = 'equipment' THEN CURRENT_DATE - INTERVAL '20 days'
    WHEN asset_type = 'vehicle' THEN CURRENT_DATE - INTERVAL '35 days'
    ELSE NULL
  END
WHERE is_active = true;