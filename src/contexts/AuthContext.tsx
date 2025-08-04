import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'state_admin' | 'district_coordinator' | 'community_admin' | 'facility_manager' | 'security_officer' | 'resident' | 'maintenance_staff';
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
  user_role: UserRole;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchViewRole: (role: ViewRole) => void;
  switchLanguage: (lang: Language) => void;
  switchTheme: (theme: Theme) => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('ms'); // Default to Bahasa Malaysia
  const [theme, setTheme] = useState<Theme>('light');

  // Mock user data for demonstration
  const mockUser: User = {
    id: '1',
    display_name: 'Ahmad Razak',
    email: 'ahmad.razak@example.com',
    associated_community_ids: ['1', '2'],
    active_community_id: '1',
    district: 'Kuantan',
    user_role: 'resident',
    available_roles: ['resident', 'community_admin'],
    current_view_role: 'resident',
    phone: '+60123456789',
    address: 'No. 123, Jalan Bunga Raya, Taman Pahang Jaya, 25300 Kuantan, Pahang',
    language_preference: 'ms',
    theme_preference: 'light',
    unit_type: 'Apartment',
    ownership_status: 'Owner',
    vehicle_registration_numbers: ['PAH1234A'],
    emergency_contact_name: 'Siti Aminah',
    emergency_contact_phone: '+60987654321'
  };

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would be an API call
    setUser(mockUser);
    setLanguage(mockUser.language_preference);
    setTheme(mockUser.theme_preference);
  };

  const logout = () => {
    setUser(null);
  };

  const switchViewRole = (role: ViewRole) => {
    if (user) {
      setUser({ ...user, current_view_role: role });
    }
  };

  const switchLanguage = (lang: Language) => {
    setLanguage(lang);
    if (user) {
      setUser({ ...user, language_preference: lang });
    }
  };

  const switchTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (user) {
      setUser({ ...user, theme_preference: newTheme });
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      language,
      theme,
      currentViewRole: user?.current_view_role || 'resident',
      login,
      logout,
      switchViewRole,
      switchLanguage,
      switchTheme,
      updateProfile
    }}>
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