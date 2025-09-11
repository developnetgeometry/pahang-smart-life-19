import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EnabledModule {
  module_name: string;
  display_name: string;
  category: string;
}

// Cache for module access data
const moduleCache = new Map<string, { data: EnabledModule[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useModuleAccessOptimized() {
  const { user, hasRole } = useAuth();
  const [enabledModules, setEnabledModules] = useState<EnabledModule[]>([]);
  const [loading, setLoading] = useState(true);

  const cacheKey = useMemo(() => user?.id || 'anonymous', [user?.id]);

  useEffect(() => {
    const fetchEnabledModules = async () => {
      if (!user) {
        setEnabledModules([]);
        setLoading(false);
        return;
      }

      // Check cache first
      const cached = moduleCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setEnabledModules(cached.data);
        setLoading(false);
        return;
      }

      try {
        // Get user profile first
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("community_id")
          .eq("user_id", user.id)
          .single();

        if (profileError || !profile?.community_id) {
          setEnabledModules([]);
          setLoading(false);
          return;
        }

        // Get community modules in a separate query
        const { data: communityModules, error } = await supabase
          .from("community_features")
          .select("module_name")
          .eq("community_id", profile.community_id)
          .eq("is_enabled", true);

        if (error) {
          throw error;
        }

        const moduleNames = communityModules?.map(cf => cf.module_name) || [];

        // Add default service provider modules if needed
        if (moduleNames.length === 0 && hasRole?.("service_provider")) {
          moduleNames.push("marketplace", "announcements");
        }

        // Transform to expected interface
        const modules: EnabledModule[] = moduleNames.map((moduleName: string) => {
          const moduleInfo = getModuleInfo(moduleName);
          return {
            module_name: moduleName,
            display_name: moduleInfo.display_name,
            category: moduleInfo.category,
          };
        });

        // Cache the result
        moduleCache.set(cacheKey, { data: modules, timestamp: Date.now() });
        setEnabledModules(modules);
      } catch (error) {
        console.error("Error fetching enabled modules:", error);
        setEnabledModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnabledModules();

    // Set up lightweight real-time subscription only when needed
    let channel: any = null;
    if (user?.communityId) {
      channel = supabase
        .channel(`community-features-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "community_features",
            filter: `community_id=eq.${user.communityId}`,
          },
          () => {
            // Clear cache and refetch
            moduleCache.delete(cacheKey);
            fetchEnabledModules();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, hasRole, cacheKey]);

  const isModuleEnabled = useMemo(
    () => (moduleName: string): boolean => {
      return enabledModules.some((module) => module.module_name === moduleName);
    },
    [enabledModules]
  );

  const getModulesByCategory = useMemo(
    () => (category: string): EnabledModule[] => {
      return enabledModules.filter((module) => module.category === category);
    },
    [enabledModules]
  );

  return {
    enabledModules,
    loading,
    isModuleEnabled,
    getModulesByCategory,
  };
}

// Helper function to get module information
function getModuleInfo(moduleName: string) {
  const moduleMap: Record<string, { display_name: string; category: string }> = {
    announcements: { display_name: "Announcements", category: "communication" },
    directory: { display_name: "Community Directory", category: "information" },
    complaints: { display_name: "Complaints Management", category: "services" },
    discussions: { display_name: "Community Discussions", category: "communication" },
    events: { display_name: "Events & Activities", category: "community" },
    marketplace: { display_name: "Marketplace", category: "community" },
    service_requests: { display_name: "Service Requests", category: "services" },
    facilities: { display_name: "Facilities Management", category: "facilities" },
    bookings: { display_name: "Facility Bookings", category: "facilities" },
    maintenance: { display_name: "Maintenance Management", category: "facilities" },
    assets: { display_name: "Asset Management", category: "facilities" },
    cctv: { display_name: "CCTV Monitoring", category: "security" },
    visitor_management: { display_name: "Visitor Management", category: "security" },
    security: { display_name: "Security Management", category: "security" },
  };

  return moduleMap[moduleName] || { display_name: moduleName, category: "other" };
}