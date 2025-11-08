# 🎯 Code Consistency Quick Reference Guide

**Last Updated**: November 8, 2025  
**For**: Development Team  
**Purpose**: Day-to-day reference for consistent code patterns

---

## 📐 Core Principles

### DRY (Don't Repeat Yourself)
✅ **DO**: Use centralized utilities  
❌ **DON'T**: Copy-paste code

### SOLID
✅ **DO**: Single responsibility per module  
❌ **DON'T**: Mix concerns (data fetching + rendering + validation)

### Clean Code
✅ **DO**: Self-documenting code with clear names  
❌ **DON'T**: Add comments explaining what code does (explain WHY)

---

## 🔥 Common Patterns

### 1. API Calls

#### ✅ CORRECT: Use useApiModern

```typescript
import { useApiQuery, useApiMutation } from '@/shared/hooks/useApiModern';
import { apiGet, apiPost } from '@/core/api/apiHelpers';

// GET request
export function useUsers() {
  return useApiQuery(
    ['users'],
    () => apiGet('/api/v1/users'),
    { 
      errorToast: true,
      staleTime: 5 * 60 * 1000
    }
  );
}

// POST request
export function useCreateUser() {
  return useApiMutation(
    (data) => apiPost('/api/v1/users', data),
    {
      successMessage: 'User created successfully',
      queryKeyToUpdate: ['users']
    }
  );
}
```

#### ❌ WRONG: Direct apiClient

```typescript
// Don't do this anymore
const response = await apiClient.get('/api/v1/users');
return response.data;
```

#### ❌ WRONG: Manual React Query

```typescript
// Don't create custom hooks like this
return useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const response = await apiClient.get('/api/v1/users');
    return response.data;
  }
});
```

---

### 2. Error Handling

#### ✅ CORRECT: Use centralized handler

```typescript
import { handleError } from '@/core/error';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

try {
  await updateProfile(data);
  toast.success('Profile updated');
} catch (error) {
  const result = handleError(error);
  toast.error(result.userMessage);
  
  if (result.redirectToLogin) {
    navigate('/login');
  }
}
```

#### ❌ WRONG: Manual error handling

```typescript
// Don't do manual error extraction
catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  setError(message);
}
```

#### ❌ WRONG: Multiple error states

```typescript
// Don't use separate states for errors
const [error, setError] = useState('');
const [fieldErrors, setFieldErrors] = useState({});
const [validationErrors, setValidationErrors] = useState([]);

// Use single error state or result object
```

---

### 3. Logging

#### ✅ CORRECT: Use logger

```typescript
import { logger } from '@/core/logging';

// Info level for user actions
logger().info('User logged in', { userId, timestamp });

// Debug level for development
logger().debug('API query cache hit', { queryKey });

// Error level with error object
logger().error('Failed to load data', error, { context: 'ProfilePage' });

// Warn level for recoverable issues
logger().warn('Rate limit approaching', { current: 95, limit: 100 });
```

#### ❌ WRONG: Console methods

```typescript
// Don't use console directly (ESLint will catch this)
console.log('User logged in');
console.error('Error:', error);
console.warn('Warning');
```

---

### 4. Validation

#### ✅ CORRECT: Use ValidationBuilder

```typescript
import { ValidationBuilder } from '@/core/validation';

// Single field
const emailResult = new ValidationBuilder()
  .required()
  .email()
  .validate(email, 'email');

if (!emailResult.isValid) {
  toast.error(emailResult.errors.email[0]);
}

// Form validation
const formResult = new ValidationBuilder()
  .validateField('email', email, b => b.required().email())
  .validateField('password', password, b => b.required().password())
  .validateField('username', username, b => b.required().username())
  .result();

if (!formResult.isValid) {
  setErrors(formResult.errors);
  return;
}

// Quick validation
import { quickValidate, isValidEmail } from '@/core/validation';

if (isValidEmail(email)) {
  // proceed
}
```

#### ❌ WRONG: Local validation functions

```typescript
// Don't create local validators
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password);
}
```

#### ❌ WRONG: Inline regex

```typescript
// Don't use inline patterns
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  setError('Invalid email');
}
```

---

### 5. React 19 Features

#### ✅ CORRECT: useActionState for forms

```typescript
import { useActionState } from 'react';

const [state, formAction, isPending] = useActionState(
  async (prevState, formData) => {
    try {
      const result = await loginUser({
        email: formData.get('email'),
        password: formData.get('password')
      });
      return { success: true, data: result };
    } catch (error) {
      const errorResult = handleError(error);
      return { success: false, error: errorResult.userMessage };
    }
  },
  { success: false, data: null, error: null }
);

return (
  <form action={formAction}>
    <input name="email" type="email" required />
    <input name="password" type="password" required />
    <button type="submit" disabled={isPending}>
      {isPending ? 'Logging in...' : 'Login'}
    </button>
    {state.error && <p className="error">{state.error}</p>}
  </form>
);
```

#### ✅ CORRECT: useOptimistic for instant updates

```typescript
import { useOptimisticList } from '@/shared/hooks/useOptimisticUpdate';

const { items, add, remove, update } = useOptimisticList(
  users,
  updateUsersApi
);

// Instant UI update, automatically rolls back on error
const handleToggle = async (userId: string) => {
  await update(userId, user => ({ ...user, active: !user.active }));
};
```

#### ❌ WRONG: Manual useState for forms

```typescript
// Don't use multiple useState
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState('');
const [data, setData] = useState(null);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    const result = await login();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};
```

