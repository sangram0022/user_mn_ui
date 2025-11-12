# Validation Patterns Guide

## Overview

This guide documents validation patterns in the application, including when to use Zod vs ValidationBuilder, composition examples, and best practices.

## Table of Contents

1. [Validation Approaches](#validation-approaches)
2. [When to Use Zod](#when-to-use-zod)
3. [When to Use ValidationBuilder](#when-to-use-validationbuilder)
4. [Validation Composition](#validation-composition)
5. [Error Mapping](#error-mapping)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## Validation Approaches

The application supports **two validation approaches**:

### 1. **Zod** (Schema-based validation)
- **Location**: `src/core/validation/schemas.ts`
- **Purpose**: Form validation with React Hook Form
- **Strengths**: Type inference, composition, schema transformations
- **Use case**: Complex forms, multi-step forms, API request validation

### 2. **ValidationBuilder** (Functional validation)
- **Location**: `src/core/validation/index.ts`
- **Purpose**: Individual field validation, custom business logic
- **Strengths**: Fine-grained control, custom validators, imperative API
- **Use case**: Real-time field validation, custom rules, non-form validation

---

## When to Use Zod

### ✅ Use Zod for:

1. **Form Validation with React Hook Form**
   ```typescript
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { loginSchema } from '@/core/validation/schemas';

   const form = useForm({
     resolver: zodResolver(loginSchema),
   });
   ```

2. **API Request/Response Validation**
   ```typescript
   import { z } from 'zod';
   
   const userSchema = z.object({
     id: z.string().uuid(),
     email: z.string().email(),
     name: z.string().min(2),
   });

   type User = z.infer<typeof userSchema>;

   // Validate API response
   const user = userSchema.parse(apiResponse);
   ```

3. **Complex Schema Composition**
   ```typescript
   const baseUserSchema = z.object({
     email: z.string().email(),
     name: z.string(),
   });

   const createUserSchema = baseUserSchema.extend({
     password: z.string().min(8),
     confirmPassword: z.string(),
   }).refine(
     (data) => data.password === data.confirmPassword,
     { message: 'Passwords must match', path: ['confirmPassword'] }
   );
   ```

4. **Data Transformation**
   ```typescript
   const dateSchema = z.string().transform((str) => new Date(str));
   const numberSchema = z.string().transform((str) => parseInt(str, 10));
   ```

---

## When to Use ValidationBuilder

### ✅ Use ValidationBuilder for:

1. **Real-time Field Validation**
   ```typescript
   import { ValidationBuilder } from '@/core/validation';

   const emailValidator = new ValidationBuilder()
     .required('Email is required')
     .email('Invalid email format')
     .maxLength(100, 'Email too long')
     .build();

   // Use in onChange handler
   const handleEmailChange = (email: string) => {
     const result = emailValidator(email);
     setEmailError(result.isValid ? '' : result.error);
   };
   ```

2. **Custom Business Logic**
   ```typescript
   const usernameValidator = new ValidationBuilder()
     .required('Username is required')
     .minLength(3, 'Username too short')
     .custom((value) => {
       if (!/^[a-zA-Z0-9_]+$/.test(value)) {
         return { isValid: false, error: 'Only alphanumeric and underscore allowed' };
       }
       return { isValid: true };
     })
     .build();
   ```

3. **Non-Form Validation**
   ```typescript
   // Validate search query
   const searchQueryValidator = new ValidationBuilder()
     .minLength(2, 'Search query too short')
     .maxLength(100, 'Search query too long')
     .build();

   const handleSearch = (query: string) => {
     const result = searchQueryValidator(query);
     if (!result.isValid) {
       toast.error(result.error);
       return;
     }
     performSearch(query);
   };
   ```

4. **Specific Field Validators**
   ```typescript
   import { EmailValidator, PasswordValidator, PhoneValidator } from '@/core/validation/validators';

   // Email validation with domain blacklist
   const emailValidator = new EmailValidator({ 
     allowedDomains: ['company.com', 'gmail.com'] 
   });

   // Password validation with strength requirements
   const passwordValidator = new PasswordValidator({
     minLength: 12,
     requireUppercase: true,
     requireLowercase: true,
     requireNumbers: true,
     requireSpecialChars: true,
   });

   // Phone validation
   const phoneValidator = new PhoneValidator({
     allowedCountries: ['US', 'CA'],
     requireInternationalFormat: true,
   });
   ```

---

## Validation Composition

### Combining Zod Schemas

```typescript
// Base schemas
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(100);

// Compose into login schema
const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

// Extend for registration
const registerSchema = loginSchema.extend({
  name: z.string().min(2).max(100),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords must match', path: ['confirmPassword'] }
);
```

### Chaining ValidationBuilder Rules

```typescript
const complexValidator = new ValidationBuilder()
  .required('Field is required')
  .minLength(3, 'Minimum 3 characters')
  .maxLength(50, 'Maximum 50 characters')
  .pattern(/^[a-zA-Z0-9]+$/, 'Alphanumeric only')
  .custom((value) => {
    // Custom business logic
    if (reservedWords.includes(value)) {
      return { isValid: false, error: 'Reserved word' };
    }
    return { isValid: true };
  })
  .build();
```

### Hybrid Approach

Use Zod for form validation but ValidationBuilder for specific field-level checks:

```typescript
// Form-level validation with Zod
const formSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
});

// Field-level validation with ValidationBuilder for real-time feedback
const usernameValidator = new ValidationBuilder()
  .required('Username is required')
  .minLength(3)
  .build();

// Component
const RegisterForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const [usernameError, setUsernameError] = useState('');

  const handleUsernameChange = (username: string) => {
    const result = usernameValidator(username);
    setUsernameError(result.isValid ? '' : result.error);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input 
        {...form.register('username')}
        onChange={(e) => handleUsernameChange(e.target.value)}
      />
      {usernameError && <span>{usernameError}</span>}
    </form>
  );
};
```

---

## Error Mapping

### Zod Error Mapping

```typescript
import { ZodError } from 'zod';

function mapZodErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    fieldErrors[path] = err.message;
  });
  
  return fieldErrors;
}

// Usage
try {
  loginSchema.parse(formData);
} catch (error) {
  if (error instanceof ZodError) {
    const errors = mapZodErrors(error);
    // { email: 'Invalid email', password: 'Password too short' }
  }
}
```

### ValidationBuilder Error Handling

```typescript
const result = validator(value);

if (!result.isValid) {
  // Single error message
  console.error(result.error);
  
  // Or set form error
  setError('fieldName', { 
    type: 'manual', 
    message: result.error 
  });
}
```

### API Validation Error Mapping

Backend returns field errors in this format:
```json
{
  "success": false,
  "error": "Validation failed",
  "field_errors": {
    "email": "Email already exists",
    "password": "Password too weak"
  }
}
```

Map to form errors:
```typescript
import { useStandardErrorHandler } from '@/hooks/useStandardErrorHandler';

const { handleError } = useStandardErrorHandler();

const mutation = useMutation({
  mutationFn: createUser,
  onError: (error) => {
    const fieldErrors = handleError(error);
    
    // Set form errors
    Object.entries(fieldErrors).forEach(([field, message]) => {
      form.setError(field, { type: 'manual', message });
    });
  },
});
```

---

## Best Practices

### 1. **Single Source of Truth**
- Define validation rules once
- Reuse across forms and components
- Keep schemas in `src/core/validation/schemas.ts`

### 2. **Consistent Error Messages**
```typescript
// Good: Specific, actionable error messages
z.string().email('Please enter a valid email address')
z.string().min(8, 'Password must be at least 8 characters')

// Bad: Vague error messages
z.string().email('Invalid')
z.string().min(8, 'Too short')
```

### 3. **Progressive Validation**
```typescript
// Validate in stages
const quickValidator = new ValidationBuilder()
  .required('Required')
  .build();

const fullValidator = new ValidationBuilder()
  .required('Required')
  .minLength(3, 'Too short')
  .maxLength(50, 'Too long')
  .pattern(/^[a-zA-Z]+$/, 'Letters only')
  .build();

// Use quick validation during typing
// Use full validation on blur or submit
```

### 4. **Async Validation for Backend Checks**
```typescript
const checkUsernameAvailability = async (username: string) => {
  const response = await apiClient.get(`/api/v1/check-username?username=${username}`);
  return response.data.available;
};

const usernameSchema = z.string()
  .min(3)
  .refine(
    async (username) => await checkUsernameAvailability(username),
    { message: 'Username already taken' }
  );
```

### 5. **Type Safety**
```typescript
// Infer types from schemas
type LoginForm = z.infer<typeof loginSchema>;

// Use in components
const onSubmit = (data: LoginForm) => {
  // data is fully typed
  console.log(data.email, data.password);
};
```

---

## Examples

### Complete Form with Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms',
  }),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords must match', path: ['confirmPassword'] }
);

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    // Submit validated data
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}

      <input type="password" {...form.register('password')} />
      {form.formState.errors.password && (
        <span>{form.formState.errors.password.message}</span>
      )}

      <input type="password" {...form.register('confirmPassword')} />
      {form.formState.errors.confirmPassword && (
        <span>{form.formState.errors.confirmPassword.message}</span>
      )}

      <label>
        <input type="checkbox" {...form.register('acceptTerms')} />
        Accept Terms
      </label>
      {form.formState.errors.acceptTerms && (
        <span>{form.formState.errors.acceptTerms.message}</span>
      )}

      <button type="submit">Register</button>
    </form>
  );
};
```

### Real-time Validation with ValidationBuilder

```typescript
import { useState } from 'react';
import { ValidationBuilder } from '@/core/validation';

