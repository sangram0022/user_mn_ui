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
    <div className="mx-auto w-full max-w-md text-center">
      <div className="mx-auto mb-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
      <p className="mt-4 text-gray-600">{message}</p>
      {countdown !== null && countdown !== undefined && (
        <p className="mt-2 text-sm text-blue-500">
          Redirecting in {countdown} second{countdown === 1 ? '' : 's'}...
        </p>
      )}
      {onButtonClick && (
        <div className="mt-6">
          <AuthButton type="button" variant="primary" onClick={onButtonClick} fullWidth={false}>
            <LogIn className="h-4 w-4" />
            {buttonText}
          </AuthButton>
        </div>
      )}
    </div>
  );
};
