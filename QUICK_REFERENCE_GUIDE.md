# Quick Reference Guide - React Best Practices 2025

**For:** User Management System  
**Last Updated:** November 12, 2025  

---

## Architecture Quick Reference

### Project Structure

```
src/
├── core/           → Cross-cutting concerns (SSOT)
├── domains/        → Feature domains (DDD pattern)
├── shared/         → Shared components & utilities
├── services/       → API services layer
├── design-system/  → Design tokens & variants
└── pages/          → Page components
```

**Rule:** Dependencies flow **downward only**
```
Pages → Domains → Services → Core
```

---

## Cross-Cutting Concerns

### 1. Logging ✅

**DON'T:**
```typescript
console.log('User logged in:', userId); ❌
```

**DO:**
```typescript
import { logger } from '@/core/logging';
logger().info('User logged in', { userId, timestamp }); ✅
```

**Common Patterns:**
```typescript
// API calls
logApiCall('GET', '/users', 245, { userId });

// Auth events
logAuthEvent('login-success', { userId, method: 'email' });

// User actions
logUserAction('button-click', { buttonId, page });

// Errors
logger().error('Operation failed', error, { context });
```

---

### 2. Error Handling ✅

**Pattern:** Use `useStandardErrorHandler` hook

```typescript
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

const MyComponent = () => {
  const handleError = useStandardErrorHandler();

  const mutation = useMutation({
    mutationFn: createUser,
    onError: (error) => {
      const fieldErrors = handleError(error);
      // Apply field errors to form
    },
  });
};
```

**Error Boundaries:**
```typescript
import { ModernErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

<ModernErrorBoundary level="page">
  <YourPage />
</ModernErrorBoundary>
```

---

### 3. Validation ✅

**Forms (Use Zod):**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/core/validation/schemas';

const form = useForm({
  resolver: zodResolver(loginSchema),
});
```

**Real-time (Use ValidationBuilder):**
```typescript
import { ValidationBuilder } from '@/core/validation';

const emailValidator = new ValidationBuilder()
  .required('Email is required')
  .email('Invalid format')
  .build();

const result = emailValidator(email);
```

---

### 4. API Calls ✅

**Pattern:** Service → Hook → Component

**Service Layer:**
```typescript
// src/domains/admin/services/userService.ts
import { apiGet, apiPost } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '@/core/api';

export const userService = {
  list: (filters?: ListFilters) =>
    apiGet<UserListResponse>(`${API_PREFIXES.ADMIN_USERS}`, filters),
  
  getById: (id: string) =>
    apiGet<User>(`${API_PREFIXES.ADMIN_USERS}/${id}`),
};
```

**Hook Layer:**
```typescript
// src/domains/admin/hooks/useUserList.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryClient';
import { userService } from '../services/userService';

export const useUserList = (filters?: ListFilters) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userService.list(filters),
  });
};
```

**Component Layer:**
```typescript
// src/domains/admin/pages/UsersPage.tsx
import { useUserList } from '../hooks';

export default function UsersPage() {
  const { data, isLoading, error } = useUserList();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <UsersList users={data.users} />;
}
```

---

### 5. Internationalization (i18n) ✅

**Pattern:** All user-facing text through `t()` function

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['common', 'auth']);
  
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <p>{t('auth:login.subtitle')}</p>
      <button>{t('common:submit')}</button>
    </div>
  );
};
```

**With Interpolation:**
```typescript
t('user.greeting', { name: 'John' })
// "Hello, John!"

t('user.count', { count: 5 })
// "You have 5 users"
```

---

## React 19 Patterns

### 1. React Compiler (Automatic Memoization) ✅

**DON'T (Old Pattern):**
```typescript
const memoizedValue = useMemo(() => compute(a, b), [a, b]); ❌
const memoizedCallback = useCallback(() => {}, []); ❌
```

**DO (React 19):**
```typescript
// React Compiler handles memoization automatically
const value = compute(a, b); ✅
const callback = () => {}; ✅
```

**When to Keep:**
```typescript
// Keep useCallback for returned functions from hooks
export const useMyHook = () => {
  return useCallback(() => {}, []); // ✅ Stable reference for consumers
};
```

---

### 2. useOptimistic (Instant UI Updates) ✅

```typescript
import { useOptimistic } from 'react';
import { useMutation } from '@tanstack/react-query';

const [optimisticUser, setOptimisticUser] = useOptimistic(
  currentUser,
  (_state, updatedUser) => updatedUser
);

const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newData) => {
    setOptimisticUser({ ...currentUser, ...newData }); // Instant UI
  },
});
```

---

### 3. Suspense & Error Boundaries ✅

```typescript
<ModernErrorBoundary level="component">
  <Suspense fallback={<TableLoader rows={10} />}>
    <DataTable />
  </Suspense>
</ModernErrorBoundary>
```

---

## Performance Patterns

### 1. Code Splitting (Lazy Loading) ✅

**Routes:**
```typescript
const LazyAdminPage = lazy(() => import('./domains/admin/pages/DashboardPage'));
```

**Components:**
```typescript
const HeavyChart = lazy(() => import('./components/Chart'));

<Suspense fallback={<Spinner />}>
  <HeavyChart data={data} />
</Suspense>
```

