# 🌍 Localization System Guide

## Overview

This application uses **i18next** and **react-i18next** for comprehensive internationalization (i18n) support. All UI text is externalized to translation files, making it easy to add new languages.

---

## 📁 Project Structure

```
src/core/localization/
├── i18n.ts                          # i18next configuration
├── hooks/
│   └── useErrorMessage.ts           # Hook for error message handling
└── locales/
    └── en/                          # English translations
        ├── index.ts                 # Master export
        ├── auth.ts                  # Authentication domain (login, register, etc.)
        ├── common.ts                # Shared UI elements (buttons, status, etc.)
        ├── errors.ts                # Backend error_code mappings
        └── validation.ts            # Client-side validation messages
```

---

## 🚀 Quick Start

### 1. Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('auth.login.title')}</h1>
      <button>{t('common.actions.submit')}</button>
    </div>
  );
}
```

### 2. Using Error Messages

```tsx
import { useErrorMessage } from '@/core/localization/hooks/useErrorMessage';

function LoginForm() {
  const { parseError } = useErrorMessage();
  
  try {
    await loginUser();
  } catch (error) {
    // Automatically extracts error_code from backend response
    const errorMessage = parseError(error);
    toast.error(errorMessage); // Shows localized message
  }
}
```

### 3. Interpolation (Dynamic Values)

```tsx
// Translation file
{
  "greeting": "Hello, {{name}}!",
  "itemCount": "You have {{count}} items"
}

