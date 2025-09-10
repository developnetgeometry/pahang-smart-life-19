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
        JSON.stringify({ error: 'Authentication required. Please log in again.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('enhanced_user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .eq('is_active', true)

    if (roleError) {
      throw new Error('Error checking user roles')
    }

    const hasAdminRole = userRoles?.some(r => 
      ['community_admin', 'district_coordinator', 'state_admin'].includes(r.role)
    )

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin role required.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    const { user_id, community_id, district_id } = await req.json()

    console.log('Assigning community admin:', {
      user_id,
      community_id,
      district_id
    })

    // Validate inputs
    if (!user_id || !community_id || !district_id) {
      throw new Error('Missing required fields: user_id, community_id, district_id')
    }

    // Check if user exists
    const { data: userProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', user_id)
      .single()

    if (profileCheckError || !userProfile) {
      throw new Error('User not found')
    }

    // Update user profile with community and district assignments
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({
        community_id: community_id,
        district_id: district_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError)
      throw new Error(`Failed to update user profile: ${profileUpdateError.message}`)
    }

    console.log('Profile updated successfully')

    // Assign community admin role (upsert to handle existing roles)
    const { error: roleAssignError } = await supabaseAdmin
      .from('enhanced_user_roles')
      .upsert({
        user_id: user_id,
        role: 'community_admin',
        is_active: true,
        assigned_by: currentUser.id,
        district_id: district_id,
        assigned_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,role',
        ignoreDuplicates: false
      })

    if (roleAssignError) {
      console.error('Role assignment error:', roleAssignError)
      throw new Error(`Failed to assign role: ${roleAssignError.message}`)
    }

    console.log('Role assigned successfully')

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userProfile.id,
          full_name: userProfile.full_name,
          email: userProfile.email,
          role: 'community_admin',
          community_id,
          district_id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})