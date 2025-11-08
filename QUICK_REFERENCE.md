# Quick Reference: Code Standards & Patterns

**Last Updated:** November 8, 2025  
**For:** User Management Frontend (React 19 + AWS)

---

## 🚨 Critical Rules

### ❌ NEVER DO

```typescript
// ❌ NEVER use console.*
console.log('debug info');
console.error('error');

// ❌ NEVER create local validation
function validateEmail(email: string) { ... }

// ❌ NEVER duplicate ErrorBoundary
import { ErrorBoundary } from '@/core/error';

// ❌ NEVER use useContext in new code
const context = useContext(MyContext);

// ❌ NEVER use manual state for forms
const [isSubmitting, setIsSubmitting] = useState(false);

// ❌ NEVER skip error handling
try {
  await apiCall();
} catch (error) {
  // No handling!
}
```

### ✅ ALWAYS DO

```typescript
// ✅ ALWAYS use logger()
import { logger } from '@/core/logging';
logger().debug('Debug info', { context });
logger().error('Error occurred', error);

// ✅ ALWAYS use ValidationBuilder
import { ValidationBuilder } from '@/core/validation';
const result = new ValidationBuilder().required().email().validate(value);

// ✅ ALWAYS use ModernErrorBoundary
import { PageErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

// ✅ ALWAYS use use() hook
import { use } from 'react';
const context = use(MyContext);

// ✅ ALWAYS use useActionState for forms
const [state, formAction, isPending] = useActionState(handleSubmit, initialState);

// ✅ ALWAYS handle errors consistently
import { useApiError } from '@/shared/hooks/useApiError';
const { handleApiError } = useApiError();

try {
  await apiCall();
} catch (error) {
  handleApiError(error, { setFieldErrors });
}
```

---

## 📦 Service Pattern (REQUIRED)

```typescript
/**
 * Domain Service Template
 * Copy this pattern for ALL new services
 */

import { apiClient } from '@/services/api/apiClient';
import { API_PREFIXES, unwrapResponse } from '@/services/api/common';
import type { ResourceData, CreateResourceRequest } from '../types';

const API_PREFIX = API_PREFIXES.DOMAIN;

/**
 * GET /api/v1/domain/resource/:id
 * Description of endpoint purpose
 */
export const getResource = async (id: string): Promise<ResourceData> => {
  const response = await apiClient.get<{ data: ResourceData }>(
    `${API_PREFIX}/resource/${id}`
  );
  return unwrapResponse<ResourceData>(response.data);
};

/**
 * POST /api/v1/domain/resource
 * Description of endpoint purpose
 */
export const createResource = async (
  data: CreateResourceRequest
): Promise<ResourceData> => {
  const response = await apiClient.post<{ data: ResourceData }>(
    `${API_PREFIX}/resource`,
    data
  );
  return unwrapResponse<ResourceData>(response.data);
};

// Export as default object
const domainService = {
  getResource,
  createResource,
};

export default domainService;
```

---

## 🎯 Form Pattern (React 19)

```typescript
/**
 * React 19 Form Pattern - useActionState
 * Use this for ALL form submissions
 */

import { useActionState } from 'react';
import { useApiError } from '@/shared/hooks/useApiError';
import type { ApiError } from '@/core/error';

type FormState = {
  success: boolean;
  errors: Record<string, string[]>;
  message?: string;
};

async function handleSubmit(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Extract form data
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Validate (optional - server validates too)
    const validation = new ValidationBuilder()
      .validateField('email', data.email, (b) => b.required().email())
      .validateField('password', data.password, (b) => b.required().password())
      .result();

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Please fix validation errors',
      };
    }

    // Call service
    await authService.login(data);

    return {
      success: true,
      errors: {},
      message: 'Login successful!',
    };
  } catch (error) {
    // Extract field errors from API
    const apiError = error as ApiError;
    return {
      success: false,
      errors: (apiError as any).field_errors || {},
      message: apiError.message || 'An error occurred',
    };
  }
}

export function MyForm() {
  const [state, formAction, isPending] = useActionState(handleSubmit, {
    success: false,
    errors: {},
  });

  return (
    <form action={formAction}>
      <input name="email" type="email" />
      {state.errors.email && (
        <span className="error">{state.errors.email[0]}</span>
      )}

      <input name="password" type="password" />
      {state.errors.password && (
        <span className="error">{state.errors.password[0]}</span>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>

      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}
    </form>
  );
}
```

