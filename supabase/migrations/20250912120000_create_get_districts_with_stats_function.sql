CREATE OR REPLACE FUNCTION get_districts_with_stats()
RETURNS TABLE (
  id uuid,
  name text,
  code text,
  area numeric,
  area_km2 numeric,
  city text,
  country text,
  description text,
  latitude double precision,
  longitude double precision,
  population integer,
  coordinator_id uuid,
  coordinator_name text,
  established_date date,
  status text,
  district_type text,
  address text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  communities_count bigint,
  actual_population bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.code,
    d.area,
    d.area_km2,
    d.city,
    d.country,
    d.description,
    d.latitude,
    d.longitude,
    d.population,
    d.coordinator_id,
    d.coordinator_name,
    d.established_date,
    d.status,
    d.district_type,
    d.address,
    d.created_at,
    d.updated_at,
    (SELECT COUNT(*) FROM public.communities c WHERE c.district_id = d.id) AS communities_count,
    (SELECT COUNT(*) FROM public.profiles p WHERE p.district_id = d.id AND p.account_status = 'approved') AS actual_population
  FROM
    public.districts d
  ORDER BY
    d.name;
END;
$$;
