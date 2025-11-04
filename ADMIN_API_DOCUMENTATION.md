# Admin API Documentation for React Frontend

> **Version**: 1.0  
> **Last Updated**: November 3, 2025  
> **Base URL**: `/api/v1/admin`  
> **Authentication**: Required (Admin role)

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Common Response Formats](#common-response-formats)
4. [Error Handling](#error-handling)
5. [User Management Endpoints](#user-management-endpoints)
6. [User Approval Endpoints](#user-approval-endpoints)
7. [Role Management Endpoints](#role-management-endpoints)
8. [Analytics & Statistics](#analytics--statistics)
9. [Audit Logs](#audit-logs)
10. [TypeScript Types](#typescript-types)

---

## Overview

The Admin API provides comprehensive user management, role management, analytics, and audit capabilities for administrators. All endpoints require admin authentication and appropriate permissions.

### Key Features
- Complete user lifecycle management (CRUD operations)
- User approval/rejection workflows
- Role-based access control (RBAC) management
- Real-time analytics and statistics
- Comprehensive audit logging
- Bulk operations support

### Base Configuration

```typescript
const ADMIN_API_CONFIG = {
  baseURL: '/api/v1/admin',
  timeout: 30000, // 30 seconds for admin operations
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {access_token}'
  }
};
```

---

## Authentication & Authorization

### Required Headers

Every admin API request MUST include:

```typescript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

### Admin Role Requirements

| Endpoint Category | Required Role | Required Permission |
|------------------|---------------|---------------------|
| User Management | `admin` | `admin:users` |
| User Approval | `admin` | `admin:approve` |
| Role Management | `admin` | `admin:roles` |
| Analytics | `admin` | `admin:stats` |
| Audit Logs | `admin`, `auditor` | `admin:audit` |

### Permission Hierarchy

```
System Roles:
├── admin (Full access to all admin endpoints)
├── manager (Read access to users, limited write)
├── auditor (Read-only access to audit logs)
└── user (No admin access)
```

---

## Common Response Formats

### Standard Success Response

```typescript
{
  "success": true,
  "message": "Operation completed successfully",
  "message_code": "SUCCESS",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": {
    // Response-specific data
  },
  "errors": null,
  "field_errors": null,
  "request_id": "req_abc123xyz",
  "api_version": "v1"
}
```

### Pagination Response

```typescript
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "total_pages": 10,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

## Error Handling

### Error Response Structure

```typescript
{
  "success": false,
  "message": "Error description",
  "message_code": "ERROR_CODE",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": ["General error message"],
  "field_errors": {
    "field_name": ["Field-specific error"]
  },
  "request_id": "req_abc123xyz",
  "api_version": "v1"
}
```

### Common Error Codes

| Code | Status | Description | Retry |
|------|--------|-------------|-------|
| `PERMISSION_DENIED` | 403 | Insufficient admin permissions | No |
| `USER_NOT_FOUND` | 404 | User does not exist | No |
| `USER_LIST_FAILED` | 500 | Failed to retrieve user list | Yes |
| `CREATION_FAILED` | 500 | User creation failed | Yes |
| `APPROVAL_FAILED` | 500 | User approval failed | Yes |
| `USER_UPDATE_FAILED` | 500 | User update failed | Yes |
| `USER_DELETE_FAILED` | 500 | User deletion failed | Yes |
| `SELF_DELETE_FORBIDDEN` | 403 | Cannot delete own account | No |
| `VALIDATION_ERROR` | 422 | Input validation failed | No |
| `ALREADY_EXISTS` | 409 | User already exists | No |

---

## User Management Endpoints

### 1. List Users

**Endpoint**: `GET /api/v1/admin/users`

**Description**: Retrieve a paginated list of all users with optional filtering capabilities.

**Authentication**: Required (Admin role)

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (minimum: 1) |
| `limit` | integer | No | 10 | Items per page (min: 1, max: 100) |
| `role` | string | No | null | Filter by role (checks if user has this role) |
| `is_active` | boolean | No | null | Filter by active status |
| `is_verified` | boolean | No | null | Filter by email verification status |
| `is_approved` | boolean | No | null | Filter by admin approval status |

**Request Examples**:

```bash
# Get all users (page 1, 10 items)
GET /api/v1/admin/users

# Get page 2 with 20 items
GET /api/v1/admin/users?page=2&limit=20

# Get all admin users
GET /api/v1/admin/users?role=admin

# Get all active users
GET /api/v1/admin/users?is_active=true

# Get all verified admin users
GET /api/v1/admin/users?role=admin&is_verified=true

# Get all pending approval users
GET /api/v1/admin/users?is_approved=false

# Complex filter: Active, verified users, page 2
GET /api/v1/admin/users?is_active=true&is_verified=true&page=2&limit=25
```

**TypeScript Request**:

```typescript
interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: 'admin' | 'manager' | 'user' | 'auditor' | string;
  is_active?: boolean;
  is_verified?: boolean;
  is_approved?: boolean;
}

async function listUsers(params: ListUsersParams = {}): Promise<UserListResponse[]> {
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  ).toString();
  
  const response = await fetch(`/api/v1/admin/users?${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw await response.json();
  }
  
  return response.json();
}
```

**Success Response** (200 OK):

```json
[
  {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "roles": ["user", "manager"],
    "is_active": true,
    "is_verified": true,
    "is_approved": true,
    "approved_by": "admin@example.com",
    "approved_at": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login_at": "2024-01-20T15:45:00.000Z"
  },
  {
    "user_id": "987e6543-e21b-43d3-a654-426614174001",
    "email": "jane.smith@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "roles": ["user"],
    "is_active": true,
    "is_verified": true,
    "is_approved": false,
    "approved_by": null,
    "approved_at": null,
    "created_at": "2024-01-18T08:20:00.000Z",
    "last_login_at": null
  }
]
```

**Response Fields**:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `user_id` | string (UUID) | No | Unique user identifier |
| `email` | string | No | User email address |
| `first_name` | string | No | User's first name |
| `last_name` | string | No | User's last name |
| `roles` | string[] | No | Array of role names assigned to user |
| `is_active` | boolean | No | Account active status |
| `is_verified` | boolean | No | Email verification status |
| `is_approved` | boolean | No | Admin approval status |
| `approved_by` | string | Yes | Email of admin who approved |
| `approved_at` | string (ISO 8601) | Yes | Approval timestamp |
| `created_at` | string (ISO 8601) | No | Account creation timestamp |
| `last_login_at` | string (ISO 8601) | Yes | Last successful login timestamp |

**Error Responses**:

**401 Unauthorized** - Missing or invalid token:
```json
{
  "success": false,
  "message": "Authentication credentials are required",
  "message_code": "AUTH_REQUIRED",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": null,
  "request_id": "req_abc123",
  "api_version": "v1"
}
```

**403 Forbidden** - Insufficient permissions:
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "message_code": "PERMISSION_DENIED",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": null,
  "request_id": "req_abc124",
  "api_version": "v1"
}
```

**422 Unprocessable Entity** - Invalid query parameters:
```json
{
  "success": false,
  "message": "Validation failed",
  "message_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "page": ["Page must be greater than or equal to 1"],
    "limit": ["Limit must be between 1 and 100"]
  },
  "request_id": "req_abc125",
  "api_version": "v1"
}
```

**500 Internal Server Error** - Server error:
```json
{
  "success": false,
  "message": "Failed to retrieve user list",
  "message_code": "USER_LIST_FAILED",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": ["Database connection error"],
  "field_errors": null,
  "request_id": "req_abc126",
  "api_version": "v1"
}
```

**Edge Cases & Special Scenarios**:

1. **Empty Result Set**:
   ```json
   []
   ```
   Returns empty array when no users match filters.

2. **Invalid Role Filter**:
   - Non-existent roles are ignored
   - Returns all users if role doesn't exist

3. **Multiple Role Users**:
   - Users with `roles: ["admin", "user"]` will match `?role=admin` OR `?role=user`
   - Role filter checks if user HAS the specified role (not exclusive match)

4. **Pagination Edge Cases**:
   - Requesting page beyond available data returns empty array
   - Limit=1 returns single user per page
   - Limit=100 enforces maximum

5. **Boolean Filter Variations**:
   - `is_active=true` - Only active users
   - `is_active=false` - Only inactive users
   - No parameter - All users (both active and inactive)

**Rate Limiting**:
- 100 requests per minute per admin user
- Returns 429 Too Many Requests if exceeded

**Caching**:
- Response cached for 30 seconds
- Cache invalidated on user create/update/delete operations

---

### 2. Create User

**Endpoint**: `POST /api/v1/admin/users`

**Description**: Create a new user account with admin privileges. Admin-created users are automatically verified and approved.

**Authentication**: Required (Admin role)

**Request Body**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | Yes | Valid email format, max 254 chars | User email address |
| `password` | string | Yes | 8-128 chars, strength requirements | User password |
| `first_name` | string | Yes | 1-50 chars, letters/spaces/-/' | User's first name |
| `last_name` | string | Yes | 1-50 chars, letters/spaces/-/' | User's last name |
| `roles` | string[] | No | Valid role names | User roles (default: ["user"]) |
| `is_active` | boolean | No | - | Account status (default: true) |

**Password Requirements**:
- Minimum 8 characters, maximum 128 characters
- Must contain at least one uppercase letter (A-Z)
- Must contain at least one lowercase letter (a-z)
- Must contain at least one digit (0-9)
- Must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Cannot contain common patterns (123456, password, qwerty, etc.)

**Available Roles**:
- `user` - Standard user access
- `admin` - Full administrative access
- `manager` - Limited administrative access
- `auditor` - Read-only audit access

**Request Example**:

```bash
POST /api/v1/admin/users
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "email": "newuser@company.com",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "roles": ["user", "manager"],
  "is_active": true
}
```

**TypeScript Request**:

```typescript
interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  roles?: string[];
  is_active?: boolean;
}

interface CreateUserResponse {
  user_id: string;
  email: string;
  message: string;
}

async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  const response = await fetch('/api/v1/admin/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  
  return response.json();
}

// Usage example
try {
  const result = await createUser({
    email: 'john.doe@company.com',
    password: 'SecurePass123!',
    first_name: 'John',
    last_name: 'Doe',
    roles: ['user'],
    is_active: true
  });
  
  console.log('User created:', result.user_id);
} catch (error) {
  console.error('Creation failed:', error);
}
```

**Success Response** (201 Created):

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "newuser@company.com",
  "message": "User created successfully"
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string (UUID) | Unique identifier for the created user |
| `email` | string | Email address of the created user |
| `message` | string | Success confirmation message |

**Error Responses**:

**400 Bad Request** - Invalid input:
```json
{
  "success": false,
  "message": "Validation failed",
  "message_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "email": ["Invalid email format"],
    "password": [
      "Password must be at least 8 characters",
      "Password must contain at least one uppercase letter",
      "Password must contain at least one digit"
    ],
    "first_name": ["First name cannot be empty"],
    "last_name": ["Last name must be between 1 and 50 characters"]
  },
  "request_id": "req_create_001",
  "api_version": "v1"
}
```

**409 Conflict** - User already exists:
```json
{
  "success": false,
  "message": "Email address already registered",
  "message_code": "ALREADY_EXISTS",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": [
    {
      "field": "email",
      "value": "existing@company.com"
    }
  ],
  "errors": null,
  "field_errors": null,
  "request_id": "req_create_002",
  "api_version": "v1"
}
```

**422 Unprocessable Entity** - Invalid roles:
```json
{
  "success": false,
  "message": "User validation failed",
  "message_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "roles": ["Invalid role: 'superadmin'. Allowed roles: user, admin, manager, auditor"]
  },
  "request_id": "req_create_003",
  "api_version": "v1"
}
```

**500 Internal Server Error** - Creation failed:
```json
{
  "success": false,
  "message": "Failed to create user",
  "message_code": "CREATION_FAILED",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": [
    {
      "field": "email",
      "value": "newuser@company.com"
    }
  ],
  "errors": ["Database operation failed"],
  "field_errors": null,
  "request_id": "req_create_004",
  "api_version": "v1"
}
```

**Edge Cases & Special Scenarios**:

1. **Automatic Verification & Approval**:
   - Admin-created users have `is_verified=true` automatically
   - Admin-created users have `is_approved=true` automatically
   - No email verification required for admin-created accounts

2. **Default Values**:
   - If `roles` omitted: defaults to `["user"]`
   - If `is_active` omitted: defaults to `true`

3. **Multiple Roles**:
   - Users can have multiple roles: `["user", "manager", "auditor"]`
   - Duplicate roles are automatically deduplicated
   - Role order doesn't matter for permissions

4. **Email Normalization**:
   - Email is converted to lowercase automatically
   - Leading/trailing whitespace is trimmed
   - Example: `" John.Doe@COMPANY.COM "` → `john.doe@company.com`

5. **Name Sanitization**:
   - Names are trimmed of leading/trailing whitespace
   - Multiple consecutive spaces are reduced to single space
   - XSS-dangerous characters are escaped

6. **Password Security**:
   - Password is hashed using bcrypt before storage
   - Original password is never stored or logged
   - Password strength is calculated (0-100 score)

7. **Concurrent Creation Attempts**:
   - If two admins create same email simultaneously
   - First request succeeds, second gets 409 Conflict
   - Use unique email validation before submission

8. **Event Publishing**:
   - Triggers `USER_CREATED` event on success
   - Event includes: user_id, email, created_by (admin_id)
   - Webhooks and integrations receive notification

**Validation Rules in Detail**:

**Email Validation**:
```typescript
{
  "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
  "max_length": 254,
  "case_sensitive": false,
  "examples": {
    "valid": [
      "user@example.com",
      "john.doe+test@company.co.uk",
      "admin@sub.domain.com"
    ],
    "invalid": [
      "plaintext",
      "@nodomain.com",
      "user@",
      "user @domain.com" // space not allowed
    ]
  }
}
```

**Name Validation**:
```typescript
{
  "pattern": "^[a-zA-Z\\s'-]+$",
  "min_length": 1,
  "max_length": 50,
  "allowed_chars": "letters, spaces, hyphens, apostrophes",
  "examples": {
    "valid": [
      "John",
      "Mary-Jane",
      "O'Connor",
      "Jean-Claude Van Damme"
    ],
    "invalid": [
      "John123", // numbers not allowed
      "John@Smith", // special chars not allowed
      "", // empty not allowed
      "A".repeat(51) // too long
    ]
  }
}
```

**Rate Limiting**:
- 20 user creations per hour per admin
- 429 Too Many Requests if exceeded
- Counter resets hourly

**Best Practices**:

1. **Pre-validate Input**:
   ```typescript
   function validateEmail(email: string): boolean {
     const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
     return regex.test(email) && email.length <= 254;
   }
   
   function validatePassword(password: string): string[] {
     const errors: string[] = [];
     if (password.length < 8) errors.push('Too short');
     if (!/[A-Z]/.test(password)) errors.push('Missing uppercase');
     if (!/[a-z]/.test(password)) errors.push('Missing lowercase');
     if (!/[0-9]/.test(password)) errors.push('Missing digit');
     if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
       errors.push('Missing special character');
     }
     return errors;
   }
   ```

2. **Handle Errors Gracefully**:
   ```typescript
   try {
     await createUser(userData);
     showSuccessMessage('User created successfully');
   } catch (error) {
     if (error.message_code === 'ALREADY_EXISTS') {
       showError('User with this email already exists');
     } else if (error.field_errors) {
       showFieldErrors(error.field_errors);
     } else {
       showError('Failed to create user. Please try again.');
     }
   }
   ```

3. **Check Duplicate Before Submit**:
   ```typescript
   async function checkEmailExists(email: string): Promise<boolean> {
     const users = await listUsers({ limit: 1 });
     return users.some(u => u.email.toLowerCase() === email.toLowerCase());
   }
   ```

---

### 3. Get User Details

**Endpoint**: `GET /api/v1/admin/users/{user_id}`

**Description**: Retrieve detailed information about a specific user including all profile fields, login statistics, and account status.

**Authentication**: Required (Admin role)

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string (UUID) | Yes | Unique user identifier |

**Request Examples**:

```bash
# Get user by ID
GET /api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGc...
```

**TypeScript Request**:

```typescript
interface UserDetailResponse {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
  login_count: number;
}

async function getUserDetails(userId: string): Promise<UserDetailResponse> {
  const response = await fetch(`/api/v1/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw await response.json();
  }
  
  return response.json();
}

// Usage with error handling
try {
  const user = await getUserDetails('123e4567-e89b-12d3-a456-426614174000');
  console.log('User:', user.email, 'Login count:', user.login_count);
} catch (error) {
  if (error.message_code === 'USER_NOT_FOUND') {
    console.error('User does not exist');
  } else {
    console.error('Failed to fetch user:', error.message);
  }
}
```

**Success Response** (200 OK):

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "roles": ["user", "manager"],
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "approved_by": "admin@example.com",
  "approved_at": "2024-01-15T10:30:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-20T14:25:00.000Z",
  "last_login_at": "2024-01-22T09:15:00.000Z",
  "login_count": 47
}
```

**Response Fields**:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `user_id` | string (UUID) | No | Unique user identifier |
| `email` | string | No | User email address (lowercased) |
| `first_name` | string | No | User's first name |
| `last_name` | string | No | User's last name |
| `roles` | string[] | No | Array of assigned role names |
| `is_active` | boolean | No | Account active status (true = can login) |
| `is_verified` | boolean | No | Email verification status |
| `is_approved` | boolean | No | Admin approval status (for self-registered users) |
| `approved_by` | string | Yes | Email of admin who approved account (null if auto-approved or pending) |
| `approved_at` | string (ISO 8601) | Yes | Timestamp when approved (null if pending) |
| `created_at` | string (ISO 8601) | No | Account creation timestamp |
| `updated_at` | string (ISO 8601) | Yes | Last profile update timestamp (null if never updated) |
| `last_login_at` | string (ISO 8601) | Yes | Most recent successful login timestamp (null if never logged in) |
| `login_count` | integer | No | Total number of successful logins (0 for new accounts) |

**Error Responses**:

**404 Not Found** - User doesn't exist:
```json
{
  "success": false,
  "message": "User not found",
  "message_code": "USER_NOT_FOUND",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": [
    {
      "field": "user_id",
      "value": "123e4567-e89b-12d3-a456-426614174000"
    }
  ],
  "errors": null,
  "field_errors": null,
  "request_id": "req_get_001",
  "api_version": "v1"
}
```

**400 Bad Request** - Invalid UUID format:
```json
{
  "success": false,
  "message": "Validation failed",
  "message_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "user_id": ["Invalid UUID format"]
  },
  "request_id": "req_get_002",
  "api_version": "v1"
}
```

**500 Internal Server Error** - Retrieval failed:
```json
{
  "success": false,
  "message": "Failed to retrieve user details",
  "message_code": "USER_DETAIL_FAILED",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": [
    {
      "field": "user_id",
      "value": "123e4567-e89b-12d3-a456-426614174000"
    }
  ],
  "errors": ["Database query timeout"],
  "field_errors": null,
  "request_id": "req_get_003",
  "api_version": "v1"
}
```

**Edge Cases & Special Scenarios**:

1. **Never Logged In Users**:
   ```json
   {
     "last_login_at": null,
     "login_count": 0
   }
   ```
   New users who haven't logged in yet.

2. **Pending Approval Users**:
   ```json
   {
     "is_approved": false,
     "approved_by": null,
     "approved_at": null
   }
   ```
   Self-registered users waiting for admin approval.

3. **Inactive Accounts**:
   ```json
   {
     "is_active": false
   }
   ```
   - Cannot login
   - May still appear in user lists
   - Can be reactivated by admin

4. **Multiple Roles**:
   ```json
   {
     "roles": ["user", "manager", "auditor"]
   }
   ```
   Users can have multiple roles with cumulative permissions.

5. **Admin-Created vs Self-Registered**:
   - **Admin-created**: `is_verified=true`, `is_approved=true`, `approved_by=<admin_email>`
   - **Self-registered**: `is_verified=false`, `is_approved=false`, `approved_by=null`

6. **Timestamp Precision**:
   - All timestamps are in ISO 8601 format with milliseconds
   - Timezone is always UTC (Z suffix)
   - Example: `2024-01-22T09:15:30.123Z`

**Use Cases**:

1. **User Profile Display**:
   ```typescript
   const user = await getUserDetails(userId);
   return (
     <UserProfile
       name={`${user.first_name} ${user.last_name}`}
       email={user.email}
       roles={user.roles}
       status={user.is_active ? 'Active' : 'Inactive'}
       lastLogin={user.last_login_at ? new Date(user.last_login_at) : null}
     />
   );
   ```

2. **Account Status Check**:
   ```typescript
   async function canUserLogin(userId: string): Promise<boolean> {
     const user = await getUserDetails(userId);
     return user.is_active && user.is_verified && user.is_approved;
   }
   ```

3. **Role Verification**:
   ```typescript
   async function hasRole(userId: string, role: string): Promise<boolean> {
     const user = await getUserDetails(userId);
     return user.roles.includes(role);
   }
   ```

4. **Activity Monitoring**:
   ```typescript
   async function getUserActivity(userId: string) {
     const user = await getUserDetails(userId);
     const daysSinceLastLogin = user.last_login_at
       ? Math.floor((Date.now() - new Date(user.last_login_at).getTime()) / (1000 * 60 * 60 * 24))
       : null;
     
     return {
       loginCount: user.login_count,
       lastLogin: user.last_login_at,
       isInactive: daysSinceLastLogin !== null && daysSinceLastLogin > 90,
       accountAge: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
     };
   }
   ```

**Performance Notes**:
- Response time: < 100ms (typical)
- No complex joins required
- Direct DynamoDB query by primary key
- Can be cached for 1 minute

**Rate Limiting**:
- 200 requests per minute per admin
- Shared with list users endpoint

---

### 4. Update User

**Endpoint**: `PUT /api/v1/admin/users/{user_id}`

**Description**: Update user profile information, roles, and account status. Supports partial updates (only provided fields are updated).

**Authentication**: Required (Admin role)

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string (UUID) | Yes | Unique user identifier |

**Request Body** (All fields optional - partial update):

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `first_name` | string | No | 1-50 chars, letters/spaces/-/' | Update first name |
| `last_name` | string | No | 1-50 chars, letters/spaces/-/' | Update last name |
| `roles` | string[] | No | Valid role names | Update user roles |
| `is_active` | boolean | No | true/false | Update account status |
| `is_verified` | boolean | No | true/false | Update verification status |

**Request Examples**:

```bash
# Update user roles
PUT /api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "roles": ["user", "manager"]
}

# Update account status
PUT /api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000
{
  "is_active": false
}

# Update multiple fields
PUT /api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000
{
  "first_name": "Jane",
  "last_name": "Doe-Smith",
  "roles": ["user", "auditor"],
  "is_active": true
}

# Promote user to admin
PUT /api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000
{
  "roles": ["user", "admin"]
}
```

**TypeScript Request**:

```typescript
interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  roles?: string[];
  is_active?: boolean;
  is_verified?: boolean;
}

async function updateUser(
  userId: string, 
  updates: UpdateUserRequest
): Promise<UserDetailResponse> {
  const response = await fetch(`/api/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    throw await response.json();
  }
  
  return response.json();
}

// Usage examples
try {
  // Deactivate user
  await updateUser('123e4567-e89b-12d3-a456-426614174000', {
    is_active: false
  });
  
  // Update roles
  await updateUser('123e4567-e89b-12d3-a456-426614174000', {
    roles: ['user', 'manager', 'auditor']
  });
  
  // Update name
  await updateUser('123e4567-e89b-12d3-a456-426614174000', {
    first_name: 'John',
    last_name: 'Smith-Jones'
  });
  
  console.log('User updated successfully');
} catch (error) {
  console.error('Update failed:', error.message);
}
```

**Success Response** (200 OK):

Returns complete updated user details:

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "first_name": "Jane",
  "last_name": "Doe-Smith",
  "roles": ["user", "auditor"],
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "approved_by": "admin@example.com",
  "approved_at": "2024-01-15T10:30:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-22T14:30:00.000Z",
  "last_login_at": "2024-01-22T09:15:00.000Z",
  "login_count": 47
}
```

**Note**: The response includes ALL user fields, not just updated ones. The `updated_at` timestamp reflects the time of this update.

**Error Responses**:

**404 Not Found** - User doesn't exist:
```json
{
  "success": false,
  "message": "User not found",
  "message_code": "USER_NOT_FOUND",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": [
    {
      "field": "user_id",
      "value": "123e4567-e89b-12d3-a456-426614174000"
    }
  ],
  "errors": null,
  "field_errors": null,
  "request_id": "req_update_001",
  "api_version": "v1"
}
```

**422 Unprocessable Entity** - Validation failed:
```json
{
  "success": false,
  "message": "User validation failed",
  "message_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "first_name": ["First name must be between 1 and 50 characters"],
    "roles": ["Invalid role: 'superadmin'. Allowed: user, admin, manager, auditor"]
  },
  "request_id": "req_update_002",
  "api_version": "v1"
}
```

**400 Bad Request** - Empty update:
```json
{
  "success": false,
  "message": "No fields provided for update",
  "message_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": null,
  "errors": ["Request body must contain at least one field to update"],
  "field_errors": null,
  "request_id": "req_update_003",
  "api_version": "v1"
}
```

**500 Internal Server Error** - Update failed:
```json
{
  "success": false,
  "message": "Failed to update user",
  "message_code": "USER_UPDATE_FAILED",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "data": [
    {
      "field": "user_id",
      "value": "123e4567-e89b-12d3-a456-426614174000"
    }
  ],
  "errors": ["Database write operation failed"],
  "field_errors": null,
  "request_id": "req_update_004",
  "api_version": "v1"
}
```

**Edge Cases & Special Scenarios**:

1. **Partial Updates**:
   - Only provided fields are updated
   - Omitted fields remain unchanged
   - Example: Updating only `is_active` doesn't affect name or roles

2. **Role Management**:
   ```json
   {
     "roles": ["user", "manager"]
   }
   ```
   - Replaces ALL existing roles (not additive)
   - To add a role, include existing roles plus new one
   - To remove all roles, send empty array `[]` (not recommended)
   - At least one role recommended for access control

3. **Account Deactivation**:
   ```json
   {
     "is_active": false
   }
   ```
   - User immediately loses access (active sessions invalidated)
   - User data preserved
   - Can be reactivated by setting `is_active: true`

4. **Email Verification Override**:
   ```json
   {
     "is_verified": true
   }
   ```
   - Admin can manually verify email
   - Useful for migrated accounts or support requests
   - No verification email sent

5. **Name Changes**:
   - Name changes are immediate
   - No email notification sent
   - Affects display name in all interfaces

6. **Event Publishing**:
   - Triggers `USER_UPDATED` event on success
   - Event includes changed fields only
   - Webhooks receive before/after values

7. **Concurrent Updates**:
   - Last write wins (no optimistic locking)
   - If two admins update simultaneously, second overwrites first
   - Consider implementing version checking for critical updates

8. **Self-Update Prevention**:
   - Admins CAN update their own account
   - No restriction on self-updates
   - Be cautious when changing own roles

**Important Behaviors**:

1. **Role Replacement vs Addition**:
   ```typescript
   // ❌ WRONG: This removes existing roles
   await updateUser(userId, {
     roles: ['admin'] // Removes 'user', 'manager' if they existed
   });
   
   // ✅ CORRECT: Fetch current roles first
   const user = await getUserDetails(userId);
   await updateUser(userId, {
     roles: [...user.roles, 'admin'] // Adds admin while keeping others
   });
   ```

2. **Status Changes**:
   ```typescript
   // Deactivate user
   await updateUser(userId, { is_active: false });
   // User can no longer login
   
   // Reactivate user
   await updateUser(userId, { is_active: true });
   // User can login again
   ```

3. **Verification Bypass**:
   ```typescript
   // Manually verify user (skip email verification)
   await updateUser(userId, { is_verified: true });
   ```

**Best Practices**:

1. **Fetch Before Update**:
   ```typescript
   async function addRole(userId: string, newRole: string) {
     const user = await getUserDetails(userId);
     if (!user.roles.includes(newRole)) {
       await updateUser(userId, {
         roles: [...user.roles, newRole]
       });
     }
   }
   ```

2. **Validate Before Update**:
   ```typescript
   function validateUpdate(updates: UpdateUserRequest): string[] {
     const errors: string[] = [];
     
     if (updates.first_name !== undefined) {
       if (updates.first_name.length < 1 || updates.first_name.length > 50) {
         errors.push('First name must be 1-50 characters');
       }
     }
     
     if (updates.roles !== undefined) {
       const validRoles = ['user', 'admin', 'manager', 'auditor'];
       const invalidRoles = updates.roles.filter(r => !validRoles.includes(r));
       if (invalidRoles.length > 0) {
         errors.push(`Invalid roles: ${invalidRoles.join(', ')}`);
       }
     }
     
     return errors;
   }
   ```

3. **Track Changes**:
   ```typescript
   async function updateWithAudit(userId: string, updates: UpdateUserRequest) {
     const before = await getUserDetails(userId);
     const after = await updateUser(userId, updates);
     
     // Log what changed
     const changes: Record<string, [any, any]> = {};
     for (const key of Object.keys(updates)) {
       if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
         changes[key] = [before[key], after[key]];
       }
     }
     
     console.log('User updated:', changes);
     return after;
   }
   ```

4. **Handle Errors**:
   ```typescript
   try {
     await updateUser(userId, updates);
     showSuccess('User updated successfully');
   } catch (error) {
     if (error.message_code === 'USER_NOT_FOUND') {
       showError('User no longer exists');
     } else if (error.field_errors) {
       showFieldErrors(error.field_errors);
     } else {
       showError('Failed to update user. Please try again.');
     }
   }
   ```

**Rate Limiting**:
- 50 updates per minute per admin
- 429 Too Many Requests if exceeded

**Permissions Required**:
- `admin:users:write` permission
- Admin role

**Cache Invalidation**:
- User details cache cleared on update
- User list cache cleared on update
- Takes effect immediately

---

## 5. Delete User

**Endpoint**: `DELETE /api/v1/admin/users/{user_id}`

**Description**: Permanently or soft-delete a user from the system. This operation requires careful consideration as it may affect related data and system integrity.

**Authorization**: Requires `admin` role

**Rate Limiting**: 100 requests per minute per admin

### Request

**Path Parameters**:
```typescript
interface DeleteUserPathParams {
  user_id: string; // UUID or email of user to delete
}
```

**Query Parameters**:
```typescript
interface DeleteUserQueryParams {
  soft_delete?: boolean;        // Default: true - Soft delete (disable) vs hard delete (remove)
  cascade?: boolean;            // Default: false - Delete related data (sessions, tokens, etc.)
  reason?: string;              // Reason for deletion (for audit trail)
  transfer_ownership_to?: string; // User ID to transfer owned resources to
  force?: boolean;              // Default: false - Force delete even if user has active sessions
}
```

**Example Requests**:

```typescript
// Soft delete (disable account)
const softDeleteUser = async (userId: string, reason: string) => {
  const response = await fetch(
    `/api/v1/admin/users/${userId}?soft_delete=true&reason=${encodeURIComponent(reason)}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`);
  }
  
  return response.json();
};

// Hard delete with cascade
const hardDeleteUser = async (userId: string) => {
  const response = await fetch(
    `/api/v1/admin/users/${userId}?soft_delete=false&cascade=true&force=true`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.json();
};

// Delete with ownership transfer
const deleteUserWithTransfer = async (
  userId: string,
  newOwnerId: string,
  reason: string
) => {
  const params = new URLSearchParams({
    soft_delete: 'false',
    cascade: 'true',
    transfer_ownership_to: newOwnerId,
    reason: reason
  });
  
  const response = await fetch(
    `/api/v1/admin/users/${userId}?${params}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
};
```

### Response

**Success Response (200 OK)**:

```json
{
  "status": "success",
  "message": "User deleted successfully",
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "deletion_type": "soft",
    "deleted_at": "2024-01-15T10:30:00Z",
    "deleted_by": "admin@example.com",
    "reason": "User requested account deletion",
    "cascade_operations": {
      "sessions_terminated": 3,
      "tokens_revoked": 5,
      "api_keys_disabled": 2,
      "notifications_sent": true
    },
    "ownership_transferred": false,
    "can_be_restored": true,
    "restoration_deadline": "2024-02-15T10:30:00Z"
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_xyz789"
  }
}
```

**Hard Delete Success (200 OK)**:

```json
{
  "status": "success",
  "message": "User permanently deleted",
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "deletion_type": "hard",
    "deleted_at": "2024-01-15T10:30:00Z",
    "deleted_by": "admin@example.com",
    "cascade_operations": {
      "sessions_terminated": 3,
      "tokens_revoked": 5,
      "api_keys_disabled": 2,
      "profile_data_deleted": true,
      "user_preferences_deleted": true,
      "activity_logs_retained": true,
      "audit_logs_retained": true
    },
    "ownership_transferred": true,
    "transferred_to": "456e4567-e89b-12d3-a456-426614174000",
    "can_be_restored": false
  }
}
```

### Error Responses

**Self-Delete Prevention (403 Forbidden)**:
```json
{
  "status": "error",
  "message": "Cannot delete your own admin account",
  "error_code": "SELF_DELETE_NOT_ALLOWED",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "admin_id": "123e4567-e89b-12d3-a456-426614174000",
    "suggestion": "Use another admin account to perform this operation"
  }
}
```

**User Not Found (404 Not Found)**:
```json
{
  "status": "error",
  "message": "User not found",
  "error_code": "USER_NOT_FOUND",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Active Sessions Exist (409 Conflict)**:
```json
{
  "status": "error",
  "message": "User has active sessions",
  "error_code": "ACTIVE_SESSIONS_EXIST",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "active_sessions": 3,
    "last_activity": "2024-01-15T10:25:00Z",
    "suggestion": "Use force=true to delete anyway or terminate sessions first"
  }
}
```

**Cannot Delete Super Admin (403 Forbidden)**:
```json
{
  "status": "error",
  "message": "Cannot delete super admin account",
  "error_code": "SUPER_ADMIN_DELETE_NOT_ALLOWED",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "role": "super_admin",
    "suggestion": "Super admin accounts require special deletion procedures"
  }
}
```

**Ownership Transfer Failed (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Ownership transfer failed",
  "error_code": "OWNERSHIP_TRANSFER_FAILED",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "transfer_to": "invalid-user-id",
    "reason": "Target user does not exist or is not eligible"
  }
}
```

### TypeScript Implementation

```typescript
interface DeleteUserOptions {
  softDelete?: boolean;
  cascade?: boolean;
  reason?: string;
  transferOwnershipTo?: string;
  force?: boolean;
}

