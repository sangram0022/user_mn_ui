/**
 * Toast Notification System
 *
 * A comprehensive toast notification system with queue management,
 * auto-dismiss, accessibility support, and multiple variants.
 *
 * Features:
 * - Multiple variants (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Queue management for multiple toasts
 * - Accessibility (ARIA live regions, keyboard dismissal)
 * - Position control
 * - Progress indicator
 * - Action buttons
 * - Smooth animations
 *
 * @example
 * const { toast } = useToast();
 *
 * toast.success('User created successfully');
 * toast.error('Failed to save changes');
 * toast.info('New update available', { duration: 5000 });
 * toast.warning('Unsaved changes', {
 *   action: { label: 'Save', onClick: handleSave }
 * });
 */

import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /**
   * Duration in milliseconds before auto-dismiss
   * Set to 0 or Infinity to disable auto-dismiss
   */
  duration?: number;

  /**
   * Toast variant
   */
  variant?: ToastVariant;

  /**
   * Action button
   */
  action?: ToastAction;

  /**
   * Whether toast can be dismissed manually
   */
  dismissible?: boolean;

  /**
   * Custom icon (overrides default variant icon)
   */
  icon?: ReactNode;

  /**
   * Callback when toast is dismissed
   */
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

export interface ToastContextValue {
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
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access toast notification system
 *
 * Note: Fast refresh warning is expected here as this file exports both
 * a component (ToastProvider) and a hook (useToast) for convenience.
 * This is intentional for better DX.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// ============================================================================
// Toast Provider
// ============================================================================

export interface ToastProviderProps {
  children: ReactNode;
  /**
   * Maximum number of toasts to display
   */
  maxToasts?: number;
  /**
   * Default toast position
   */
  position?: ToastPosition;
  /**
   * Default duration in milliseconds
   */
  defaultDuration?: number;
}

export function ToastProvider({
  children,
  maxToasts = 5,
  position = 'top-right',
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdCounter = useRef(0);

  // React 19 Compiler handles memoization for internal functions
  const generateId = () => {
    toastIdCounter.current += 1;
    return `toast-${toastIdCounter.current}-${Date.now()}`;
  };

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
      // Remove oldest toast if at max capacity
      const updated = prev.length >= maxToasts ? prev.slice(1) : prev;
      return [...updated, newToast];
    });

    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      return prev.filter((t) => t.id !== id);
    });
  };

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

  // Keep useMemo for Context value stabilization (legitimate use case)
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

  const value = useMemo(
    () => ({ toasts, toast, dismiss, dismissAll }),
    [toasts, toast, dismiss, dismissAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// Toast Container
// ============================================================================

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position: ToastPosition;
}

function ToastContainer({ toasts, onDismiss, position }: ToastContainerProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-4 right-4 items-end',
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        fixed z-toast pointer-events-none
        flex flex-col gap-2 max-w-md w-full
        ${positionClasses[position]}
      `.trim()}
      aria-live="polite"
      aria-atomic="true"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ============================================================================
// Toast Item
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0); // Will be initialized in useEffect
  const remainingTimeRef = useRef<number>(toast.duration);

  // Variant styles
  const variantStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      IconComponent: CheckCircle2,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      IconComponent: XCircle,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      IconComponent: AlertCircle,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      IconComponent: Info,
    },
  };

  const styles = variantStyles[toast.variant];
  const IconComponent = styles.IconComponent;

  // React 19 Compiler handles memoization
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // Match animation duration
  };

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
      handleDismiss();
    }
  };

  // Handle auto-dismiss
  useEffect(() => {
    // Initialize start time on mount
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }

    if (toast.duration <= 0 || toast.duration === Infinity) {
      return;
    }

    const startTimer = () => {
      startTimeRef.current = Date.now();
      const interval = 50; // Update progress every 50ms

      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = remainingTimeRef.current - elapsed;
        const newProgress = Math.max(0, (remaining / toast.duration) * 100);

        setProgress(newProgress);

        if (remaining <= 0) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
          }
          handleDismiss();
        }
      }, interval);
    };

    startTimer();

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [toast.duration, toast.id, handleDismiss]);

  return (
    <div
      className={`
        pointer-events-auto
        p-4 rounded-lg border shadow-lg
        ${styles.bg}
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}
        animate-slide-up
      `.trim()}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {toast.icon ?? (
          <IconComponent className={`w-5 h-5 flex-shrink-0 ${styles.icon}`} aria-hidden="true" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toast.message}</p>

          {/* Action Button */}
          {toast.action && (
            <button
              onClick={handleAction}
              className="
                mt-2 text-sm font-medium underline
                text-gray-700 dark:text-gray-300
                hover:text-gray-900 dark:hover:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                transition-colors
              "
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        {toast.dismissible && (
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0 p-1 rounded-md
              text-gray-400 dark:text-gray-500
              hover:text-gray-600 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              transition-colors
            "
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {toast.duration > 0 && toast.duration !== Infinity && (
        <div
          className="
            absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden
          "
          aria-hidden="true"
        >
          <div
            className={`
              progress-bar h-full transition-all duration-50 ease-linear
              ${
                toast.variant === 'success'
                  ? 'bg-green-500'
                  : toast.variant === 'error'
                    ? 'bg-red-500'
                    : toast.variant === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
              }
            `}
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  );
}

// Export everything
export default ToastProvider;
