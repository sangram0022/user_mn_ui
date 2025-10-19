# Backend API - Quick Reference Guide

**Status:** ✅ Complete - 44/44 Endpoints Implemented  
**Version:** 2.0  
**Last Updated:** October 19, 2025

> **Complete Documentation:** See `API_DOCUMENTATION_COMPLETE.md` for full API specifications  
> **Integration Guide:** See `API_INTEGRATION_GUIDE.md` for detailed usage examples

---

## Quick Import

```typescript
import { api } from '@/services/api';

// Or import individual services
import {
  authService,
  userProfileService,
  adminService,
  gdprService,
  auditService,
} from '@/services/api';
```

---

## 🔐 Authentication APIs

### Login & Registration

```typescript
// Standard Login
const response = await api.auth.login({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});

// Secure Login (httpOnly cookies - recommended)
const response = await api.auth.loginSecure({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});

// Register
await api.auth.register({
  email: 'new@example.com',
  password: 'SecurePassword123!',
  first_name: 'John',
  last_name: 'Doe',
});

// Logout
await api.auth.logout();
```

### Password Management

```typescript
// Forgot Password
await api.auth.forgotPassword('user@example.com');

// Reset Password
await api.auth.resetPassword({
  token: 'reset-token',
  new_password: 'NewPassword123!',
});

// Change Password (authenticated)
await api.auth.changePassword({
  current_password: 'OldPassword123!',
  new_password: 'NewPassword456!',
});
```

### Email Verification

```typescript
// Verify Email
await api.auth.verifyEmail('verification-token');

// Resend Verification
await api.auth.resendVerificationEmail('user@example.com');
```

### Token Management

```typescript
// Refresh Token
await api.auth.refreshToken('refresh-token');

// Get CSRF Token (for secure endpoints)
const csrfToken = await api.auth.getCSRFToken();

// Check Authentication
const isAuth = api.auth.isAuthenticated();
```

---

## 👤 User Profile APIs

```typescript
// Get Current User Profile
const profile = await api.profile.getCurrentProfile();

// Update Profile
const updated = await api.profile.updateProfile({
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications_enabled: true,
  },
});
```

---

## 👥 Admin - User Management

### List & Search Users

```typescript
// Get All Users (with pagination & filters)
const users = await api.admin.getUsers({
  skip: 0,
  limit: 20,
  sort_by: 'created_at',
  order: 'desc',
  is_active: true,
  email: 'search@example.com', // Partial match
});

// Get User Details
const user = await api.admin.getUserById('user-123');
```

### CRUD Operations

```typescript
// Create User (Admin)
const newUser = await api.admin.createUser({
  email: 'admin-created@example.com',
  password: 'SecurePassword123!',
  first_name: 'Jane',
  last_name: 'Smith',
  roles: ['user'],
});

// Update User
const updated = await api.admin.updateUser('user-123', {
  first_name: 'Updated Name',
  is_active: true,
  roles: ['user', 'moderator'],
});

// Delete User
await api.admin.deleteUser('user-123');
```

### User Approval Workflow

```typescript
// Approve User
await api.admin.approveUser('user-123');

// Reject User
await api.admin.rejectUser('user-123', 'Does not meet requirements');

// Activate User
await api.admin.activateUser('user-123');

// Deactivate User
await api.admin.deactivateUser('user-123', 'Policy violation');
```

---

## 🎭 Admin - Role Management

```typescript
// Get All Roles
const roles = await api.admin.getRoles();

// Create Role
const newRole = await api.admin.createRole({
  name: 'moderator',
  description: 'Moderator role',
  permissions: ['read_posts', 'delete_posts'],
});

// Update Role
await api.admin.updateRole('role-id', {
  description: 'Updated description',
  permissions: ['read_posts', 'create_posts', 'delete_posts'],
});

// Delete Role
await api.admin.deleteRole('role-id');
```

---

## 🔒 RBAC - Role-Based Access Control

### Permissions

```typescript
// Get All Permissions
const permissions = await api.admin.getPermissions();

// Get User Permissions
const userPerms = await api.admin.getUserPermissions('user-123');

// Check User Permission
const hasPermission = await api.admin.checkUserPermission('user-123', 'update_profile');

// Verify Permission (with role details)
const verification = await api.admin.verifyUserPermission('user-123', 'update_profile');
```

### Role Assignment

```typescript
// Get User Roles
const roles = await api.admin.getUserRoles('user-123');

// Assign Role to User
await api.admin.assignRoleToUser('user-123', 'role-id');

// Remove Role from User
await api.admin.removeRoleFromUser('user-123', 'role-id');
```

### Role-Permission Management

```typescript
// Get Role Permissions
const permissions = await api.admin.getRolePermissions('role-id');

// Add Permission to Role
await api.admin.addPermissionToRole('role-id', 'permission-id');

// Remove Permission from Role
await api.admin.removePermissionFromRole('role-id', 'permission-id');
```

---

## 📊 Admin - Statistics & Analytics

```typescript
// Get Admin Statistics
const stats = await api.admin.getStats();
// Returns: total_users, active_users, new_users_today, etc.

// Get User Analytics
const analytics = await api.admin.getUserAnalytics();

// Get Audit Logs (Admin view)
const logs = await api.admin.getAuditLogs({
  skip: 0,
  limit: 50,
  user_id: 'user-123',
  action: 'UPDATE_PROFILE',
  start_date: '2025-10-01T00:00:00Z',
  end_date: '2025-10-19T23:59:59Z',
});
```

---

## 📝 Audit Logging

