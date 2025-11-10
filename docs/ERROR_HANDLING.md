# Error Handling Guide

**Version:** 1.0  
**Last Updated:** November 10, 2025  
**Status:** Production Standard

## Overview

This document defines the **single source of truth** for error handling across the React frontend application. All error handling MUST use the patterns defined here.

---

## Standard Pattern: useStandardErrorHandler

### Single Source of Truth

**Hook:** `src/shared/hooks/useStandardErrorHandler.ts`

**Purpose:** Centralized error handling with:
- Automatic toast notifications
- Field error extraction (422 validation errors)
- 401 automatic redirect to login
- Structured logging
- Error categorization

### Basic Usage

```typescript
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

function MyComponent() {
  const handleError = useStandardErrorHandler();

  const handleSubmit = async () => {
    try {
      await apiCall();
    } catch (error) {
      handleError(error);
    }
  };
}
```

---

## Common Patterns

### Pattern 1: Simple API Call

```typescript
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { useToast } from '@/hooks/useToast';

export function useUpdateProfile() {
  const handleError = useStandardErrorHandler();
  const toast = useToast();

  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      handleError(error, {
        context: { operation: 'updateProfile' },
      });
    },
  });
}
```

### Pattern 2: Form Submission with Field Errors

```typescript
import { useForm } from 'react-hook-form';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

function LoginForm() {
  const form = useForm();
  const handleError = useStandardErrorHandler();

  const onSubmit = async (data) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      // Automatically sets field errors from 422 response
      handleError(error, {
        context: { operation: 'login' },
        fieldErrorSetter: form.setError,
      });
    }
  };
}
```

### Pattern 3: Component with Loading State

```typescript
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { useState } from 'react';

function DataComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const handleError = useStandardErrorHandler();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData();
      // Process data
    } catch (error) {
      handleError(error, {
        context: { operation: 'fetchData' },
      });
    } finally {
      setIsLoading(false);
    }
  };
}
```

### Pattern 4: Multiple Operations

```typescript
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

function BatchOperations() {
  const handleError = useStandardErrorHandler();

  const processBatch = async (items) => {
    const results = [];
    for (const item of items) {
      try {
        const result = await processItem(item);
        results.push(result);
      } catch (error) {
        handleError(error, {
          context: {
            operation: 'processBatch',
            itemId: item.id,
          },
        });
        // Continue processing other items
      }
    }
    return results;
  };
}
```

---

## Error Handler Options

### Full API

```typescript
handleError(error, {
  // Context for logging
  context: {
    operation: 'operationName',
    userId: '123',
    // Any additional context
  },

  // Field error setter (for forms)
  fieldErrorSetter: (errors: Record<string, string>) => void,
});
```

### What Gets Handled Automatically

1. **401 Unauthorized**
   - Automatic redirect to `/login`
   - Tokens cleared
   - User logged out

2. **422 Validation Errors**
   - Field errors extracted: `{ email: "Invalid email", password: "Too short" }`
   - Passed to `fieldErrorSetter` if provided
   - Toast notification with general message

3. **Network Errors**
   - Toast: "Network error. Please check your connection."
   - Logged with network error category

4. **Server Errors (500+)**
   - Toast: "Server error. Please try again later."
   - Logged with server error category

5. **All Other Errors**
   - Toast with error message from backend
   - Logged with appropriate category

---

## Backend Error Response Format

### Standard Success Response

```typescript
{
  success: true,
  data: { /* response data */ },
  message: "Operation successful",
  timestamp: "2025-11-10T12:00:00Z"
}
```

### Standard Error Response

```typescript
{
  success: false,
  error: "Error message",
  message_code: "VALIDATION_ERROR",
  timestamp: "2025-11-10T12:00:00Z"
}
```

### Validation Error Response (422)

```typescript
{
  success: false,
  error: "Validation failed",
  field_errors: {
    email: ["Invalid email format"],
    password: ["Password must be at least 8 characters"]
  },
  message_code: "VALIDATION_ERROR",
  timestamp: "2025-11-10T12:00:00Z"
}
```

---

## Error Categories

The error handler automatically categorizes errors:

1. **Authentication** (`auth_error`)
   - 401 Unauthorized
   - Token expired
   - Invalid credentials

2. **Validation** (`validation_error`)
   - 422 Unprocessable Entity
   - Field validation failures
   - Schema validation errors

3. **Authorization** (`authorization_error`)
   - 403 Forbidden
   - Insufficient permissions

4. **Network** (`network_error`)
   - Connection lost
   - Timeout
   - DNS failure

5. **Server** (`server_error`)
   - 500+ status codes
   - Backend errors

6. **Client** (`client_error`)
   - 400 Bad Request
   - 404 Not Found
   - Other 4xx errors

---

## Forbidden Patterns

### ❌ NEVER Do This:

```typescript
// ❌ Manual error handling
try {
  await apiCall();
} catch (error) {
  if (error.response?.status === 401) {
    window.location.href = '/login';
  }
  toast.error(error.message);
  console.error(error);
}

// ❌ Ignoring errors
try {
  await apiCall();
} catch {
  // Silent failure - NEVER DO THIS
}

// ❌ Generic error messages
try {
  await apiCall();
} catch {
  toast.error('Something went wrong');
}
```

