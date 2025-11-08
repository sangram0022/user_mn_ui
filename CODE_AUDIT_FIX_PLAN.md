# 🔧 Code Audit Implementation Plan

**Project:** User Management Application (Frontend)  
**Date:** November 9, 2025  
**Based on:** CODE_AUDIT_REPORT.md  
**Timeline:** 4 weeks (20 working days)  
**Deployment Target:** AWS S3 + CloudFront  

---

## 📋 Overview

This plan provides a systematic approach to fixing the issues identified in the code audit. Fixes are organized by priority and grouped by related functionality to minimize disruption and ensure consistency.

### Implementation Principles

1. **One Pattern Per Change** - Fix one inconsistency type at a time
2. **Test After Each Phase** - Ensure no regressions
3. **Document Decisions** - Update copilot-instructions.md
4. **Incremental Commits** - Small, focused commits with clear messages
5. **Backward Compatibility** - Don't break existing functionality

---

## 🎯 Phase 1: Error Handling Standardization

**Duration:** 5 days  
**Priority:** 🔴 Critical  
**Impact:** High - Affects all error handling  

### 1.1 Create Standard Error Handler Hook

**File:** `src/shared/hooks/useStandardErrorHandler.ts`

```typescript
/**
 * Standard Error Handler Hook
 * Single source of truth for component-level error handling
 * 
 * Usage:
 *   const handleError = useStandardErrorHandler();
 *   
 *   try {
 *     await operation();
 *   } catch (error) {
 *     handleError(error, { fieldErrorSetter: setFieldErrors });
 *   }
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { handleError as coreHandleError } from '@/core/error/errorHandler';
import { logger } from '@/core/logging';

export interface ErrorHandlerOptions {
  /** Whether to show toast notification (default: true) */
  showToast?: boolean;
  
  /** Function to set field-level errors */
  fieldErrorSetter?: (errors: Record<string, string>) => void;
  
  /** Custom error message to show instead of default */
  customMessage?: string;
  
  /** Callback after error is handled */
  onError?: (error: unknown) => void;
  
  /** Context for logging */
  context?: Record<string, unknown>;
}

export function useStandardErrorHandler() {
  const toast = useToast();
  const navigate = useNavigate();
  
  return useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const {
      showToast = true,
      fieldErrorSetter,
      customMessage,
      onError,
      context,
    } = options;
    
    // Use core error handler
    const result = coreHandleError(error);
    
    // Log error with context
    logger().error('Component error handled', error instanceof Error ? error : undefined, {
      userMessage: result.userMessage,
      action: result.action,
      ...context,
      context: 'useStandardErrorHandler',
    });
    
    // Show toast if enabled
    if (showToast) {
      const message = customMessage || result.userMessage;
      toast.error(message);
    }
    
    // Set field errors if present
    if (result.context?.fieldErrors && fieldErrorSetter) {
      fieldErrorSetter(result.context.fieldErrors as Record<string, string>);
    }
    
    // Handle special actions
    if (result.redirectToLogin) {
      navigate('/login', { replace: true });
    }
    
    // Call custom error handler
    onError?.(error);
    
    return result;
  }, [toast, navigate]);
}

// Convenience hook for form error handling
export function useFormErrorHandler() {
  const handleError = useStandardErrorHandler();
  
  return useCallback((
    error: unknown,
    setFieldErrors: (errors: Record<string, string>) => void
  ) => {
    return handleError(error, {
      fieldErrorSetter: setFieldErrors,
      context: { formError: true },
    });
  }, [handleError]);
}

// Convenience hook for silent error handling (no toast)
export function useSilentErrorHandler() {
  const handleError = useStandardErrorHandler();
  
  return useCallback((error: unknown, onError?: (error: unknown) => void) => {
    return handleError(error, {
      showToast: false,
      onError,
    });
  }, [handleError]);
}
```

**Test File:** `src/shared/hooks/__tests__/useStandardErrorHandler.test.ts`

