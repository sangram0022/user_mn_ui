import { cn } from '@shared/utils';
import { Loader } from 'lucide-react';
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const buttonVariants = {
  primary: `
    bg-gradient-to-r from-blue-500 to-purple-600 text-white 
    hover:from-blue-600 hover:to-purple-700 
    focus:from-blue-600 focus:to-purple-700
    shadow-sm hover:shadow-lg hover:shadow-blue-500/40
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `,
  secondary: `
    bg-white text-gray-700 border border-gray-300
    hover:bg-gray-50 hover:border-gray-400
    focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    shadow-sm hover:shadow-md
  `,
  outline: `
    bg-transparent text-blue-600 border border-blue-600
    hover:bg-blue-50 hover:border-blue-700
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `,
  danger: `
    bg-red-600 text-white border border-red-600
    hover:bg-red-700 hover:border-red-700
    focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    shadow-sm hover:shadow-md
  `,
  success: `
    bg-green-600 text-white border border-green-600
    hover:bg-green-700 hover:border-green-700
    focus:ring-2 focus:ring-green-500 focus:ring-offset-2
    shadow-sm hover:shadow-md
  `,
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-xs font-medium',
  md: 'px-4 py-2.5 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-semibold',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled = false,
  children,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    border-none rounded-lg
    transition-all duration-200
    cursor-pointer
    focus:outline-none
    disabled:cursor-not-allowed disabled:opacity-50
    hover:-translate-y-0.5 active:translate-y-0
    disabled:hover:translate-y-0
  `;

  const classes = cn(
    baseClasses,
    buttonVariants[variant],
    buttonSizes[size],
    fullWidth && 'w-full',
    (isLoading || disabled) && 'hover:shadow-sm hover:translate-y-0',
    className
  );

  return (
    <button disabled={isLoading || disabled} className={classes} {...props}>
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};
