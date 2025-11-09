// ========================================
// Authentication Hooks
// Production-ready React hooks for all auth operations
// Follows SOLID principles and Clean Code practices
// Migrated to useApiModern for consistency
// ========================================

import { useApiMutation } from '@/shared/hooks/useApiModern';
import { apiPost } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '@/services/api/common';
import type {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  RefreshTokenResponseData,
  LogoutResponse,
} from '../types/auth.types';

const API_PREFIX = API_PREFIXES.AUTH;

// ========================================
// useLogin Hook
// POST /api/v1/auth/login
// ========================================

export function useLogin() {
  return useApiMutation(
    async (credentials: LoginRequest): Promise<LoginResponseData> => {
      // Backend DOES wrap response: { success: true, data: { access_token, ... } }
      // So we use apiPost which calls unwrapResponse()
      const response = await apiPost<LoginResponseData>(`${API_PREFIX}/login`, credentials);
      return response;
    },
    {
      successMessage: 'Login successful',
      errorToast: true,
    }
  );
}

// ========================================
// useRegister Hook
// POST /api/v1/auth/register
// ========================================

export function useRegister() {
  return useApiMutation(
    async (data: RegisterRequest): Promise<RegisterResponseData> => {
      const response = await apiPost<RegisterResponseData>(`${API_PREFIX}/register`, data);
      return response;
    },
    {
      successMessage: 'Registration successful! Please check your email.',
      errorToast: true,
    }
  );
}

// ========================================
// useForgotPassword Hook
// POST /api/v1/auth/forgot-password
// ========================================

export function useForgotPassword() {
  return useApiMutation(
    async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
      const response = await apiPost<ForgotPasswordResponse>(
        `${API_PREFIX}/forgot-password`,
        data
      );
      return response;
    },
    {
      successMessage: 'Password reset link sent! Check your email.',
      errorToast: true,
    }
  );
}

// ========================================
// useResetPassword Hook
// POST /api/v1/auth/reset-password
// ========================================

export function useResetPassword() {
  return useApiMutation(
    async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
      const response = await apiPost<ResetPasswordResponse>(
        `${API_PREFIX}/reset-password`,
        data
      );
      return response;
    },
    {
      successMessage: 'Password reset successful! You can now login.',
      errorToast: true,
    }
  );
}

// ========================================
// useChangePassword Hook
// POST /api/v1/auth/change-password
// ========================================

export function useChangePassword() {
  return useApiMutation(
    async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
      const response = await apiPost<ChangePasswordResponse>(
        `${API_PREFIX}/change-password`,
        data
      );
      return response;
    },
    {
      successMessage: 'Password changed successfully!',
      errorToast: true,
    }
  );
}

// ========================================
// useVerifyEmail Hook
// POST /api/v1/auth/verify-email
// ========================================

export function useVerifyEmail() {
  return useApiMutation(
    async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
      const response = await apiPost<VerifyEmailResponse>(
        `${API_PREFIX}/verify-email`,
        data
      );
      return response;
    },
    {
      successMessage: 'Email verified successfully!',
      errorToast: true,
    }
  );
}

// ========================================
// useResendVerification Hook
// POST /api/v1/auth/resend-verification
// ========================================

export function useResendVerification() {
  return useApiMutation(
    async (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
      const response = await apiPost<ResendVerificationResponse>(
        `${API_PREFIX}/resend-verification`,
        data
      );
      return response;
    },
    {
      successMessage: 'Verification email sent! Check your inbox.',
      errorToast: true,
    }
  );
}

// ========================================
// useLogout Hook
// POST /api/v1/auth/logout
// ========================================

export function useLogout() {
  return useApiMutation(
    async (): Promise<LogoutResponse> => {
      const response = await apiPost<LogoutResponse>(`${API_PREFIX}/logout`, null);
      return response;
    },
    {
      successMessage: 'Logged out successfully',
      errorToast: false, // Logout errors shouldn't block UI
    }
  );
}

// ========================================
// useRefreshToken Hook
// POST /api/v1/auth/refresh
// ========================================

export function useRefreshToken() {
  return useApiMutation(
    async (refreshTokenValue: string): Promise<RefreshTokenResponseData> => {
      const response = await apiPost<RefreshTokenResponseData>(
        `${API_PREFIX}/refresh`,
        { refresh_token: refreshTokenValue }
      );
      return response;
    },
    {
      errorToast: false, // Silent refresh failures
    }
  );
}
