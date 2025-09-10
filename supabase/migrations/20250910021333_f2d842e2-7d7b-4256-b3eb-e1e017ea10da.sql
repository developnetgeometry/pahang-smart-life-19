-- Add RLS policies for districts table
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view districts 
CREATE POLICY "Allow users to view districts" 
ON public.districts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow state admins to manage all districts
CREATE POLICY "State admins can manage all districts" 
ON public.districts 
FOR ALL 
USING (has_enhanced_role('state_admin'::enhanced_user_role))
WITH CHECK (has_enhanced_role('state_admin'::enhanced_user_role));

-- Allow district coordinators to update their own district
CREATE POLICY "District coordinators can update their district" 
ON public.districts 
FOR UPDATE 
USING (has_enhanced_role('district_coordinator'::enhanced_user_role) AND id = get_user_district())
WITH CHECK (has_enhanced_role('district_coordinator'::enhanced_user_role) AND id = get_user_district());

-- Create function to update communities_count when communities change
CREATE OR REPLACE FUNCTION update_district_communities_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the district's communities_count
    IF TG_OP = 'INSERT' THEN
        UPDATE districts 
        SET communities_count = (
            SELECT COUNT(*) 
            FROM communities 
            WHERE district_id = NEW.district_id
        )
        WHERE id = NEW.district_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE districts 
        SET communities_count = (
            SELECT COUNT(*) 
            FROM communities 
            WHERE district_id = OLD.district_id
        )
        WHERE id = OLD.district_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND OLD.district_id != NEW.district_id THEN
        -- Update both old and new districts
        UPDATE districts 
        SET communities_count = (
            SELECT COUNT(*) 
            FROM communities 
            WHERE district_id = OLD.district_id
        )
        WHERE id = OLD.district_id;
        
        UPDATE districts 
        SET communities_count = (
            SELECT COUNT(*) 
            FROM communities 
            WHERE district_id = NEW.district_id
        )
        WHERE id = NEW.district_id;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for communities_count updates
CREATE TRIGGER trigger_update_district_communities_count
    AFTER INSERT OR DELETE OR UPDATE OF district_id
    ON public.communities
    FOR EACH ROW
    EXECUTE FUNCTION update_district_communities_count();

-- Initialize communities_count for existing districts
UPDATE districts 
SET communities_count = (
    SELECT COUNT(*) 
    FROM communities 
    WHERE communities.district_id = districts.id
);