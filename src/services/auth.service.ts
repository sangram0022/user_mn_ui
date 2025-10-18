/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Refactored to use unified apiClient from lib/api/client.ts
 *
 * NOTE: This service now acts as a thin wrapper around apiClient,
 * maintaining backward compatibility with existing code while
 * using the modern fetch-based client under the hood.
 */

import { apiClient } from '@lib/api';
import type {
  ChangePasswordRequest as SharedChangePasswordRequest,
  LoginResponse as SharedLoginResponse,
  RegisterRequest as SharedRegisterRequest,
  ResendVerificationRequest as SharedResendVerificationRequest,
  ResetPasswordRequest as SharedResetPasswordRequest,
} from '@shared/types';
import { TOKEN_KEYS } from '../config/api.config';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '../types/api.types';

class AuthService {
  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.login(credentials);

    if (response.access_token && response.refresh_token) {
      apiClient.setSessionTokens(response);
      // Store user data for backward compatibility
      this.storeUserDataFromSharedResponse(response);
    }

    // Map shared response to local response type for backward compatibility
    return this.mapToLocalLoginResponse(response);
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    // Map to shared types
    const sharedRequest: SharedRegisterRequest = {
      email: userData.email,
      password: userData.password,
      confirm_password: userData.confirm_password,
      first_name: userData.first_name,
      last_name: userData.last_name,
    };

    const response = await apiClient.register(sharedRequest);

    // Map shared response to local response type for backward compatibility
    return {
      message: 'Registration successful',
      user_id: response.user_id,
      email: response.email,
      verification_required: response.verification_required ?? false,
      approval_required: response.approval_required ?? false,
      created_at: response.created_at ?? new Date().toISOString(),
      verification_token: response.verification_token ?? '',
    };
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.logout();
    } finally {
      this.clearUserData();
      apiClient.clearSession();
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const response = await apiClient.verifyEmail(data.token);

    // Map to local response type for backward compatibility
    return {
      message: response.message,
      verified_at: new Date().toISOString(),
      approval_required: false,
      user_id: '',
    };
  }

  /**
   * Resend verification email
   */
  async resendVerification(data: ResendVerificationRequest): Promise<ResendVerificationResponse> {
    const sharedRequest: SharedResendVerificationRequest = {
      email: data.email,
    };

    const response = await apiClient.resendVerification(sharedRequest);

    return {
      message: response.message,
      email: response.email,
      resent_at: response.resent_at ?? new Date().toISOString(),
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    const response = await apiClient.requestPasswordReset(data.email);

    return {
      message: response.message,
      email: response.email,
      reset_token_sent: response.reset_token_sent ?? true,
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const sharedRequest: SharedResetPasswordRequest = {
      token: data.token,
      new_password: data.new_password,
      confirm_password: data.new_password,
    };

    const response = await apiClient.resetPassword(sharedRequest);

    return {
      message: response.message,
    };
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const sharedRequest: SharedChangePasswordRequest = {
      current_password: data.current_password,
      new_password: data.new_password,
      confirm_password: data.new_password,
    };

    const response = await apiClient.changePassword(sharedRequest);

    return {
      message: response.message ?? 'Password changed successfully',
    };
  }

  // ==================== Helper Methods ====================

  /**
   * Map shared LoginResponse to local LoginResponse
   */
  private mapToLocalLoginResponse(sharedResponse: SharedLoginResponse): LoginResponse {
    // Get user data from localStorage (already stored)
    const userData = this.getCurrentUser();

    return {
      message: 'Login successful',
      user_id: sharedResponse.user_id,
      email: sharedResponse.email,
      first_name: userData?.first_name ?? '',
      last_name: userData?.last_name ?? '',
      role: sharedResponse.role,
      is_verified: userData?.is_verified ?? false,
      is_approved: userData?.is_approved ?? false,
      access_token: sharedResponse.access_token,
      refresh_token: sharedResponse.refresh_token,
      token_type: sharedResponse.token_type,
      expires_in: sharedResponse.expires_in,
      last_login_at: sharedResponse.last_login_at ?? new Date().toISOString(),
    };
  }

  /**
   * Store user data from shared login response
   */
  private storeUserDataFromSharedResponse(response: SharedLoginResponse): void {
    const userData = {
      user_id: response.user_id,
      email: response.email,
      first_name: '', // Not in shared response
      last_name: '', // Not in shared response
      role: response.role,
      is_verified: false, // Not in shared response
      is_approved: false, // Not in shared response
      last_login_at: response.last_login_at ?? new Date().toISOString(),
    };
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
  }

  /**
   * Clear user data from localStorage
   */
  private clearUserData(): void {
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user?.role ? roles.includes(user.role) : false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasAnyRole(['admin', 'super_admin']);
  }

  /**
   * Check if user is verified
   */
  isVerified(): boolean {
    const user = this.getCurrentUser();
    return user?.is_verified === true;
  }

  /**
   * Check if user is approved
   */
  isApproved(): boolean {
    const user = this.getCurrentUser();
    return user?.is_approved === true;
  }
}

export default new AuthService();
