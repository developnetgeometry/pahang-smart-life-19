import * as React from "react";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// NOTE: This context integrates directly with Supabase Auth (supabase-js v2)
// It handles: session bootstrap, auth state changes, profile/roles loading,
// preferences (language/theme), and guards based on account_status.

export type UserRole =
  | "resident"
  | "community_leader"
  | "service_provider"
  | "maintenance_staff"
  | "facility_manager"
  | "security_officer"
  | "community_admin"
  | "district_coordinator"
  | "state_admin"
  | "state_service_manager"
  | "spouse"
  | "tenant"
  | "guest";

export type Language = "en" | "ms";
export type Theme = "light" | "dark";

export interface User {
  id: string;
  display_name?: string | null;
  email?: string | null;
  roles?: UserRole[];
  language_preference?: Language;
  full_name?: string | null;
  district_id?: string | null;
  community_id?: string | null;
  account_status?: string | null;
  active_community_id?: string | null;
  district?: any;
  community?: any;
  user_role?: string | null;
  available_roles?: UserRole[];
  phone?: string | null;
  address?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  initializing: boolean;
  isApproved: boolean;
  accountStatus: string | null;
  language: Language;
  theme: Theme;
  roles: UserRole[];
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  switchLanguage: (lang: Language) => Promise<void>;
  switchTheme: (newTheme: Theme) => void;
  hasRole: (role: UserRole) => boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loadProfileAndRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [language, setLanguage] = useState<Language>("ms");
  const [theme, setTheme] = useState<Theme>("light");
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const isApproved = accountStatus === "approved";

  const hasRole = useCallback((role: UserRole) => roles.includes(role), [roles]);

  const mapToUser = useCallback(
    async (sessionUser: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]>) => {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id,user_id,full_name,email,language_preference,theme_preference,account_status,district_id,community_id,phone,mobile_no,address,profile_completed_by_user"
        )
        .eq("user_id", sessionUser.id)
        .single();

