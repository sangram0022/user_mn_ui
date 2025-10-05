# Error Handling Quick Reference Guide

## For Developers: How to Use the New Error Handling System

### 1. Basic Usage in Components

```typescript
import ErrorAlert from './ErrorAlert';
import { useErrorHandler } from '../hooks/useErrorHandler';

const MyComponent = () => {
  // Get error handling functions
  const { error, handleError, clearError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    clearError(); // Clear previous errors
    
    try {
      const result = await apiClient.someEndpoint();
      // Handle success...
    } catch (err) {
      handleError(err); // Automatically parses and displays error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Display error if present */}
      {error && <ErrorAlert error={error} />}
      
      {/* Your form/content here */}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};
```

### 2. Validation Errors

```typescript
// Simple validation error
if (!email) {
  handleError(new Error('Please enter your email address'));
  return;
}

// Multiple validation checks
if (password.length < 6) {
  handleError(new Error('Password must be at least 6 characters long'));
  return;
}
```

### 3. Error Display Components

#### Main Error Alert (Recommended)
```typescript
{error && <ErrorAlert error={error} />}
```

#### Inline Error (For form fields)
```typescript
import { InlineError } from './ErrorAlert';

{error && <InlineError error={error} />}
```

#### Banner Error (Full-width, page-level)
```typescript
import { ErrorBanner } from './ErrorAlert';

{error && <ErrorBanner error={error} />}
```

#### Toast Error (Non-blocking notification)
```typescript
import { ErrorToast } from './ErrorAlert';

{error && <ErrorToast error={error} onClose={clearError} />}
```

### 4. Clearing Errors

```typescript
// Clear error when user starts typing
const handleInputChange = (e) => {
  if (error) clearError();
  // ... handle input
};

// Clear error on component unmount
useEffect(() => {
  return () => clearError();
}, [clearError]);
```

### 5. Simplified Hook (Message Only)

If you only need simple text messages:

```typescript
import { useErrorMessage } from '../hooks/useErrorHandler';

const MyComponent = () => {
  const { error, setError, clearError } = useErrorMessage();
  
  // Set simple error message
  setError('Something went wrong');
  
  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};
```

### 6. Backend Error Codes

The system automatically maps backend error codes to user-friendly messages:

```typescript
// Backend returns:
{
  "error": {
    "message": {
      "error_code": "INVALID_CREDENTIALS"
    }
  }
}

// Automatically displayed as:
"Invalid email or password. Please check your credentials and try again."
```

### 7. Adding New Error Messages

Edit `src/locales/en/errors.json`:

```json
{
  "MY_NEW_ERROR_CODE": "User-friendly error message here",
  "PAYMENT_FAILED": "Payment processing failed. Please try again or contact support."
}
```

### 8. Checking Error Properties

```typescript
const { error, handleError } = useErrorHandler();

// Check error code
if (error?.code === 'INVALID_CREDENTIALS') {
  // Handle specific error
}

// Check error severity
if (error?.severity === 'warning') {
  // Show warning UI
}

// Get error message
const message = error?.message || 'An error occurred';
```

### 9. Common Patterns

#### Form Validation
```typescript
const validateForm = () => {
  if (!formData.email) {
    handleError(new Error('Email is required'));
    return false;
  }
  if (!formData.password) {
    handleError(new Error('Password is required'));
    return false;
  }
  return true;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  try {
    await apiClient.submit(formData);
    // Success handling...
  } catch (err) {
    handleError(err);
  }
};
```

#### Network Request with Loading
```typescript
const fetchData = async () => {
  setIsLoading(true);
  clearError();
  
  try {
    const data = await apiClient.getData();
    setData(data);
  } catch (err) {
    handleError(err);
  } finally {
    setIsLoading(false);
  }
};
```

#### Multiple API Calls
```typescript
const saveData = async () => {
  try {
    await apiClient.saveProfile(profile);
    await apiClient.saveSettings(settings);
    toast.success('Saved successfully!');
  } catch (err) {
    handleError(err); // Shows appropriate error message
  }
};
```

### 10. Error Severity Levels

Errors are automatically categorized by severity:

- **error**: Critical errors (auth failures, validation errors)
- **warning**: Non-critical issues (rate limits, deprecations)
- **info**: Informational messages (maintenance mode, updates)

### 11. Don't Do This ❌

```typescript
// ❌ Don't manually create error objects
setError({
  code: 'CUSTOM_ERROR',
  title: 'Error',
  message: 'Something went wrong',
  // ...lots of properties
});

// ✅ Do this instead
handleError(new Error('Something went wrong'));
```

```typescript
// ❌ Don't use alert() or console.error() for user-facing errors
alert('Error: Invalid input');
console.error('User validation failed');

// ✅ Do this instead
handleError(new Error('Invalid input'));
```

### 12. TypeScript Types

```typescript
import type { ParsedError } from '../types/error';

// Error object structure
interface ParsedError {
  code: string;           // Error code (e.g., 'INVALID_CREDENTIALS')
  message: string;        // User-friendly message
  details?: string;       // Technical details (optional)
  severity: 'error' | 'warning' | 'info';
  timestamp?: string;     // When error occurred
}
```

### 13. Testing Errors

```typescript
// Simulate an error in development
const testError = () => {
  handleError(new Error('This is a test error'));
};

// Test specific error codes
const testInvalidCredentials = () => {
  const mockError = {
    error: {
      message: {
        error_code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials'
      }
    }
  };
  handleError(mockError);
};
```

## Best Practices

1. ✅ **Always use `handleError()`** for API errors
2. ✅ **Use `clearError()`** when user starts correcting input
3. ✅ **Use `<ErrorAlert>`** for consistent styling
4. ✅ **Keep error messages user-friendly** (not technical)
5. ✅ **Clear errors on component unmount** if needed
6. ✅ **Test error scenarios** during development
7. ✅ **Add new error codes to `errors.json`** when needed

## Common Error Codes

| Code | When to Use |
|------|------------|
| `INVALID_CREDENTIALS` | Login fails due to wrong email/password |
| `EMAIL_NOT_VERIFIED` | User tries to login with unverified email |
| `VALIDATION_ERROR` | Form validation fails |
| `NETWORK_ERROR` | Network connection issue |
| `UNAUTHORIZED_ACCESS` | User doesn't have permission |
| `SESSION_EXPIRED` | User session has expired |
| `USER_NOT_FOUND` | User doesn't exist in system |
| `ACCOUNT_DISABLED` | User account is disabled |

## Need Help?

- Check `ERROR_HANDLING_MIGRATION_SUMMARY.md` for detailed documentation
- See `src/utils/errorParser.ts` for parsing logic
- See `src/components/LoginPageNew.tsx` for complete example
- See `src/components/RegisterPage.tsx` for validation example

---

**Remember**: The new error handling system is designed to be simple and consistent. Just use `handleError(err)` for all errors and let the system handle the rest!