// Component
t('greeting', { name: 'John' })           // "Hello, John!"
t('itemCount', { count: 5 })              // "You have 5 items"
```

---

## 📖 Translation Keys Reference

### **auth.ts** - Authentication Domain

#### Login (`auth.login.*`)
- `title` - "Welcome Back"
- `subtitle` - "Sign in to your account to continue"
- `emailLabel` - "Email Address"
- `emailPlaceholder` - "you@example.com"
- `passwordLabel` - "Password"
- `passwordPlaceholder` - "Enter your password"
- `rememberMe` - "Remember me"
- `forgotPassword` - "Forgot password?"
- `submitButton` - "Sign In"
- `submitting` - "Signing in..."
- `divider` - "Or continue with"
- `socialGoogle` - "Google"
- `socialGitHub` - "GitHub"
- `noAccount` - "Don't have an account?"
- `signUpLink` - "Sign up for free"

#### Register (`auth.register.*`)
- `title` - "Create Your Account"
- `subtitle` - "Join us today and get started"
- `firstNameLabel` - "First Name"
- `firstNamePlaceholder` - "John"
- `lastNameLabel` - "Last Name"
- `lastNamePlaceholder` - "Doe"
- ... (see `src/core/localization/locales/en/auth.ts`)

#### Forgot Password (`auth.forgotPassword.*`)
- `title` - "Forgot Password?"
- `subtitle` - "We'll send you reset instructions"
- ... (see auth.ts)

#### Reset Password (`auth.resetPassword.*`)
- `title` - "Reset Your Password"
- `subtitle` - "Create a new password for your account"
- ... (see auth.ts)

#### Password Strength (`auth.passwordStrength.*`)
- `weak` - "Weak"
- `medium` - "Medium"
- `strong` - "Strong"
- `requirementsTitle` - "Password Requirements:"
- `minLength` - "At least 8 characters"
- `uppercase` - "One uppercase letter"
- `lowercase` - "One lowercase letter"
- `number` - "One number"
- `special` - "One special character"

---

### **common.ts** - Shared UI Elements

#### Actions (`common.actions.*`)
- `submit` - "Submit"
- `cancel` - "Cancel"
- `save` - "Save"
- `delete` - "Delete"
- `edit` - "Edit"
- `create` - "Create"
- `update` - "Update"
- `close` - "Close"
- `back` - "Back"
- `next` - "Next"
- `previous` - "Previous"
- `confirm` - "Confirm"
- `search` - "Search"
- `filter` - "Filter"
- `clear` - "Clear"
- `reset` - "Reset"
- `loading` - "Loading..."
- `saving` - "Saving..."
- `deleting` - "Deleting..."
- `submitting` - "Submitting..."

#### Status (`common.status.*`)
- `active` - "Active"
- `inactive` - "Inactive"
- `pending` - "Pending"
- `completed` - "Completed"
- `failed` - "Failed"
- `success` - "Success"
- `error` - "Error"
- `warning` - "Warning"
- `info` - "Info"

#### Time (`common.time.*`)
- `justNow` - "Just now"
- `minuteAgo` - "{{count}} minute ago"
- `minutesAgo` - "{{count}} minutes ago"
- `hourAgo` - "{{count}} hour ago"
- `hoursAgo` - "{{count}} hours ago"
- `dayAgo` - "{{count}} day ago"
- `daysAgo` - "{{count}} days ago"

#### Success Messages (`common.success.*`)
- `created` - "Created successfully"
- `updated` - "Updated successfully"
- `deleted` - "Deleted successfully"
- `saved` - "Saved successfully"
- `sent` - "Sent successfully"
- `copied` - "Copied to clipboard"

---

### **errors.ts** - Backend Error Code Mappings

Maps backend `error_code` to user-friendly messages.

#### Authentication Errors
- `INVALID_CREDENTIALS` - "Invalid email or password. Please check your credentials and try again."
- `TOKEN_EXPIRED` - "Your session has expired. Please sign in again."
- `TOKEN_INVALID` - "Invalid authentication token. Please sign in again."
- `ACCOUNT_LOCKED` - "Your account has been locked due to multiple failed login attempts. Please try again later or reset your password."
- `EMAIL_NOT_VERIFIED` - "Please verify your email address before signing in. Check your inbox for the verification link."
- `PASSWORD_EXPIRED` - "Your password has expired. Please reset your password to continue."
- `REFRESH_TOKEN_EXPIRED` - "Your session has expired. Please sign in again."
- `REFRESH_TOKEN_INVALID` - "Invalid session token. Please sign in again."

#### Registration Errors
- `EMAIL_ALREADY_EXISTS` - "An account with this email address already exists. Please sign in or use a different email."
- `USERNAME_ALREADY_EXISTS` - "This username is already taken. Please choose a different username."
- `WEAK_PASSWORD` - "Your password is too weak. Please use a stronger password with uppercase, lowercase, numbers, and special characters."

#### Validation Errors
- `VALIDATION_ERROR` - "Please check your input and try again."
- `REQUIRED_FIELD_MISSING` - "Please fill in all required fields."
- `INVALID_INPUT` - "One or more fields contain invalid data. Please review your input."
- `INVALID_EMAIL_FORMAT` - "Please enter a valid email address."
- `INVALID_PASSWORD_FORMAT` - "Password must be at least 8 characters with uppercase, lowercase, number, and special character."

#### Permission Errors
- `UNAUTHORIZED` - "You are not authorized to access this resource. Please sign in."
- `FORBIDDEN` - "You don't have permission to perform this action."
- `ACCESS_DENIED` - "Access denied. You don't have the required permissions."
- `INSUFFICIENT_PERMISSIONS` - "You don't have sufficient permissions to perform this action. Please contact your administrator."

#### Rate Limiting
- `RATE_LIMIT_EXCEEDED` - "Too many requests. Please wait a moment and try again."
- `TOO_MANY_ATTEMPTS` - "Too many failed attempts. Please try again later."
- `TEMPORARY_LOCKOUT` - "Your account has been temporarily locked. Please try again in a few minutes."

#### Server & Network Errors
- `INTERNAL_SERVER_ERROR` - "Something went wrong on our end. Please try again later."
- `SERVICE_UNAVAILABLE` - "Our service is temporarily unavailable. Please try again in a few moments."
- `BAD_GATEWAY` - "Unable to connect to the server. Please check your internet connection and try again."
- `NETWORK_ERROR` - "Network error. Please check your internet connection."
- `TIMEOUT_ERROR` - "Request timed out. Please try again."

... (see `src/core/localization/locales/en/errors.ts` for complete list)

---

### **validation.ts** - Client-side Validation

Used for form validation on the client side.

#### Required Fields (`validation.required.*`)
- `field` - "This field is required"
- `email` - "Email is required"
- `password` - "Password is required"
- `confirmPassword` - "Please confirm your password"
- `firstName` - "First name is required"
- `lastName` - "Last name is required"

#### Email Validation (`validation.email.*`)
- `invalid` - "Invalid email address"
- `format` - "Please enter a valid email address (e.g., user@example.com)"
- `tooLong` - "Email address is too long (max 255 characters)"

#### Password Validation (`validation.password.*`)
- `tooShort` - "Password must be at least {{min}} characters"
- `tooLong` - "Password must be less than {{max}} characters"
- `noUppercase` - "Password must contain at least one uppercase letter"
- `noLowercase` - "Password must contain at least one lowercase letter"
- `noNumber` - "Password must contain at least one number"
- `noSpecial` - "Password must contain at least one special character"
- `mismatch` - "Passwords do not match"
- `weak` - "Password is too weak. Use a mix of letters, numbers, and symbols"

---

## 🔧 Backend Error Handling

### Backend Response Format

Your backend API returns errors in this format:

```json
{
  "status_code": 400,
  "error_code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "details": {
    "field": "email"
  }
}
```

### Error Handling Flow

```tsx
// 1. Backend sends error with error_code
fetch('/api/login', { ... })
  .catch(error => {
    // 2. useErrorMessage hook extracts error_code
    const { parseError } = useErrorMessage();
    const localizedMessage = parseError(error);
    
    // 3. Displays user-friendly localized message
    toast.error(localizedMessage); 
    // Shows: "Invalid email or password. Please check your credentials and try again."
  });
