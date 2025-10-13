import { buttonDisabled, buttonPrimary, buttonSecondary } from '@shared/styles/authStyles';
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
  const [isHovered, setIsHovered] = React.useState(false);

  const getButtonStyle = () => {
    if (isLoading || disabled) return buttonDisabled;
    if (variant === 'secondary') return buttonSecondary;
    return buttonPrimary;
  };

  const baseStyle = getButtonStyle();
  const style = {
    ...baseStyle,
    ...(fullWidth ? {} : { width: 'auto' }),
    ...(isHovered && !isLoading && !disabled
      ? { transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
      : {}),
  };

  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLoading ? (
        <>
          <Loader
            style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }}
          />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
