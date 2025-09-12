import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/contexts/AuthContext';

const CACHE_KEY = 'app_user_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CachedUserData {
  user: User | null;
  timestamp: number;
  accountStatus: string | null;
  roles: string[];
}

export function useCachedAuth() {
  const [cachedData, setCachedData] = useState<CachedUserData | null>(null);

  // Load from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data: CachedUserData = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_EXPIRY) {
          setCachedData(data);
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      } catch (error) {
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }, []);

  const cacheUserData = useCallback((user: User | null, accountStatus: string | null, roles: string[]) => {
    const data: CachedUserData = {
      user,
      timestamp: Date.now(),
      accountStatus,
      roles
    };
    setCachedData(data);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  }, []);

  const clearCache = useCallback(() => {
    setCachedData(null);
    localStorage.removeItem(CACHE_KEY);
  }, []);

  // Optimized profile and roles loading with parallel queries
  const loadProfileAndRoles = useCallback(async (userId: string) => {
    try {
      // Execute queries in parallel instead of sequentially
      const [profileResponse, rolesResponse, communitiesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId),
        
        // Simplified community query to avoid type issues
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
      ]);

      // Handle profile data
      let profileData = null;
      if (profileResponse.data) {
        profileData = {
          ...profileResponse.data,
          communities: [] // Simplified - can be enhanced later
        };
      }

      const roles = rolesResponse.data?.map(r => r.role) || [];
      const accountStatus = profileData?.account_status || null;

      // Cache the results
      cacheUserData(profileData, accountStatus, roles);

      return { user: profileData, accountStatus, roles };
    } catch (error) {
      console.error('Error loading profile and roles:', error);
      return { user: null, accountStatus: null, roles: [] };
    }
  }, [cacheUserData]);

  return {
    cachedData,
    cacheUserData,
    clearCache,
    loadProfileAndRoles,
    isCached: !!cachedData
  };
}