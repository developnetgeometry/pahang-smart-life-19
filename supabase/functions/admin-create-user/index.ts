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

    // Get admin's community to check module enablement (relaxed for state_admin)
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from('profiles')
      .select('community_id')
      .eq('id', currentUser.id)
      .single()

    const isStateAdmin = userRoles?.some(r => r.role === 'state_admin')

    if (adminProfileError || (!adminProfile?.community_id && !isStateAdmin)) {
      if (!isStateAdmin) {
        throw new Error('Admin must be assigned to a community')
      }
    }

    // Check if required modules are enabled for role creation
    const checkModuleEnabled = async (moduleName: string) => {
      const { data, error } = await supabase
        .from('community_features')
        .select('is_enabled')
        .eq('community_id', adminProfile.community_id)
        .eq('module_name', moduleName)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error checking module:', error)
        return false
      }
      
      return data?.is_enabled || false
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

    // Validate role against enabled modules
    if (role === 'security_officer') {
      const securityEnabled = await checkModuleEnabled('security')
      if (!securityEnabled) {
        throw new Error('Security module is disabled. Cannot create Security Officer accounts.')
      }
    }

    if (role === 'facility_manager' || role === 'maintenance_staff') {
      const facilitiesEnabled = await checkModuleEnabled('facilities')
      if (!facilitiesEnabled) {
        throw new Error('Facilities module is disabled. Cannot create Facility Manager or Maintenance Staff accounts.')
      }
    }

    let authUser;
    let authError;
    
    // For residents, use invite flow instead of direct creation
    if (role === 'resident') {
      const frontendUrl = Deno.env.get('FRONTEND_URL') || req.headers.get('origin') || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/complete-account`;
      
      const inviteResult = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectUrl,
        data: {
          full_name
        }
      })
      
      authUser = inviteResult.data;
      authError = inviteResult.error;
      
      if (authError) {
        console.error('Auth invitation error:', authError)
        throw new Error(`Failed to invite user: ${authError.message}`)
      }
    } else {
      // For non-residents, use direct creation with password
      const createResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name
        }
      })
      
      authUser = createResult.data;
      authError = createResult.error;
      
      if (authError) {
        console.error('Auth creation error:', authError)
        throw new Error(`Failed to create user: ${authError.message}`)
      }
    }

    if (!authUser.user) {
      throw new Error('Failed to create user: No user returned')
    }

    console.log('Auth user created/invited:', authUser.user.id)

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

    // Set account status based on role and creation method
    if (role === 'resident') {
      profileData.account_status = 'pending_completion'
      if (unit_number) profileData.unit_number = unit_number
      if (family_size) profileData.family_size = parseInt(family_size)
      if (emergency_contact_name) profileData.emergency_contact_name = emergency_contact_name
      if (emergency_contact_phone) profileData.emergency_contact_phone = emergency_contact_phone
    } else {
      profileData.account_status = 'approved'
      if (role === 'security_officer') {
        if (security_license_number) profileData.security_license_number = security_license_number
        if (badge_id) profileData.badge_id = badge_id
        if (shift_type) profileData.shift_type = shift_type
      } else if (role === 'maintenance_staff' || role === 'facility_manager') {
        if (specialization) profileData.specialization = specialization
        if (certifications) profileData.certifications = Array.isArray(certifications) ? certifications : [certifications]
        if (years_experience) profileData.years_experience = parseInt(years_experience)
      }
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
        },
        invitation_sent: role === 'resident'
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