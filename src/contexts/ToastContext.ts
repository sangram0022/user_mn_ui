import type { ReactNode } from 'react';
import { createContext } from 'react';

// Toast types
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  variant?: ToastVariant;
  action?: ToastAction;
  dismissible?: boolean;
  icon?: ReactNode;
  onDismiss?: () => void;
}

export interface Toast
  extends Required<Pick<ToastOptions, 'duration' | 'variant' | 'dismissible'>> {
  id: string;
  message: string;
  action?: ToastAction;
  icon?: ReactNode;
  onDismiss?: () => void;
  createdAt: number;
}

export interface ToastContextType {
  toasts: Toast[];
  toast: {
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    warning: (message: string, options?: ToastOptions) => string;
    info: (message: string, options?: ToastOptions) => string;
    custom: (message: string, options?: ToastOptions) => string;
  };
  dismiss: (id: string) => void;
  dismissAll: () => void;

  // Legacy API (for backward compatibility)
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  clearToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