```

### useErrorMessage Hook API

```tsx
const {
  getError,           // Get message for specific error_code
  parseError,         // Parse error and return localized message
  isAuthError,        // Check if error is authentication-related
  isValidationError,  // Check if error is validation-related
  getErrorSeverity,   // Get severity: 'error' | 'warning' | 'info'
} = useErrorMessage();

// Examples:
getError('INVALID_CREDENTIALS')           // Returns localized message
parseError(apiError)                      // Auto-extracts error_code
isAuthError('TOKEN_EXPIRED')              // true
isValidationError('REQUIRED_FIELD_MISSING') // true
getErrorSeverity('ACCOUNT_LOCKED')        // 'error'
```

---

## 🌐 Adding a New Language

### 1. Create Translation Files

```bash
src/core/localization/locales/
├── en/                    # Existing English
│   ├── index.ts
│   ├── auth.ts
│   ├── common.ts
│   ├── errors.ts
│   └── validation.ts
└── es/                    # NEW: Spanish
    ├── index.ts
    ├── auth.ts
    ├── common.ts
    ├── errors.ts
    └── validation.ts
```

### 2. Translate Keys

Copy English files to Spanish folder and translate:

```typescript
// src/core/localization/locales/es/auth.ts
export default {
  login: {
    title: 'Bienvenido de nuevo',
    subtitle: 'Inicia sesión en tu cuenta para continuar',
    emailLabel: 'Correo electrónico',
    // ... translate all keys
  },
  // ... rest of translations
};
```

### 3. Update i18n Configuration

```typescript
// src/core/localization/i18n.ts
import es from './locales/es';