interface DeleteUserResponse {
  status: 'success';
  message: string;
  data: {
    user_id: string;
    email: string;
    deletion_type: 'soft' | 'hard';
    deleted_at: string;
    deleted_by: string;
    reason?: string;
    cascade_operations: {
      sessions_terminated: number;
      tokens_revoked: number;
      api_keys_disabled: number;
      profile_data_deleted?: boolean;
      user_preferences_deleted?: boolean;
      activity_logs_retained?: boolean;
      audit_logs_retained?: boolean;
      notifications_sent?: boolean;
    };
    ownership_transferred: boolean;
    transferred_to?: string;
    can_be_restored: boolean;
    restoration_deadline?: string;
  };
  metadata?: {
    timestamp: string;
    request_id: string;
  };
}

// Delete user with confirmation
const deleteUserWithConfirmation = async (
  userId: string,
  options: DeleteUserOptions
): Promise<DeleteUserResponse> => {
  // Show confirmation dialog
  const confirmed = await showConfirmDialog({
    title: 'Delete User',
    message: `Are you sure you want to ${options.softDelete ? 'disable' : 'permanently delete'} this user?`,
    type: 'danger'
  });
  
  if (!confirmed) {
    throw new Error('User cancelled deletion');
  }
  
  const params = new URLSearchParams({
    soft_delete: String(options.softDelete ?? true),
    cascade: String(options.cascade ?? false),
    force: String(options.force ?? false)
  });
  
  if (options.reason) {
    params.append('reason', options.reason);
  }
  
  if (options.transferOwnershipTo) {
    params.append('transfer_ownership_to', options.transferOwnershipTo);
  }
  
  const response = await fetch(
    `/api/v1/admin/users/${userId}?${params}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Delete failed');
  }
  
  return response.json();
};

// Bulk delete with progress tracking
const bulkDeleteUsers = async (
  userIds: string[],
  options: DeleteUserOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<{ success: string[]; failed: Array<{ userId: string; error: string }> }> => {
  const results = {
    success: [] as string[],
    failed: [] as Array<{ userId: string; error: string }>
  };
  
  for (let i = 0; i < userIds.length; i++) {
    try {
      await deleteUserWithConfirmation(userIds[i], options);
      results.success.push(userIds[i]);
    } catch (error) {
      results.failed.push({
        userId: userIds[i],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    if (onProgress) {
      onProgress(i + 1, userIds.length);
    }
  }
  
  return results;
};
```

### Edge Cases & Special Scenarios

1. **Self-Delete Prevention**:
   - Admins cannot delete their own accounts
   - Returns 403 Forbidden error
   - Use different admin account for self-deletion

2. **Super Admin Protection**:
   - Super admin accounts cannot be deleted via API
   - Requires special console/database operations
   - Prevents accidental lockout

3. **Active Session Handling**:
   - By default, deletion fails if user has active sessions
   - Use `force=true` to override
   - All sessions terminated before deletion

4. **Cascade Operations**:
   - `cascade=true`: Deletes all related data
   - `cascade=false`: Keeps related data (may cause orphans)
   - Audit logs always retained

5. **Soft Delete Grace Period**:
   - Soft-deleted users can be restored within 30 days
   - After grace period, data may be permanently removed
   - Restoration deadline included in response

6. **Ownership Transfer**:
   - Transfer owned resources before deletion
   - Target user must exist and be active
   - Prevents data loss

### Best Practices

```typescript
// 1. Always use soft delete by default
const safeDeleteUser = async (userId: string, reason: string) => {
  return deleteUserWithConfirmation(userId, {
    softDelete: true,
    cascade: false,
    reason: reason
  });
};

// 2. Terminate sessions before deletion
const deleteUserSafely = async (userId: string) => {
  // First, terminate all sessions
  await fetch(`/api/v1/admin/users/${userId}/sessions`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  
  // Then delete user
  await deleteUserWithConfirmation(userId, {
    softDelete: true,
    cascade: true,
    force: false
  });
};

// 3. Provide clear audit trail
const deleteUserWithAudit = async (
  userId: string,
  reason: string,
  requestedBy: string
) => {
  const auditReason = `Requested by ${requestedBy}: ${reason}`;
  
  return deleteUserWithConfirmation(userId, {
    softDelete: true,
    reason: auditReason
  });
};

// 4. Handle deletion errors gracefully
const deleteUserWithRetry = async (
  userId: string,
  options: DeleteUserOptions,
  maxRetries = 3
): Promise<DeleteUserResponse> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await deleteUserWithConfirmation(userId, options);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on permission errors or not found
      if (error instanceof Error && 
          (error.message.includes('403') || error.message.includes('404'))) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw lastError || new Error('Delete failed after retries');
};

// 5. Show deletion impact before confirming
const showDeletionImpact = async (userId: string): Promise<void> => {
  const impact = await fetch(
    `/api/v1/admin/users/${userId}/deletion-impact`,
    {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }
  ).then(r => r.json());
  
  const message = `
    This will affect:
    - ${impact.active_sessions} active sessions
    - ${impact.api_keys} API keys
    - ${impact.owned_resources} owned resources
    - ${impact.team_memberships} team memberships
  `;
  
  console.log(message);
};
```

---

## 6. Approve User

**Endpoint**: `POST /api/v1/admin/users/{user_id}/approve`

**Description**: Approve a pending user registration. This activates the user account and sends a welcome email.

**Authorization**: Requires `admin` or `manager` role

**Rate Limiting**: 100 requests per minute per admin

### Request

**Path Parameters**:
```typescript
interface ApproveUserPathParams {
  user_id: string; // UUID of user to approve
}
```

**Request Body** (Optional):
```typescript
interface ApproveUserBody {
  welcome_message?: string;      // Custom welcome message
  initial_role?: string;          // Role to assign (default: 'user')
  send_welcome_email?: boolean;   // Default: true
  grant_trial_benefits?: boolean; // Grant trial period benefits
  trial_days?: number;            // Trial period duration (default: 30)
  notes?: string;                 // Internal notes for audit
}
```

**Example Requests**:

```typescript
// Simple approval
const approveUser = async (userId: string) => {
  const response = await fetch(
    `/api/v1/admin/users/${userId}/approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.json();
};

// Approval with custom role and message
const approveUserWithRole = async (
  userId: string,
  role: string,
  message: string
) => {
  const response = await fetch(
    `/api/v1/admin/users/${userId}/approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        initial_role: role,
        welcome_message: message,
        send_welcome_email: true
      })
    }
  );
  
  return response.json();
};

// Approval with trial benefits
const approveUserWithTrial = async (userId: string, trialDays: number) => {
  const response = await fetch(
    `/api/v1/admin/users/${userId}/approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_trial_benefits: true,
        trial_days: trialDays,
        notes: `Approved with ${trialDays}-day trial`
      })
    }
  );
  
  return response.json();
};
```

### Response

**Success Response (200 OK)**:

```json
{
  "status": "success",
  "message": "User approved successfully",
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "newuser@example.com",
    "username": "newuser",
    "status": "active",
    "role": "user",
    "approved_at": "2024-01-15T10:30:00Z",
    "approved_by": "admin@example.com",
    "welcome_email_sent": true,
    "trial_benefits": {
      "granted": true,
      "trial_ends_at": "2024-02-15T10:30:00Z",
      "benefits": ["premium_features", "priority_support"]
    },
    "initial_permissions": ["read", "write", "profile_update"]
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_xyz789"
  }
}
```

### Error Responses

**User Not Found (404 Not Found)**:
```json
{
  "status": "error",
  "message": "User not found",
  "error_code": "USER_NOT_FOUND",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Already Approved (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "User is already approved",
  "error_code": "USER_ALREADY_APPROVED",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "current_status": "active",
    "approved_at": "2024-01-10T08:00:00Z"
  }
}
```

**Invalid Role (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Invalid role specified",
  "error_code": "INVALID_ROLE",
  "details": {
    "provided_role": "super_admin",
    "allowed_roles": ["user", "manager"],
    "suggestion": "Use a valid role for initial assignment"
  }
}
```

