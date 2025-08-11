-- 1) Ensure app_role enum has all required values
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'state_admin';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'district_coordinator';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'community_admin';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'security_officer';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'facility_manager';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'maintenance_staff';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'resident';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'service_provider';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'community_leader';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE 'state_service_manager';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Update default role assignment function to use 'resident'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'resident'::public.app_role);

  RETURN NEW;
END;
$function$;

-- 3) Rework RLS policies to new roles
-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "Admins and moderators can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Announcements are viewable by authenticated users" ON public.announcements;
CREATE POLICY "Managers can manage announcements"
ON public.announcements
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'district_coordinator'::public.app_role)
  OR public.has_role(auth.uid(), 'community_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_leader'::public.app_role)
  OR public.has_role(auth.uid(), 'state_service_manager'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'district_coordinator'::public.app_role)
  OR public.has_role(auth.uid(), 'community_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_leader'::public.app_role)
  OR public.has_role(auth.uid(), 'state_service_manager'::public.app_role)
);
CREATE POLICY "Announcements are viewable by authenticated users"
ON public.announcements
FOR SELECT
USING (true);

-- BOOKINGS
DROP POLICY IF EXISTS "Admins can view and manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Managers can manage bookings"
ON public.bookings
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'facility_manager'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'facility_manager'::public.app_role)
);
CREATE POLICY "Users can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- CCTV CAMERAS
DROP POLICY IF EXISTS "CCTV cameras are viewable by security staff" ON public.cctv_cameras;
DROP POLICY IF EXISTS "Only admins can manage CCTV cameras" ON public.cctv_cameras;
CREATE POLICY "CCTV manageable by security and state admin"
ON public.cctv_cameras
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'security_officer'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'security_officer'::public.app_role)
);
CREATE POLICY "CCTV viewable by security"
ON public.cctv_cameras
FOR SELECT
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'security_officer'::public.app_role)
);

-- COMPLAINT CATEGORIES
DROP POLICY IF EXISTS "Complaint categories are viewable by authenticated users" ON public.complaint_categories;
DROP POLICY IF EXISTS "Only admins can manage complaint categories" ON public.complaint_categories;
CREATE POLICY "Complaint categories are viewable by authenticated users"
ON public.complaint_categories
FOR SELECT
USING (true);
CREATE POLICY "Only state_admin can manage complaint categories"
ON public.complaint_categories
FOR ALL
USING (public.has_role(auth.uid(), 'state_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'state_admin'::public.app_role));

-- COMPLAINTS
DROP POLICY IF EXISTS "Staff can view and manage all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can update their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
CREATE POLICY "Staff can view and manage all complaints"
ON public.complaints
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'maintenance_staff'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'maintenance_staff'::public.app_role)
);
CREATE POLICY "Users can create complaints"
ON public.complaints
FOR INSERT
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own complaints"
ON public.complaints
FOR UPDATE
USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own complaints"
ON public.complaints
FOR SELECT
USING (auth.uid() = user_id);

-- DISCUSSION CATEGORIES
DROP POLICY IF EXISTS "Discussion categories are viewable by authenticated users" ON public.discussion_categories;
DROP POLICY IF EXISTS "Only admins can manage discussion categories" ON public.discussion_categories;
CREATE POLICY "Discussion categories are viewable by authenticated users"
ON public.discussion_categories
FOR SELECT
USING (true);
CREATE POLICY "State admin and community leader can manage discussion categories"
ON public.discussion_categories
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_leader'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_leader'::public.app_role)
);

-- DISCUSSION REPLIES
DROP POLICY IF EXISTS "Discussion replies are viewable by authenticated users" ON public.discussion_replies;
DROP POLICY IF EXISTS "Moderators can manage all replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Users can create replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Users can update their own replies" ON public.discussion_replies;
CREATE POLICY "Discussion replies are viewable by authenticated users"
ON public.discussion_replies
FOR SELECT
USING (true);
CREATE POLICY "Leaders can manage all replies"
ON public.discussion_replies
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_leader'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_leader'::public.app_role)
);
CREATE POLICY "Users can create replies"
ON public.discussion_replies
FOR INSERT
WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own replies"
ON public.discussion_replies
FOR UPDATE
USING (auth.uid() = author_id);