### 1.2 Update Components to Use Standard Pattern

**Files to Update (30-40 files):**

1. **Auth Domain**
   - `src/domains/auth/pages/ModernLoginPage.tsx`
   - `src/domains/auth/pages/RegisterPage.tsx`
   - `src/domains/auth/pages/ForgotPasswordPage.tsx`
   - `src/domains/auth/pages/ResetPasswordPage.tsx`
   - `src/domains/auth/pages/ChangePasswordPage.tsx`

2. **Profile Domain**
   - `src/domains/profile/pages/ProfilePage.tsx`
   - `src/domains/profile/pages/SettingsPage.tsx`
   - `src/domains/profile/components/ProfileForm.tsx`
   - `src/domains/profile/components/AvatarUpload.tsx`

3. **Admin Domain**
   - `src/domains/admin/pages/UsersManagementPage.tsx`
   - `src/domains/admin/pages/RolesManagementPage.tsx`

4. **Pages**
   - `src/pages/ContactPage.tsx`
   - `src/pages/DashboardPage.tsx`
   - `src/pages/ProfilePage.tsx`
   - `src/pages/ModernContactForm.tsx`

**Pattern to Apply:**

```typescript
// ❌ BEFORE: Inconsistent error handling
try {
  await operation();
  toast.success('Success!');
} catch (err) {
  const errMessage = err instanceof Error ? err.message : 'Operation failed';
  setError(errMessage);
}

// ✅ AFTER: Standard error handling
import { useFormErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

const handleError = useFormErrorHandler();

try {
  await operation();
  toast.success('Success!');
} catch (error) {
  handleError(error, setFieldErrors);
}
```

**Commit Message Template:**
```
refactor(error-handling): standardize error handling in [ComponentName]

- Replace custom error handling with useStandardErrorHandler
- Use useFormErrorHandler for form submissions
- Extract field errors automatically
- Consistent toast notifications

Ref: CODE_AUDIT_FIX_PLAN.md Phase 1.2
```

### 1.3 Add Missing Error Boundaries

**Files to Update:**

1. **Wrap Page Components**

```typescript
// src/pages/DashboardPage.tsx
import { PageErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

export default function DashboardPage() {
  return (
    <PageErrorBoundary>
      <DashboardContent />
    </PageErrorBoundary>
  );
}

// Extract content to separate component
function DashboardContent() {
  // ... existing code
}
```

**Pages to Wrap:**
- `src/pages/DashboardPage.tsx`
- `src/pages/ProfilePage.tsx`
- `src/domains/profile/pages/ProfilePage.tsx`
- `src/domains/profile/pages/SettingsPage.tsx`
- `src/domains/admin/pages/UsersManagementPage.tsx`
- `src/domains/admin/pages/RolesManagementPage.tsx`
- All other page components

2. **Add Component-Level Boundaries for Widgets**

```typescript
// For dashboard widgets
<ComponentErrorBoundary>
  <MetricsWidget />
</ComponentErrorBoundary>

<ComponentErrorBoundary>
  <ChartWidget />
</ComponentErrorBoundary>
```

### 1.4 Replace console.log with logger()

**File:** `src/core/api/diagnosticTool.ts`

**Strategy:** Create diagnostic logger wrapper

```typescript
// src/core/logging/diagnostic.ts
import { logger } from './logger';

/**
 * Diagnostic Logger
 * Only for development diagnostic tools
 * Outputs to console AND structured logs
 */
export const diagnostic = {
  log: (message: string, data?: Record<string, unknown>) => {
    if (import.meta.env.MODE === 'development') {
      console.log(`[DIAGNOSTIC] ${message}`, data || '');
      logger().debug(`[DIAGNOSTIC] ${message}`, data);
    }
  },
  
  error: (message: string, error?: Error, data?: Record<string, unknown>) => {
    if (import.meta.env.MODE === 'development') {
      console.error(`[DIAGNOSTIC ERROR] ${message}`, error, data || '');
      logger().error(`[DIAGNOSTIC] ${message}`, error, data);
    }
  },
  
  warn: (message: string, data?: Record<string, unknown>) => {
    if (import.meta.env.MODE === 'development') {
      console.warn(`[DIAGNOSTIC WARNING] ${message}`, data || '');
      logger().warn(`[DIAGNOSTIC] ${message}`, data);
    }
  },
};
```

