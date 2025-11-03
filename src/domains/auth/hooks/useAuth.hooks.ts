// ========================================
// Authentication Hooks
// Production-ready React hooks for all auth operations
// Follows SOLID principles and Clean Code practices
// ========================================

import { useState } from 'react';
import authService from '../services/authService';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from '../types/auth.types';
import { extractErrorDetails, type ErrorDetails } from '../utils/error.utils';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordConfirmation,
  validateForm,
  type ValidationResult,
} from '../utils/validation.utils';

// ========================================
// Base Hook State
// ========================================

interface BaseHookState {
  loading: boolean;
  error: ErrorDetails | null;
  fieldErrors: Record<string, string> | null;
}

// ========================================
// useLogin Hook
// ========================================

export function useLogin() {
  const [state, setState] = useState<BaseHookState>({
    loading: false,
    error: null,
    fieldErrors: null,
  });

  const login = async (credentials: LoginRequest) => {
    setState({ loading: true, error: null, fieldErrors: null });

    try {
      // Client-side validation
      const validationResult = validateForm({
        email: validateEmail(credentials.email),
        password: { isValid: !!credentials.password, errors: credentials.password ? [] : ['Password is required'] },
      });

      if (!validationResult.isValid) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(validationResult.fieldErrors).forEach(([field, errors]) => {
          fieldErrors[field] = errors.join('\n');
        });
        
        setState({
          loading: false,
          error: { message: 'Please check your input' },
          fieldErrors,
        });
        return { success: false, fieldErrors };
      }

      // Call API
      const response = await authService.login(credentials);
      
      setState({ loading: false, error: null, fieldErrors: null });
      return { success: true, data: response };
    } catch (error) {
      const errorDetails = extractErrorDetails(error);
      setState({
        loading: false,
        error: errorDetails,
        fieldErrors: errorDetails.fieldErrors || null,
      });
      return { success: false, error: errorDetails };
    }
  };

  return {
    ...state,
    login,
  };
}

// ========================================
// useRegister Hook
// ========================================

export function useRegister() {
  const [state, setState] = useState<BaseHookState>({
    loading: false,
    error: null,
    fieldErrors: null,
  });

  const register = async (data: RegisterRequest) => {
    setState({ loading: true, error: null, fieldErrors: null });

    try {
      // Client-side validation
      const validations: Record<string, ValidationResult> = {
        email: validateEmail(data.email),
        password: validatePassword(data.password),
      };

      // Validate password confirmation if provided
      if (data.confirm_password) {
        validations.confirm_password = validatePasswordConfirmation(data.password, data.confirm_password);
      }

      // Validate names
      if (data.first_name && data.last_name) {
        validations.first_name = validateName(data.first_name, 'First name');
        validations.last_name = validateName(data.last_name, 'Last name');
      } else if (data.full_name) {
        validations.full_name = validateName(data.full_name, 'Full name');
      } else {
        setState({
          loading: false,
          error: { message: 'Either provide first_name and last_name, or full_name' },
          fieldErrors: null,
        });
        return { success: false };
      }

      const validationResult = validateForm(validations);

      if (!validationResult.isValid) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(validationResult.fieldErrors).forEach(([field, errors]) => {
          fieldErrors[field] = errors.join('\n');
        });
        
        setState({
          loading: false,
          error: { message: 'Please check your input' },
          fieldErrors,
        });
        return { success: false, fieldErrors };
      }

      // Call API
      const response = await authService.register(data);
      
      setState({ loading: false, error: null, fieldErrors: null });
      return { success: true, data: response };
    } catch (error) {
      const errorDetails = extractErrorDetails(error);
      setState({
        loading: false,
        error: errorDetails,
        fieldErrors: errorDetails.fieldErrors || null,
      });
      return { success: false, error: errorDetails };
    }
  };

  return {
    ...state,
    register,
  };
}

// ========================================
// useForgotPassword Hook
// ========================================

export function useForgotPassword() {
  const [state, setState] = useState<BaseHookState>({
    loading: false,
    error: null,
    fieldErrors: null,
  });

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    setState({ loading: true, error: null, fieldErrors: null });

    try {
      // Client-side validation
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.isValid) {
        setState({
          loading: false,
          error: { message: emailValidation.errors.join('\n') },
          fieldErrors: { email: emailValidation.errors.join('\n') },
        });
        return { success: false };
      }

      // Call API
      const response = await authService.forgotPassword(data);
      
      setState({ loading: false, error: null, fieldErrors: null });
      return { success: true, data: response };
    } catch (error) {
      const errorDetails = extractErrorDetails(error);
      setState({
        loading: false,
        error: errorDetails,
        fieldErrors: errorDetails.fieldErrors || null,
      });
      return { success: false, error: errorDetails };
    }
  };

  return {
    ...state,
    forgotPassword,
  };
}

