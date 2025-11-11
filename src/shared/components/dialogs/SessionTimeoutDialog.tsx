/**
 * Session Timeout Warning Dialog
 * 
 * Shows a warning when the user's session is about to expire.
 * Provides options to extend the session or logout.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components';
import { formatCountdown } from '@/shared/utils/dateFormatters';

export interface SessionTimeoutDialogProps {
  /** Whether dialog is visible */
  isOpen: boolean;
  /** Seconds remaining until timeout */
  secondsRemaining: number | null;
  /** Callback to extend session (e.g., refresh token) */
  onExtend: () => void;
  /** Callback to logout immediately */
  onLogout: () => void;
}

export function SessionTimeoutDialog({
  isOpen,
  secondsRemaining,
  onExtend,
  onLogout,
}: SessionTimeoutDialogProps) {
  const { t } = useTranslation('common');
  const [countdown, setCountdown] = useState(secondsRemaining || 0);

  // Update countdown every second
  useEffect(() => {
    if (!isOpen || secondsRemaining === null) {
      return;
    }

    setCountdown(secondsRemaining);

    const intervalId = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isOpen, secondsRemaining]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div className="relative glass rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4 p-6 animate-scale-in">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-4 shadow-lg">
          <svg 
            className="w-8 h-8 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {t('session.timeoutWarning', 'Session Expiring Soon')}
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">
          {t(
            'session.timeoutMessage',
            'Your session will expire in {{time}}. Would you like to continue?',
            { time: formatCountdown(countdown) }
          )}
        </p>

        {/* Countdown Display */}
        <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {formatCountdown(countdown)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {t('session.remaining', 'remaining')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={onLogout}
            className="flex-1"
            data-testid="session-logout-button"
          >
            {t('session.logout', 'Logout')}
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={onExtend}
            className="flex-1"
            data-testid="session-extend-button"
          >
            {t('session.continue', 'Continue Session')}
          </Button>
        </div>

        {/* Info text */}
        <p className="text-xs text-center text-gray-500 mt-4">
          {t(
            'session.autoLogout',
            'You will be automatically logged out when the timer reaches zero.'
          )}
        </p>
      </div>
    </div>
  );
}
