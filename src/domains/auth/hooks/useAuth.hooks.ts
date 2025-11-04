// ========================================
// Authentication Hooks
// Production-ready React hooks for all auth operations
// Follows SOLID principles and Clean Code practices
// Uses React Query for consistent API with admin hooks
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import authService from '../services/authService';
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
} from '../types/auth.types';

// ========================================
// useLogin Hook
// ========================================

export function useLogin(): UseMutationResult<LoginResponseData, Error, LoginRequest> {
  return useMutation<LoginResponseData, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authService.login(credentials);
      return response;
    },
  });
}

// ========================================
// useRegister Hook
// ========================================

export function useRegister(): UseMutationResult<RegisterResponseData, Error, RegisterRequest> {
  return useMutation<RegisterResponseData, Error, RegisterRequest>({
    mutationFn: async (data: RegisterRequest) => {
      const response = await authService.register(data);
      return response;
    },
  });
}

// ========================================
// useForgotPassword Hook
// ========================================

export function useForgotPassword(): UseMutationResult<ForgotPasswordResponse, Error, ForgotPasswordRequest> {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequest>({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const response = await authService.forgotPassword(data);
      return response;
    },
  });
}

// ========================================
// useResetPassword Hook
// ========================================

export function useResetPassword(): UseMutationResult<ResetPasswordResponse, Error, ResetPasswordRequest> {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordRequest>({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await authService.resetPassword(data);
      return response;
    },
  });
}

// ========================================
// useChangePassword Hook
// ========================================

export function useChangePassword(): UseMutationResult<ChangePasswordResponse, Error, ChangePasswordRequest> {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordRequest>({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await authService.changePassword(data);
      return response;
    },
  });
}

// ========================================
// useVerifyEmail Hook
// ========================================

export function useVerifyEmail(): UseMutationResult<VerifyEmailResponse, Error, VerifyEmailRequest> {
  return useMutation<VerifyEmailResponse, Error, VerifyEmailRequest>({
    mutationFn: async (data: VerifyEmailRequest) => {
      const response = await authService.verifyEmail(data);
      return response;
    },
  });
}

// ========================================
// useResendVerification Hook
// ========================================

export function useResendVerification(): UseMutationResult<ResendVerificationResponse, Error, ResendVerificationRequest> {
  return useMutation<ResendVerificationResponse, Error, ResendVerificationRequest>({
    mutationFn: async (data: ResendVerificationRequest) => {
      const response = await authService.resendVerification(data);
      return response;
    },
  });
}
