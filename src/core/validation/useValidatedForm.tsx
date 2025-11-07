/**
 * Custom Hooks for React Hook Form Integration
 * Provides a standardized way to use forms with validation across the app
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../../hooks/useToast';
import { validationSchemas } from './schemas';

// ============================================================================
// Type Definitions (imported from schemas to avoid duplication)
// ============================================================================

type LoginFormData = z.infer<typeof validationSchemas.login>;
type RegisterFormData = z.infer<typeof validationSchemas.register>;
type ContactFormData = z.infer<typeof validationSchemas.contactForm>;
type UserEditFormData = z.infer<typeof validationSchemas.userEdit>;

// ============================================================================
// Specialized Form Hooks
// ============================================================================

interface FormHookOptions<T> {
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (error: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook for login forms
 */
export function useLoginForm(options?: FormHookOptions<LoginFormData>) {
  const toast = useToast();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(validationSchemas.login),
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await options?.onSuccess?.(data);
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
    } catch (error) {
      console.error('Login form error:', error);
      options?.onError?.(error);
      if (options?.errorMessage) {
        toast.error(options.errorMessage);
      }
    }
  });

  return {
    ...form,
    handleSubmit,
    isDisabled: form.formState.isSubmitting || !form.formState.isValid,
    hasErrors: Object.keys(form.formState.errors).length > 0,
  };
}

/**
 * Hook for registration forms
 */
export function useRegisterForm(options?: FormHookOptions<RegisterFormData>) {
  const toast = useToast();
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(validationSchemas.register),
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await options?.onSuccess?.(data);
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
    } catch (error) {
      console.error('Register form error:', error);
      options?.onError?.(error);
      if (options?.errorMessage) {
        toast.error(options.errorMessage);
      }
    }
  });

  return {
    ...form,
    handleSubmit,
    isDisabled: form.formState.isSubmitting || !form.formState.isValid,
    hasErrors: Object.keys(form.formState.errors).length > 0,
  };
}

/**
 * Hook for contact forms
 */
export function useContactForm(options?: FormHookOptions<ContactFormData>) {
  const toast = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(validationSchemas.contactForm),
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await options?.onSuccess?.(data);
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      options?.onError?.(error);
      if (options?.errorMessage) {
        toast.error(options.errorMessage);
      }
    }
  });

  return {
    ...form,
    handleSubmit,
    isDisabled: form.formState.isSubmitting || !form.formState.isValid,
    hasErrors: Object.keys(form.formState.errors).length > 0,
  };
}

/**
 * Hook for user edit forms
 */
export function useUserEditForm(options?: FormHookOptions<UserEditFormData>) {
  const toast = useToast();
  
  const form = useForm<UserEditFormData>({
    resolver: zodResolver(validationSchemas.userEdit),
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await options?.onSuccess?.(data);
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
    } catch (error) {
      console.error('User edit form error:', error);
      options?.onError?.(error);
      if (options?.errorMessage) {
        toast.error(options.errorMessage);
      }
    }
  });

  return {
    ...form,
    handleSubmit,
    isDisabled: form.formState.isSubmitting || !form.formState.isValid,
    hasErrors: Object.keys(form.formState.errors).length > 0,
  };
}

/**
 * Hook for forgot password forms
 */
export function useForgotPasswordForm(options?: FormHookOptions<{ email: string }>) {
  const toast = useToast();
  
  const form = useForm<{ email: string }>({
    resolver: zodResolver(z.object({
      email: z.string().email('Please enter a valid email address'),
    })),
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await options?.onSuccess?.(data);
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
    } catch (error) {
      console.error('Forgot password form error:', error);
      options?.onError?.(error);
      if (options?.errorMessage) {
        toast.error(options.errorMessage);
      }
    }
  });

  return {
    ...form,
    handleSubmit,
    isDisabled: form.formState.isSubmitting || !form.formState.isValid,
    hasErrors: Object.keys(form.formState.errors).length > 0,
  };
}