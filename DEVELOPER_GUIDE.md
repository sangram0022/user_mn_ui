# Framework Improvements - Developer Guide

## Overview

This guide documents all framework improvements implemented as part of the deep code analysis and enhancement project. Follow these patterns for consistent, maintainable, and production-ready code.

## Table of Contents

1. [Logging Framework](#logging-framework)
2. [Error Handling](#error-handling)
3. [Validation Patterns](#validation-patterns)
4. [Data Fetching](#data-fetching)
5. [Localization](#localization)
6. [Quick Reference](#quick-reference)

---

## Logging Framework

### Core Logger

The application uses a centralized RFC 5424 compliant logger with zero dependencies.

**Location**: `src/core/logging/logger.ts`

**Features**:
- Structured logging
- Multiple log levels (DEBUG, INFO, WARN, ERROR, CRITICAL)
- Automatic context tracking
- Environment-aware (dev/prod modes)
- Integration with error reporting service

### Log Levels

```typescript
import { logger } from '@/core/logging';

// DEBUG: Development diagnostics
logger().debug('Component rendered', { component: 'UserList', props });

// INFO: General information
logger().info('User logged in', { userId: '123' });

// WARN: Warnings that don't stop execution
logger().warn('API rate limit approaching', { remaining: 10 });

// ERROR: Recoverable errors
logger().error('API request failed', error, { endpoint: '/api/users' });

// CRITICAL: System failures requiring immediate attention
logger().critical('Database connection lost', error, { database: 'primary' });
```

### Logging Utilities

**Location**: `src/core/logging/utilities.ts`

Convenience functions for common logging patterns:

#### API Calls
```typescript
import { logApiCall, logApiError } from '@/core/logging';

// Log successful API call
logApiCall('GET', '/api/users', 245, { userId: '123' });

// Log API error
logApiError('POST', '/api/users', 500, error, { userId: '123' });
```

#### User Actions
```typescript
import { logUserAction } from '@/core/logging';

logUserAction('button-click', { buttonId: 'submit', page: '/register' });
logUserAction('file-upload', { filename: 'avatar.png', size: 1024 });
```

#### Authentication Events
```typescript
import { logAuthEvent } from '@/core/logging';

logAuthEvent('login-success', { userId: '123', method: 'email' });
logAuthEvent('login-failure', { email: 'user@example.com', reason: 'invalid-password' });
logAuthEvent('logout', { userId: '123' });
logAuthEvent('token-refresh', { userId: '123' });
logAuthEvent('session-expired', { userId: '123' });
```

#### Validation Errors
```typescript
import { logValidationError } from '@/core/logging';

logValidationError('email', 'Invalid format', { value: 'invalid@' });
logValidationError('password', 'Too short', { length: 5, required: 8 });
```

#### Security Events
```typescript
import { logSecurityEvent } from '@/core/logging';

logSecurityEvent('permission-denied', { userId: '123', resource: '/admin' });
logSecurityEvent('rate-limit-exceeded', { userId: '123', endpoint: '/api/users' });
logSecurityEvent('suspicious-activity', { userId: '123', action: 'bulk-delete' });
logSecurityEvent('csrf-token-invalid', { userId: '123' });
```

#### Data Fetching
```typescript
import { logDataFetch } from '@/core/logging';

logDataFetch('users', 'list', { filters: { status: 'active' } });
logDataFetch('users', 'detail', { userId: '123' });
logDataFetch('users', 'create', { email: 'user@example.com' });
```

#### Cache Operations
```typescript
import { logCacheOperation } from '@/core/logging';

logCacheOperation('hit', 'users-list', { size: 1024 });
logCacheOperation('miss', 'users-detail-123');
logCacheOperation('invalidate', 'users-*', { reason: 'user-updated' });
```

#### Navigation
```typescript
import { logNavigation } from '@/core/logging';

logNavigation('/users/123', '123');
logNavigation('/admin/settings');
```

#### Form Submissions
```typescript
import { logFormSubmission } from '@/core/logging';

logFormSubmission('login-form', true, { fields: ['email', 'password'] });
logFormSubmission('register-form', false, { errors: ['email', 'password'] });
```

#### Performance Metrics
```typescript
import { logPerformance } from '@/core/logging';

logPerformance('component-render', 45, { component: 'UserList' });
logPerformance('api-request', 150, { endpoint: '/api/users' });
```

#### Timers
```typescript
import { createTimer } from '@/core/logging';

const timer = createTimer('database-query');

// ... perform operation ...

timer.end({ query: 'SELECT * FROM users', rows: 100 });
```

### Diagnostic Logger

For development diagnostics (automatically disabled in production):

**Location**: `src/core/logging/diagnostic.ts`

```typescript
import { diagnostic } from '@/core/logging/diagnostic';

diagnostic.log('✅ Token found', { token: 'xxx' });
diagnostic.warn('⚠️ Token lacks permission', { required: 'admin:read' });
diagnostic.error('❌ API failed', error, { endpoint: '/api/users' });
```

---

## Error Handling

### Error Boundaries

All routes are wrapped with ErrorBoundary for isolated error handling.

**Location**: `src/shared/components/ErrorBoundary.tsx`

#### Usage in Components

```typescript
import ErrorBoundary from '@/shared/components/ErrorBoundary';

<ErrorBoundary boundaryName="UserList">
  <UserList />
</ErrorBoundary>

<ErrorBoundary
  boundaryName="Settings"
  fallback={<SettingsError />}
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error(error, errorInfo);
  }}
>
  <Settings />
</ErrorBoundary>
```

#### Higher-Order Component

```typescript
import { withErrorBoundary } from '@/shared/components/withErrorBoundary';

const SafeUserList = withErrorBoundary(UserList, {
  boundaryName: 'UserList',
  fallback: <UserListError />,
});
```

### Standard Error Handler

For consistent error handling across the app:

**Location**: `src/hooks/useStandardErrorHandler.ts`

```typescript
import { useStandardErrorHandler } from '@/hooks/useStandardErrorHandler';

const MyComponent = () => {
  const { handleError } = useStandardErrorHandler();

  const mutation = useMutation({
    mutationFn: createUser,
    onError: (error) => {
      const fieldErrors = handleError(error);
      // fieldErrors: { email: 'Email already exists', ... }
    },
  });
};
```

### Error Reporting

Errors are automatically reported to the configured service (Sentry or custom endpoint).

**Location**: `src/core/error/errorReporting/service.ts`

```typescript
import { reportErrorToService } from '@/core/error/errorReporting/service';

try {
  // ...
} catch (error) {
  reportErrorToService(error, {
    context: 'user-registration',
    userId: '123',
  });
}
```

---

## Validation Patterns

See [VALIDATION_PATTERNS.md](./VALIDATION_PATTERNS.md) for comprehensive guide.

### Quick Reference

#### Use Zod for Forms
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/core/validation/schemas';

const form = useForm({
  resolver: zodResolver(loginSchema),
});
```

#### Use ValidationBuilder for Real-time Validation
```typescript
import { ValidationBuilder } from '@/core/validation';

const emailValidator = new ValidationBuilder()
  .required('Email is required')
  .email('Invalid email format')
  .build();

const result = emailValidator(email);
if (!result.isValid) {
  setError(result.error);
}
```

---

## Data Fetching

### TanStack Query

All data fetching uses TanStack Query with centralized query keys.

**Query Keys Location**: `src/services/api/queryKeys.ts`

#### Basic Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryClient';
import { adminService } from '@/domains/admin/services';

const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.users.list({ status: 'active' }),
  queryFn: () => adminService.listUsers({ status: 'active' }),
});
```

#### Mutation with Cache Invalidation
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: adminService.createUser,
  onSuccess: () => {
    // Invalidate users list cache
    queryClient.invalidateQueries({
      queryKey: queryKeys.users.lists(),
    });
  },
});
```

#### Optimistic Updates (React 19)
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
    // Optimistically update UI
    setOptimisticUser({ ...currentUser, ...newData });
  },
});
```

### API Client

All API calls go through the centralized API client.

**Location**: `src/services/api/apiClient.ts`

#### Features
- Automatic token refresh
- Request deduplication
- Retry logic
- CSRF token handling
- Error transformation

#### API Helpers

**Location**: `src/core/api/apiHelpers.ts`

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/apiHelpers';

// GET request
const users = await apiGet<User[]>('/api/v1/users');

// POST request
const newUser = await apiPost<User>('/api/v1/users', { name: 'John' });

// PUT request
const updatedUser = await apiPut<User>(`/api/v1/users/${id}`, { name: 'Jane' });

// DELETE request
await apiDelete(`/api/v1/users/${id}`);
```

---

## Localization

### i18next

All user-facing text uses i18next for internationalization.

**Configuration**: `src/core/localization/i18n.ts`

#### Basic Usage
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('auth.login.subtitle')}</p>
      <button>{t('common.submit')}</button>
    </div>
  );
};
```

#### With Interpolation
```typescript
const { t } = useTranslation();

<p>{t('user.greeting', { name: 'John' })}</p>
// "Hello, John!"

<p>{t('user.count', { count: 5 })}</p>
// "You have 5 users" (handles pluralization)
```

#### Namespaces
```typescript
const { t } = useTranslation('admin');

<h1>{t('dashboard.title')}</h1>
// Loads from admin.json
```

#### Translation Files

**Location**: `public/locales/{lang}/{namespace}.json`

```
public/
  locales/
    en/
      common.json
      auth.json
      admin.json
      validation.json
    es/
      common.json
      ...
```

---

## Quick Reference

### Checklist for New Features

- [ ] Use centralized logger (no `console.log`)
- [ ] Wrap components with ErrorBoundary
- [ ] Use Zod for forms, ValidationBuilder for fields
- [ ] All API calls through TanStack Query
- [ ] Use centralized query keys
- [ ] All text through i18next
- [ ] Log user actions and errors
- [ ] Handle errors with useStandardErrorHandler
- [ ] Add loading and error states
- [ ] Write tests for critical paths

### Common Patterns

#### Form with Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useStandardErrorHandler } from '@/hooks/useStandardErrorHandler';
import { loginSchema } from '@/core/validation/schemas';
import { logFormSubmission } from '@/core/logging';

const LoginForm = () => {
  const { t } = useTranslation();
  const { handleError } = useStandardErrorHandler();
  
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      logFormSubmission('login-form', true);
      toast.success(t('auth.login.success'));
    },
    onError: (error) => {
      logFormSubmission('login-form', false, { error: error.message });
      const fieldErrors = handleError(error);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        form.setError(field, { type: 'manual', message });
      });
    },
  });

  return (
    <form onSubmit={form.handleSubmit(data => mutation.mutate(data))}>
      {/* Form fields */}
    </form>
  );
};
```

#### Data Fetching with Loading/Error States
```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryClient';
import { LoadingSpinner, ErrorMessage } from '@/shared/components';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

