# Centralized Error Handling Pattern

## Overview

This application uses a **centralized error handling system** where all error messages are defined in configuration files, NOT in API responses. This ensures:

- ✅ Consistent error messages across the application
- ✅ Easy to update messages in one place
- ✅ Ready for internationalization (i18n)
- ✅ Type-safe error handling
- ✅ Better user experience with clear, actionable messages

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Request                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Returns Error Code                      │
│              { error_code: "INVALID_CREDENTIALS" }          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           useApiError Hook (Auto-mapping)                    │
│   - Extracts error code from response                        │
│   - Maps to user-friendly message from config                │
│   - Returns ApiErrorState with our messages                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│             ApiErrorAlert Component                          │
│   - Displays user-friendly message                           │
│   - Shows description and suggested action                   │
│   - Includes retry button for recoverable errors             │
└─────────────────────────────────────────────────────────────┘
```

## Files Structure

```
src/
├── shared/
│   ├── config/
│   │   └── errorMessages.ts          # All error message definitions
│   └── components/
│       └── errors/
│           └── ApiErrorAlert.tsx     # Reusable error display component
├── hooks/
│   └── errors/
│       └── useApiError.ts            # Centralized error handling hook
└── domains/
    └── auth/
        └── pages/
            └── LoginPage.tsx         # Example usage
```

## Usage Guide

### 1. Basic Usage in a Component

```tsx
import { useApiError } from '@hooks/errors/useApiError';
import { ApiErrorAlert } from '@shared/components/errors/ApiErrorAlert';
import { apiClient } from '@lib/api';

function LoginPage() {
  const { error, showError, clearError } = useApiError();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (credentials) => {
    setIsLoading(true);
    clearError(); // Clear any previous errors

    try {
      await apiClient.login(credentials);
      navigate('/dashboard');
    } catch (err) {
      // Automatically maps error code to user-friendly message
      showError(err, 'LoginPage');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Display error with full details */}
      {error && (
        <ApiErrorAlert
          error={error}
          onDismiss={clearError}
          showRetry={true}
          onRetry={() => handleSubmit(lastCredentials)}
        />
      )}

      {/* Rest of form */}
    </form>
  );
}
```

### 2. Simple Inline Error

```tsx
import { InlineError } from '@shared/components/errors/ApiErrorAlert';

{
  error && <InlineError message={error.message} onDismiss={clearError} />;
}
```

### 3. Custom Error Display

```tsx
function CustomErrorDisplay() {
  const { error } = useApiError();

  if (!error) return null;

  return (
    <div className="custom-error">
      <h3>{error.message}</h3>
      <p>{error.description}</p>
      {error.action && <p>Action: {error.action}</p>}
      <code>Error Code: {error.code}</code>
    </div>
  );
}
```

## Adding New Error Messages

### Step 1: Define Error in Config

Edit `src/shared/config/errorMessages.ts`:

```typescript
export const AUTH_ERRORS: Record<string, ErrorMessageConfig> = {
  // ... existing errors

  NEW_ERROR_CODE: {
    code: 'NEW_ERROR_CODE',
    message: 'User-friendly message',
    description: 'Detailed explanation of what went wrong',
    action: 'What the user should do to fix it',
    recoverable: true, // Can user retry?
    statusCode: 400,
  },
};
```

### Step 2: Backend Returns the Code

Backend should return:

```json
{
  "error": {
    "code": "NEW_ERROR_CODE"
  },
  "detail": {
    "error_code": "NEW_ERROR_CODE",
    "status_code": 400
  }
}
```

### Step 3: Frontend Automatically Displays

The `useApiError` hook will automatically:

1. Extract `NEW_ERROR_CODE` from the response
2. Look up the config in `errorMessages.ts`
3. Return the user-friendly message

**No code changes needed in components!**

## Error Message Guidelines

### Good Error Messages ✅

```typescript
{
  code: 'INVALID_CREDENTIALS',
  message: 'Invalid email or password',  // Clear and specific
  description: 'The credentials you entered are incorrect.',  // Explains what happened
  action: 'Please check your email and password and try again.',  // Tells user what to do
  recoverable: true,
}
```

### Bad Error Messages ❌

```typescript
{
  code: 'ERROR_500',
  message: 'Internal server error',  // Too technical
  description: 'Exception in auth.py line 123',  // Implementation details
  action: 'Contact administrator',  // Not helpful
}
```

## Error Categories

### Authentication Errors (AUTH_ERRORS)

- `INVALID_CREDENTIALS` - Wrong email/password
- `TOKEN_EXPIRED` - Session expired
- `ACCOUNT_LOCKED` - Too many failed attempts
- `EMAIL_NOT_VERIFIED` - Email verification required

### User Errors (USER_ERRORS)

- `EMAIL_ALREADY_EXISTS` - Duplicate registration
- `USER_NOT_FOUND` - No account found
- `WEAK_PASSWORD` - Password requirements not met
- `REGISTRATION_FAILED` - Registration error

### Validation Errors (VALIDATION_ERRORS)

- `VALIDATION_ERROR` - General validation failure
- `INVALID_INPUT` - Invalid data format
- `REQUIRED_FIELD` - Missing required field

### Network Errors (NETWORK_ERRORS)

- `NETWORK_ERROR` - Connection failed
- `TIMEOUT` - Request timed out
- `SERVER_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - Service down

