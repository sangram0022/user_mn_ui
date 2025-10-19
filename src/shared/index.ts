/**
 * Shared Module Exports
 * Central export point for commonly used shared components, hooks, and utilities
 */

// Form Components
export { PasswordInput, SubmitButton, TextInput } from './components/forms/FormComponents';
export type {
  BaseInputProps,
  PasswordInputProps,
  TextInputProps,
} from './components/forms/FormComponents';

// Form Hooks
export { useFormState, useLoadingState, usePasswordVisibility } from './hooks/useCommonFormState';

// UI Components
export { ToastContainer } from './components/ui/ToastContainer';
export { default as ErrorAlert } from './ui/ErrorAlert';

// Utils
export * from './utils/formValidation';
