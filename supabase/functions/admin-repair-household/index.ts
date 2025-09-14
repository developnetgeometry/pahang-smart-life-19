import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

type Role = 'community_admin' | 'district_coordinator' | 'state_admin';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const admin = createClient(supabaseUrl, service);

    // AuthN + role check
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });

    const { data: roles, error: rolesErr } = await admin.from('enhanced_user_roles').select('role').eq('user_id', user.id).eq('is_active', true);
    if (rolesErr) return new Response(JSON.stringify({ error: 'Failed to fetch roles' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });

    const roleNames = (roles || []).map(r => r.role as Role);
    const isAdmin = roleNames.some(r => ['community_admin','district_coordinator','state_admin'].includes(r));
    if (!isAdmin) return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 });

    // Load profiles -> maps
    const { data: profiles, error: profErr } = await admin.from('profiles').select('id, user_id, unit_number');
    if (profErr) return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });

    const byAuth = new Map<string, string>(); // auth id -> profile id
    const byProfile = new Map<string, { id: string; unit_number: string | null }>();
    for (const p of profiles || []) {
      byAuth.set(p.user_id, p.id);
      byProfile.set(p.id, { id: p.id, unit_number: p.unit_number });
    }

    // Load household accounts
    const { data: haRows, error: haErr } = await admin.from('household_accounts').select('id, primary_account_id, linked_account_id, created_by, relationship_type');
    if (haErr) return new Response(JSON.stringify({ error: 'Failed to fetch household accounts' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });

    let updatedIds = 0, deletedDup = 0, unitUpdated = 0;

    // Helper to remap an id if it was stored as auth id
    const remap = (val: string | null) => (val && byProfile.has(val)) ? val : (val ? byAuth.get(val) ?? val : val);

    for (const row of haRows || []) {
      const newPrimary = remap(row.primary_account_id);
      const newLinked = remap(row.linked_account_id);
      const newCreated = remap(row.created_by);

      const changed = (newPrimary !== row.primary_account_id) || (newLinked !== row.linked_account_id) || (newCreated !== row.created_by);

      if (changed) {
        // Try update; if unique conflict occurs, delete the duplicate losing row
        const { error: upErr } = await admin
          .from('household_accounts')
          .update({ primary_account_id: newPrimary, linked_account_id: newLinked, created_by: newCreated })
          .eq('id', row.id);
        if (upErr) {
          // If conflict on unique, remove this row
          await admin.from('household_accounts').delete().eq('id', row.id);
          deletedDup++;
        } else {
          updatedIds++;
        }
      }

      // Backfill tenant unit from host
      if (row.relationship_type === 'tenant') {
        const host = byProfile.get(newPrimary!);
        const tenant = byProfile.get(newLinked!);
        if (host?.unit_number && tenant) {
          const { error: updUnitErr } = await admin
            .from('profiles')
            .update({ unit_number: host.unit_number })
            .eq('id', tenant.id)
            .is('unit_number', null);
          if (!updUnitErr) unitUpdated++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, updatedIds, deletedDup, unitUpdated }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});