### Resource Errors (RESOURCE_ERRORS)

- `RATE_LIMIT_EXCEEDED` - Too many requests
- `RESOURCE_NOT_FOUND` - 404 error
- `DUPLICATE_ENTRY` - Duplicate data

## API Error State Structure

```typescript
interface ApiErrorState {
  code: string; // Error code (e.g., "INVALID_CREDENTIALS")
  message: string; // User-friendly message from config
  description?: string; // Detailed explanation
  action?: string; // Suggested user action
  statusCode?: number; // HTTP status code
  recoverable: boolean; // Can user retry?
  originalError?: unknown; // Original error for debugging
}
```

## Testing Error Handling

### Test Different Error Codes

```typescript
// Simulate different errors in tests
const mockErrors = {
  invalidLogin: { error: { code: 'INVALID_CREDENTIALS' } },
  networkError: { error: { code: 'NETWORK_ERROR' } },
  serverError: { error: { code: 'SERVER_ERROR' } },
};

// Test component handles each error correctly
test('displays invalid credentials error', () => {
  showError(mockErrors.invalidLogin);
  expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
});
```

## Migration from Old Pattern

### Old Way (❌ Don't do this)

```tsx
// Getting message from backend response
const errorMessage = error.response?.data?.message || 'Something went wrong';
```

### New Way (✅ Do this)

```tsx
// Using centralized error handling
const { error, showError } = useApiError();
showError(err); // Automatically maps to user-friendly message
```

## Benefits

1. **Consistency**: All error messages look and feel the same
2. **Maintainability**: Update messages in one place
3. **i18n Ready**: Easy to add translations later
4. **Type Safety**: TypeScript ensures error codes exist
5. **User Experience**: Clear, actionable error messages
6. **Debugging**: Original error preserved for logs
7. **Testability**: Easy to test error scenarios

## Best Practices

1. ✅ **Always use useApiError hook** for API error handling
2. ✅ **Define all error messages in errorMessages.ts**
3. ✅ **Never display raw backend error messages to users**
4. ✅ **Include actionable suggestions** in error.action
5. ✅ **Mark recoverable errors** with recoverable: true
6. ✅ **Log original errors** for debugging
7. ✅ **Test error scenarios** in your components

## Examples

### Login Page

```tsx
const { error, showError, clearError } = useApiError();

try {
  await apiClient.login(credentials);
} catch (err) {
  showError(err, 'LoginPage');
}

{
  error && <ApiErrorAlert error={error} onDismiss={clearError} />;
}
```

### Registration Page

```tsx
const { error, showError, clearError } = useApiError();

try {
  await apiClient.register(data);
} catch (err) {
  showError(err, 'RegisterPage');
}

{
  error && (
    <ApiErrorAlert error={error} onDismiss={clearError} showRetry={true} onRetry={handleSubmit} />
  );
}
```

### Profile Update

```tsx
const { error, showError, clearError } = useApiError();

try {
  await apiClient.updateProfile(profileData);
  toast.success('Profile updated successfully');
} catch (err) {
  showError(err, 'ProfilePage');
}

{
  error && <InlineError message={error.message} />;
}
```

## Future Enhancements

- [ ] Add internationalization (i18n) support
- [ ] Add error analytics tracking
- [ ] Add error recovery suggestions
- [ ] Add contextual help links
- [ ] Add error screenshots for support
