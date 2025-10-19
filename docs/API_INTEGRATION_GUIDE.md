# Backend API Integration Guide

Complete guide for using the backend API service layer in the React frontend.

**Reference:** API_DOCUMENTATION_COMPLETE.md

## Table of Contents

1. [Overview](#overview)
2. [Authentication Service](#authentication-service)
3. [User Profile Service](#user-profile-service)
4. [Admin Service](#admin-service)
5. [GDPR Service](#gdpr-service)
6. [Audit Service](#audit-service)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Overview

The API service layer provides a clean, type-safe interface to the backend APIs.
All services are located in `src/services/api/` and can be imported individually or as a group.

### Quick Start

```typescript
import { api } from '@services/api';

// Authentication
const login = await api.auth.login({ email: 'user@example.com', password: 'pass' });

// User Profile
const profile = await api.profile.getCurrentProfile();

// Admin
const users = await api.admin.getUsers();

// GDPR
const export = await api.gdpr.exportMyData();

// Audit
const logs = await api.audit.getAuditLogs();
```

---

## Authentication Service

**Location:** `src/services/api/auth.service.ts`

**Reference:** API_DOCUMENTATION_COMPLETE.md - Authentication APIs (Section 2-3)

### Service Methods

#### Login

```typescript
const response = await api.auth.login({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});
// Returns: { token, user, message }
```

#### Secure Login (httpOnly Cookies)

```typescript
const response = await api.auth.loginSecure({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});
// Recommended for maximum security against XSS attacks
```

#### Registration

```typescript
const response = await api.auth.register({
  email: 'newuser@example.com',
  password: 'SecurePassword123!',
  confirm_password: 'SecurePassword123!',
  first_name: 'Jane',
  last_name: 'Smith',
});
```

#### Email Verification

```typescript
await api.auth.verifyEmail('verification-token-from-email');
```

#### Forgot Password

```typescript
await api.auth.forgotPassword('user@example.com');
```

#### Reset Password

```typescript
await api.auth.resetPassword({
  token: 'password-reset-token',
  new_password: 'NewSecurePassword123!',
  confirm_password: 'NewSecurePassword123!',
});
```

#### Change Password

```typescript
await api.auth.changePassword({
  current_password: 'CurrentPassword123!',
  new_password: 'NewSecurePassword456!',
});
```

#### Logout

```typescript
await api.auth.logout();
```

#### Check Authentication

```typescript
const isAuth = api.auth.isAuthenticated();
```

---

## User Profile Service

**Location:** `src/services/api/profile.service.ts`

**Reference:** API_DOCUMENTATION_COMPLETE.md - User Profile APIs (Section 4)

### Service Methods

#### Get Current Profile

```typescript
const profile = await api.profile.getCurrentProfile();
// Returns full user profile with preferences
```

#### Update Profile

```typescript
const updated = await api.profile.updateProfile({
  first_name: 'John',
  last_name: 'Doe',
  bio: 'Updated bio',
  avatar_url: 'https://example.com/avatar.jpg',
});
```

#### Update Theme

```typescript
await api.profile.updateTheme('dark'); // 'light', 'dark', 'system'
```

#### Update Language

```typescript
await api.profile.updateLanguage('en'); // 'en', 'es', 'fr', etc.
```

#### Update Notifications

```typescript
await api.profile.updateNotifications({
  enabledNotifications: true,
  emailNotifications: false,
});
```

---

## Admin Service

**Location:** `src/services/api/admin.service.ts`

**Reference:** API_DOCUMENTATION_COMPLETE.md - Admin APIs (Sections 5-7)

**Requires admin role for all operations**

### User Management

#### List All Users

```typescript
const users = await api.admin.getUsers({
  skip: 0,
  limit: 20,
  sort_by: 'created_at',
  order: 'desc',
});
```

#### Get User by ID

```typescript
const user = await api.admin.getUserById('user-123');
```

#### Create User

```typescript
const newUser = await api.admin.createUser({
  email: 'newuser@example.com',
  password: 'SecurePassword123!',
  first_name: 'Jane',
  last_name: 'Smith',
  roles: ['user'],
});
```

#### Update User

```typescript
const updated = await api.admin.updateUser('user-123', {
  first_name: 'Jane',
  is_active: true,
});
```

#### Delete User

```typescript
await api.admin.deleteUser('user-123');
```

#### Activate User

```typescript
await api.admin.activateUser('user-123');
```

#### Deactivate User

```typescript
await api.admin.deactivateUser('user-123', 'Account violation');
```

#### Approve User

```typescript
await api.admin.approveUser('user-123');
```

#### Reject User

```typescript
await api.admin.rejectUser('user-123', 'Does not meet requirements');
```

### Role Management

#### Get All Roles

```typescript
const roles = await api.admin.getRoles();
```

#### Create Role

```typescript
const newRole = await api.admin.createRole({
  name: 'moderator',
  description: 'Moderator role',
  permissions: ['read_posts', 'delete_posts', 'ban_users'],
});
```

#### Update Role

```typescript
await api.admin.updateRole('role-1', {
  description: 'Updated description',
  permissions: ['read_posts', 'create_posts', 'delete_posts'],
});
```

#### Delete Role

```typescript
await api.admin.deleteRole('role-1');
```

### Analytics

#### Get Statistics

```typescript
const stats = await api.admin.getStats();
// { total_users, active_users, new_users_today, ... }
```

#### Get User Analytics

```typescript
const analytics = await api.admin.getUserAnalytics();
// { total_users, active_users, engagement_score, ... }
```

---

## GDPR Service

**Location:** `src/services/api/gdpr.service.ts`

**Reference:** API_DOCUMENTATION_COMPLETE.md - GDPR Compliance APIs (Section 9)

Implements GDPR Article 15 (Right of Access) and Article 17 (Right to Erasure)

### Service Methods

#### Export User Data

```typescript
const exportData = await api.gdpr.exportMyData({
  format: 'json', // or 'csv'
  includeAuditLogs: true,
  includeMetadata: true,
});
// Returns: { export_id, status, download_url, ... }
```

#### Check Export Status

```typescript
const status = await api.gdpr.checkExportStatus('export-123');

if (status.status === 'completed') {
  // Download file from status.download_url
  window.location.href = status.download_url;
}
```

#### Delete Account

```typescript
// WARNING: This is PERMANENT and IRREVERSIBLE!
const result = await api.gdpr.deleteMyAccount(
  'CurrentPassword123!', // password (required)
  'DELETE MY ACCOUNT', // confirmation (exact string required)
  'No longer needed' // reason (optional)
);
// Account scheduled for deletion with 24-hour grace period
```

#### Cancel Deletion

```typescript
await api.gdpr.cancelAccountDeletion();
// Cancel deletion during grace period
```

#### Get Compliance Status

```typescript
const status = await api.gdpr.getComplianceStatus();
// Check if account is scheduled for deletion, export pending, etc.
```

---

## Audit Service

**Location:** `src/services/api/audit.service.ts`

**Reference:** API_DOCUMENTATION_COMPLETE.md - Audit Logging APIs (Section 8)

**Requires admin role for most operations**

### Service Methods

#### Get Audit Logs

```typescript
const logs = await api.audit.getAuditLogs({
  skip: 0,
  limit: 20,
  user_id: 'user-123',
  action: 'UPDATE_PROFILE',
  start_date: '2025-10-01T00:00:00Z',
  end_date: '2025-10-31T23:59:59Z',
});
```

#### Get Audit Summary

```typescript
const summary = await api.audit.getAuditSummary();
// { total_logs, security_events, recent_actions }
```

#### Get Logs by User

```typescript
const userLogs = await api.audit.getLogsByUser('user-123', { limit: 50 });
```

#### Get Logs by Action

```typescript
const actionLogs = await api.audit.getLogsByAction('DELETE_USER');
```

#### Get Logs by Date Range

```typescript
const rangedLogs = await api.audit.getLogsByDateRange(
  '2025-10-01T00:00:00Z',
  '2025-10-31T23:59:59Z'
);
```

#### Export Logs

```typescript
// Export as JSON
const jsonBlob = await api.audit.exportAuditLogs('json', { limit: 1000 });
const url = URL.createObjectURL(jsonBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'audit-logs.json';
link.click();

// Export as CSV
const csvBlob = await api.audit.exportAuditLogs('csv', { limit: 1000 });
```

#### Get Compliance Report

```typescript
const report = await api.audit.getComplianceReport('gdpr');
// { reportType, generatedAt, summary }
```

---

## Error Handling

All services throw ApiError on failure. Use try-catch for error handling:

```typescript
import { ApiError } from '@lib/api/error';

try {
  const user = await api.admin.getUserById('user-123');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);

    // Handle specific error codes
    if (error.code === 'AUTH_UNAUTHORIZED') {
      // Redirect to login
    } else if (error.code === 'NOT_FOUND') {
      // Show 404 message
    } else if (error.code === 'VALIDATION_ERROR') {
      // Show form validation errors
      console.error('Validation errors:', error.errors);
    }
  }
}
```

---

## Best Practices

### 1. Use Custom Hooks

Create custom hooks to wrap service calls and state management:

```typescript
// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { api } from '@services/api';

export function useUsers(params?: AdminUsersQuery) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.admin.getUsers(params)
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [params]);

  return { users, loading, error };
}

// Usage in component
function UserList() {
  const { users, loading } = useUsers({ limit: 20 });
  return <div>{/* render users */}</div>;
}
```

### 2. Handle Loading States

```typescript
const [loading, setLoading] = useState(false);

const handleDelete = async (userId: string) => {
  setLoading(true);
  try {
    await api.admin.deleteUser(userId);
    toast.success('User deleted');
  } catch (error) {
    toast.error('Failed to delete user');
  } finally {
    setLoading(false);
  }
};
```

### 3. Use Proper TypeScript

```typescript
import type { UserSummary, AdminUsersQuery } from '@services/api';

const users: UserSummary[] = await api.admin.getUsers(params);
```

### 4. Validate Input Before API Calls

```typescript
if (!email || !password) {
  return toast.error('Email and password required');
}

await api.auth.login({ email, password });
```

### 5. Cache When Appropriate

```typescript
const cache = new Map<string, UserSummary>();

async function getUser(userId: string): Promise<UserSummary> {
  if (cache.has(userId)) {
    return cache.get(userId)!;
  }

  const user = await api.admin.getUserById(userId);
  cache.set(userId, user);
  return user;
}
```

### 6. Debounce Frequently Called Functions

```typescript
import { debounce } from 'lodash-es';

const debouncedSearch = debounce((query: string) => {
  return api.admin.getUsers({ skip: 0, limit: 20 });
}, 300);
```

### 7. Use Request Timeout

```typescript
const response = await apiClient.execute('/endpoint', {
  method: 'GET',
  timeout: 5000, // 5 seconds
});
```

### 8. Implement Retry Logic

The API client automatically retries transient errors (5xx, network errors)
with exponential backoff. No additional implementation needed!

---

## Summary

The API service layer provides:

- Type-safe service methods for all backend APIs
- Automatic error handling and logging
- Request deduplication and retry logic
- Rate limiting awareness
- CSRF protection for secure endpoints
- Proper TypeScript types for all requests and responses

For more details, see:

- API_DOCUMENTATION_COMPLETE.md - Complete API specification
- src/services/api/ - Service implementations
- src/lib/api/client.ts - ApiClient implementation
