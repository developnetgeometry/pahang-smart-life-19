import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole =
  | 'state_admin'
  | 'district_coordinator'
  | 'community_admin'
  | 'security_officer'
  | 'facility_manager'
  | 'maintenance_staff'
  | 'resident'
  | 'service_provider'
  | 'community_leader'
  | 'state_service_manager';

export type ViewRole = 'resident' | 'professional';
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
  current_view_role: ViewRole;
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
  currentViewRole: ViewRole;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchViewRole: (role: ViewRole) => void;
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
  const [currentViewRole, setCurrentViewRole] = useState<ViewRole>('resident');

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
        current_view_role: currentViewRole,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const switchViewRole = (role: ViewRole) => {
    setCurrentViewRole(role);
    if (user) setUser({ ...user, current_view_role: role });
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
    currentViewRole,
    roles,
    hasRole,
    login,
    logout,
    switchViewRole,
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
