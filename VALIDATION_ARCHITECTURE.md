# Validation System Architecture

## Overview

The validation system provides a unified, type-safe approach to validating user input across the application. It implements the **Single Source of Truth** principle by centralizing all validation logic in `src/core/validation/`.

## 🎯 Design Principles

### 1. Single Source of Truth (SSOT)
- All validation patterns defined once in `src/core/validation/`
- 100% alignment with backend Python FastAPI validation
- Backend patterns from `user_mn/src/app/core/validation/patterns.py`

### 2. Type Safety
- Dataclass-style results with strict TypeScript types
- No `any` types
- Full IntelliSense support

### 3. DRY (Don't Repeat Yourself)
- Zero duplication of validation logic
- Reusable validators
- Composable validation chains

### 4. Single Responsibility Principle
- Each validator handles ONE type of validation
- Validation system handles validation ONLY (not business logic)
- Clear separation of concerns

### 5. Backend Alignment
- Email regex matches backend `EMAIL_SAFE` pattern
- Password rules match backend `SecurityConfig`
- Username regex matches backend `USERNAME_SAFE`
- Phone regex matches backend E.164 `PHONE_NUMBER` pattern
- Name validation matches backend `ApplicationConfig` and utils

## 📂 Directory Structure

```
src/core/validation/
├── ValidationStatus.ts          ← Status constants (SUCCESS, ERROR, WARNING)
├── ValidationResult.ts          ← Result type definitions
├── ValidationBuilder.ts         ← Fluent interface for chaining
├── validators/
│   ├── BaseValidator.ts         ← Common validator interface
│   ├── EmailValidator.ts        ← Email validation (RFC 5322, 254 chars max)
│   ├── PasswordValidator.ts     ← Password validation + strength calculation
│   ├── UsernameValidator.ts     ← Username validation (3-30 chars, alphanumeric+_)
│   ├── PhoneValidator.ts        ← Phone validation (E.164, 10-15 digits)
│   └── NameValidator.ts         ← Name validation (2-50 chars, letters/spaces/-/')
├── __tests__/                   ← Unit tests for all validators
└── index.ts                     ← Main exports

```

## 🏗️ Class Hierarchy

```
IValidator (interface)
    ↓
BaseValidator (abstract class)
    ↓
    ├── EmailValidator
    ├── PasswordValidator
    ├── UsernameValidator
    ├── PhoneValidator
    └── NameValidator

ValidationBuilder
    ↓ uses
    All validators via fluent interface
```

## 🔧 Core Components

### ValidationStatus

Const object (not enum - esbuild requirement):

```typescript
export const ValidationStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type ValidationStatusType = typeof ValidationStatus[keyof typeof ValidationStatus];
```

### ValidationResult

Three result types:

```typescript
// Field-level validation
interface FieldValidationResult {
  field: string;
  status: ValidationStatusType;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Form-level validation
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

// Password strength (extends FieldValidationResult)
interface PasswordStrengthResult extends FieldValidationResult {
  score: number; // 0-100
  strength: PasswordStrengthType;
  feedback: string[];
}
```

### BaseValidator

Common functionality for all validators:

```typescript
interface IValidator {
  validate(value: unknown, field?: string): FieldValidationResult;
}

abstract class BaseValidator implements IValidator {
  abstract readonly name: string;
  abstract validate(value: unknown, field?: string): FieldValidationResult;
  
  protected isEmpty(value: unknown): boolean;
  protected toString(value: unknown): string;
}
```

### ValidationBuilder

Fluent interface for chaining validations:

```typescript
class ValidationBuilder {
  // Chainable validators
  required(message?: string): this;
  email(message?: string): this;
  password(options?: PasswordValidatorOptions): this;
  username(message?: string): this;
  phone(options?: PhoneValidatorOptions): this;
  name(options?: NameValidatorOptions): this;
  
  // Terminal methods
  validate(value: string, field?: string): FieldValidationResult;
  validateField(field: string, value: string, builder: (b: ValidationBuilder) => ValidationBuilder): this;
  result(): ValidationResult;
}
```

## 📝 Usage Patterns

### 1. Single Field Validation