const UserList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: adminService.listUsers,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ErrorBoundary boundaryName="UserList">
      <ul>
        {data.users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </ErrorBoundary>
  );
};
```

#### API Service
```typescript
import { apiGet, apiPost } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '@/services/api/common';

const API_PREFIX = API_PREFIXES.ADMIN;

export const userService = {
  list: (filters?: ListFilters) =>
    apiGet<UserListResponse>(`${API_PREFIX}/users`, filters),

  getById: (id: string) =>
    apiGet<User>(`${API_PREFIX}/users/${id}`),

  create: (data: CreateUserRequest) =>
    apiPost<User>(`${API_PREFIX}/users`, data),
};
```

---

## Additional Resources

- [Framework Analysis](./FRAMEWORK_ANALYSIS.md) - Complete analysis with scores and recommendations
- [Validation Patterns](./VALIDATION_PATTERNS.md) - Comprehensive validation guide
- [API Patterns](./docs/API_PATTERNS.md) - API integration patterns
- [Copilot Instructions](./.github/copilot-instructions.md) - Project guidelines and conventions

---

## Support

For questions or issues, refer to:
- Framework Analysis document for detailed scores and gaps
- Validation Patterns guide for validation questions
- Code examples in this guide
- Inline code documentation and JSDoc comments
