import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnlineUser {
  id: string;
  display_name: string;
  status: "online" | "away" | "busy";
  last_seen: string;
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOnlineUsers = async () => {
    try {
      setIsLoading(true);

      // Get users who were active in the last 5 minutes
      const { data: presenceData, error: presenceError } = await supabase
        .from("user_presence")
        .select("user_id, status, last_seen, updated_at")
        .in("status", ["online", "away", "busy"])
        .gte("updated_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (presenceError) throw presenceError;

      if (!presenceData || presenceData.length === 0) {
        setOnlineUsers([]);
        return;
      }

      // Get profile information for these users
      const userIds = presenceData.map((p) => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Combine presence and profile data
      const transformedUsers: OnlineUser[] = presenceData.map((presence) => {
        const profile = profilesData?.find((p) => p.id === presence.user_id);
        return {
          id: presence.user_id,
          display_name:
            profile?.full_name || profile?.email || "Anonymous User",
          status: presence.status as "online" | "away" | "busy",
          last_seen:
            presence.last_seen ||
            presence.updated_at ||
            new Date().toISOString(),
        };
      });

      setOnlineUsers(transformedUsers);
    } catch (error) {
      console.error("Error fetching online users:", error);
      // Keep empty array on error
      setOnlineUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePresence = async (
    status: "online" | "away" | "busy" | "offline"
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc("update_user_presence", {
        p_user_id: user.id,
        p_status: status,
      });

      if (error) {
        console.error("Error updating presence:", error);
        return;
      }

      // Refresh the online users list
      if (status !== "offline") {
        await fetchOnlineUsers();
      }
    } catch (error) {
      console.error("Error updating presence:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Set user as online when component mounts
    updatePresence("online");

    // Fetch initial online users
    fetchOnlineUsers();

    // Set up real-time subscription for presence changes
    const channel = supabase
      .channel("user-presence")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
        },
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    // Update presence every 2 minutes to keep status fresh
    const presenceInterval = setInterval(() => {
      updatePresence("online");
    }, 2 * 60 * 1000);

    // Refresh online users every 30 seconds
    const refreshInterval = setInterval(fetchOnlineUsers, 30000);

    // Set user as offline when component unmounts
    return () => {
      updatePresence("offline");
      supabase.removeChannel(channel);
      clearInterval(presenceInterval);
      clearInterval(refreshInterval);
    };
  }, [user]);

  return {
    onlineUsers,
    isLoading,
    updatePresence,
  };
};