const resources = {
  en: { translation: en },
  es: { translation: es }, // Add Spanish
};

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
};
```

### 4. Create Language Switcher Component

```tsx
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/core/localization/i18n';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  
  return (
    <select 
      value={i18n.language} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {SUPPORTED_LANGUAGES.map(lang => (
        <option key={lang} value={lang}>
          {LANGUAGE_NAMES[lang]}
        </option>
      ))}
    </select>
  );
}
```

---

## ✅ Best Practices

### 1. **Never Hardcode UI Text**

❌ **Bad:**
```tsx
<button>Sign In</button>
<p>Welcome Back</p>
```

✅ **Good:**
```tsx
<button>{t('auth.login.submitButton')}</button>
<p>{t('auth.login.title')}</p>
```

### 2. **Use Semantic Translation Keys**

❌ **Bad:**
```typescript
{
  text1: "Submit",
  text2: "Cancel",
  msg: "Email is required"
}
```

✅ **Good:**
```typescript
{
  actions: {
    submit: "Submit",
    cancel: "Cancel"
  },
  validation: {
    required: {
      email: "Email is required"
    }
  }
}
```

### 3. **Use Domain-based Organization**

```
auth.ts       → Authentication-related text
common.ts     → Shared UI elements
errors.ts     → Error messages
validation.ts → Form validation
users.ts      → User management (add as needed)
products.ts   → Product-related (add as needed)
```

### 4. **Handle Backend Errors Consistently**

Always use `parseError()` from `useErrorMessage` hook:

```tsx
const { parseError } = useErrorMessage();

try {
  await apiCall();
} catch (error) {
  const message = parseError(error); // Handles all error formats
  toast.error(message);
}
```

### 5. **Use Interpolation for Dynamic Content**

```typescript
// Translation
{
  "welcome": "Welcome, {{name}}!",
  "itemCount": "You have {{count}} items in your cart"
}

// Usage
t('welcome', { name: user.firstName })
t('itemCount', { count: cart.length })
```

### 6. **Keep Translations Synchronized**

When adding a new key to English, immediately add placeholder to other languages:

```typescript
// en/auth.ts
{
  login: {
    newFeature: "New Feature Text"
  }
}

// es/auth.ts
{
  login: {
    newFeature: "TODO: Translate" // Placeholder until translation ready
  }
}
```

---

## 🔍 Troubleshooting

### Issue: Translation key not found

**Symptom:** Seeing raw key like `auth.login.title` instead of "Welcome Back"

**Solutions:**
1. Check if i18n is initialized in `main.tsx`:
   ```tsx
   import './core/localization/i18n'; // Add this line
   ```

2. Verify translation key exists in locale file:
   ```typescript
   // src/core/localization/locales/en/auth.ts
   export default {
     login: {
       title: 'Welcome Back', // Must exist
     }
   };
   ```

3. Check import in locale index:
   ```typescript
   // src/core/localization/locales/en/index.ts
   import auth from './auth';
   export default {
     auth, // Must be exported
   };
   ```

### Issue: Error messages showing as codes

**Symptom:** Seeing `INVALID_CREDENTIALS` instead of user-friendly message

**Solutions:**
1. Use `parseError()` hook:
   ```tsx
   const { parseError } = useErrorMessage();
   const message = parseError(error); // Don't use error.message directly
   ```

2. Ensure error_code exists in errors.ts:
   ```typescript
   // src/core/localization/locales/en/errors.ts
   export default {
     INVALID_CREDENTIALS: "Invalid email or password...",
   };
   ```

### Issue: Language not changing

**Solution:**
```tsx
// Make sure to use i18n.changeLanguage(), not just t()
const { i18n } = useTranslation();
i18n.changeLanguage('es');
```

---

## 📚 Additional Resources

- **i18next Documentation:** https://www.i18next.com/
- **react-i18next Documentation:** https://react.i18next.com/
- **Best Practices:** https://www.i18next.com/principles/best-practices

---

## 📝 Summary

- ✅ All UI text externalized to translation files
- ✅ Backend error_code automatically mapped to localized messages
- ✅ Domain-based organization for easy maintenance
- ✅ Ready for multi-language support
- ✅ TypeScript type safety for error codes
- ✅ Consistent error handling with `useErrorMessage` hook
- ✅ No hardcoded text anywhere in the application

---

**Last Updated:** 2025
**Version:** 1.0.0
