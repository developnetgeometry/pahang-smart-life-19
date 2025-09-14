import * as React from "react";
import { createContext, useContext, useState } from "react";

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
  // Simple state initialization to test if React hooks work
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [language, setLanguage] = useState<Language>("ms");
  const [theme, setTheme] = useState<Theme>("light");
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);

  // Minimal implementations to prevent errors
  const isAuthenticated = !!user;
  const isApproved = accountStatus === "approved";
  
  const hasRole = (role: UserRole) => roles.includes(role);
  
  const login = async (email: string, password: string) => {
    console.log("Login called with:", email);
    return { error: null };
  };
  
  const logout = async () => {
    console.log("Logout called");
    setUser(null);
  };
  
  const switchLanguage = async (lang: Language) => {
    console.log("Switch language to:", lang);
    setLanguage(lang);
  };
  
  const switchTheme = (newTheme: Theme) => {
    console.log("Switch theme to:", newTheme);
    setTheme(newTheme);
  };
  
  const updateProfile = (updates: Partial<User>) => {
    console.log("Update profile:", updates);
  };
  
  const loadProfileAndRoles = async () => {
    console.log("Load profile and roles");
    setInitializing(false);
  };

  // Set initializing to false after a short delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 100);
    return () => clearTimeout(timer);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}