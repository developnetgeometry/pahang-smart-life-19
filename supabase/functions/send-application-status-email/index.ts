import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  applicationId: string;
  applicantEmail: string;
  applicantName: string;
  businessName: string;
  status: string;
  reviewNotes?: string;
  rejectionReason?: string;
}

const getEmailContent = (status: string, businessName: string, reviewNotes?: string, rejectionReason?: string) => {
  switch (status) {
    case 'approved':
      return {
        subject: `🎉 Your Service Provider Application Has Been Approved!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">Congratulations! 🎉</h1>
              <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">Your application has been approved</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #1e293b; margin-top: 0;">Application Details</h2>
              <p><strong>Business Name:</strong> ${businessName}</p>
              <p><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Approved ✅</span></p>
            </div>

            ${reviewNotes ? `
              <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #0c4a6e; margin-top: 0;">Review Notes</h3>
                <p style="color: #1e293b; line-height: 1.6;">${reviewNotes}</p>
              </div>
            ` : ''}

            <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #065f46; margin-top: 0;">Next Steps</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>You can now start providing services to the community</li>
                <li>Access your service provider dashboard to manage your profile</li>
                <li>Set up your services and pricing</li>
                <li>Start receiving service requests from residents</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280;">Welcome to our community service provider network!</p>
            </div>
          </div>
        `
      };

    case 'rejected':
      return {
        subject: `Update on Your Service Provider Application`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">Application Update</h1>
              <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">We have reviewed your application</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #1e293b; margin-top: 0;">Application Details</h2>
              <p><strong>Business Name:</strong> ${businessName}</p>
              <p><strong>Status:</strong> <span style="color: #ef4444; font-weight: bold;">Not Approved ❌</span></p>
            </div>

            ${rejectionReason ? `
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #991b1b; margin-top: 0;">Reason for Decision</h3>
                <p style="color: #1e293b; line-height: 1.6;">${rejectionReason}</p>
              </div>
            ` : ''}

            <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #92400e; margin-top: 0;">What's Next?</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>Review the feedback provided above</li>
                <li>Address any concerns mentioned</li>
                <li>You may reapply in the future once requirements are met</li>
                <li>Contact us if you have any questions about this decision</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280;">Thank you for your interest in serving our community.</p>
            </div>
          </div>
        `
      };

    case 'additional_info_required':
      return {
        subject: `Additional Information Required for Your Service Provider Application`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">Additional Information Needed</h1>
              <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">We're reviewing your application</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #1e293b; margin-top: 0;">Application Details</h2>
              <p><strong>Business Name:</strong> ${businessName}</p>
              <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Additional Info Required ⏳</span></p>
            </div>

            ${reviewNotes ? `
              <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #92400e; margin-top: 0;">Information Required</h3>
                <p style="color: #1e293b; line-height: 1.6;">${reviewNotes}</p>
              </div>
            ` : ''}

            <div style="background: #f0f9ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1e40af; margin-top: 0;">Next Steps</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>Please provide the additional information requested above</li>
                <li>Submit any missing documents or details</li>
                <li>Our team will continue the review process once received</li>
                <li>Contact us if you need clarification on any requirements</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280;">We appreciate your patience during the review process.</p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: `Update on Your Service Provider Application`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Application Status Update</h1>
            <p>Your service provider application for <strong>${businessName}</strong> has been updated.</p>
            <p><strong>Current Status:</strong> ${status}</p>
            ${reviewNotes ? `<p><strong>Notes:</strong> ${reviewNotes}</p>` : ''}
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      applicationId, 
      applicantEmail, 
      applicantName, 
      businessName, 
      status, 
      reviewNotes, 
      rejectionReason 
    }: EmailRequest = await req.json();

    console.log(`Sending ${status} email to ${applicantEmail} for application ${applicationId}`);

    const { subject, html } = getEmailContent(status, businessName, reviewNotes, rejectionReason);

    const emailResponse = await resend.emails.send({
      from: "Community Management <onboarding@resend.dev>",
      to: [applicantEmail],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email sending in the database for tracking
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: logError } = await supabase
      .from('application_communications')
      .insert({
        application_id: applicationId,
        message: `Email notification sent: Application ${status}`,
        message_type: 'email_notification',
        is_internal: true,
        sender_id: null
      });

    if (logError) {
      console.error('Failed to log email in database:', logError);
      // Don't fail the entire operation just because logging failed
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-application-status-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);