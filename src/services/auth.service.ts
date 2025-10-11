/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { API_ENDPOINTS, TOKEN_KEYS } from '../config/api.config';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
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
import apiService from './api.service';

class AuthService {
  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);

    if (response.access_token && response.refresh_token) {
      apiService.setAuthTokens(response.access_token, response.refresh_token);
      this.storeUserData(response);
    }

    return response;
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return apiService.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      await apiService.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      this.clearUserData();
      apiService.clearAuth();
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return apiService.post<VerifyEmailResponse>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
  }

  /**
   * Resend verification email
   */
  async resendVerification(data: ResendVerificationRequest): Promise<ResendVerificationResponse> {
    return apiService.post<ResendVerificationResponse>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      data
    );
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    return apiService.post<PasswordResetResponse>(API_ENDPOINTS.AUTH.PASSWORD_RESET, data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return apiService.post<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return apiService.post<ChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  // ==================== Helper Methods ====================

  /**
   * Store user data in localStorage
   */
  private storeUserData(data: LoginResponse): void {
    const userData = {
      user_id: data.user_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
      is_verified: data.is_verified,
      is_approved: data.is_approved,
      last_login_at: data.last_login_at,
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
    return apiService.isAuthenticated();
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
