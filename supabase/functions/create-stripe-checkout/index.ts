import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Initialize Supabase client with anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get request body
    const body = await req.json();
    const { advertisementId, businessName, title, price = 2999 } = body; // Default price 29.99 RM in cents
    logStep("Request body parsed", { advertisementId, businessName, title, price });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if user already exists as a Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      logStep("No existing customer found, will create new one");
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "myr", // Malaysian Ringgit
            product_data: { 
              name: `${businessName} - ${title}`,
              description: `Purchase from ${businessName} via Community Marketplace`
            },
            unit_amount: price, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${origin}/marketplace?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/marketplace?payment=cancelled`,
      metadata: {
        advertisement_id: advertisementId,
        business_name: businessName,
        user_id: user.id,
      },
    });

    logStep("Stripe checkout session created", { sessionId: session.id, url: session.url });

    // Optional: Track the payment attempt in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update click count for the advertisement
    if (advertisementId) {
      const { data: currentAd } = await supabaseService
        .from("advertisements")
        .select('click_count')
        .eq('id', advertisementId)
        .single();
      
      if (currentAd) {
        await supabaseService
          .from("advertisements")
          .update({ click_count: (currentAd.click_count || 0) + 1 })
          .eq('id', advertisementId);
        logStep("Updated advertisement click count", { advertisementId, newCount: (currentAd.click_count || 0) + 1 });
      }
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-stripe-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});