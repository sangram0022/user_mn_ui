# Quick Reference Guide - New Error Handling Pattern

## 🚀 How to Use the New Error Handling

### For Form Submissions (Login, Register, etc.)

#### ❌ OLD WAY (Don't use):

```typescript
const [error, setError] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const { login } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    await login(credentials);
    navigate('/dashboard'); // ❌ Navigates even on error
  } catch (err) {
    setError(err); // ❌ Error might get lost
  } finally {
    setIsLoading(false); // ❌ Causes re-render, page "refresh"
  }
};
```

#### ✅ NEW WAY (Use this):

```typescript
import { useFormSubmission } from '@hooks/useFormSubmission';
import { ErrorAlert } from '@shared/ui/EnhancedErrorAlert';

const { isLoading, error, submit, clearError } = useFormSubmission({
  onSuccess: () => navigate('/dashboard'), // ✅ Only navigates on success
});

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  await submit(() => login(credentials)); // ✅ Automatic error handling
};

// In JSX:
{error && <ErrorAlert error={error} onDismiss={clearError} />}
```

---

## 📋 Complete Example: Login Form

```typescript
import { useFormSubmission } from '@hooks/useFormSubmission';
import { ErrorAlert } from '@shared/ui/EnhancedErrorAlert';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // ✅ Use the new hook
  const { isLoading, error, submit, clearError } = useFormSubmission({
    onSuccess: () => navigate('/dashboard'),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // ✅ Simple submit - hook handles everything
    await submit(() => login({ email, password }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (error) clearError(); // ✅ Clear error when user types
    // ... update form state
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ✅ Error displays inline */}
      {error && <ErrorAlert error={error} onDismiss={clearError} />}

      <input
        value={email}
        onChange={handleInputChange}
        disabled={isLoading} // ✅ Disable during loading
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
};
```

---

## 🎨 Error Display Components

### EnhancedErrorAlert (Use this for form errors)

```typescript
import { ErrorAlert } from '@shared/ui/EnhancedErrorAlert';

<ErrorAlert
  error={error}              // ApiError | Error | string
  onDismiss={clearError}     // Optional dismiss handler
  showDetails={true}         // Show technical details in dev mode
  className="mb-4"           // Optional custom classes
/>
```

**Features:**

- ✅ User-friendly messages from centralized config
- ✅ Dismissible
- ✅ Shows technical details in dev mode only
- ✅ Proper ARIA labels for accessibility

---

## 🔄 Loading States

### LoadingOverlay (For forms with existing content)

```typescript
import LoadingOverlay from '@shared/components/LoadingOverlay';

<div className="relative">
  <form>
    {/* Form content */}
  </form>

  <LoadingOverlay
    isLoading={isLoading}
    message="Signing in..."
    transparent={true}  // User can see form beneath
  />
</div>
```

### LoadingSpinner (For inline loading)

```typescript
import LoadingSpinner from '@components/common/LoadingSpinner';

<LoadingSpinner size="md" />          // Default
<LoadingSpinner size="sm" />          // Small
<LoadingSpinner size="lg" />          // Large
<LoadingSpinner color="border-t-red-600" />  // Custom color
```

---

## 🛡️ Error Boundaries

### Global Error Boundary (Already applied in App.tsx)

Catches all unhandled React errors:

```typescript
import { GlobalErrorBoundary } from '@app/GlobalErrorBoundary';

<GlobalErrorBoundary>
  <YourApp />
</GlobalErrorBoundary>
```

**Features:**

- ✅ Catches component errors
- ✅ Logs to monitoring system
- ✅ User-friendly fallback UI
- ✅ Recovery options

---

## 🚫 What NOT to Do

### ❌ Don't use console.log in components

```typescript
// ❌ BAD
console.log('Error:', error);
console.log('User data:', user);

// ✅ GOOD
import { logger } from '@shared/utils/logger';
logger.error('Login failed', error, { context: 'LoginPage' });
logger.info('User logged in', { userId: user.id });
```

### ❌ Don't manually handle loading in forms

```typescript
// ❌ BAD - Manual loading management
const [isLoading, setIsLoading] = useState(false);
setIsLoading(true);
await apiCall();
setIsLoading(false);

// ✅ GOOD - Use the hook
const { isLoading, submit } = useFormSubmission();
await submit(() => apiCall());
```

### ❌ Don't swallow errors

```typescript
// ❌ BAD - Error gets lost
try {
  await apiCall();
} catch (error) {
  // Do nothing - error disappears
}

// ✅ GOOD - Handle or propagate
try {
  await apiCall();
} catch (error) {
  handleError(error);
  // or
  throw error;
}
```

---

## 🎯 Common Patterns

### Pattern 1: Form with Validation

```typescript
const { isLoading, error, submit, clearError } = useFormSubmission({
  onSuccess: () => navigate('/success'),
});

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // ✅ Validate before submit
  if (!email || !password) {
    // Don't use submit() for validation errors
    setValidationError('Please fill all fields');
    return;
  }

  await submit(() => apiClient.login({ email, password }));
};
```

### Pattern 2: Clear Error on Input Change

```typescript
const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));

  // ✅ Clear error when user starts typing
  if (error) {
    clearError();
  }
};
```

### Pattern 3: Multiple Submit Buttons

```typescript
const { isLoading, error, submit, clearError } = useFormSubmission();

const handleSave = async () => {
  await submit(() => apiClient.saveData(data));
};

const handleSaveAndContinue = async () => {
  const result = await submit(() => apiClient.saveData(data));
  if (result.success) {
    navigate('/next-page');
  }
};
```

---

## 📚 Type Definitions

```typescript
// Form submission state
interface FormSubmissionState<T = unknown> {
  isLoading: boolean;
  error: ApiError | null;
  data: T | null;
}

// Hook options
interface UseFormSubmissionOptions {
  onSuccess?: (data: unknown) => void | Promise<void>;
  onError?: (error: ApiError) => void;
  resetOnSubmit?: boolean;
}

// Submit result
interface FormSubmissionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
```

---

## 🐛 Troubleshooting

### Error not displaying?

✅ Check: Are you using `{error && <ErrorAlert error={error} />}`?
✅ Check: Is the error state being cleared somewhere?
✅ Check: Console for any JavaScript errors

### Page still refreshing?

✅ Check: Are you using `useFormSubmission` hook?
✅ Check: Is AuthContext properly throwing errors?
✅ Check: Are you using `e.preventDefault()` in form submit?

### TypeScript errors?

✅ Run: `npm run type-check`
✅ Check: Import paths are correct
✅ Check: ErrorAlert is imported from `@shared/ui/EnhancedErrorAlert`

---

## ✅ Checklist for Converting Existing Forms

- [ ] Import `useFormSubmission` hook
- [ ] Import `ErrorAlert` component
- [ ] Replace manual state management with hook
- [ ] Add `<ErrorAlert>` to JSX
- [ ] Add `clearError()` to input handlers
- [ ] Remove console.log statements
- [ ] Test error display (wrong credentials)
- [ ] Test error dismissal
- [ ] Test loading state
- [ ] Verify no page refresh

---

## 📞 Need Help?

1. Check `ui_enhancement1.md` for detailed architecture
2. Check `IMPLEMENTATION_SUMMARY.md` for what was implemented
3. Review working example in `LoginPage.tsx`
4. Check TypeScript types for guidance

---

**Quick Reference Version:** 1.0  
**Last Updated:** October 12, 2025  
**For:** All developers working on forms and API calls
