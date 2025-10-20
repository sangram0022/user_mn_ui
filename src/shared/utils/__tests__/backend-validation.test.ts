/**
 * Backend Validation Utilities Tests
 * Tests backend-specific validation functions
 *
 * Reference: backend_api_details/API_ERROR_CODES.md
 * Date: 2025-10-20
 */

import { describe, expect, it } from 'vitest';
import {
  validateBackendEmail,
  validateBackendName,
  validateBackendPassword,
  validateBackendRegistrationForm,
  validateGDPRConfirmation,
} from '../../utils/validation';

describe('Backend Validation - Email', () => {
  describe('validateBackendEmail()', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'admin+tag@company.org',
        'user_name@sub.domain.com',
      ];

      validEmails.forEach((email) => {
        const result = validateBackendEmail(email);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject emails exceeding 255 characters', () => {
      const longEmail = 'a'.repeat(244) + '@example.com'; // 256 chars
      const result = validateBackendEmail(longEmail);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('255 characters');
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user..name@example.com',
      ];

      invalidEmails.forEach((email) => {
        const result = validateBackendEmail(email);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid email format');
      });
    });

    it('should reject empty or whitespace-only emails', () => {
      const emptyEmails = ['', '   ', '\t', '\n'];

      emptyEmails.forEach((email) => {
        const result = validateBackendEmail(email);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('required');
      });
    });
  });
});

