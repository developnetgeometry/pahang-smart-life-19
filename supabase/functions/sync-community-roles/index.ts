import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create regular client to check caller permissions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') ?? '',
          },
        },
      }
    )

    // Get current user and verify permissions
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
    if (userError || !currentUser) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Check if user has community admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('enhanced_user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .eq('is_active', true)

    if (roleError) {
      console.error('Role check error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Error checking user roles' }),
        { status: 500, headers: corsHeaders }
      )
    }

    const hasAdminRole = userRoles?.some(r => r.role === 'community_admin')
    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Only community admins can sync roles' }),
        { status: 403, headers: corsHeaders }
      )
    }

    const { community_id, module_name, is_enabled } = await req.json()

    console.log('Syncing community roles:', { community_id, module_name, is_enabled })

    if (!community_id || !module_name || typeof is_enabled !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: corsHeaders }
      )
    }

    let affectedRoles: string[] = []
    let deactivatedCount = 0

    // When disabling modules, deactivate associated staff roles
    if (!is_enabled) {
      if (module_name === 'security') {
        affectedRoles = ['security_officer']
      } else if (module_name === 'facilities') {
        affectedRoles = ['facility_manager', 'maintenance_staff']
      }

      if (affectedRoles.length > 0) {
        // Get all users in this community with the affected roles
        const { data: usersToDeactivate, error: fetchError } = await supabaseAdmin
          .from('enhanced_user_roles')
          .select(`
            id,
            user_id,
            role,
            profiles!inner(community_id)
          `)
          .in('role', affectedRoles)
          .eq('is_active', true)
          .eq('profiles.community_id', community_id)

        if (fetchError) {
          console.error('Error fetching users to deactivate:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Error fetching users to deactivate' }),
            { status: 500, headers: corsHeaders }
          )
        }

        console.log('Users to deactivate:', usersToDeactivate)

        if (usersToDeactivate && usersToDeactivate.length > 0) {
          // Deactivate the roles
          const { error: deactivateError } = await supabaseAdmin
            .from('enhanced_user_roles')
            .update({ 
              is_active: false,
              deactivated_at: new Date().toISOString(),
              deactivated_by: currentUser.id,
              deactivation_reason: `Module '${module_name}' disabled by community admin`
            })
            .in('id', usersToDeactivate.map(u => u.id))

          if (deactivateError) {
            console.error('Error deactivating roles:', deactivateError)
            return new Response(
              JSON.stringify({ error: 'Error deactivating user roles' }),
              { status: 500, headers: corsHeaders }
            )
          }

          deactivatedCount = usersToDeactivate.length
          console.log(`Successfully deactivated ${deactivatedCount} user roles`)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        deactivatedCount,
        affectedRoles,
        message: is_enabled 
          ? `Module '${module_name}' enabled successfully`
          : `Module '${module_name}' disabled successfully. ${deactivatedCount} staff accounts deactivated.`
      }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})