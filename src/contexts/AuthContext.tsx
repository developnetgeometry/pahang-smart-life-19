import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  switchLanguage: (lang: Language) => Promise<void>;
  switchTheme: (newTheme: Theme) => void;
  hasRole: (role: UserRole) => boolean;
  updateProfile: (updates: Partial<User>) => void;
  loadProfileAndRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State initialization
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [language, setLanguage] = useState<Language>("ms");
  const [theme, setTheme] = useState<Theme>("light");
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);

  // Computed values
  const isAuthenticated = !!user;
  const isApproved = accountStatus === "approved";

  const hasRole = (role: UserRole) => roles.includes(role);

  // Load user profile and roles from database
  const loadProfileAndRoles = async (userId?: string) => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      // Get user profile - simplified query to avoid TypeScript issues
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        return;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("enhanced_user_roles")
        .select("role, is_active")
        .eq("user_id", targetUserId)
        .eq("is_active", true);

      if (rolesError) {
        console.error("Error loading roles:", rolesError);
        return;
      }

      const activeRoles = userRoles?.map((r) => r.role) || [];

      setUser({
        id: targetUserId,
        email: profile.email,
        full_name: profile.full_name,
        display_name: profile.full_name,
        language_preference: (profile.language as Language) || "ms",
        district_id: profile.district_id,
        community_id: profile.community_id,
        account_status: profile.account_status,
        active_community_id: profile.community_id,
        roles: activeRoles,
        available_roles: activeRoles,
        phone: profile.mobile_no,
        address: profile.address,
      });

      setRoles(activeRoles);
      setAccountStatus(profile.account_status);
      setLanguage((profile.language as Language) || "ms");
    } catch (error) {
      console.error("Error in loadProfileAndRoles:", error);
    }
  };

  // Login function with proper Supabase authentication
  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Starting login process for:", email);

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("🚫 Login error:", error);

        // Handle specific error types
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid login credentials");
        }

        throw error;
      }

      if (data.user) {
        console.log("✅ Login successful, loading profile...");
        await loadProfileAndRoles(data.user.id);

        // Check account status and throw appropriate errors
        const { data: profile } = await supabase
          .from("profiles")
          .select("account_status, is_active")
          .eq("user_id", data.user.id)
          .single();

        if (profile) {
          if (!profile.is_active) {
            throw new Error("ACCOUNT_INACTIVE");
          }
          if (profile.account_status === "pending") {
            throw new Error("ACCOUNT_PENDING");
          }
          if (profile.account_status === "rejected") {
            throw new Error("ACCOUNT_REJECTED");
          }
          if (profile.account_status === "suspended") {
            throw new Error("ACCOUNT_SUSPENDED");
          }
          if (profile.account_status !== "approved") {
            throw new Error("ACCOUNT_NOT_APPROVED");
          }
        }

        return { error: null };
      }

      throw new Error("Login failed");
    } catch (error: any) {
      console.error("🚫 Login failed:", error);
      return { error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRoles([]);
      setAccountStatus(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const switchLanguage = async (lang: Language) => {
    try {
      setLanguage(lang);

      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ language: lang })
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Error switching language:", error);
    }
  };

  const switchTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    console.log("🚀 Initializing auth state...");

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log("📋 Found existing session:", session.user.email);
        loadProfileAndRoles(session.user.id);
      } else {
        console.log("❌ No existing session found");
        setInitializing(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        await loadProfileAndRoles(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setRoles([]);
        setAccountStatus(null);
      }

      setInitializing(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
