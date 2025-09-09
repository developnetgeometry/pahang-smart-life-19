-- Add total_units and occupied_units columns to communities table if they don't exist
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS total_units integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS occupied_units integer DEFAULT 0;

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
    JOIN public.floor_plans fp ON u.floor_plan_id = fp.id
    WHERE fp.community_id = community_uuid;
    
    -- Count occupied units (units with owners)
    SELECT COUNT(*) INTO occupied_count
    FROM public.units u
    JOIN public.floor_plans fp ON u.floor_plan_id = fp.id
    WHERE fp.community_id = community_uuid
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
DECLARE
    community_uuid uuid;
    old_community_uuid uuid;
BEGIN
    -- Get community ID from floor plan
    IF TG_OP = 'DELETE' THEN
        SELECT fp.community_id INTO old_community_uuid
        FROM public.floor_plans fp
        WHERE fp.id = OLD.floor_plan_id;
        
        IF old_community_uuid IS NOT NULL THEN
            PERFORM recalculate_community_unit_counts(old_community_uuid);
        END IF;
        
        RETURN OLD;
    END IF;
    
    -- For INSERT and UPDATE operations
    SELECT fp.community_id INTO community_uuid
    FROM public.floor_plans fp
    WHERE fp.id = NEW.floor_plan_id;
    
    IF community_uuid IS NOT NULL THEN
        PERFORM recalculate_community_unit_counts(community_uuid);
    END IF;
    
    -- If UPDATE changed floor_plan_id, also update old community
    IF TG_OP = 'UPDATE' AND OLD.floor_plan_id != NEW.floor_plan_id THEN
        SELECT fp.community_id INTO old_community_uuid
        FROM public.floor_plans fp
        WHERE fp.id = OLD.floor_plan_id;
        
        IF old_community_uuid IS NOT NULL AND old_community_uuid != community_uuid THEN
            PERFORM recalculate_community_unit_counts(old_community_uuid);
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

-- Also create trigger for floor_plans changes (in case community_id changes)
CREATE OR REPLACE FUNCTION public.trigger_update_community_counts_on_floor_plan_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Recalculate for new community
    IF NEW.community_id IS NOT NULL THEN
        PERFORM recalculate_community_unit_counts(NEW.community_id);
    END IF;
    
    -- If UPDATE changed community_id, also recalculate old community
    IF TG_OP = 'UPDATE' AND OLD.community_id IS DISTINCT FROM NEW.community_id THEN
        IF OLD.community_id IS NOT NULL THEN
            PERFORM recalculate_community_unit_counts(OLD.community_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_floor_plans_update_community_counts ON public.floor_plans;
CREATE TRIGGER trigger_floor_plans_update_community_counts
    AFTER UPDATE OF community_id ON public.floor_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_community_counts_on_floor_plan_change();

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