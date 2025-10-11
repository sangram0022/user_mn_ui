/**
 * Validation Utilities
 * Common validation functions for forms and inputs
 */

import { PASSWORD_REQUIREMENTS } from '../config/api.config';

export class Validators {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (PASSWORD_REQUIREMENTS.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate passwords match
   */
  static passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }

  /**
   * Validate name format
   */
  static isValidName(name: string): boolean {
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    return nameRegex.test(name);
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate required field
   */
  static isRequired(value: unknown): boolean {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  }

  /**
   * Validate string length
   */
  static isValidLength(value: string, min: number, max: number): boolean {
    const length = value.trim().length;
    return length >= min && length <= max;
  }

  /**
   * Validate GDPR deletion confirmation
   */
  static isValidDeletionConfirmation(confirmation: string): boolean {
    return confirmation.trim().toUpperCase() === 'DELETE MY ACCOUNT';
  }

  /**
   * Get password strength score (0-5)
   */
  static getPasswordStrength(password: string): number {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    return score;
  }

  /**
   * Get password strength label
   */
  static getPasswordStrengthLabel(password: string): string {
    const score = this.getPasswordStrength(password);
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[score] || 'Very Weak';
  }
}
