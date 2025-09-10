-- Fix security issues by updating the function to have proper search path
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
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;