---

## 🛡️ Error Boundary Pattern

```typescript
/**
 * Error Boundary Usage
 */

// App level (src/App.tsx)
import { AppErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

<AppErrorBoundary>
  <Router>
    {/* App content */}
  </Router>
</AppErrorBoundary>

// Page level (route components)
import { PageErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

<PageErrorBoundary resetKeys={[userId]}>
  <UserProfilePage />
</PageErrorBoundary>

// Component level (complex components)
import { ComponentErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

<ComponentErrorBoundary>
  <DataTable data={data} />
</ComponentErrorBoundary>
```

---

## 🎨 Component Pattern (React 19)

```typescript
/**
 * React 19 Component Pattern
 * No useMemo/useCallback unless necessary!
 */

import { use, Suspense } from 'react';
import { AuthContext } from '@/core/auth/AuthContext';
import { logger } from '@/core/logging';

interface Props {
  userId: string;
}

export function UserProfile({ userId }: Props) {
  // ✅ React 19: use() instead of useContext
  const { user } = use(AuthContext);

  // ✅ React 19: No useCallback needed
  const handleSave = async (data: ProfileData) => {
    try {
      await profileService.update(userId, data);
      logger().info('Profile updated', { userId });
    } catch (error) {
      logger().error('Profile update failed', error);
    }
  };

  // ✅ React 19: No useMemo needed (unless heavy computation)
  const displayName = `${user.firstName} ${user.lastName}`;

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <div>
        <h1>{displayName}</h1>
        <ProfileForm onSave={handleSave} />
      </div>
    </Suspense>
  );
}
```

---

## 🔄 Loading States Decision Matrix

| Scenario | Use | Example |
|----------|-----|---------|
| Form submission | `useActionState` (isPending) | Login, Register |
| Data fetching | `useStandardLoading` | List users, Get profile |
| Optimistic updates | `useOptimistic` | Toggle status, Like button |
| React Query | `isLoading` from query | Cached data fetching |

---

## 📝 Validation Pattern

```typescript
/**
 * Form Validation - Single Source of Truth
 */

import { ValidationBuilder } from '@/core/validation';

// Single field
const emailResult = new ValidationBuilder()
  .required()
  .email()
  .validate(email, 'email');

if (!emailResult.isValid) {
  console.log(emailResult.errors); // ['Email is required']
}

// Multiple fields (form)
const formResult = new ValidationBuilder()
  .validateField('email', email, (b) => b.required().email())
  .validateField('password', password, (b) => b.required().password())
  .validateField('firstName', firstName, (b) => b.required().name())
  .result();

if (!formResult.isValid) {
  setErrors(formResult.errors);
}

// Quick validation
import { quickValidate, isValidEmail } from '@/core/validation';

if (!isValidEmail(email)) {
  // Invalid
}

const result = quickValidate.email(email);
```

---

## 🪝 Custom Hooks Pattern

```typescript
/**
 * Custom Hook Template
 * React 19: No unnecessary memoization
 */

import { use, useState } from 'react';
import { logger } from '@/core/logging';

export function useFeature(param: string) {
  const [state, setState] = useState(initialState);

  // ✅ No useCallback - React Compiler handles it
  const handleAction = async () => {
    try {
      const result = await service.action(param);
      setState(result);
      logger().debug('Action completed', { param, result });
    } catch (error) {
      logger().error('Action failed', error);
      throw error;
    }
  };

  // ✅ No useMemo for simple computations
  const derivedValue = state.value * 2;

  return {
    state,
    derivedValue,
    handleAction,
  };
}
```

---

## 🌐 API Error Handling Pattern

