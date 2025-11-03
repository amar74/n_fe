/**
 * Global Toast Service - wraps Sonner with type-safe methods
 * Initialized in main.tsx and persists across navigation
 */

import { toast as sonnerToast, type ExternalToast } from 'sonner';

export interface ToastOptions extends Omit<ExternalToast, 'id'> {
  id?: string | number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

class ToastService {
  success(message: string, options?: ToastOptions): string | number {
    return sonnerToast.success(message, {
      duration: 4000,
      ...options,
    });
  }

  error(message: string, options?: ToastOptions): string | number {
    return sonnerToast.error(message, {
      duration: 5000,
      ...options,
    });
  }

  warning(message: string, options?: ToastOptions): string | number {
    return sonnerToast.warning(message, {
      duration: 4000,
      ...options,
    });
  }

  info(message: string, options?: ToastOptions): string | number {
    return sonnerToast.info(message, {
      duration: 3000,
      ...options,
    });
  }

  loading(message: string, options?: Omit<ToastOptions, 'duration'>): string | number {
    return sonnerToast.loading(message, options);
  }

  message(message: string, options?: ToastOptions): string | number {
    return sonnerToast(message, {
      duration: 3000,
      ...options,
    });
  }

  dismiss(toastId?: string | number): void {
    sonnerToast.dismiss(toastId);
  }

  dismissAll(): void {
    sonnerToast.dismiss();
  }

  promise<T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
      duration?: number;
    }
  ): string | number | { unwrap: () => Promise<T> } {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      duration: options.duration,
    });
  }
}

export const toastService = new ToastService();

export const ToastPresets = {
  authSuccess: (message: string = 'Welcome back!') =>
    toastService.success(message, {
      duration: 4000,
      style: {
        background: '#10b981',
        color: 'white',
        border: '1px solid #059669',
      },
    }),

  authError: (message: string = 'Sign In Failed') =>
    toastService.error(message, {
      description: 'Invalid email or password. Please check your credentials and try again.',
      duration: 5000,
    }),

  networkError: (message: string = 'Network Error') =>
    toastService.error(message, {
      description: 'Please check your internet connection and try again.',
      duration: 5000,
    }),

  saveSuccess: (itemName: string = 'Item') =>
    toastService.success('Saved Successfully', {
      description: `${itemName} has been saved successfully.`,
      duration: 3000,
    }),

  deleteSuccess: (itemName: string = 'Item') =>
    toastService.success('Deleted Successfully', {
      description: `${itemName} has been deleted successfully.`,
      duration: 3000,
    }),
} as const;
