// Simple replacement for TanStack Query to avoid Node.js module issues
// This provides basic query functionality without the complex internals

export interface QueryClient {
  getQueryData: (queryKey: any[]) => any;
  setQueryData: (queryKey: any[], data: any) => void;
  invalidateQueries: (options: { queryKey?: any[] }) => void;
  refetchQueries: (options: { queryKey?: any[] }) => void;
}

export interface QueryOptions<T> {
  queryKey: any[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
  retryDelay?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  networkMode?: string;
}

export interface MutationOptions<T, V> {
  mutationFn: (variables: V) => Promise<T>;
  retry?: number;
  throwOnError?: boolean;
}

export interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseMutationResult<T, V> {
  mutate: (variables: V) => void;
  mutateAsync: (variables: V) => Promise<T>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

// Simple in-memory cache
const cache = new Map<string, any>();
const queryStates = new Map<string, { isLoading: boolean; isError: boolean; error: Error | null }>();

// Simple QueryClient implementation
export class SimpleQueryClient implements QueryClient {
  getQueryData(queryKey: any[]): any {
    const key = JSON.stringify(queryKey);
    return cache.get(key);
  }

  setQueryData(queryKey: any[], data: any): void {
    const key = JSON.stringify(queryKey);
    cache.set(key, data);
  }

  invalidateQueries(options: { queryKey?: any[] }): void {
    if (options.queryKey) {
      const key = JSON.stringify(options.queryKey);
      cache.delete(key);
    } else {
      cache.clear();
    }
  }

  refetchQueries(options: { queryKey?: any[] }): void {
    // Simple implementation - just clear cache
    this.invalidateQueries(options);
  }
}

// Simple useQuery hook
export function useQuery<T>(options: QueryOptions<T>): UseQueryResult<T> {
  const [data, setData] = React.useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const queryKey = JSON.stringify(options.queryKey);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        
        const result = await options.queryFn();
        setData(result);
        cache.set(queryKey, result);
      } catch (err) {
        setIsError(true);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check cache first
    const cachedData = cache.get(queryKey);
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
    } else {
      fetchData();
    }
  }, [queryKey]);

  const refetch = () => {
    cache.delete(queryKey);
    setIsLoading(true);
    options.queryFn().then(result => {
      setData(result);
      cache.set(queryKey, result);
      setIsLoading(false);
    }).catch(err => {
      setIsError(true);
      setError(err as Error);
      setIsLoading(false);
    });
  };

  return { data, isLoading, isError, error, refetch };
}

// Simple useMutation hook
export function useMutation<T, V>(options: MutationOptions<T, V>): UseMutationResult<T, V> {
  const [isPending, setIsPending] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const mutate = (variables: V) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    
    options.mutationFn(variables)
      .then(() => {
        setIsPending(false);
      })
      .catch(err => {
        setIsError(true);
        setError(err as Error);
        setIsPending(false);
      });
  };

  const mutateAsync = async (variables: V): Promise<T> => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    
    try {
      const result = await options.mutationFn(variables);
      setIsPending(false);
      return result;
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      setIsPending(false);
      throw err;
    }
  };

  return { mutate, mutateAsync, isPending, isError, error };
}

// Simple useQueryClient hook
export function useQueryClient(): QueryClient {
  return new SimpleQueryClient();
}

// Simple QueryClientProvider
export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return React.createElement('div', null, children);
}

// Import React for the hooks
import React from 'react';