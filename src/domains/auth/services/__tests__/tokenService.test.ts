// ========================================
// Token Service Tests
// Comprehensive testing of token operations
// ========================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  refreshToken,
  getCsrfToken,
  validateCsrfToken,
  storeTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  clearTokens,
  getTokenExpiryTime,
  storeUser,
  getUser,
  removeUser,
  storeCsrfToken,
  getStoredCsrfToken,
  removeCsrfToken,
} from '../tokenService';
import { apiClient } from '../../../../services/api/apiClient';
import type {
  RefreshTokenResponse,
  CsrfTokenResponse,
  ValidateCsrfResponse,
} from '../../types/token.types';

// Mock apiClient
vi.mock('../../../../services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('tokenService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ========================================
  // API Calls - Token Operations
  // ========================================

  describe('refreshToken', () => {
    it('should call API with correct endpoint and payload', async () => {
      const mockResponse: RefreshTokenResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        expires_in: 3600,
        token_type: 'bearer',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await refreshToken('old_refresh_token');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/refresh', {
        refresh_token: 'old_refresh_token',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate API errors', async () => {
      const error = new Error('Token refresh failed');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(refreshToken('invalid_token')).rejects.toThrow('Token refresh failed');
    });
  });

  describe('getCsrfToken', () => {
    it('should fetch CSRF token from API', async () => {
      const mockResponse: CsrfTokenResponse = {
        csrf_token: 'test_csrf_token_123',
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await getCsrfToken();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/auth/csrf-token');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Failed to fetch CSRF token');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getCsrfToken()).rejects.toThrow('Failed to fetch CSRF token');
    });
  });

  describe('validateCsrfToken', () => {
    it('should validate CSRF token via API', async () => {
      const mockRequest = { csrf_token: 'test_token' };
      const mockResponse: ValidateCsrfResponse = {
        valid: true,
        message: 'Token is valid',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await validateCsrfToken(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/validate-csrf', mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should return invalid response for bad token', async () => {
      const mockRequest = { csrf_token: 'invalid_token' };
      const mockResponse: ValidateCsrfResponse = {
        valid: false,
        message: 'Token is invalid',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await validateCsrfToken(mockRequest);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Token is invalid');
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation failed');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(validateCsrfToken({ csrf_token: 'test' })).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  // ========================================
  // Token Storage Operations
  // ========================================

  describe('storeTokens', () => {
    it('should store all tokens in localStorage', () => {
      const tokens = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_in: 3600,
        token_type: 'bearer' as const,
      };

      storeTokens(tokens);

      expect(localStorage.getItem('auth_token')).toBe('test_access_token');
      expect(localStorage.getItem('refresh_token')).toBe('test_refresh_token');
      
      const expiryTime = localStorage.getItem('token_expires_at');
      expect(expiryTime).not.toBeNull();
      
      const expiryTimestamp = parseInt(expiryTime!, 10);
      const expectedExpiry = Date.now() + 3600 * 1000;
      // Allow 1 second tolerance for test execution time
      expect(expiryTimestamp).toBeGreaterThanOrEqual(expectedExpiry - 1000);
      expect(expiryTimestamp).toBeLessThanOrEqual(expectedExpiry + 1000);
    });

    it('should calculate correct expiry time', () => {
      const tokens = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 7200, // 2 hours
        token_type: 'bearer' as const,
      };

      const beforeStore = Date.now();
      storeTokens(tokens);
      const afterStore = Date.now();

      const expiryTime = parseInt(localStorage.getItem('token_expires_at')!, 10);
      const expectedMin = beforeStore + 7200 * 1000;
      const expectedMax = afterStore + 7200 * 1000;

      expect(expiryTime).toBeGreaterThanOrEqual(expectedMin);
      expect(expiryTime).toBeLessThanOrEqual(expectedMax);
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve access token from localStorage', () => {
      localStorage.setItem('auth_token', 'stored_access_token');

      const token = getAccessToken();

      expect(token).toBe('stored_access_token');
    });

    it('should return null when no token stored', () => {
      const token = getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token from localStorage', () => {
      localStorage.setItem('refresh_token', 'stored_refresh_token');

      const token = getRefreshToken();

      expect(token).toBe('stored_refresh_token');
    });

    it('should return null when no refresh token stored', () => {
      const token = getRefreshToken();

      expect(token).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no expiry time stored', () => {
      expect(isTokenExpired()).toBe(true);
    });

    it('should return false for future expiry time', () => {
      const futureTime = Date.now() + 3600 * 1000; // 1 hour in future
      localStorage.setItem('token_expires_at', futureTime.toString());

      expect(isTokenExpired()).toBe(false);
    });

    it('should return true for past expiry time', () => {
      const pastTime = Date.now() - 3600 * 1000; // 1 hour in past
      localStorage.setItem('token_expires_at', pastTime.toString());

      expect(isTokenExpired()).toBe(true);
    });

    it('should return true at exact expiry time', () => {
      const now = Date.now();
      localStorage.setItem('token_expires_at', now.toString());

      expect(isTokenExpired()).toBe(true);
    });

    it('should handle millisecond precision correctly', () => {
      const justBeforeExpiry = Date.now() + 100; // 100ms in future
      localStorage.setItem('token_expires_at', justBeforeExpiry.toString());

      expect(isTokenExpired()).toBe(false);
    });
  });

  describe('getTokenExpiryTime', () => {
    it('should return null when no expiry time stored', () => {
      expect(getTokenExpiryTime()).toBeNull();
    });

    it('should return time remaining in seconds', () => {
      const futureTime = Date.now() + 3600 * 1000; // 1 hour
      localStorage.setItem('token_expires_at', futureTime.toString());

      const timeRemaining = getTokenExpiryTime();

      expect(timeRemaining).not.toBeNull();
      // Should be approximately 3600 seconds (allow 2 second tolerance)
      expect(timeRemaining!).toBeGreaterThanOrEqual(3598);
      expect(timeRemaining!).toBeLessThanOrEqual(3600);
    });

    it('should return 0 for expired tokens', () => {
      const pastTime = Date.now() - 1000; // 1 second ago
      localStorage.setItem('token_expires_at', pastTime.toString());

      expect(getTokenExpiryTime()).toBe(0);
    });

    it('should floor time to seconds', () => {
      const futureTime = Date.now() + 1500; // 1.5 seconds
      localStorage.setItem('token_expires_at', futureTime.toString());

      const timeRemaining = getTokenExpiryTime();

      expect(timeRemaining).toBe(1); // Should floor to 1 second
    });
  });

  describe('clearTokens', () => {
    it('should remove all token-related items from localStorage', () => {
      // Setup tokens
      localStorage.setItem('auth_token', 'access_token');
      localStorage.setItem('refresh_token', 'refresh_token');
      localStorage.setItem('token_expires_at', '12345');
      localStorage.setItem('auth_user', '{"id": 1}');
      localStorage.setItem('csrf_token', 'csrf_token');

      clearTokens();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('token_expires_at')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(localStorage.getItem('csrf_token')).toBeNull();
    });

    it('should not affect other localStorage items', () => {
      localStorage.setItem('auth_token', 'token');
      localStorage.setItem('other_key', 'other_value');
      localStorage.setItem('app_settings', 'settings');

      clearTokens();

      expect(localStorage.getItem('other_key')).toBe('other_value');
      expect(localStorage.getItem('app_settings')).toBe('settings');
    });

    it('should handle empty localStorage gracefully', () => {
      expect(() => clearTokens()).not.toThrow();
    });
  });

  // ========================================
  // User Data Management
  // ========================================

  describe('storeUser', () => {
    it('should store user object as JSON', () => {
      const user = { id: 1, username: 'testuser', email: 'test@example.com' };

      storeUser(user);

      const stored = localStorage.getItem('auth_user');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(user);
    });

    it('should handle complex user objects', () => {
      const user = {
        id: 1,
        profile: {
          name: 'Test User',
          roles: ['admin', 'user'],
          settings: { theme: 'dark' },
        },
      };

      storeUser(user);

      const stored = JSON.parse(localStorage.getItem('auth_user')!);
      expect(stored).toEqual(user);
    });

    it('should overwrite existing user data', () => {
      storeUser({ id: 1, username: 'user1' });
      storeUser({ id: 2, username: 'user2' });

      const stored = JSON.parse(localStorage.getItem('auth_user')!);
      expect(stored).toEqual({ id: 2, username: 'user2' });
    });
  });

  describe('getUser', () => {
    it('should retrieve and parse user data', () => {
      const user = { id: 1, username: 'testuser' };
      localStorage.setItem('auth_user', JSON.stringify(user));

      const result = getUser();

      expect(result).toEqual(user);
    });

    it('should return null when no user data stored', () => {
      expect(getUser()).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('auth_user', 'invalid json {');

      expect(getUser()).toBeNull();
    });

    it('should handle corrupted data', () => {
      localStorage.setItem('auth_user', 'not json at all');

      expect(getUser()).toBeNull();
    });
  });

  describe('removeUser', () => {
    it('should remove user data from localStorage', () => {
      localStorage.setItem('auth_user', '{"id": 1}');

      removeUser();

      expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('should not affect other localStorage items', () => {
      localStorage.setItem('auth_user', '{"id": 1}');
      localStorage.setItem('auth_token', 'token');

      removeUser();

      expect(localStorage.getItem('auth_token')).toBe('token');
    });
  });

  // ========================================
  // CSRF Token Management
  // ========================================

  describe('storeCsrfToken', () => {
    it('should store CSRF token in localStorage', () => {
      storeCsrfToken('csrf_token_123');

      expect(localStorage.getItem('csrf_token')).toBe('csrf_token_123');
    });

    it('should overwrite existing CSRF token', () => {
      storeCsrfToken('old_token');
      storeCsrfToken('new_token');

      expect(localStorage.getItem('csrf_token')).toBe('new_token');
    });
  });

  describe('getStoredCsrfToken', () => {
    it('should retrieve CSRF token from localStorage', () => {
      localStorage.setItem('csrf_token', 'stored_csrf_token');

      expect(getStoredCsrfToken()).toBe('stored_csrf_token');
    });

    it('should return null when no CSRF token stored', () => {
      expect(getStoredCsrfToken()).toBeNull();
    });
  });

  describe('removeCsrfToken', () => {
    it('should remove CSRF token from localStorage', () => {
      localStorage.setItem('csrf_token', 'csrf_token_123');

      removeCsrfToken();

      expect(localStorage.getItem('csrf_token')).toBeNull();
    });

    it('should not affect other tokens', () => {
      localStorage.setItem('csrf_token', 'csrf_token');
      localStorage.setItem('auth_token', 'auth_token');

      removeCsrfToken();

      expect(localStorage.getItem('auth_token')).toBe('auth_token');
    });
  });

  // ========================================
  // Integration Tests
  // ========================================

  describe('integration scenarios', () => {
    it('should handle complete token lifecycle', () => {
      // Store tokens
      storeTokens({
        access_token: 'access',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'bearer',
      });

      // Verify storage
      expect(getAccessToken()).toBe('access');
      expect(getRefreshToken()).toBe('refresh');
      expect(isTokenExpired()).toBe(false);
      expect(getTokenExpiryTime()).toBeGreaterThan(0);

      // Clear tokens
      clearTokens();

      // Verify cleanup
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(isTokenExpired()).toBe(true);
      expect(getTokenExpiryTime()).toBeNull();
    });

    it('should handle user and token operations together', () => {
      // Store everything
      storeTokens({
        access_token: 'access',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'bearer',
      });
      storeUser({ id: 1, username: 'testuser' });
      storeCsrfToken('csrf_token');

      // Verify all stored
      expect(getAccessToken()).not.toBeNull();
      expect(getUser()).not.toBeNull();
      expect(getStoredCsrfToken()).not.toBeNull();

      // Clear everything
      clearTokens();

      // Verify all cleared
      expect(getAccessToken()).toBeNull();
      expect(getUser()).toBeNull();
      expect(getStoredCsrfToken()).toBeNull();
    });

    it('should handle token expiration correctly over time', async () => {
      // Store token that expires in 100ms
      const tokens = {
        access_token: 'short_lived_token',
        refresh_token: 'refresh',
        expires_in: 0.1, // 100ms
        token_type: 'bearer' as const,
      };

      storeTokens(tokens);

      // Should not be expired immediately
      expect(isTokenExpired()).toBe(false);
      expect(getTokenExpiryTime()).toBe(0); // Already floors to 0

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be expired now
      expect(isTokenExpired()).toBe(true);
      expect(getTokenExpiryTime()).toBe(0);
    });
  });
});
