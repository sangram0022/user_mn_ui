// ========================================
// Authentication Service
// All API calls for authentication domain
// Implements SOLID principles with response adapters
// 
// Response Format:
// All functions interact with backend ApiResponse<T> format:
// - Success: { success: true, data: T, message?, timestamp? }
// - Error: { success: false, error: string, field_errors?, message_code?, timestamp? }
// 
// Functions that use unwrapResponse() return the unwrapped data (T).
// Functions that return response.data directly return the full ApiResponse<T>.
// 
// @see {ApiResponse} @/core/api/types
// @see {ValidationErrorResponse} @/core/api/types
// ========================================

import { apiClient } from '../../../services/api/apiClient';
import { API_PREFIXES, unwrapResponse } from '../../../services/api/common';
import type {
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  RegisterRequest,
  RegisterResponse,
  RegisterResponseData,
  LogoutResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  RefreshTokenResponse,
  RefreshTokenResponseData,
} from '../types/auth.types';

const API_PREFIX = API_PREFIXES.AUTH;

/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 * 
 * @param data - Login credentials (email, password)
 * @returns Unwrapped login data (tokens, user info)
 * @throws {APIError} On validation or authentication failure
 * 
 * Backend returns: ApiResponse<LoginResponseData>
 * This function returns: LoginResponseData (unwrapped)
 */
export const login = async (data: LoginRequest): Promise<LoginResponseData> => {
  const response = await apiClient.post<LoginResponse>(`${API_PREFIX}/login`, data);
  return unwrapResponse<LoginResponseData>(response.data);
};

/**
 * POST /api/v1/auth/register
 * Register a new user account
 * 
 * @param data - Must include email, password, first_name, and last_name
 * @returns Unwrapped registration data (user info, verification status)
 * @throws {APIError} On validation failure (422) or registration error
 * 
 * Backend returns: ApiResponse<RegisterResponseData>
 * This function returns: RegisterResponseData (unwrapped)
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponseData> => {
  const response = await apiClient.post<RegisterResponse>(`${API_PREFIX}/register`, data);
  return unwrapResponse<RegisterResponseData>(response.data);
};

/**
 * POST /api/v1/auth/logout
 * Logout the current user
 * Works with or without auth token
 * 
 * @returns Full API response with logout confirmation
 * @throws {APIError} Rarely - logout typically succeeds
 * 
 * Backend returns: ApiResponse<{ message: string }>
 * This function returns: LogoutResponse (full response)
 */
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>(`${API_PREFIX}/logout`);
  return response.data;
};

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 * Must include refresh token in Authorization header
 * 
 * @param refreshTokenValue - The refresh token string
 * @returns Unwrapped token data (new access_token, refresh_token, expires_in)
 * @throws {APIError} On invalid or expired refresh token (401)
 * 
 * Backend returns: ApiResponse<RefreshTokenResponseData>
 * This function returns: RefreshTokenResponseData (unwrapped)
 */
export const refreshToken = async (refreshTokenValue: string): Promise<RefreshTokenResponseData> => {
  const response = await apiClient.post<RefreshTokenResponse>(
    `${API_PREFIX}/refresh`,
    null,
    {
      headers: {
        Authorization: `Bearer ${refreshTokenValue}`,
      },
    }
  );
  return unwrapResponse<RefreshTokenResponseData>(response.data);
};

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset link
 * Always returns success to prevent email enumeration
 * 
 * @param data - Email address for password reset
 * @returns Full API response with success message
 * @throws {APIError} On validation failure (422)
 * 
 * Backend returns: ApiResponse<{ message: string }>
 * This function returns: ForgotPasswordResponse (full response)
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(`${API_PREFIX}/forgot-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/reset-password
 * Reset password using token from email
 * 
 * @param data - Includes token, new_password, and confirm_password
 * @returns Full API response with success message
 * @throws {APIError} On invalid token or validation failure
 * 
 * Backend returns: ApiResponse<{ message: string }>
 * This function returns: ResetPasswordResponse (full response)
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(`${API_PREFIX}/reset-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/change-password
 * Change password for authenticated user
 * Requires current password for security
 * 
 * @param data - Includes current_password, new_password, and confirm_password
 * @returns Full API response with success message
 * @throws {APIError} On incorrect current password or validation failure
 * 
 * Backend returns: ApiResponse<{ message: string }>
 * This function returns: ChangePasswordResponse (full response)
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post<ChangePasswordResponse>(`${API_PREFIX}/change-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/verify-email
 * Verify email using token from email
 * Token expires in 24 hours
 * 
 * @param data - Verification token from email
 * @returns Full API response with verification status
 * @throws {APIError} On invalid or expired token
 * 
 * Backend returns: ApiResponse<{ message: string, email_verified: boolean }>
 * This function returns: VerifyEmailResponse (full response)
 */
export const verifyEmail = async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  const response = await apiClient.post<VerifyEmailResponse>(`${API_PREFIX}/verify-email`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/resend-verification
 * Resend email verification link
 * 
 * @param data - Email address for resending verification
 * @returns Full API response with success message
 * @throws {APIError} On validation failure or rate limiting
 * 
 * Backend returns: ApiResponse<{ message: string }>
 * This function returns: ResendVerificationResponse (full response)
 */
export const resendVerification = async (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
  const response = await apiClient.post<ResendVerificationResponse>(`${API_PREFIX}/resend-verification`, data);
  return response.data;
};

// Export all as default object
const authService = {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification,
};

export default authService;
