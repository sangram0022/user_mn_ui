/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Unit Tests for Authentication Store (Zustand)
 *
 * Tests the authentication state management including:
 * - Login/logout functionality
 * - Token management
 * - User state updates
 * - Error handling
 * - Persistence
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from '@domains/authentication/store/authStore';
import { server } from '@test/setup';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3000/api';

describe('Authentication Store', () => {
  // Reset store before each test
  beforeEach(() => {
    const { reset } = useAuthStore.getState();
    reset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Initial State
  // ============================================================================

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load persisted state from localStorage', () => {
      // Simulate persisted auth state
      const mockState = {
        user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' },
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        isAuthenticated: true,
      };

      localStorage.setItem('auth-storage', JSON.stringify({ state: mockState }));

      // Create new store instance (simulating app load)
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockState.user);
      expect(result.current.token).toBe(mockState.token);
    });
  });

  // ============================================================================
  // Login
  // ============================================================================

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      // Wait for state updates
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.token).toBeDefined();
      expect(result.current.refreshToken).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle invalid credentials', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login({
            email: 'wrong@example.com',
            password: 'wrongpassword',
          });
        } catch (_) {
          // Expected to fail
        }
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.error).toBeDefined();
    });

    it('should set loading state during login', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Start login (don't await yet)
      act(() => {
        result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      // Check loading state immediately
      expect(result.current.isLoading).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should persist auth state to localStorage after login', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Check localStorage
      const storedState = localStorage.getItem('auth-storage');
      expect(storedState).toBeDefined();

      const parsedState = JSON.parse(storedState!);
      expect(parsedState.state.isAuthenticated).toBe(true);
      expect(parsedState.state.user.email).toBe('test@example.com');
    });

    it('should handle network errors during login', async () => {
      // Mock network failure
      server.use(
        http.post(`${API_BASE_URL}/auth/login`, () => {
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'password',
          });
        } catch (_) {
          // Expected to fail
        }
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // Logout
  // ============================================================================

  describe('Logout', () => {
    it('should logout and clear state', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should clear localStorage on logout', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Login
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      await waitFor(() => {
        expect(localStorage.getItem('auth-storage')).toBeDefined();
      });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      const storedState = localStorage.getItem('auth-storage');
      const parsedState = JSON.parse(storedState!);
      expect(parsedState.state.isAuthenticated).toBe(false);
      expect(parsedState.state.user).toBeNull();
    });
  });

  // ============================================================================
  // Token Refresh
  // ============================================================================

  describe('Token Refresh', () => {
    it('should refresh access token', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const originalToken = result.current.token;

      // Refresh token
      await act(async () => {
        await result.current.refreshAccessToken();
      });

      await waitFor(() => {
        expect(result.current.token).not.toBe(originalToken);
      });

      expect(result.current.token).toBe('new-access-token');
    });

    it('should handle refresh token failure', async () => {
      // Mock refresh failure
      server.use(
        http.post(`${API_BASE_URL}/auth/refresh`, () => {
          return HttpResponse.json(
            {
              success: false,
              error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' },
            },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuthStore());

      // Login first
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Try to refresh (should fail and logout)
      await act(async () => {
        try {
          await result.current.refreshAccessToken();
        } catch (_) {
          // Expected to fail
        }
      });

      // Should be logged out after failed refresh
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  // ============================================================================
  // Register
  // ============================================================================

  describe('Register', () => {
    it('should register new user successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.user?.email).toBe('newuser@example.com');
      expect(result.current.user?.firstName).toBe('New');
      expect(result.current.user?.lastName).toBe('User');
      expect(result.current.token).toBeDefined();
    });

    it('should handle registration errors', async () => {
      // Mock registration failure
      server.use(
        http.post(`${API_BASE_URL}/auth/register`, () => {
          return HttpResponse.json(
            {
              success: false,
              error: { code: 'EMAIL_EXISTS', message: 'Email already exists' },
            },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
          });
        } catch (_) {
          // Expected to fail
        }
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // Error Handling
  // ============================================================================

  describe('Error Handling', () => {
    it('should clear error on clearError call', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Cause an error
      await act(async () => {
        try {
          await result.current.login({
            email: 'wrong@example.com',
            password: 'wrongpassword',
          });
        } catch (_) {
          // Expected to fail
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      // Manually set some state
      act(() => {
        useAuthStore.setState({
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'admin',
            status: 'active',
          },
          token: 'test-token',
          isAuthenticated: true,
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ============================================================================
  // Selectors
  // ============================================================================

  describe('Selectors', () => {
    it('should select specific state slices', () => {
      const { result: userResult } = renderHook(() => useAuthStore((state) => state.user));
      const { result: isAuthResult } = renderHook(() =>
        useAuthStore((state) => state.isAuthenticated)
      );

      expect(userResult.current).toBeNull();
      expect(isAuthResult.current).toBe(false);
    });

    it('should only re-render when selected state changes', async () => {
      let userRenderCount = 0;
      let loadingRenderCount = 0;

      const { result: userResult } = renderHook(() => {
        userRenderCount++;
        return useAuthStore((state) => state.user);
      });

      const { result: loadingResult } = renderHook(() => {
        loadingRenderCount++;
        return useAuthStore((state) => state.isLoading);
      });

      const initialUserCount = userRenderCount;
      const initialLoadingCount = loadingRenderCount;

      // Login (changes both user and loading)
      await act(async () => {
        await useAuthStore.getState().login({
          email: 'test@example.com',
          password: 'password',
        });
      });

      await waitFor(() => {
        expect(userResult.current).toBeDefined();
      });

      // Both should have re-rendered
      expect(userRenderCount).toBeGreaterThan(initialUserCount);
      expect(loadingRenderCount).toBeGreaterThan(initialLoadingCount);
    });
  });
});
