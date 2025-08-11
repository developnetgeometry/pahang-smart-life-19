-- 0) Helpers: updated_at trigger function already exists as public.update_updated_at_column

-- 1) Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- RLS: everyone can view, management restricted
DROP POLICY IF EXISTS "Communities viewable by authenticated" ON public.communities;
CREATE POLICY "Communities viewable by authenticated"
  ON public.communities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Communities manageable by state_admin" ON public.communities;
CREATE POLICY "Communities manageable by state_admin"
  ON public.communities FOR ALL
  USING (public.has_role(auth.uid(), 'state_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'state_admin'));

-- 2) Link facilities to communities
DO $$ BEGIN
  ALTER TABLE public.facilities ADD COLUMN community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 3) Scope assignment tables
CREATE TABLE IF NOT EXISTS public.user_district_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  district_id uuid NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, district_id, role)
);
ALTER TABLE public.user_district_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_community_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, community_id, role)
);
ALTER TABLE public.user_community_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_facility_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, facility_id, role)
);
ALTER TABLE public.user_facility_roles ENABLE ROW LEVEL SECURITY;

-- 4) Security definer helpers to avoid recursion in RLS
CREATE OR REPLACE FUNCTION public.user_has_district_role(_user_id uuid, _district_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_district_roles udr
    WHERE udr.user_id = _user_id AND udr.district_id = _district_id AND udr.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_community_role(_user_id uuid, _community_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_community_roles ucr
    WHERE ucr.user_id = _user_id AND ucr.community_id = _community_id AND ucr.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_facility_role(_user_id uuid, _facility_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_facility_roles ufr
    WHERE ufr.user_id = _user_id AND ufr.facility_id = _facility_id AND ufr.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_any_community_role_in_district(_user_id uuid, _district_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_community_roles ucr
    JOIN public.communities c ON c.id = ucr.community_id
    WHERE ucr.user_id = _user_id AND ucr.role = _role AND c.district_id = _district_id
  );
$$;

-- 5) RLS for assignment tables
-- District roles
DROP POLICY IF EXISTS "Users view own district roles" ON public.user_district_roles;
CREATE POLICY "Users view own district roles"
  ON public.user_district_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'state_admin'));

DROP POLICY IF EXISTS "State admin manage district roles" ON public.user_district_roles;
CREATE POLICY "State admin manage district roles"
  ON public.user_district_roles FOR ALL
  USING (public.has_role(auth.uid(), 'state_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'state_admin'));

DROP POLICY IF EXISTS "District coordinators manage their district roles" ON public.user_district_roles;
CREATE POLICY "District coordinators manage their district roles"
  ON public.user_district_roles FOR INSERT TO authenticated
  WITH CHECK (public.user_has_district_role(auth.uid(), district_id, 'district_coordinator'));

CREATE POLICY "District coordinators update their district roles"
  ON public.user_district_roles FOR UPDATE TO authenticated
  USING (public.user_has_district_role(auth.uid(), district_id, 'district_coordinator'));

CREATE POLICY "District coordinators delete their district roles"
  ON public.user_district_roles FOR DELETE TO authenticated
  USING (public.user_has_district_role(auth.uid(), district_id, 'district_coordinator'));

-- Community roles
DROP POLICY IF EXISTS "Users view own community roles" ON public.user_community_roles;
CREATE POLICY "Users view own community roles"
  ON public.user_community_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'state_admin'));

DROP POLICY IF EXISTS "State admin manage community roles" ON public.user_community_roles;
CREATE POLICY "State admin manage community roles"
  ON public.user_community_roles FOR ALL
  USING (public.has_role(auth.uid(), 'state_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'state_admin'));

DROP POLICY IF EXISTS "Community admins manage their community roles" ON public.user_community_roles;
CREATE POLICY "Community admins manage their community roles"
  ON public.user_community_roles FOR INSERT TO authenticated
  WITH CHECK (public.user_has_community_role(auth.uid(), community_id, 'community_admin') OR public.user_has_community_role(auth.uid(), community_id, 'community_leader'));

CREATE POLICY "Community admins update their community roles"
  ON public.user_community_roles FOR UPDATE TO authenticated
  USING (public.user_has_community_role(auth.uid(), community_id, 'community_admin') OR public.user_has_community_role(auth.uid(), community_id, 'community_leader'));

CREATE POLICY "Community admins delete their community roles"
  ON public.user_community_roles FOR DELETE TO authenticated
  USING (public.user_has_community_role(auth.uid(), community_id, 'community_admin') OR public.user_has_community_role(auth.uid(), community_id, 'community_leader'));

-- Facility roles
DROP POLICY IF EXISTS "Users view own facility roles" ON public.user_facility_roles;
CREATE POLICY "Users view own facility roles"
  ON public.user_facility_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'state_admin'));

