# Quick Reference - UI Enhancement Implementation

**For Developers:** How to use the new architecture  
**Updated:** October 12, 2025

---

## 🚀 Quick Start

### Form Submission (No More Page Refresh!)

```typescript
import { useFormSubmission } from '@hooks/useFormSubmission';
import { ErrorAlert } from '@shared/ui/EnhancedErrorAlert';

const MyFormPage: React.FC = () => {
  const [formData, setFormData] = useState({ /* ... */ });
  const navigate = useNavigate();

  // Use this hook for ALL form submissions
  const { isLoading, error, submit, clearError } = useFormSubmission({
    onSuccess: () => {
      navigate('/success-page');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Just call submit with your API call
    await submit(() => apiClient.post('/endpoint', formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Error stays visible - no page refresh! */}
      {error && <ErrorAlert error={error} onDismiss={clearError} />}

      {/* Your form fields... */}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
};
```

---

## 📡 API Calls

### Use Single API Client

```typescript
import { apiClient } from '@lib/api/client';

// ✅ DO THIS - Single client
const users = await apiClient.get<User[]>('/users');
const user = await apiClient.post<User>('/users', { name: 'John' });
const updated = await apiClient.put<User>('/users/1', { name: 'Jane' });
await apiClient.delete('/users/1');

// ❌ DON'T DO THIS - These are deleted
// import apiService from '@services/api.service'; // DELETED
// import { apiClient } from '@infrastructure/api'; // DELETED
```

---

## ❌ Error Handling

### Display Errors Properly

```typescript
import { ErrorAlert } from '@shared/ui/EnhancedErrorAlert';

// In your component
{error && (
  <ErrorAlert
    error={error}
    onDismiss={() => setError(null)}
    showDetails={true} // Dev-only technical details
  />
)}
```

### User-Friendly Messages

Errors automatically show user-friendly messages from `errorMessages.ts`:

```typescript
// Backend returns: { message: "auth/invalid-credentials" }
// User sees: "Invalid email or password. Please try again."

// Backend returns: { message: "network error" }
// User sees: "Unable to connect. Check your internet connection."
```

---

## 📝 Logging

### Replace console.log

```typescript
import { logger } from '@shared/utils/logger';

// ❌ DON'T DO THIS
console.log('User logged in', user);
console.error('Login failed', error);

// ✅ DO THIS
logger.info('User logged in', undefined, { userId: user.id });
logger.error('Login failed', error, { context: 'LoginPage' });
logger.warn('Slow API response', undefined, { duration: 5000 });
logger.debug('State updated', undefined, { newState });
```

---

## 🔄 Loading States

### Using useFormSubmission

```typescript
const { isLoading, error, submit } = useFormSubmission();

// Loading state is managed automatically
<button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### Using LoadingOverlay

```typescript
import { LoadingOverlay } from '@shared/components/LoadingOverlay';

<div className="relative">
  {/* Your content */}
  <LoadingOverlay
    isLoading={isLoading}
    message="Saving changes..."
    transparent={true}
  />
</div>
```

---

## 🛡️ Error Boundaries

### Already Setup

```typescript
// App.tsx - Already wrapped
<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>

// For specific sections
<PageErrorBoundary>
  <MyComponent />
</PageErrorBoundary>
```

---

## 🎯 Best Practices

### DO ✅

1. **Use `useFormSubmission` for all forms** - Consistent error handling
2. **Use `apiClient` for all API calls** - Single source of truth
3. **Use `logger` instead of console.log** - Structured logging
4. **Display errors with `ErrorAlert`** - User-friendly messages
5. **Clear errors when user types** - Better UX

### DON'T ❌

1. **Don't navigate before checking success** - Wait for API response
2. **Don't swallow errors** - Always propagate or display them
3. **Don't use multiple API clients** - Only use lib/api/client.ts
4. **Don't use console.log** - Use logger instead
5. **Don't manually manage loading states** - Use useFormSubmission

---

## 📦 Import Paths

### Core Hooks

```typescript
import { useFormSubmission } from '@hooks/useFormSubmission';
import { useAuth } from '@hooks/useAuth';
import { useErrorHandler } from '@hooks/useErrorHandler';
```

### API & Services

```typescript
import { apiClient } from '@lib/api/client';
import { ApiError } from '@lib/api/error';
import authService from '@services/auth.service';
```

### UI Components

```typescript
import { ErrorAlert } from '@shared/ui/EnhancedErrorAlert';
import { LoadingOverlay } from '@shared/components/LoadingOverlay';
import LoadingSpinner from '@components/common/LoadingSpinner';
```

### Utilities

```typescript
import { logger } from '@shared/utils/logger';
import { getErrorConfig } from '@shared/config/errorMessages';
```

---

## 🐛 Debugging

### Check Error Details

```typescript
// In development, errors show technical details
<ErrorAlert
  error={error}
  showDetails={true} // Shows error code, status, stack trace
