import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Enhanced role types
export type EnhancedUserRole = 
  | 'state_admin'
  | 'district_coordinator'
  | 'community_admin'
  | 'facility_manager'
  | 'security_officer'
  | 'maintenance_staff'
  | 'service_provider'
  | 'community_leader'
  | 'state_service_manager'
  | 'resident';

export type PermissionLevel = 'full_access' | 'standard_access' | 'limited_access';

export interface RoleInfo {
  role: EnhancedUserRole;
  level: number;
  permission_level: PermissionLevel;
  display_name: string;
  description: string;
  color_code: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  unit_number?: string;
  district_id?: string;
  language_preference?: string;
  theme_preference?: string;
}

export interface ModulePermissions {
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_approve: boolean;
}

export interface EnhancedAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roleInfo: RoleInfo | null;
  roles: EnhancedUserRole[];
  currentRole: EnhancedUserRole | null;
  isLoading: boolean;
  language: string;
  theme: string;
  
  // Authentication methods
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  
  // Role methods
  hasRole: (role: EnhancedUserRole) => boolean;
  hasRoleLevel: (minLevel: number) => boolean;
  hasModulePermission: (moduleName: string, permissionType: string) => Promise<boolean>;
  switchRole: (role: EnhancedUserRole) => Promise<void>;
  
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchLanguage: (lang: string) => void;
  switchTheme: (theme: string) => void;
  
  // Audit logging
  logAction: (action: string, moduleName?: string, resourceType?: string, resourceId?: string, oldValues?: any, newValues?: any) => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

export function EnhancedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [roles, setRoles] = useState<EnhancedUserRole[]>([]);
  const [currentRole, setCurrentRole] = useState<EnhancedUserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  
  const { toast } = useToast();

  // Fetch user profile and roles
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData?.language_preference) {
        setLanguage(profileData.language_preference);
      }
      if (profileData?.theme_preference) {
        setTheme(profileData.theme_preference);
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('enhanced_user_roles')
        .select('role, is_active')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      const userRoles = rolesData?.map(r => r.role as EnhancedUserRole) || [];
      setRoles(userRoles);

      // Get role hierarchy info for the highest role
      if (userRoles.length > 0) {
        const { data: roleHierarchyData, error: roleHierarchyError } = await supabase
          .from('role_hierarchy')
          .select('*')
          .in('role', userRoles)
          .order('level', { ascending: false })
          .limit(1)
          .single();

        if (!roleHierarchyError && roleHierarchyData) {
          setCurrentRole(roleHierarchyData.role as EnhancedUserRole);
          setRoleInfo({
            role: roleHierarchyData.role as EnhancedUserRole,
            level: roleHierarchyData.level,
            permission_level: roleHierarchyData.permission_level as PermissionLevel,
            display_name: roleHierarchyData.display_name,
            description: roleHierarchyData.description || '',
            color_code: roleHierarchyData.color_code || '#6B7280',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication methods
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const logout = async () => {
    await logAction('logout');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoleInfo(null);
    setRoles([]);
    setCurrentRole(null);
  };

  // Role checking methods
  const hasRole = (role: EnhancedUserRole): boolean => {
    return roles.includes(role);
  };

  const hasRoleLevel = (minLevel: number): boolean => {
    return roleInfo ? roleInfo.level >= minLevel : false;
  };

  const hasModulePermission = async (moduleName: string, permissionType: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('has_module_permission', {
        module_name: moduleName,
        permission_type: permissionType,
        check_user_id: user.id
      });

      if (error) {
        console.error('Permission check error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const switchRole = async (role: EnhancedUserRole) => {
    if (!hasRole(role)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to switch to this role",
        variant: "destructive",
      });
      return;
    }

    setCurrentRole(role);
    await logAction('role_switch', 'system', 'role', undefined, { from: currentRole }, { to: role });

    // Update role info
    try {
      const { data, error } = await supabase
        .from('role_hierarchy')
        .select('*')
        .eq('role', role)
        .single();

      if (!error && data) {
        setRoleInfo({
          role: data.role,
          level: data.level,
          permission_level: data.permission_level,
          display_name: data.display_name,
          description: data.description,
          color_code: data.color_code,
        });
      }
    } catch (error) {
      console.error('Error updating role info:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }

    setProfile(prev => prev ? { ...prev, ...updates } : null);
    await logAction('profile_update', 'profile', 'profile', user.id, profile, { ...profile, ...updates });

    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  const switchLanguage = (lang: string) => {
    setLanguage(lang);
    updateProfile({ language_preference: lang });
  };

  const switchTheme = (newTheme: string) => {
    setTheme(newTheme);
    updateProfile({ theme_preference: newTheme });
  };

  // Audit logging
  const logAction = async (
    action: string,
    moduleName?: string,
    resourceType?: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('enhanced_audit_logs')
        .insert({
          user_id: user.id,
          user_role: currentRole,
          action,
          module_name: moduleName,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          district_id: profile?.district_id,
          session_id: session?.access_token?.substring(0, 10), // First 10 chars of token as session ID
        });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
          if (event === 'SIGNED_IN') {
            // Log successful login
            setTimeout(() => {
              logAction('login');
            }, 0);
          }
        } else {
          setProfile(null);
          setRoleInfo(null);
          setRoles([]);
          setCurrentRole(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const value: EnhancedAuthContextType = {
    user,
    session,
    profile,
    roleInfo,
    roles,
    currentRole,
    isLoading,
    language,
    theme,
    login,
    logout,
    hasRole,
    hasRoleLevel,
    hasModulePermission,
    switchRole,
    updateProfile,
    switchLanguage,
    switchTheme,
    logAction,
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
}

export function useEnhancedAuth() {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
}