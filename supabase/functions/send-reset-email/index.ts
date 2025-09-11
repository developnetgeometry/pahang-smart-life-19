import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { PasswordResetEmail } from './_templates/password-reset.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetPasswordRequest {
  email: string
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email }: ResetPasswordRequest = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      // For security, don't reveal if email exists or not
      console.log(`Password reset requested for non-existent email: ${email}`)
      return new Response(JSON.stringify({ message: 'If an account exists, a reset email has been sent' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Generate a secure reset token (you can customize this)
    const resetToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Store the reset token securely (you'll need to create this table)
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (tokenError) {
      console.error('Error storing reset token:', tokenError)
      throw new Error('Failed to generate reset token')
    }

    // Create the reset URL with proper token handling
    const resetUrl = `https://www.primapahang.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // Render the React email template
    const emailHtml = await renderAsync(
      React.createElement(PasswordResetEmail, {
        email,
        reset_url: resetUrl,
      })
    )

    // Send the email
    const emailResult = await resend.emails.send({
      from: 'Prima Pahang <noreply@primapahang.com>',
      to: [email],
      subject: 'Tetapkan Semula Kata Laluan / Reset Your Password',
      html: emailHtml,
    })

    if (emailResult.error) {
      console.error('Email sending error:', emailResult.error)
      throw new Error('Failed to send reset email')
    }

    console.log('Password reset email sent successfully:', emailResult.data)

    return new Response(JSON.stringify({ 
      message: 'If an account exists, a reset email has been sent',
      success: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error: any) {
    console.error('Error in send-reset-email function:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process password reset request',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}

serve(handler)