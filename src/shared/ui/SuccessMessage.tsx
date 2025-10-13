import {
  authContainer,
  centeredText,
  heading,
  iconContainerSuccess,
  iconStyle,
} from '@shared/styles/authStyles';
import { CheckCircle, LogIn } from 'lucide-react';
import React from 'react';
import { AuthButton } from './AuthButton';

interface SuccessMessageProps {
  title: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
  countdown?: number | null;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  message,
  buttonText = 'Continue',
  onButtonClick,
  countdown,
}) => {
  return (
    <div style={{ ...authContainer, ...centeredText }}>
      <div style={iconContainerSuccess}>
        <CheckCircle style={iconStyle} />
      </div>
      <h2 style={heading}>{title}</h2>
      <p style={{ marginTop: '1rem', color: '#6b7280' }}>{message}</p>
      {countdown !== null && countdown !== undefined && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#3b82f6' }}>
          Redirecting in {countdown} second{countdown === 1 ? '' : 's'}...
        </p>
      )}
      {onButtonClick && (
        <div style={{ marginTop: '1.5rem' }}>
          <AuthButton type="button" variant="primary" onClick={onButtonClick} fullWidth={false}>
            <LogIn style={{ height: '1rem', width: '1rem' }} />
            {buttonText}
          </AuthButton>
        </div>
      )}
    </div>
  );
};
