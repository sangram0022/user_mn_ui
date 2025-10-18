/**
 * Toast Provider - Comprehensive Implementation
 *
 * Provides toast notification system with queue management, animations,
 * and accessibility support.
 */

import {
  ToastContext,
  type Toast,
  type ToastContextType,
  type ToastOptions,
} from '@contexts/ToastContext';
import { ToastContainer } from '@shared/components/ui/ToastContainer';
import type { ReactNode } from 'react';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

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

  // Generate unique ID
  const generateId = useCallback(() => {
    toastIdCounter.current += 1;
    return `toast-${toastIdCounter.current}-${Date.now()}`;
  }, []);

  // Add toast
  const addToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
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
    },
    [defaultDuration, generateId, maxToasts]
  );

  // Dismiss toast
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  // Dismiss all
  const dismissAll = useCallback(() => {
    setToasts((prev) => {
      prev.forEach((toast) => {
        if (toast.onDismiss) {
          toast.onDismiss();
        }
      });
      return [];
    });
  }, []);

  // Toast API
  const toast = useMemo(
    () => ({
      success: (message: string, options?: ToastOptions) =>
        addToast(message, { ...options, variant: 'success' }),
      error: (message: string, options?: ToastOptions) =>
        addToast(message, { ...options, variant: 'error' }),
      warning: (message: string, options?: ToastOptions) =>
        addToast(message, { ...options, variant: 'warning' }),
      info: (message: string, options?: ToastOptions) =>
        addToast(message, { ...options, variant: 'info' }),
      custom: (message: string, options?: ToastOptions) => addToast(message, options),
    }),
    [addToast]
  );

  // Legacy API (backward compatibility)
  const showError = useCallback(
    (message: string) => {
      addToast(message, { variant: 'error' });
    },
    [addToast]
  );

  const showSuccess = useCallback(
    (message: string) => {
      addToast(message, { variant: 'success' });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      addToast(message, { variant: 'info' });
    },
    [addToast]
  );

  const clearToasts = useCallback(() => {
    dismissAll();
  }, [dismissAll]);

  const value: ToastContextType = useMemo(
    () => ({
      toasts,
      toast,
      dismiss,
      dismissAll,
      showError,
      showSuccess,
      showInfo,
      clearToasts,
    }),
    [toasts, toast, dismiss, dismissAll, showError, showSuccess, showInfo, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