/>
```

### View Logs

```typescript
// Logs are automatically sent to console in development
// In production, they're buffered and sent to monitoring service

logger.error('Something failed', error, {
  context: 'MyComponent',
  userId: user?.id,
  action: 'submit-form',
});
```

---

## 📊 Testing

### Test Form Submissions

```typescript
import { renderHook, act } from '@testing-library/react';
import { useFormSubmission } from '@hooks/useFormSubmission';

test('handles form submission', async () => {
  const { result } = renderHook(() => useFormSubmission());

  await act(async () => {
    const response = await result.current.submit(() => Promise.resolve({ data: 'success' }));
    expect(response.success).toBe(true);
  });

  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBe(null);
});
```

---

## 🔧 Common Patterns

### Login Form

```typescript
const { isLoading, error, submit, clearError } = useFormSubmission({
  onSuccess: () => navigate('/dashboard'),
});

await submit(() => login(credentials));
```

### Registration Form

```typescript
const { isLoading, error, submit, clearError } = useFormSubmission({
  onSuccess: (data) => {
    showToast('Registration successful!');
    navigate('/login');
  },
});

await submit(() => register(userData));
```

### Update Profile

```typescript
const { isLoading, error, submit, clearError } = useFormSubmission({
  onSuccess: () => {
    showToast('Profile updated!');
    refreshUser();
  },
});

await submit(() => apiClient.put('/profile', profileData));
```

### Delete Item

```typescript
const { isLoading, error, submit } = useFormSubmission({
  onSuccess: () => {
    showToast('Item deleted!');
    refetchItems();
  },
});

await submit(() => apiClient.delete(`/items/${itemId}`));
```

---

## 🎓 Migration Guide

### Old Pattern → New Pattern

#### Before (OLD ❌)

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await apiService.post('/endpoint', data);
    navigate('/success');
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};
```

#### After (NEW ✅)

```typescript
const { isLoading, error, submit } = useFormSubmission({
  onSuccess: () => navigate('/success'),
});

const handleSubmit = async (e) => {
  e.preventDefault();
  await submit(() => apiClient.post('/endpoint', data));
};
```

---

## ⚡ Performance Tips

1. **Use useCallback for handlers** - Prevent unnecessary re-renders
2. **Clear errors on input change** - Better UX
3. **Use proper error boundaries** - Catch unexpected errors
4. **Leverage automatic retry** - ApiClient retries failed requests
5. **Use loading states** - Show users what's happening

---

## 🔗 Related Documentation

- **UI_ENHANCEMENT_IMPLEMENTATION.md** - Full implementation details
- **CLEANUP_COMPLETE.md** - Code cleanup summary
- **NEXT_STEPS.md** - Future enhancements
- **unused_files.md** - Removed files list

---

## 💡 Pro Tips

1. Always use `useFormSubmission` for forms - It handles everything
2. Errors clear automatically when user types - No manual clearing needed
3. Loading states are automatic - No manual setLoading needed
4. Navigation only happens on success - No more half-submitted forms
5. Errors persist across re-renders - No more lost error messages

---

## ❓ FAQ

**Q: Why did my page refresh on error before?**  
A: Old code navigated before checking success. New code only navigates on success.

**Q: Which API client should I use?**  
A: Always use `import { apiClient } from '@lib/api/client'`

**Q: How do I show error messages?**  
A: Use `<ErrorAlert error={error} onDismiss={clearError} />`

**Q: Should I still use console.log?**  
A: No, use `logger.info/error/warn/debug` instead

**Q: How do I test form submissions?**  
A: Use `renderHook` with `useFormSubmission` - see Testing section

---

**Last Updated:** October 12, 2025  
**Status:** ✅ Production Ready  
**Questions?** See UI_ENHANCEMENT_IMPLEMENTATION.md