-- DISCUSSIONS
DROP POLICY IF EXISTS "Discussions are viewable by authenticated users" ON public.discussions;
DROP POLICY IF EXISTS "Moderators can manage all discussions" ON public.discussions;
DROP POLICY IF EXISTS "Users can create discussions" ON public.discussions;
DROP POLICY IF EXISTS "Users can update their own discussions" ON public.discussions;
CREATE POLICY "Discussions are viewable by authenticated users"
ON public.discussions
FOR SELECT
USING (true);
CREATE POLICY "Leaders can manage all discussions"
ON public.discussions
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_leader'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'community_leader'::public.app_role)
);
CREATE POLICY "Users can create discussions"
ON public.discussions
FOR INSERT
WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own discussions"
ON public.discussions
FOR UPDATE
USING (auth.uid() = author_id);

-- DISTRICTS
DROP POLICY IF EXISTS "Districts are viewable by everyone" ON public.districts;
DROP POLICY IF EXISTS "Only admins can manage districts" ON public.districts;
CREATE POLICY "Districts are viewable by everyone"
ON public.districts
FOR SELECT
USING (true);
CREATE POLICY "Only state_admin can manage districts"
ON public.districts
FOR ALL
USING (public.has_role(auth.uid(), 'state_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'state_admin'::public.app_role));

-- FACILITIES
DROP POLICY IF EXISTS "Facilities are viewable by authenticated users" ON public.facilities;
DROP POLICY IF EXISTS "Only admins can manage facilities" ON public.facilities;
CREATE POLICY "Facilities are viewable by authenticated users"
ON public.facilities
FOR SELECT
USING (true);
CREATE POLICY "State admin and facility manager can manage facilities"
ON public.facilities
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'facility_manager'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'facility_manager'::public.app_role)
);

-- MARKETPLACE CATEGORIES
DROP POLICY IF EXISTS "Marketplace categories are viewable by authenticated users" ON public.marketplace_categories;
DROP POLICY IF EXISTS "Only admins can manage marketplace categories" ON public.marketplace_categories;
CREATE POLICY "Marketplace categories are viewable by authenticated users"
ON public.marketplace_categories
FOR SELECT
USING (true);
CREATE POLICY "Only state_admin can manage marketplace categories"
ON public.marketplace_categories
FOR ALL
USING (public.has_role(auth.uid(), 'state_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'state_admin'::public.app_role));

-- MARKETPLACE ITEMS
DROP POLICY IF EXISTS "Marketplace items are viewable by authenticated users" ON public.marketplace_items;
DROP POLICY IF EXISTS "Users can create marketplace items" ON public.marketplace_items;
DROP POLICY IF EXISTS "Users can delete their own marketplace items" ON public.marketplace_items;
DROP POLICY IF EXISTS "Users can update their own marketplace items" ON public.marketplace_items;
CREATE POLICY "Marketplace items are viewable by authenticated users"
ON public.marketplace_items
FOR SELECT
USING (true);
CREATE POLICY "Users can create marketplace items"
ON public.marketplace_items
FOR INSERT
WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own marketplace items"
ON public.marketplace_items
FOR UPDATE
USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own marketplace items"
ON public.marketplace_items
FOR DELETE
USING (auth.uid() = seller_id);
CREATE POLICY "State admin can manage marketplace items"
ON public.marketplace_items
FOR ALL
USING (public.has_role(auth.uid(), 'state_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'state_admin'::public.app_role));

-- SENSORS
DROP POLICY IF EXISTS "Only admins can manage sensors" ON public.sensors;
DROP POLICY IF EXISTS "Sensors are viewable by authenticated users" ON public.sensors;
CREATE POLICY "Sensors are viewable by authenticated users"
ON public.sensors
FOR SELECT
USING (true);
CREATE POLICY "Only state_admin can manage sensors"
ON public.sensors
FOR ALL
USING (public.has_role(auth.uid(), 'state_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'state_admin'::public.app_role));

-- SENSOR READINGS (leave existing policies as-is)

-- USER ROLES
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "State admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'state_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'state_admin'::public.app_role));
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- VISITORS
DROP POLICY IF EXISTS "Security guards can view and manage all visitors" ON public.visitors;
DROP POLICY IF EXISTS "Users can create visitor registrations" ON public.visitors;
DROP POLICY IF EXISTS "Users can update their own visitor registrations" ON public.visitors;
DROP POLICY IF EXISTS "Users can view their own visitors" ON public.visitors;
CREATE POLICY "Security can view and manage all visitors"
ON public.visitors
FOR ALL
USING (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'security_officer'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'state_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'security_officer'::public.app_role)
);
CREATE POLICY "Users can create visitor registrations"
ON public.visitors
FOR INSERT
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own visitor registrations"
ON public.visitors
FOR UPDATE
USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own visitors"
ON public.visitors
FOR SELECT
USING (auth.uid() = user_id);

-- PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "State admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'state_admin'::public.app_role));
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
