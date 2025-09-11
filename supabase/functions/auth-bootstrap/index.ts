import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthBootstrapData {
  profile: any;
  roles: any[];
  district?: any;
  community?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Invalid token')
    }

    // Single query to get all needed data using joins
    const { data: bootstrapData, error } = await supabase
      .from('profiles')
      .select(`
        *,
        districts(id, name),
        communities(id, name),
        enhanced_user_roles!inner(
          role_name,
          is_active,
          expires_at
        )
      `)
      .eq('user_id', user.id)
      .eq('enhanced_user_roles.is_active', true)
      .single()

    if (error) {
      throw error
    }

    const result: AuthBootstrapData = {
      profile: {
        id: bootstrapData.id,
        user_id: bootstrapData.user_id,
        display_name: bootstrapData.display_name,
        phone_number: bootstrapData.phone_number,
        unit_number: bootstrapData.unit_number,
        community_id: bootstrapData.community_id,
        district_id: bootstrapData.district_id,
        account_status: bootstrapData.account_status,
        language_preference: bootstrapData.language_preference,
        theme_preference: bootstrapData.theme_preference,
        created_at: bootstrapData.created_at,
        updated_at: bootstrapData.updated_at
      },
      roles: bootstrapData.enhanced_user_roles || [],
      district: bootstrapData.districts,
      community: bootstrapData.communities
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Auth bootstrap error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})