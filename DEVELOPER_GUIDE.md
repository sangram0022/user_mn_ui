# Framework Improvements - Developer Guide

## Overview

This guide documents all framework improvements implemented as part of the deep code analysis and enhancement project. Follow these patterns for consistent, maintainable, and production-ready code.

## Table of Contents

1. [Logging Framework](#logging-framework)
2. [Error Handling](#error-handling)
3. [Validation Patterns](#validation-patterns)
4. [Data Fetching](#data-fetching)
5. [Localization & i18n](#localization--i18n)
6. [Data Transformers](#data-transformers)
7. [Validators](#validators)
8. [Circuit Breaker Pattern](#circuit-breaker-pattern)
9. [QueryLoader Component](#queryloader-component)
10. [Best Practices](#best-practices)
11. [Quick Reference](#quick-reference)

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

---

## Data Transformers

### Overview

Data transformers provide a clean separation between API responses (snake_case) and UI models (camelCase).

### User Transformer

**File**: `src/services/api/transformers/userTransformer.ts`

Transform user data between API and UI formats:

```typescript
import { userTransformer } from '@/services/api/transformers';

// API response to UI model
const apiUser = {
  user_id: '123',
  email_address: 'user@example.com',
  first_name: 'John',
  created_at: '2024-01-15T10:00:00Z'
};

const uiUser = userTransformer.toUI(apiUser);
// {
//   userId: '123',
//   emailAddress: 'user@example.com',
//   firstName: 'John',
//   createdAt: new Date('2024-01-15T10:00:00Z')
// }

// UI model to API request
const updateData = {
  firstName: 'Jane',
  lastName: 'Doe'
};

const apiData = userTransformer.toAPI(updateData);
// {
//   first_name: 'Jane',
//   last_name: 'Doe'
// }
```

**Available Methods**:
- `toUI(apiUser)`: Transform single user from API to UI
- `toUIList(apiUsers)`: Transform user array from API to UI
- `toAPI(uiUser)`: Transform user data from UI to API

### Auth Transformer

**File**: `src/services/api/transformers/authTransformer.ts`

Transform authentication data:

```typescript
import { authTransformer } from '@/services/api/transformers';

// Login response
const apiResponse = {
  access_token: 'eyJ...',
  refresh_token: 'eyJ...',
  expires_in: 3600,
  user: { /* ... */ }
};

const uiAuth = authTransformer.loginResponseToUI(apiResponse);
// {
//   accessToken: 'eyJ...',
//   refreshToken: 'eyJ...',
//   expiresIn: 3600,
//   user: { /* transformed user */ }
// }

// Login request
const credentials = {
  email: 'user@example.com',
  password: 'secure123',
  rememberMe: true
};

const apiRequest = authTransformer.loginRequestToAPI(credentials);
// {
//   email_address: 'user@example.com',
//   password: 'secure123',
//   remember_me: true
// }
```

**Available Methods**:
- `loginRequestToAPI(credentials)`: Transform login form to API
- `loginResponseToUI(response)`: Transform login response to UI
- `registerRequestToAPI(data)`: Transform registration form to API
- `refreshTokenRequestToAPI(token)`: Transform refresh request to API

### Admin Transformer

**File**: `src/services/api/transformers/adminTransformer.ts`

Transform admin dashboard and analytics data:

```typescript
import { adminTransformer } from '@/services/api/transformers';

// Dashboard stats
const apiStats = {
  total_users: 1250,
  active_users: 890,
  total_revenue: 45000.50,
  last_updated: '2024-01-15T10:00:00Z'
};

const uiStats = adminTransformer.dashboardStatsToUI(apiStats);
// {
//   totalUsers: 1250,
//   activeUsers: 890,
//   totalRevenue: 45000.50,
//   lastUpdated: new Date('2024-01-15T10:00:00Z')
// }

// Activity logs
const apiLogs = [
  {
    log_id: '1',
    user_id: '123',
    action_type: 'login',
    created_at: '2024-01-15T10:00:00Z'
  }
];

const uiLogs = adminTransformer.activityLogsToUI(apiLogs);
// [{
//   logId: '1',
//   userId: '123',
//   actionType: 'login',
//   createdAt: new Date('2024-01-15T10:00:00Z')
// }]
```

**Available Methods**:
- `dashboardStatsToUI(stats)`: Transform dashboard statistics
- `activityLogsToUI(logs)`: Transform activity log array
- `userRoleToUI(role)`: Transform user role data
- `permissionToUI(permission)`: Transform permission data

---

## Validators

### Overview

Comprehensive validation system with built-in validators for common data types, all integrated with i18n.

### Email Validator

**File**: `src/core/validation/validators/EmailValidator.ts`

RFC 5322 compliant email validation:

```typescript
import { EmailValidator } from '@/core/validation/validators';

const validator = new EmailValidator({
  maxLength: 254,
  allowedDomains: ['example.com', 'company.com'], // Optional
  blockedDomains: ['spam.com'], // Optional
  message: 'Custom error message' // Optional
});

const result = validator.validate('user@example.com');
if (result.isValid) {
  console.log('Valid email');
} else {
  console.error(result.errors); // Localized error messages
}
```

### Password Validator

**File**: `src/core/validation/validators/PasswordValidator.ts`

Password validation with strength calculation:

```typescript
import { PasswordValidator } from '@/core/validation/validators';

const validator = new PasswordValidator({
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
});

const result = validator.validate('MyP@ssw0rd');
console.log(result.strength); // weak | medium | strong
console.log(result.score); // 0-100
```

### Phone Validator

**File**: `src/core/validation/validators/PhoneValidator.ts`

E.164 international phone number validation:

```typescript
import { PhoneValidator } from '@/core/validation/validators';

const validator = new PhoneValidator({
  allowInternational: true,
  defaultCountryCode: '+1'
});

const result = validator.validate('+1-555-123-4567');
// Validates and normalizes to E.164 format
```

### Username Validator

**File**: `src/core/validation/validators/UsernameValidator.ts`

Username validation (alphanumeric + underscore):

```typescript
import { UsernameValidator } from '@/core/validation/validators';

const validator = new UsernameValidator({
  minLength: 3,
  maxLength: 20,
  allowUnderscore: true
});

const result = validator.validate('john_doe123');
```

### Name Validator

**File**: `src/core/validation/validators/NameValidator.ts`

First/last name validation with proper capitalization:

```typescript
import { NameValidator } from '@/core/validation/validators';

const validator = new NameValidator({
  minLength: 2,
  maxLength: 50,
  capitalize: true
});

const result = validator.validate('john'); // Returns 'John'
```

### Date Validator

**File**: `src/core/validation/validators/DateValidator.ts`

Date validation with min/max constraints:

```typescript
import { DateValidator } from '@/core/validation/validators';

const validator = new DateValidator({
  minDate: new Date('2020-01-01'),
  maxDate: new Date('2025-12-31'),
  format: 'YYYY-MM-DD',
  allowPastDates: true,
  allowFutureDates: false
});

const result = validator.validate('2024-01-15');
```

### URL Validator

**File**: `src/core/validation/validators/URLValidator.ts`

URL validation with protocol and domain checks:

```typescript
import { URLValidator } from '@/core/validation/validators';

const validator = new URLValidator({
  requireProtocol: true,
  allowedProtocols: ['https', 'http'],
  allowedDomains: ['example.com'],
  maxLength: 2048
});

const result = validator.validate('https://example.com/path');
```

### Async Validator

**File**: `src/core/validation/validators/AsyncValidator.ts`

Asynchronous validation (e.g., checking username availability):

```typescript
import { AsyncValidator } from '@/core/validation/validators';

const validator = new AsyncValidator({
  validatorFn: async (value) => {
    const response = await fetch(`/api/check-username?username=${value}`);
    const data = await response.json();
    return data.available;
  },
  debounceMs: 300,
  message: 'Username is already taken'
});

const result = await validator.validate('john_doe');
```

---

## Circuit Breaker Pattern

### Overview

Prevents cascading failures by stopping requests to failing services. Implements a state machine with three states: CLOSED → OPEN → HALF_OPEN.

**File**: `src/core/api/circuitBreaker.ts`

### Basic Usage

```typescript
import { CircuitBreaker } from '@/core/api/circuitBreaker';

const breaker = new CircuitBreaker({
  failureThreshold: 5,      // Open after 5 failures
  resetTimeout: 60000,       // Wait 60s before retry
  timeout: 30000,            // 30s request timeout
  successThreshold: 2,       // 2 successes to close
  name: 'UserService'
});

try {
  const result = await breaker.execute(async () => {
    return await fetch('/api/users');
  });
} catch (error) {
  if (error instanceof CircuitBreakerError) {
    // Circuit is open, service unavailable
    console.error('Service temporarily unavailable');
  }
}
```

### States

1. **CLOSED** (Normal Operation)
   - All requests are allowed
   - Failures are counted
   - Opens when `failureThreshold` is reached

2. **OPEN** (Service Failing)
   - All requests are immediately rejected
   - After `resetTimeout`, transitions to HALF_OPEN
   - Fast-fail behavior prevents cascading failures

3. **HALF_OPEN** (Testing Recovery)
   - Limited requests allowed to test service health
   - Success moves to CLOSED
   - Failure moves back to OPEN

### API Endpoints

```typescript
import { createApiCircuitBreaker } from '@/core/api/circuitBreaker';

const usersBreaker = createApiCircuitBreaker('/api/users', {
  failureThreshold: 3,
  resetTimeout: 30000
});

// Use in API service
async function getUsers() {
  return usersBreaker.execute(() => apiClient.get('/api/users'));
}
```

### Service-Level Breakers

```typescript
import { createServiceCircuitBreaker } from '@/core/api/circuitBreaker';

const authServiceBreaker = createServiceCircuitBreaker('AuthService', {
  failureThreshold: 5,
  timeout: 10000
});
```

### Monitoring

```typescript
// Get current state
const state = breaker.getState(); // CLOSED | OPEN | HALF_OPEN

// Get statistics
const stats = breaker.getStats();
console.log(stats);
// {
//   state: 'CLOSED',
//   failureCount: 2,
//   successCount: 0,
//   nextAttemptTime: null,
//   options: { ... }
// }

// Manual reset (admin only)
breaker.reset();
```

### Callbacks

```typescript
const breaker = new CircuitBreaker({
  name: 'PaymentService',
  onStateChange: (from, to) => {
    console.log(`Circuit ${from} → ${to}`);
    // Send alert to monitoring system
  },
  onOpen: () => {
    // Alert: Service is down
    alerting.notify('PaymentService circuit opened');
  },
  onClose: () => {
    // Service recovered
    alerting.notify('PaymentService recovered');
  }
});
```

---

## QueryLoader Component

### Overview

React component integrating Suspense and Error Boundaries with TanStack Query for optimal loading UX.

**File**: `src/shared/components/QueryLoader.tsx`

### Basic Usage

```typescript
import { QueryLoader } from '@/shared/components/QueryLoader';

function UserProfile({ userId }: { userId: string }) {
  return (
    <QueryLoader queryKey={['user', userId]}>
      <UserProfileContent userId={userId} />
    </QueryLoader>
  );
}
```

### Custom Fallback

```typescript
import { QueryLoader, MinimalLoader } from '@/shared/components/QueryLoader';

<QueryLoader 
  queryKey={['posts']} 
  fallback={<MinimalLoader />}
>
  <PostsList />
</QueryLoader>
```

### Error Handling

```typescript
function CustomErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <h2>Oops! Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

<QueryLoader 
  queryKey={['users']}
  errorFallback={CustomErrorFallback}
  onError={(error) => {
    console.error('Query failed:', error);
  }}
>
  <UsersList />
</QueryLoader>
```

### Loading Timeout

```typescript
<QueryLoader
  queryKey={['analytics']}
  loadingTimeout={3000}
  onLoadingTimeout={() => {
    console.warn('Query is taking longer than expected');
    // Show notification or take action
  }}
>
  <AnalyticsDashboard />
</QueryLoader>
```

### Specialized Loaders

#### MinimalLoader

Small spinner for inline components:

```typescript
import { MinimalLoader } from '@/shared/components/QueryLoader';

<QueryLoader fallback={<MinimalLoader />}>
  <SmallComponent />
</QueryLoader>
```

#### TableLoader

Configurable table skeleton:

```typescript
import { TableLoader } from '@/shared/components/QueryLoader';

<QueryLoader fallback={<TableLoader rows={10} columns={5} />}>
  <DataTable />
</QueryLoader>
```

#### CardLoader

Card layout skeleton:

```typescript
import { CardLoader } from '@/shared/components/QueryLoader';

<QueryLoader fallback={<CardLoader />}>
  <ProfileCard />
</QueryLoader>
```

#### ListLoader

List with avatars skeleton:

```typescript
import { ListLoader } from '@/shared/components/QueryLoader';

<QueryLoader fallback={<ListLoader items={8} />}>
  <UserList />
</QueryLoader>
```

#### FormLoader

Form fields skeleton:

```typescript
import { FormLoader } from '@/shared/components/QueryLoader';

<QueryLoader fallback={<FormLoader fields={6} />}>
  <SettingsForm />
</QueryLoader>
```

#### GridLoader

Responsive grid skeleton:

```typescript
import { GridLoader } from '@/shared/components/QueryLoader';

<QueryLoader fallback={<GridLoader items={9} columns={3} />}>
  <ProductGrid />
</QueryLoader>
```

---

## Best Practices

### Localization

1. **Always use translation utilities** - Never hardcode user-facing strings
2. **Use type-safe keys** - Import `TRANSLATION_KEYS` for autocomplete
3. **Provide context** - Use field names and parameters for clarity
4. **Test all languages** - Ensure translations work in all locales

### Data Transformers

1. **Single source of truth** - All API data flows through transformers
2. **Type safety** - Define TypeScript interfaces for API and UI models
3. **Consistent naming** - API uses snake_case, UI uses camelCase
4. **Date handling** - Always transform date strings to Date objects

### Validators

1. **Compose validators** - Use ValidationBuilder for multiple rules
2. **Localize messages** - All validators use `translateValidation()`
3. **Client + server** - Validate on both sides for security
4. **Async validation** - Use debouncing for expensive checks

### Circuit Breaker

1. **Critical services only** - Use for external APIs and critical paths
2. **Monitor state changes** - Log and alert on circuit opens
3. **Appropriate thresholds** - Tune based on service characteristics
4. **Manual overrides** - Provide admin controls for emergency resets

### QueryLoader

1. **Always wrap queries** - Use QueryLoader for all data fetching
2. **Appropriate fallbacks** - Match skeleton to content layout
3. **Error recovery** - Provide clear retry mechanisms
4. **Loading feedback** - Use timeout warnings for slow queries

---

## Migration Guide

### Replacing Hardcoded Strings

**Before**:
```typescript
throw new Error('Email is required');
```

**After**:
```typescript
import { translateValidation } from '@/core/localization';
throw new Error(translateValidation('email', 'required'));
```

### Adding Data Transformers

**Before**:
```typescript
const response = await fetch('/api/users');
const users = await response.json();
setUsers(users); // Raw API data
```

**After**:
```typescript
import { userTransformer } from '@/services/api/transformers';

const response = await fetch('/api/users');
const apiUsers = await response.json();
const uiUsers = userTransformer.toUIList(apiUsers);
setUsers(uiUsers); // Transformed UI data
```

### Adding Circuit Breakers

**Before**:
```typescript
const response = await fetch('/api/users');
```

**After**:
```typescript
import { createApiCircuitBreaker } from '@/core/api/circuitBreaker';

const breaker = createApiCircuitBreaker('/api/users');
const response = await breaker.execute(() => fetch('/api/users'));
```

### Adding QueryLoader

**Before**:
```typescript
function UserProfile() {
  const { data, isLoading, error } = useQuery(['user'], fetchUser);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  
  return <div>{data.name}</div>;
}
```

**After**:
```typescript
import { QueryLoader } from '@/shared/components/QueryLoader';

function UserProfile() {
  return (
    <QueryLoader queryKey={['user']}>
      <UserProfileContent />
    </QueryLoader>
  );
}

function UserProfileContent() {
  const { data } = useQuery(['user'], fetchUser); // No loading/error checks
  return <div>{data.name}</div>;
}
```

---

## Framework Scores

### Before Improvements
- **Localization**: 75/100
- **Data Layer**: 70/100
- **Validation**: 75/100
- **API Resilience**: 80/100
- **Loading UX**: 75/100
- **Overall**: 84/100

### After Improvements
- **Localization**: 95/100
- **Data Layer**: 90/100
- **Validation**: 95/100
- **API Resilience**: 95/100
- **Loading UX**: 95/100
- **Overall**: 94/100

---

## Additional Resources

- [Framework Analysis](./FRAMEWORK_ANALYSIS.md) - Complete analysis with scores and recommendations
- [Validation Patterns](./VALIDATION_PATTERNS.md) - Comprehensive validation guide
- [Framework Improvements Summary](./FRAMEWORK_IMPROVEMENTS_SUMMARY.md) - Implementation timeline and deliverables
- **Localization**: See `public/locales/` for translation files
- **Type Definitions**: See `src/types/` for TypeScript interfaces
- **Tests**: See `src/**/__tests__/` for usage examples
- **Design System**: See `src/design-system/` for UI components

---

## Support

For questions or issues, refer to:
- Framework Analysis document for detailed scores and gaps
- Validation Patterns guide for validation questions
- Code examples in this guide
- Inline code documentation and JSDoc comments