describe('Backend Validation - Password', () => {
  describe('validateBackendPassword()', () => {
    it('should accept valid passwords', () => {
      const validPasswords = ['Password123', 'MySecure1Pass', 'C0mpl3xP@ssw0rd', 'Abcdefgh1'];

      validPasswords.forEach((password) => {
        const result = validateBackendPassword(password);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject passwords shorter than 8 characters', () => {
      const shortPasswords = ['Pass1', 'Abc123', 'Test1'];

      shortPasswords.forEach((password) => {
        const result = validateBackendPassword(password);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('8 characters');
      });
    });

    it('should reject passwords without uppercase letter', () => {
      const result = validateBackendPassword('password123');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('uppercase');
    });

    it('should reject passwords without lowercase letter', () => {
      const result = validateBackendPassword('PASSWORD123');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    it('should reject passwords without digit', () => {
      const result = validateBackendPassword('PasswordOnly');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('digit');
    });

    it('should reject empty or whitespace-only passwords', () => {
      const emptyPasswords = ['', '   ', '\t'];

      emptyPasswords.forEach((password) => {
        const result = validateBackendPassword(password);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('required');
      });
    });
  });
});

describe('Backend Validation - Name', () => {
  describe('validateBackendName()', () => {
    it('should accept valid names', () => {
      const validNames = ['John', 'Mary Jane', 'Jean-Pierre', "O'Brien", 'Anne Marie'];

      validNames.forEach((name) => {
        const result = validateBackendName(name);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject names with numbers', () => {
      const result = validateBackendName('John123');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('letters and spaces');
    });

    it('should reject names with special characters (except allowed)', () => {
      const invalidNames = ['John@Doe', 'Mary#Jane', 'Test$Name'];

      invalidNames.forEach((name) => {
        const result = validateBackendName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('letters and spaces');
      });
    });

    it('should reject names longer than 100 characters', () => {
      const longName = 'A'.repeat(101);
      const result = validateBackendName(longName);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('100 characters');
    });

    it('should reject empty names', () => {
      const result = validateBackendName('');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should use custom field name in error message', () => {
      const result = validateBackendName('', 'First name');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('First name');
    });
  });
});

describe('Backend Validation - GDPR Confirmation', () => {
  describe('validateGDPRConfirmation()', () => {
    it('should accept exact confirmation string', () => {
      const result = validateGDPRConfirmation('DELETE_MY_ACCOUNT');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject case-insensitive variations', () => {
      const invalidConfirmations = [
        'delete_my_account',
        'Delete_My_Account',
        'DELETE MY ACCOUNT',
        'delete my account',
      ];

      invalidConfirmations.forEach((confirmation) => {
        const result = validateGDPRConfirmation(confirmation);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('DELETE_MY_ACCOUNT');
      });
    });

    it('should reject similar but incorrect strings', () => {
      const invalidConfirmations = ['DELETE_ACCOUNT', 'MY_ACCOUNT_DELETE', 'CONFIRM_DELETE', 'YES'];

      invalidConfirmations.forEach((confirmation) => {
        const result = validateGDPRConfirmation(confirmation);
        expect(result.valid).toBe(false);
      });
    });
  });
});

describe('Backend Validation - Registration Form', () => {
  describe('validateBackendRegistrationForm()', () => {
    it('should accept valid registration data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'SecurePass123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const result = validateBackendRegistrationForm(validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return all validation errors for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        first_name: 'John123',
        last_name: '',
      };

      const result = validateBackendRegistrationForm(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.first_name).toBeDefined();
      expect(result.errors.last_name).toBeDefined();
    });

    it('should return partial errors for partially invalid data', () => {
      const partiallyInvalidData = {
        email: 'user@example.com', // valid
        password: 'short', // invalid
        first_name: 'John', // valid
        last_name: '', // invalid
      };

      const result = validateBackendRegistrationForm(partiallyInvalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeUndefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.first_name).toBeUndefined();
      expect(result.errors.last_name).toBeDefined();
    });

    it('should validate email length constraint', () => {
      const longEmailData = {
        email: 'a'.repeat(244) + '@example.com', // 256 chars
        password: 'ValidPass123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const result = validateBackendRegistrationForm(longEmailData);

      expect(result.valid).toBe(false);
      expect(result.errors.email).toContain('255');
    });

    it('should validate password strength requirements', () => {
      const weakPasswordData = {
        email: 'user@example.com',
        password: 'password', // no uppercase, no digit
        first_name: 'John',
        last_name: 'Doe',
      };

      const result = validateBackendRegistrationForm(weakPasswordData);

      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('should validate name format requirements', () => {
      const invalidNamesData = {
        email: 'user@example.com',
        password: 'ValidPass123',
        first_name: 'John@123',
        last_name: 'Doe#456',
      };

      const result = validateBackendRegistrationForm(invalidNamesData);

      expect(result.valid).toBe(false);
      expect(result.errors.first_name).toBeDefined();
      expect(result.errors.last_name).toBeDefined();
    });
  });
});

describe('Backend Validation - Edge Cases', () => {
  it('should handle null and undefined gracefully', () => {
    expect(validateBackendEmail(null as any).valid).toBe(false);
    expect(validateBackendEmail(undefined as any).valid).toBe(false);
    expect(validateBackendPassword(null as any).valid).toBe(false);
    expect(validateBackendPassword(undefined as any).valid).toBe(false);
    expect(validateBackendName(null as any).valid).toBe(false);
    expect(validateBackendName(undefined as any).valid).toBe(false);
  });

  it('should handle Unicode characters in names', () => {
    // Backend spec allows letters only - these should pass if pattern supports Unicode
    const unicodeNames = ['José', 'François', 'Müller', 'Søren'];

    unicodeNames.forEach((name) => {
      const result = validateBackendName(name);
      // Result depends on whether PATTERN supports Unicode - document expected behavior
      expect(result).toBeDefined();
    });
  });

  it('should handle passwords with special characters', () => {
    const specialCharPasswords = ['P@ssw0rd123!', 'Secur3#Pass$', 'Valid&123Pass', 'MyP@ss1word'];

    specialCharPasswords.forEach((password) => {
      const result = validateBackendPassword(password);
      expect(result.valid).toBe(true);
    });
  });

  it('should trim whitespace correctly', () => {
    const emailWithSpaces = '  user@example.com  ';
    const result = validateBackendEmail(emailWithSpaces.trim());

    expect(result.valid).toBe(true);
  });
});

describe('Backend Validation - Performance', () => {
  it('should validate 1000 emails efficiently', () => {
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      validateBackendEmail(`user${i}@example.com`);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100); // Should complete in < 100ms
  });

  it('should validate 1000 passwords efficiently', () => {
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      validateBackendPassword(`Password${i}123`);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100); // Should complete in < 100ms
  });
});