DROP POLICY IF EXISTS "State admin manage facility roles" ON public.user_facility_roles;
CREATE POLICY "State admin manage facility roles"
  ON public.user_facility_roles FOR ALL
  USING (public.has_role(auth.uid(), 'state_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'state_admin'));

DROP POLICY IF EXISTS "Facility managers manage their facility roles" ON public.user_facility_roles;
CREATE POLICY "Facility managers manage their facility roles"
  ON public.user_facility_roles FOR INSERT TO authenticated
  WITH CHECK (public.user_has_facility_role(auth.uid(), facility_id, 'facility_manager'));

CREATE POLICY "Facility managers update their facility roles"
  ON public.user_facility_roles FOR UPDATE TO authenticated
  USING (public.user_has_facility_role(auth.uid(), facility_id, 'facility_manager'));

CREATE POLICY "Facility managers delete their facility roles"
  ON public.user_facility_roles FOR DELETE TO authenticated
  USING (public.user_has_facility_role(auth.uid(), facility_id, 'facility_manager'));

-- 6) Update RLS on key domain tables to be scope-aware

-- Facilities: allow facility_manager only for assigned facilities
DROP POLICY IF EXISTS "State admin and facility manager can manage facilities" ON public.facilities;
CREATE POLICY "State admin and assigned manager can manage facilities"
  ON public.facilities FOR ALL
  USING (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_facility_role(auth.uid(), id, 'facility_manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_facility_role(auth.uid(), id, 'facility_manager')
  );

-- Bookings: facility managers can manage bookings for their facilities; users can manage own as before
DROP POLICY IF EXISTS "Managers can manage bookings" ON public.bookings;
CREATE POLICY "State admin and assigned manager can manage bookings"
  ON public.bookings FOR ALL
  USING (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_facility_role(auth.uid(), facility_id, 'facility_manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_facility_role(auth.uid(), facility_id, 'facility_manager')
  );

-- Re-add self-service policies (if dropped earlier they still exist, but ensure they exist)
DO $$ BEGIN
  CREATE POLICY "Users can create bookings (self)" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update their own bookings (self)" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can view their own bookings (self)" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CCTV: security officers limited to assigned districts
DROP POLICY IF EXISTS "CCTV manageable by security and state admin" ON public.cctv_cameras;
CREATE POLICY "CCTV manageable by assigned security or state admin"
  ON public.cctv_cameras FOR ALL
  USING (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_district_role(auth.uid(), district_id, 'security_officer')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_district_role(auth.uid(), district_id, 'security_officer')
  );

DROP POLICY IF EXISTS "CCTV viewable by security" ON public.cctv_cameras;
CREATE POLICY "CCTV viewable by assigned security"
  ON public.cctv_cameras FOR SELECT
  USING (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_district_role(auth.uid(), district_id, 'security_officer')
  );

-- Announcements/discussions: leaders and admins limited by district; community admins/leaders via any community in district
DROP POLICY IF EXISTS "Managers can manage announcements" ON public.announcements;
CREATE POLICY "Announcements manageable by scoped roles"
  ON public.announcements FOR ALL
  USING (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_district_role(auth.uid(), district_id, 'district_coordinator')
    OR public.user_has_any_community_role_in_district(auth.uid(), district_id, 'community_admin')
    OR public.user_has_any_community_role_in_district(auth.uid(), district_id, 'community_leader')
    OR public.has_role(auth.uid(), 'state_service_manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_district_role(auth.uid(), district_id, 'district_coordinator')
    OR public.user_has_any_community_role_in_district(auth.uid(), district_id, 'community_admin')
    OR public.user_has_any_community_role_in_district(auth.uid(), district_id, 'community_leader')
    OR public.has_role(auth.uid(), 'state_service_manager')
  );

DROP POLICY IF EXISTS "Leaders can manage all discussions" ON public.discussions;
CREATE POLICY "Discussions manageable by scoped roles"
  ON public.discussions FOR ALL
  USING (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_district_role(auth.uid(), district_id, 'district_coordinator')
    OR public.user_has_any_community_role_in_district(auth.uid(), district_id, 'community_leader')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'state_admin')
    OR public.user_has_district_role(auth.uid(), district_id, 'district_coordinator')
    OR public.user_has_any_community_role_in_district(auth.uid(), district_id, 'community_leader')
  );

-- Keep existing self policies for discussions/replies
DO $$ BEGIN
  CREATE POLICY "Users can create discussions (self)" ON public.discussions FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update their own discussions (self)" ON public.discussions FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7) Triggers for updated_at
DO $$ BEGIN
  CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8) Canonical read policies already allow authenticated users to view most data