      // Fetch roles (active only) from enhanced_user_roles
      const { data: roleRows, error: rolesError } = await supabase
        .from("enhanced_user_roles")
        .select("role")
        .eq("user_id", sessionUser.id)
        .eq("is_active", true);

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
      }
      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      const mappedRoles = (roleRows?.map((r) => r.role) || []) as UserRole[];

      // Optionally resolve readable community/district names
      let communityName: string | null = null;
      let districtName: string | null = null;
      if (profile?.community_id) {
        const { data: community } = await supabase
          .from("communities")
          .select("name")
          .eq("id", profile.community_id)
          .single();
        communityName = community?.name ?? null;
      }
      if (profile?.district_id) {
        const { data: district } = await supabase
          .from("districts")
          .select("name")
          .eq("id", profile.district_id)
          .single();
        districtName = district?.name ?? null;
      }

      const displayName =
        profile?.full_name ||
        (sessionUser.user_metadata as any)?.full_name ||
        sessionUser.email ||
        sessionUser.id;

      const mappedUser: User = {
        id: sessionUser.id,
        display_name: displayName,
        email: sessionUser.email,
        roles: mappedRoles,
        language_preference: (profile?.language_preference as Language) || undefined,
        full_name: profile?.full_name,
        district_id: profile?.district_id || null,
        community_id: profile?.community_id || null,
        account_status: profile?.account_status || null,
        active_community_id: null,
        district: districtName,
        community: communityName,
        user_role: null,
        available_roles: mappedRoles,
        phone: (profile as any)?.mobile_no || profile?.phone || null,
        address: profile?.address || null,
      };

      // Determine global prefs + account status
      const nextLanguage = (profile?.language_preference as Language) || "ms";
      const nextTheme = (profile?.theme_preference as Theme) || "light";

      // If approved but profile not completed, force pending_completion flow
      const isProfileComplete = profile?.profile_completed_by_user === true;
      const rawStatus = profile?.account_status || null;
      const nextAccountStatus = (() => {
        // Bypass completion requirement for state admins, community admins, and district coordinators
        if (
          rawStatus === "approved" &&
          !isProfileComplete &&
          (mappedRoles.includes("state_admin") ||
            mappedRoles.includes("community_admin") ||
            mappedRoles.includes("district_coordinator"))
        ) {
          return "approved";
        }
        if (rawStatus === "approved" && !isProfileComplete) {
          return "pending_completion";
        }
        return rawStatus;
      })();

      setUser(mappedUser);
      setRoles(mappedRoles);
      setLanguage(nextLanguage);
      setTheme(nextTheme);
      setAccountStatus(nextAccountStatus);
    },
    []
  );

  const loadProfileAndRoles = useCallback(async () => {
    try {
      const { data: userResp } = await supabase.auth.getUser();
      const sessionUser = userResp.user;
      if (!sessionUser) {
        // No session
        setUser(null);
        setRoles([]);
        setAccountStatus(null);
        return;
      }
      await mapToUser(sessionUser);
    } catch (e) {
      console.error("loadProfileAndRoles error:", e);
    }
  }, [mapToUser]);

  // Bootstrap session and subscribe to auth changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        if (session?.user) {
          await mapToUser(session.user);
        } else {
          setUser(null);
          setRoles([]);
          setAccountStatus(null);
        }
      } catch (e) {
        console.error("Auth bootstrap error:", e);
      } finally {
        if (mounted) setInitializing(false);
      }
    })();

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Keep this lean; map when SIGNED_IN or TOKEN_REFRESHED; reset on SIGNED_OUT
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          await mapToUser(session.user);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setRoles([]);
        setAccountStatus(null);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [mapToUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check profile status directly to avoid state race conditions
        const { data: userResp } = await supabase.auth.getUser();
        const sessionUser = userResp.user;
        if (!sessionUser) throw new Error("Authentication failed");

        const { data: profile } = await supabase
          .from("profiles")
          .select("account_status, profile_completed_by_user")
          .eq("user_id", sessionUser.id)
          .single();

        const raw = profile?.account_status || null;
        const status = raw === "approved" && profile?.profile_completed_by_user === false
          ? "pending_completion"
          : raw;

        if (status && status !== "approved" && status !== "pending_completion") {
          await supabase.auth.signOut();
          switch (status) {
            case "inactive":
              throw new Error("ACCOUNT_INACTIVE");
            case "pending":
            case "awaiting_approval":
              throw new Error("ACCOUNT_PENDING");
            case "rejected":
              throw new Error("ACCOUNT_REJECTED");
            case "suspended":
              throw new Error("ACCOUNT_SUSPENDED");
            default:
              throw new Error("ACCOUNT_NOT_APPROVED");
          }
        }

        // Load full profile + roles into context
        await mapToUser(sessionUser);
        return { error: null };
      } catch (e: any) {
        // Re-throw so callers (e.g., Login page) can handle specific messages
        throw e;
      }
    },
    [mapToUser]
  );

  // Ref to read latest accountStatus inside callbacks without re-deps loops
  const accountStatusRef = React.useRef<string | null>(null);
  useEffect(() => {
    accountStatusRef.current = accountStatus;
  }, [accountStatus]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setRoles([]);
      setAccountStatus(null);
    }
  }, []);

  const switchLanguage = useCallback(
    async (lang: Language) => {
      setLanguage(lang);
      try {
        const { data: userResp } = await supabase.auth.getUser();
        const sessionUser = userResp.user;
        if (!sessionUser) return;
        await supabase
          .from("profiles")
          .update({ language_preference: lang })
          .eq("user_id", sessionUser.id);
      } catch (e) {
        console.error("switchLanguage error:", e);
      }
    },
    []
  );

  const switchTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    (async () => {
      try {
        const { data: userResp } = await supabase.auth.getUser();
        const sessionUser = userResp.user;
        if (!sessionUser) return;
        await supabase
          .from("profiles")
          .update({ theme_preference: newTheme })
          .eq("user_id", sessionUser.id);
      } catch (e) {
        console.error("switchTheme error:", e);
      }
    })();
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      try {
        const { data: userResp } = await supabase.auth.getUser();
        const sessionUser = userResp.user;
        if (!sessionUser) return;

        // Map incoming generic fields to profiles table columns
        const profileUpdates: Record<string, any> = {};
        if (typeof updates.full_name !== "undefined") profileUpdates.full_name = updates.full_name;
        if (typeof updates.address !== "undefined") profileUpdates.address = updates.address;
        if (typeof updates.phone !== "undefined") profileUpdates.mobile_no = updates.phone;
        if (typeof updates.language_preference !== "undefined") profileUpdates.language_preference = updates.language_preference;
        if (typeof (updates as any).theme_preference !== "undefined") profileUpdates.theme_preference = (updates as any).theme_preference;
        if (typeof updates.community_id !== "undefined") profileUpdates.community_id = updates.community_id;
        if (typeof updates.district_id !== "undefined") profileUpdates.district_id = updates.district_id;
        if (typeof updates.account_status !== "undefined") profileUpdates.account_status = updates.account_status;

        if (Object.keys(profileUpdates).length === 0) return;

        await supabase
          .from("profiles")
          .update(profileUpdates)
          .eq("user_id", sessionUser.id);

        // Refresh local state
        await loadProfileAndRoles();
      } catch (e) {
        console.error("updateProfile error:", e);
      }
    },
    [loadProfileAndRoles]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated,
    initializing,
    isApproved,
    accountStatus,
    language,
    theme,
    roles,
    login,
    logout,
    switchLanguage,
    switchTheme,
    hasRole,
    updateProfile,
    loadProfileAndRoles,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