**Email Send Failed (500 Internal Server Error)**:
```json
{
  "status": "error",
  "message": "User approved but welcome email failed",
  "error_code": "EMAIL_SEND_FAILED",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_status": "active",
    "email_error": "SMTP connection timeout",
    "suggestion": "User is approved but may need manual notification"
  }
}
```

### TypeScript Implementation

```typescript
interface ApproveUserRequest {
  welcome_message?: string;
  initial_role?: string;
  send_welcome_email?: boolean;
  grant_trial_benefits?: boolean;
  trial_days?: number;
  notes?: string;
}

interface ApproveUserResponse {
  status: 'success';
  message: string;
  data: {
    user_id: string;
    email: string;
    username: string;
    status: 'active';
    role: string;
    approved_at: string;
    approved_by: string;
    welcome_email_sent: boolean;
    trial_benefits?: {
      granted: boolean;
      trial_ends_at: string;
      benefits: string[];
    };
    initial_permissions: string[];
  };
}

// Approve single user
const approveUserAccount = async (
  userId: string,
  options?: ApproveUserRequest
): Promise<ApproveUserResponse> => {
  const response = await fetch(
    `/api/v1/admin/users/${userId}/approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: options ? JSON.stringify(options) : undefined
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Approval failed');
  }
  
  return response.json();
};

