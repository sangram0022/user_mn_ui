/**
 * Common UI Components
 * 
 * Reusable UI components that follow consistent design patterns.
 * These components reduce duplication and ensure UI consistency.
 */

import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Loading Spinner Component
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  fullScreen = false,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader className={`${sizeMap[size]} animate-spin text-blue-600`} />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Error Alert Component
 */
export interface ErrorAlertProps {
  error: string | Error | null;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onDismiss,
  className = ''
}) => {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={`bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm">Error</p>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 transition-colors"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Success Alert Component
 */
export interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({
  message,
  onDismiss,
  className = ''
}) => {
  if (!message) return null;

  return (
    <div className={`bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm">Success</p>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-600 hover:text-green-800 transition-colors"
            aria-label="Dismiss success message"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Empty State Component
 */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Card Component
 */
export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  headerAction
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

/**
 * Modal Component
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = ''
}) => {
  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className={`relative inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 w-full ${sizeMap[size]} ${className}`}>
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Button Component
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledClasses = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
};