```typescript
// Query Audit Logs
const logs = await api.audit.getAuditLogs({
  skip: 0,
  limit: 20,
  user_id: 'user-123',
  action: 'UPDATE_PROFILE',
  resource_type: 'user',
  status: 'success',
});

// Get Audit Summary
const summary = await api.audit.getAuditSummary({
  start_date: '2025-10-01T00:00:00Z',
  end_date: '2025-10-19T23:59:59Z',
  group_by: 'action',
});
```

---

## 🛡️ GDPR Compliance

### Data Export (Right of Access - Article 15)

```typescript
// Request Data Export
const exportRequest = await api.gdpr.exportMyData({
  format: 'json', // or 'csv'
  include_audit_logs: true,
  include_metadata: true,
});

// Check Export Status
const status = await api.gdpr.checkExportStatus(exportRequest.export_id);
// Returns: { status: 'processing' | 'completed', download_url, progress }
```

### Account Deletion (Right to Erasure - Article 17)

```typescript
// Delete Account (requires exact confirmation)
const deletion = await api.gdpr.deleteMyAccount({
  confirmation: 'DELETE MY ACCOUNT', // Must be exact
  reason: 'No longer needed',
});
// 24-hour grace period before permanent deletion
```

---

## 📋 API Response Patterns

### Success Response

```typescript
// User data response
{
  id: "user-123",
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  is_active: true,
  is_email_verified: true,
  created_at: "2025-10-19T10:00:00Z"
}
```

### Error Response

```typescript
// Standard error format
{
  detail: "User email already exists",
  code: "CONFLICT_EMAIL_DUPLICATE",
  status_code: 409,
  timestamp: "2025-10-19T10:00:00Z",
  request_id: "req-abc-123"
}

// Validation error
{
  detail: "Validation failed",
  code: "VALIDATION_ERROR",
  status_code: 422,
  errors: [
    {
      field: "password",
      message: "Password must contain at least one uppercase letter",
      value: "password123!"
    }
  ]
}
```

---

## 🚨 Error Handling

```typescript
import { ApiError } from '@/lib/api/error';

try {
  const response = await api.auth.login({ email, password });
} catch (error) {
  if (error instanceof ApiError) {
    // Handle specific error codes
    switch (error.code) {
      case 'AUTH_INVALID_CREDENTIALS':
        console.error('Invalid email or password');
        break;
      case 'VALIDATION_ERROR':
        console.error('Validation failed:', error.errors);
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.error('Too many requests, try again later');
        break;
      default:
        console.error('API Error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## 🔑 Authentication Patterns

### Standard (Token in LocalStorage)

```typescript
const response = await api.auth.login({ email, password });
// Tokens stored in sessionStorage
// Access token expires in 1 hour
// Refresh token expires in 7 days
```

### Secure (httpOnly Cookies) - **Recommended**

```typescript
const response = await api.auth.loginSecure({ email, password });
// Tokens stored in httpOnly cookies (protected from XSS)
// CSRF token required for state-changing operations
// Automatic credential transmission
```

---

## 📊 HTTP Status Codes

| Code | Meaning             | Example Use Case            |
| ---- | ------------------- | --------------------------- |
| 200  | OK                  | Successful GET/PUT/DELETE   |
| 201  | Created             | User registration           |
| 202  | Accepted            | Data export started         |
| 204  | No Content          | Successful with no response |
| 400  | Bad Request         | Invalid request format      |
| 401  | Unauthorized        | Not authenticated           |
| 403  | Forbidden           | No permission               |
| 404  | Not Found           | Resource doesn't exist      |
| 409  | Conflict            | Email already exists        |
| 422  | Validation Error    | Invalid input data          |
| 429  | Rate Limit Exceeded | Too many requests           |
| 500  | Server Error        | Internal server error       |

---

## 🎯 Best Practices

### 1. Use TypeScript Types

```typescript
import type { LoginCredentials, UserSummary } from '@/services/api';

const credentials: LoginCredentials = {
  email: 'user@example.com',
  password: 'SecurePassword123!',
};

const user: UserSummary = await api.admin.getUserById('user-123');
```

### 2. Handle Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleLogin = async () => {
  setIsLoading(true);
  try {
    await api.auth.login({ email, password });
  } catch (error) {
    handleError(error);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Implement Retry Logic

```typescript
// API client has built-in retry with exponential backoff
// For 5xx errors and network failures
// Max 3 retries with increasing delays
```

### 4. Use React Hooks

```typescript
import { useAuth } from '@/hooks';

function MyComponent() {
  const { login, logout, user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login(email, password);
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 5. Cache Frequently Used Data

```typescript
import { useQuery } from '@tanstack/react-query';

function useUserProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.profile.getCurrentProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## 📚 Additional Resources

- **Complete API Docs:** `API_DOCUMENTATION_COMPLETE.md` (44 endpoints)
- **Integration Guide:** `API_INTEGRATION_GUIDE.md` (detailed examples)
- **Service Source:** `src/services/api/` (TypeScript implementations)
- **API Config:** `src/config/api.config.ts` (endpoint constants)

---

## ✅ Implementation Checklist

### Frontend Integration

- [x] Authentication service (9 endpoints)
- [x] User profile service (2 endpoints)
- [x] Admin user management (11 endpoints)
- [x] Admin role management (4 endpoints)
- [x] RBAC permissions (10 endpoints)
- [x] Audit logging (2 endpoints)
- [x] GDPR compliance (3 endpoints)
- [x] Secure authentication (httpOnly cookies)
- [x] CSRF token handling
- [x] Error handling & normalization
- [x] TypeScript types & interfaces
- [x] Request deduplication
- [x] Retry logic with exponential backoff
- [x] Rate limit handling
- [x] Request timeout protection

**Total: 44/44 endpoints implemented (100% coverage)** ✅

---

**Quick Reference Last Updated:** October 19, 2025  
**Maintained By:** Frontend React Team  
**Status:** Production Ready 🚀
