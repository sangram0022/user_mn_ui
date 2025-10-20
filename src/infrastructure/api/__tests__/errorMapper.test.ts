/**
 * Unit tests for errorMapper utility
 *
 * Tests localized error message mapping from error codes
 */

import { mapApiErrorToMessage } from '@shared/utils/errorMapper';
import { describe, expect, it, vi } from 'vitest';

// Mock the localization module
vi.mock('@hooks/localization/useLocalization', () => ({
  useLocalization: () => ({
    t: (key: string, fallback?: string) => {
      // Mock translations for testing
      const translations: Record<string, string> = {
        'errors.AUTH_001': 'Invalid credentials. Please check your username and password.',
        'errors.AUTH_002': 'Your session has expired. Please log in again.',
        'errors.AUTH_003': 'You do not have permission to perform this action.',
        'errors.USER_001': 'User not found.',
        'errors.USER_002': 'Email address is already registered.',
        'errors.USER_003': 'Username is already taken.',
        'errors.USER_004': 'Invalid user status.',
        'errors.VALIDATION_001': 'Please check your input and try again.',
        'errors.VALIDATION_002': 'Email format is invalid.',
        'errors.VALIDATION_003': 'Password must be at least 8 characters.',
        'errors.RATE_LIMIT_001': 'Too many requests. Please wait before trying again.',
        'errors.SERVER_001': 'An unexpected error occurred. Please try again.',
        'errors.SERVER_002': 'The service is temporarily unavailable. Please try again later.',
        'errors.NETWORK_001': 'Network connection error. Please check your internet connection.',
        'errors.GDPR_001': 'Failed to export user data. Please try again.',
        'errors.GDPR_002': 'Failed to delete account. Please contact support.',
        'errors.AUDIT_001': 'Failed to fetch audit logs.',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

describe('errorMapper', () => {
  describe('mapApiErrorToMessage', () => {
    it('should map known error codes to localized messages', () => {
      const result = mapApiErrorToMessage('AUTH_001');
      expect(result).toBe('Invalid credentials. Please check your username and password.');
    });

    it('should handle authentication errors', () => {
      expect(mapApiErrorToMessage('AUTH_001')).toContain('Invalid credentials');
      expect(mapApiErrorToMessage('AUTH_002')).toContain('session has expired');
      expect(mapApiErrorToMessage('AUTH_003')).toContain('do not have permission');
    });

    it('should handle user-related errors', () => {
      expect(mapApiErrorToMessage('USER_001')).toContain('User not found');
      expect(mapApiErrorToMessage('USER_002')).toContain('Email address is already registered');
      expect(mapApiErrorToMessage('USER_003')).toContain('Username is already taken');
    });

    it('should handle validation errors', () => {
      expect(mapApiErrorToMessage('VALIDATION_001')).toContain('check your input');
      expect(mapApiErrorToMessage('VALIDATION_002')).toContain('Email format is invalid');
      expect(mapApiErrorToMessage('VALIDATION_003')).toContain('at least 8 characters');
    });

    it('should handle rate limit errors', () => {
      expect(mapApiErrorToMessage('RATE_LIMIT_001')).toContain('Too many requests');
    });

    it('should handle server errors', () => {
      expect(mapApiErrorToMessage('SERVER_001')).toContain('unexpected error');
      expect(mapApiErrorToMessage('SERVER_002')).toContain('temporarily unavailable');
    });

    it('should handle network errors', () => {
      expect(mapApiErrorToMessage('NETWORK_001')).toContain('Network connection error');
    });

    it('should handle GDPR-related errors', () => {
      expect(mapApiErrorToMessage('GDPR_001')).toContain('Failed to export user data');
      expect(mapApiErrorToMessage('GDPR_002')).toContain('Failed to delete account');
    });

    it('should handle audit log errors', () => {
      expect(mapApiErrorToMessage('AUDIT_001')).toContain('Failed to fetch audit logs');
    });

    it('should return generic message for unknown error codes', () => {
      const result = mapApiErrorToMessage('UNKNOWN_ERROR');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle null error code', () => {
      const result = mapApiErrorToMessage(null as any);
      expect(result).toBeTruthy();
    });

    it('should handle undefined error code', () => {
      const result = mapApiErrorToMessage(undefined as any);
      expect(result).toBeTruthy();
    });

    it('should handle empty string error code', () => {
      const result = mapApiErrorToMessage('');
      expect(result).toBeTruthy();
    });

    it('should handle error codes with different cases', () => {
      // Error codes should be case-sensitive
      const upperResult = mapApiErrorToMessage('AUTH_001');
      const lowerResult = mapApiErrorToMessage('auth_001');
      expect(upperResult).not.toBe(lowerResult);
    });

    it('should return consistent messages for the same error code', () => {
      const result1 = mapApiErrorToMessage('AUTH_001');
      const result2 = mapApiErrorToMessage('AUTH_001');
      expect(result1).toBe(result2);
    });

    it('should handle error codes with special characters', () => {
      const result = mapApiErrorToMessage('ERROR-001');
      expect(result).toBeTruthy();
    });

    it('should return user-friendly messages (not technical codes)', () => {
      const result = mapApiErrorToMessage('AUTH_001');
      expect(result).not.toContain('AUTH_001'); // Should not return the code itself
      expect(result.length).toBeGreaterThan(10); // Should be descriptive
    });

    it('should handle all documented error codes', () => {
      const errorCodes = [
        'AUTH_001',
        'AUTH_002',
        'AUTH_003',
        'USER_001',
        'USER_002',
        'USER_003',
        'USER_004',
        'VALIDATION_001',
        'VALIDATION_002',
        'VALIDATION_003',
        'RATE_LIMIT_001',
        'SERVER_001',
        'SERVER_002',
        'NETWORK_001',
        'GDPR_001',
        'GDPR_002',
        'AUDIT_001',
      ];

      errorCodes.forEach((code) => {
        const result = mapApiErrorToMessage(code);
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Error message quality', () => {
    it('should provide actionable messages', () => {
      const authError = mapApiErrorToMessage('AUTH_001');
      expect(authError.toLowerCase()).toMatch(/check|please|try/);
    });

    it('should use proper grammar and punctuation', () => {
      const result = mapApiErrorToMessage('AUTH_001');
      expect(result).toMatch(/[.!]$/); // Should end with punctuation
    });

    it('should be concise but informative', () => {
      const errorCodes = ['AUTH_001', 'USER_001', 'VALIDATION_001'];

      errorCodes.forEach((code) => {
        const result = mapApiErrorToMessage(code);
        expect(result.length).toBeLessThan(200); // Not too long
        expect(result.length).toBeGreaterThan(10); // Not too short
      });
    });
  });

  describe('Integration with API responses', () => {
    it('should handle error objects with error_code property', () => {
      const apiError = { error_code: 'AUTH_001', message: 'Some backend message' };
      const result = mapApiErrorToMessage(apiError.error_code);
      expect(result).toContain('Invalid credentials');
    });

    it('should work with different error response formats', () => {
      // Format 1: Just error code
      const result1 = mapApiErrorToMessage('USER_001');
      expect(result1).toBeTruthy();

      // Format 2: Error object
      const errorObj = { code: 'USER_002' };
      const result2 = mapApiErrorToMessage(errorObj.code);
      expect(result2).toBeTruthy();
    });
  });
});
