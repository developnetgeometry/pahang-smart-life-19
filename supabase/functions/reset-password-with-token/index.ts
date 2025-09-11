import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetPasswordRequest {
  token: string
  email: string
  newPassword: string
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { token, email, newPassword }: ResetPasswordRequest = await req.json()

    if (!token || !email || !newPassword) {
      throw new Error('Token, email, and new password are required')
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the reset token
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      console.log(`Invalid or expired reset token for email: ${email}`)
      throw new Error('Invalid or expired reset token')
    }

    console.log(`Valid reset token found for email: ${email}`)

    // Get the user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      console.error('User not found:', userError)
      throw new Error('User not found')
    }

    // Update the user's password using the admin client
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error('Failed to update password')
    }

    // Mark the token as used
    const { error: markUsedError } = await supabase
      .from('password_reset_tokens')
      .update({ 
        used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', tokenData.id)

    if (markUsedError) {
      console.error('Error marking token as used:', markUsedError)
      // Don't throw here as the password was already updated successfully
    }

    console.log(`Password reset successful for user: ${email}`)

    return new Response(JSON.stringify({ 
      message: 'Password reset successful',
      success: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error: any) {
    console.error('Error in reset-password-with-token function:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Failed to reset password',
      message: error.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}

serve(handler)