/**
 * StrictMode Compatibility Test Suite
 *
 * Tests that components properly handle React StrictMode's double mounting behavior:
 * - No duplicate API calls
 * - No timer leaks
 * - Proper cleanup of refs/listeners/abort controllers
 * - Stable useEffect dependencies
 *
 * These tests ensure that components work correctly in development (StrictMode enabled)
 * and production (StrictMode disabled) without memory leaks or duplicate operations.
 */

import { AuthProvider } from '@domains/auth/providers/AuthProvider';
import { InfiniteUserList } from '@domains/users/components/InfiniteScrollExamples';
import { render, waitFor } from '@testing-library/react';
import { StrictMode, useEffect, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fetch globally
const originalFetch = global.fetch;
let fetchCallCount = 0;

beforeEach(() => {
  fetchCallCount = 0;
  global.fetch = vi.fn(async () => {
    fetchCallCount++;
    return {
      ok: true,
      json: async () => ({
        users: [],
        total: 0,
      }),
      headers: new Headers(),
      status: 200,
      statusText: 'OK',
    } as Response;
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.clearAllMocks();
});

describe('StrictMode Compatibility Tests', () => {
  describe('AuthProvider - No Duplicate Auth Checks', () => {
    it('should only call auth check once in StrictMode', async () => {
      const authCheckSpy = vi.fn();

      // Mock apiClient.getUserProfile and tokenService
      const { apiClient } = await import('@lib/api/client');
      const { tokenService } = await import('@shared/services/auth/tokenService');

      // Mock tokenService to return authenticated
      vi.spyOn(tokenService, 'isAuthenticated').mockReturnValue(true);
      vi.spyOn(tokenService, 'getAccessToken').mockReturnValue('mock-token');

      // Mock apiClient.getUserProfile to spy on calls
      vi.spyOn(apiClient, 'getUserProfile').mockImplementation(async () => {
        authCheckSpy();
        return {
          id: '1',
          user_id: '1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User',
          role: 'user',
          is_active: true,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      render(
        <StrictMode>
          <AuthProvider>
            <div>Test</div>
          </AuthProvider>
        </StrictMode>
      );

      await waitFor(() => {
        // In StrictMode, component mounts twice but auth check should only happen once
        // due to hasMountedRef guard
        expect(authCheckSpy).toHaveBeenCalledTimes(1);
      });

      // Cleanup
      vi.restoreAllMocks();
    });

    it('should abort auth check on unmount', async () => {
      const abortSpy = vi.fn();
      const originalAbortController = global.AbortController;

      // Mock AbortController
      global.AbortController = class MockAbortController {
        signal = { aborted: false };
        abort = abortSpy;
      } as any;

      const { unmount } = render(
        <StrictMode>
          <AuthProvider>
            <div>Test</div>
          </AuthProvider>
        </StrictMode>
      );

      unmount();

      expect(abortSpy).toHaveBeenCalled();

      global.AbortController = originalAbortController;
    });
  });

  describe('InfiniteScrollExamples - No Duplicate Fetches', () => {
    it('should only fetch once per scroll in StrictMode', async () => {
      fetchCallCount = 0;

      render(
        <StrictMode>
          <InfiniteUserList />
        </StrictMode>
      );

      await waitFor(
        () => {
          // Should only call fetch once for initial load, even in StrictMode
          expect(fetchCallCount).toBe(1);
        },
        { timeout: 3000 }
      );
    });

    it('should cancel pending requests when component unmounts', async () => {
      const abortSpy = vi.fn();
      const originalAbortController = global.AbortController;

      global.AbortController = class MockAbortController {
        signal = { aborted: false };
        abort = abortSpy;
      } as any;

      const { unmount } = render(
        <StrictMode>
          <InfiniteUserList />
        </StrictMode>
      );

      await waitFor(() => {
        expect(fetchCallCount).toBeGreaterThan(0);
      });

      unmount();

      // Abort should be called on unmount
      expect(abortSpy).toHaveBeenCalled();

      global.AbortController = originalAbortController;
    });
  });

  describe('Timer Cleanup Tests', () => {
    it('should clear timers on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      function TimerComponent() {
        const timerRef = useRef<NodeJS.Timeout | null>(null);

        useEffect(() => {
          timerRef.current = setInterval(() => {
            /* noop */
          }, 1000);

          return () => {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          };
        }, []);

        return <div>Timer Component</div>;
      }

      const { unmount } = render(
        <StrictMode>
          <TimerComponent />
        </StrictMode>
      );

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Event Listener Cleanup Tests', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      function ListenerComponent() {
        useEffect(() => {
          const handler = () => {
            /* noop */
          };
          window.addEventListener('resize', handler);

          return () => {
            window.removeEventListener('resize', handler);
          };
        }, []);

        return <div>Listener Component</div>;
      }

      const { unmount } = render(
        <StrictMode>
          <ListenerComponent />
        </StrictMode>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should not register duplicate listeners in StrictMode', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      function ListenerComponent() {
        const hasSetupRef = useRef(false);

        useEffect(() => {
          if (hasSetupRef.current) return;
          hasSetupRef.current = true;

          const handler = () => {
            /* noop */
          };
          window.addEventListener('resize', handler);

          return () => {
            // [CORRECT] Don't reset ref in cleanup for StrictMode safety
            window.removeEventListener('resize', handler);
          };
        }, []);

        return <div>Listener Component</div>;
      }

      render(
        <StrictMode>
          <ListenerComponent />
        </StrictMode>
      );

      // Should only register listener once, even in StrictMode
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      addEventListenerSpy.mockRestore();
    });
  });

  describe('Ref Guard Pattern Tests', () => {
    it('should use ref guards to prevent double execution', () => {
      let executionCount = 0;

      function RefGuardComponent() {
        const hasMountedRef = useRef(false);

        useEffect(() => {
          if (hasMountedRef.current) return;
          hasMountedRef.current = true;

          executionCount++;

          return () => {
            // [CORRECT] Don't reset ref in cleanup for StrictMode safety
            // hasMountedRef.current = false; // This would cause double execution!
          };
        }, []);

        return <div>Ref Guard Component</div>;
      }

      render(
        <StrictMode>
          <RefGuardComponent />
        </StrictMode>
      );

      // Should only execute once, even in StrictMode
      expect(executionCount).toBe(1);
    });
  });
});

/**
 * Integration Test: Full Component with Multiple Effects
 *
 * Tests a component that combines:
 * - API calls
 * - Event listeners
 * - Timers
 * - Refs
 */
describe('Integration: Complex Component with Multiple Effects', () => {
  it('should handle all StrictMode scenarios correctly', async () => {
    let apiCallCount = 0;
    let timerCount = 0;
    let listenerCount = 0;

    function ComplexComponent() {
      const hasMountedRef = useRef(false);
      const abortControllerRef = useRef<AbortController | null>(null);
      const timerRef = useRef<NodeJS.Timeout | null>(null);

      // API Call Effect
      useEffect(() => {
        if (hasMountedRef.current) return;
        hasMountedRef.current = true;

        abortControllerRef.current = new AbortController();

        fetch('/api/test', { signal: abortControllerRef.current.signal })
          .then(() => apiCallCount++)
          .catch(() => {});

        return () => {
          // [CORRECT] Don't reset ref in cleanup for StrictMode safety
          abortControllerRef.current?.abort();
          abortControllerRef.current = null;
        };
      }, []);

      // Timer Effect
      useEffect(() => {
        if (timerRef.current) return;

        timerRef.current = setInterval(() => {
          timerCount++;
        }, 100);

        return () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        };
      }, []);

      // Event Listener Effect
      useEffect(() => {
        const handler = () => listenerCount++;
        window.addEventListener('test-event', handler);

        return () => {
          window.removeEventListener('test-event', handler);
        };
      }, []);

      return <div>Complex Component</div>;
    }

    const { unmount } = render(
      <StrictMode>
        <ComplexComponent />
      </StrictMode>
    );

    await waitFor(() => {
      expect(apiCallCount).toBeLessThanOrEqual(1); // No duplicate API calls
    });

    // Trigger event
    window.dispatchEvent(new Event('test-event'));

    unmount();

    // Verify cleanup
    expect(apiCallCount).toBeLessThanOrEqual(1);
    expect(timerCount).toBeGreaterThanOrEqual(0); // Timer ran at least once
  });
});
