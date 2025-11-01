// ========================================
// Token Types
// ========================================

/**
 * POST /api/v1/auth/refresh - Refresh token request
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * POST /api/v1/auth/refresh - Refresh token response
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

/**
 * GET /api/v1/auth/csrf-token - Get CSRF token response
 */
export interface CsrfTokenResponse {
  csrf_token: string;
  expires_at: string;
}

/**
 * POST /api/v1/auth/validate-csrf - Validate CSRF token request
 */
export interface ValidateCsrfRequest {
  csrf_token: string;
}

/**
 * POST /api/v1/auth/validate-csrf - Validate CSRF token response
 */
export interface ValidateCsrfResponse {
  valid: boolean;
  message: string;
}

/**
 * Token storage interface
 */
export interface TokenStorage {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

/**
 * Decoded JWT token payload
 */
export interface DecodedToken {
  sub: string; // user_id
  email: string;
  roles: string[];
  exp: number;
  iat: number;
}