**Then update diagnosticTool.ts:**

```typescript
// Replace all console.log with diagnostic.log
import { diagnostic } from '@/core/logging/diagnostic';

diagnostic.log('✅ Access Token Found');
diagnostic.error('❌ No access token found');
diagnostic.warn('⚠️ WARNING: Token lacks permission');
```

### 1.5 Phase 1 Testing Checklist

- [ ] All error handling uses useStandardErrorHandler
- [ ] Field errors extracted and displayed correctly
- [ ] Toast notifications show appropriate messages
- [ ] 401 errors redirect to login
- [ ] All pages have PageErrorBoundary
- [ ] Dashboard widgets have ComponentErrorBoundary
- [ ] No console.log in production code (except diagnostic)
- [ ] All unit tests pass
- [ ] Manual testing of error scenarios

---

## 🎯 Phase 2: API Call Standardization

**Duration:** 5 days  
**Priority:** 🟡 High  
**Impact:** High - Affects all data fetching  

### 2.1 Create Missing TanStack Query Hooks

**Strategy:** Create a hook for every service method

#### Auth Domain Hooks

**File:** `src/domains/auth/hooks/useAuth.hooks.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authService from '../services/authService';
import { useToast } from '@/hooks/useToast';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

export function useLogin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const handleError = useStandardErrorHandler();
  
  return useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      toast.success('Login successful');
    },
    onError: (error) => {
      handleError(error, { context: { action: 'login' } });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      toast.success('Logged out successfully');
    },
  });
}

export function useRegister() {
  const toast = useToast();
  const handleError = useStandardErrorHandler();
  
  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Registration successful! Please check your email.');
    },
    onError: (error) => {
      handleError(error, { context: { action: 'register' } });
    },
  });
}

// Add: useForgotPassword, useResetPassword, useVerifyEmail, etc.
```

#### User Domain Hooks

**Create:** `src/domains/users/hooks/index.ts` (if not exists)

```typescript
export { useUsers } from './useUsers';
export { useUser } from './useUser';
export { useCreateUser } from './useCreateUser';
export { useUpdateUser } from './useUpdateUser';
export { useDeleteUser } from './useDeleteUser';
export { useApproveUser } from './useApproveUser';
export { useRejectUser } from './useRejectUser';
```

**Pattern for each hook:**

```typescript
// src/domains/users/hooks/useCreateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '../services/userService';
import { useToast } from '@/hooks/useToast';

export function useCreateUser() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
  });
}
```

#### Profile Domain Hooks

**File:** `src/domains/profile/hooks/useProfile.hooks.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileService from '../services/profileService';

export function useProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profileService.getProfile,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
```

### 2.2 Remove Direct apiClient Usage

**Files to Update (50-60 files):**

```typescript
// ❌ BEFORE: Direct apiClient usage
import { apiClient } from '@/services/api/apiClient';

function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    apiClient.get('/api/v1/users')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);
}

// ✅ AFTER: Use TanStack Query hook
import { useUsers } from '@/domains/users/hooks';

function MyComponent() {
  const { data, isLoading } = useUsers();
}
```

### 2.3 Remove Manual Loading States

**Pattern:**

```typescript
// ❌ REMOVE: Manual loading state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await apiClient.get('/data');
    setData(result.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

// ✅ REPLACE WITH: TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: () => apiClient.get('/data').then(res => res.data),
});
```

### 2.4 Add Route-Level Suspense Boundaries

