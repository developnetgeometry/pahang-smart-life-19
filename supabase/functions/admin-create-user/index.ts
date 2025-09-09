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
      throw new Error('Authentication required')
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
      throw new Error('Insufficient permissions')
    }

    const {
      email,
      password,
      full_name,
      phone,
      role,
      district_id,
      community_id,
      // Role-specific fields
      family_size,
      emergency_contact_name,
      emergency_contact_phone,
      security_license_number,
      badge_id,
      shift_type,
      specialization,
      certifications,
      years_experience
    } = await req.json()

    console.log('Creating user with data:', {
      email,
      full_name,
      role,
      district_id,
      community_id
    })

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      throw new Error(`Failed to create user: ${authError.message}`)
    }

    if (!authUser.user) {
      throw new Error('Failed to create user: No user returned')
    }

    console.log('Auth user created:', authUser.user.id)

    // Create profile
    const profileData = {
      id: authUser.user.id,
      full_name,
      phone: phone || null,
      email,
      district_id: district_id || null,
      community_id: community_id || null,
      account_status: 'approved'
    }

    // Add role-specific fields
    if (role === 'resident') {
      if (family_size) profileData.family_size = parseInt(family_size)
      if (emergency_contact_name) profileData.emergency_contact_name = emergency_contact_name
      if (emergency_contact_phone) profileData.emergency_contact_phone = emergency_contact_phone
    } else if (role === 'security_officer') {
      if (security_license_number) profileData.security_license_number = security_license_number
      if (badge_id) profileData.badge_id = badge_id
      if (shift_type) profileData.shift_type = shift_type
    } else if (role === 'maintenance_staff') {
      if (specialization) profileData.specialization = specialization
      if (certifications) profileData.certifications = Array.isArray(certifications) ? certifications : [certifications]
      if (years_experience) profileData.years_experience = parseInt(years_experience)
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    console.log('Profile created successfully')

    // Assign role
    const { error: roleAssignError } = await supabaseAdmin
      .from('enhanced_user_roles')
      .insert({
        user_id: authUser.user.id,
        role: role,
        is_active: true,
        assigned_by: currentUser.id,
        district_id: district_id || null
      })

    if (roleAssignError) {
      console.error('Role assignment error:', roleAssignError)
      // Clean up user and profile if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      await supabaseAdmin.from('profiles').delete().eq('id', authUser.user.id)
      throw new Error(`Failed to assign role: ${roleAssignError.message}`)
    }

    console.log('Role assigned successfully')

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          full_name,
          role
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