// Bulk approve users
const bulkApproveUsers = async (
  userIds: string[],
  options?: ApproveUserRequest,
  onProgress?: (completed: number, total: number) => void
): Promise<{ success: string[]; failed: Array<{ userId: string; error: string }> }> => {
  const results = {
    success: [] as string[],
    failed: [] as Array<{ userId: string; error: string }>
  };
  
  for (let i = 0; i < userIds.length; i++) {
    try {
      await approveUserAccount(userIds[i], options);
      results.success.push(userIds[i]);
    } catch (error) {
      results.failed.push({
        userId: userIds[i],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    if (onProgress) {
      onProgress(i + 1, userIds.length);
    }
    
    // Rate limiting: small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};
```

### Best Practices

```typescript
// 1. Validate before approval
const validateAndApprove = async (userId: string) => {
  // Check user details first
  const user = await fetch(`/api/v1/admin/users/${userId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }).then(r => r.json());
  
  if (user.data.status !== 'pending') {
    throw new Error('User is not in pending status');
  }
  
  // Proceed with approval
  return approveUserAccount(userId);
};

// 2. Handle email failures gracefully
const approveWithFallbackNotification = async (userId: string) => {
  try {
    return await approveUserAccount(userId, {
      send_welcome_email: true
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('EMAIL_SEND_FAILED')) {
      // Log for manual follow-up
      console.error('Welcome email failed, manual notification required');
      return { approved: true, email_failed: true };
    }
    throw error;
  }
};

// 3. Provide approval analytics
const approveWithTracking = async (userId: string, source: string) => {
  const startTime = Date.now();
  
  try {
    const result = await approveUserAccount(userId, {
      notes: `Approved via ${source}`
    });
    
    trackEvent('user_approved', {
      user_id: userId,
      duration_ms: Date.now() - startTime,
      source: source
    });
    
    return result;
  } catch (error) {
    trackEvent('user_approval_failed', {
      user_id: userId,
      error: error instanceof Error ? error.message : 'Unknown',
      source: source
    });
    throw error;
  }
};
```

---

## 7. Reject User

**Endpoint**: `POST /api/v1/admin/users/{user_id}/reject`

**Description**: Reject a pending user registration. This prevents the user from accessing the system and optionally sends a rejection notification.

**Authorization**: Requires `admin` or `manager` role

**Rate Limiting**: 100 requests per minute per admin

### Request

**Path Parameters**:
```typescript
interface RejectUserPathParams {
  user_id: string; // UUID of user to reject
}
```

**Request Body**:
```typescript
interface RejectUserBody {
  reason: string;                    // Required: Reason for rejection
  send_notification?: boolean;       // Default: true - Send rejection email
  block_email?: boolean;             // Default: false - Prevent future registrations
  custom_message?: string;           // Custom message for user
  allow_reapplication?: boolean;     // Default: true - Allow user to reapply
  reapplication_wait_days?: number;  // Wait period before reapplication (default: 0)
}
```

**Example Requests**:

```typescript
// Simple rejection
const rejectUser = async (userId: string, reason: string) => {
  const response = await fetch(
    `/api/v1/admin/users/${userId}/reject`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: reason
      })
    }
  );
  
  return response.json();
};

// Rejection with custom message
const rejectUserWithMessage = async (
  userId: string,
  reason: string,
  message: string
) => {
  const response = await fetch(
    `/api/v1/admin/users/${userId}/reject`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: reason,
        custom_message: message,
        send_notification: true,
        allow_reapplication: true
      })
    }
  );
  
  return response.json();
};

// Permanent rejection with email block
const permanentlyRejectUser = async (userId: string, reason: string) => {
  const response = await fetch(
    `/api/v1/admin/users/${userId}/reject`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: reason,
        block_email: true,
        allow_reapplication: false,
        send_notification: true
      })
    }
  );
  
  return response.json();
};
```

### Response

**Success Response (200 OK)**:

```json
{
  "status": "success",
  "message": "User rejected successfully",
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "rejected@example.com",
    "username": "rejecteduser",
    "status": "rejected",
    "rejected_at": "2024-01-15T10:30:00Z",
    "rejected_by": "admin@example.com",
    "rejection_reason": "Incomplete registration information",
    "notification_sent": true,
    "email_blocked": false,
    "can_reapply": true,
    "reapplication_available_at": "2024-01-15T10:30:00Z"
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_xyz789"
  }
}
```

**Permanent Rejection Response**:

```json
{
  "status": "success",
  "message": "User permanently rejected",
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "blocked@example.com",
    "status": "rejected",
    "rejected_at": "2024-01-15T10:30:00Z",
    "rejected_by": "admin@example.com",
    "rejection_reason": "Violation of terms of service",
    "email_blocked": true,
    "can_reapply": false,
    "notification_sent": true
  }
}
```

### Error Responses

**Missing Reason (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Rejection reason is required",
  "error_code": "MISSING_REJECTION_REASON",
  "details": {
    "required_field": "reason",
    "suggestion": "Provide a clear reason for rejection"
  }
}
```

**Already Processed (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "User has already been processed",
  "error_code": "USER_ALREADY_PROCESSED",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "current_status": "active",
    "processed_at": "2024-01-10T08:00:00Z",
    "suggestion": "Can only reject users with 'pending' status"
  }
}
```

### TypeScript Implementation

```typescript
interface RejectUserRequest {
  reason: string;
  send_notification?: boolean;
  block_email?: boolean;
  custom_message?: string;
  allow_reapplication?: boolean;
  reapplication_wait_days?: number;
}

interface RejectUserResponse {
  status: 'success';
  message: string;
  data: {
    user_id: string;
    email: string;
    username?: string;
    status: 'rejected';
    rejected_at: string;
    rejected_by: string;
    rejection_reason: string;
    notification_sent: boolean;
    email_blocked: boolean;
    can_reapply: boolean;
    reapplication_available_at?: string;
  };
}

// Reject user with reason
const rejectUserRegistration = async (
  userId: string,
  request: RejectUserRequest
): Promise<RejectUserResponse> => {
  if (!request.reason || request.reason.trim().length < 10) {
    throw new Error('Rejection reason must be at least 10 characters');
  }
  
  const response = await fetch(
    `/api/v1/admin/users/${userId}/reject`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Rejection failed');
  }
  
  return response.json();
};

// Bulk reject users
const bulkRejectUsers = async (
  userIds: string[],
  reason: string,
  options?: Partial<RejectUserRequest>
): Promise<{ success: string[]; failed: Array<{ userId: string; error: string }> }> => {
  const results = {
    success: [] as string[],
    failed: [] as Array<{ userId: string; error: string }>
  };
  
  for (const userId of userIds) {
    try {
      await rejectUserRegistration(userId, {
        reason,
        ...options
      });
      results.success.push(userId);
    } catch (error) {
      results.failed.push({
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};
```

### Best Practices

```typescript
// 1. Validate rejection reason
const validateAndReject = async (userId: string, reason: string) => {
  const minReasonLength = 10;
  const maxReasonLength = 500;
  
  if (reason.length < minReasonLength) {
    throw new Error(`Reason must be at least ${minReasonLength} characters`);
  }
  
  if (reason.length > maxReasonLength) {
    throw new Error(`Reason must not exceed ${maxReasonLength} characters`);
  }
  
  return rejectUserRegistration(userId, { reason });
};

// 2. Provide helpful rejection messages
const rejectWithGuidance = async (
  userId: string,
  reason: string,
  improvementTips: string[]
) => {
  const customMessage = `
    Your registration was not approved for the following reason:
    ${reason}
    
    To improve your application:
    ${improvementTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}
    
    You may reapply at any time after addressing these points.
  `;
  
  return rejectUserRegistration(userId, {
    reason,
    custom_message: customMessage,
    allow_reapplication: true
  });
};

// 3. Track rejection patterns
const rejectWithAnalytics = async (
  userId: string,
  reason: string,
  category: string
) => {
  try {
    const result = await rejectUserRegistration(userId, {
      reason: `[${category}] ${reason}`
    });
    
    trackEvent('user_rejected', {
      category,
      reason_length: reason.length,
      timestamp: new Date().toISOString()
    });
    
    return result;
  } catch (error) {
    trackEvent('rejection_failed', {
      category,
      error: error instanceof Error ? error.message : 'Unknown'
    });
    throw error;
  }
};
```

---

## 7. Role Management Endpoints

### 7.1 List All Roles

**Endpoint**: `GET /api/v1/admin/rbac/roles`

**Description**: Retrieves all roles in the system with their permissions and metadata.

**Required Role**: `admin` or `manager`

#### Request

**Query Parameters**:
```typescript
{
  include_permissions?: boolean;  // Include detailed permissions (default: true)
  include_users_count?: boolean;  // Include count of users with each role (default: false)
  status?: 'active' | 'inactive' | 'all';  // Filter by status (default: 'active')
}
```

**Headers**:
```
Authorization: Bearer {admin_token}
```

#### Responses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "role_id": "role_admin",
        "role_name": "admin",
        "display_name": "Administrator",
        "description": "Full system access",
        "level": 100,
        "status": "active",
        "permissions": [
          {
            "resource": "users",
            "actions": ["create", "read", "update", "delete"]
          },
          {
            "resource": "roles",
            "actions": ["create", "read", "update", "delete"]
          },
          {
            "resource": "audit_logs",
            "actions": ["read"]
          }
        ],
        "users_count": 5,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-10-15T10:30:00Z"
      },
      {
        "role_id": "role_manager",
        "role_name": "manager",
        "display_name": "Manager",
        "description": "User management access",
        "level": 50,
        "status": "active",
        "permissions": [
          {
            "resource": "users",
            "actions": ["create", "read", "update"]
          },
          {
            "resource": "audit_logs",
            "actions": ["read"]
          }
        ],
        "users_count": 12,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-09-20T14:20:00Z"
      },
      {
        "role_id": "role_auditor",
        "role_name": "auditor",
        "display_name": "Auditor",
        "description": "Read-only access for auditing",
        "level": 25,
        "status": "active",
        "permissions": [
          {
            "resource": "users",
            "actions": ["read"]
          },
          {
            "resource": "audit_logs",
            "actions": ["read"]
          }
        ],
        "users_count": 3,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-08-10T09:15:00Z"
      },
      {
        "role_id": "role_user",
        "role_name": "user",
        "display_name": "User",
        "description": "Standard user access",
        "level": 10,
        "status": "active",
        "permissions": [
          {
            "resource": "profile",
            "actions": ["read", "update"]
          }
        ],
        "users_count": 1543,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-07-05T16:45:00Z"
      }
    ],
    "total": 4,
    "metadata": {
      "hierarchy": ["admin", "manager", "auditor", "user"],
      "system_roles": ["admin", "user"],
      "custom_roles": ["manager", "auditor"]
    }
  },
  "timestamp": "2025-11-03T12:00:00Z"
}
```

**Error Responses**:

```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication token is required"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Admin or Manager role required to view roles"
  }
}
```

#### TypeScript Implementation

```typescript
interface RolePermission {
  resource: string;
  actions: string[];
}

interface Role {
  role_id: string;
  role_name: string;
  display_name: string;
  description: string;
  level: number;
  status: 'active' | 'inactive';
  permissions: RolePermission[];
  users_count?: number;
  created_at: string;
  updated_at: string;
}

interface ListRolesParams {
  include_permissions?: boolean;
  include_users_count?: boolean;
  status?: 'active' | 'inactive' | 'all';
}

const listRoles = async (params?: ListRolesParams): Promise<Role[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.include_permissions !== undefined) {
    queryParams.append('include_permissions', params.include_permissions.toString());
  }
  if (params?.include_users_count) {
    queryParams.append('include_users_count', 'true');
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }

  const response = await fetch(
    `/api/v1/admin/rbac/roles?${queryParams.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch roles: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data.roles;
};
```

---

### 7.2 Get Role Details

**Endpoint**: `GET /api/v1/admin/rbac/roles/{role_name}`

**Description**: Retrieves detailed information about a specific role.

**Required Role**: `admin` or `manager`

#### Request

**Path Parameters**:
- `role_name` (string, required): The name of the role (e.g., "admin", "manager")

**Query Parameters**:
```typescript
{
  include_users?: boolean;  // Include list of users with this role (default: false)
  users_limit?: number;     // Limit number of users returned (default: 50, max: 500)
}
```

#### Responses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "role": {
      "role_id": "role_manager",
      "role_name": "manager",
      "display_name": "Manager",
      "description": "User management access",
      "level": 50,
      "status": "active",
      "permissions": [
        {
          "resource": "users",
          "actions": ["create", "read", "update"],
          "conditions": {
            "cannot_modify_admin": true,
            "cannot_assign_admin_role": true
          }
        },
        {
          "resource": "audit_logs",
          "actions": ["read"],
          "conditions": {
            "own_actions_only": false
          }
        }
      ],
      "restrictions": [
        "Cannot delete users",
        "Cannot modify admin users",
        "Cannot assign admin role"
      ],
      "users_count": 12,
      "users": [
        {
          "user_id": "usr_abc123",
          "email": "manager1@example.com",
          "full_name": "John Manager",
          "assigned_at": "2024-08-15T10:00:00Z"
        }
        // ... more users if include_users=true
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-09-20T14:20:00Z",
      "created_by": "usr_admin001",
      "last_modified_by": "usr_admin001"
    }
  },
  "timestamp": "2025-11-03T12:00:00Z"
}
```

**Error Responses**:

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "ROLE_NOT_FOUND",
    "message": "Role 'custom_role' does not exist"
  }
}
```

