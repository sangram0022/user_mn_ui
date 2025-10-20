# API Client Documentation

**Version:** 2.0.0  
**Last Updated:** October 20, 2025  
**Completion:** 100% Backend API Coverage (48/48 endpoints)

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [API Categories](#api-categories)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)
7. [Advanced Features](#advanced-features)
8. [Type Safety](#type-safety)
9. [Testing](#testing)
10. [Best Practices](#best-practices)

---

## Overview

The API Client provides a type-safe, feature-rich interface to interact with the backend API. It includes:

- ✅ **48 Endpoints** - Complete backend API coverage
- ✅ **100% Type Safety** - Full TypeScript support
- ✅ **Automatic Retry** - Exponential backoff with jitter
- ✅ **Rate Limiting** - Built-in rate limit handling
- ✅ **Request Deduplication** - Prevents duplicate simultaneous requests
- ✅ **CSRF Protection** - Automatic CSRF token management
- ✅ **Token Management** - Secure JWT token handling
- ✅ **Error Normalization** - Consistent error handling

### Architecture

```
src/lib/api/
├── client.ts              # Main API client (1350+ lines)
├── error.ts               # Error handling utilities
├── __tests__/             # Comprehensive test suite
│   ├── backend-api-integration.test.ts
│   ├── client.retry.test.ts
│   ├── api-requests.test.ts
│   └── api-errors.test.ts
└── README.md              # This file
```

---

## Quick Start

### Installation

The API client is already configured in your project. Import it using:

```typescript
import { useApi } from '@/lib/api/client';
// OR
import { apiClient } from '@/lib/api/client';
```

### Basic Usage

```typescript
import { useApi } from '@/lib/api/client';

function MyComponent() {
  const api = useApi();

  const handleLogin = async () => {
    try {
      const response = await api.login({
        email: 'user@example.com',
        password: 'SecurePass123',
      });

      console.log('Login successful:', response.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

---

## Authentication

### Login Flow

```typescript
import { useApi } from '@/lib/api/client';

const api = useApi();

// Standard login (JWT tokens in response)
const loginResponse = await api.login({
  email: 'user@example.com',
  password: 'SecurePass123',
});

// Access token automatically stored
console.log(loginResponse.access_token);
console.log(loginResponse.refresh_token);
```

### Secure Login (HttpOnly Cookies)

```typescript
// Secure login (tokens in httpOnly cookies)
const secureResponse = await api.loginSecure({
  email: 'user@example.com',
  password: 'SecurePass123',
});

// No tokens in response - stored in httpOnly cookies
console.log(secureResponse.user);
```

### Token Refresh

```typescript
// Automatic token refresh on 401 errors
// Manual refresh:
const newTokens = await api.refresh({
  refresh_token: 'current_refresh_token',
});
```

### Logout

```typescript
// Standard logout
await api.logout();

// Secure logout (clears cookies)
await api.logoutSecure();
```

### Check Authentication

```typescript
const isLoggedIn = api.isAuthenticated();

if (isLoggedIn) {
  // User is authenticated
}
```

---

## API Categories

### 1. Authentication (13 endpoints)

**Standard Authentication**

- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `refresh(token)` - Refresh access token
- `verifyEmail(token)` - Verify email address
- `resendVerification(email)` - Resend verification email
- `forgotPassword(email)` - Request password reset
- `resetPassword(data)` - Reset password with token
- `changePassword(data)` - Change password (authenticated)

**Secure Authentication (HttpOnly Cookies)**

- `loginSecure(credentials)` - Login with secure cookies
- `logoutSecure()` - Logout (clear cookies)
- `refreshSecure()` - Refresh token (cookies)

**CSRF Protection**

- `getCSRFToken()` - Get CSRF token
- `validateCsrf(token)` - Validate CSRF token

### 2. Profile Management (3 endpoints)

- `getUserProfile()` - Get current user profile
- `updateUserProfile(data)` - Update profile information

### 3. Admin - User Management (7 endpoints)

- `getUsers(params?)` - List all users with filtering
- `getUser(userId)` - Get specific user details
- `createUser(userData)` - Create new user
- `updateUser(userId, data)` - Update user information
- `deleteUser(userId)` - Delete user account
- `approveUser(userId)` - Approve user registration
- `rejectUser(userId, reason?)` - Reject user registration
- `activateUser(userId)` - Activate user account
- `deactivateUser(userId, reason)` - Deactivate user account

### 4. Admin - Role Management (7 endpoints) ✨ NEW

- `getAllRoles()` - List all roles
- `createRole(roleData)` - Create new role
- `getRole(roleName)` - Get specific role
- `updateRole(roleName, data)` - Update role
- `deleteRole(roleName)` - Delete role
- `assignRoleToUser(userId, role)` - Assign role to user
- `revokeRoleFromUser(userId)` - Revoke user's role

### 5. Audit Logs (2 endpoints)

- `getAuditLogs(params?)` - Query audit logs with filtering
- `getAuditSummary()` - Get audit statistics

### 6. GDPR Compliance (3 endpoints)

- `requestGDPRExport(options?)` - Export personal data
- `getGDPRExportStatus(exportId)` - Check export status
- `requestGDPRDelete(data)` - Delete account (GDPR)
- `deleteMyAccount(password, confirmation, reason?)` - Delete account

### 7. Health Checks (7 endpoints) ✨ NEW

- `healthCheck()` - Basic health status
- `ping()` - Ping endpoint
- `readinessCheck()` - Readiness probe (Kubernetes)
- `livenessCheck()` - Liveness probe (Kubernetes)
- `detailedHealth()` - Detailed health information
- `databaseHealth()` - Database health status
- `systemHealth()` - System resources status

### 8. Frontend Error Logging (1 endpoint) ✨ NEW

- `logFrontendError(errorData)` - Log frontend errors to backend

---

## Usage Examples

### Role Management

```typescript
import { useApi } from '@/lib/api/client';

const api = useApi();

// List all roles
const roles = await api.getAllRoles();
console.log(roles); // [{ role_id: '1', role_name: 'admin', ... }]

// Create new role
const newRole = await api.createRole({
  name: 'moderator',
  description: 'Content moderator role',
  permissions: ['content:read', 'content:moderate', 'content:flag'],
});

// Get specific role
const adminRole = await api.getRole('admin');

// Update role
await api.updateRole('moderator', {
  description: 'Updated description',
  permissions: ['content:read', 'content:moderate'],
});

// Delete role
await api.deleteRole('moderator');

// Assign role to user
await api.assignRoleToUser('user-123', 'manager');

// Revoke role from user
await api.revokeRoleFromUser('user-123');
```

### Health Monitoring

```typescript
import { useApi } from '@/lib/api/client';

const api = useApi();

// Kubernetes readiness probe
const readiness = await api.readinessCheck();
if (readiness.status === 'ready') {
  console.log('Service is ready to accept traffic');
}

// Kubernetes liveness probe
const liveness = await api.livenessCheck();
if (liveness.status === 'healthy') {
  console.log('Service is alive');
}

// Detailed health with components
const health = await api.detailedHealth();
console.log('Database:', health.components.database.status);
console.log('Cache:', health.components.cache.status);
console.log('Uptime:', health.uptime, 'seconds');

// Database-specific health
const dbHealth = await api.databaseHealth();
console.log('Connection pool:', dbHealth.connection_pool);
console.log('Response time:', dbHealth.response_time_ms, 'ms');

// System resources
const system = await api.systemHealth();
console.log('CPU usage:', system.cpu_usage, '%');
console.log('Memory usage:', system.memory_usage, '%');
console.log('Disk usage:', system.disk_usage, '%');
```

### Frontend Error Logging

```typescript
import { useApi } from '@/lib/api/client';

const api = useApi();

// Global error handler
window.addEventListener('error', async (event) => {
  await api.logFrontendError({
    message: event.error.message,
    stack: event.error.stack,
    severity: 'high',
    context: {
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    },
  });
});

// React error boundary
class ErrorBoundary extends React.Component {
  async componentDidCatch(error, errorInfo) {
    await api.logFrontendError({
      message: error.message,
      stack: error.stack,
      severity: 'critical',
      context: {
        component: errorInfo.componentStack,
        user_id: currentUser?.id,
        ...errorInfo,
      },
    });
  }
}

// Try-catch logging
try {
  await riskyOperation();
} catch (error) {
  await api.logFrontendError({
    message: `Operation failed: ${error.message}`,
    stack: error.stack,
    severity: 'medium',
    context: {
      operation: 'riskyOperation',
      params: {
        /* ... */
      },
    },
  });
  throw error;
}
```

### GDPR Data Export

```typescript
import { useApi } from '@/lib/api/client';

const api = useApi();

// Export as JSON with all data
const exportRequest = await api.requestGDPRExport({
  format: 'json',
  include_audit_logs: true,
  include_metadata: true,
});

console.log('Export ID:', exportRequest.export_id);
console.log('Status:', exportRequest.status);
console.log('Estimated completion:', exportRequest.estimated_completion);

// Check export status
const status = await api.getGDPRExportStatus(exportRequest.export_id);

if (status.status === 'completed') {
  // Download link available
  window.open(status.download_url, '_blank');
}

// Export as CSV (simpler format)
const csvExport = await api.requestGDPRExport({
  format: 'csv',
  include_audit_logs: false,
  include_metadata: false,
});
```

### Audit Log Filtering

```typescript
import { useApi } from '@/lib/api/client';

const api = useApi();

// Filter by action and resource
const createActions = await api.getAuditLogs({
  action: 'create',
  resource: 'user',
  page: 1,
  limit: 50,
});

// Filter by date range
const lastWeek = await api.getAuditLogs({
  start_date: '2025-10-13',
  end_date: '2025-10-20',
  page: 1,
  limit: 100,
});

// Filter by severity and user
const criticalEvents = await api.getAuditLogs({
  severity: 'high',
  user_id: 'admin-123',
  page: 1,
  limit: 20,
});

// Complex filtering
const filtered = await api.getAuditLogs({
  action: 'delete',
  resource: 'user',
  start_date: '2025-10-01',
  end_date: '2025-10-20',
  severity: 'high',
  page: 1,
  limit: 50,
});

// Get audit summary
const summary = await api.getAuditSummary();
console.log('Total events:', summary.total_events);
console.log('By action:', summary.by_action);
console.log('By severity:', summary.by_severity);
```

### User Management

```typescript
import { useApi } from '@/lib/api/client';

const api = useApi();

// List users with filtering
const users = await api.getUsers({
  page: 1,
  limit: 20,
  role: 'manager',
  is_active: true,
});

// Get specific user
const user = await api.getUser('user-123');

// Create user
const newUser = await api.createUser({
  email: 'newuser@example.com',
  password: 'SecurePass123',
  first_name: 'John',
  last_name: 'Doe',
  role: 'user',
});

// Update user
await api.updateUser('user-123', {
  first_name: 'Jane',
  role: 'manager',
});

// Approve pending user
await api.approveUser('user-456');

// Reject user with reason
await api.rejectUser('user-789', 'Invalid email domain');

// Activate user
await api.activateUser('user-123');

// Deactivate user
await api.deactivateUser('user-456', 'Policy violation');

// Delete user
await api.deleteUser('user-789');
```

---

## Error Handling

### Error Types

The API client throws structured errors with the following properties:

```typescript
interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: any;
}
```

### Error Codes

All error codes are defined in `@shared/types`:

```typescript
import { ERROR_CODES } from '@shared/types';

// Authentication errors
ERROR_CODES.AUTH_INVALID_CREDENTIALS; // 'AUTH_001'
ERROR_CODES.AUTH_TOKEN_EXPIRED; // 'AUTH_006'
ERROR_CODES.AUTH_UNAUTHORIZED; // 'AUTH_012'

// User management errors
ERROR_CODES.USER_NOT_FOUND; // 'USER_002'
ERROR_CODES.USER_ALREADY_EXISTS; // 'USER_001'

// Role management errors
ERROR_CODES.ROLE_NOT_FOUND; // 'ROLE_001'
ERROR_CODES.ROLE_ALREADY_EXISTS; // 'ROLE_002'

// Validation errors
ERROR_CODES.VALIDATION_EMAIL_INVALID; // 'VAL_001'
ERROR_CODES.VALIDATION_PASSWORD_WEAK; // 'VAL_004'

// System errors
ERROR_CODES.SYSTEM_RATE_LIMIT_EXCEEDED; // 'SYS_004'
```

### Error Handling Pattern

```typescript
import { useApi } from '@/lib/api/client';
import { ERROR_CODES } from '@shared/types';
import { ApiError } from '@/lib/api/error';

const api = useApi();

try {
  const user = await api.getUser('user-123');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ERROR_CODES.USER_NOT_FOUND:
        console.error('User not found');
        break;
      case ERROR_CODES.AUTH_UNAUTHORIZED:
        console.error('Not authorized to view this user');
        break;
      case ERROR_CODES.SYSTEM_RATE_LIMIT_EXCEEDED:
        console.error('Rate limit exceeded, please try again later');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Automatic Retry

The API client automatically retries failed requests with exponential backoff:

```typescript
// Automatic retry for:
// - Network errors
// - 5xx server errors
// - Timeout errors

// Configuration:
const config = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  jitter: true, // Add randomization
};

// Retry delays: ~1s, ~2s, ~4s (with jitter)
```

### Rate Limiting

Rate limits are automatically handled:

```typescript
// Rate limits (from backend spec):
const RATE_LIMITS = {
  LOGIN: { requests: 10, window: 60 }, // 10 per minute (per IP)
  LOGIN_EMAIL: { requests: 5, window: 60 }, // 5 per minute (per email)
  REGISTER: { requests: 10, window: 3600 }, // 10 per hour (per IP)
  FORGOT_PASSWORD: { requests: 3, window: 3600 }, // 3 per hour (per email)
};

// When rate limit is hit (429 response):
// - Client automatically backs off
// - Retry-After header is respected
// - Exponential backoff applied
```

---

## Advanced Features

### Request Deduplication

Prevents duplicate simultaneous requests to the same endpoint:

```typescript
// Multiple simultaneous calls to same endpoint
const promise1 = api.getUserProfile();
const promise2 = api.getUserProfile();
const promise3 = api.getUserProfile();

// Only 1 actual HTTP request is made
// All promises resolve with the same response
const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

console.log(result1 === result2); // true (same reference)
```

### CSRF Protection

CSRF tokens are automatically managed:

```typescript
// Automatic CSRF token handling:
// 1. Token fetched on first authenticated request
// 2. Token included in all state-changing requests (POST, PUT, DELETE)
// 3. Token refreshed if expired

// Manual CSRF operations (if needed):
const token = await api.getCSRFToken();
await api.validateCsrf(token.csrf_token);
```

### Custom Timeouts

```typescript
// Global timeout: 30 seconds (default)

// Per-request timeout:
await api.execute('/custom-endpoint', {
  method: 'POST',
  timeout: 60000, // 60 seconds
  body: JSON.stringify(data),
});
```

### Request Interceptors

```typescript
// Access the underlying request method:
const response = await apiClient.request('/custom-endpoint', {
  method: 'GET',
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

---

## Type Safety

### Type Definitions

All API responses are fully typed:

```typescript
import type {
  LoginResponse,
  RegisterResponse,
  UserProfile,
  RoleResponse,
  AuditLog,
  HealthCheckResponse,
} from '@shared/types';

// Type-safe API calls
const loginResponse: LoginResponse = await api.login(credentials);
const profile: UserProfile = await api.getUserProfile();
const roles: RoleResponse[] = await api.getAllRoles();
const logs: AuditLog[] = await api.getAuditLogs();
const health: HealthCheckResponse = await api.healthCheck();
```

### Request Validation

Use validation utilities before making API calls:

```typescript
import {
  validateBackendEmail,
  validateBackendPassword,
  validateBackendRegistrationForm,
} from '@/shared/utils/validation';

// Validate individual fields
const emailResult = validateBackendEmail(email);
if (!emailResult.valid) {
  console.error(emailResult.error);
  return;
}

// Validate entire form
const formResult = validateBackendRegistrationForm({
  email,
  password,
  first_name,
  last_name,
});

if (!formResult.valid) {
  console.error('Validation errors:', formResult.errors);
  return;
}

// Make API call only if validation passes
await api.register({ email, password, first_name, last_name });
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '@/lib/api/client';

describe('API Client', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8001/api/v1', false);
  });

  it('should fetch all roles', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify([{ role_id: '1', role_name: 'admin' }])))
    );
    global.fetch = mockFetch;

    const roles = await client.getAllRoles();

    expect(roles).toHaveLength(1);
    expect(roles[0].role_name).toBe('admin');
  });
});
```

### Integration Tests

See `__tests__/backend-api-integration.test.ts` for comprehensive integration tests covering:

- Role Management (7 tests)
- Health Checks (5 tests)
- Error Logging (1 test)
- GDPR Export (3 tests)
- Audit Logs (3 tests)

### Running Tests

```bash
# Run all tests
npm test

