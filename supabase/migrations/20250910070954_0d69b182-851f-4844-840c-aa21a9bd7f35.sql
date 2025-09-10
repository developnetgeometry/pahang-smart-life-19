-- Add location and service area columns to service_provider_businesses table
ALTER TABLE service_provider_businesses 
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS coverage_radius_km INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_mobile BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "17:00", "closed": false}, "tuesday": {"open": "09:00", "close": "17:00", "closed": false}, "wednesday": {"open": "09:00", "close": "17:00", "closed": false}, "thursday": {"open": "09:00", "close": "17:00", "closed": false}, "friday": {"open": "09:00", "close": "17:00", "closed": false}, "saturday": {"open": "09:00", "close": "17:00", "closed": false}, "sunday": {"open": "09:00", "close": "17:00", "closed": true}}'::jsonb,
ADD COLUMN IF NOT EXISTS accepts_emergency BOOLEAN DEFAULT false, 
ADD COLUMN IF NOT EXISTS travel_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS address_formatted TEXT,
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP WITH TIME ZONE;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_service_provider_businesses_location 
ON service_provider_businesses(location_latitude, location_longitude) 
WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;

-- Create index for coverage radius queries
CREATE INDEX IF NOT EXISTS idx_service_provider_businesses_coverage 
ON service_provider_businesses(coverage_radius_km, is_mobile);

-- Add function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 decimal, lon1 decimal, 
  lat2 decimal, lon2 decimal
) RETURNS decimal AS $$
BEGIN
  -- Haversine formula to calculate distance in kilometers
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * 
      cos(radians(lat2)) * 
      cos(radians(lon2) - radians(lon1)) + 
      sin(radians(lat1)) * 
      sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;