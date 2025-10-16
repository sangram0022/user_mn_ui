/**
 * Session Management Hook
 *
 * React 19 Migration: All memoization removed - React Compiler handles optimization
 * CRITICAL: This hook manages user session lifecycle - thoroughly test after changes
 */

import { SESSION_TIMEOUT } from '@shared/constants';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import { useAuth } from 'src/domains/auth';

interface SessionData {
  sessionId: string;
  lastActivity: number;
  expiresAt: number;
  isActive: boolean;
}

interface SessionConfig {
  maxInactiveTime: number; // in milliseconds
  warningTime: number; // show warning before expiry
  checkInterval: number; // how often to check session
}

const DEFAULT_CONFIG: SessionConfig = {
  maxInactiveTime: SESSION_TIMEOUT.MAX_INACTIVE_TIME,
  warningTime: SESSION_TIMEOUT.WARNING_TIME,
  checkInterval: SESSION_TIMEOUT.CHECK_INTERVAL,
};

export const useSessionManagement = (config: Partial<SessionConfig> = {}) => {
  const { user, logout } = useAuth();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [showWarning, setShowWarning]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState(false);

  // Convert useMemo to IIFE
  const sessionConfig = (() => ({ ...DEFAULT_CONFIG, ...config }))();

  // Convert all useCallback to plain functions
  const initializeSession = () => {
    if (user) {
      const now = Date.now();
      const session: SessionData = {
        sessionId: `session_${now}_${Math.random().toString(36).substr(2, 9)}`,
        lastActivity: now,
        expiresAt: now + sessionConfig.maxInactiveTime,
        isActive: true,
      };

      setSessionData(session);
      sessionStorage.setItem('user_session', JSON.stringify(session));
      localStorage.setItem('session_id', session.sessionId);
    }
  };

  const updateActivity = () => {
    if (sessionData && user) {
      const now = Date.now();
      const updatedSession: SessionData = {
        ...sessionData,
        lastActivity: now,
        expiresAt: now + sessionConfig.maxInactiveTime,
      };

      setSessionData(updatedSession);
      sessionStorage.setItem('user_session', JSON.stringify(updatedSession));
      setShowWarning(false); // Clear warning on activity
    }
  };

  const checkSession = () => {
    if (!sessionData || !user) return;

    const now = Date.now();
    const timeUntilExpiry = sessionData.expiresAt - now;

    if (timeUntilExpiry <= 0) {
      // Session expired
      logout();
      sessionStorage.removeItem('user_session');
      localStorage.removeItem('session_id');
      setSessionData(null);
      setShowWarning(false);
    } else if (timeUntilExpiry <= sessionConfig.warningTime && !showWarning) {
      // Show warning
      setShowWarning(true);
    }
  };

  const extendSession = () => {
    updateActivity();
  };

  const endSession = () => {
    logout();
    sessionStorage.removeItem('user_session');
    localStorage.removeItem('session_id');
    setSessionData(null);
    setShowWarning(false);
  };

  // Activity listeners
  useEffect(() => {
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      updateActivity();
    };

    activities.forEach((activity) => {
      document.addEventListener(activity, handleActivity, true);
    });

    return () => {
      activities.forEach((activity) => {
        document.removeEventListener(activity, handleActivity, true);
      });
    };
  }, [updateActivity]);

  // Session check interval
  useEffect(() => {
    if (user && sessionData) {
      const interval = setInterval(checkSession, sessionConfig.checkInterval);
      return () => clearInterval(interval);
    }

    // Return undefined when conditions are not met
    return undefined;
  }, [user, sessionData, checkSession, sessionConfig.checkInterval]);

  // Initialize session on user login
  useEffect(() => {
    if (user && !sessionData) {
      // Try to restore from sessionStorage first
      const storedSession = sessionStorage.getItem('user_session');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          if (parsed.expiresAt > Date.now()) {
            // Use setTimeout to avoid synchronous setState in effect
            setTimeout(() => setSessionData(parsed), 0);
          } else {
            setTimeout(() => initializeSession(), 0);
          }
        } catch {
          setTimeout(() => initializeSession(), 0);
        }
      } else {
        setTimeout(() => initializeSession(), 0);
      }
    }
  }, [user, sessionData, initializeSession]);

  // Cleanup on user logout
  useEffect(() => {
    if (!user) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setSessionData(null);
        setShowWarning(false);
      }, 0);
    }
  }, [user]);

  // Calculate remaining time - Use state to avoid calling Date.now() during render
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!sessionData) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setRemainingTime(0), 0);
      return;
    }

    const updateRemainingTime = () => {
      setRemainingTime(Math.max(0, sessionData.expiresAt - Date.now()));
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timer);
  }, [sessionData]);

  return {
    sessionData,
    showWarning,
    remainingTime,
    isActive: !!sessionData?.isActive,
    extendSession,
    endSession,
    updateActivity,
  };
};

export default useSessionManagement;