**File:** `src/core/routing/RouteRenderer.tsx`

```typescript
import { Suspense } from 'react';
import { PageSkeleton } from '@/shared/components/loading/Skeletons';

export function RouteRenderer({ route }: { route: RouteConfig }) {
  const element = (
    <Suspense fallback={<PageSkeleton />}>
      {route.element}
    </Suspense>
  );
  
  return route.requiresAuth ? (
    <ProtectedRoute>{element}</ProtectedRoute>
  ) : (
    element
  );
}
```

### 2.5 Phase 2 Testing Checklist

- [ ] All service methods have corresponding hooks
- [ ] No direct apiClient usage in components
- [ ] No manual loading state management
- [ ] All routes have Suspense boundaries
- [ ] Query keys are consistent
- [ ] Cache invalidation works correctly
- [ ] Optimistic updates work
- [ ] All unit tests pass
- [ ] Manual testing of all CRUD operations

---

## 🎯 Phase 3: React 19 Cleanup

**Duration:** 4 days  
**Priority:** 🟡 High  
**Impact:** Medium - Code quality improvement  

### 3.1 Remove Unnecessary useCallback/useMemo

**Rules:**

```typescript
/**
 * KEEP useCallback/useMemo ONLY for:
 * 
 * 1. Context values (object identity)
 *    ✅ const value = useMemo(() => ({ state, actions }), [deps]);
 * 
 * 2. Expensive calculations (>10ms, with benchmark proof)
 *    ✅ const result = useMemo(() => expensiveSort(data), [data]);
 *    // Add comment: "Kept: calculation takes 15ms avg"
 * 
 * 3. Dependencies of useEffect (with explanation)
 *    ✅ const callback = useCallback(() => {...}, []);
 *    useEffect(() => { callback(); }, [callback]);
 *    // Add comment: "Kept: useEffect dependency"
 * 
 * REMOVE useCallback/useMemo for:
 * 
 * 1. Simple computations
 *    ❌ const filtered = useMemo(() => arr.filter(x => x.active), [arr]);
 *    ✅ const filtered = arr.filter(x => x.active);
 * 
 * 2. Event handlers
 *    ❌ const handleClick = useCallback(() => {...}, []);
 *    ✅ const handleClick = () => {...};
 * 
 * 3. Inline functions
 *    ❌ const fn = useCallback(() => {...}, []);
 *    ✅ const fn = () => {...};
 */
```

**Files to Update:**

1. **AuthContext.tsx** (Priority 1)

```typescript
// ❌ REMOVE all useCallback
const login = useCallback((tokens, user, rememberMe) => {
  // ...
}, []);

// ✅ REPLACE WITH simple functions
const login = (tokens: AuthTokens, user: User, rememberMe: boolean = false) => {
  // ...
};

// ✅ KEEP context value memoization (object identity)
const value = useMemo(() => ({
  user,
  tokens,
  isAuthenticated,
  isLoading,
  login,
  logout,
  // ... other values
}), [user, tokens, isAuthenticated, isLoading]);
// Kept: Context value identity for Provider
```

2. **UsersManagementPage.tsx**

```typescript
// ❌ REMOVE
const filteredUsers = useMemo(() => 
  users.filter(u => u.name.includes(searchTerm)),
  [users, searchTerm]
);

// ✅ REPLACE WITH (React Compiler optimizes)
const filteredUsers = users.filter(u => u.name.includes(searchTerm));
```

3. **RolesManagementPage.tsx**
4. **OptimizedRoleBasedButton.tsx** - KEEP (expensive permission check)
5. **PasswordStrength.tsx** - KEEP (expensive calculation)

### 3.2 Convert Forms to useActionState

**Target Forms:**
- ProfilePage edit form
- ContactPage form
- Any remaining forms not using useActionState

**Pattern:**