#### TypeScript Implementation

```typescript
const getRoleDetails = async (
  roleName: string,
  options?: {
    include_users?: boolean;
    users_limit?: number;
  }
): Promise<Role> => {
  const queryParams = new URLSearchParams();
  
  if (options?.include_users) {
    queryParams.append('include_users', 'true');
    if (options.users_limit) {
      queryParams.append('users_limit', options.users_limit.toString());
    }
  }

  const response = await fetch(
    `/api/v1/admin/rbac/roles/${roleName}?${queryParams.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Role '${roleName}' not found`);
    }
    throw new Error(`Failed to fetch role details: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data.role;
};
```

---

### 7.3 Create Custom Role

**Endpoint**: `POST /api/v1/admin/rbac/roles`

**Description**: Creates a new custom role with specified permissions.

**Required Role**: `admin` (only admins can create roles)

#### Request

**Body Parameters**:
```json
{
  "role_name": "content_moderator",
  "display_name": "Content Moderator",
  "description": "Manages user-generated content",
  "level": 30,
  "permissions": [
    {
      "resource": "content",
      "actions": ["read", "update", "delete"]
    },
    {
      "resource": "users",
      "actions": ["read"]
    }
  ],
  "restrictions": [
    "Cannot access user financial data",
    "Cannot modify user credentials"
  ]
}
```

**Field Validation**:
- `role_name`: 3-50 characters, alphanumeric + underscore, must be unique
- `display_name`: 3-100 characters
- `description`: Optional, max 500 characters
- `level`: Integer between 1-99 (100 reserved for admin, 10 for user)
- `permissions`: Array of permission objects, at least one required
- `restrictions`: Optional array of restriction descriptions

#### Responses

**Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "role": {
      "role_id": "role_content_moderator",
      "role_name": "content_moderator",
      "display_name": "Content Moderator",
      "description": "Manages user-generated content",
      "level": 30,
      "status": "active",
      "permissions": [
        {
          "resource": "content",
          "actions": ["read", "update", "delete"]
        },
        {
          "resource": "users",
          "actions": ["read"]
        }
      ],
      "restrictions": [
        "Cannot access user financial data",
        "Cannot modify user credentials"
      ],
      "users_count": 0,
      "created_at": "2025-11-03T12:00:00Z",
      "updated_at": "2025-11-03T12:00:00Z",
      "created_by": "usr_admin001"
    }
  },
  "message": "Role 'content_moderator' created successfully",
  "timestamp": "2025-11-03T12:00:00Z"
}
```

**Error Responses**:

```json
// 400 Bad Request - Duplicate role name
{
  "success": false,
  "error": {
    "code": "ROLE_ALREADY_EXISTS",
    "message": "Role with name 'content_moderator' already exists",
    "field": "role_name"
  }
}

// 400 Bad Request - Invalid level
{
  "success": false,
  "error": {
    "code": "INVALID_ROLE_LEVEL",
    "message": "Role level must be between 1-99. Levels 100 (admin) and 10 (user) are reserved",
    "field": "level",
    "constraints": {
      "min": 1,
      "max": 99,
      "reserved": [10, 100]
    }
  }
}

// 400 Bad Request - Invalid permissions
{
  "success": false,
  "error": {
    "code": "INVALID_PERMISSIONS",
    "message": "At least one permission must be specified",
    "field": "permissions"
  }
}

// 400 Bad Request - Invalid resource
{
  "success": false,
  "error": {
    "code": "INVALID_RESOURCE",
    "message": "Resource 'invalid_resource' is not a valid system resource",
    "field": "permissions[0].resource",
    "valid_resources": ["users", "roles", "content", "audit_logs", "analytics"]
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Only admin users can create custom roles"
  }
}
```

#### TypeScript Implementation

```typescript
interface CreateRoleRequest {
  role_name: string;
  display_name: string;
  description?: string;
  level: number;
  permissions: RolePermission[];
  restrictions?: string[];
}

const createRole = async (roleData: CreateRoleRequest): Promise<Role> => {
  // Validate role name format
  if (!/^[a-z0-9_]{3,50}$/.test(roleData.role_name)) {
    throw new Error('Role name must be 3-50 characters, lowercase alphanumeric and underscore only');
  }

  // Validate level
  if (roleData.level < 1 || roleData.level > 99 || 
      roleData.level === 10 || roleData.level === 100) {
    throw new Error('Invalid role level. Must be 1-99, excluding reserved levels 10 and 100');
  }

  // Validate permissions
  if (!roleData.permissions || roleData.permissions.length === 0) {
    throw new Error('At least one permission must be specified');
  }

  const response = await fetch('/api/v1/admin/rbac/roles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(roleData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Failed to create role');
  }

  const result = await response.json();
  return result.data.role;
};

// Example: Create a content moderator role
const createContentModeratorRole = async () => {
  return createRole({
    role_name: 'content_moderator',
    display_name: 'Content Moderator',
    description: 'Manages user-generated content and handles reports',
    level: 30,
    permissions: [
      {
        resource: 'content',
        actions: ['read', 'update', 'delete']
      },
      {
        resource: 'users',
        actions: ['read']
      },
      {
        resource: 'reports',
        actions: ['read', 'update']
      }
    ],
    restrictions: [
      'Cannot access user financial data',
      'Cannot modify user credentials',
      'Cannot ban users without approval'
    ]
  });
};
```

---

### 7.4 Update Role

**Endpoint**: `PUT /api/v1/admin/rbac/roles/{role_name}`

**Description**: Updates an existing role's permissions, display name, or description.

**Required Role**: `admin`

**Note**: System roles (admin, user) cannot be modified. Only custom roles can be updated.

#### Request

**Path Parameters**:
- `role_name` (string, required): The name of the role to update

**Body Parameters** (all optional, partial updates supported):
```json
{
  "display_name": "Senior Content Moderator",
  "description": "Senior-level content management with additional privileges",
  "level": 35,
  "permissions": [
    {
      "resource": "content",
      "actions": ["read", "update", "delete", "publish"]
    },
    {
      "resource": "users",
      "actions": ["read", "suspend"]
    }
  ],
  "restrictions": [
    "Cannot access user financial data",
    "Can suspend users for max 7 days"
  ]
}
```