// ========================================
// useResetPassword Hook
// ========================================

export function useResetPassword() {
  const [state, setState] = useState<BaseHookState>({
    loading: false,
    error: null,
    fieldErrors: null,
  });

  const resetPassword = async (data: ResetPasswordRequest) => {
    setState({ loading: true, error: null, fieldErrors: null });

    try {
      // Client-side validation
      const validationResult = validateForm({
        new_password: validatePassword(data.new_password),
        confirm_password: validatePasswordConfirmation(data.new_password, data.confirm_password),
      });

      if (!validationResult.isValid) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(validationResult.fieldErrors).forEach(([field, errors]) => {
          fieldErrors[field] = errors.join('\n');
        });
        
        setState({
          loading: false,
          error: { message: 'Please check your input' },
          fieldErrors,
        });
        return { success: false, fieldErrors };
      }

      // Call API
      const response = await authService.resetPassword(data);
      
      setState({ loading: false, error: null, fieldErrors: null });
      return { success: true, data: response };
    } catch (error) {
      const errorDetails = extractErrorDetails(error);
      setState({
        loading: false,
        error: errorDetails,
        fieldErrors: errorDetails.fieldErrors || null,
      });
      return { success: false, error: errorDetails };
    }
  };

  return {
    ...state,
    resetPassword,
  };
}

// ========================================
// useChangePassword Hook
// ========================================

export function useChangePassword() {
  const [state, setState] = useState<BaseHookState>({
    loading: false,
    error: null,
    fieldErrors: null,
  });

  const changePassword = async (data: ChangePasswordRequest) => {
    setState({ loading: true, error: null, fieldErrors: null });

    try {
      // Client-side validation
      const validationResult = validateForm({
        current_password: { 
          isValid: !!data.current_password, 
          errors: data.current_password ? [] : ['Current password is required'] 
        },
        new_password: validatePassword(data.new_password),
        confirm_password: validatePasswordConfirmation(data.new_password, data.confirm_password),
      });

      if (!validationResult.isValid) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(validationResult.fieldErrors).forEach(([field, errors]) => {
          fieldErrors[field] = errors.join('\n');
        });
        
        setState({
          loading: false,
          error: { message: 'Please check your input' },
          fieldErrors,
        });
        return { success: false, fieldErrors };
      }

      // Call API
      const response = await authService.changePassword(data);
      
      setState({ loading: false, error: null, fieldErrors: null });
      return { success: true, data: response };
    } catch (error) {
      const errorDetails = extractErrorDetails(error);
      setState({
        loading: false,
        error: errorDetails,
        fieldErrors: errorDetails.fieldErrors || null,
      });
      return { success: false, error: errorDetails };
    }
  };

  return {
    ...state,
    changePassword,
  };
}

// ========================================
// useVerifyEmail Hook
// ========================================

export function useVerifyEmail() {
  const [state, setState] = useState<BaseHookState>({
    loading: false,
    error: null,
    fieldErrors: null,
  });

  const verifyEmail = async (data: VerifyEmailRequest) => {
    setState({ loading: true, error: null, fieldErrors: null });

    try {
      const response = await authService.verifyEmail(data);
      
      setState({ loading: false, error: null, fieldErrors: null });
      return { success: true, data: response };
    } catch (error) {
      const errorDetails = extractErrorDetails(error);
      setState({
        loading: false,
        error: errorDetails,
        fieldErrors: errorDetails.fieldErrors || null,
      });
      return { success: false, error: errorDetails };
    }
  };

  return {
    ...state,
    verifyEmail,
  };
}

// ========================================
// useResendVerification Hook
// ========================================

export function useResendVerification() {
  const [state, setState] = useState<BaseHookState>({
    loading: false,
    error: null,
    fieldErrors: null,
  });

  const resendVerification = async (data: ResendVerificationRequest) => {
    setState({ loading: true, error: null, fieldErrors: null });

    try {
      // Client-side validation
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.isValid) {
        setState({
          loading: false,
          error: { message: emailValidation.errors.join('\n') },
          fieldErrors: { email: emailValidation.errors.join('\n') },
        });
        return { success: false };
      }

      const response = await authService.resendVerification(data);
      
      setState({ loading: false, error: null, fieldErrors: null });
      return { success: true, data: response };
    } catch (error) {
      const errorDetails = extractErrorDetails(error);
      setState({
        loading: false,
        error: errorDetails,
        fieldErrors: errorDetails.fieldErrors || null,
      });
      return { success: false, error: errorDetails };
    }
  };

  return {
    ...state,
    resendVerification,
  };
}
