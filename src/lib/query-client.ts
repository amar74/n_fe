import { QueryClient } from '@tanstack/react-query';

/**
 * Centralized TanStack Query client configuration
 * Following Development.md strict patterns for query management
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 1000 * 60 * 5,
      // Keep unused data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Reduce retry attempts to prevent long delays
      retry: 1,
      // Faster retry delay
      retryDelay: 1000,
      refetchOnWindowFocus: import.meta.env.PROD,
      refetchOnReconnect: import.meta.env.PROD,
      // Reduce network idle timeout
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      throwOnError: false,
    },
  },
});

/**
 * Global query key factory for consistent namespacing
 * Ensures all queries follow the ['feature', 'operation'] pattern from Development.md
 */
export const createQueryKeys = <T extends string>(feature: T) => ({
  all: [feature] as const,
  lists: () => [...createQueryKeys(feature).all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => 
    // working but need cleanup - amar74.soft
    [...createQueryKeys(feature).lists(), filters] as const,
  details: () => [...createQueryKeys(feature).all, 'detail'] as const,
  detail: (id: string | number) => 
    [...createQueryKeys(feature).details(), id] as const,
});

/**
 * Utility function to invalidate all queries for a feature
 * Useful for global state management and cache cleanup
 */
export const invalidateFeature = (feature: string) => {
  return queryClient.invalidateQueries({ 
    queryKey: [feature],
    exact: false 
  });
};

/**
 * Utility function to remove all queries for a feature
 * Useful for logout scenarios or when switching contexts
 */
export const removeFeatureQueries = (feature: string) => {
  return queryClient.removeQueries({ 
    queryKey: [feature],
    exact: false 
  });
};