```typescript
import { ValidationBuilder } from '@/core/validation';

const emailResult = new ValidationBuilder()
  .required('Email is required')
  .email('Please enter a valid email address')
  .validate(formData.email, 'email');

if (!emailResult.isValid) {
  setErrors(prev => ({ ...prev, email: emailResult.errors }));
}
```

### 2. Form Validation

```typescript
import { ValidationBuilder } from '@/core/validation';

const handleSubmit = (formData: LoginFormData) => {
  const formResult = new ValidationBuilder()
    .validateField('email', formData.email, b => 
      b.required('Email is required').email()
    )
    .validateField('password', formData.password, b => 
      b.required('Password is required').password()
    )
    .result();
  
  if (!formResult.isValid) {
    setErrors(formResult.errors);
    return;
  }
  
  // Proceed with submission
  await loginUser(formData);
};
```

### 3. Quick Boolean Check

```typescript
import { isValidEmail, isValidPassword, isValidUsername } from '@/core/validation';

if (isValidEmail(email) && isValidPassword(password)) {
  // Proceed
}
```

### 4. Quick Validation with Results

```typescript
import { quickValidate } from '@/core/validation';

const emailResult = quickValidate.email(email);
const passwordResult = quickValidate.password(password);

if (!emailResult.isValid) {
  console.log(emailResult.errors); // ['Email must be a valid email address']
}
```

### 5. Password Strength Calculation

```typescript
import { calculatePasswordStrength, PasswordStrength } from '@/core/validation';

const handlePasswordChange = (password: string) => {
  const strength = calculatePasswordStrength(password);
  
  setPasswordScore(strength.score); // 0-100
  setPasswordStrength(strength.strength); // 'weak' | 'fair' | 'good' | 'strong' | 'very_strong'
  setPasswordFeedback(strength.feedback); // ['Add uppercase letters', 'Good length', ...]
  setIsPasswordValid(strength.isValid);
};
```

### 6. Custom Validator Options

```typescript
import { ValidationBuilder } from '@/core/validation';

// Phone validation (optional by default)
const phoneResult = new ValidationBuilder()
  .phone({ 
    allowEmpty: false, // Make it required
    allowInternational: true,
    minDigits: 10,
    maxDigits: 15 
  })
  .validate(phoneNumber, 'phone');

// Password validation (custom requirements)
const passwordResult = new ValidationBuilder()
  .password({
    minLength: 12, // Custom min length
    maxLength: 64, // Custom max length
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    calculateStrength: true // Get strength info
  })
  .validate(password, 'password');
```

## 🎨 Validator Details

### EmailValidator

**Pattern**: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`

**Rules**:
- Max length: 254 characters (RFC 5321)
- Must contain @ and domain with TLD
- Blocked domains: example.com, test.com

**Backend Alignment**: Matches `EMAIL_SAFE` in `patterns.py`

### PasswordValidator

**Rules**:
- Min length: 8 characters (backend: `password_min_length`)
- Max length: 128 characters (backend: `password_max_length`)
- Must contain: uppercase, lowercase, number, special character
- Special chars: `!@#$%^&*()_+-=[]{}|;:,.<>?`

**Strength Calculation**:
- Length scoring: 8-11 (20pts), 12-15 (25pts), 16+ (30pts)
- Character variety: uppercase (15pts), lowercase (15pts), numbers (15pts), special (15pts)
- Penalties: repeating chars (-10), only numbers (-20), only letters (-15), sequential patterns (-10), common words (-20)
- Final score: 0-100
- Strength levels: weak (0-29), fair (30-49), good (50-69), strong (70-89), very_strong (90-100)

**Backend Alignment**: Matches `PasswordValidator` in `validators.py` and `SecurityConfig`

### UsernameValidator

**Pattern**: `/^[a-zA-Z0-9_]{3,30}$/`

**Rules**:
- Min length: 3 characters
- Max length: 30 characters
- Allowed: letters, numbers, underscore only

**Backend Alignment**: Matches `USERNAME_SAFE` in `patterns.py`

### PhoneValidator

**Pattern**: `/^\+?[1-9]\d{9,14}$/` (E.164 format)

**Rules**:
- Min digits: 10 (backend: `phone_min_digits`)
- Max digits: 15 (backend: `phone_max_digits`)
- Optional by default (allowEmpty: true)
- International format: +[country][number]
- No leading zeros after +

