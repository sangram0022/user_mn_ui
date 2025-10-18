// Legacy bridge: re-export shared validation helpers during cleanup.
export {
  EMAIL_REGEX,
  STRONG_PASSWORD_REGEX,
  URL_REGEX,
  hasFormErrors,
  isFormValid,
  passwordConfirmation,
  useFormValidation,
  validateField,
  validateForm,
  type FormField,
  type FormState,
  type ValidationErrors,
  type ValidationRule,
  type ValidationValue,
} from '@shared/utils/validation';

export {
  validateAllFieldsFilled,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  type ValidationResult,
} from '@shared/utils/formValidation';
