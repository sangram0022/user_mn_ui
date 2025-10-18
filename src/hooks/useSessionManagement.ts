/**
 * Session Management Hook
 *
 * React 19 Migration: All memoization removed - React Compiler handles optimization
 * CRITICAL: This hook manages user session lifecycle - thoroughly test after changes
 *
 * StrictMode Compatible: Uses refs to prevent duplicate listeners and timers
 */

import { SESSION } from '@shared/config/constants';
import type { Dispatch, SetStateAction } from 'react';
import { startTransition, useEffect, useRef, useState } from 'react';

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
  maxInactiveTime: SESSION.MAX_INACTIVE_TIME,
  warningTime: SESSION.WARNING_TIME,
  checkInterval: SESSION.CHECK_INTERVAL,
};

export const useSessionManagement = (config: Partial<SessionConfig> = {}) => {
  const { user, logout } = useAuth();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [showWarning, setShowWarning]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Refs to prevent duplicate setup in StrictMode
  const activityListenersSetupRef = useRef(false);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  // Convert useMemo to IIFE
  const sessionConfig = (() => ({ ...DEFAULT_CONFIG, ...config }))();

  // Stable refs for callbacks to avoid dependency issues
  const sessionDataRef = useRef(sessionData);
  const userRef = useRef(user);
  const showWarningRef = useRef(showWarning);

  // Keep refs synchronized
  useEffect(() => {
    sessionDataRef.current = sessionData;
    userRef.current = user;
    showWarningRef.current = showWarning;
  });

  // Convert all useCallback to plain functions with stable references
  const initializeSession = () => {
    if (userRef.current) {
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
    const currentSessionData = sessionDataRef.current;
    const currentUser = userRef.current;

    if (currentSessionData && currentUser) {
      const now = Date.now();
      const updatedSession: SessionData = {
        ...currentSessionData,
        lastActivity: now,
        expiresAt: now + sessionConfig.maxInactiveTime,
      };

      setSessionData(updatedSession);
      sessionStorage.setItem('user_session', JSON.stringify(updatedSession));
      setShowWarning(false); // Clear warning on activity
    }
  };

  const checkSession = () => {
    const currentSessionData = sessionDataRef.current;
    const currentUser = userRef.current;
    const currentShowWarning = showWarningRef.current;

    if (!currentSessionData || !currentUser) return;

    const now = Date.now();
    const timeUntilExpiry = currentSessionData.expiresAt - now;

    if (timeUntilExpiry <= 0) {
      // Session expired
      logout();
      sessionStorage.removeItem('user_session');
      localStorage.removeItem('session_id');
      setSessionData(null);
      setShowWarning(false);
    } else if (timeUntilExpiry <= sessionConfig.warningTime && !currentShowWarning) {
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

  // ✅ FIX 1: Activity listeners - prevent duplicates with ref guard
  useEffect(() => {
    // Prevent duplicate setup in StrictMode
    if (activityListenersSetupRef.current) return;
    activityListenersSetupRef.current = true;

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      updateActivity();
    };

    // Use passive listeners for better performance
    activities.forEach((activity) => {
      document.addEventListener(activity, handleActivity, { passive: true, capture: true });
    });

    return () => {
      // βœ… StrictMode Fix: Don't reset ref - keep it true to prevent re-setup
      // The ref staying true ensures listeners are only added once, even with StrictMode double-mount
      activities.forEach((activity) => {
        document.removeEventListener(activity, handleActivity, { capture: true });
      });
    };
  }, []); // Empty deps - only setup once

  // ✅ FIX 2: Session check interval - prevent duplicate timers
  useEffect(() => {
    // Clear any existing timer
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    // Only start timer if we have both user and session data
    if (!user || !sessionData) {
      return;
    }

    // Prevent duplicate timers
    if (sessionTimerRef.current) return;

    sessionTimerRef.current = setInterval(checkSession, sessionConfig.checkInterval);

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    };
  }, [user, sessionData]); // Minimal deps

  // ✅ FIX 3: Initialize session - use startTransition instead of setTimeout(0)
  useEffect(() => {
    // Prevent duplicate initialization in StrictMode
    if (hasInitializedRef.current || !user || sessionData) return;
    hasInitializedRef.current = true;

    // Try to restore from sessionStorage first
    const storedSession = sessionStorage.getItem('user_session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed.expiresAt > Date.now()) {
          // Use startTransition for non-urgent updates (React 19 way)
          startTransition(() => setSessionData(parsed));
        } else {
          startTransition(() => initializeSession());
        }
      } catch {
        startTransition(() => initializeSession());
      }
    } else {
      startTransition(() => initializeSession());
    }

    return () => {
      // βœ… StrictMode Fix: Don't reset ref - keep it true to prevent re-initialization
      // hasInitializedRef.current = false; // Removed
    };
  }, [user, sessionData]);

  // ✅ FIX 4: Cleanup on user logout - use startTransition
  useEffect(() => {
    if (!user && sessionData) {
      // Use startTransition for non-urgent updates
      startTransition(() => {
        setSessionData(null);
        setShowWarning(false);
      });
    }
  }, [user, sessionData]);

  // ✅ FIX 5: Remaining time calculation - prevent duplicate timers
  useEffect(() => {
    // Clear any existing timer
    if (remainingTimeTimerRef.current) {
      clearInterval(remainingTimeTimerRef.current);
      remainingTimeTimerRef.current = null;
    }

    if (!sessionData) {
      startTransition(() => setRemainingTime(0));
      return;
    }

    const updateRemainingTime = () => {
      const remaining = Math.max(0, sessionData.expiresAt - Date.now());
      setRemainingTime(remaining);
    };

    updateRemainingTime();
    remainingTimeTimerRef.current = setInterval(updateRemainingTime, 1000);

    return () => {
      if (remainingTimeTimerRef.current) {
        clearInterval(remainingTimeTimerRef.current);
        remainingTimeTimerRef.current = null;
      }
    };
  }, [sessionData]);

  return {
    sessionData,
    showWarning,
    remainingTime,
    isActive: Boolean(sessionData?.isActive),
    extendSession,
    endSession,
    updateActivity,
  };
};

export default useSessionManagement;
