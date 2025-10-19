/**
 * Authentication API Service
 * Reference: API_DOCUMENTATION_COMPLETE.md - Authentication APIs
 */

import { apiClient } from '@lib/api/client';
import type { ChangePasswordRequest, RegisterRequest, ResetPasswordRequest } from '@shared/types';
import { logger } from '@shared/utils/logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface LoginResponse {
  token: AuthToken;
  user: AuthUser;
  message: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  /**
   * User Login
   * POST /auth/login
   *
   * Authenticate user and receive access token and refresh token.
   *
   * @param credentials - User email and password
   * @returns LoginResponse with token and user data
   *
   * @example
   * const response = await authService.login({
   *   email: 'user@example.com',
   *   password: 'SecurePassword123!'
   * });
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      logger.debug('[AuthService] Login attempt', { email: credentials.email });

      const response = await apiClient.login(credentials.email, credentials.password);

      logger.info('[AuthService] Login successful', {
        userId: response.user_id,
        email: credentials.email,
      });

      return {
        token: {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expiresIn: response.expires_in,
          tokenType: response.token_type,
        },
        user: {
          id: response.user_id ?? '',
          email: response.email ?? '',
          firstName: '',
          lastName: '',
          isEmailVerified: false,
          isActive: true,
          createdAt: '',
        },
        message: 'Login successful',
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Login failed', error);
      } else {
        logger.error('[AuthService] Login failed');
      }
      throw error;
    }
  }

  /**
   * Secure Login (httpOnly Cookies)
   * POST /auth/login-secure
   *
   * Login with httpOnly cookie-based token storage.
   * Recommended for maximum security against XSS attacks.
   *
   * @param credentials - User email and password
   * @returns LoginResponse with user data
   */
  async loginSecure(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      logger.debug('[AuthService] Secure login attempt', { email: credentials.email });

      const response = await apiClient.loginSecure(credentials.email, credentials.password);

      logger.info('[AuthService] Secure login successful', {
        userId: response.user_id,
        email: credentials.email,
      });

      return {
        token: {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expiresIn: response.expires_in,
          tokenType: response.token_type,
        },
        user: {
          id: response.user_id ?? '',
          email: response.email ?? '',
          firstName: '',
          lastName: '',
          isEmailVerified: false,
          isActive: true,
          createdAt: '',
        },
        message: 'Secure login successful',
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Secure login failed', error);
      } else {
        logger.error('[AuthService] Secure login failed');
      }
      throw error;
    }
  }

  /**
   * User Registration
   * POST /auth/register
   *
   * Register a new user account.
   *
   * Password Requirements:
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character (!@#$%^&*)
   *
   * @param payload - Registration data
   * @returns Registered user data
   *
   * @example
   * const user = await authService.register({
   *   email: 'newuser@example.com',
   *   password: 'SecurePassword123!',
   *   first_name: 'Jane',
   *   last_name: 'Smith',
   * });
   */
  async register(payload: RegisterRequest) {
    try {
      logger.debug('[AuthService] Registration attempt', { email: payload.email });

      const response = await apiClient.register(payload);

      logger.info('[AuthService] Registration successful', {
        userId: response.user_id,
        email: payload.email,
      });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Registration failed', error);
      } else {
        logger.error('[AuthService] Registration failed');
      }
      throw error;
    }
  }

  /**
   * Verify Email
   * POST /auth/verify-email
   *
   * Verify user email using verification token received in email.
   *
   * @param token - Verification token from email
   * @returns Verification result
   *
   * @example
   * const result = await authService.verifyEmail('verification-token-received-in-email');
   */
  async verifyEmail(token: string) {
    try {
      logger.debug('[AuthService] Email verification attempt');

      const response = await apiClient.verifyEmail(token);

      logger.info('[AuthService] Email verified successfully');

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Email verification failed', error);
      } else {
        logger.error('[AuthService] Email verification failed');
      }
      throw error;
    }
  }

  /**
   * Resend Verification Email
   * POST /auth/resend-verification
   *
   * Request a new verification email.
   *
   * @param email - User email address
   * @returns Resend result
   */
  async resendVerificationEmail(email: string) {
    try {
      logger.debug('[AuthService] Resending verification email', { email });

      const response = await apiClient.resendVerification({ email });

      logger.info('[AuthService] Verification email resent', { email });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Resend verification failed', error);
      } else {
        logger.error('[AuthService] Resend verification failed');
      }
      throw error;
    }
  }

  /**
   * Forgot Password
   * POST /auth/forgot-password
   *
   * Request password reset email.
   *
   * @param email - User email address
   * @returns Password reset email sent confirmation
   *
   * @example
   * const result = await authService.forgotPassword('user@example.com');
   */
  async forgotPassword(email: string) {
    try {
      logger.debug('[AuthService] Forgot password request', { email });

      const response = await apiClient.forgotPassword(email);

      logger.info('[AuthService] Forgot password email sent', { email });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Forgot password failed', error);
      } else {
        logger.error('[AuthService] Forgot password failed');
      }
      throw error;
    }
  }

  /**
   * Reset Password
   * POST /auth/reset-password
   *
   * Reset password using token from email.
   *
   * @param payload - Reset token and new password
   * @returns Password reset confirmation
   *
   * @example
   * const result = await authService.resetPassword({
   *   token: 'password-reset-token',
   *   new_password: 'NewSecurePassword123!'
   * });
   */
  async resetPassword(payload: ResetPasswordRequest) {
    try {
      logger.debug('[AuthService] Password reset attempt');

      const response = await apiClient.resetPassword(payload);

      logger.info('[AuthService] Password reset successful');

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Password reset failed', error);
      } else {
        logger.error('[AuthService] Password reset failed');
      }
      throw error;
    }
  }

  /**
   * Change Password
   * POST /auth/change-password
   *
   * Change password for authenticated user.
   *
   * @param payload - Current and new password
   * @returns Password change confirmation
   *
   * @example
   * const result = await authService.changePassword({
   *   current_password: 'CurrentPassword123!',
   *   new_password: 'NewSecurePassword456!'
   * });
   */
  async changePassword(payload: ChangePasswordRequest) {
    try {
      logger.debug('[AuthService] Password change attempt');

      const response = await apiClient.changePassword(payload);

      logger.info('[AuthService] Password changed successfully');

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Password change failed', error);
      } else {
        logger.error('[AuthService] Password change failed');
      }
      throw error;
    }
  }

  /**
   * Logout
   * POST /auth/logout
   *
   * Logout user and invalidate session.
   *
   * @returns Logout confirmation
   *
   * @example
   * const result = await authService.logout();
   */
  async logout() {
    try {
      logger.debug('[AuthService] Logout attempt');

      const response = await apiClient.logout();

      logger.info('[AuthService] Logout successful');

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Logout failed', error);
      } else {
        logger.error('[AuthService] Logout failed');
      }
      throw error;
    }
  }

  /**
   * Refresh Token
   * POST /auth/refresh
   *
   * Get a new access token using refresh token.
   *
   * @param refreshToken - Refresh token
   * @returns New access token
   */
  async refreshToken(refreshToken: string) {
    try {
      logger.debug('[AuthService] Token refresh attempt');

      const response = await apiClient.execute('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      logger.info('[AuthService] Token refreshed successfully');

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Token refresh failed', error);
      } else {
        logger.error('[AuthService] Token refresh failed');
      }
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   *
   * @returns True if user has valid auth token
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get CSRF Token
   * GET /auth/csrf-token
   *
   * Retrieve CSRF token for POST/PUT/DELETE requests.
   *
   * @returns CSRF token
   */
  async getCSRFToken() {
    try {
      logger.debug('[AuthService] Getting CSRF token');

      const response = await apiClient.getCSRFToken();

      logger.debug('[AuthService] CSRF token retrieved');

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuthService] Failed to get CSRF token', error);
      } else {
        logger.error('[AuthService] Failed to get CSRF token');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();

export default authService;
