import { QueryClient } from '@tanstack/react-query';

// Create optimized query client with better defaults
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Increase cache times for better performance
        cacheTime: 15 * 60 * 1000, // 15 minutes (was 10)
        staleTime: 10 * 60 * 1000,  // 10 minutes (was 5)
        
        // Optimize network behavior
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false, // Don't refetch if data is fresh
        
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on authentication errors
          if (error?.status === 401 || error?.status === 403) return false;
          // Don't retry on client errors (4xx)
          if (error?.status >= 400 && error?.status < 500) return false;
          // Retry up to 2 times for server errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        
        // Performance optimizations
        // notifyOnChangeProps: 'tracked', // Only re-render when tracked properties change
      },
      mutations: {
        // Retry mutations less aggressively
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
};

// Prefetch commonly used data
export const prefetchCriticalData = async (queryClient: QueryClient, userId?: string) => {
  if (!userId) return;

  // Prefetch user roles and permissions
  queryClient.prefetchQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      return data?.map(r => r.role) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Prefetch community data for community-related roles (simplified)
  queryClient.prefetchQuery({
    queryKey: ['user-communities', userId],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
};