```typescript
/**
 * Consistent API Error Handling
 */

import { useApiError } from '@/shared/hooks/useApiError';
import { useNavigate } from 'react-router-dom';

export function MyComponent() {
  const { handleApiError } = useApiError();
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchData = async () => {
    try {
      const data = await myService.getData();
      // Handle success
    } catch (error) {
      const result = handleApiError(error, { setFieldErrors });

      // Handle specific actions
      if (result.redirectToLogin) {
        navigate('/login');
      }

      if (result.action === 'retry') {
        setTimeout(fetchData, result.retryDelay);
      }
    }
  };

  return (
    <div>
      {/* Display field errors */}
      {fieldErrors.email && <span>{fieldErrors.email[0]}</span>}
    </div>
  );
}
```

---

## 📊 Context Pattern (React 19)

```typescript
/**
 * React 19 Context Pattern
 */

import { createContext, use, type ReactNode } from 'react';

interface MyContextType {
  value: string;
  setValue: (value: string) => void;
}

export const MyContext = createContext<MyContextType | undefined>(undefined);

// Provider
export function MyProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('');

  const contextValue: MyContextType = {
    value,
    setValue,
  };

  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  );
}

// Consumer Hook (React 19 pattern)
export function useMyContext() {
  const context = use(MyContext); // ✅ use() instead of useContext
  
  if (context === undefined) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  
  return context;
}
```

---

## 🧪 Testing Patterns

```typescript
/**
 * Component Testing
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should submit form', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('Success')).toBeInTheDocument();
  });
});
```

---

## 📁 File Organization

```
src/
├── domains/                    # Domain-driven features
│   ├── auth/
│   │   ├── components/        # Auth-specific components
│   │   ├── pages/            # Auth pages
│   │   ├── services/         # Auth API services
│   │   ├── types/            # Auth type definitions
│   │   └── hooks/            # Auth-specific hooks
│   └── users/
│       ├── components/
│       ├── pages/
│       ├── services/         # MUST follow service pattern!
│       └── types/
├── shared/                    # Shared across domains
│   ├── components/           # Reusable components
│   ├── hooks/                # Reusable hooks
│   └── utils/                # Utility functions
├── core/                     # Core functionality
│   ├── error/                # Error handling
│   ├── validation/           # Validation system
│   ├── logging/              # Logging system
│   └── auth/                 # Auth context
└── services/                 # Global services
    └── api/                  # API client
```

---

## 🔍 Code Review Checklist

Before submitting PR, verify:

- [ ] No `console.*` calls (use `logger()`)
- [ ] All forms use `useActionState`
- [ ] All contexts use `use()` hook
- [ ] Error handling with `useApiError`
- [ ] Validation uses `ValidationBuilder`
- [ ] No unnecessary `useMemo`/`useCallback`
- [ ] Services follow standard pattern
- [ ] Error boundaries in place
- [ ] Suspense for lazy components
- [ ] Types are properly defined
- [ ] Tests are written
- [ ] No hardcoded strings (i18n)

---

## 📚 Key Documentation

- **Full Audit:** `CODEBASE_AUDIT_REPORT.md`
- **Implementation Plan:** `IMPLEMENTATION_PLAN.md`
- **Architecture:** `COMPLETE_ARCHITECTURE_GUIDE.md`
- **Validation:** `VALIDATION_ARCHITECTURE.md`
- **Copilot Instructions:** `.github/copilot-instructions.md`

---

## 🆘 Quick Help

### "How do I...?"

**...handle API errors?**
→ Use `useApiError` hook

**...validate a form?**
→ Use `ValidationBuilder` from `@/core/validation`

**...log something?**
→ Use `logger()` from `@/core/logging`

**...create a new service?**
→ Copy service pattern from this doc

**...add error boundary?**
→ Use `ModernErrorBoundary` components

**...create a form?**
→ Use `useActionState` pattern

**...consume context?**
→ Use `use()` hook from React 19

---

## 🎯 Priority Fixes

If you only have time to fix one thing:

1. **P0:** Replace `console.*` with `logger()` ← Do this first!
2. **P0:** Use single ErrorBoundary implementation
3. **P0:** Implement `useApiError` hook
4. **P1:** Migrate forms to `useActionState`
5. **P1:** Migrate contexts to `use()` hook