#### ❌ WRONG: useMemo/useCallback everywhere

```typescript
// Don't use these unless truly needed (React Compiler optimizes)
const handleClick = useCallback(() => {
  // simple function
}, []);

const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

// Just write normal functions - Compiler handles it
const handleClick = () => {
  // simple function
};

const filteredData = data.filter(item => item.active);
```

---

### 6. Component Structure

#### ✅ CORRECT: Organized component

```typescript
// 1. Imports (grouped)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiQuery } from '@/shared/hooks/useApiModern';
import { handleError } from '@/core/error';
import type { User } from '@/types';

// 2. Types
interface ProfilePageProps {
  userId: string;
}

// 3. Constants (outside component)
const TABS = ['info', 'settings', 'security'] as const;

// 4. Component
export function ProfilePage({ userId }: ProfilePageProps) {
  // 4a. Hooks
  const navigate = useNavigate();
  const { data: user, isLoading } = useApiQuery(['user', userId], () => getUser(userId));
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('info');

  // 4b. Handlers
  const handleSave = async (data: User) => {
    try {
      await updateUser(data);
    } catch (error) {
      handleError(error);
    }
  };

  // 4c. Effects (if needed)
  // useEffect(() => { ... }, []);

  // 4d. Render
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <NotFound />;

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### ❌ WRONG: Mixed structure

```typescript
// Don't mix everything together
export function ProfilePage() {
  const handleClick = () => {};
  
  const [state1, setState1] = useState();
  
  const someCalculation = () => {};
  
  useEffect(() => {}, []);
  
  const [state2, setState2] = useState();
  
  const anotherHandler = () => {};
  
  return <div>...</div>;
}
```

---

## 🚨 Common Mistakes to Avoid

### 1. ❌ Prop Drilling

```typescript
// Bad: Passing props through 5 levels
<Component1 user={user}>
  <Component2 user={user}>
    <Component3 user={user}>
      <Component4 user={user}>
        <Component5 user={user} />
```

**Fix**: Use Context or composition

```typescript
// Good: Context for deep data
<UserProvider value={user}>
  <Component1>
    <Component2>
      <Component3>
        <Component4>
          <Component5 />  {/* Uses useContext(UserContext) */}
```

### 2. ❌ Duplicate Code

```typescript
// Bad: Same code in multiple files
// File 1
function formatDate(date: Date) {
  return date.toLocaleDateString();
}

// File 2
function formatDate(date: Date) {
  return date.toLocaleDateString();
}
```

**Fix**: Centralize utilities

```typescript
// Good: Single source in shared/utils
import { formatShortDate } from '@/shared/utils/dateFormatters';
```

### 3. ❌ Magic Numbers/Strings

```typescript
// Bad
if (status === 'active' && count > 5) {
  setTimeout(() => {}, 3000);
}
```

**Fix**: Named constants

```typescript
// Good
const USER_STATUS_ACTIVE = 'active';
const MAX_RETRY_COUNT = 5;
const RETRY_DELAY_MS = 3000;

if (status === USER_STATUS_ACTIVE && count > MAX_RETRY_COUNT) {
  setTimeout(() => {}, RETRY_DELAY_MS);
}
```

### 4. ❌ Large Functions

```typescript
// Bad: 200+ line function
function handleSubmit() {
  // validation
  // transformation
  // API call
  // error handling
  // success handling
  // analytics
  // navigation
  // ... 200 lines
}
```

**Fix**: Extract sub-functions

```typescript
// Good: Small, focused functions
function handleSubmit() {
  const validationResult = validateForm(formData);
  if (!validationResult.isValid) {
    showValidationErrors(validationResult.errors);
    return;
  }

  const transformedData = transformFormData(formData);
  await submitData(transformedData);
  trackFormSubmission(formData);
  navigateToSuccess();
}
```

---

## 📋 Pre-Commit Checklist

Before committing code, verify:

- [ ] No `console.log` statements
- [ ] Using `logger()` for logging
- [ ] Using `useApiQuery`/`useApiMutation` for API calls
- [ ] Using `handleError()` for error handling
- [ ] Using `ValidationBuilder` for validation
- [ ] No inline validation functions
- [ ] No duplicate code
- [ ] Functions < 50 lines
- [ ] Files < 300 lines
- [ ] ESLint passing
- [ ] TypeScript no errors
- [ ] Tests passing

---

## 🔍 Quick Search Patterns

### Find Issues in Your Code

```bash
# Find console usage
grep -r "console\." src/

# Find direct apiClient usage
grep -r "apiClient\." src/ | grep -v "// OK"

# Find local validation
grep -r "validate.*function\|const.*validate.*=" src/

# Find inline regex
grep -r "/\^.*\$/" src/

# Find large files
find src -name "*.tsx" -exec wc -l {} + | sort -rn | head -10
```

---

## 🎓 Learning Resources

### Internal
- `src/core/error/` - Error handling patterns
- `src/core/validation/` - Validation patterns
- `src/shared/hooks/useApiModern.ts` - API patterns
- `src/core/logging/` - Logging patterns

### External
- [React 19 Docs](https://react.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [Clean Code](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

## 💬 Get Help

**Questions?**
- Check this guide first
- Review example implementations
- Ask in team chat
- Schedule code review

**Found a pattern violation?**
- Create GitHub issue
- Tag as "code-quality"
- Propose solution

---

**Version**: 1.0  
**Maintainer**: Development Team  
**Feedback**: Open to improvements!
