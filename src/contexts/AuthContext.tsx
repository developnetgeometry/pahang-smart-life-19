import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  associated_community_ids: string[];
  active_community_id: string;
  district: string;
  community: string;
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

export const AuthProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language_preference");
    return (saved as Language) || "ms";
  });
  const [theme, setTheme] = useState<Theme>("light");
  const [roles, setRoles] = useState<UserRole[]>([]);
  const { toast } = useToast();

  const isApproved = useMemo(() => accountStatus === "approved", [accountStatus]);
  const isAuthenticated = useMemo(() => !!user, [user]);
  
  console.log('🔐 AuthContext: Auth state -', { 
    user: user?.email || 'none', 
    isAuthenticated: !!user, 
    accountStatus, 
    isApproved,
    initializing 
  });

  // Apply theme
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  // Show welcome toast only once per session when user logs in successfully
  // useEffect(() => {
  //   const toastShown = sessionStorage.getItem("loginToastShown");
  //   if (user && accountStatus === "approved" && !toastShown) {
  //     // Add a small delay to ensure everything is loaded
  //     const timer = setTimeout(() => {
  //       sessionStorage.setItem("loginToastShown", "true");
  //       toast({
  //         variant: "welcome" as any,
  //         title: "Welcome back!",
  //         description: `Good to see you again, ${
  //           user.display_name || user.email || "User"
  //         }!`,
  //         duration: 3000,
  //       });
  //     }, 500);

  //     return () => clearTimeout(timer);
  //   }
  // }, [user, accountStatus, toast]);

  const hasRole = useMemo(
    () => (role: UserRole) => {
      return roles.includes(role);
    },
    [roles]
  );

  // Load profile + roles for a given user id with optimized queries
  const loadProfileAndRoles = async (userId: string) => {
    try {
      console.log(`AuthContext: Loading profile for user ${userId}`);
      
      // Optimized query for profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, district_id, community_id, language_preference, account_status")
        .eq("user_id", userId)
        .maybeSingle();

      console.log(`AuthContext: Profile query result:`, { profileData, profileError });
        
      // Get district and community names in parallel if needed
      const [districtResult, communityResult] = await Promise.all([
        profileData?.district_id 
          ? supabase.from("districts").select("name").eq("id", profileData.district_id).single()
          : Promise.resolve({ data: null }),
        profileData?.community_id 
          ? supabase.from("communities").select("name").eq("id", profileData.community_id).single()
          : Promise.resolve({ data: null })
      ]);

      if (profileError) {
        console.error(`AuthContext: Profile error for user ${userId}:`, profileError);
        throw profileError;
      }

      if (!profileData) {
        console.log(`AuthContext: No profile found for user ${userId}`);
        setUser(null);
        setRoles([]);
        setAccountStatus(null);
        return;
      }

      console.log(`AuthContext: Getting roles for user ${userId}`);
      
      // Get roles and primary role in parallel
      const [{ data: roleRows, error: rolesError }, { data: primaryRoleData, error: primaryRoleError }] = await Promise.all([
        supabase
          .from("enhanced_user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("is_active", true),
        supabase.rpc("get_user_highest_role", { check_user_id: userId }),
      ]);

      console.log(`AuthContext: Roles query result:`, { roleRows, rolesError, primaryRoleData, primaryRoleError });

      // Set account status regardless of approval state
      setAccountStatus(profileData.account_status || "pending");
      
      console.log(`AuthContext: Account status for user ${userId}:`, profileData.account_status);

      // Check if account is approved or pending completion
      if (
        profileData.account_status !== "approved" &&
        profileData.account_status !== "pending_completion"
      ) {
        console.log(`AuthContext: User ${userId} account not approved, status: ${profileData.account_status}`);
        setUser(null);
        setRoles([]);
        return;
      }

      const roleList: UserRole[] = (roleRows || []).map(r => r.role as UserRole);
      const primaryRole: UserRole = (primaryRoleData as UserRole) || roleList[0] || "resident";
      
      console.log(`AuthContext: Processed roles for user ${userId}:`, { roleList, primaryRole });

      // Update language from profile if available
      const profileLanguage = profileData?.language_preference as Language;
      if (profileLanguage && profileLanguage !== language) {
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
        language_preference: profileLanguage || language,
        theme_preference: theme,
        unit_type: undefined,
        ownership_status: undefined,
        vehicle_registration_numbers: [],
        emergency_contact_name: undefined,
        emergency_contact_phone: undefined,
      };

      console.log(`AuthContext: User ${userId} loaded with roles:`, roleList, 'primary role:', primaryRole);
      setUser(userObj);
      setRoles(userObj.available_roles);
    } catch (e) {
      console.error(`🔐 AuthContext: Failed to load profile/roles for user ${userId}:`, e);
      setUser(null);
      setRoles([]);
      setAccountStatus(null);
    }
  };

  // Auth state listener + initial session
  useEffect(() => {
    console.log("🔐 AuthContext: Setting up auth listener...");
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const uid = session?.user?.id;
      console.log(`🔐 AuthContext: Auth state change - Event: ${event}, User ID: ${uid || 'none'}`);
      
      if (uid) {
        console.log("🔐 AuthContext: User session found, loading profile...");
        
        // Handle email confirmation for new signups
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("account_status")
              .eq("user_id", uid)
              .maybeSingle();
              
            if (profile?.account_status === "pending") {
              await supabase
                .from("profiles")
                .update({ account_status: "pending_completion" })
                .eq("user_id", uid);
            }
          } catch (error) {
            console.error("🔐 AuthContext: Error updating account status:", error);
          }
        }
        
        // Load profile and roles
        try {
          await loadProfileAndRoles(uid);
        } catch (error) {
          console.error("🔐 AuthContext: Failed to load profile/roles:", error);
          setUser(null);
          setRoles([]);
          setAccountStatus(null);
        }
      } else {
        console.log("🔐 AuthContext: No user session, clearing state...");
        setUser(null);
        setRoles([]);
        setAccountStatus(null);
      }
      
      // Always set initializing to false after processing
      setInitializing(false);
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id;
      console.log("🔐 AuthContext: Initial session check", { hasSession: !!data.session, userId: uid });
      
      if (uid) {
        try {
          await loadProfileAndRoles(uid);
        } catch (error) {
          console.error("🔐 AuthContext: Failed initial profile load:", error);
          setUser(null);
          setRoles([]);
          setAccountStatus(null);
        }
      }
      
      // Always set initializing to false after initial check
      setInitializing(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // After successful authentication, check account status
    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_status, is_active, full_name")
        .eq("user_id", authData.user.id)
        .single();

      if (profile) {
        // Check if account is active
        if (!profile.is_active) {
          await supabase.auth.signOut();
          throw new Error("ACCOUNT_INACTIVE");
        }

        // Check account status - only block pure "pending" (email not confirmed)
        // Allow "pending_completion" (email confirmed, needs to complete profile)
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
    }
  };

  const logout = async () => {
    // Clear state immediately for faster UI response
    setUser(null);
    setRoles([]);
    setAccountStatus(null);
    sessionStorage.removeItem("loginToastShown");
    
    // Sign out in background
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
    loadProfileAndRoles: async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        return loadProfileAndRoles(data.session.user.id);
      }
      return Promise.resolve();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
