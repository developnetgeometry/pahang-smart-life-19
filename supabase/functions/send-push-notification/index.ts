import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Get Firebase service account credentials
    const firebaseServiceAccount = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!firebaseServiceAccount) {
      throw new Error("Firebase service account not configured");
    }

    const serviceAccountData = JSON.parse(firebaseServiceAccount);

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

    // Get Firebase access token
    const accessToken = await getFirebaseAccessToken(serviceAccountData);

    // Send push notifications via FCM
    const sendResults = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          if (subscription.device_type === 'web') {
            // Send to web browser via FCM
            const message = {
              webpush: {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dh_key,
                  auth: subscription.auth_key,
                },
                payload: JSON.stringify({
                  title,
                  body,
                  icon: "/icon-192x192.png",
                  badge: "/badge-72x72.png",
                  url: url || "/",
                  data: {
                    url: url || "/",
                    notificationType,
                  },
                }),
              },
            };

            const response = await sendToFCM(message, accessToken, serviceAccountData.project_id);
            console.log(`Web push sent successfully to ${subscription.endpoint}`);
            return { success: true, subscriptionId: subscription.id };
          } else {
            // Send to native app (iOS/Android) via FCM
            const message = {
              token: subscription.native_token || subscription.endpoint,
              notification: {
                title,
                body,
              },
              data: {
                url: url || "/",
                notificationType,
              },
            };

            const response = await sendToFCM(message, accessToken, serviceAccountData.project_id);
            console.log(`Native push sent successfully to ${subscription.native_token || subscription.endpoint}`);
            return { success: true, subscriptionId: subscription.id };
          }
        } catch (error) {
          console.error(
            `Failed to send push to ${subscription.endpoint}:`,
            error
          );

          // Deactivate subscription if it's invalid
          if (error.message.includes('404') || error.message.includes('410')) {
            await supabaseClient
              .from("push_subscriptions")
              .update({ is_active: false })
              .eq("id", subscription.id);
          }

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
        message: body,
        notification_type: notificationType,
        url: url || "/",
        sent_at: new Date().toISOString(),
        recipient_id: userIds?.[0] || null, // Set recipient for single user notifications
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

// Get Firebase access token using service account
async function getFirebaseAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  // Create JWT payload
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // For demo purposes, we'll make a request to get the token
  // In production, you'd properly sign the JWT
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: await createServiceAccountJWT(payload, serviceAccount.private_key),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Create JWT for service account authentication
async function createServiceAccountJWT(payload: any, privateKey: string): Promise<string> {
  // Import the private key
  const key = await crypto.subtle.importKey(
    "pkcs8",
    new TextEncoder().encode(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const data = `${encodedHeader}.${encodedPayload}`;
  
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(data)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${encodedSignature}`;
}

// Send message to FCM
async function sendToFCM(message: any, accessToken: string, projectId: string): Promise<Response> {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FCM request failed: ${response.status} ${errorText}`);
  }

  return response;
}