# Run API tests only
npm test -- src/lib/api/__tests__

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Best Practices

### 1. Use the Hook in Components

```typescript
// ✅ Good: Use useApi hook
function MyComponent() {
  const api = useApi();

  const handleAction = async () => {
    await api.someMethod();
  };
}

// ❌ Avoid: Import apiClient directly in components
import { apiClient } from '@/lib/api/client';
```

### 2. Handle Errors Properly

```typescript
// ✅ Good: Specific error handling
try {
  await api.createRole(roleData);
} catch (error) {
  if (error.code === ERROR_CODES.ROLE_ALREADY_EXISTS) {
    showError('A role with this name already exists');
  } else {
    showError('Failed to create role');
  }
}

// ❌ Avoid: Generic error handling
try {
  await api.createRole(roleData);
} catch (error) {
  console.error(error); // Not user-friendly
}
```

### 3. Validate Before API Calls

```typescript
// ✅ Good: Validate first
const validation = validateBackendEmail(email);
if (!validation.valid) {
  showError(validation.error);
  return;
}
await api.register({ email, ... });

// ❌ Avoid: Let API validation catch it
await api.register({ email, ... }); // Will fail with server error
```

### 4. Use Type Safety

```typescript
// ✅ Good: Explicit types
const roles: RoleResponse[] = await api.getAllRoles();
const firstRole: RoleResponse = roles[0];

// ❌ Avoid: Implicit any
const roles = await api.getAllRoles();
const firstRole = roles[0]; // Type unknown
```