#### Responses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "role": {
      "role_id": "role_content_moderator",
      "role_name": "content_moderator",
      "display_name": "Senior Content Moderator",
      "description": "Senior-level content management with additional privileges",
      "level": 35,
      "status": "active",
      "permissions": [
        {
          "resource": "content",
          "actions": ["read", "update", "delete", "publish"]
        },
        {
          "resource": "users",
          "actions": ["read", "suspend"]
        }
      ],
      "restrictions": [
        "Cannot access user financial data",
        "Can suspend users for max 7 days"
      ],
      "users_count": 3,
      "created_at": "2025-11-03T12:00:00Z",
      "updated_at": "2025-11-03T14:30:00Z",
      "created_by": "usr_admin001",
      "last_modified_by": "usr_admin002"
    },
    "changes": {
      "display_name": {
        "old": "Content Moderator",
        "new": "Senior Content Moderator"
      },
      "level": {
        "old": 30,
        "new": 35
      },
      "permissions_added": [
        {
          "resource": "content",
          "action": "publish"
        },
        {
          "resource": "users",
          "action": "suspend"
        }
      ]
    }
  },
  "message": "Role 'content_moderator' updated successfully. 3 users affected.",
  "timestamp": "2025-11-03T14:30:00Z"
}
```

**Error Responses**:

```json
// 400 Bad Request - System role
{
  "success": false,
  "error": {
    "code": "CANNOT_MODIFY_SYSTEM_ROLE",
    "message": "System role 'admin' cannot be modified",
    "system_roles": ["admin", "user"]
  }
}

// 400 Bad Request - Invalid level change
{
  "success": false,
  "error": {
    "code": "INVALID_LEVEL_CHANGE",
    "message": "Cannot change role level to 100 (reserved for admin) or 10 (reserved for user)"
  }
}

// 409 Conflict - Users with role
{
  "success": false,
  "error": {
    "code": "ROLE_IN_USE",
    "message": "Cannot reduce permissions while 3 users have this role. Remove users first or use force flag.",
    "users_count": 3,
    "affected_users": ["usr_123", "usr_456", "usr_789"]
  }
}
```

#### TypeScript Implementation

```typescript
interface UpdateRoleRequest {
  display_name?: string;
  description?: string;
  level?: number;
  permissions?: RolePermission[];
  restrictions?: string[];
}

const updateRole = async (
  roleName: string,
  updates: UpdateRoleRequest
): Promise<Role> => {
  const response = await fetch(`/api/v1/admin/rbac/roles/${roleName}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Failed to update role');
  }

  const result = await response.json();
  return result.data.role;
};

// Example: Add new permission to existing role
const addPermissionToRole = async (
  roleName: string,
  newPermission: RolePermission
) => {
  // First, get current permissions
  const currentRole = await getRoleDetails(roleName);
  
  // Add new permission
  const updatedPermissions = [
    ...currentRole.permissions,
    newPermission
  ];
  
  // Update role
  return updateRole(roleName, {
    permissions: updatedPermissions
  });
};
```

---

### 7.5 Delete Role

**Endpoint**: `DELETE /api/v1/admin/rbac/roles/{role_name}`

**Description**: Deletes a custom role from the system.

**Required Role**: `admin`

**Note**: 
- System roles (admin, user) cannot be deleted
- Roles with assigned users cannot be deleted unless force flag is used
- When force deleted, users are reassigned to default 'user' role

#### Request

**Path Parameters**:
- `role_name` (string, required): The name of the role to delete

**Query Parameters**:
```typescript
{
  force?: boolean;  // Force delete even if users have this role (default: false)
  reassign_to?: string;  // Role to reassign users to (default: 'user')
}
```

#### Responses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "deleted_role": "content_moderator",
    "users_affected": 3,
    "users_reassigned_to": "user",
    "deleted_at": "2025-11-03T15:00:00Z"
  },
  "message": "Role 'content_moderator' deleted successfully. 3 users reassigned to 'user' role.",
  "timestamp": "2025-11-03T15:00:00Z"
}
```

**Error Responses**:

```json
// 400 Bad Request - System role
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_SYSTEM_ROLE",
    "message": "System role 'admin' cannot be deleted"
  }
}

// 409 Conflict - Role in use
{
  "success": false,
  "error": {
    "code": "ROLE_IN_USE",
    "message": "Cannot delete role with 3 assigned users. Use force=true to reassign users.",
    "users_count": 3
  }
}

// 404 Not Found
{
  "success": false,
  "error": {
    "code": "ROLE_NOT_FOUND",
    "message": "Role 'unknown_role' does not exist"
  }
}
```

#### TypeScript Implementation

```typescript
interface DeleteRoleOptions {
  force?: boolean;
  reassign_to?: string;
}

const deleteRole = async (
  roleName: string,
  options?: DeleteRoleOptions
): Promise<void> => {
  const queryParams = new URLSearchParams();
  
  if (options?.force) {
    queryParams.append('force', 'true');
  }
  if (options?.reassign_to) {
    queryParams.append('reassign_to', options.reassign_to);
  }

  const response = await fetch(
    `/api/v1/admin/rbac/roles/${roleName}?${queryParams.toString()}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Failed to delete role');
  }
};

// Example: Safe delete with confirmation
const safeDeleteRole = async (roleName: string) => {
  try {
    // First, check if role has users
    const role = await getRoleDetails(roleName, { include_users: true });
    
    if (role.users_count && role.users_count > 0) {
      const confirmed = confirm(
        `This role is assigned to ${role.users_count} user(s). ` +
        `They will be reassigned to the 'user' role. Continue?`
      );
      
      if (!confirmed) return;
      
      // Force delete with reassignment
      await deleteRole(roleName, { 
        force: true,
        reassign_to: 'user'
      });
    } else {
      // Safe to delete
      await deleteRole(roleName);
    }
    
    console.log(`Role '${roleName}' deleted successfully`);
  } catch (error) {
    console.error('Failed to delete role:', error);
    throw error;
  }
};
```

---

### 7.6 Assign Role to User

**Endpoint**: `POST /api/v1/admin/users/{user_id}/roles`

**Description**: Assigns one or more roles to a user.

**Required Role**: `admin` or `manager` (managers cannot assign admin role)

#### Request

**Path Parameters**:
- `user_id` (string, required): The ID of the user

**Body Parameters**:
```json
{
  "roles": ["manager", "content_moderator"],
  "replace": false,
  "reason": "Promoted to manager and assigned content moderation duties"
}
```

**Field Descriptions**:
- `roles`: Array of role names to assign
- `replace`: If true, replaces all existing roles. If false, adds to existing roles (default: false)
- `reason`: Optional reason for role assignment (logged in audit)

#### Responses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "roles_before": ["user"],
    "roles_after": ["user", "manager", "content_moderator"],
    "roles_added": ["manager", "content_moderator"],
    "effective_permissions": [
      "users:read",
      "users:create",
      "users:update",
      "content:read",
      "content:update",
      "content:delete"
    ]
  },
  "message": "Roles assigned successfully to user usr_abc123",
  "timestamp": "2025-11-03T16:00:00Z"
}
```

**Error Responses**:

```json
// 403 Forbidden - Cannot assign admin
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Manager role cannot assign admin role to users"
  }
}

// 400 Bad Request - Invalid role
{
  "success": false,
  "error": {
    "code": "INVALID_ROLE",
    "message": "Role 'invalid_role' does not exist",
    "valid_roles": ["admin", "manager", "auditor", "user"]
  }
}
```

#### TypeScript Implementation

```typescript
interface AssignRolesRequest {
  roles: string[];
  replace?: boolean;
  reason?: string;
}

const assignRolesToUser = async (
  userId: string,
  request: AssignRolesRequest
) => {
  const response = await fetch(`/api/v1/admin/users/${userId}/roles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Failed to assign roles');
  }

  return response.json();
};
```

---

## 8. Analytics & Statistics

### 8.1 Get Admin Dashboard Statistics

**Endpoint**: `GET /api/v1/admin/stats`

**Description**: Retrieves comprehensive statistics for the admin dashboard.

**Required Role**: `admin` or `manager`

#### Request

**Query Parameters**:
```typescript
{
  period?: '24h' | '7d' | '30d' | '90d' | '1y' | 'all';  // Time period (default: '30d')
  include_charts?: boolean;  // Include chart data points (default: false)
  metrics?: string[];  // Specific metrics to include (default: all)
}
```

**Available Metrics**:
- `users`: User statistics
- `registrations`: Registration trends
- `activity`: User activity metrics
- `roles`: Role distribution
- `geography`: Geographic distribution
- `devices`: Device/platform statistics

#### Responses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "generated_at": "2025-11-03T16:00:00Z",
    "overview": {
      "total_users": 1563,
      "active_users": 1142,
      "inactive_users": 421,
      "new_users_this_period": 87,
      "growth_rate": "+5.9%"
    },
    "users": {
      "total": 1563,
      "by_status": {
        "active": 1142,
        "inactive": 421,
        "pending_approval": 12,
        "suspended": 15,
        "deleted": 8
      },
      "by_verification": {
        "email_verified": 1489,
        "email_not_verified": 74,
        "phone_verified": 856,
        "phone_not_verified": 707
      },
      "by_account_type": {
        "regular": 1547,
        "premium": 12,
        "trial": 4
      }
    },
    "registrations": {
      "total_this_period": 87,
      "approved": 75,
      "rejected": 8,
      "pending": 4,
      "daily_average": 2.9,
      "trend": "increasing",
      "chart_data": [
        {
          "date": "2025-10-04",
          "registrations": 3,
          "approvals": 2,
          "rejections": 1
        }
        // ... more data points if include_charts=true
      ]
    },
    "activity": {
      "daily_active_users": 423,
      "weekly_active_users": 891,
      "monthly_active_users": 1142,
      "average_session_duration": "00:24:35",
      "total_sessions": 15678,
      "bounce_rate": "12.3%",
      "engagement_score": 7.8
    },
    "roles": {
      "distribution": {
        "admin": 5,
        "manager": 12,
        "auditor": 3,
        "user": 1543
      },
      "percentage": {
        "admin": "0.32%",
        "manager": "0.77%",
        "auditor": "0.19%",
        "user": "98.72%"
      }
    },
    "geography": {
      "top_countries": [
        {
          "country": "United States",
          "code": "US",
          "users": 567,
          "percentage": "36.3%"
        },
        {
          "country": "United Kingdom",
          "code": "GB",
          "users": 234,
          "percentage": "15.0%"
        },
        {
          "country": "Canada",
          "code": "CA",
          "users": 156,
          "percentage": "10.0%"
        }
      ],
      "total_countries": 45
    },
    "devices": {
      "platforms": {
        "web": 892,
        "mobile": 534,
        "tablet": 137
      },
      "browsers": {
        "Chrome": 687,
        "Safari": 423,
        "Firefox": 234,
        "Edge": 156,
        "Other": 63
      },
      "operating_systems": {
        "Windows": 612,
        "macOS": 434,
        "iOS": 289,
        "Android": 245,
        "Linux": 83
      }
    },
    "performance": {
      "avg_api_response_time": "145ms",
      "error_rate": "0.23%",
      "uptime": "99.97%"
    }
  },
  "timestamp": "2025-11-03T16:00:00Z"
}
```

**Error Responses**:

```json
// 400 Bad Request - Invalid period
{
  "success": false,
  "error": {
    "code": "INVALID_PERIOD",
    "message": "Invalid period '1m'. Valid periods: 24h, 7d, 30d, 90d, 1y, all"
  }
}
```

#### TypeScript Implementation

```typescript
interface StatsParams {
  period?: '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  include_charts?: boolean;
  metrics?: string[];
}

interface AdminStats {
  period: string;
  generated_at: string;
  overview: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    new_users_this_period: number;
    growth_rate: string;
  };
  users: {
    total: number;
    by_status: Record<string, number>;
    by_verification: Record<string, number>;
    by_account_type: Record<string, number>;
  };
  registrations: {
    total_this_period: number;
    approved: number;
    rejected: number;
    pending: number;
    daily_average: number;
    trend: string;
    chart_data?: Array<{
      date: string;
      registrations: number;
      approvals: number;
      rejections: number;
    }>;
  };
  activity: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    average_session_duration: string;
    total_sessions: number;
    bounce_rate: string;
    engagement_score: number;
  };
  roles: {
    distribution: Record<string, number>;
    percentage: Record<string, string>;
  };
  geography: {
    top_countries: Array<{
      country: string;
      code: string;
      users: number;
      percentage: string;
    }>;
    total_countries: number;
  };
  devices: {
    platforms: Record<string, number>;
    browsers: Record<string, number>;
    operating_systems: Record<string, number>;
  };
  performance: {
    avg_api_response_time: string;
    error_rate: string;
    uptime: string;
  };
}