---

### 2. Virtualization (Large Lists) ✅

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 64,
});
```

---

### 3. Image Optimization ✅

```typescript
<OptimizedImage
  src={url}
  alt="User avatar"
  loading="lazy"
  decoding="async"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

## Component Patterns

### 1. Composition ✅

```typescript
<QueryLoader queryKey={['users']}>
  <ErrorBoundary>
    <UsersList />
  </ErrorBoundary>
</QueryLoader>
```

---

### 2. Render Props (Minimal Use) ⚠️

```typescript
<DataProvider
  render={(data) => <Component data={data} />}
/>
```

---

### 3. Compound Components ✅

```typescript
<Form>
  <Form.Field>
    <Form.Label />
    <Form.Input />
    <Form.Error />
  </Form.Field>
</Form>
```

---

## TypeScript Best Practices

### 1. Strict Mode ✅

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

### 2. Type Inference ✅

```typescript
// DON'T
const name: string = 'John'; ❌

// DO
const name = 'John'; ✅ (inferred as string)
```

---

### 3. Generic Utilities ✅

```typescript
type User = {
  id: string;
  name: string;
  email: string;
};

// Partial update
type PartialUser = Partial<User>;

// Pick specific fields
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit fields
type UserWithoutId = Omit<User, 'id'>;
```

---

## Testing Patterns

### 1. Unit Tests ✅

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

### 2. Integration Tests ✅

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useUserList } from './useUserList';

describe('useUserList', () => {
  it('should fetch users', async () => {
    const { result } = renderHook(() => useUserList());
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

---

### 3. E2E Tests ✅

```typescript
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

---

## Security Best Practices

### 1. XSS Protection ✅

```typescript
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(userInput);
```

---

### 2. CSRF Protection ✅

```typescript
// API client automatically handles CSRF tokens
import { apiPost } from '@/core/api/apiHelpers';

apiPost('/api/users', data); // CSRF token included automatically
```

---

### 3. Input Validation ✅

```typescript
// Always validate on both client and server
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const result = schema.safeParse(formData);
```

---

## Accessibility (a11y)

### 1. Semantic HTML ✅

```typescript
// DON'T
<div onClick={handleClick}>Click me</div> ❌

// DO
<button onClick={handleClick}>Click me</button> ✅
```

---

### 2. ARIA Labels ✅

```typescript
<button aria-label="Delete user">
  <IconDelete aria-hidden="true" />
</button>
```

---

### 3. Keyboard Navigation ✅

```typescript
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>
```

---

## Common Pitfalls

### ❌ DON'T

```typescript
// 1. Direct console.log
console.log('Debug info'); ❌

// 2. Hardcoded strings
throw new Error('Email is required'); ❌

// 3. Inline API calls
const response = await fetch('/api/users'); ❌

// 4. No error boundaries
<Component /> ❌

// 5. Manual memoization with React Compiler
const value = useMemo(() => compute(), []); ❌

// 6. Missing types
const user: any = data; ❌

// 7. Blocking the main thread
for (let i = 0; i < 1000000; i++) {} ❌

// 8. No lazy loading for routes
import AdminPage from './AdminPage'; ❌
```

---

### ✅ DO

```typescript
// 1. Use centralized logger
logger().info('Debug info', { data }); ✅

// 2. Use i18n
throw new Error(t('errors:email.required')); ✅

// 3. Use service layer
const users = await userService.list(); ✅

// 4. Wrap with error boundaries
<ErrorBoundary><Component /></ErrorBoundary> ✅

// 5. Let React Compiler handle memoization
const value = compute(); ✅

// 6. Strict typing
const user: User = data; ✅

// 7. Use Web Workers for heavy computation
const worker = new Worker('./compute.worker.ts'); ✅

// 8. Lazy load routes
const AdminPage = lazy(() => import('./AdminPage')); ✅
```

---

## Checklist for New Features

Before submitting a PR, ensure:

- [ ] No `console.log` in code (use `logger()`)
- [ ] All user-facing text uses `t()` function
- [ ] API calls through service → hook → component pattern
- [ ] Error boundaries around components
- [ ] Type-safe implementation (no `any`)
- [ ] Tests for critical paths
- [ ] Accessibility labels on interactive elements
- [ ] Lazy loading for heavy components/routes
- [ ] Performance optimization (virtualization if needed)
- [ ] Documentation updated

---

## Quick Commands

```bash
# Development
npm run dev                  # Start dev server

# Building
npm run build               # Production build
npm run preview             # Preview production build

# Testing
npm run test                # Run unit tests
npm run test:e2e            # Run E2E tests
npm run test:coverage       # Check coverage

# Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix linting issues
npm run type-check          # TypeScript check
npm run format              # Format code

# Analysis
npm run analyze-bundle      # Analyze bundle size
npm run test:performance    # Run Lighthouse audit
```

---

## Resources

- [Architecture Analysis](./ARCHITECTURE_ANALYSIS_2025.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN_2025.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Validation Patterns](./VALIDATION_PATTERNS.md)

---

**Version:** 1.0  
**Last Updated:** November 12, 2025