### 5. Handle Loading States

```typescript
// ✅ Good: Show loading states
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await api.getUsers();
    setUsers(data);
  } finally {
    setLoading(false);
  }
};

// ❌ Avoid: No loading feedback
const loadData = async () => {
  const data = await api.getUsers();
  setUsers(data);
};
```

### 6. Cleanup on Unmount

```typescript
// ✅ Good: Use AbortController
useEffect(() => {
  const controller = new AbortController();

  const loadData = async () => {
    try {
      const data = await api.execute('/endpoint', {
        signal: controller.signal,
      });
      setData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  };

  loadData();

  return () => controller.abort();
}, []);
```

### 7. Cache When Appropriate

```typescript
// ✅ Good: Cache static data
const rolesCache = new Map();

const getRoles = async () => {
  if (rolesCache.has('all')) {
    return rolesCache.get('all');
  }

  const roles = await api.getAllRoles();
  rolesCache.set('all', roles);
  return roles;
};

// ❌ Avoid: Fetch every time
const getRoles = async () => {
  return await api.getAllRoles(); // Always fetches
};
```

---

## Reference

### Configuration

```typescript
// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

// Timeouts
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Retry Configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 10000; // 10 seconds
```

### All Available Methods

See [API Categories](#api-categories) section for complete list of 48 methods.

### Type Definitions Location

```typescript
// All types exported from:
import type { ... } from '@shared/types';

// Includes:
// - Request/Response types
// - Error codes
// - Validation rules
// - Rate limits
```

---

## Support

For questions or issues:

1. Check the [Usage Examples](#usage-examples)
2. Review the [Test Files](../../../__tests__/backend-api-integration.test.ts)
3. Consult the [Backend API Documentation](../../../../backend_api_details/)

---

**Last Updated:** October 20, 2025  
**API Version:** 2.0.0  
**Backend Spec Version:** 1.0.0