```typescript
// ❌ BEFORE: Manual form handling
const [isPending, setIsPending] = useState(false);

const handleSubmit = async (data: FormData) => {
  setIsPending(true);
  try {
    await submitForm(data);
    toast.success('Success!');
  } catch (error) {
    handleError(error);
  } finally {
    setIsPending(false);
  }
};

// ✅ AFTER: useActionState
const [state, formAction, isPending] = useActionState(
  async (prevState, formData: FormData) => {
    try {
      await submitForm(formData);
      return { success: true, errors: {} };
    } catch (error) {
      const result = handleError(error);
      return { success: false, errors: result.context?.fieldErrors || {} };
    }
  },
  { success: false, errors: {} }
);

<form action={formAction}>
  {/* form fields */}
  <button disabled={isPending}>
    {isPending ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

### 3.3 Add Type-Only Imports

**Pattern:**

```typescript
// ❌ BEFORE
import { User, Role, Permission } from '@/types';

// ✅ AFTER
import type { User, Role, Permission } from '@/types';
```

**Use ESLint rule:**

```json
{
  "@typescript-eslint/consistent-type-imports": ["error", {
    "prefer": "type-imports",
    "fixStyle": "separate-type-imports"
  }]
}
```

### 3.4 Convert .then()/.catch() to async/await

**Files with .then()/.catch():**
- `src/shared/hooks/useApiModern.ts`
- `src/shared/utils/routeUtils.tsx`
- `src/services/api/apiClient.ts`

**Pattern:**

```typescript
// ❌ BEFORE
apiClient.get('/users')
  .then(res => res.data)
  .catch(err => handleError(err));

// ✅ AFTER
try {
  const response = await apiClient.get('/users');
  return response.data;
} catch (error) {
  handleError(error);
}
```

### 3.5 Phase 3 Testing Checklist

- [ ] useCallback removed from AuthContext
- [ ] useMemo removed from simple computations
- [ ] Remaining useMemo/useCallback have comments explaining why
- [ ] All forms use useActionState
- [ ] All type imports use `import type`
- [ ] All .then()/.catch() converted to async/await
- [ ] React Compiler warnings resolved
- [ ] Performance benchmarks unchanged
- [ ] All unit tests pass

---

## 🎯 Phase 4: Testing & Documentation

**Duration:** 4 days  
**Priority:** 🟢 Medium  
**Impact:** High - Ensures quality  

### 4.1 Update Unit Tests

**Test Coverage Targets:**

1. **useStandardErrorHandler**
   - Test error toast display
   - Test field error extraction
   - Test redirect on 401
   - Test custom error messages

2. **API Hooks**
   - Test query hooks data fetching
   - Test mutation hooks
   - Test cache invalidation
   - Test error handling

3. **Error Boundaries**
   - Test error capture
   - Test retry logic
   - Test error categorization

### 4.2 Update Integration Tests

**E2E Test Updates:**

1. **Auth Flow**
   - Login error handling
   - Registration error handling
   - Token refresh

2. **CRUD Operations**
   - Create user flow
   - Update user flow
   - Delete user flow
   - Error scenarios

### 4.3 Manual Testing Checklist

- [ ] Login/Logout flow
- [ ] Registration flow
- [ ] Password reset flow
- [ ] Profile update
- [ ] User management (CRUD)
- [ ] Role management (CRUD)
- [ ] Error scenarios
  - [ ] Network offline
  - [ ] Invalid credentials
  - [ ] Validation errors
  - [ ] Server errors (500)
  - [ ] Unauthorized (401)
  - [ ] Forbidden (403)
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toast notifications

### 4.4 Update Documentation

**Files to Update:**

1. **copilot-instructions.md**
   - Add useStandardErrorHandler pattern
   - Add TanStack Query hook pattern
   - Remove useCallback/useMemo unless justified
   - Add useActionState for forms

2. **Create New Docs**
   - `docs/ERROR_HANDLING.md` - Error handling guide
   - `docs/API_PATTERNS.md` - API call patterns
   - `docs/REACT_19_PATTERNS.md` - React 19 best practices

### 4.5 Performance Testing

**Metrics to Verify:**

- Bundle size unchanged or reduced
- Time to Interactive (TTI) unchanged
- First Contentful Paint (FCP) unchanged
- Largest Contentful Paint (LCP) unchanged
- No React warnings in console
- No memory leaks

---

## 📊 Progress Tracking

### Daily Checklist Template

**Day X - Phase Y.Z: [Task Name]**

- [ ] Morning: Review plan and set daily goals
- [ ] Complete planned changes
- [ ] Write/update tests
- [ ] Run test suite
- [ ] Manual testing
- [ ] Commit changes
- [ ] Update progress tracker
- [ ] Evening: Review and plan next day

### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

Ref: CODE_AUDIT_FIX_PLAN.md Phase X.Y
```

