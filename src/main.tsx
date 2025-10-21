import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import AppRouter from './routes/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { queryClient } from './lib/query-client';

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