const getAdminStats = async (params?: StatsParams): Promise<AdminStats> => {
  const queryParams = new URLSearchParams();
  
  if (params?.period) {
    queryParams.append('period', params.period);
  }
  if (params?.include_charts) {
    queryParams.append('include_charts', 'true');
  }
  if (params?.metrics) {
    queryParams.append('metrics', params.metrics.join(','));
  }

  const response = await fetch(
    `/api/v1/admin/stats?${queryParams.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch admin statistics');
  }

  const result = await response.json();
  return result.data;
};

// Example: Get 7-day stats with charts
const getWeeklyStatsWithCharts = () => {
  return getAdminStats({
    period: '7d',
    include_charts: true
  });
};

// Example: Get specific metrics only
const getUserMetricsOnly = () => {
  return getAdminStats({
    period: '30d',
    metrics: ['users', 'registrations', 'activity']
  });
};
```

---

### 8.2 Get User Growth Analytics

**Endpoint**: `GET /api/v1/admin/analytics/growth`

**Description**: Retrieves detailed user growth analytics with trends and predictions.

**Required Role**: `admin` or `manager`

#### Request

**Query Parameters**:
```typescript
{
  period?: '30d' | '90d' | '6m' | '1y' | 'all';  // Time period (default: '90d')
  granularity?: 'daily' | 'weekly' | 'monthly';  // Data point granularity (default: 'daily')
  include_predictions?: boolean;  // Include growth predictions (default: false)
}
```

#### Responses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "period": "90d",
    "granularity": "daily",
    "summary": {
      "total_users_start": 1476,
      "total_users_end": 1563,
      "net_growth": 87,
      "growth_rate": "+5.9%",
      "avg_daily_growth": 0.97,
      "peak_growth_date": "2025-10-15",
      "peak_growth_value": 12
    },
    "time_series": [
      {
        "date": "2025-08-04",
        "total_users": 1476,
        "new_users": 2,
        "churned_users": 1,
        "net_growth": 1,
        "growth_rate": "+0.07%"
      },
      {
        "date": "2025-08-05",
        "total_users": 1479,
        "new_users": 4,
        "churned_users": 1,
        "net_growth": 3,
        "growth_rate": "+0.20%"
      }
      // ... more data points
    ],
    "trends": {
      "overall_trend": "increasing",
      "momentum": "positive",
      "volatility": "low",
      "seasonal_pattern": "weekday_heavy"
    },
    "predictions": {
      "next_7_days": {
        "expected_new_users": 21,
        "expected_total": 1584,
        "confidence": "85%"
      },
      "next_30_days": {
        "expected_new_users": 92,
        "expected_total": 1655,
        "confidence": "72%"
      }
    },
    "milestones": [
      {
        "milestone": "1500 users",
        "achieved_on": "2025-09-12",
        "days_from_start": 39
      },
      {
        "milestone": "Next milestone (2000 users)",
        "estimated_date": "2026-03-15",
        "days_remaining": 132
      }
    ]
  },
  "timestamp": "2025-11-03T16:00:00Z"
}
```

#### TypeScript Implementation

```typescript
interface GrowthAnalyticsParams {
  period?: '30d' | '90d' | '6m' | '1y' | 'all';
  granularity?: 'daily' | 'weekly' | 'monthly';
  include_predictions?: boolean;
}

const getUserGrowthAnalytics = async (params?: GrowthAnalyticsParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.period) queryParams.append('period', params.period);
  if (params?.granularity) queryParams.append('granularity', params.granularity);
  if (params?.include_predictions) queryParams.append('include_predictions', 'true');

  const response = await fetch(
    `/api/v1/admin/analytics/growth?${queryParams.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch growth analytics');
  }

  return response.json();
};
```

---

## 9. Audit Logs

### 9.1 Get Audit Logs

**Endpoint**: `GET /api/v1/admin/audit-logs`

**Description**: Retrieves audit logs of admin actions and system events.

**Required Role**: `admin` or `auditor`

#### Request

**Query Parameters**:
```typescript
{
  page?: number;              // Page number (default: 1)
  page_size?: number;         // Items per page (default: 50, max: 500)
  start_date?: string;        // Filter from date (ISO 8601)
  end_date?: string;          // Filter to date (ISO 8601)
  actor_id?: string;          // Filter by user who performed action
  target_id?: string;         // Filter by target user/resource
  action?: string;            // Filter by action type
  resource?: string;          // Filter by resource type
  severity?: 'low' | 'medium' | 'high' | 'critical';  // Filter by severity
  search?: string;            // Search in action details
  sort_by?: 'timestamp' | 'severity' | 'actor';  // Sort field
  sort_order?: 'asc' | 'desc';  // Sort direction (default: 'desc')
}
```

**Available Actions**:
- `user.create`, `user.update`, `user.delete`
- `user.approve`, `user.reject`, `user.suspend`
- `role.create`, `role.update`, `role.delete`, `role.assign`
- `login.success`, `login.failed`, `logout`
- `password.change`, `password.reset`
- `settings.update`, `config.change`

**Available Resources**:
- `user`, `role`, `auth`, `settings`, `system`

#### Responses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "log_id": "log_abc123def456",
        "timestamp": "2025-11-03T15:45:23Z",
        "action": "user.update",
        "resource": "user",
        "severity": "medium",
        "actor": {
          "user_id": "usr_admin001",
          "email": "admin@example.com",
          "full_name": "Admin User",
          "role": "admin",
          "ip_address": "192.168.1.100"
        },
        "target": {
          "user_id": "usr_abc123",
          "email": "john.doe@example.com",
          "full_name": "John Doe"
        },
        "details": {
          "changes": {
            "roles": {
              "before": ["user"],
              "after": ["user", "manager"]
            }
          },
          "reason": "Promoted to manager role"
        },
        "result": "success",
        "duration_ms": 234,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "session_id": "sess_xyz789"
      },
      {
        "log_id": "log_def456ghi789",
        "timestamp": "2025-11-03T15:30:12Z",
        "action": "user.delete",
        "resource": "user",
        "severity": "high",
        "actor": {
          "user_id": "usr_admin002",
          "email": "admin2@example.com",
          "full_name": "Admin User 2",
          "role": "admin",
          "ip_address": "192.168.1.101"
        },
        "target": {
          "user_id": "usr_deleted123",
          "email": "deleted@example.com",
          "full_name": "Deleted User"
        },
        "details": {
          "delete_type": "soft",
          "reason": "User requested account deletion",
          "data_retention_days": 30
        },
        "result": "success",
        "duration_ms": 567
      },
      {
        "log_id": "log_ghi789jkl012",
        "timestamp": "2025-11-03T15:15:45Z",
        "action": "login.failed",
        "resource": "auth",
        "severity": "medium",
        "actor": {
          "ip_address": "203.0.113.45",
          "user_agent": "Mozilla/5.0..."
        },
        "target": {
          "email": "user@example.com"
        },
        "details": {
          "reason": "invalid_password",
          "attempt_number": 3,
          "account_locked": false
        },
        "result": "failed",
        "duration_ms": 123
      },
      {
        "log_id": "log_jkl012mno345",
        "timestamp": "2025-11-03T14:30:00Z",
        "action": "role.create",
        "resource": "role",
        "severity": "high",
        "actor": {
          "user_id": "usr_admin001",
          "email": "admin@example.com",
          "full_name": "Admin User",
          "role": "admin",
          "ip_address": "192.168.1.100"
        },
        "details": {
          "role_name": "content_moderator",
          "permissions": ["content:read", "content:update", "content:delete"],
          "level": 30
        },
        "result": "success",
        "duration_ms": 189
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 50,
      "total_items": 15678,
      "total_pages": 314,
      "has_next": true,
      "has_prev": false
    },
    "filters_applied": {
      "start_date": "2025-11-03T00:00:00Z",
      "end_date": "2025-11-03T23:59:59Z",
      "severity": "medium"
    },
    "summary": {
      "total_logs_in_period": 234,
      "by_severity": {
        "critical": 2,
        "high": 45,
        "medium": 123,
        "low": 64
      },
      "by_action": {
        "user.update": 67,
        "user.create": 12,
        "login.success": 89,
        "login.failed": 23,
        "other": 43
      }
    }
  },
  "timestamp": "2025-11-03T16:00:00Z"
}
```

**Error Responses**:

```json
// 400 Bad Request - Invalid date range
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "start_date must be before end_date"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Admin or Auditor role required to access audit logs"
  }
}
```

#### TypeScript Implementation

```typescript
interface AuditLogFilters {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
  actor_id?: string;
  target_id?: string;
  action?: string;
  resource?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
  sort_by?: 'timestamp' | 'severity' | 'actor';
  sort_order?: 'asc' | 'desc';
}

interface AuditLog {
  log_id: string;
  timestamp: string;
  action: string;
  resource: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actor: {
    user_id?: string;
    email?: string;
    full_name?: string;
    role?: string;
    ip_address: string;
  };
  target?: {
    user_id?: string;
    email?: string;
    full_name?: string;
  };
  details: Record<string, any>;
  result: 'success' | 'failed' | 'partial';
  duration_ms: number;
  user_agent?: string;
  session_id?: string;
}

const getAuditLogs = async (filters?: AuditLogFilters) => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await fetch(
    `/api/v1/admin/audit-logs?${queryParams.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch audit logs');
  }

  return response.json();
};

// Example: Get today's high-severity logs
const getTodaysCriticalLogs = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return getAuditLogs({
    start_date: today.toISOString(),
    severity: 'high',
    sort_by: 'timestamp',
    sort_order: 'desc'
  });
};

// Example: Get user's action history
const getUserActionHistory = (userId: string, days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return getAuditLogs({
    actor_id: userId,
    start_date: startDate.toISOString(),
    page_size: 100
  });
};

// Example: Search audit logs
const searchAuditLogs = (searchTerm: string) => {
  return getAuditLogs({
    search: searchTerm,
    page_size: 100
  });
};

// Example: Get failed login attempts
const getFailedLoginAttempts = (hours: number = 24) => {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);
  
  return getAuditLogs({
    action: 'login.failed',
    start_date: startDate.toISOString(),
    sort_by: 'timestamp',
    sort_order: 'desc'
  });
};
```

---

### 9.2 Export Audit Logs

**Endpoint**: `POST /api/v1/admin/audit-logs/export`

**Description**: Exports audit logs in various formats for compliance and archival.

**Required Role**: `admin` or `auditor`

#### Request

**Body Parameters**:
```json
{
  "format": "csv",
  "filters": {
    "start_date": "2025-10-01T00:00:00Z",
    "end_date": "2025-10-31T23:59:59Z",
    "severity": "high"
  },
  "include_fields": [
    "timestamp",
    "action",
    "actor.email",
    "target.email",
    "details",
    "result"
  ]
}
```

**Parameters**:
- `format`: Export format - `csv`, `json`, `xlsx`, or `pdf`
- `filters`: Same filters as GET audit logs endpoint
- `include_fields`: Optional array of fields to include (default: all)

#### Responses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "export_id": "exp_abc123",
    "download_url": "/api/v1/admin/audit-logs/downloads/exp_abc123",
    "format": "csv",
    "file_size_bytes": 524288,
    "record_count": 1234,
    "expires_at": "2025-11-04T16:00:00Z"
  },
  "message": "Audit logs export ready for download",
  "timestamp": "2025-11-03T16:00:00Z"
}
```

#### TypeScript Implementation

```typescript
interface ExportAuditLogsRequest {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  filters?: AuditLogFilters;
  include_fields?: string[];
}

const exportAuditLogs = async (request: ExportAuditLogsRequest) => {
  const response = await fetch('/api/v1/admin/audit-logs/export', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error('Failed to export audit logs');
  }

  const result = await response.json();
  return result.data;
};

// Example: Export monthly audit logs
const exportMonthlyAuditLogs = async (year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const exportData = await exportAuditLogs({
    format: 'csv',
    filters: {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    }
  });
  
  // Download the file
  window.location.href = exportData.download_url;
  
  return exportData;
};
```

---

## 10. TypeScript Types Reference

### Complete Type Definitions

This section provides all TypeScript types and interfaces used throughout the Admin API.

```typescript
// ============================================================================
// Base Types
// ============================================================================

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted';
export type AccountType = 'regular' | 'premium' | 'trial';
export type RoleLevel = 'admin' | 'manager' | 'auditor' | 'user';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ActionResult = 'success' | 'failed' | 'partial';

// ============================================================================
// User Types
// ============================================================================

export interface User {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: Gender;
  profile_picture_url?: string;
  bio?: string;
  
  status: UserStatus;
  account_type: AccountType;
  roles: string[];
  
  email_verified: boolean;
  phone_verified: boolean;
  
