// ========================================
// Token Utils Tests
// Comprehensive tests for JWT token utilities
// ========================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  getTokenTimeRemaining,
  getUserIdFromToken,
  getEmailFromToken,
  getRolesFromToken,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isValidTokenStructure,
  getTokenIssuedAt,
  getTokenAge,
} from '../tokenUtils';
import type { DecodedToken } from '../../types/token.types';

// Helper function to create a valid JWT token
function createMockToken(payload: Partial<DecodedToken> = {}): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const defaultPayload = {
    sub: '123',
    email: 'test@example.com',
    roles: ['user'],
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    iat: Math.floor(Date.now() / 1000),
    ...payload,
  };

  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const encodedPayload = btoa(JSON.stringify(defaultPayload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const signature = 'mock-signature';

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

describe('tokenUtils', () => {
  beforeEach(() => {
    // Reset time-based tests
    vi.clearAllMocks();
  });

  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      const token = createMockToken({
        sub: 'user123',
        email: 'user@example.com',
        roles: ['admin', 'user'],
      });

      const decoded = decodeToken(token);

      expect(decoded.sub).toBe('user123');
      expect(decoded.email).toBe('user@example.com');
      expect(decoded.roles).toEqual(['admin', 'user']);
      expect(decoded.exp).toBeGreaterThan(0);
      expect(decoded.iat).toBeGreaterThan(0);
    });

    it('should handle token with minimal payload', () => {
      const token = createMockToken({
        sub: '',
        email: '',
        roles: [],
      });

      const decoded = decodeToken(token);

      expect(decoded.sub).toBe('');
      expect(decoded.email).toBe('');
      expect(decoded.roles).toEqual([]);
    });

    it('should throw error for null token', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => decodeToken(null as any)).toThrow('Invalid token: token must be a non-empty string');
    });

    it('should throw error for undefined token', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => decodeToken(undefined as any)).toThrow('Invalid token: token must be a non-empty string');
    });

    it('should throw error for empty string token', () => {
      expect(() => decodeToken('')).toThrow('Invalid token: token must be a non-empty string');
    });

    it('should throw error for number instead of token', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => decodeToken(123 as any)).toThrow('Invalid token: token must be a non-empty string');
    });

    it('should throw error for token with only 2 parts', () => {
      expect(() => decodeToken('header.payload')).toThrow('Invalid token: JWT must have 3 parts');
    });

    it('should throw error for token with 4 parts', () => {
      expect(() => decodeToken('header.payload.signature.extra')).toThrow('Invalid token: JWT must have 3 parts');
    });

    it('should throw error for token with invalid base64', () => {
      expect(() => decodeToken('invalid.!!!invalid!!!.signature')).toThrow('Failed to decode token');
    });

    it('should throw error for token with invalid JSON in payload', () => {
      const invalidPayload = btoa('{invalid json}')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      expect(() => decodeToken(`header.${invalidPayload}.signature`)).toThrow('Failed to decode token');
    });

    it('should handle tokens with special characters in payload', () => {
      const token = createMockToken({
        email: 'user+test@example.com',
      });

      const decoded = decodeToken(token);
      expect(decoded.email).toBe('user+test@example.com');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token (not expired)', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      });

      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      });

      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for token expiring within default buffer (60s)', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) + 30, // 30 seconds from now
      });

      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return false for token expiring after buffer', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) + 120, // 2 minutes from now
      });

      expect(isTokenExpired(token)).toBe(false);
    });

    it('should respect custom buffer time', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) + 200, // 200 seconds from now
      });

      expect(isTokenExpired(token, 100)).toBe(false); // 100s buffer - OK
      expect(isTokenExpired(token, 300)).toBe(true);  // 300s buffer - expired
    });

    it('should return true for token with no exp field', () => {
      const token = createMockToken({
        exp: 0,
      });

      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for invalid token string', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });

    it('should accept decoded token object', () => {
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['user'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      expect(isTokenExpired(decoded)).toBe(false);
    });

    it('should handle decoded token with expired time', () => {
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['user'],
        exp: Math.floor(Date.now() / 1000) - 3600,
        iat: Math.floor(Date.now() / 1000) - 7200,
      };

      expect(isTokenExpired(decoded)).toBe(true);
    });

    it('should return true for empty string token', () => {
      expect(isTokenExpired('')).toBe(true);
    });

    it('should handle buffer of 0 seconds', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) + 10,
      });

      expect(isTokenExpired(token, 0)).toBe(false);
    });

    it('should handle very large buffer', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      expect(isTokenExpired(token, 7200)).toBe(true); // 2 hour buffer
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date for valid token', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockToken({
        exp: expTime,
      });

      const expirationDate = getTokenExpiration(token);

      expect(expirationDate).toBeInstanceOf(Date);
      expect(expirationDate?.getTime()).toBe(expTime * 1000);
    });

    it('should return null for token with no exp', () => {
      const token = createMockToken({
        exp: 0,
      });

      expect(getTokenExpiration(token)).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(getTokenExpiration('invalid-token')).toBeNull();
    });

    it('should accept decoded token object', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['user'],
        exp: expTime,
        iat: Math.floor(Date.now() / 1000),
      };

      const expirationDate = getTokenExpiration(decoded);
      expect(expirationDate?.getTime()).toBe(expTime * 1000);
    });

    it('should handle past expiration dates', () => {
      const expTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createMockToken({
        exp: expTime,
      });

      const expirationDate = getTokenExpiration(token);
      expect(expirationDate?.getTime()).toBe(expTime * 1000);
      expect(expirationDate!.getTime()).toBeLessThan(Date.now());
    });

    it('should return null for empty string', () => {
      expect(getTokenExpiration('')).toBeNull();
    });
  });

  describe('getTokenTimeRemaining', () => {
    it('should return positive seconds for valid token', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      });

      const remaining = getTokenTimeRemaining(token);
      expect(remaining).toBeGreaterThan(3500);
      expect(remaining).toBeLessThanOrEqual(3600);
    });

    it('should return 0 for expired token', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      });

      expect(getTokenTimeRemaining(token)).toBe(0);
    });

    it('should return 0 for token with no exp', () => {
      const token = createMockToken({
        exp: 0,
      });

      expect(getTokenTimeRemaining(token)).toBe(0);
    });

    it('should return 0 for invalid token', () => {
      expect(getTokenTimeRemaining('invalid-token')).toBe(0);
    });

    it('should accept decoded token object', () => {
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['user'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const remaining = getTokenTimeRemaining(decoded);
      expect(remaining).toBeGreaterThan(3500);
    });

    it('should handle token expiring in 1 second', () => {
      const token = createMockToken({
        exp: Math.floor(Date.now() / 1000) + 1,
      });

      const remaining = getTokenTimeRemaining(token);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(1);
    });

    it('should return 0 for empty string', () => {
      expect(getTokenTimeRemaining('')).toBe(0);
    });
  });

  describe('getUserIdFromToken', () => {
    it('should extract user ID from valid token', () => {
      const token = createMockToken({
        sub: 'user-123-456',
      });

      expect(getUserIdFromToken(token)).toBe('user-123-456');
    });

    it('should return null for token with empty sub', () => {
      const token = createMockToken({
        sub: '',
      });

      expect(getUserIdFromToken(token)).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(getUserIdFromToken('invalid-token')).toBeNull();
    });

    it('should accept decoded token object', () => {
      const decoded: DecodedToken = {
        sub: 'user-789',
        email: 'test@example.com',
        roles: ['user'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      expect(getUserIdFromToken(decoded)).toBe('user-789');
    });

    it('should handle numeric user IDs as strings', () => {
      const token = createMockToken({
        sub: '12345',
      });

      expect(getUserIdFromToken(token)).toBe('12345');
    });

    it('should return null for empty string token', () => {
      expect(getUserIdFromToken('')).toBeNull();
    });
  });

  describe('getEmailFromToken', () => {
    it('should extract email from valid token', () => {
      const token = createMockToken({
        email: 'user@example.com',
      });

      expect(getEmailFromToken(token)).toBe('user@example.com');
    });

    it('should return null for token with empty email', () => {
      const token = createMockToken({
        email: '',
      });

      expect(getEmailFromToken(token)).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(getEmailFromToken('invalid-token')).toBeNull();
    });

    it('should accept decoded token object', () => {
      const decoded: DecodedToken = {
        sub: '123',
        email: 'admin@example.com',
        roles: ['admin'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      expect(getEmailFromToken(decoded)).toBe('admin@example.com');
    });

    it('should handle emails with special characters', () => {
      const token = createMockToken({
        email: 'user+tag@example.co.uk',
      });

      expect(getEmailFromToken(token)).toBe('user+tag@example.co.uk');
    });

    it('should return null for empty string token', () => {
      expect(getEmailFromToken('')).toBeNull();
    });
  });

  describe('getRolesFromToken', () => {
    it('should extract roles from valid token', () => {
      const token = createMockToken({
        roles: ['admin', 'user', 'moderator'],
      });

      expect(getRolesFromToken(token)).toEqual(['admin', 'user', 'moderator']);
    });

    it('should return empty array for token with no roles', () => {
      const token = createMockToken({
        roles: [],
      });

      expect(getRolesFromToken(token)).toEqual([]);
    });

    it('should return empty array for invalid token', () => {
      expect(getRolesFromToken('invalid-token')).toEqual([]);
    });

    it('should accept decoded token object', () => {
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['superadmin', 'developer'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      expect(getRolesFromToken(decoded)).toEqual(['superadmin', 'developer']);
    });

    it('should handle single role', () => {
      const token = createMockToken({
        roles: ['user'],
      });

      expect(getRolesFromToken(token)).toEqual(['user']);
    });

    it('should return empty array for empty string token', () => {
      expect(getRolesFromToken('')).toEqual([]);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      const token = createMockToken({
        roles: ['admin', 'user'],
      });

      expect(hasRole(token, 'admin')).toBe(true);
      expect(hasRole(token, 'user')).toBe(true);
    });

    it('should return false when user does not have the role', () => {
      const token = createMockToken({
        roles: ['user'],
      });

      expect(hasRole(token, 'admin')).toBe(false);
      expect(hasRole(token, 'moderator')).toBe(false);
    });

    it('should return false for invalid token', () => {
      expect(hasRole('invalid-token', 'admin')).toBe(false);
    });

    it('should accept decoded token object', () => {
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['admin'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      expect(hasRole(decoded, 'admin')).toBe(true);
      expect(hasRole(decoded, 'user')).toBe(false);
    });

    it('should be case-sensitive', () => {
      const token = createMockToken({
        roles: ['Admin'],
      });

      expect(hasRole(token, 'Admin')).toBe(true);
      expect(hasRole(token, 'admin')).toBe(false);
    });

    it('should return false for empty roles', () => {
      const token = createMockToken({
        roles: [],
      });

      expect(hasRole(token, 'user')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has at least one role', () => {
      const token = createMockToken({
        roles: ['user'],
      });

      expect(hasAnyRole(token, ['admin', 'user', 'moderator'])).toBe(true);
    });

    it('should return true when user has multiple matching roles', () => {
      const token = createMockToken({
        roles: ['admin', 'user'],
      });

      expect(hasAnyRole(token, ['admin', 'moderator'])).toBe(true);
    });

    it('should return false when user has no matching roles', () => {
      const token = createMockToken({
        roles: ['user'],
      });

      expect(hasAnyRole(token, ['admin', 'moderator'])).toBe(false);
    });

    it('should return false for empty roles to check', () => {
      const token = createMockToken({
        roles: ['admin'],
      });

      expect(hasAnyRole(token, [])).toBe(false);
    });

    it('should return false for invalid token', () => {
      expect(hasAnyRole('invalid-token', ['admin'])).toBe(false);
    });

    it('should accept decoded token object', () => {
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['moderator'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      expect(hasAnyRole(decoded, ['admin', 'moderator'])).toBe(true);
    });

    it('should handle single role check', () => {
      const token = createMockToken({
        roles: ['user'],
      });

      expect(hasAnyRole(token, ['user'])).toBe(true);
    });
  });

  describe('hasAllRoles', () => {
    it('should return true when user has all roles', () => {
      const token = createMockToken({
        roles: ['admin', 'user', 'moderator'],
      });

      expect(hasAllRoles(token, ['admin', 'user'])).toBe(true);
    });

    it('should return false when user is missing one role', () => {
      const token = createMockToken({
        roles: ['user'],
      });

      expect(hasAllRoles(token, ['admin', 'user'])).toBe(false);
    });

    it('should return true for empty roles to check', () => {
      const token = createMockToken({
        roles: ['user'],
      });

      expect(hasAllRoles(token, [])).toBe(true);
    });

    it('should return false for invalid token', () => {
      expect(hasAllRoles('invalid-token', ['admin'])).toBe(false);
    });

    it('should accept decoded token object', () => {
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['admin', 'user', 'superadmin'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      expect(hasAllRoles(decoded, ['admin', 'superadmin'])).toBe(true);
      expect(hasAllRoles(decoded, ['admin', 'moderator'])).toBe(false);
    });

    it('should handle single role check', () => {
      const token = createMockToken({
        roles: ['admin'],
      });

      expect(hasAllRoles(token, ['admin'])).toBe(true);
    });

    it('should return true when user has exact roles', () => {
      const token = createMockToken({
        roles: ['admin', 'user'],
      });

      expect(hasAllRoles(token, ['admin', 'user'])).toBe(true);
    });
  });

  describe('isValidTokenStructure', () => {
    it('should return true for valid JWT structure', () => {
      const token = createMockToken();
      expect(isValidTokenStructure(token)).toBe(true);
    });

    it('should return false for token with only 2 parts', () => {
      expect(isValidTokenStructure('header.payload')).toBe(false);
    });

    it('should return false for token with 4 parts', () => {
      expect(isValidTokenStructure('a.b.c.d')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidTokenStructure('')).toBe(false);
    });

    it('should return false for null', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidTokenStructure(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidTokenStructure(undefined as any)).toBe(false);
    });

    it('should return false for number', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidTokenStructure(123 as any)).toBe(false);
    });

    it('should return false for invalid base64 in payload', () => {
      expect(isValidTokenStructure('header.!!!invalid!!!.signature')).toBe(false);
    });

    it('should return true even if payload JSON is invalid', () => {
      // isValidTokenStructure only checks structure, not content validity
      const invalidPayload = btoa('{invalid}')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      expect(isValidTokenStructure(`header.${invalidPayload}.signature`)).toBe(true);
    });
  });

  describe('getTokenIssuedAt', () => {
    it('should return issued date for valid token', () => {
      const iatTime = Math.floor(Date.now() / 1000);
      const token = createMockToken({
        iat: iatTime,
      });

      const issuedDate = getTokenIssuedAt(token);

      expect(issuedDate).toBeInstanceOf(Date);
      expect(issuedDate?.getTime()).toBe(iatTime * 1000);
    });

    it('should return null for token with no iat', () => {
      const token = createMockToken({
        iat: 0,
      });

      expect(getTokenIssuedAt(token)).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(getTokenIssuedAt('invalid-token')).toBeNull();
    });

    it('should accept decoded token object', () => {
      const iatTime = Math.floor(Date.now() / 1000);
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['user'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: iatTime,
      };

      const issuedDate = getTokenIssuedAt(decoded);
      expect(issuedDate?.getTime()).toBe(iatTime * 1000);
    });

    it('should handle past issued dates', () => {
      const iatTime = Math.floor(Date.now() / 1000) - 7200; // 2 hours ago
      const token = createMockToken({
        iat: iatTime,
      });

      const issuedDate = getTokenIssuedAt(token);
      expect(issuedDate?.getTime()).toBe(iatTime * 1000);
      expect(issuedDate!.getTime()).toBeLessThan(Date.now());
    });

    it('should return null for empty string', () => {
      expect(getTokenIssuedAt('')).toBeNull();
    });
  });

  describe('getTokenAge', () => {
    it('should return age in seconds for valid token', () => {
      const iatTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createMockToken({
        iat: iatTime,
      });

      const age = getTokenAge(token);
      expect(age).toBeGreaterThanOrEqual(3600);
      expect(age).toBeLessThan(3700); // Allow some margin
    });

    it('should return 0 for token with no iat', () => {
      const token = createMockToken({
        iat: 0,
      });

      expect(getTokenAge(token)).toBe(0);
    });

    it('should return 0 for invalid token', () => {
      expect(getTokenAge('invalid-token')).toBe(0);
    });

    it('should accept decoded token object', () => {
      const iatTime = Math.floor(Date.now() / 1000) - 1800; // 30 minutes ago
      const decoded: DecodedToken = {
        sub: '123',
        email: 'test@example.com',
        roles: ['user'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: iatTime,
      };

      const age = getTokenAge(decoded);
      expect(age).toBeGreaterThanOrEqual(1800);
      expect(age).toBeLessThan(1900);
    });

    it('should handle freshly issued token', () => {
      const token = createMockToken({
        iat: Math.floor(Date.now() / 1000),
      });

      const age = getTokenAge(token);
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(5); // Should be very recent
    });

    it('should return 0 for empty string', () => {
      expect(getTokenAge('')).toBe(0);
    });
  });
});
