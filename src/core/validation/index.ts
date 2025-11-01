// ========================================
// Core Validation System
// Single source of truth for all validation logic
// ========================================

// Main builder
export { ValidationBuilder, createValidator, quickValidate } from './ValidationBuilder';

// Status
export { ValidationStatus, booleanToStatus, isValidationStatus, type ValidationStatusType } from './ValidationStatus';

// Results
export {
  createSuccessResult,
  createErrorResult,
  createWarningResult,
  mergeValidationResults,
  isPasswordStrengthResult,
  type FieldValidationResult,
  type ValidationResult,
  type PasswordStrengthResult,
} from './ValidationResult';

// Validators
export { EmailValidator, emailValidator, isValidEmail, EMAIL_REGEX } from './validators/EmailValidator';

export {
  PasswordValidator,
  passwordValidator,
  passwordStrengthValidator,
  isValidPassword,
  calculatePasswordStrength,
  PASSWORD_RULES,
  PASSWORD_SPECIAL_CHARS,
  PasswordStrength,
  type PasswordStrengthType,
  type PasswordValidatorOptions,
} from './validators/PasswordValidator';

export {
  UsernameValidator,
  usernameValidator,
  isValidUsername,
  USERNAME_REGEX,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from './validators/UsernameValidator';

export {
  PhoneValidator,
  phoneValidator,
  isValidPhone,
  PHONE_REGEX,
  PHONE_MIN_DIGITS,
  PHONE_MAX_DIGITS,
} from './validators/PhoneValidator';

export {
  NameValidator,
  firstNameValidator,
  lastNameValidator,
  isValidName,
  NAME_REGEX,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from './validators/NameValidator';

export type { IValidator } from './validators/BaseValidator';

// Usage Examples:
// 
// 1. Single field validation:
//    const result = new ValidationBuilder()
//      .required()
//      .email()
//      .validate('user@example.com', 'email');
//
// 2. Form validation:
//    const formResult = new ValidationBuilder()
//      .validateField('email', email, b => b.required().email())
//      .validateField('password', password, b => b.required().password())
//      .result();
//
// 3. Quick validation:
//    const isValid = quickValidate.email('user@example.com').isValid;
//
// 4. Password strength:
//    const strength = calculatePasswordStrength('MyPassword123!');
//    console.log(strength.score, strength.strength, strength.feedback);
