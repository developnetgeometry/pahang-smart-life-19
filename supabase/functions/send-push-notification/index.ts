import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// VAPID details
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = "mailto:admin@pahangsmartlife.com";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const {
      title,
      body,
      url,
      userIds,
      districtId,
      notificationType = "general",
    } = await req.json();

    if (!title || !body) {
      throw new Error("Title and body are required");
    }

    console.log("Sending push notification:", {
      title,
      body,
      url,
      userIds,
      districtId,
      notificationType,
    });

    // Get push subscriptions for target users
    let subscriptionsQuery = supabaseClient
      .from("push_subscriptions")
      .select("*")
      .eq("is_active", true);

    if (userIds && userIds.length > 0) {
      subscriptionsQuery = subscriptionsQuery.in("user_id", userIds);
    } else if (districtId) {
      // Get users from the district if no specific user IDs are provided
      const { data: districtUsers, error: districtError } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("district_id", districtId);

      if (districtError) {
        console.error("Error fetching district users:", districtError);
        throw new Error("Failed to fetch district users");
      }

      const districtUserIds = districtUsers.map((u) => u.id);
      subscriptionsQuery = subscriptionsQuery.in("user_id", districtUserIds);
    }

    const { data: subscriptions, error: subError } = await subscriptionsQuery;

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw new Error("Failed to fetch subscriptions");
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No active subscriptions found",
          sentCount: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send push notifications
    const sendResults = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushPayload = JSON.stringify({
            title,
            body,
            icon: "/icon-192x192.png",
            badge: "/badge-72x72.png",
            url: url || "/",
            timestamp: Date.now(),
            data: {
              url: url || "/",
              notificationType,
            },
          });

          // Create the push request
          const pushRequest = await createPushRequest(
            subscription.endpoint,
            subscription.p256dh_key,
            subscription.auth_key,
            pushPayload
          );

          const response = await fetch(subscription.endpoint, pushRequest);

          if (!response.ok) {
            console.error(
              `Push failed for ${subscription.endpoint}:`,
              response.status,
              response.statusText
            );

            // Deactivate subscription if it's invalid
            if (response.status === 404 || response.status === 410) {
              await supabaseClient
                .from("push_subscriptions")
                .update({ is_active: false })
                .eq("id", subscription.id);
            }

            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          console.log(`Push sent successfully to ${subscription.endpoint}`);
          return { success: true, subscriptionId: subscription.id };
        } catch (error) {
          console.error(
            `Failed to send push to ${subscription.endpoint}:`,
            error
          );
          return {
            success: false,
            subscriptionId: subscription.id,
            error: error.message,
          };
        }
      })
    );

    const successCount = sendResults.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    // Store notification in database for history
    const { error: notificationError } = await supabaseClient
      .from("notifications")
      .insert({
        title,
        body,
        url,
        district_id: districtId,
        notification_type: notificationType,
        sent_at: new Date().toISOString(),
      });

    if (notificationError) {
      console.error("Error storing notification:", notificationError);
    }

    return new Response(
      JSON.stringify({
        message: "Push notifications sent",
        sentCount: successCount,
        totalSubscriptions: subscriptions.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-push-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper function to create push request with VAPID
async function createPushRequest(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string
) {
  const vapidHeaders = await generateVAPIDHeaders(endpoint);

  // Encrypt the payload
  const encryptedPayload = await encryptPayload(payload, p256dh, auth);

  return {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400", // 24 hours
      ...vapidHeaders,
    },
    body: encryptedPayload,
  };
}

// Generate VAPID headers
async function generateVAPIDHeaders(endpoint: string) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error("VAPID keys not configured");
  }

  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  // Create JWT for VAPID
  const header = {
    typ: "JWT",
    alg: "ES256",
  };

  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    sub: VAPID_SUBJECT,
  };

  // For simplicity, we'll use a basic JWT implementation
  // In production, you might want to use a proper JWT library
  const jwt = await createJWT(header, payload, VAPID_PRIVATE_KEY);

  return {
    Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
    "Crypto-Key": `p256ecdsa=${VAPID_PUBLIC_KEY}`,
  };
}

// Basic JWT creation for VAPID (simplified version)
async function createJWT(header: any, payload: any, privateKey: string) {
  const encoder = new TextEncoder();

  const headerB64 = btoa(JSON.stringify(header))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const data = `${headerB64}.${payloadB64}`;

  // For demo purposes, return unsigned JWT
  // In production, you should properly sign this with the private key
  return `${data}.signature`;
}

// Simplified payload encryption (in production, use proper Web Push encryption)
async function encryptPayload(payload: string, p256dh: string, auth: string) {
  // For demo purposes, return the payload as-is
  // In production, implement proper AES128GCM encryption
  return new TextEncoder().encode(payload);
}
