/**
 * Session Management Hook Tests
 *
 * Comprehensive test suite for useSessionManagement hook covering:
 * - Session initialization and restoration
 * - Activity tracking across multiple event types
 * - Session state validation
 * - Manual session control
 * - Edge cases and error handling
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSessionManagement } from '../useSessionManagement';

// Mock useAuth hook
vi.mock('@domains/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user123', email: 'test@example.com' },
    logout: vi.fn(),
  })),
}));

describe('useSessionManagement Hook', () => {
  beforeEach(() => {
    // Clear sessionStorage and localStorage before each test
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ============================================
  // SESSION INITIALIZATION TESTS
  // ============================================

  describe('Session Initialization', () => {
    it('should initialize session on user login', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.sessionData?.sessionId).toBeDefined();
      expect(result.current.sessionData?.isActive).toBe(true);
      expect(result.current.isActive).toBe(true);
    });

    it('should store session in sessionStorage on initialization', () => {
      renderHook(() => useSessionManagement());

      const storedSession = sessionStorage.getItem('user_session');
      expect(storedSession).toBeDefined();

      const parsed = JSON.parse(storedSession!);
      expect(parsed).toHaveProperty('sessionId');
      expect(parsed).toHaveProperty('lastActivity');
      expect(parsed).toHaveProperty('expiresAt');
      expect(parsed).toHaveProperty('isActive', true);
    });

    it('should restore session from sessionStorage if valid', () => {
      // Pre-populate sessionStorage with a valid session
      const mockSession = {
        sessionId: 'mock-session-123',
        lastActivity: Date.now(),
        expiresAt: Date.now() + 60000,
        isActive: true,
      };
      sessionStorage.setItem('user_session', JSON.stringify(mockSession));

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessionData?.sessionId).toBe('mock-session-123');
      expect(result.current.isActive).toBe(true);
    });

    it('should initialize new session if stored session is expired', () => {
      // Pre-populate with expired session
      const expiredSession = {
        sessionId: 'expired-session',
        lastActivity: Date.now() - 60000,
        expiresAt: Date.now() - 1000,
        isActive: true,
      };
      sessionStorage.setItem('user_session', JSON.stringify(expiredSession));

      const { result } = renderHook(() => useSessionManagement());

      // Should create new session instead of restoring expired one
      expect(result.current.sessionData?.sessionId).not.toBe('expired-session');
      expect(result.current.sessionData?.isActive).toBe(true);
    });

    it('should use custom config parameters', () => {
      const customConfig = {
        maxInactiveTime: 15 * 60 * 1000,
        warningTime: 3 * 60 * 1000,
        checkInterval: 60 * 1000,
      };

      const { result } = renderHook(() => useSessionManagement(customConfig));

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.isActive).toBe(true);
    });
  });

  // ============================================
  // ACTIVITY TRACKING TESTS
  // ============================================

  describe('Activity Tracking', () => {
    it('should handle mouse movement event', async () => {
      const { result } = renderHook(() => useSessionManagement());

      const initialLastActivity = result.current.sessionData?.lastActivity;

      await act(async () => {
        document.dispatchEvent(new MouseEvent('mousemove'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.sessionData?.lastActivity).toBeDefined();
      expect(initialLastActivity).toBeDefined();
    });

    it('should handle keyboard input', async () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessionData?.lastActivity).toBeDefined();

      await act(async () => {
        document.dispatchEvent(new KeyboardEvent('keypress'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should handle scroll events', async () => {
      const { result } = renderHook(() => useSessionManagement());

      const isActiveBefore = result.current.isActive;

      await act(async () => {
        document.dispatchEvent(new Event('scroll'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.isActive).toBe(isActiveBefore);
    });

    it('should handle touch events', async () => {
      const { result } = renderHook(() => useSessionManagement());

      await act(async () => {
        document.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should handle click events', async () => {
      const { result } = renderHook(() => useSessionManagement());

      await act(async () => {
        document.dispatchEvent(new MouseEvent('click'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should handle multiple rapid activity events', async () => {
      const { result } = renderHook(() => useSessionManagement());

      await act(async () => {
        for (let i = 0; i < 10; i++) {
          document.dispatchEvent(new MouseEvent('mousemove'));
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.isActive).toBe(true);
    });
  });

  // ============================================
  // SESSION STATE TESTS
  // ============================================

  describe('Session State', () => {
    it('should track remaining time as a number', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(typeof result.current.remainingTime).toBe('number');
      expect(result.current.remainingTime).toBeGreaterThanOrEqual(0);
    });

    it('should maintain showWarning as boolean', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(typeof result.current.showWarning).toBe('boolean');
      expect(result.current.showWarning).toBe(false);
    });

    it('should provide isActive boolean status', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(typeof result.current.isActive).toBe('boolean');
      expect(result.current.isActive).toBe(true);
    });

    it('should have expiration time set in future', () => {
      const { result } = renderHook(() => useSessionManagement());

      const expiresAt = result.current.sessionData?.expiresAt;
      expect(expiresAt).toBeGreaterThan(Date.now());
    });

    it('should have session data after initialization', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.sessionData?.lastActivity).toBeGreaterThan(0);
    });
  });

  // ============================================
  // MANUAL SESSION CONTROL TESTS
  // ============================================

  describe('Manual Session Control', () => {
    it('should allow manual session extension', () => {
      const { result } = renderHook(() => useSessionManagement());

      const initialExpiry = result.current.sessionData?.expiresAt;

      act(() => {
        result.current.extendSession();
      });

      const newExpiry = result.current.sessionData?.expiresAt;

      expect(newExpiry).toBeGreaterThan(initialExpiry || 0);
    });

    it('should allow manual logout', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.isActive).toBe(true);

      act(() => {
        result.current.endSession();
      });

      expect(result.current.sessionData).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.showWarning).toBe(false);
    });

    it('should clear all session data on logout', () => {
      renderHook(() => useSessionManagement());

      expect(sessionStorage.getItem('user_session')).toBeTruthy();

      const { result } = renderHook(() => useSessionManagement());

      act(() => {
        result.current.endSession();
      });

      expect(sessionStorage.getItem('user_session')).toBeNull();
    });

    it('should manually update activity', () => {
      const { result } = renderHook(() => useSessionManagement());

      const initialLastActivity = result.current.sessionData?.lastActivity;

      act(() => {
        result.current.updateActivity();
      });

      expect(result.current.sessionData?.lastActivity).toBeGreaterThanOrEqual(
        initialLastActivity || 0
      );
    });

    it('should maintain active status on activity update', () => {
      const { result } = renderHook(() => useSessionManagement());

      act(() => {
        result.current.updateActivity();
      });

      expect(result.current.isActive).toBe(true);
    });
  });

  // ============================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================

  describe('Edge Cases', () => {
    it('should handle missing sessionStorage gracefully', () => {
      const getItemSpy = vi.spyOn(sessionStorage, 'getItem').mockReturnValueOnce(null);

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.isActive).toBe(true);

      getItemSpy.mockRestore();
    });

    it('should handle corrupted sessionStorage data', () => {
      sessionStorage.setItem('user_session', 'invalid-json-data');

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.isActive).toBe(true);
    });

    it('should cleanup listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useSessionManagement());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
    });

    it('should handle rapid extend/end session calls', () => {
      const { result } = renderHook(() => useSessionManagement());

      act(() => {
        result.current.extendSession();
        result.current.extendSession();
        result.current.endSession();
      });

      expect(result.current.sessionData).toBeNull();
      expect(result.current.isActive).toBe(false);
    });

    it('should recover from null session data gracefully', () => {
      sessionStorage.removeItem('user_session');

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.isActive).toBe(true);
    });
  });

  // ============================================
  // RETURN VALUE TESTS
  // ============================================

  describe('Hook Return Values', () => {
    it('should return correct initial values', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(result.current).toHaveProperty('sessionData');
      expect(result.current).toHaveProperty('showWarning');
      expect(result.current).toHaveProperty('remainingTime');
      expect(result.current).toHaveProperty('isActive');
      expect(result.current).toHaveProperty('extendSession');
      expect(result.current).toHaveProperty('endSession');
      expect(result.current).toHaveProperty('updateActivity');
    });

    it('should have correct types for return values', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(typeof result.current.showWarning).toBe('boolean');
      expect(typeof result.current.remainingTime).toBe('number');
      expect(typeof result.current.isActive).toBe('boolean');
      expect(typeof result.current.extendSession).toBe('function');
      expect(typeof result.current.endSession).toBe('function');
      expect(typeof result.current.updateActivity).toBe('function');
    });

    it('should have sessionId in sessionData when active', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessionData?.sessionId).toBeDefined();
    });

    it('should return null sessionData after logout', () => {
      const { result } = renderHook(() => useSessionManagement());

      act(() => {
        result.current.endSession();
      });

      expect(result.current.sessionData).toBeNull();
    });
  });

  // ============================================
  // STORAGE TESTS
  // ============================================

  describe('Session Storage', () => {
    it('should persist session data to sessionStorage', () => {
      renderHook(() => useSessionManagement());

      const stored = sessionStorage.getItem('user_session');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.sessionId).toBeDefined();
      expect(parsed.isActive).toBe(true);
    });

    it('should update stored session when extended', () => {
      const { result } = renderHook(() => useSessionManagement());

      const storedBefore = sessionStorage.getItem('user_session');
      const parsedBefore = JSON.parse(storedBefore!);

      act(() => {
        result.current.extendSession();
      });

      const storedAfter = sessionStorage.getItem('user_session');
      const parsedAfter = JSON.parse(storedAfter!);

      expect(parsedAfter.expiresAt).toBeGreaterThan(parsedBefore.expiresAt);
    });

    it('should clear storage on session end', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(sessionStorage.getItem('user_session')).toBeTruthy();

      act(() => {
        result.current.endSession();
      });

      expect(sessionStorage.getItem('user_session')).toBeNull();
    });
  });

  // ============================================
  // CONFIG TESTS
  // ============================================

  describe('Configuration', () => {
    it('should accept custom maxInactiveTime', () => {
      const customConfig = { maxInactiveTime: 10 * 60 * 1000 };
      const { result } = renderHook(() => useSessionManagement(customConfig));

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.isActive).toBe(true);
    });

    it('should accept custom warningTime', () => {
      const customConfig = { warningTime: 2 * 60 * 1000 };
      const { result } = renderHook(() => useSessionManagement(customConfig));

      expect(result.current.sessionData).toBeDefined();
    });

    it('should accept custom checkInterval', () => {
      const customConfig = { checkInterval: 30 * 1000 };
      const { result } = renderHook(() => useSessionManagement(customConfig));

      expect(result.current.sessionData).toBeDefined();
    });

    it('should accept partial config', () => {
      const customConfig = {
        maxInactiveTime: 15 * 60 * 1000,
        warningTime: 3 * 60 * 1000,
      };
      const { result } = renderHook(() => useSessionManagement(customConfig));

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.isActive).toBe(true);
    });

    it('should use default config when not provided', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessionData).toBeDefined();
      expect(result.current.isActive).toBe(true);
    });
  });
});
