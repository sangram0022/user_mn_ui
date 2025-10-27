/**
 * Toast Notification System - Modern React 19 Implementation
 *
 * Features:
 * - React 19 memo optimization for all components
 * - Modern slide animations with GPU acceleration
 * - OKLCH color space for better contrast
 * - Enhanced glassmorphism effects
 * - Smooth progress bar with modern CSS
 * - Container queries support
 * - Modern shadows with elevation
 *
 * A comprehensive toast notification system with queue management,
 * auto-dismiss, accessibility support, and multiple variants.
 *
 * Core Features:
 * - Multiple variants (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Queue management for multiple toasts
 * - Accessibility (ARIA live regions, keyboard dismissal)
 * - Position control
 * - Progress indicator
 * - Action buttons
 * - Smooth animations
 *
 * @since 2024-2025 Modernization Phase 2
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
import { createContext, memo, use, useEffect, useMemo, useRef, useState } from 'react';

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
 * React 19: Uses use() hook for cleaner API
 *
 * Note: Fast refresh warning is expected here as this file exports both
 * a component (ToastProvider) and a hook (useToast) for convenience.
 * This is intentional for better DX.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = use(ToastContext);
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

const ToastContainerComponent = ({ toasts, onDismiss, position }: ToastContainerProps) => {
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
        flex flex-col gap-3 max-w-md w-full
        gpu-accelerated
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
};

ToastContainerComponent.displayName = 'ToastContainer';

/**
 * Memoized ToastContainer component
 * Uses React 19 memo for optimal performance
 */
const ToastContainer = memo(ToastContainerComponent);

// ============================================================================
// Toast Item
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItemComponent = ({ toast, onDismiss }: ToastItemProps) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0); // Will be initialized in useEffect
  const remainingTimeRef = useRef<number>(toast.duration);

  // Modern variant styles with OKLCH colors and GPU acceleration
  const variantStyles = {
    success: {
      bg: 'bg-success-light dark:bg-success/20 border-success shadow-modern hover:shadow-lg',
      icon: 'text-success',
      IconComponent: CheckCircle2,
    },
    error: {
      bg: 'bg-error-light dark:bg-error/20 border-error shadow-modern hover:shadow-lg',
      icon: 'text-error',
      IconComponent: XCircle,
    },
    warning: {
      bg: 'bg-warning-light dark:bg-warning/20 border-warning shadow-modern hover:shadow-lg',
      icon: 'text-warning',
      IconComponent: AlertCircle,
    },
    info: {
      bg: 'bg-primary-light dark:bg-primary/20 border-primary shadow-modern hover:shadow-lg',
      icon: 'text-primary',
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
        p-4 rounded-xl border-2 
        ${styles.bg}
        transition-all duration-300 ease-out
        gpu-accelerated will-change-transform
        ${isExiting ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}
        animate-fade-in animate-slide-in-right
      `.trim()}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Icon with modern styling */}
        {toast.icon ?? (
          <IconComponent
            className={`icon-md flex-shrink-0 ${styles.icon} transition-transform duration-200 hover:scale-110`}
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{toast.message}</p>

          {/* Action Button with modern styling */}
          {toast.action && (
            <button
              onClick={handleAction}
              className="
                mt-2 text-sm font-semibold underline
                text-text-primary hover:text-primary-600
                focus-ring gpu-accelerated
                transition-all duration-200
                hover:translate-x-1
              "
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss Button with modern hover effect */}
        {toast.dismissible && (
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0 p-1.5 rounded-lg
              text-text-tertiary hover:text-text-primary
              hover:bg-surface-secondary
              focus-ring gpu-accelerated
              transition-all duration-200
              hover:scale-110
            "
            aria-label="Dismiss notification"
          >
            <X className="icon-sm" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Modern Progress Bar */}
      {toast.duration > 0 && toast.duration !== Infinity && (
        <div
          className="
            absolute bottom-0 left-0 right-0 h-1 bg-border-primary/30 rounded-b-xl overflow-hidden
          "
          aria-hidden="true"
        >
          <div
            className={`
              h-full transition-all duration-50 ease-linear gpu-accelerated
              ${
                toast.variant === 'success'
                  ? 'bg-success'
                  : toast.variant === 'error'
                    ? 'bg-error'
                    : toast.variant === 'warning'
                      ? 'bg-warning'
                      : 'bg-primary'
              }
            `}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

ToastItemComponent.displayName = 'ToastItem';

/**
 * Memoized ToastItem component
 * Uses React 19 memo for optimal performance
 */
const ToastItem = memo(ToastItemComponent);

// Export everything
export default ToastProvider;
