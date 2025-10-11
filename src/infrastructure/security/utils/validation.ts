/**
 * Input Validation Utilities
 * Provides comprehensive input validation for security and data integrity
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

/**
 * Validate a single field value
 */
export function validateField(value: string, rule: ValidationRule): ValidationResult {
  const errors: string[] = [];

  // Required validation
  if (rule.required && (!value || value.trim().length === 0)) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim().length === 0) {
    return { isValid: true, errors: [] };
  }

  // Length validations
  if (rule.minLength !== undefined && value.length < rule.minLength) {
    errors.push(`Minimum length is ${rule.minLength} characters`);
  }

  if (rule.maxLength !== undefined && value.length > rule.maxLength) {
    errors.push(`Maximum length is ${rule.maxLength} characters`);
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value)) {
    errors.push('Invalid format');
  }

  // Custom validation
  if (rule.custom) {
    const customResult = rule.custom(value);
    if (typeof customResult === 'string') {
      errors.push(customResult);
    } else if (!customResult) {
      errors.push('Invalid value');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an object against a schema
 */
export function validateObject(
  data: Record<string, string>,
  schema: ValidationSchema
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field] || '';
    results[field] = validateField(value, rule);
  }

  return results;
}

/**
 * Check if validation results are all valid
 */
export function isValidationValid(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).every((result) => result.isValid);
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return validateField(email, {
    required: true,
    pattern: emailPattern,
    maxLength: 254,
  });
}

/**
 * Password strength validation
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters');
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    errors.push('Password should not contain common patterns');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Username validation
 */
export function validateUsername(username: string): ValidationResult {
  const usernamePattern = /^[a-zA-Z0-9_-]+$/;

  return validateField(username, {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: usernamePattern,
    custom: (value) => {
      // Check for reserved usernames
      const reserved = ['admin', 'root', 'user', 'test', 'guest', 'anonymous'];
      if (reserved.includes(value.toLowerCase())) {
        return 'This username is reserved';
      }
      return true;
    },
  });
}

/**
 * Phone number validation
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '');

  return validateField(digits, {
    pattern: /^\d{10,15}$/,
    custom: (value) => {
      if (value.length < 10) {
        return 'Phone number must be at least 10 digits';
      }
      if (value.length > 15) {
        return 'Phone number must be less than 15 digits';
      }
      return true;
    },
  });
}

/**
 * URL validation
 */
export function validateUrl(url: string): ValidationResult {
  try {
    new URL(url);

    // Additional security checks
    const lowerUrl = url.toLowerCase();
    if (
      lowerUrl.startsWith('javascript:') ||
      lowerUrl.startsWith('data:') ||
      lowerUrl.startsWith('vbscript:')
    ) {
      return {
        isValid: false,
        errors: ['Invalid URL protocol'],
      };
    }

    return { isValid: true, errors: [] };
  } catch {
    return {
      isValid: false,
      errors: ['Invalid URL format'],
    };
  }
}

/**
 * Credit card number validation (Luhn algorithm)
 */
export function validateCreditCard(cardNumber: string): ValidationResult {
  // Remove spaces and hyphens
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      errors: ['Card number must contain only digits'],
    };
  }

  if (cleaned.length < 13 || cleaned.length > 19) {
    return {
      isValid: false,
      errors: ['Invalid card number length'],
    };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const isValid = sum % 10 === 0;

  return {
    isValid,
    errors: isValid ? [] : ['Invalid card number'],
  };
}

/**
 * Date validation
 */
export function validateDate(dateString: string): ValidationResult {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      errors: ['Invalid date format'],
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * Age validation
 */
export function validateAge(
  birthDate: string,
  minAge: number = 13,
  maxAge: number = 120
): ValidationResult {
  const dateResult = validateDate(birthDate);
  if (!dateResult.isValid) {
    return dateResult;
  }

  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  let actualAge = age;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    actualAge--;
  }

  if (actualAge < minAge) {
    return {
      isValid: false,
      errors: [`Must be at least ${minAge} years old`],
    };
  }

  if (actualAge > maxAge) {
    return {
      isValid: false,
      errors: [`Age cannot exceed ${maxAge} years`],
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * General input validation function
 */
export function validateInput(
  value: string,
  type: 'email' | 'password' | 'username' | 'phone' | 'url' | 'creditcard' | 'date',
  customRule?: ValidationRule
): ValidationResult {
  let result: ValidationResult;

  switch (type) {
    case 'email':
      result = validateEmail(value);
      break;
    case 'password':
      result = validatePassword(value);
      break;
    case 'username':
      result = validateUsername(value);
      break;
    case 'phone':
      result = validatePhoneNumber(value);
      break;
    case 'url':
      result = validateUrl(value);
      break;
    case 'creditcard':
      result = validateCreditCard(value);
      break;
    case 'date':
      result = validateDate(value);
      break;
    default:
      result = { isValid: true, errors: [] };
  }

  // Apply custom rule if provided
  if (customRule && result.isValid) {
    const customResult = validateField(value, customRule);
    if (!customResult.isValid) {
      result.errors.push(...customResult.errors);
      result.isValid = false;
    }
  }

  return result;
}
