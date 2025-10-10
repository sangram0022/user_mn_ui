/**
 * Design System Component Primitives
 * Reusable, accessible components following modern design principles
 */

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { designTokens, designUtils } from './tokens';

// Base component props
interface BaseProps { className?: string;
  children?: ReactNode; }

// Button component props and variants
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: keyof typeof designTokens.variants.button;
  size?: keyof typeof designTokens.sizes.button;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean; }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseClass = designTokens.baseClasses.button;
    const variantClass = disabled 
      ? designTokens.variants.button[variant].disabled 
      : designTokens.variants.button[variant].base;
    const sizeClass = designTokens.sizes.button[size];
    const widthClass = fullWidth ? 'w-full' : '';
    const borderRadiusClass = 'rounded-md';
    
    const finalClassName = designUtils.buildClass(
      baseClass,
      variantClass,
      sizeClass,
      widthClass,
      borderRadiusClass,
      className
    );
    
    return (
      <button
        ref={ref}
        className={finalClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Input component props and variants
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { variant?: 'default';
  inputSize?: keyof typeof designTokens.sizes.input;
  error?: boolean;
  success?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label?: string;
  helperText?: string;
  errorText?: string; }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant: _variant = 'default',
    inputSize = 'md',
    error = false,
    success = false,
    leftIcon,
    rightIcon,
    label,
    helperText,
    errorText,
    className,
    disabled,
    ...props
  }, ref) => { const baseClass = designTokens.baseClasses.input;
    const sizeClass = designTokens.sizes.input[inputSize];
    
    let variantClass: string;
    if (disabled) {
      variantClass = designTokens.variants.input.default.disabled;
    } else if (error) { variantClass = designTokens.variants.input.default.error;
    } else if (success) { variantClass = designTokens.variants.input.default.success;
    } else { variantClass = designTokens.variants.input.default.base;
    }
    
    const hasIcons = leftIcon || rightIcon;
    const paddingClass = hasIcons ? (leftIcon ? 'pl-10' : 'pr-10') : '';
    
    const finalClassName = designUtils.buildClass(
      baseClass,
      variantClass,
      sizeClass,
      paddingClass,
      className
    );
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-secondary-400 sm:text-sm">{leftIcon}</span>
            </div>
          )}
          <input
            ref={ref}
            className={finalClassName}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-secondary-400 sm:text-sm">{rightIcon}</span>
            </div>
          )}
        </div>
        {(helperText || errorText) && (
          <p className={`mt-1 text-sm ${error ? 'text-error-600' : 'text-secondary-500'}`}>
            {error ? errorText : helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Card component
export interface CardProps extends BaseProps { padding?: keyof typeof designTokens.spacing;
  hover?: boolean;
  border?: boolean; }

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = '6', hover = false, border = true, className, children, ...props }, ref) => {
    const baseClass = designTokens.baseClasses.card;
    const paddingClass = `p-${padding}`;
    const hoverClass = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
    const borderClass = border ? '' : 'border-0';
    
    const finalClassName = designUtils.buildClass(
      baseClass,
      paddingClass,
      hoverClass,
      borderClass,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Alert component
export interface AlertProps extends BaseProps { variant?: keyof typeof designTokens.variants.alert;
  icon?: ReactNode;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void; }

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', 
    icon, 
    title, 
    dismissible = false, 
    onDismiss, 
    className, 
    children, 
    ...props 
  }, ref) => {
    const baseClass = 'border rounded-md p-4';
    const variantClass = designTokens.variants.alert[variant].base;
    const iconColorClass = designTokens.variants.alert[variant].icon;
    
    const finalClassName = designUtils.buildClass(
      baseClass,
      variantClass,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        <div className="flex">
          {icon && (
            <div className="flex-shrink-0">
              <span className={iconColorClass}>{icon}</span>
            </div>
          )}
          <div className={icon ? 'ml-3' : ''}>
            {title && (
              <h3 className="text-sm font-medium mb-1">{title}</h3>
            )}
            <div className="text-sm">{children}</div>
          </div>
          {dismissible && (
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  onClick={onDismiss}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

// Badge component
export interface BadgeProps extends BaseProps { variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean; }

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', size = 'md', dot = false, className, children, ...props }, ref) => { const baseClass = 'inline-flex items-center font-medium rounded-full';
    
    const variantClasses = {
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-secondary-100 text-secondary-800',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      error: 'bg-error-100 text-error-800'
    };
    
    const sizeClasses = { sm: dot ? 'w-2 h-2' : 'px-2.5 py-0.5 text-xs',
      md: dot ? 'w-2.5 h-2.5' : 'px-3 py-0.5 text-sm',
      lg: dot ? 'w-3 h-3' : 'px-3 py-1 text-sm'
    };
    
    const finalClassName = designUtils.buildClass(
      baseClass,
      variantClasses[variant],
      sizeClasses[size],
      className
    );
    
    return (
      <span ref={ref} className={finalClassName} {...props}>
        {!dot && children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Modal component
export interface ModalProps extends BaseProps { isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean; }

export const Modal: React.FC<ModalProps> = ({ isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  children }) => { if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  const handleOverlayClick = (e: React.MouseEvent) => { if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <div 
      className={designTokens.baseClasses.modal} 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label="Close modal"
      tabIndex={0}
    >
      <div className="flex items-center justify-center min-h-full p-4">
        <div className={designTokens.baseClasses.overlay} />
        <div 
          className={designUtils.buildClass(
            'relative bg-white rounded-lg shadow-xl w-full',
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              {title && (
                <h3 id="modal-title" className="text-lg font-medium text-secondary-900">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className="text-secondary-400 hover:text-secondary-500 focus:outline-none focus:text-secondary-500 transition-colors duration-200"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Spinner component
export interface SpinnerProps extends BaseProps { size?: keyof typeof designTokens.sizes.icon;
  color?: string; }

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'text-primary-500', className, ...props }, ref) => {
    const sizeClass = designTokens.sizes.icon[size];
    
    const finalClassName = designUtils.buildClass(
      'animate-spin',
      sizeClass,
      color,
      className
    );
    
    return (
      <div ref={ref} className={finalClassName} {...props}>
        <svg fill="none" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';