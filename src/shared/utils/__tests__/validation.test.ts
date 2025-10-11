/**
 * Unit Tests: Validation Utilities
 *
 * Tests form validation functions including:
 * - Field validation
 * - Form validation
 * - Validation rules
 * - Regex patterns
 */

import {
  EMAIL_REGEX,
  hasFormErrors,
  isFormValid,
  PHONE_REGEX,
  STRONG_PASSWORD_REGEX,
  URL_REGEX,
  validateField,
  validateForm,
  ValidationRules,
  type FormState,
  type ValidationRule,
} from '@shared/utils/validation';
import { describe, expect, it } from 'vitest';

// ============================================================================
// Regex Pattern Tests
// ============================================================================

describe('Validation Regex Patterns', () => {
  describe('EMAIL_REGEX', () => {
    it('should match valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example.com',
        'user123@example123.com',
      ];

      validEmails.forEach((email) => {
        expect(EMAIL_REGEX.test(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@example', // Missing TLD
        'invalid @example.com', // Space
        'invalid@.com', // Starts with dot
      ];

      invalidEmails.forEach((email) => {
        expect(EMAIL_REGEX.test(email)).toBe(false);
      });
    });
  });

  describe('STRONG_PASSWORD_REGEX', () => {
    it('should match strong passwords', () => {
      const strongPasswords = ['Password123', 'StrongP@ss1', 'MyP@ssw0rd', 'Test1234Test'];

      strongPasswords.forEach((password) => {
        expect(STRONG_PASSWORD_REGEX.test(password)).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'password', // No uppercase, no number
        'PASSWORD', // No lowercase, no number
        '12345678', // No letters
        'Pass1', // Too short
        'password123', // No uppercase
        'PASSWORD123', // No lowercase
      ];

      weakPasswords.forEach((password) => {
        expect(STRONG_PASSWORD_REGEX.test(password)).toBe(false);
      });
    });
  });

  describe('PHONE_REGEX', () => {
    it('should match valid phone numbers', () => {
      const validPhones = ['1234567890', '+11234567890', '+441234567890', '9876543210'];

      validPhones.forEach((phone) => {
        expect(PHONE_REGEX.test(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        'abc1234567890', // Contains letters
        '+0123456789', // Starts with 0 after +
        '12-345-6789', // Contains hyphens
        '0123456789', // Starts with 0
      ];

      invalidPhones.forEach((phone) => {
        expect(PHONE_REGEX.test(phone)).toBe(false);
      });
    });
  });

  describe('URL_REGEX', () => {
    it('should match valid URLs', () => {
      const validURLs = [
        'http://example.com',
        'https://example.com',
        'https://www.example.com',
        'https://example.com/path',
        'https://example.com/path?query=value',
        'https://subdomain.example.com',
      ];

      validURLs.forEach((url) => {
        expect(URL_REGEX.test(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidURLs = [
        'example.com', // No protocol
        'ftp://example.com', // Wrong protocol
        'http:/example.com', // Missing slash
        'http://example', // No TLD
        'http://.com', // No domain
      ];

      invalidURLs.forEach((url) => {
        expect(URL_REGEX.test(url)).toBe(false);
      });
    });
  });
});

// ============================================================================
// validateField Tests
// ============================================================================

describe('validateField', () => {
  describe('Required validation', () => {
    const rules: ValidationRule = { required: true };

    it('should pass for non-empty values', () => {
      expect(validateField('test', rules)).toBeNull();
      expect(validateField('  test  ', rules)).toBeNull();
      expect(validateField(123, rules)).toBeNull();
      expect(validateField(true, rules)).toBeNull();
    });

    it('should fail for empty values', () => {
      expect(validateField('', rules)).toBe('This field is required');
      expect(validateField('   ', rules)).toBe('This field is required');
      expect(validateField(null, rules)).toBe('This field is required');
      expect(validateField(undefined, rules)).toBe('This field is required');
    });
  });

  describe('MinLength validation', () => {
    const rules: ValidationRule = { minLength: 5 };

    it('should pass for values >= minLength', () => {
      expect(validateField('12345', rules)).toBeNull();
      expect(validateField('123456', rules)).toBeNull();
    });

    it('should fail for values < minLength', () => {
      expect(validateField('1234', rules)).toBe('Must be at least 5 characters');
      expect(validateField('123', rules)).toBe('Must be at least 5 characters');
    });

    it('should skip validation for empty values when not required', () => {
      expect(validateField('', rules)).toBeNull();
    });
  });

  describe('MaxLength validation', () => {
    const rules: ValidationRule = { maxLength: 10 };

    it('should pass for values <= maxLength', () => {
      expect(validateField('1234567890', rules)).toBeNull();
      expect(validateField('12345', rules)).toBeNull();
    });

    it('should fail for values > maxLength', () => {
      expect(validateField('12345678901', rules)).toBe('Must be no more than 10 characters');
    });
  });

  describe('Pattern validation', () => {
    const rules: ValidationRule = { pattern: /^\d+$/ }; // Only digits

    it('should pass for matching patterns', () => {
      expect(validateField('123', rules)).toBeNull();
      expect(validateField('456789', rules)).toBeNull();
    });

    it('should fail for non-matching patterns', () => {
      expect(validateField('abc', rules)).toBe('Invalid format');
      expect(validateField('123abc', rules)).toBe('Invalid format');
    });
  });

  describe('Custom validation', () => {
    const rules: ValidationRule = {
      custom: (value) => {
        if (value === 'forbidden') {
          return 'This value is not allowed';
        }
        return null;
      },
    };

    it('should pass custom validation', () => {
      expect(validateField('allowed', rules)).toBeNull();
    });

    it('should fail custom validation', () => {
      expect(validateField('forbidden', rules)).toBe('This value is not allowed');
    });
  });

  describe('Combined validations', () => {
    const rules: ValidationRule = {
      required: true,
      minLength: 3,
      maxLength: 10,
      pattern: /^[a-zA-Z]+$/, // Only letters
    };

    it('should pass all validations', () => {
      expect(validateField('test', rules)).toBeNull();
      expect(validateField('hello', rules)).toBeNull();
    });

    it('should fail on first violation', () => {
      expect(validateField('', rules)).toBe('This field is required');
      expect(validateField('ab', rules)).toBe('Must be at least 3 characters');
      expect(validateField('12345678901', rules)).toBe('Must be no more than 10 characters');
      expect(validateField('test123', rules)).toBe('Invalid format');
    });
  });
});

// ============================================================================
// validateForm Tests
// ============================================================================

describe('validateForm', () => {
  it('should validate all fields in form and return no errors for valid data', () => {
    const formState: FormState = {
      email: {
        value: 'test@example.com',
        rules: { required: true, pattern: EMAIL_REGEX },
      },
      password: {
        value: 'Password123',
        rules: { required: true, minLength: 8 },
      },
      age: {
        value: 25,
        rules: { required: true },
      },
    };

    const errors = validateForm(formState);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should return errors for invalid fields', () => {
    const formState: FormState = {
      email: {
        value: 'invalid-email',
        rules: { required: true, pattern: EMAIL_REGEX },
      },
      password: {
        value: 'short',
        rules: { required: true, minLength: 8 },
      },
      username: {
        value: '',
        rules: { required: true },
      },
    };

    const errors = validateForm(formState);

    expect(errors.email).toBe('Invalid format');
    expect(errors.password).toBe('Must be at least 8 characters');
    expect(errors.username).toBe('This field is required');
  });

  it('should skip validation for fields without rules', () => {
    const formState: FormState = {
      email: {
        value: 'test@example.com',
        // No rules
      },
      optional: {
        value: '',
        // No rules
      },
    };

    const errors = validateForm(formState);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should handle empty form state', () => {
    const formState: FormState = {};
    const errors = validateForm(formState);

    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should validate custom validation rules', () => {
    const formState: FormState = {
      age: {
        value: 15,
        rules: {
          custom: (value) => {
            const age = Number(value);
            return age < 18 ? 'Must be 18 or older' : null;
          },
        },
      },
    };

    const errors = validateForm(formState);
    expect(errors.age).toBe('Must be 18 or older');
  });
});

// ============================================================================
// ValidationRules Tests
// ============================================================================

describe('ValidationRules', () => {
  it('should have email validation rule with pattern', () => {
    expect(ValidationRules.email).toBeDefined();
    expect(ValidationRules.email.required).toBe(true);
    expect(ValidationRules.email.pattern).toBe(EMAIL_REGEX);
    expect(ValidationRules.email.custom).toBeDefined();
  });

  it('should have basic password validation rule', () => {
    expect(ValidationRules.password).toBeDefined();
    expect(ValidationRules.password.required).toBe(true);
    expect(ValidationRules.password.minLength).toBe(8);
    expect(ValidationRules.password.custom).toBeDefined();
  });

  it('should have strong password validation rule with pattern', () => {
    expect(ValidationRules.strongPassword).toBeDefined();
    expect(ValidationRules.strongPassword.required).toBe(true);
    expect(ValidationRules.strongPassword.minLength).toBe(8);
    expect(ValidationRules.strongPassword.pattern).toBe(STRONG_PASSWORD_REGEX);
  });

  it('should have phone validation rule', () => {
    expect(ValidationRules.phone).toBeDefined();
    expect(ValidationRules.phone.pattern).toBe(PHONE_REGEX);
    expect(ValidationRules.phone.custom).toBeDefined();
  });

  it('should have URL validation rule', () => {
    expect(ValidationRules.url).toBeDefined();
    expect(ValidationRules.url.pattern).toBe(URL_REGEX);
  });

  it('should have required validation rule', () => {
    expect(ValidationRules.required).toBeDefined();
    expect(ValidationRules.required.required).toBe(true);
  });
});

// ============================================================================
// hasFormErrors Tests
// ============================================================================

describe('hasFormErrors', () => {
  it('should return true when form has errors', () => {
    const formState: FormState = {
      email: {
        value: 'invalid',
        rules: { required: true, pattern: EMAIL_REGEX },
      },
    };

    expect(hasFormErrors(formState)).toBe(true);
  });

  it('should return false when form has no errors', () => {
    const formState: FormState = {
      email: {
        value: 'test@example.com',
        rules: { required: true, pattern: EMAIL_REGEX },
      },
    };

    expect(hasFormErrors(formState)).toBe(false);
  });
});

// ============================================================================
// isFormValid Tests
// ============================================================================

describe('isFormValid', () => {
  it('should return true when form is valid', () => {
    const formState: FormState = {
      email: {
        value: 'test@example.com',
        rules: { required: true, pattern: EMAIL_REGEX },
      },
      password: {
        value: 'Password123',
        rules: { required: true, minLength: 8 },
      },
    };

    expect(isFormValid(formState)).toBe(true);
  });

  it('should return false when form is invalid', () => {
    const formState: FormState = {
      email: {
        value: '',
        rules: { required: true },
      },
    };

    expect(isFormValid(formState)).toBe(false);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('Validation Edge Cases', () => {
  it('should handle null and undefined values', () => {
    expect(validateField(null, { required: false })).toBeNull();
    expect(validateField(undefined, { required: false })).toBeNull();
    expect(validateField(null, { required: true })).toBe('This field is required');
  });

  it('should handle numeric values', () => {
    // Note: 0 is falsy, so it fails required validation
    expect(validateField(0, { required: true })).toBe('This field is required');
    expect(validateField(123, { required: true })).toBeNull();
    expect(validateField(0, { required: false })).toBeNull();
  });

  it('should handle boolean values', () => {
    // Note: false is falsy, so it fails required validation
    expect(validateField(true, { required: true })).toBeNull();
    expect(validateField(false, { required: true })).toBe('This field is required');
    expect(validateField(false, { required: false })).toBeNull();
  });

  it('should trim whitespace for string validation', () => {
    expect(validateField('  test  ', { minLength: 4 })).toBeNull();
    expect(validateField('   ', { required: true })).toBe('This field is required');
  });

  it('should handle multiple validation failures', () => {
    const rules: ValidationRule = {
      required: true,
      minLength: 5,
      maxLength: 3, // Impossible to satisfy both min and max
    };

    // Should return first failure
    expect(validateField('ab', rules)).toBe('Must be at least 5 characters');
  });
});
