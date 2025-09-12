import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  cacheTime?: number;
  staleTime?: number;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  cacheTime = 10 * 60 * 1000, // 10 minutes default
  staleTime = 5 * 60 * 1000,  // 5 minutes default
  ...options
}: OptimizedQueryOptions<T>) {
  // Memoize query key to prevent unnecessary re-renders
  const memoizedKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);
  
  return useQuery({
    queryKey: memoizedKey,
    queryFn,
    cacheTime,
    staleTime,
    // Enable background refetching for better UX
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // Retry configuration for better reliability
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if ((error as any)?.status === 401) return false;
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  });
}

// Hook for paginated queries with optimized caching
export function useOptimizedInfiniteQuery<T>({
  queryKey,
  queryFn,
  getNextPageParam,
  cacheTime = 15 * 60 * 1000, // 15 minutes for infinite queries
  staleTime = 10 * 60 * 1000,  // 10 minutes
  ...options
}: any) {
  const memoizedKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);
  
  return useQuery({
    queryKey: memoizedKey,
    queryFn,
    getNextPageParam,
    cacheTime,
    staleTime,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    ...options,
  });
}