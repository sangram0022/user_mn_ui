import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { useAuth } from '@features/auth';

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
  maxInactiveTime: 30 * 60 * 1000, // 30 minutes
  warningTime: 5 * 60 * 1000, // 5 minutes before expiry
  checkInterval: 30 * 1000, // check every 30 seconds
};

export const useSessionManagement = (config: Partial<SessionConfig> = {}) => {
  const { user, logout } = useAuth();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [showWarning, setShowWarning]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
  
  const sessionConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  // Initialize session
  const initializeSession = useCallback(() => {
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
  }, [user, sessionConfig.maxInactiveTime]);

  // Update activity
  const updateActivity = useCallback(() => {
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
  }, [sessionData, user, sessionConfig.maxInactiveTime]);

  // Check session validity
  const checkSession = useCallback(() => {
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
  }, [sessionData, user, logout, sessionConfig.warningTime, showWarning]);

  // Extend session
  const extendSession = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  // End session manually
  const endSession = useCallback(() => {
    logout();
    sessionStorage.removeItem('user_session');
    localStorage.removeItem('session_id');
    setSessionData(null);
    setShowWarning(false);
  }, [logout]);

  // Activity listeners
  useEffect(() => {
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity, true);
    });

    return () => {
      activities.forEach(activity => {
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
            setSessionData(parsed);
          } else {
            initializeSession();
          }
        } catch {
          initializeSession();
        }
      } else {
        initializeSession();
      }
    }
  }, [user, sessionData, initializeSession]);

  // Cleanup on user logout
  useEffect(() => {
    if (!user) {
      setSessionData(null);
      setShowWarning(false);
    }
  }, [user]);

  // Calculate remaining time
  const remainingTime = useMemo(() => {
    if (!sessionData) return 0;
    return Math.max(0, sessionData.expiresAt - Date.now());
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
