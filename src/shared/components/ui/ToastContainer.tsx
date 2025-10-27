/**
 * Toast Container Component
 *
 * Displays and manages toast notifications with animations and positioning.
 */

import type { Toast, ToastVariant } from '@contexts/ToastContext';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position: ToastPosition;
}

export function ToastContainer({ toasts, onDismiss, position }: ToastContainerProps) {
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
// Toast Item Component
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
  const variantStyles: Record<
    ToastVariant,
    { bg: string; icon: string; IconComponent: React.FC<{ className?: string }> }
  > = {
    success: {
      bg: 'bg-[var(--color-success-light)] dark:bg-[var(--color-success)]/20 border-[var(--color-success)] dark:border-[var(--color-success)]',
      icon: 'text-[var(--color-success)] dark:text-[var(--color-success)]',
      IconComponent: CheckCircle2,
    },
    error: {
      bg: 'bg-[var(--color-error-light)] dark:bg-[var(--color-error)]/20 border-[var(--color-error)] dark:border-[var(--color-error)]',
      icon: 'text-[var(--color-error)] dark:text-[var(--color-error)]',
      IconComponent: XCircle,
    },
    warning: {
      bg: 'bg-[var(--color-warning-light)] dark:bg-[var(--color-warning)]/20 border-[var(--color-warning)] dark:border-[var(--color-warning)]',
      icon: 'text-[var(--color-warning)] dark:text-[var(--color-warning)]',
      IconComponent: AlertCircle,
    },
    info: {
      bg: 'bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/20 border-[var(--color-primary)] dark:border-[var(--color-primary)]',
      icon: 'text-[var(--color-primary)] dark:text-[var(--color-primary)]',
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
        pointer-events-auto relative
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
          <IconComponent className={`icon-md flex-shrink-0 ${styles.icon}`} aria-hidden="true" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-inverse)]">
            {toast.message}
          </p>

          {/* Action Button */}
          {toast.action && (
            <button
              onClick={handleAction}
              className="
                mt-2 text-sm font-medium underline
                text-[color:var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]
                hover:text-[color:var(--color-text-primary)] dark:hover:text-[color:var(--color-text-inverse)]
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
              text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]
              hover:text-[var(--color-text-secondary)] dark:hover:text-[var(--color-text-tertiary)]
              hover:bg-[var(--color-surface-secondary)] dark:hover:bg-[var(--color-surface-primary)]
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              transition-colors
            "
            aria-label="Dismiss notification"
          >
            <X className="icon-sm" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {toast.duration > 0 && toast.duration !== Infinity && (
        <div
          className="
            progress-bar-container absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-border)] dark:bg-[color:var(--color-background-elevated)] rounded-b-lg overflow-hidden
          "
          aria-hidden="true"
        >
          <div
            className={`
              toast-progress-bar h-full transition-all duration-50 ease-linear
              ${
                toast.variant === 'success'
                  ? 'bg-[var(--color-success)]'
                  : toast.variant === 'error'
                    ? 'bg-[var(--color-error)]'
                    : toast.variant === 'warning'
                      ? 'bg-[var(--color-warning)]'
                      : 'bg-[var(--color-primary)]'
              }
            `}
            data-progress={progress}
          />
        </div>
      )}
    </div>
  );
}

export default ToastContainer;
