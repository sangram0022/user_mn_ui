/**
 * Toast Provider - React 19 Optimized
 *
 * ✅ React 19 Features:
 * - Removed all useMemo/useCallback (React Compiler handles it)
 * - Zero manual optimization needed
 * - Cleaner, more maintainable code
 */

import {
  ToastContext,
  type Toast,
  type ToastContextType,
  type ToastOptions,
} from '@contexts/ToastContext';
import { ToastContainer } from '@shared/components/ui/ToastContainer';
import type React from 'react';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  position = 'top-right',
  defaultDuration = 5000,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdCounter = useRef(0);

  // ✅ React 19: Generate unique ID (no useCallback needed)
  const generateId = () => {
    toastIdCounter.current += 1;
    return `toast-${toastIdCounter.current}-${Date.now()}`;
  };

  // ✅ React 19: Add toast (no useCallback needed)
  const addToast = (message: string, options: ToastOptions = {}) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      message,
      variant: options.variant ?? 'info',
      duration: options.duration ?? defaultDuration,
      dismissible: options.dismissible ?? true,
      action: options.action,
      icon: options.icon,
      onDismiss: options.onDismiss,
      createdAt: Date.now(),
    };

    setToasts((prev) => {
      const updated = prev.length >= maxToasts ? prev.slice(1) : prev;
      return [...updated, newToast];
    });

    return id;
  };

  // ✅ React 19: Dismiss toast (no useCallback needed)
  const dismiss = (id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  // ✅ React 19: Dismiss all (no useCallback needed)
  const dismissAll = () => {
    setToasts((prev) => {
      prev.forEach((toast) => {
        if (toast.onDismiss) {
          toast.onDismiss();
        }
      });
      return [];
    });
  };

  // ✅ React 19: Toast API (no useMemo needed)
  const toast = {
    success: (message: string, options?: ToastOptions) =>
      addToast(message, { ...options, variant: 'success' }),
    error: (message: string, options?: ToastOptions) =>
      addToast(message, { ...options, variant: 'error' }),
    warning: (message: string, options?: ToastOptions) =>
      addToast(message, { ...options, variant: 'warning' }),
    info: (message: string, options?: ToastOptions) =>
      addToast(message, { ...options, variant: 'info' }),
    custom: (message: string, options?: ToastOptions) => addToast(message, options),
  };

  // ✅ React 19: Legacy API (no useCallback needed)
  const showError = (message: string) => {
    addToast(message, { variant: 'error' });
  };

  const showSuccess = (message: string) => {
    addToast(message, { variant: 'success' });
  };

  const showInfo = (message: string) => {
    addToast(message, { variant: 'info' });
  };

  const clearToasts = () => {
    dismissAll();
  };

  // ✅ React 19: Context value (no useMemo needed - React Compiler optimizes)
  const value: ToastContextType = {
    toasts,
    toast,
    dismiss,
    dismissAll,
    showError,
    showSuccess,
    showInfo,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
