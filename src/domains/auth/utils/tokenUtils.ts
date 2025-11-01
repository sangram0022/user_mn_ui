// ========================================
// Token Utilities
// JWT decoding, validation, and expiration helpers
// ========================================

import type { DecodedToken } from '../types/token.types';

/**
 * Base64 URL decode
 * Handles JWT base64url encoding format
 */
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Pad with '=' to make length multiple of 4
  while (base64.length % 4) {
    base64 += '=';
  }
  
  try {
    return atob(base64);
  } catch {
    throw new Error('Invalid base64 string');
  }
}

/**
 * Decode JWT token without verification
 * Note: This does NOT verify the token signature
 * 
 * @param token - JWT token string
 * @returns Decoded token payload
 * @throws Error if token is invalid
 * 
 * @example
 * ```ts
 * const decoded = decodeToken('eyJhbGc...');
 * console.log(decoded.email); // "user@example.com"
 * console.log(decoded.exp); // 1699999999
 * ```
 */
export function decodeToken(token: string): DecodedToken {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token: token must be a non-empty string');
  }

  const parts = token.split('.');
  
  if (parts.length !== 3) {
    throw new Error('Invalid token: JWT must have 3 parts');
  }

  try {
    const payload = base64UrlDecode(parts[1]);
    const decoded = JSON.parse(payload);

    return {
      sub: decoded.sub || '',
      email: decoded.email || '',
      roles: decoded.roles || [],
      exp: decoded.exp || 0,
      iat: decoded.iat || 0,
    };
  } catch (error) {
    throw new Error(`Failed to decode token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if token is expired
 * 
 * @param token - JWT token string or decoded token
 * @param bufferSeconds - Optional buffer time in seconds (default: 60)
 * @returns True if token is expired or will expire within buffer time
 * 
 * @example
 * ```ts
 * isTokenExpired(token); // false
 * isTokenExpired(token, 300); // Check with 5 min buffer
 * ```
 */
export function isTokenExpired(
  token: string | DecodedToken,
  bufferSeconds: number = 60
): boolean {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    
    if (!decoded.exp) {
      return true; // No expiration time means invalid token
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = decoded.exp - bufferSeconds;
    
    return now >= expiresAt;
  } catch {
    return true; // Invalid token is considered expired
  }
}

/**
 * Get token expiration time
 * 
 * @param token - JWT token string or decoded token
 * @returns Expiration date or null if invalid
 * 
 * @example
 * ```ts
 * const expiresAt = getTokenExpiration(token);
 * console.log(expiresAt?.toLocaleString()); // "11/1/2025, 10:30:00 AM"
 * ```
 */
export function getTokenExpiration(token: string | DecodedToken): Date | null {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    
    if (!decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Get time remaining until token expires
 * 
 * @param token - JWT token string or decoded token
 * @returns Seconds until expiration, or 0 if expired/invalid
 * 
 * @example
 * ```ts
 * const seconds = getTokenTimeRemaining(token);
 * console.log(`Token expires in ${Math.floor(seconds / 60)} minutes`);
 * ```
 */
export function getTokenTimeRemaining(token: string | DecodedToken): number {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    
    if (!decoded.exp) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;
    
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

/**
 * Extract user ID from token
 * 
 * @param token - JWT token string or decoded token
 * @returns User ID or null if invalid
 */
export function getUserIdFromToken(token: string | DecodedToken): string | null {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    return decoded.sub || null;
  } catch {
    return null;
  }
}

/**
 * Extract email from token
 * 
 * @param token - JWT token string or decoded token
 * @returns Email or null if invalid
 */
export function getEmailFromToken(token: string | DecodedToken): string | null {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    return decoded.email || null;
  } catch {
    return null;
  }
}

/**
 * Extract roles from token
 * 
 * @param token - JWT token string or decoded token
 * @returns Array of role strings
 */
export function getRolesFromToken(token: string | DecodedToken): string[] {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    return decoded.roles || [];
  } catch {
    return [];
  }
}

/**
 * Check if user has specific role
 * 
 * @param token - JWT token string or decoded token
 * @param role - Role to check for
 * @returns True if user has the role
 * 
 * @example
 * ```ts
 * if (hasRole(token, 'admin')) {
 *   // Show admin features
 * }
 * ```
 */
export function hasRole(token: string | DecodedToken, role: string): boolean {
  const roles = getRolesFromToken(token);
  return roles.includes(role);
}

/**
 * Check if user has any of the specified roles
 * 
 * @param token - JWT token string or decoded token
 * @param roles - Array of roles to check
 * @returns True if user has at least one role
 */
export function hasAnyRole(token: string | DecodedToken, roles: string[]): boolean {
  const userRoles = getRolesFromToken(token);
  return roles.some(role => userRoles.includes(role));
}

/**
 * Check if user has all specified roles
 * 
 * @param token - JWT token string or decoded token
 * @param roles - Array of roles to check
 * @returns True if user has all roles
 */
export function hasAllRoles(token: string | DecodedToken, roles: string[]): boolean {
  const userRoles = getRolesFromToken(token);
  return roles.every(role => userRoles.includes(role));
}

/**
 * Validate token structure (basic check)
 * Does NOT verify signature
 * 
 * @param token - JWT token string
 * @returns True if token has valid structure
 */
export function isValidTokenStructure(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    base64UrlDecode(parts[1]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get token issued at time
 * 
 * @param token - JWT token string or decoded token
 * @returns Issued date or null if invalid
 */
export function getTokenIssuedAt(token: string | DecodedToken): Date | null {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    
    if (!decoded.iat) {
      return null;
    }

    return new Date(decoded.iat * 1000);
  } catch {
    return null;
  }
}

/**
 * Get token age in seconds
 * 
 * @param token - JWT token string or decoded token
 * @returns Age in seconds, or 0 if invalid
 */
export function getTokenAge(token: string | DecodedToken): number {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    
    if (!decoded.iat) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    return now - decoded.iat;
  } catch {
    return 0;
  }
}
