// ========================================
// Frontend Validation Utilities
// Matches backend validation rules exactly
// Single Source of Truth for client-side validation
// ========================================

import { VALIDATION_RULES } from '../types/auth.types';
import { PROFILE_VALIDATION_RULES } from '../../profile/types/profile.types';

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ========================================
// Email Validation
// ========================================

/**
 * Validate email address
 * Rules:
 * - Valid email format (user@domain.com)
 * - Max 255 characters
 * - Domain must contain at least one dot
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  if (email.length > VALIDATION_RULES.EMAIL.MAX_LENGTH) {
    errors.push(`Email address is too long (maximum ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters)`);
  }

  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    errors.push('Invalid email address format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ========================================
// Password Validation
// ========================================

/**
 * Validate password strength
 * Rules:
 * - 8-128 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character: !@#$%^&*()_+-={}:;"'`~<>,.?/
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`);
  }

  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    errors.push(`Password is too long (maximum ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters)`);
  }

  if (!VALIDATION_RULES.PASSWORD.REQUIREMENTS.UPPERCASE.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  if (!VALIDATION_RULES.PASSWORD.REQUIREMENTS.LOWERCASE.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  if (!VALIDATION_RULES.PASSWORD.REQUIREMENTS.DIGIT.test(password)) {
    errors.push('Password must contain at least one digit (0-9)');
  }

  if (!VALIDATION_RULES.PASSWORD.REQUIREMENTS.SPECIAL.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-={}:;"\'`~<>,.?/)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length === 0) {
    return { score: 0, strength: 'weak', feedback: ['Password is required'] };
  }

  // Length score (0-40 points)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;

  // Complexity score (0-60 points)
  if (VALIDATION_RULES.PASSWORD.REQUIREMENTS.UPPERCASE.test(password)) {
    score += 15;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (VALIDATION_RULES.PASSWORD.REQUIREMENTS.LOWERCASE.test(password)) {
    score += 15;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (VALIDATION_RULES.PASSWORD.REQUIREMENTS.DIGIT.test(password)) {
    score += 15;
  } else {
    feedback.push('Add numbers');
  }

  if (VALIDATION_RULES.PASSWORD.REQUIREMENTS.SPECIAL.test(password)) {
    score += 15;
  } else {
    feedback.push('Add special characters');
  }

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  if (score < 30) strength = 'weak';
  else if (score < 50) strength = 'fair';
  else if (score < 70) strength = 'good';
  else if (score < 90) strength = 'strong';
  else strength = 'very_strong';

  return { score, strength, feedback };
}

// ========================================
// Name Validation
// ========================================

/**
 * Validate first name or last name
 * Rules:
 * - 2-50 characters
 * - Only letters, spaces, hyphens (-), and apostrophes (')
 * - No consecutive special characters
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }

  const trimmed = name.trim();

  if (trimmed.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    errors.push(`${fieldName} must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`);
  }

  if (trimmed.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    errors.push(`${fieldName} must be at most ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`);
  }

  if (!VALIDATION_RULES.NAME.PATTERN.test(trimmed)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ========================================
// Phone Number Validation
// ========================================

/**
 * Validate phone number
 * Rules:
 * - E.164 format with country code
 * - 10-15 digits
 * - Must start with + or digit 1-9
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: string[] = [];

  if (!phone || phone.trim().length === 0) {
    // Phone is optional
    return { isValid: true, errors: [] };
  }

  const trimmed = phone.trim();

  if (trimmed.length < VALIDATION_RULES.PHONE.MIN_LENGTH) {
    errors.push(`Phone number must be at least ${VALIDATION_RULES.PHONE.MIN_LENGTH} digits`);
  }

  if (trimmed.length > VALIDATION_RULES.PHONE.MAX_LENGTH) {
    errors.push(`Phone number must be at most ${VALIDATION_RULES.PHONE.MAX_LENGTH} digits`);
  }

  if (!VALIDATION_RULES.PHONE.PATTERN.test(trimmed)) {
    errors.push('Invalid phone number format. Use E.164 format (e.g., +1234567890)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ========================================
// Avatar URL Validation
// ========================================

/**
 * Validate avatar URL
 * Rules:
 * - Must be http:// or https://
 * - XSS-safe (no javascript: or data: URLs)
 */
export function validateAvatarUrl(url: string): ValidationResult {
  const errors: string[] = [];

  if (!url || url.trim().length === 0) {
    // Avatar URL is optional
    return { isValid: true, errors: [] };
  }

  const trimmed = url.trim();

  if (!PROFILE_VALIDATION_RULES.AVATAR_URL.PATTERN.test(trimmed)) {
    errors.push('Avatar URL must start with http:// or https://');
  }

  if (!PROFILE_VALIDATION_RULES.AVATAR_URL.XSS_SAFE.test(trimmed)) {
    errors.push('Invalid avatar URL format (potential security issue)');
  }

  // Additional XSS checks
  const lowerUrl = trimmed.toLowerCase();
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
    errors.push('JavaScript and data URLs are not allowed for security reasons');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ========================================
// Username Validation
// ========================================

/**
 * Validate username
 * Rules:
 * - 3-30 characters
 * - Alphanumeric and underscores only
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];

  if (!username || username.trim().length === 0) {
    // Username is optional
    return { isValid: true, errors: [] };
  }

  const trimmed = username.trim();

  if (trimmed.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    errors.push(`Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`);
  }

  if (trimmed.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
    errors.push(`Username must be at most ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`);
  }

  if (!VALIDATION_RULES.USERNAME.PATTERN.test(trimmed)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ========================================
// Password Confirmation Validation
// ========================================

/**
 * Validate password confirmation matches
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
  const errors: string[] = [];

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ========================================
// Form Validation Helper
// ========================================

/**
 * Validate multiple fields at once
 * Returns combined validation result
 */
export function validateForm(validations: Record<string, ValidationResult>): {
  isValid: boolean;
  fieldErrors: Record<string, string[]>;
} {
  const fieldErrors: Record<string, string[]> = {};
  let isValid = true;

  Object.entries(validations).forEach(([field, result]) => {
    if (!result.isValid) {
      fieldErrors[field] = result.errors;
      isValid = false;
    }
  });

  return { isValid, fieldErrors };
}
