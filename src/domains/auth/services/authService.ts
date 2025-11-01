// ========================================
// Authentication Service
// All API calls for authentication domain
// ========================================

import { apiClient } from '../../../services/api/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  PasswordResetRequest,
  PasswordResetResponse,
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
} from '../types/auth.types';

const API_PREFIX = '/api/v1/auth';

/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(`${API_PREFIX}/login`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/register
 * Register a new user account
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(`${API_PREFIX}/register`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/logout
 * Logout the current user
 */
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>(`${API_PREFIX}/logout`);
  return response.data;
};

/**
 * POST /api/v1/auth/password-reset
 * Request a password reset link
 */
export const passwordReset = async (data: PasswordResetRequest): Promise<PasswordResetResponse> => {
  const response = await apiClient.post<PasswordResetResponse>(`${API_PREFIX}/password-reset`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/reset-password
 * Reset password using token from email
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(`${API_PREFIX}/reset-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/forgot-password
 * Initiate forgot password flow
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(`${API_PREFIX}/forgot-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/change-password
 * Change password for authenticated user
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post<ChangePasswordResponse>(`${API_PREFIX}/change-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/verify-email
 * Verify email using token from email
 */
export const verifyEmail = async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  const response = await apiClient.post<VerifyEmailResponse>(`${API_PREFIX}/verify-email`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/resend-verification
 * Resend email verification link
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
  passwordReset,
  resetPassword,
  forgotPassword,
  changePassword,
  verifyEmail,
  resendVerification,
};

export default authService;