**Backend Alignment**: Matches `PHONE_NUMBER` in `patterns.py`

### NameValidator

**Pattern**: `/^[a-zA-Z\s\-']+$/`

**Rules**:
- Min length: 2 characters (backend: `name_min_length`)
- Max length: 50 characters (backend: `name_max_length`)
- Allowed: letters, spaces, hyphens, apostrophes
- Auto-capitalizes (matches backend `.title()` behavior)

**Singletons**: `firstNameValidator`, `lastNameValidator`

**Backend Alignment**: Matches `ApplicationConfig` and `validation_utils.py`

## 🔄 Extending the System

### Adding a New Validator

1. Create validator class:

```typescript
// src/core/validation/validators/ZipCodeValidator.ts
import { BaseValidator } from './BaseValidator';
import { createSuccessResult, createErrorResult, type FieldValidationResult } from '../ValidationResult';

export const ZIP_CODE_REGEX = /^\d{5}(-\d{4})?$/;

export class ZipCodeValidator extends BaseValidator {
  readonly name = 'ZipCodeValidator';
  
  validate(value: unknown, field: string = 'zipCode'): FieldValidationResult {
    const zipCode = this.toString(value);
    
    if (this.isEmpty(value)) {
      return createErrorResult(field, ['ZIP code is required']);
    }
    
    if (!ZIP_CODE_REGEX.test(zipCode.trim())) {
      return createErrorResult(field, ['ZIP code must be in format 12345 or 12345-6789']);
    }
    
    return createSuccessResult(field);
  }
}

export const zipCodeValidator = new ZipCodeValidator();

export function isValidZipCode(zipCode: string): boolean {
  return zipCodeValidator.validate(zipCode).isValid;
}
```

2. Add to ValidationBuilder:

```typescript
// src/core/validation/ValidationBuilder.ts
import { ZipCodeValidator } from './validators/ZipCodeValidator';

class ValidationBuilder {
  // ... existing methods
  
  zipCode(message?: string): this {
    this.validators.push(new ZipCodeValidator());
    return this;
  }
}
```

3. Export from index:

```typescript
// src/core/validation/index.ts
export { 
  ZipCodeValidator, 
  zipCodeValidator, 
  isValidZipCode, 
  ZIP_CODE_REGEX 
} from './validators/ZipCodeValidator';
```

4. Write tests:

```typescript
// src/core/validation/validators/__tests__/ZipCodeValidator.test.ts
import { describe, it, expect } from 'vitest';
import { isValidZipCode, ZIP_CODE_REGEX } from '../ZipCodeValidator';

describe('ZipCodeValidator', () => {
  it('should validate 5-digit ZIP codes', () => {
    expect(isValidZipCode('12345')).toBe(true);
  });
  
  it('should validate ZIP+4 format', () => {
    expect(isValidZipCode('12345-6789')).toBe(true);
  });
  
  it('should reject invalid formats', () => {
    expect(isValidZipCode('1234')).toBe(false);
    expect(isValidZipCode('ABCDE')).toBe(false);
  });
});
```

## ⚠️ Best Practices

### DO ✅

- **Always import from** `@/core/validation` or `'../../../../core/validation'`
- **Use ValidationBuilder** for form validation
- **Use quickValidate** for simple boolean checks
- **Chain validators** in ValidationBuilder for complex rules
- **Check backend patterns** before adding new validators
- **Write unit tests** for custom validators
- **Document validator options** in JSDoc

### DON'T ❌

- **Never create local validation functions** in components
- **Never duplicate validation patterns** across files
- **Never hardcode regex patterns** outside validators
- **Never modify validators** without checking backend alignment
- **Never skip tests** for custom validators
- **Never use `any` types** in validation code
- **Never implement validation logic** in business logic layer

## 🚧 Common Pitfalls

### 1. Forgetting to Check `isValid`

```typescript
// ❌ WRONG: Not checking isValid
const result = new ValidationBuilder().email().validate(email);
if (result.errors.length > 0) { ... } // Fragile!

// ✅ CORRECT: Always check isValid
if (!result.isValid) { ... }
```

### 2. Not Using Type Guards