  last_login?: string;
  last_active?: string;
  login_count: number;
  failed_login_attempts: number;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  full_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: Gender;
  roles?: string[];
  account_type?: AccountType;
  email_verified?: boolean;
  send_welcome_email?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  full_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: Gender;
  bio?: string;
  status?: UserStatus;
  roles?: string[];
  account_type?: AccountType;
}

export interface UserListFilters {
  page?: number;
  page_size?: number;
  status?: UserStatus | UserStatus[];
  role?: string | string[];
  account_type?: AccountType;
  email_verified?: boolean;
  phone_verified?: boolean;
  search?: string;
  created_after?: string;
  created_before?: string;
  last_login_after?: string;
  sort_by?: 'created_at' | 'last_login' | 'email' | 'full_name';
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: Record<string, any>;
}

// ============================================================================
// Role Types
// ============================================================================

export interface RolePermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface Role {
  role_id: string;
  role_name: string;
  display_name: string;
  description: string;
  level: number;
  status: 'active' | 'inactive';
  permissions: RolePermission[];
  restrictions?: string[];
  users_count?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_modified_by?: string;
}

export interface CreateRoleRequest {
  role_name: string;
  display_name: string;
  description?: string;
  level: number;
  permissions: RolePermission[];
  restrictions?: string[];
}

export interface UpdateRoleRequest {
  display_name?: string;
  description?: string;
  level?: number;
  permissions?: RolePermission[];
  restrictions?: string[];
}

export interface AssignRolesRequest {
  roles: string[];
  replace?: boolean;
  reason?: string;
}

// ============================================================================
// Approval Types
// ============================================================================

export interface ApprovalRequest {
  approve: boolean;
  reason?: string;
  grant_trial_period?: boolean;
  trial_duration_days?: number;
  custom_message?: string;
  notify_user?: boolean;
}

export interface RejectRequest {
  reason: string;
  block_registration?: boolean;
  block_duration_days?: number;
  custom_message?: string;
  improvement_tips?: string[];
  allow_reapplication?: boolean;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface StatsParams {
  period?: '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  include_charts?: boolean;
  metrics?: string[];
}

export interface AdminStats {
  period: string;
  generated_at: string;
  overview: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    new_users_this_period: number;
    growth_rate: string;
  };
  users: {
    total: number;
    by_status: Record<string, number>;
    by_verification: Record<string, number>;
    by_account_type: Record<string, number>;
  };
  registrations: {
    total_this_period: number;
    approved: number;
    rejected: number;
    pending: number;
    daily_average: number;
    trend: string;
    chart_data?: ChartDataPoint[];
  };
  activity: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    average_session_duration: string;
    total_sessions: number;
    bounce_rate: string;
    engagement_score: number;
  };
  roles: {
    distribution: Record<string, number>;
    percentage: Record<string, string>;
  };
  geography: {
    top_countries: CountryData[];
    total_countries: number;
  };
  devices: {
    platforms: Record<string, number>;
    browsers: Record<string, number>;
    operating_systems: Record<string, number>;
  };
  performance: {
    avg_api_response_time: string;
    error_rate: string;
    uptime: string;
  };
}

export interface ChartDataPoint {
  date: string;
  registrations: number;
  approvals: number;
  rejections: number;
}

export interface CountryData {
  country: string;
  code: string;
  users: number;
  percentage: string;
}

export interface GrowthAnalyticsParams {
  period?: '30d' | '90d' | '6m' | '1y' | 'all';
  granularity?: 'daily' | 'weekly' | 'monthly';
  include_predictions?: boolean;
}

export interface GrowthData {
  date: string;
  total_users: number;
  new_users: number;
  churned_users: number;
  net_growth: number;
  growth_rate: string;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface AuditLogFilters {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
  actor_id?: string;
  target_id?: string;
  action?: string;
  resource?: string;
  severity?: AuditSeverity;
  search?: string;
  sort_by?: 'timestamp' | 'severity' | 'actor';
  sort_order?: 'asc' | 'desc';
}

export interface AuditLog {
  log_id: string;
  timestamp: string;
  action: string;
  resource: string;
  severity: AuditSeverity;
  actor: {
    user_id?: string;
    email?: string;
    full_name?: string;
    role?: string;
    ip_address: string;
  };
  target?: {
    user_id?: string;
    email?: string;
    full_name?: string;
  };
  details: Record<string, any>;
  result: ActionResult;
  duration_ms: number;
  user_agent?: string;
  session_id?: string;
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: Record<string, any>;
  summary: {
    total_logs_in_period: number;
    by_severity: Record<AuditSeverity, number>;
    by_action: Record<string, number>;
  };
}

export interface ExportAuditLogsRequest {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  filters?: AuditLogFilters;
  include_fields?: string[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ValidationError extends ApiError {
  validation_errors: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface DeleteOptions {
  soft_delete?: boolean;
  force?: boolean;
  transfer_ownership_to?: string;
  delete_related_data?: boolean;
}

export interface DeleteRoleOptions {
  force?: boolean;
  reassign_to?: string;
}

export interface BulkOperation<T> {
  operation: string;
  items: T[];
  options?: Record<string, any>;
}

export interface BulkOperationResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    item_id: string;
    error: string;
  }>;
}

// ============================================================================
// API Client Configuration
// ============================================================================

export interface AdminApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  headers?: Record<string, string>;
}

// ============================================================================
// Constants
// ============================================================================

export const API_ENDPOINTS = {
  // User Management
  LIST_USERS: '/api/v1/admin/users',
  CREATE_USER: '/api/v1/admin/users',
  GET_USER: '/api/v1/admin/users/:user_id',
  UPDATE_USER: '/api/v1/admin/users/:user_id',
  DELETE_USER: '/api/v1/admin/users/:user_id',
  
  // User Approval
  APPROVE_USER_LEGACY: '/api/v1/admin/approve-user',
  APPROVE_USER: '/api/v1/admin/users/:user_id/approve',
  REJECT_USER: '/api/v1/admin/users/:user_id/reject',
  
  // Role Management
  LIST_ROLES: '/api/v1/admin/rbac/roles',
  GET_ROLE: '/api/v1/admin/rbac/roles/:role_name',
  CREATE_ROLE: '/api/v1/admin/rbac/roles',
  UPDATE_ROLE: '/api/v1/admin/rbac/roles/:role_name',
  DELETE_ROLE: '/api/v1/admin/rbac/roles/:role_name',
  ASSIGN_ROLES: '/api/v1/admin/users/:user_id/roles',
  
  // Analytics
  ADMIN_STATS: '/api/v1/admin/stats',
  GROWTH_ANALYTICS: '/api/v1/admin/analytics/growth',
  
  // Audit Logs
  AUDIT_LOGS: '/api/v1/admin/audit-logs',
  EXPORT_AUDIT_LOGS: '/api/v1/admin/audit-logs/export',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  // Authentication
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ROLE_REQUIRED: 'ROLE_REQUIRED',
  
  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  CANNOT_DELETE_SELF: 'CANNOT_DELETE_SELF',
  CANNOT_DELETE_ADMIN: 'CANNOT_DELETE_ADMIN',
  
  // Role
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  ROLE_ALREADY_EXISTS: 'ROLE_ALREADY_EXISTS',
  INVALID_ROLE: 'INVALID_ROLE',
  CANNOT_MODIFY_SYSTEM_ROLE: 'CANNOT_MODIFY_SYSTEM_ROLE',
  CANNOT_DELETE_SYSTEM_ROLE: 'CANNOT_DELETE_SYSTEM_ROLE',
  ROLE_IN_USE: 'ROLE_IN_USE',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  INVALID_DATE: 'INVALID_DATE',
  
  // Other
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export const ROLE_HIERARCHY = {
  admin: 100,
  manager: 50,
  auditor: 25,
  user: 10,
} as const;

// ============================================================================
// Utility Functions Types
// ============================================================================

export type GetAdminToken = () => string;
export type SetAdminToken = (token: string) => void;
export type ClearAdminToken = () => void;

export interface AdminApiClient {
  // User Management
  listUsers: (filters?: UserListFilters) => Promise<PaginatedUsers>;
  createUser: (data: CreateUserRequest) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  updateUser: (userId: string, data: UpdateUserRequest) => Promise<User>;
  deleteUser: (userId: string, options?: DeleteOptions) => Promise<void>;
  
  // User Approval
  approveUser: (userId: string, data?: ApprovalRequest) => Promise<User>;
  rejectUser: (userId: string, data: RejectRequest) => Promise<void>;
  
  // Role Management
  listRoles: (params?: any) => Promise<Role[]>;
  getRole: (roleName: string, options?: any) => Promise<Role>;
  createRole: (data: CreateRoleRequest) => Promise<Role>;
  updateRole: (roleName: string, data: UpdateRoleRequest) => Promise<Role>;
  deleteRole: (roleName: string, options?: DeleteRoleOptions) => Promise<void>;
  assignRoles: (userId: string, data: AssignRolesRequest) => Promise<any>;
  
  // Analytics
  getAdminStats: (params?: StatsParams) => Promise<AdminStats>;
  getGrowthAnalytics: (params?: GrowthAnalyticsParams) => Promise<any>;
  
  // Audit Logs
  getAuditLogs: (filters?: AuditLogFilters) => Promise<PaginatedAuditLogs>;
  exportAuditLogs: (request: ExportAuditLogsRequest) => Promise<any>;
}
```

---

## Best Practices

### 1. Error Handling

Always implement comprehensive error handling for admin operations:

```typescript
const safeAdminOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error) {
      // Log to monitoring service
      console.error(`${errorMessage}:`, error.message);
      
      // Show user-friendly error
      if (error.message.includes('AUTHENTICATION_REQUIRED')) {
        redirectToLogin();
      } else if (error.message.includes('INSUFFICIENT_PERMISSIONS')) {
        showPermissionError();
      } else {
        showGenericError(errorMessage);
      }
    }
    return null;
  }
};
```

### 2. Token Management

Implement secure token storage and automatic refresh:

```typescript
class TokenManager {
  private static TOKEN_KEY = 'admin_token';
  private static REFRESH_KEY = 'admin_refresh_token';
  
  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }
  
  static setToken(token: string, refreshToken?: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    if (refreshToken) {
      sessionStorage.setItem(this.REFRESH_KEY, refreshToken);
    }
  }
  
  static clearTokens(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_KEY);
  }
  
  static async refreshTokenIfNeeded(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expiring soon (decode JWT)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    
    // Refresh if expiring in less than 5 minutes
    if (expiresIn < 5 * 60 * 1000) {
      const refreshToken = sessionStorage.getItem(this.REFRESH_KEY);
      if (refreshToken) {
        // Call refresh endpoint
        const response = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (response.ok) {
          const data = await response.json();
          this.setToken(data.access_token, data.refresh_token);
          return true;
        }
      }
    }
    
    return false;
  }
}
```

### 3. Request Interceptor

Create a centralized request handler with automatic token refresh:

```typescript
const adminApiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  // Refresh token if needed
  await TokenManager.refreshTokenIfNeeded();
  
  const token = TokenManager.getToken();
  if (!token) {
    throw new Error('AUTHENTICATION_REQUIRED');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.code || 'REQUEST_FAILED');
  }
  
  return response.json();
};
```

### 4. Optimistic UI Updates

Implement optimistic updates for better UX:

```typescript
const optimisticUserUpdate = async (
  userId: string,
  updates: UpdateUserRequest,
  currentUser: User
): Promise<User> => {
  // Optimistically update UI
  const optimisticUser = { ...currentUser, ...updates };
  updateUIImmediately(optimisticUser);
  
  try {
    // Perform actual update
    const updatedUser = await updateUser(userId, updates);
    updateUIWithRealData(updatedUser);
    return updatedUser;
  } catch (error) {
    // Revert on error
    updateUIWithRealData(currentUser);
    throw error;
  }
};
```

### 5. Pagination Helper

Create a reusable pagination hook:

```typescript
const usePagination = (fetchFunction: (page: number) => Promise<any>) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadPage = async (newPage: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction(newPage);
      setData(result);
      setPage(newPage);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPage(1);
  }, []);
  
  return {
    data,
    loading,
    error,
    page,
    nextPage: () => loadPage(page + 1),
    prevPage: () => loadPage(page - 1),
    goToPage: loadPage,
  };
};
```

---

## Conclusion

This documentation provides comprehensive coverage of all admin API endpoints for the React frontend team. Each endpoint includes:

✅ Complete request/response examples  
✅ All possible error scenarios  
✅ TypeScript type definitions  
✅ Practical implementation examples  
✅ Best practices and patterns  
✅ Edge cases and special scenarios  

For additional support or questions, please contact the backend team or refer to the main API documentation.

**Last Updated**: November 3, 2025  
**Documentation Version**: 1.0  
**API Version**: v1