### ✅ ALWAYS Do This:

```typescript
// ✅ Use standard error handler
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

const handleError = useStandardErrorHandler();

try {
  await apiCall();
} catch (error) {
  handleError(error, { context: { operation: 'apiCall' } });
}
```

---

## Testing Error Handling

### Unit Test Example

```typescript
import { renderHook } from '@testing-library/react';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

describe('useStandardErrorHandler', () => {
  it('should redirect to login on 401', () => {
    const { result } = renderHook(() => useStandardErrorHandler());
    const error = { response: { status: 401 } };

    result.current(error);

    expect(window.location.href).toBe('/login');
  });

  it('should extract field errors from 422', () => {
    const setError = vi.fn();
    const { result } = renderHook(() => useStandardErrorHandler());
    const error = {
      response: {
        status: 422,
        data: {
          field_errors: { email: ['Invalid email'] }
        }
      }
    };

    result.current(error, { fieldErrorSetter: setError });

    expect(setError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'Invalid email'
    });
  });
});
```

---

## Migration Guide

### From Manual Error Handling

**Before:**
```typescript
try {
  await updateProfile(data);
  toast.success('Updated!');
} catch (error) {
  if (error.response?.status === 422) {
    const fieldErrors = error.response.data.field_errors;
    Object.entries(fieldErrors).forEach(([field, messages]) => {
      setError(field, { message: messages[0] });
    });
  } else {
    toast.error(error.message || 'Error occurred');
  }
  console.error('Profile update failed:', error);
}
```

**After:**
```typescript
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

const handleError = useStandardErrorHandler();

try {
  await updateProfile(data);
  toast.success('Updated!');
} catch (error) {
  handleError(error, {
    context: { operation: 'updateProfile' },
    fieldErrorSetter: setError,
  });
}
```

---

## Best Practices

### Do's ✅

1. **Always use useStandardErrorHandler** for all error handling
2. **Provide context** for better debugging: `{ operation: 'operationName' }`
3. **Use fieldErrorSetter** for form validation errors
4. **Show success toasts** for successful operations
5. **Test error scenarios** in unit/integration tests
6. **Log operations** that might fail

### Don'ts ❌

1. **Never use console.log** for errors (use logger)
2. **Never manually redirect** on 401 (handler does it)
3. **Never catch and ignore** errors silently
4. **Never duplicate error handling** logic
5. **Never hardcode error messages** (use backend messages)
6. **Never bypass the error handler** without a good reason

---

## Logging Integration

Error handler automatically logs to centralized logger:

```typescript
logger().error('Operation failed', error, {
  operation: 'updateProfile',
  userId: '123',
  category: 'validation_error',
  statusCode: 422,
});
```

View logs in:
- Browser console (development)
- CloudWatch (production)
- Local log files (`logs/` directory)

---

## Common Error Scenarios

### Scenario 1: Login Failed

```typescript
const handleError = useStandardErrorHandler();

try {
  await login(credentials);
} catch (error) {
  // Automatically shows toast: "Invalid credentials"
  // Logs error with category: auth_error
  handleError(error, { context: { operation: 'login' } });
}
```

### Scenario 2: Form Validation Failed

```typescript
const form = useForm();
const handleError = useStandardErrorHandler();

try {
  await submitForm(data);
} catch (error) {
  // Automatically sets field errors
  // Shows toast: "Please fix validation errors"
  handleError(error, {
    context: { operation: 'submitForm' },
    fieldErrorSetter: form.setError,
  });
}
```

### Scenario 3: Network Timeout

```typescript
const handleError = useStandardErrorHandler();

try {
  await fetchData();
} catch (error) {
  // Automatically shows toast: "Network error. Please check your connection."
  // Logs error with category: network_error
  handleError(error, { context: { operation: 'fetchData' } });
}
```

### Scenario 4: Permission Denied

```typescript
const handleError = useStandardErrorHandler();

try {
  await deleteUser(userId);
} catch (error) {
  // Automatically shows toast: "You don't have permission to perform this action"
  // Logs error with category: authorization_error
  handleError(error, { context: { operation: 'deleteUser', userId } });
}
```

---

## Troubleshooting

### Issue: Errors not showing toasts

**Check:**
1. Is `useToast()` properly initialized in app?
2. Is toast container rendered in App.tsx?
3. Are errors being caught?

### Issue: Field errors not setting

**Check:**
1. Is `fieldErrorSetter` provided?
2. Does backend return `field_errors` object?
3. Is status code 422?

### Issue: 401 redirect not working

**Check:**
1. Is error actually 401 status?
2. Is window.location available?
3. Check browser console for errors

---

## Support

**Questions?**
- See: `src/shared/hooks/useStandardErrorHandler.ts` (implementation)
- See: `src/core/error/errorHandler.ts` (core logic)
- See: `src/core/logging/` (logging integration)

**Report Issues:**
- Create ticket with error logs
- Include operation context
- Provide reproduction steps

---

## Version History

- **v1.0** (Nov 10, 2025) - Initial documentation
  - Established useStandardErrorHandler as standard
  - Documented all patterns and examples
  - Migration guide for legacy code
