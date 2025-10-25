import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import AppRouter from './routes/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Create QueryClient here in main.tsx to ensure proper bundling
// Moving from lib/query-client.ts to fix "pt is not a constructor" error
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: import.meta.env.PROD,
      refetchOnReconnect: import.meta.env.PROD,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      throwOnError: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      
      <Toaster
        theme="light"
        position="top-right"
        richColors
        closeButton
        visibleToasts={5}
        expand={true}
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            color: '#1f2937',
          },
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-gray-500',
            actionButton: 'group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50',
            cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500',
          },
        }}
      />
    </QueryClientProvider>
  </ErrorBoundary>
);
