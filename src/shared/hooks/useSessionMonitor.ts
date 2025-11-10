/**
 * Session Monitor Hook
 * 
 * Monitors JWT token expiration and provides:
 * - Automatic session timeout detection
 * - 5-minute warning before expiration
 * - User-friendly timeout dialog
 * - Automatic logout on expiration
 * 
 * @example
 * ```tsx
 * // In App.tsx or AuthProvider
 * useSessionMonitor({
 *   warningMinutes: 5,
 *   onTimeout: () => logout(),
 * });
 * ```
 */

import { useEffect, useRef, useState } from 'react';
import tokenService from '@/domains/auth/services/tokenService';
import { logger } from '@/core/logging';

export interface SessionMonitorOptions {
  /**
   * Minutes before expiration to show warning dialog
   * @default 5
   */
  warningMinutes?: number;
  
  /**
   * Check interval in seconds
   * @default 30
   */
  checkIntervalSeconds?: number;
  
  /**
   * Callback when session expires
   */
  onTimeout: () => void;
  
  /**
   * Enable/disable monitoring
   * @default true
   */
  enabled?: boolean;
}

export interface SessionState {
  /** Whether warning dialog should be shown */
  showWarning: boolean;
  /** Seconds remaining until expiration */
  secondsRemaining: number | null;
  /** Whether session has expired */
  isExpired: boolean;
}

/**
 * Monitor JWT token expiration and show warnings
 */
export function useSessionMonitor({
  warningMinutes = 5,
  checkIntervalSeconds = 30,
  onTimeout,
  enabled = true,
}: SessionMonitorOptions): SessionState {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  
  const timeoutCalledRef = useRef(false);
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const checkSession = () => {
      // Get token expiry time from tokenService
      const expirySeconds = tokenService.getTokenExpiryTime();
      
      // No token or already expired
      if (expirySeconds === null || expirySeconds <= 0) {
        if (!timeoutCalledRef.current) {
          logger().warn('[SessionMonitor] Session expired', {
            expirySeconds,
            hasToken: !!tokenService.getAccessToken(),
          });
          
          setIsExpired(true);
          timeoutCalledRef.current = true;
          onTimeout();
        }
        return;
      }

      setSecondsRemaining(expirySeconds);
      
      // Show warning if within warning threshold
      const warningThresholdSeconds = warningMinutes * 60;
      if (expirySeconds <= warningThresholdSeconds && !warningShownRef.current) {
        logger().info('[SessionMonitor] Showing session timeout warning', {
          secondsRemaining: expirySeconds,
          minutesRemaining: Math.floor(expirySeconds / 60),
        });
        
        setShowWarning(true);
        warningShownRef.current = true;
      }
    };

    // Initial check
    checkSession();

    // Set up periodic checking
    const intervalId = setInterval(checkSession, checkIntervalSeconds * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, warningMinutes, checkIntervalSeconds, onTimeout]);

  return {
    showWarning,
    secondsRemaining,
    isExpired,
  };
}
