import {
  toastService,
  ToastPresets,
  type ToastOptions,
  type ToastType,
} from '@/services/toast.service';

export function useToast() {
  return {
    toast: toastService,
    presets: ToastPresets,
  } as const;
}

export type { ToastOptions, ToastType };