**Types:**
- `refactor`: Code refactoring
- `feat`: New feature
- `fix`: Bug fix
- `test`: Test updates
- `docs`: Documentation
- `chore`: Maintenance

**Examples:**

```
refactor(error-handling): add useStandardErrorHandler hook

- Create centralized error handler hook
- Includes field error extraction
- Automatic redirect on 401
- Toast notification support

Ref: CODE_AUDIT_FIX_PLAN.md Phase 1.1
```

```
refactor(api): migrate ProfilePage to TanStack Query hooks

- Replace direct apiClient calls with useProfile hook
- Remove manual loading state
- Use useMutation for updates
- Automatic cache invalidation

Ref: CODE_AUDIT_FIX_PLAN.md Phase 2.2
```

---

## ⚠️ Risk Management

### Potential Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking existing functionality | Medium | High | Comprehensive testing, incremental commits |
| Performance regression | Low | Medium | Performance benchmarks before/after |
| Type errors after changes | Medium | Low | TypeScript strict mode, proper types |
| Test failures | High | Medium | Update tests alongside code |
| Merge conflicts | Medium | Low | Frequent commits, small PRs |

### Rollback Plan

If issues arise:

1. **Identify problematic commit** using git log
2. **Revert commit:** `git revert <commit-hash>`
3. **Analyze issue** in separate branch
4. **Fix and reapply** with corrections

---

## ✅ Definition of Done

### Phase Completion Criteria

A phase is complete when:

1. ✅ All planned code changes committed
2. ✅ All unit tests pass
3. ✅ All integration tests pass
4. ✅ Manual testing completed
5. ✅ Code review completed (if applicable)
6. ✅ Documentation updated
7. ✅ No regressions detected
8. ✅ Performance metrics acceptable

### Project Completion Criteria

The project is complete when:

1. ✅ All 4 phases completed
2. ✅ All tests passing
3. ✅ Code audit score improved to targets:
   - Error Handling: 9.5/10 ✅
   - API Patterns: 9.5/10 ✅
   - React 19 Adoption: 9/10 ✅
   - Code Consistency: 9/10 ✅
4. ✅ Documentation complete
5. ✅ Deployed to staging and tested
6. ✅ Stakeholder approval

---

## 📚 Resources

### Internal
- [Code Audit Report](CODE_AUDIT_REPORT.md)
- [Copilot Instructions](.github/copilot-instructions.md)
- [Implementation Status](docs/IMPLEMENTATION_STATUS.md)

### External
- [React 19 Docs](https://react.dev)
- [TanStack Query Guide](https://tanstack.com/query/latest)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

---

## 📞 Support & Questions

For questions or issues during implementation:

1. Check CODE_AUDIT_REPORT.md for context
2. Review copilot-instructions.md for patterns
3. Ask GitHub Copilot for code examples
4. Consult team lead if blockers arise

---

**Plan Created By:** GitHub Copilot  
**Date:** November 9, 2025  
**Version:** 1.0  
**Next Review:** After Phase 1 completion
