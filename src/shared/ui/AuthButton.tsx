import { Loader } from 'lucide-react';
import React from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface AuthButtonProps {
  type?: 'submit' | 'button';
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  type = 'button',
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onClick,
  children,
  fullWidth = true,
}) => {
  const baseClasses = `
    ${fullWidth ? 'w-full' : 'w-auto'} 
    flex justify-center items-center gap-2 
    px-4 py-3 
    border-none rounded-lg 
    text-sm font-medium 
    transition-all duration-200 
    cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variantClasses = {
    primary: `
      text-white bg-gradient-to-r from-blue-500 to-purple-600
      shadow-sm
      hover:shadow-md hover:-translate-y-0.5
      focus:ring-blue-500
      ${isLoading || disabled ? 'opacity-50 cursor-not-allowed bg-gray-400 bg-none' : ''}
    `,
    secondary: `
      text-gray-700 bg-white border border-gray-300
      shadow-sm
      hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5
      focus:ring-gray-500
      ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `,
  };

  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {isLoading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
