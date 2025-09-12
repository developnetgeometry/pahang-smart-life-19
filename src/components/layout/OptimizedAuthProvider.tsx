import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCachedAuth } from '@/hooks/use-cached-auth';
import type { User } from '@/contexts/AuthContext';

interface OptimizedAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  accountStatus: string | null;
  roles: string[];
  language: string;
  theme: string;
  initializing: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchLanguage: (language: string) => Promise<void>;
  switchTheme: (theme: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  hasRole: (role: string) => boolean;
  refreshAuth: () => Promise<void>;
}

const OptimizedAuthContext = createContext<OptimizedAuthContextType | undefined>(undefined);

export function OptimizedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('system');

  const { cachedData, loadProfileAndRoles, cacheUserData, clearCache, isCached } = useCachedAuth();

  // Use cached data if available
  useEffect(() => {
    if (cachedData && !user) {
      setUser(cachedData.user);
      setAccountStatus(cachedData.accountStatus);
      setRoles(cachedData.roles);
      setInitializing(false);
    }
  }, [cachedData, user]);

  // Optimized theme application
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Memoized derived states
  const isApproved = useMemo(() => {
    return accountStatus === 'approved';
  }, [accountStatus]);

  const isAuthenticated = useMemo(() => {
    return !!user && isApproved;
  }, [user, isApproved]);

  const hasRole = useCallback((role: string) => {
    return roles.includes(role);
  }, [roles]);

  // Optimized auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Only load fresh data if not cached
        if (!isCached) {
          const result = await loadProfileAndRoles(session.user.id);
          setUser(result.user);
          setAccountStatus(result.accountStatus);
          setRoles(result.roles);
        }
        setInitializing(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccountStatus(null);
        setRoles([]);
        clearCache();
        setInitializing(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && !isCached) {
        const result = await loadProfileAndRoles(session.user.id);
        setUser(result.user);
        setAccountStatus(result.accountStatus);
        setRoles(result.roles);
      }
      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfileAndRoles, clearCache, isCached]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const result = await loadProfileAndRoles(data.user.id);
        setUser(result.user);
        setAccountStatus(result.accountStatus);
        setRoles(result.roles);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [loadProfileAndRoles]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccountStatus(null);
    setRoles([]);
    clearCache();
  }, [clearCache]);

  const switchLanguage = useCallback(async (newLanguage: string) => {
    setLanguage(newLanguage);
    // Language switching functionality can be enhanced later when profile supports it
  }, []);

  const switchTheme = useCallback((newTheme: string) => {
    setTheme(newTheme);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // Update cache
      cacheUserData(updatedUser, accountStatus, roles);
    }
  }, [user, accountStatus, roles, cacheUserData]);

  const refreshAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const result = await loadProfileAndRoles(session.user.id);
      setUser(result.user);
      setAccountStatus(result.accountStatus);
      setRoles(result.roles);
    }
  }, [loadProfileAndRoles]);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isApproved,
    accountStatus,
    roles,
    language,
    theme,
    initializing,
    login,
    logout,
    switchLanguage,
    switchTheme,
    updateProfile,
    hasRole,
    refreshAuth,
  }), [
    user,
    isAuthenticated,
    isApproved,
    accountStatus,
    roles,
    language,
    theme,
    initializing,
    login,
    logout,
    switchLanguage,
    switchTheme,
    updateProfile,
    hasRole,
    refreshAuth,
  ]);

  return (
    <OptimizedAuthContext.Provider value={value}>
      {children}
    </OptimizedAuthContext.Provider>
  );
}

export function useOptimizedAuth() {
  const context = useContext(OptimizedAuthContext);
  if (context === undefined) {
    throw new Error('useOptimizedAuth must be used within an OptimizedAuthProvider');
  }
  return context;
}