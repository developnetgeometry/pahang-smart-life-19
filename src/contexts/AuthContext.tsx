import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export enum UserRole {
  STATE_ADMIN = 'state_admin',
  DISTRICT_COORDINATOR = 'district_coordinator',
  COMMUNITY_ADMIN = 'community_admin',
  FACILITY_MANAGER = 'facility_manager',
  SECURITY_OFFICER = 'security_officer',
  MAINTENANCE_STAFF = 'maintenance_staff',
  RESIDENT = 'resident',
  SERVICE_PROVIDER = 'service_provider',
  COMMUNITY_LEADER = 'community_leader',
  STATE_SERVICE_MANAGER = 'state_service_manager'
}

export type Language = 'en' | 'ms';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  display_name: string;
  email: string;
  primary_role: UserRole;
  available_roles: UserRole[];
  district_id?: string;
  district_name?: string;
  phone?: string;
  address?: string;
  language_preference: Language;
  theme_preference: Theme;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  language: Language;
  theme: Theme;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  getPrimaryRole: () => UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchLanguage: (lang: Language) => void;
  switchTheme: (theme: Theme) => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('ms');
  const [theme, setTheme] = useState<Theme>('light');
  const [roles, setRoles] = useState<UserRole[]>([]);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const hasRole = useMemo(() => (role: UserRole) => roles.includes(role), [roles]);
  
  const getPrimaryRole = () => user?.primary_role || null;

  // Load profile + roles for a given user id
  const loadProfileAndRoles = async (userId: string) => {
    try {
      const [{ data: profile }, { data: roleRows }] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, email, district_id, primary_role')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId),
      ]);

      let districtName = '';
      if (profile?.district_id) {
        const { data: district } = await supabase
          .from('districts')
          .select('name')
          .eq('id', profile.district_id)
          .maybeSingle();
        districtName = district?.name || '';
      }

      const roleList: UserRole[] = (roleRows || []).map(r => r.role as UserRole);
      const primaryRole: UserRole = (profile?.primary_role as UserRole) || roleList[0] || UserRole.RESIDENT;

      const userObj: User = {
        id: userId,
        display_name: profile?.full_name || profile?.email || '',
        email: profile?.email || '',
        primary_role: primaryRole,
        available_roles: roleList.length ? roleList : [UserRole.RESIDENT],
        district_id: profile?.district_id,
        district_name: districtName,
        phone: '',
        address: '',
        language_preference: language,
        theme_preference: theme,
      };

      setUser(userObj);
      setRoles(userObj.available_roles);
    } catch (e) {
      console.error('Failed to load profile/roles', e);
      setUser(null);
      setRoles([]);
    }
  };

  // Auth state listener + initial session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id;
      if (uid) {
        // Defer Supabase calls to avoid deadlocks
        setTimeout(() => loadProfileAndRoles(uid), 0);
      } else {
        setUser(null);
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (uid) setTimeout(() => loadProfileAndRoles(uid), 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoles([]);
  };

  const switchLanguage = (lang: Language) => {
    setLanguage(lang);
    if (user) setUser({ ...user, language_preference: lang });
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
    language,
    theme,
    roles,
    hasRole,
    getPrimaryRole,
    login,
    logout,
    switchLanguage,
    switchTheme,
    updateProfile,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}