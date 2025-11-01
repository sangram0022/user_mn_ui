// ========================================
// SessionExpiry Component
// Session timeout warning with countdown
// ========================================

import { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { useRefreshToken } from '../hooks/useRefreshToken';
import { getTokenExpiryTime, getRefreshToken } from '../services/tokenService';

interface SessionExpiryProps {
  warningThreshold?: number; // seconds before expiry to show warning
  onSessionExpired?: () => void;
  onSessionRefreshed?: () => void;
}

/**
 * SessionExpiry Component
 * Shows warning when session is about to expire
 */
export function SessionExpiry({
  warningThreshold = 300, // 5 minutes
  onSessionExpired,
  onSessionRefreshed,
}: SessionExpiryProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const refreshMutation = useRefreshToken({
    onSuccess: () => {
      setShowWarning(false);
      onSessionRefreshed?.();
    },
  });

  useEffect(() => {
    const checkTokenExpiry = () => {
      const expiryTime = getTokenExpiryTime();
      
      if (!expiryTime) {
        setTimeRemaining(null);
        setShowWarning(false);
        return;
      }

      const now = Date.now();
      const remaining = Math.floor((expiryTime - now) / 1000); // seconds

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        // Session expired
        setShowWarning(false);
        onSessionExpired?.();
      } else if (remaining <= warningThreshold) {
        // Show warning
        setShowWarning(true);
      } else {
        // Hide warning
        setShowWarning(false);
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every second
    const interval = setInterval(checkTokenExpiry, 1000);

    return () => clearInterval(interval);
  }, [warningThreshold, onSessionExpired]);

  const handleRefreshSession = () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      refreshMutation.mutate(refreshToken);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning || timeRemaining === null || timeRemaining <= 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-yellow-400 dark:text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Session Expiring Soon
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              Your session will expire in{' '}
              <span className="font-bold">{formatTime(timeRemaining)}</span>
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleRefreshSession}
                disabled={refreshMutation.isPending}
                variant="primary"
                className="text-sm"
              >
                {refreshMutation.isPending ? 'Refreshing...' : 'Stay Logged In'}
              </Button>
              <Button
                onClick={() => setShowWarning(false)}
                variant="outline"
                className="text-sm"
              >
                Dismiss
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowWarning(false)}
            className="ml-3 flex-shrink-0 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
          <div
            className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full transition-all duration-1000"
            style={{
              width: `${Math.max(0, (timeRemaining / warningThreshold) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SessionExpiry;
