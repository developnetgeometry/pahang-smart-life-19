-- Make district_id nullable in panic_alerts table since users might not have district assigned
ALTER TABLE public.panic_alerts ALTER COLUMN district_id DROP NOT NULL;