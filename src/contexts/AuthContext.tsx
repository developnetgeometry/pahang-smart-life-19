import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 
  | 'admin' 
  | 'security_officer' 
  | 'manager' 
  | 'resident'
  | 'state_admin'
  | 'district_coordinator'
  | 'community_admin'
  | 'community_leader'
  | 'facility_manager'
  | 'maintenance_staff'
  | 'service_provider'
  | 'state_service_manager';

// ViewRole removed - using role-based navigation instead
export type Language = 'en' | 'ms';
export type Theme = 'light' | 'dark';

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
  const [language, setLanguage] = useState<Language>('ms');
  const [theme, setTheme] = useState<Theme>('light');
  const [roles, setRoles] = useState<UserRole[]>([]);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);


  const hasRole = useMemo(() => (role: UserRole) => roles.includes(role), [roles]);

  // Load profile + roles for a given user id
  const loadProfileAndRoles = async (userId: string) => {
    try {
      const [{ data: profile }, { data: roleRows }] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, email, district_id')
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
      const primaryRole: UserRole = roleList[0] || 'resident';

      const userObj: User = {
        id: userId,
        display_name: profile?.full_name || profile?.email || '',
        email: profile?.email || '',
        associated_community_ids: [],
        active_community_id: '',
        district: districtName,
        user_role: primaryRole,
        available_roles: roleList.length ? roleList : ['resident'],
        phone: '',
        address: '',
        language_preference: language,
        theme_preference: theme,
        unit_type: undefined,
        ownership_status: undefined,
        vehicle_registration_numbers: [],
        emergency_contact_name: undefined,
        emergency_contact_phone: undefined,
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
