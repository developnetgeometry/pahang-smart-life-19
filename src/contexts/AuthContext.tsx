import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";

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
  | "tenant";

// ViewRole removed - using role-based navigation instead
export type Language = "en" | "ms";
export type Theme = "light" | "dark";

export interface User {
  id: string;
  display_name: string;
  email: string;
  associated_community_ids: string[];
  active_community_id: string;
  district: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language_preference");
    return (saved as Language) || "ms";
  });
  const [theme, setTheme] = useState<Theme>("light");
  const [roles, setRoles] = useState<UserRole[]>([]);

  const isApproved = accountStatus === "approved";

  // Apply theme
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  const hasRole = useMemo(
    () => (role: UserRole) => {
      const hasIt = roles.includes(role);
      console.log("hasRole check:", role, "in roles:", roles, "result:", hasIt);
      return hasIt;
    },
    [roles]
  );

  // Load profile + roles for a given user id
  const loadProfileAndRoles = async (userId: string) => {
    try {
      console.log("loadProfileAndRoles called for userId:", userId);
      const [{ data: profile }, { data: roleRows }, { data: primaryRoleData }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select(
              "full_name, email, district_id, language_preference, account_status"
            )
            .eq("user_id", userId)
            .maybeSingle(),
          supabase
            .from("enhanced_user_roles")
            .select("role")
            .eq("user_id", userId)
            .eq("is_active", true),
          supabase.rpc("get_user_highest_role", { check_user_id: userId }),
        ]);

      // Set account status regardless of approval state
      setAccountStatus(profile?.account_status || "pending");

      // Check if account is approved (account_status should be 'approved' for approved accounts)
      if (profile?.account_status !== "approved") {
        console.log(
          "User account not approved, account_status:",
          profile?.account_status
        );
        // Don't sign out, just set user to null and clear roles
        setUser(null);
        setRoles([]);
        return;
      }

      let districtName = "";
      if (profile?.district_id) {
        const { data: district } = await supabase
          .from("districts")
          .select("name")
          .eq("id", profile.district_id)
          .single();
        districtName = district?.name || "";
      }

      const roleList: UserRole[] = (roleRows || []).map(
        (r) => r.role as UserRole
      );
      const primaryRole: UserRole =
        (primaryRoleData as UserRole) || roleList[0] || "resident";

      console.log("Profile data:", profile);
      console.log("Role rows from database:", roleRows);
      console.log("Loaded roles for user:", userId, "roles:", roleList);
      console.log("Primary role:", primaryRole);

      // Update language from profile if available
      const profileLanguage = profile?.language_preference as Language;
      if (profileLanguage && profileLanguage !== language) {
        setLanguage(profileLanguage);
        localStorage.setItem("language_preference", profileLanguage);
      }

      const userObj: User = {
        id: userId,
        display_name: profile?.full_name || profile?.email || "",
        email: profile?.email || "",
        associated_community_ids: [],
        active_community_id: "",
        district: districtName,
        user_role: primaryRole,
        available_roles: roleList.length ? roleList : ["resident"],
        phone: "",
        address: "",
        language_preference: profileLanguage || language,
        theme_preference: theme,
        unit_type: undefined,
        ownership_status: undefined,
        vehicle_registration_numbers: [],
        emergency_contact_name: undefined,
        emergency_contact_phone: undefined,
      };

      setUser(userObj);
      setRoles(userObj.available_roles);
      console.log("Final user object:", userObj);
      console.log("Final roles set:", userObj.available_roles);
    } catch (e) {
      console.error("Failed to load profile/roles", e);
      setUser(null);
      setRoles([]);
      setAccountStatus(null);
    } finally {
      setInitializing(false);
    }
  };

  // Auth state listener + initial session
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id;
      if (uid) {
        // Defer Supabase calls to avoid deadlocks
        setTimeout(() => loadProfileAndRoles(uid), 0);
      } else {
        setUser(null);
        setRoles([]);
        setAccountStatus(null);
        setInitializing(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (uid) {
        setTimeout(() => loadProfileAndRoles(uid), 0);
      } else {
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    console.log("Logging out user:", user?.id);
    console.log(setUser);
    console.log(setRoles);
    await supabase.auth.signOut();
    setUser(null);
    setRoles([]);
  };

  const switchLanguage = async (lang: Language) => {
    setLanguage(lang);
    if (user) {
      setUser({ ...user, language_preference: lang });
      // Persist language preference to localStorage
      localStorage.setItem("language_preference", lang);

      // Update user profile in database
      try {
        await supabase
          .from("profiles")
          .update({ language_preference: lang })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Failed to update language preference:", error);
      }
    }
  };

  const switchTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (user) setUser({ ...user, theme_preference: newTheme });
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

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
