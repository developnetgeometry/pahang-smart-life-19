import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EnabledModule {
  module_name: string;
  display_name: string;
  category: string;
}

export function useModuleAccess() {
  const { user, hasRole } = useAuth();
  const [enabledModules, setEnabledModules] = useState<EnabledModule[]>([]);
  const [loading, setLoading] = useState(true);

  console.log(
    "useModuleAccess: user:",
    user?.id,
    "hasRole function available:",
    typeof hasRole
  );

  useEffect(() => {
    const fetchEnabledModules = async () => {
      if (!user) {
        console.log("No user logged in - setting empty modules");
        setEnabledModules([]);
        setLoading(false);
        return;
      }

      console.log(
        "Fetching modules for user:",
        user.id,
        "with roles:",
        hasRole
      );

      try {
        // Get user's community first
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("community_id")
          .eq("user_id", user.id)
          .single();

        console.log("Profile query result:", { profile, profileError });

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          setEnabledModules([]);
          setLoading(false);
          return;
        }

        if (!profile?.community_id) {
          console.log("User has no community assigned, profile data:", profile);
          setEnabledModules([]);
          setLoading(false);
          return;
        }

        console.log("User community_id:", profile.community_id);

        // Get community-controlled modules
        const { data: communityModules, error } = await supabase
          .from("community_features")
          .select("module_name")
          .eq("community_id", profile.community_id)
          .eq("is_enabled", true);

        console.log("Community modules query result:", {
          communityModules,
          error,
          community_id: profile.community_id,
        });

        if (error) {
          console.error("Error fetching community modules:", error);
        }

        // All modules are now controlled by community admin - no role-based bypasses
        const allModuleNames =
          communityModules?.map((m) => m.module_name) || [];

        // If no modules are enabled for the community, provide default modules for service providers
        if (
          allModuleNames.length === 0 &&
          hasRole &&
          hasRole("service_provider")
        ) {
          console.log(
            "No community modules found, adding default service provider modules"
          );
          allModuleNames.push("marketplace", "announcements");
        }

        console.log("Final module names:", allModuleNames);

        // Transform to match the expected interface
        const modules: EnabledModule[] = allModuleNames.map((moduleName) => {
          const moduleInfo = getModuleInfo(moduleName);
          return {
            module_name: moduleName,
            display_name: moduleInfo.display_name,
            category: moduleInfo.category,
          };
        });

        console.log("Enabled modules for user:", modules);
        setEnabledModules(modules);
      } catch (error) {
        console.error("Error fetching enabled modules:", error);
        setEnabledModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnabledModules();

    // Set up real-time subscription to community_features changes
    let channel: any = null;

    if (user) {
      channel = supabase
        .channel("community-features-changes")
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
            schema: "public",
            table: "community_features",
          },
          (payload) => {
            console.log("Community features changed:", payload);
            // Refetch modules when changes occur
            fetchEnabledModules();
          }
        )
        .subscribe();
    }

    // Cleanup subscription
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, hasRole]);

  const isModuleEnabled = (moduleName: string): boolean => {
    return enabledModules.some((module) => module.module_name === moduleName);
  };

  const getModulesByCategory = (category: string): EnabledModule[] => {
    return enabledModules.filter((module) => module.category === category);
  };

  return {
    enabledModules,
    loading,
    isModuleEnabled,
    getModulesByCategory,
  };
}

// Helper function to get module information
function getModuleInfo(moduleName: string) {
  const moduleMap: Record<string, { display_name: string; category: string }> =
    {
      // Community-controlled modules (managed by community admin)
      announcements: {
        display_name: "Announcements",
        category: "communication",
      },
      directory: {
        display_name: "Community Directory",
        category: "information",
      },
      complaints: {
        display_name: "Complaints Management",
        category: "services",
      },
      discussions: {
        display_name: "Community Discussions",
        category: "communication",
      },
      events: { display_name: "Events & Activities", category: "community" },
      marketplace: { display_name: "Marketplace", category: "community" },
      service_requests: {
        display_name: "Service Requests",
        category: "services",
      },

      // Role-based modules (NOT controlled by community admin)
      facilities: {
        display_name: "Facilities Management",
        category: "facilities",
      },
      bookings: { display_name: "Facility Bookings", category: "facilities" },
      maintenance: {
        display_name: "Maintenance Management",
        category: "facilities",
      },
      assets: { display_name: "Asset Management", category: "facilities" },
      cctv: { display_name: "CCTV Monitoring", category: "security" },
      visitor_management: {
        display_name: "Visitor Management",
        category: "security",
      },
      security: { display_name: "Security Management", category: "security" },
    };

  return (
    moduleMap[moduleName] || {
      display_name: moduleName,
      category: "other",
    }
  );
}
