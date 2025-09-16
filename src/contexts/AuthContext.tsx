import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";

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

// ViewRole removed - using role-based navigation instead
export type Language = "en" | "ms";
export type Theme = "light" | "dark";

export interface User {
  id: string;
  display_name: string;
  email: string;
  full_name?: string;
  associated_community_ids: string[];
  active_community_id: string;
  district: string;
  community: string;
  district_id?: string;
  community_id?: string;
  account_status?: string;
  user_role: UserRole; // primary role for display
  available_roles: UserRole[];
  // current_view_role removed - using role-based navigation
  phone: string;
  address: string;
  language_preference: Language;
  theme_preference: Theme;
  unit_type?: string;
  ownership_status?: string;
  vehicle_registration_numbers: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  initializing: boolean;
  accountStatus: string | null;
  isApproved: boolean;
  language: Language;
  theme: Theme;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchLanguage: (lang: Language) => void;
  switchTheme: (theme: Theme) => void;
  updateProfile: (updates: Partial<User>) => void;
  loadProfileAndRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language_preference");
    // Validate language preference - only allow "en" or "ms"
    if (saved === "en" || saved === "ms") {
      return saved;
    }
    // If invalid or null, default to "ms" and clean up localStorage
    if (saved && saved !== "en" && saved !== "ms") {
      localStorage.setItem("language_preference", "ms");
    }
    return "ms";
  });
  const [theme, setTheme] = useState<Theme>("light");
  const [roles, setRoles] = useState<UserRole[]>([]);

  // Move isProcessing outside useEffect to persist across renders
  const isProcessingRef = useRef(false);
  const isApproved = accountStatus === "approved";

  // Apply theme
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  const hasRole = useMemo(
    () => (role: UserRole) => {
      return roles.includes(role);
    },
    [roles]
  );

  const loadProfileAndRoles = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "full_name, email, district_id, community_id, language_preference, account_status"
        )
        .eq("user_id", userId)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }
      if (!profileData) {
        throw new Error("User profile not found.");
      }

      setAccountStatus(profileData.account_status || "pending");

      if (
        profileData.account_status !== "approved" &&
        profileData.account_status !== "pending_completion"
      ) {
        throw new Error(
          `Account not active. Status: ${profileData.account_status}`
        );
      }

      const [
        districtResult,
        communityResult,
        { data: roleRows, error: rolesError },
        { data: primaryRoleData, error: primaryRoleError },
      ] = await Promise.all([
        profileData.district_id
          ? supabase
              .from("districts")
              .select("name")
              .eq("id", profileData.district_id)
              .single()
          : Promise.resolve({ data: null, error: null }),
        profileData.community_id
          ? supabase
              .from("communities")
              .select("name")
              .eq("id", profileData.community_id)
              .single()
          : Promise.resolve({ data: null, error: null }),
        supabase
          .from("enhanced_user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("is_active", true),
        supabase.rpc("get_user_highest_role", { check_user_id: userId }),
      ]);

      if (rolesError)
        throw new Error(`Failed to fetch roles: ${rolesError.message}`);
      if (primaryRoleError)
        throw new Error(
          `Failed to fetch primary role: ${primaryRoleError.message}`
        );

      const roleList: UserRole[] = (roleRows || []).map(
        (r) => r.role as UserRole
      );
      const primaryRole: UserRole =
        (primaryRoleData as UserRole) || roleList[0] || "resident";

      const profileLanguage = profileData?.language_preference as Language;
      if (
        profileLanguage &&
        (profileLanguage === "en" || profileLanguage === "ms") &&
        profileLanguage !== localStorage.getItem("language_preference")
      ) {
        setLanguage(profileLanguage);
        localStorage.setItem("language_preference", profileLanguage);
      }

      const userObj: User = {
        id: userId,
        display_name: profileData?.full_name || profileData?.email || "",
        email: profileData?.email || "",
        associated_community_ids: [],
        active_community_id: profileData?.community_id || "",
        district: districtResult.data?.name || "",
        community: communityResult.data?.name || "",
        user_role: primaryRole,
        available_roles: roleList.length ? roleList : ["resident"],
        phone: "",
        address: "",
        language_preference:
          profileLanguage ||
          (localStorage.getItem("language_preference") as Language) ||
          "ms",
        theme_preference: theme,
        unit_type: undefined,
        ownership_status: undefined,
        vehicle_registration_numbers: [],
        emergency_contact_name: undefined,
        emergency_contact_phone: undefined,
      };

      setUser(userObj);
      setRoles(userObj.available_roles);
    } catch (error) {
      console.error("AuthContext: Failed to load profile and roles.", error);
      setUser(null);
      setRoles([]);
      setAccountStatus(null);
      throw error; // Re-throw the error to be caught by the caller
    }
  }, []);

  useEffect(() => {
    const handleAuthChange = async (session: any) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        if (session?.user) {
          await loadProfileAndRoles(session.user.id);
        } else {
          setUser(null);
          setRoles([]);
          setAccountStatus(null);
        }
      } catch (error) {
        console.error("AuthContext: Error handling auth state change:", error);
        // Clear user state on error to prevent being stuck in a bad state
        setUser(null);
        setRoles([]);
        setAccountStatus(null);
        // Optionally sign out to clear the invalid session
        await supabase.auth.signOut();
      } finally {
        setInitializing(false);
        isProcessingRef.current = false;
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfileAndRoles]);

  const login = async (email: string, password: string) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password.");
      }
      throw error;
    }

    if (!authData.user) {
      throw new Error("Login failed, please try again.");
    }

    // After successful authentication, check account status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("account_status, is_active")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError) {
      await supabase.auth.signOut();
      throw new Error("Failed to retrieve user profile.");
    }

    if (profile) {
      if (!profile.is_active) {
        await supabase.auth.signOut();
        throw new Error("ACCOUNT_INACTIVE");
      }
      if (profile.account_status === "pending") {
        await supabase.auth.signOut();
        throw new Error("ACCOUNT_PENDING");
      }
      if (profile.account_status === "rejected") {
        await supabase.auth.signOut();
        throw new Error("ACCOUNT_REJECTED");
      }
      if (profile.account_status === "suspended") {
        await supabase.auth.signOut();
        throw new Error("ACCOUNT_SUSPENDED");
      }
      if (
        profile.account_status !== "approved" &&
        profile.account_status !== "pending_completion"
      ) {
        await supabase.auth.signOut();
        throw new Error("ACCOUNT_NOT_APPROVED");
      }
    }
  };

  const logout = async () => {
    setUser(null);
    setRoles([]);
    setAccountStatus(null);

    // Clear all session and local storage related to auth
    sessionStorage.clear();
    Object.keys(localStorage)
      .filter((key) => key.startsWith("sb-") || key.startsWith("supabase"))
      .forEach((key) => localStorage.removeItem(key));

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const switchLanguage = async (lang: Language) => {
    if (lang !== "en" && lang !== "ms") {
      lang = "ms";
    }

    setLanguage(lang);
    localStorage.setItem("language_preference", lang);

    if (user) {
      setUser({ ...user, language_preference: lang });
      try {
        await supabase
          .from("profiles")
          .update({ language_preference: lang })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Failed to update language preference:", error);
        // Toast notification removed to avoid dependency issues
        // Consider showing error in UI when toast context is properly set up
      }
    }
  };

  const switchTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (user) setUser({ ...user, theme_preference: newTheme });
  };

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      try {
        const { data: userResp } = await supabase.auth.getUser();
        const sessionUser = userResp.user;
        if (!sessionUser) return;

        // Map incoming generic fields to profiles table columns
        const profileUpdates: Record<string, any> = {};
        if (typeof updates.full_name !== "undefined")
          profileUpdates.full_name = updates.full_name;
        if (typeof updates.address !== "undefined")
          profileUpdates.address = updates.address;
        if (typeof updates.phone !== "undefined")
          profileUpdates.mobile_no = updates.phone;
        if (typeof updates.language_preference !== "undefined")
          profileUpdates.language_preference = updates.language_preference;
        if (typeof (updates as any).theme_preference !== "undefined")
          profileUpdates.theme_preference = (updates as any).theme_preference;
        if (typeof updates.community_id !== "undefined")
          profileUpdates.community_id = updates.community_id;
        if (typeof updates.district_id !== "undefined")
          profileUpdates.district_id = updates.district_id;
        if (typeof updates.account_status !== "undefined")
          profileUpdates.account_status = updates.account_status;

        if (Object.keys(profileUpdates).length === 0) return;

        await supabase
          .from("profiles")
          .update(profileUpdates)
          .eq("user_id", sessionUser.id);

        // Refresh local state
        if (user?.id) {
          await loadProfileAndRoles(user.id);
        }
      } catch (e) {
        console.error("updateProfile error:", e);
      }
    },
    [loadProfileAndRoles]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    initializing,
    accountStatus,
    isApproved,
    language,
    theme,
    roles,
    hasRole,
    login,
    logout,
    switchLanguage,
    switchTheme,
    updateProfile,
    loadProfileAndRoles: useCallback(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        return loadProfileAndRoles(data.session.user.id);
      }
      return Promise.resolve();
    }, [loadProfileAndRoles]),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
