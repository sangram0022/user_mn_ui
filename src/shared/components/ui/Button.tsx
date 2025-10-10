/**
 * Generic Button Component with comprehensive TypeScript support
 */
import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { ComponentSize, ComponentVariant } from '@shared/types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ComponentVariant;
  size?: ComponentSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: React.ElementType;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      as: Component = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded-md',
      'transition-colors duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ];

    const variantClasses = {
      primary: [
        'bg-indigo-600 text-white',
        'hover:bg-indigo-700 focus:ring-indigo-500',
        'disabled:hover:bg-indigo-600',
      ],
      secondary: [
        'bg-gray-100 text-gray-900 border border-gray-300',
        'hover:bg-gray-200 focus:ring-gray-500',
        'disabled:hover:bg-gray-100',
      ],
      success: [
        'bg-green-600 text-white',
        'hover:bg-green-700 focus:ring-green-500',
        'disabled:hover:bg-green-600',
      ],
      warning: [
        'bg-yellow-600 text-white',
        'hover:bg-yellow-700 focus:ring-yellow-500',
        'disabled:hover:bg-yellow-600',
      ],
      error: [
        'bg-red-600 text-white',
        'hover:bg-red-700 focus:ring-red-500',
        'disabled:hover:bg-red-600',
      ],
      info: [
        'bg-blue-600 text-white',
        'hover:bg-blue-700 focus:ring-blue-500',
        'disabled:hover:bg-blue-600',
      ],
    };

    const sizeClasses = {
      small: ['px-3 py-1.5 text-sm'],
      medium: ['px-4 py-2 text-sm'],
      large: ['px-6 py-3 text-base'],
    };

    const widthClasses = fullWidth ? ['w-full'] : [];

    const classes = [
      ...baseClasses,
      ...variantClasses[variant],
      ...sizeClasses[size],
      ...widthClasses,
      className,
    ].join(' ');

    const isDisabled = disabled || loading;

    return (
      <Component
        ref={ref}
        className={classes}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;