const usernameValidator = new ValidationBuilder()
  .required('Username is required')
  .minLength(3, 'Username must be at least 3 characters')
  .maxLength(20, 'Username must be at most 20 characters')
  .pattern(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
  .build();

const UsernameInput = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleChange = (value: string) => {
    setUsername(value);

    const result = usernameValidator(value);
    setError(result.isValid ? '' : result.error);
    setIsValid(result.isValid);
  };

  return (
    <div>
      <input
        value={username}
        onChange={(e) => handleChange(e.target.value)}
        className={error ? 'error' : isValid ? 'valid' : ''}
      />
      {error && <span className="error-message">{error}</span>}
      {isValid && <span className="success-message">✓ Username available</span>}
    </div>
  );
};
```

### Password Strength Validation

```typescript
import { PasswordValidator } from '@/core/validation/validators';

const passwordValidator = new PasswordValidator({
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
});

const PasswordInput = () => {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  const handleChange = (value: string) => {
    setPassword(value);

    const result = passwordValidator.validate(value);
    if (result.isValid) {
      setStrength(result.strength);
    }
  };

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => handleChange(e.target.value)}
      />
      <div className="strength-meter">
        <span className={`strength-${strength}`}>
          Strength: {strength}
        </span>
      </div>
    </div>
  );
};
```

---

## Summary

| Feature | Zod | ValidationBuilder |
|---------|-----|-------------------|
| Form validation | ✅ Excellent | ❌ Not recommended |
| Real-time field validation | ⚠️ Possible | ✅ Excellent |
| Type inference | ✅ Yes | ❌ No |
| Schema composition | ✅ Yes | ⚠️ Manual |
| Custom validators | ⚠️ Via refine() | ✅ Easy |
| API validation | ✅ Yes | ❌ Not for objects |
| Learning curve | Medium | Low |
| Bundle size | ~14KB | ~2KB |

**Recommendation**: 
- **Use Zod** for forms with React Hook Form
- **Use ValidationBuilder** for real-time field validation and custom logic
- **Use both** together for optimal DX and UX

---

## Additional Resources

- [Zod Documentation](https://zod.dev/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Validation Schemas](src/core/validation/schemas.ts)
- [Validation Builders](src/core/validation/index.ts)
- [Specific Validators](src/core/validation/validators/)
