# Error Handling Guide

**Author:** Code Audit Implementation  
**Date:** 2025-11-09  
**Version:** 1.0  
**Related:** CODE_AUDIT_FIX_PLAN.md Phase 1

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [useStandardErrorHandler](#usestandarderrorhandler)
4. [useFormErrorHandler](#useformerrorhandler)
5. [useSilentErrorHandler](#usesileneterrorhandler)
6. [Error Types](#error-types)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What This Guide Covers

This guide documents the centralized error handling system implemented in Phase 1 of the code audit. It provides:

- ✅ **Standardized error handling** across all API calls
- ✅ **Automatic 401 redirect** to login on authentication failures
- ✅ **Field error extraction** from 422 validation responses
- ✅ **Toast notifications** for user feedback
- ✅ **Structured logging** for debugging and monitoring
- ✅ **Error categorization** (network, auth, validation, server)

### Why Centralized Error Handling?

**Before (Inconsistent):**
```typescript
// ❌ Manual error handling - repeated across components
try {
  await apiClient.post('/users', data);
} catch (error) {
  if (error.response?.status === 401) {
    window.location.href = '/login';
  }
  toast.error(error.message || 'Something went wrong');
  console.error(error);
}
```

**After (Centralized):**
```typescript
// ✅ Centralized error handling - consistent behavior
const handleError = useStandardErrorHandler();

try {
  await apiClient.post('/users', data);
} catch (error) {
  handleError(error); // Handles 401, toast, logging automatically
}
```

### Key Benefits

1. **DRY Principle:** Error handling logic defined once
2. **Consistency:** Same user experience across all features
3. **Maintainability:** Update error handling in one place
4. **Type Safety:** TypeScript-first design with proper types
5. **Flexibility:** Options for customization when needed

---

## Architecture

### Error Handling Flow

```
User Action (API Call)
    ↓
Try/Catch Block
    ↓
Error Occurs
    ↓
useStandardErrorHandler
    ↓
┌─────────────────────────┐
│ Error Categorization    │
│ - Network Error         │
│ - Auth Error (401/403)  │
│ - Validation Error(422) │
│ - Server Error (5xx)    │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Error Processing        │
│ - Extract field errors  │
│ - Categorize error      │
│ - Generate user message │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ User Feedback           │
│ - Show toast            │
│ - Update field errors   │
│ - Redirect if needed    │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Logging                 │
│ - Structured log        │
│ - Error context         │
│ - Timestamp             │
└─────────────────────────┘
```

### Component Structure

```
src/
├── shared/hooks/
│   └── useStandardErrorHandler.ts  ← Main hook
├── core/
│   ├── error/
│   │   ├── types.ts                ← Error type definitions
│   │   ├── errorHandler.ts         ← Core error logic
│   │   └── errorReporting/         ← Error reporting service
│   └── logging/
│       └── index.ts                ← Structured logging
└── hooks/
    └── useToast.tsx                ← Toast notifications
```

---

## useStandardErrorHandler

### Basic Usage

```typescript
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

function MyComponent() {
  const handleError = useStandardErrorHandler();

  const handleSubmit = async () => {
    try {
      await apiClient.post('/endpoint', data);
    } catch (error) {
      handleError(error);
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### API Reference

```typescript
function useStandardErrorHandler(): (
  error: unknown,
  options?: ErrorHandlerOptions
) => ErrorHandlingResult;

interface ErrorHandlerOptions {
  // Custom message to display instead of default
  customMessage?: string;
  
  // Whether to show toast notification
  showToast?: boolean;
  
  // Whether to log the error
  logError?: boolean;
  
  // Function to set field errors (for forms)
  fieldErrorSetter?: (errors: Record<string, string>) => void;
  
  // Additional context for logging
  context?: Record<string, unknown>;
}

interface ErrorHandlingResult {
  handled: boolean;
  category: ErrorCategory;
  userMessage: string;
  fieldErrors?: Record<string, string>;
}
```

### Options

#### Custom Message

Override the default error message:

```typescript
const handleError = useStandardErrorHandler();

try {
  await deleteUser(userId);
} catch (error) {
  handleError(error, {
    customMessage: 'Failed to delete user. Please try again.',
  });
}
```

#### Disable Toast

Suppress toast notification (useful when showing error in component):

```typescript
const handleError = useStandardErrorHandler();

try {
  await fetchData();
} catch (error) {
  const result = handleError(error, { showToast: false });
  // Handle error display in component
  setErrorMessage(result.userMessage);
}
```

#### Additional Context

Add context for better logging:

```typescript
const handleError = useStandardErrorHandler();

try {
  await updateProfile(data);
} catch (error) {
  handleError(error, {
    context: {
      operation: 'updateProfile',
      userId: user.id,
      attemptNumber: retryCount,
    },
  });
}
```

### Automatic Behaviors

#### 1. 401 Unauthorized → Auto-Redirect

```typescript
// Automatically redirects to login
try {
  await apiClient.get('/protected-resource');
} catch (error) {
  handleError(error); // → Redirects to /login if 401
}
```

#### 2. Field Error Extraction

```typescript
// Automatically extracts field errors from 422 response
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
const handleError = useStandardErrorHandler();

try {
  await createUser(formData);
} catch (error) {
  handleError(error, { fieldErrorSetter: setFieldErrors });
  // fieldErrors now contains: { email: 'Email already exists', ... }
}
```

#### 3. Error Categorization

```typescript
try {
  await apiCall();
} catch (error) {
  const result = handleError(error);
  
  // result.category is one of:
  // - 'network'    → Network/connection error
  // - 'auth'       → 401/403 authentication error
  // - 'validation' → 422 validation error
  // - 'server'     → 5xx server error
  // - 'client'     → 4xx other client error
  // - 'unknown'    → Unknown error
}
```

---

## useFormErrorHandler

### Purpose

Specialized hook for form submissions that need field error handling.

### Usage

```typescript
import { useFormErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

function ProfileForm() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const handleError = useFormErrorHandler();

  const handleSubmit = async (data: FormData) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated!');
    } catch (error) {
      handleError(error, setFieldErrors);
      // Toast shown + field errors set automatically
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="email"
        error={fieldErrors.email}
      />
      <Input
        name="phone"
        error={fieldErrors.phone}
      />
    </form>
  );
}
```

### Key Differences from useStandardErrorHandler

| Feature | useStandardErrorHandler | useFormErrorHandler |
|---------|------------------------|-------------------|
| Toast by default | ✅ Yes | ✅ Yes |
| Field error extraction | ⚙️ Manual (via options) | ✅ Automatic |
| Signature | `(error, options?)` | `(error, setFieldErrors)` |
| Use case | General API calls | Form submissions |

---

## useSilentErrorHandler

### Purpose

For background operations where you don't want to show toast notifications.

### Usage

```typescript
import { useSilentErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

function BackgroundSync() {
  const handleError = useSilentErrorHandler();

  useEffect(() => {
    const syncData = async () => {
      try {
        await backgroundSync();
      } catch (error) {
        // Logs error but doesn't show toast
        handleError(error, { logError: true });
      }
    };

    const interval = setInterval(syncData, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
```

### When to Use

- ✅ Background sync operations
- ✅ Polling/refresh operations
- ✅ Analytics/tracking
- ✅ Non-critical operations
- ❌ User-initiated actions (use useStandardErrorHandler)

---

## Error Types

### Custom Error Classes

```typescript
import {
  APIError,
  NetworkError,
  ValidationError,
  AuthError,
} from '@/core/error';

// APIError - General API errors
throw new APIError(
  'Failed to fetch users',
  500,
  'GET',
  '/api/users',
  { query: params }
);

// NetworkError - Connection errors
throw new NetworkError('Network connection failed');

// ValidationError - Form validation
throw new ValidationError('Validation failed', {
  email: 'Invalid email format',
  password: 'Password too short',
});

// AuthError - Authentication errors
throw new AuthError('Unauthorized', 401);
```

### Error Type Hierarchy

```
Error (built-in)
  ├── APIError
  │     ├── NetworkError
  │     ├── ValidationError
  │     └── AuthError
  └── Other errors (handled as unknown)
```

### Type Definitions

```typescript
// src/core/error/types.ts

export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public method: string,
    public endpoint: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends APIError {
  constructor(message: string) {
    super(message, 0, 'UNKNOWN', 'UNKNOWN');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends APIError {
  constructor(
    message: string,
    public fieldErrors: Record<string, string>
  ) {
    super(message, 422, 'UNKNOWN', 'UNKNOWN');
    this.name = 'ValidationError';
  }
}

export class AuthError extends APIError {
  constructor(message: string, statusCode: 401 | 403) {
    super(message, statusCode, 'UNKNOWN', 'UNKNOWN');
    this.name = 'AuthError';
  }
}
```

---

## Best Practices

### ✅ DO: Use Standard Handler

```typescript
// ✅ CORRECT
const handleError = useStandardErrorHandler();

try {
  await apiCall();
} catch (error) {
  handleError(error);
}
```

### ❌ DON'T: Manual Error Handling

```typescript
// ❌ FORBIDDEN
try {
  await apiCall();
} catch (error) {
  if (error.response?.status === 401) {
    window.location.href = '/login';
  }
  toast.error(error.message);
}
```

### ✅ DO: Use Form Handler for Forms

```typescript
// ✅ CORRECT
const handleError = useFormErrorHandler();

try {
  await submitForm(data);
} catch (error) {
  handleError(error, setFieldErrors);
}
```

### ✅ DO: Provide Context

```typescript
// ✅ CORRECT
handleError(error, {
  context: {
    operation: 'createUser',
    userId: data.email,
  },
});
```

### ❌ DON'T: Swallow Errors

```typescript
// ❌ BAD
try {
  await apiCall();
} catch (error) {
  // Silently failing - user has no feedback
}
```

### ✅ DO: Use Silent Handler When Appropriate

```typescript
// ✅ CORRECT for background operations
const handleError = useSilentErrorHandler();

try {
  await backgroundSync();
} catch (error) {
  handleError(error, { logError: true });
}
```

---

## Common Patterns

### Pattern 1: TanStack Query Mutation

```typescript
import { useMutation } from '@tanstack/react-query';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

export function useUpdateUser() {
  const handleError = useStandardErrorHandler();
  
  return useMutation({
    mutationFn: (data) => apiClient.put('/users', data),
    onError: handleError, // ← Direct reference
    onSuccess: () => {
      toast.success('User updated!');
    },
  });
}
```

### Pattern 2: Form Submission with Field Errors

```typescript
function UserForm() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const handleError = useFormErrorHandler();
  const mutation = useUpdateUser();

  const handleSubmit = async (data: FormData) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      handleError(error, setFieldErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="email" error={fieldErrors.email} />
      <Input name="phone" error={fieldErrors.phone} />
    </form>
  );
}
```

### Pattern 3: Retry Logic

```typescript
function useRetryableQuery() {
  const handleError = useStandardErrorHandler();
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    try {
      return await apiClient.get('/data');
    } catch (error) {
      if (retryCount < 3) {
        setRetryCount((c) => c + 1);
        return fetchData(); // Retry
      }
      handleError(error, {
        context: { retryCount },
        customMessage: 'Failed after 3 attempts',
      });
      throw error;
    }
  };

  return { fetchData, retryCount };
}
```

### Pattern 4: Optimistic Updates with Rollback

```typescript
function useOptimisticUpdate() {
  const queryClient = useQueryClient();
  const handleError = useStandardErrorHandler();

  const mutation = useMutation({
    mutationFn: updateUser,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user'] });
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData(['user']);
      
      // Optimistically update
      queryClient.setQueryData(['user'], newData);
      
      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(['user'], context.previousUser);
      }
      handleError(error);
    },
  });

  return mutation;
}
```

---

## Testing

### Testing Error Handler

```typescript
import { renderHook } from '@testing-library/react';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

describe('useStandardErrorHandler', () => {
  it('should handle 401 error and redirect', () => {
    const { result } = renderHook(() => useStandardErrorHandler());
    const error = { response: { status: 401 } };

    result.current(error);

    expect(window.location.href).toBe('/login');
  });

  it('should extract field errors from 422', () => {
    const { result } = renderHook(() => useStandardErrorHandler());
    const error = {
      response: {
        status: 422,
        data: {
          field_errors: {
            email: 'Invalid email',
            phone: 'Invalid phone',
          },
        },
      },
    };
    const setFieldErrors = vi.fn();

    result.current(error, { fieldErrorSetter: setFieldErrors });

    expect(setFieldErrors).toHaveBeenCalledWith({
      email: 'Invalid email',
      phone: 'Invalid phone',
    });
  });
});
```

### Integration Test Example

```typescript
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should show validation errors from server', async () => {
  server.use(
    http.post('/api/users', () => {
      return HttpResponse.json(
        {
          success: false,
          field_errors: {
            email: 'Email already exists',
          },
        },
        { status: 422 }
      );
    })
  );

  render(<UserForm />);

  const emailInput = screen.getByLabelText('Email');
  await userEvent.type(emailInput, 'test@example.com');
  await userEvent.click(screen.getByText('Submit'));

  await waitFor(() => {
    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Issue: Errors Not Showing Toast

**Symptoms:** API errors occur but no toast shown

**Solutions:**
1. Check if `showToast: false` is set in options
2. Verify toast hook is properly configured
3. Check if error is actually thrown (not swallowed)
4. Verify error reaches handleError function

```typescript
// Debug: Log error before handling
try {
  await apiCall();
} catch (error) {
  console.log('Error caught:', error); // Debug
  handleError(error);
}
```

### Issue: 401 Not Redirecting

**Symptoms:** 401 error but stays on page

**Solutions:**
1. Verify error status code is exactly 401
2. Check if custom handler overrides behavior
3. Verify navigate hook is available

```typescript
// Debug: Check error structure
catch (error) {
  console.log('Error status:', error?.response?.status);
  handleError(error);
}
```

### Issue: Field Errors Not Displaying

**Symptoms:** 422 error but field errors not shown

**Solutions:**
1. Verify field error setter is passed
2. Check backend response format matches expected structure
3. Verify field names match between backend and frontend

```typescript
// Debug: Log field errors
const result = handleError(error, { fieldErrorSetter: setFieldErrors });
console.log('Field errors:', result.fieldErrors);
```

### Issue: Too Many Toasts

**Symptoms:** Multiple toasts for same error

**Solutions:**
1. Check for duplicate error handling
2. Verify try/catch blocks don't nest improperly
3. Use `showToast: false` for intermediate handlers

```typescript
// ✅ CORRECT: Handle once at top level
try {
  await operation1();
  await operation2();
} catch (error) {
  handleError(error); // Single handler
}

// ❌ WRONG: Multiple handlers
try {
  try {
    await operation1();
  } catch (error) {
    handleError(error); // Handler 1
  }
} catch (error) {
  handleError(error); // Handler 2 - duplicate!
}
```

---

## Related Documentation

- [API_PATTERNS.md](./API_PATTERNS.md) - API call patterns with error handling
- [REACT_19_PATTERNS.md](./REACT_19_PATTERNS.md) - React 19 best practices
- [MANUAL_TESTING_CHECKLIST.md](./MANUAL_TESTING_CHECKLIST.md) - Testing error scenarios

---

**Last Updated:** 2025-11-09  
**Version:** 1.0  
**Maintainer:** Development Team
