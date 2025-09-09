-- Create function to recalculate community unit counts
CREATE OR REPLACE FUNCTION public.recalculate_community_unit_counts(community_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_count integer := 0;
    occupied_count integer := 0;
BEGIN
    -- Count total units in the community
    SELECT COUNT(*) INTO total_count
    FROM public.units u
    WHERE u.community_id = community_uuid;
    
    -- Count occupied units (units with owners)
    SELECT COUNT(*) INTO occupied_count
    FROM public.units u
    WHERE u.community_id = community_uuid
    AND u.owner_name IS NOT NULL 
    AND u.owner_name != '';
    
    -- Update the communities table
    UPDATE public.communities 
    SET 
        total_units = total_count,
        occupied_units = occupied_count,
        updated_at = now()
    WHERE id = community_uuid;
END;
$$;

-- Create trigger function for unit changes
CREATE OR REPLACE FUNCTION public.trigger_update_community_unit_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Handle DELETE operation
    IF TG_OP = 'DELETE' THEN
        IF OLD.community_id IS NOT NULL THEN
            PERFORM recalculate_community_unit_counts(OLD.community_id);
        END IF;
        RETURN OLD;
    END IF;
    
    -- Handle INSERT and UPDATE operations
    IF NEW.community_id IS NOT NULL THEN
        PERFORM recalculate_community_unit_counts(NEW.community_id);
    END IF;
    
    -- For UPDATE operations, also handle old community if it changed
    IF TG_OP = 'UPDATE' AND OLD.community_id IS DISTINCT FROM NEW.community_id THEN
        IF OLD.community_id IS NOT NULL THEN
            PERFORM recalculate_community_unit_counts(OLD.community_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create triggers on units table
DROP TRIGGER IF EXISTS trigger_units_update_community_counts ON public.units;
CREATE TRIGGER trigger_units_update_community_counts
    AFTER INSERT OR UPDATE OR DELETE ON public.units
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_community_unit_counts();

-- Backfill existing data for all communities
DO $$
DECLARE
    community_record RECORD;
BEGIN
    FOR community_record IN SELECT id FROM public.communities
    LOOP
        PERFORM recalculate_community_unit_counts(community_record.id);
    END LOOP;
END;
$$;