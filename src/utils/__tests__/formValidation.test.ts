import { describe, it, expect } from 'vitest';
import {
  validateField,
  validateForm,
  isFormValid,
  ValidationRules,
  passwordConfirmation,
  type ValidationRule,
  type FormState,
} from '../formValidation';

describe('formValidation utilities', () => {
  it('validates required fields', () => {
    const error = validateField('', { required: true });
    expect(error).toBe('This field is required');
  });

  it('validates email pattern', () => {
  const emailRule = ValidationRules.email as ValidationRule;
    expect(validateField('user@example.com', emailRule)).toBeNull();
  expect(validateField('invalid-email', emailRule)).toBe('Invalid format');
  });

  it('validates password confirmation', () => {
  const confirmRule = passwordConfirmation('StrongP@ss1') as ValidationRule;
    expect(validateField('StrongP@ss1', confirmRule)).toBeNull();
    expect(validateField('Mismatch', confirmRule)).toBe('Passwords do not match');
  });

  it('aggregates form errors', () => {
    const formState: FormState = {
      email: { value: 'invalid', rules: ValidationRules.email as ValidationRule },
      password: { value: 'short', rules: ValidationRules.password as ValidationRule },
    };

    const errors = validateForm(formState);
    expect(Object.keys(errors)).toContain('email');
    expect(Object.keys(errors)).toContain('password');
    expect(isFormValid(formState)).toBe(false);
  });
});
