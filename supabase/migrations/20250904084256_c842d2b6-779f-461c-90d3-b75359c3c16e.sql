
-- Phase 1: Safely archive unused tables by moving them out of the public schema.
-- This keeps data recoverable while removing them from active use.
-- If after verification you want them permanently removed, we can DROP from archive later.

begin;

-- Create archive schema if it doesn't exist
create schema if not exists archive;

comment on schema archive is 'Holding area for deprecated/archived tables. Used to safely remove unused tables without immediate data loss.';

-- 1) emergency_alerts
-- Drop related triggers, then move the table
drop trigger if exists notify_emergency_alerts_trigger on public.emergency_alerts;
alter table if exists public.emergency_alerts set schema archive;
comment on table archive.emergency_alerts is 'Archived from public on cleanup - not used by application.';

-- 2) emergency_contacts
drop trigger if exists update_emergency_contacts_updated_at on public.emergency_contacts;
alter table if exists public.emergency_contacts set schema archive;
comment on table archive.emergency_contacts is 'Archived from public on cleanup - not used by application.';

-- 3) incident_reports
drop trigger if exists update_incident_reports_updated_at on public.incident_reports;
alter table if exists public.incident_reports set schema archive;
comment on table archive.incident_reports is 'Archived from public on cleanup - not used by application.';

-- 4) module_activities
-- No known external triggers from current review
alter table if exists public.module_activities set schema archive;
comment on table archive.module_activities is 'Archived from public on cleanup - not used by application.';

commit;