```typescript
// ❌ WRONG: Assuming result type
const result = calculatePasswordStrength(password);
console.log(result.score); // Might be undefined

// ✅ CORRECT: Use type guard
import { isPasswordStrengthResult } from '@/core/validation';

if (isPasswordStrengthResult(result)) {
  console.log(result.score); // TypeScript knows score exists
}
```

### 3. Mixing Validation with Business Logic

```typescript
// ❌ WRONG: Validation + business logic mixed
function saveUser(user: User) {
  if (!isValidEmail(user.email)) throw new Error('Invalid email');
  if (!isUserActive(user)) throw new Error('User not active'); // Business logic!
  database.save(user);
}

// ✅ CORRECT: Separate concerns
function validateUser(user: User): ValidationResult {
  return new ValidationBuilder()
    .validateField('email', user.email, b => b.required().email())
    .result();
}

function canSaveUser(user: User): boolean {
  return isUserActive(user); // Business logic separate
}

function saveUser(user: User) {
  const validation = validateUser(user);
  if (!validation.isValid) throw new ValidationError(validation.errors);
  if (!canSaveUser(user)) throw new BusinessError('User not active');
  database.save(user);
}
```

### 4. Creating Duplicate Validators

```typescript
// ❌ WRONG: Creating validators in components
function MyComponent() {
  const validateEmail = (email: string) => {
    return /^[^@]+@[^@]+$/.test(email); // Duplicate!
  };
}

// ✅ CORRECT: Use centralized validators
import { isValidEmail } from '@/core/validation';

function MyComponent() {
  // Use isValidEmail directly
}
```

## 📊 Performance Considerations

### Singleton Instances

All validators are exported as singleton instances for performance:

```typescript
// These are already instantiated - reuse them!
import { 
  emailValidator, 
  passwordValidator, 
  usernameValidator 
} from '@/core/validation';

// ❌ WRONG: Creating new instances repeatedly
for (const email of emails) {
  const validator = new EmailValidator(); // Wasteful!
  validator.validate(email);
}

// ✅ CORRECT: Reuse singleton
for (const email of emails) {
  emailValidator.validate(email);
}
```

### ValidationBuilder Reuse

```typescript
// ❌ WRONG: Creating new builder for each validation
emails.forEach(email => {
  const builder = new ValidationBuilder(); // Multiple instances
  builder.email().validate(email);
});

// ✅ CORRECT: Reuse builder or use quickValidate
import { quickValidate } from '@/core/validation';

emails.forEach(email => {
  quickValidate.email(email);
});
```

## 🧪 Testing

### Unit Tests

All validators have comprehensive unit tests in `__tests__/` directory:

```bash
# Run all validation tests
npm run test -- src/core/validation

# Run specific validator tests
npm run test -- src/core/validation/validators/__tests__/EmailValidator.test.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage Requirements

- **100% coverage** for all validator logic
- **Edge cases**: empty, null, undefined, special characters
- **Backend alignment**: verify patterns match backend
- **Error messages**: verify user-friendly messages

## 📚 Related Documentation

- `DRY_VALIDATION_AUDIT.md` - Original audit that led to this system
- `BACKEND_FRONTEND_VALIDATION_ALIGNMENT.md` - Complete pattern comparison
- `VALIDATION_CLEANUP_NOTE.md` - Cleanup and migration notes
- `.github/copilot-instructions.md` - Coding principles and policies

## 🔗 Backend References

All validation patterns are aligned with backend Python FastAPI (`user_mn`):

- **Patterns**: `user_mn/src/app/core/validation/patterns.py`
- **Validators**: `user_mn/src/app/core/validation/validators.py`
- **Config**: `user_mn/src/app/core/config/settings.py`
- **Utils**: `user_mn/src/app/user_core/utils/validation_utils.py`

## 📅 Version History

- **v1.0.0** (2025-01-XX): Initial implementation
  - 5 validators (Email, Password, Username, Phone, Name)
  - 100% backend alignment
  - Fluent ValidationBuilder interface
  - Type-safe dataclass results
  - Comprehensive test suite

---

**Last Updated**: 2025-01-XX  
**Maintainers**: Development Team  
**Status**: ✅ Production Ready
