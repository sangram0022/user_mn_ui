/**
 * ErrorAlert Component
 * 
 * Reusable component for displaying error messages consistently across the application.
 * Supports different variants and auto-dismiss functionality.
 * 
 * @example
 * ```tsx
 * <ErrorAlert 
 *   message="Login failed. Please try again." 
 *   title="Authentication Error"
 *   variant="danger"
 * />
 * ```
 */

import { type ReactNode } from 'react';

export interface ErrorAlertProps {
  /** Error message to display */
  message: string;
  
  /** Optional title for the error */
  title?: string;
  
  /** Visual variant */
  variant?: 'danger' | 'warning' | 'info';
  
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
  
  /** Custom icon (optional) */
  icon?: ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Test ID for testing */
  testId?: string;
}

const variantStyles = {
  danger: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-700',
    button: 'text-red-800 hover:text-red-900',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    button: 'text-yellow-800 hover:text-yellow-900',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    message: 'text-blue-700',
    button: 'text-blue-800 hover:text-blue-900',
  },
};

const defaultIcons = {
  danger: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function ErrorAlert({
  message,
  title,
  variant = 'danger',
  action,
  onDismiss,
  icon,
  className = '',
  testId = 'error-alert',
}: ErrorAlertProps) {
  const styles = variantStyles[variant];
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div
      className={`border rounded-lg p-4 animate-slide-down ${styles.container} ${className}`}
      role="alert"
      data-testid={testId}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`mt-0.5 shrink-0 ${styles.icon}`}>
          {displayIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold mb-1 ${styles.title}`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${styles.message}`}>
            {message}
          </p>
          
          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium underline ${styles.button}`}
              type="button"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
