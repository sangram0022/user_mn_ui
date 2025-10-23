# Backend API Documentation for UI Team

**Version:** 1.0  
**Last Updated:** October 22, 2025  
**Base URL:** `http://localhost:8001` (Development) | `https://api.yourdomain.com` (Production)  
**API Prefix:** `/api/v1`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Secure Authentication (httpOnly Cookies)](#2-secure-authentication-httponly-cookies)
3. [Profile Management](#3-profile-management)
4. [Admin - User Management](#4-admin---user-management)
5. [Admin - RBAC Role Management](#5-admin---rbac-role-management)
6. [GDPR Compliance](#6-gdpr-compliance)
7. [Audit Logs](#7-audit-logs)
8. [Frontend Error Logging](#8-frontend-error-logging)
9. [Common Response Codes](#9-common-response-codes)
10. [Error Response Format](#10-error-response-format)
11. [Authentication Flow Examples](#11-authentication-flow-examples)

---

## 1. Authentication

All authentication endpoints use JWT tokens. Access tokens expire in 15 minutes, refresh tokens in 7 days.

### 1.1 User Registration

**Endpoint:** `POST /api/v1/auth/register`  
**Authentication:** Not required  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Field Validations:**

- `email`: Valid email format, lowercase
- `password`: Min 8 chars, must contain uppercase, lowercase, numbers, special characters
- `confirm_password`: Must match password
- `first_name`: 2-50 chars, no special characters
- `last_name`: 2-50 chars, no special characters

**Success Response (201):**

```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "verification_required": true,
  "approval_required": true,
  "created_at": "2025-10-22T10:30:00Z",
  "verification_token": null
}
```

**Error Responses:**

- `400`: Validation errors (passwords don't match, weak password, invalid email)
- `409`: User already exists
- `422`: Field validation errors (detailed below)

**Field Validation Error Example:**

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Registration validation failed",
  "status_code": 422,
  "field_errors": [
    {
      "field": "password",
      "message": "Password must include upper and lower case letters, numbers, and special characters",
      "code": "PASSWORD_WEAK",
      "severity": "error"
    }
  ]
}
```

---

### 1.2 User Login

**Endpoint:** `POST /api/v1/auth/login`  
**Authentication:** Not required  
**Rate Limit:** 5 requests per minute per IP, 3 requests per minute per email

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,
  "refresh_expires_in": 604800,
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "role": "user",
  "last_login_at": "2025-10-22T10:25:00Z",
  "issued_at": "2025-10-22T10:30:00Z"
}
```

**Error Responses:**

- `401`: Invalid credentials, user not found
- `403`: Email not verified, user inactive, account not approved
- `422`: Validation errors
- `429`: Too many requests (rate limited)

**Rate Limit Response (429):**

```json
{
  "error_code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many login attempts. Please try again later.",
  "status_code": 429,
  "retry_after": 60
}
```

---

### 1.3 Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`  
**Authentication:** Required (refresh token in Authorization header)  
**Rate Limit:** Standard

**Headers:**

```
Authorization: Bearer <refresh_token>
```

**Success Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,
  "refresh_expires_in": 604800,
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "role": "user",
  "last_login_at": "2025-10-22T10:30:00Z",
  "issued_at": "2025-10-22T10:35:00Z"
}
```

**Error Responses:**

- `401`: Invalid or expired refresh token
- `500`: Token refresh failed

---

### 1.4 Logout

**Endpoint:** `POST /api/v1/auth/logout`  
**Authentication:** Required  
**Rate Limit:** Standard

**Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "message": "Successfully logged out",
  "logged_out_at": "2025-10-22T10:40:00Z",
  "success": true
}
```

---

### 1.5 Verify Email

**Endpoint:** `POST /api/v1/auth/verify-email`  
**Authentication:** Not required  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "token": "email_verification_token_here"
}
```

**Success Response (200):**

```json
{
  "message": "Email verified successfully",
  "verified_at": "2025-10-22T10:30:00Z",
  "user_id": null,
  "approval_required": true
}
```

**Error Responses:**

- `401`: Invalid or expired token
- `404`: User not found
- `500`: Verification failed

---

### 1.6 Resend Verification Email

**Endpoint:** `POST /api/v1/auth/resend-verification`  
**Authentication:** Not required  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "message": "If the email exists in our system, a verification email has been sent.",
  "email": "user@example.com",
  "resent_at": "2025-10-22T10:30:00Z"
}
```

**Note:** Always returns success (security feature to prevent email enumeration)

---

### 1.7 Forgot Password

**Endpoint:** `POST /api/v1/auth/forgot-password`  
**Authentication:** Not required  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "message": "Password reset instructions have been sent to your email",
  "email": "user@example.com",
  "success": true,
  "requested_at": "2025-10-22T10:30:00Z"
}
```

**Note:** Always returns success (security feature to prevent email enumeration)

---

### 1.8 Reset Password

**Endpoint:** `POST /api/v1/auth/reset-password`  
**Authentication:** Not required  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "token": "password_reset_token_here",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

**Success Response (200):**

```json
{
  "message": "Password reset successfully",
  "reset_at": "2025-10-22T10:30:00Z",
  "success": true
}
```

**Error Responses:**

- `401`: Invalid or expired token
- `404`: User not found
- `422`: Validation errors (passwords don't match, weak password)

---

### 1.9 Change Password (Authenticated)

**Endpoint:** `POST /api/v1/auth/change-password`  
**Authentication:** Required  
**Rate Limit:** Standard

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "current_password": "OldSecurePass123!",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

**Success Response (200):**

```json
{
  "message": "Password changed successfully",
  "changed_at": "2025-10-22T10:30:00Z",
  "success": true
}
```

**Error Responses:**

- `401`: Current password incorrect
- `404`: User not found
- `422`: Validation errors

---

## 2. Secure Authentication (httpOnly Cookies)

These endpoints use httpOnly cookies for XSS protection. Tokens are stored in secure cookies instead of response body.

### 2.1 Login (Secure)

**Endpoint:** `POST /api/v1/auth/login-secure`  
**Authentication:** Not required  
**Rate Limit:** Same as regular login

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "user_id": "usr_abc123xyz",
    "email": "user@example.com",
    "role": "user",
    "last_login_at": "2025-10-22T10:25:00Z"
  }
}
```

**Response Cookies:**

- `access_token`: httpOnly, Secure, SameSite=Strict, max-age=900
- `refresh_token`: httpOnly, Secure, SameSite=Strict, max-age=604800, path=/api/v1/auth

---

### 2.2 Logout (Secure)

**Endpoint:** `POST /api/v1/auth/logout-secure`  
**Authentication:** Required (cookie)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "message": "Successfully logged out",
  "logged_out_at": "2025-10-22T10:40:00Z",
  "success": true
}
```

**Note:** Clears all authentication cookies

---

### 2.3 Refresh Token (Secure)

**Endpoint:** `POST /api/v1/auth/refresh-secure`  
**Authentication:** Required (refresh cookie)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "message": "Token refreshed successfully"
}
```

**Response Cookies:** New access_token and refresh_token cookies

---

### 2.4 Get CSRF Token

**Endpoint:** `GET /api/v1/auth/csrf-token`  
**Authentication:** Required  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "csrf_token": "csrf_token_abc123xyz",
  "expires_at": "2025-10-22T11:30:00Z"
}
```

**Usage:** Include in `X-CSRF-Token` header for all POST/PUT/DELETE requests when using cookie auth

---

### 2.5 Validate CSRF Token

**Endpoint:** `POST /api/v1/auth/validate-csrf`  
**Authentication:** Required  
**Rate Limit:** Standard

**Headers:**

```
X-CSRF-Token: csrf_token_abc123xyz
```

**Success Response (200):**

```json
{
  "message": "CSRF token is valid"
}
```

**Error Response (403):**

```json
{
  "error": "Invalid or expired CSRF token"
}
```

---

## 3. Profile Management

### 3.1 Get My Profile

**Endpoint:** `GET /api/v1/profile/me`  
**Authentication:** Required  
**Rate Limit:** Standard

**Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "status": "active",
  "is_verified": true,
  "created_at": "2025-01-01T00:00:00Z",
  "last_login": "2025-10-22T10:30:00Z"
}
```

**Error Responses:**

- `401`: Not authenticated
- `404`: Profile not found
- `500`: Profile retrieval failed

---

### 3.2 Update My Profile

**Endpoint:** `PUT /api/v1/profile/me`  
**Authentication:** Required  
**Rate Limit:** Standard

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body (all fields optional):**

```json
{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**Field Validations:**

- `first_name`: 2-50 chars
- `last_name`: 2-50 chars

**Success Response (200):**

```json
{
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "user",
  "status": "active",
  "is_verified": true,
  "created_at": "2025-01-01T00:00:00Z",
  "last_login": "2025-10-22T10:30:00Z"
}
```

**Error Responses:**

- `401`: Not authenticated
- `404`: Profile not found
- `422`: Validation errors
- `500`: Profile update failed

---

## 4. Admin - User Management

**Required Role:** `admin`, `super_admin`

### 4.1 List All Users

**Endpoint:** `GET /api/v1/admin/users`  
**Authentication:** Required (Admin)  
**Rate Limit:** Standard

**Query Parameters:**

- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)
- `role`: Filter by role (optional)
- `is_active`: Filter by active status (optional, boolean)

**Example:** `GET /api/v1/admin/users?page=1&limit=20&role=user&is_active=true`

**Success Response (200):**

```json
[
  {
    "user_id": "usr_abc123xyz",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "is_active": true,
    "is_verified": true,
    "is_approved": true,
    "approved_by": "admin@example.com",
    "approved_at": "2025-01-01T12:00:00Z",
    "created_at": "2025-01-01T00:00:00Z",
    "last_login_at": "2025-10-22T10:30:00Z"
  }
]
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Not admin
- `500`: User list retrieval failed

---

### 4.2 Create User (Admin)

**Endpoint:** `POST /api/v1/admin/users`  
**Authentication:** Required (Admin)  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "user",
  "is_active": true
}
```

**Field Validations:**

- `email`: Valid email format
- `password`: Min 8 chars, complexity requirements
- `first_name`: 1-50 chars
- `last_name`: 1-50 chars
- `role`: One of: `user`, `manager`, `admin`, `super_admin`, `auditor`
- `is_active`: Boolean (default: true)

**Success Response (201):**

```json
{
  "user_id": "usr_xyz789abc",
  "email": "newuser@example.com",
  "message": "User created successfully"
}
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Not admin
- `409`: User already exists
- `422`: Validation errors
- `500`: User creation failed

---

### 4.3 Get User Details

**Endpoint:** `GET /api/v1/admin/users/{user_id}`  
**Authentication:** Required (Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "approved_by": "admin@example.com",
  "approved_at": "2025-01-01T12:00:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-10-15T14:20:00Z",
  "last_login_at": "2025-10-22T10:30:00Z",
  "login_count": 42
}
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Not admin
- `404`: User not found
- `500`: User retrieval failed

---

### 4.4 Update User

**Endpoint:** `PUT /api/v1/admin/users/{user_id}`  
**Authentication:** Required (Admin)  
**Rate Limit:** Standard

**Request Body (all fields optional):**

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "manager",
  "is_active": true,
  "is_verified": true
}
```

**Success Response (200):**

```json
{
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "manager",
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "approved_by": "admin@example.com",
  "approved_at": "2025-01-01T12:00:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-10-22T10:40:00Z",
  "last_login_at": "2025-10-22T10:30:00Z",
  "login_count": 42
}
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Not admin
- `404`: User not found
- `422`: Validation errors
- `500`: User update failed

---

### 4.5 Delete User

**Endpoint:** `DELETE /api/v1/admin/users/{user_id}`  
**Authentication:** Required (Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "message": "User deleted successfully",
  "deleted_at": "2025-10-22T10:40:00Z"
}
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Not admin, cannot delete yourself
- `404`: User not found
- `500`: User deletion failed

---

### 4.6 Approve User

**Endpoint:** `POST /api/v1/admin/users/{user_id}/approve`  
**Authentication:** Required (Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "approved_by": "admin@example.com",
  "approved_at": "2025-10-22T10:40:00Z",
  "message": "User approved successfully"
}
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Not admin
- `404`: User not found
- `422`: Validation errors
- `500`: User approval failed

---

### 4.7 Reject User

**Endpoint:** `POST /api/v1/admin/users/{user_id}/reject`  
**Authentication:** Required (Admin)  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "user_id": "usr_abc123xyz",
  "reason": "Does not meet requirements"
}
```

**Success Response (200):**

```json
{
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "rejected_by": "admin@example.com",
  "rejected_at": "2025-10-22T10:40:00Z",
  "message": "User registration rejected"
}
```

---

### 4.8 Get Admin Statistics

**Endpoint:** `GET /api/v1/admin/stats`  
**Authentication:** Required (Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "total_users": 1250,
  "active_users": 1100,
  "pending_approvals": 15,
  "new_users_today": 8,
  "new_users_this_week": 47,
  "new_users_this_month": 203,
  "users_by_role": {
    "user": 1000,
    "manager": 200,
    "admin": 45,
    "super_admin": 5
  }
}
```

---

### 4.9 Get Audit Logs

**Endpoint:** `GET /api/v1/admin/audit-logs`  
**Authentication:** Required (Admin)  
**Rate Limit:** Standard

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `event_type`: Filter by event type (optional)
- `user_id`: Filter by user ID (optional)

**Success Response (200):**

```json
[
  {
    "event_id": "audit-001",
    "event_type": "user_login",
    "user_id": "usr_abc123xyz",
    "timestamp": "2025-10-22T10:30:00Z",
    "details": {
      "success": true
    },
    "ip_address": "192.168.1.1"
  }
]
```

---

## 5. Admin - RBAC Role Management

**Required Permissions:** Various (specified per endpoint)

### 5.1 List All Roles

**Endpoint:** `GET /api/v1/admin/rbac/roles`  
**Authentication:** Required (Admin or Super Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
[
  {
    "role_id": "user",
    "role_name": "Standard User",
    "description": "Basic user access",
    "permissions": ["users:read", "profile:read", "profile:write"],
    "priority": 0,
    "is_system_role": true,
    "inherits_from": [],
    "metadata": {},
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": null
  },
  {
    "role_id": "admin",
    "role_name": "Administrator",
    "description": "Full administrative access",
    "permissions": ["*"],
    "priority": 100,
    "is_system_role": true,
    "inherits_from": ["manager"],
    "metadata": {},
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-10-15T10:00:00Z"
  }
]
```

---

### 5.2 Get Role by ID

**Endpoint:** `GET /api/v1/admin/rbac/roles/{role_id}`  
**Authentication:** Required (Admin or Super Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "role_id": "manager",
  "role_name": "Manager",
  "description": "Team management access",
  "permissions": ["users:read", "users:write", "reports:read"],
  "priority": 50,
  "is_system_role": false,
  "inherits_from": ["user"],
  "metadata": {
    "department": "operations"
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-10-15T10:00:00Z"
}
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Not admin
- `404`: Role not found

---

### 5.3 Create Role

**Endpoint:** `POST /api/v1/admin/rbac/roles`  
**Authentication:** Required (Permissions: `roles:create`, `roles:write`)  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "role_id": "data_analyst",
  "role_name": "Data Analyst",
  "description": "Access to analytics and reporting",
  "permissions": ["reports:read", "analytics:read", "data:export"],
  "priority": 30,
  "inherits_from": ["user"],
  "is_system_role": false,
  "metadata": {
    "department": "analytics"
  }
}
```

**Field Validations:**

- `role_id`: Unique identifier (required)
- `role_name`: Human-readable name (required)
- `description`: Role description (required)
- `permissions`: List of permission IDs (default: [])
- `priority`: Integer (default: 0)
- `inherits_from`: List of parent role IDs (default: [])
- `is_system_role`: Boolean (default: false)
- `metadata`: Additional metadata (default: {})

**Success Response (201):**

```json
{
  "role_id": "data_analyst",
  "role_name": "Data Analyst",
  "description": "Access to analytics and reporting",
  "permissions": ["reports:read", "analytics:read", "data:export"],
  "priority": 30,
  "is_system_role": false,
  "inherits_from": ["user"],
  "metadata": {
    "department": "analytics"
  },
  "created_at": "2025-10-22T10:40:00Z",
  "updated_at": null
}
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Insufficient permissions
- `409`: Role already exists
- `400`: Parent role not found
- `500`: Role creation failed

---

### 5.4 Update Role

**Endpoint:** `PUT /api/v1/admin/rbac/roles/{role_id}`  
**Authentication:** Required (Permissions: `roles:update`, `roles:write`)  
**Rate Limit:** Standard

**Request Body (all fields optional):**

```json
{
  "role_name": "Senior Data Analyst",
  "description": "Advanced analytics access",
  "permissions": ["reports:read", "reports:write", "analytics:read", "data:export"],
  "priority": 35,
  "inherits_from": ["user"],
  "metadata": {
    "department": "analytics",
    "level": "senior"
  }
}
```

**Success Response (200):**

```json
{
  "role_id": "data_analyst",
  "role_name": "Senior Data Analyst",
  "description": "Advanced analytics access",
  "permissions": ["reports:read", "reports:write", "analytics:read", "data:export"],
  "priority": 35,
  "is_system_role": false,
  "inherits_from": ["user"],
  "metadata": {
    "department": "analytics",
    "level": "senior"
  },
  "created_at": "2025-10-22T10:40:00Z",
  "updated_at": "2025-10-22T11:00:00Z"
}
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Insufficient permissions, cannot modify system roles
- `404`: Role not found
- `400`: Parent role not found
- `500`: Role update failed

---

### 5.5 Delete Role

**Endpoint:** `DELETE /api/v1/admin/rbac/roles/{role_id}`  
**Authentication:** Required (Permissions: `roles:delete`, `roles:write`)  
**Rate Limit:** Standard

**Success Response (204):** No content

**Error Responses:**

- `401`: Not authenticated
- `403`: Insufficient permissions, system roles cannot be deleted
- `404`: Role not found or cannot be deleted
- `500`: Role deletion failed

---

### 5.6 Assign Role to User

**Endpoint:** `POST /api/v1/admin/rbac/users/roles`  
**Authentication:** Required (Permissions: `users:write`, `roles:assign`)  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "user_id": "usr_abc123xyz",
  "role_id": "data_analyst",
  "expires_at": "2026-10-22T10:40:00Z"
}
```

**Field Validations:**

- `user_id`: Target user ID (required)
- `role_id`: Role ID to assign (required)
- `expires_at`: ISO format expiration datetime (optional)

**Success Response (201):**

```json
{
  "user_id": "usr_abc123xyz",
  "role_id": "data_analyst",
  "assigned_by": "admin_xyz",
  "assigned_at": "2025-10-22T10:40:00Z",
  "expires_at": "2026-10-22T10:40:00Z"
}
```

**Error Responses:**

- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Role not found
- `500`: Role assignment failed

---

### 5.7 Remove Role from User

**Endpoint:** `DELETE /api/v1/admin/rbac/users/{user_id}/roles/{role_id}`  
**Authentication:** Required (Permissions: `users:write`, `roles:assign`)  
**Rate Limit:** Standard

**Success Response (204):** No content

**Error Responses:**

- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Role assignment not found
- `500`: Role removal failed

---

### 5.8 Get User Roles and Permissions

**Endpoint:** `GET /api/v1/admin/rbac/users/{user_id}/roles`  
**Authentication:** Required (Permissions: `users:read`, `roles:read`)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "user_id": "usr_abc123xyz",
  "roles": ["user", "data_analyst"],
  "permissions": [
    "users:read",
    "profile:read",
    "profile:write",
    "reports:read",
    "analytics:read",
    "data:export"
  ],
  "role_details": [
    {
      "role_id": "user",
      "role_name": "Standard User",
      "description": "Basic user access",
      "permissions": ["users:read", "profile:read", "profile:write"],
      "priority": 0,
      "is_system_role": true,
      "inherits_from": [],
      "metadata": {},
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": null
    },
    {
      "role_id": "data_analyst",
      "role_name": "Data Analyst",
      "description": "Access to analytics and reporting",
      "permissions": ["reports:read", "analytics:read", "data:export"],
      "priority": 30,
      "is_system_role": false,
      "inherits_from": ["user"],
      "metadata": {
        "department": "analytics"
      },
      "created_at": "2025-10-22T10:40:00Z",
      "updated_at": null
    }
  ]
}
```

---

### 5.9 List Permission Categories

**Endpoint:** `GET /api/v1/admin/rbac/permissions`  
**Authentication:** Required (Admin or Super Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "users": ["users:read", "users:write", "users:delete"],
  "roles": [
    "roles:read",
    "roles:write",
    "roles:create",
    "roles:update",
    "roles:delete",
    "roles:assign"
  ],
  "reports": ["reports:read", "reports:write", "reports:export"],
  "analytics": ["analytics:read", "analytics:write"],
  "audit": ["audit:read", "audit:export"],
  "system": ["system:admin", "cache:write"]
}
```

---

### 5.10 Get Cache Statistics

**Endpoint:** `GET /api/v1/admin/rbac/cache/stats`  
**Authentication:** Required (Admin or Super Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "hits": 15420,
  "misses": 342,
  "errors": 5,
  "hit_rate": "97.83%",
  "backend": "redis",
  "memory_cache_size": 128
}
```

---

### 5.11 Clear RBAC Cache

**Endpoint:** `POST /api/v1/admin/rbac/cache/clear`  
**Authentication:** Required (Permissions: `system:admin`, `cache:write`)  
**Rate Limit:** Standard

**Success Response (204):** No content

**Warning:** Use with caution. Clears all RBAC caches.

---

### 5.12 Sync Roles from Database

**Endpoint:** `POST /api/v1/admin/rbac/sync-database`  
**Authentication:** Required (Admin or Super Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "message": "Roles synced successfully"
}
```

**Error Response (500):**

```json
{
  "detail": "Failed to sync roles from database"
}
```

---

## 6. GDPR Compliance

### 6.1 Export My Data

**Endpoint:** `POST /api/v1/gdpr/export/my-data`  
**Authentication:** Required  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "format": "json",
  "include_audit_logs": true,
  "include_metadata": true
}
```

**Field Validations:**

- `format`: `"json"` or `"csv"` (default: `"json"`)
- `include_audit_logs`: Boolean (default: `true`)
- `include_metadata`: Boolean (default: `true`)

**Success Response (200):**

- **Content-Type:** `application/json; charset=utf-8` (for JSON) or `text/csv` (for CSV)
- **Headers:**
  - `Content-Disposition: attachment; filename="gdpr_export_{user_id}_{export_id}.json"`
  - `X-Export-ID: exp_abc123`
  - `X-Record-Count: 42`

**Response Body (JSON format):**

```json
{
  "metadata": {
    "export_id": "exp_abc123",
    "user_id": "usr_xyz789",
    "export_date": "2025-10-22T10:40:00Z",
    "format": "json",
    "record_count": 42,
    "categories": ["user_profile", "account_settings", "activity_logs"]
  },
  "personal_data": {
    "user_profile": {
      "user_id": "usr_xyz789",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2025-10-15T10:30:00Z"
    },
    "account_settings": {
      "language": "en",
      "timezone": "UTC",
      "email_notifications": true
    },
    "activity_logs": [
      {
        "action": "login",
        "timestamp": "2025-10-22T10:00:00Z",
        "ip_address": "192.168.1.1"
      }
    ]
  }
}
```

**GDPR Compliance Notes:**

- Implements Article 15 (Right of Access)
- Data provided in structured, machine-readable format
- Includes all personal data categories

---

### 6.2 Delete My Account

**Endpoint:** `DELETE /api/v1/gdpr/delete/my-account`  
**Authentication:** Required  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "confirmation": "DELETE MY ACCOUNT",
  "reason": "No longer need the service"
}
```

**Field Validations:**

- `confirmation`: Must be exactly `"DELETE MY ACCOUNT"` (required)
- `reason`: Optional reason, max 500 chars

**Success Response (200):**

```json
{
  "deletion_id": "del_xyz789",
  "user_id": "usr_abc123",
  "deletion_date": "2025-10-22T10:40:00Z",
  "records_deleted": 47,
  "categories_deleted": ["user_profile", "activity_logs", "audit_logs_anonymized", "sessions"],
  "anonymization_applied": true
}
```

**GDPR Compliance Notes:**

- Implements Article 17 (Right to Erasure / "Right to be Forgotten")
- User profile: DELETED
- Activity logs: DELETED
- Audit logs: ANONYMIZED (PII removed, retained for compliance)
- Financial records: RETAINED (legal requirement, 7 years)
- **WARNING:** This action is IRREVERSIBLE

**Error Response (500):**

```json
{
  "detail": "Account deletion failed: {error_message}"
}
```

---

### 6.3 Get Export Status

**Endpoint:** `GET /api/v1/gdpr/export/status/{export_id}`  
**Authentication:** Required  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "export_id": "exp_abc123",
  "status": "synchronous_mode",
  "message": "Exports are currently synchronous. For async support, implement DynamoDB tracking table.",
  "implementation_note": "See router.py docstring for implementation details"
}
```

**Note:** Currently exports are synchronous. This endpoint is a placeholder for future async export support.

---

## 7. Audit Logs

**Required Role:** `admin`, `super_admin`, `auditor`

### 7.1 Query Audit Logs

**Endpoint:** `GET /api/v1/audit/logs`  
**Authentication:** Required (Auditor or Admin)  
**Rate Limit:** Standard

**Query Parameters:**

- `action`: Filter by action (optional)
- `resource`: Filter by resource type (optional)
- `user_id`: Filter by user ID (optional)
- `start_date`: Start date UTC (optional, ISO format)
- `end_date`: End date UTC (optional, ISO format)
- `severity`: Filter by severity (`info`, `warning`, `error`, `critical`) (optional)
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)

**Example:**

```
GET /api/v1/audit/logs?action=user_login&severity=info&start_date=2025-10-01T00:00:00Z&end_date=2025-10-22T23:59:59Z&page=1&limit=20
```

**Success Response (200):**

```json
{
  "items": [
    {
      "audit_id": "audit_abc123",
      "user_id": "usr_xyz789",
      "action": "user_login",
      "resource_type": "authentication",
      "resource_id": null,
      "severity": "info",
      "timestamp": "2025-10-22T10:30:00Z",
      "metadata": {
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "success": true
      },
      "outcome": "success",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    }
  ],
  "total": 1542,
  "limit": 20,
  "offset": 0,
  "has_next": true,
  "has_prev": false
}
```

**Error Responses:**

- `400`: Invalid date range (start_date > end_date)
- `401`: Not authenticated
- `403`: Not auditor/admin
- `422`: Validation errors
- `500`: Audit log retrieval failed

---

### 7.2 Get Audit Summary

**Endpoint:** `GET /api/v1/audit/summary`  
**Authentication:** Required (Auditor or Admin)  
**Rate Limit:** Standard

**Success Response (200):**

```json
{
  "total_logs": 15420,
  "recent_actions": [
    "user_login",
    "user_updated",
    "role_assigned",
    "user_created",
    "password_changed"
  ],
  "security_events": 247
}
```

**Error Response (500):**

```json
{
  "code": "RETRIEVAL_FAILED",
  "message": "Failed to retrieve audit summary",
  "details": {
    "data": []
  }
}
```

---

## 8. Frontend Error Logging

### 8.1 Log Frontend Errors

**Endpoint:** `POST /api/v1/logs/frontend-errors`  
**Authentication:** Not required  
**Rate Limit:** Standard

**Request Body:**

```json
{
  "message": "TypeError: Cannot read property 'map' of undefined",
  "stack": "Error: TypeError: Cannot read property 'map' of undefined\n    at Component.render (app.js:123:45)\n    ...",
  "url": "https://app.example.com/dashboard",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "timestamp": "2025-10-22T10:40:00.123Z",
  "level": "error",
  "metadata": {
    "component": "Dashboard",
    "user_id": "usr_abc123",
    "session_id": "sess_xyz789"
  }
}
```

**Field Validations:**

- `message`: Error message (required)
- `stack`: Stack trace (optional)
- `url`: URL where error occurred (optional)
- `user_agent`: Browser user agent (optional)
- `timestamp`: Client timestamp ISO format (optional)
- `level`: Log level - `"error"`, `"warning"`, `"info"` (default: `"error"`)
- `metadata`: Additional metadata (optional)

**Success Response (202):**

```json
{
  "status": "accepted",
  "message": "Error logged successfully"
}
```

**Use Cases:**

- Log JavaScript errors
- Track user-facing issues
- Monitor client-side performance
- Debug production issues

---

## 9. Common Response Codes

| Code | Status                | Description                              |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Request successful                       |
| 201  | Created               | Resource created successfully            |
| 202  | Accepted              | Request accepted (async processing)      |
| 204  | No Content            | Request successful, no content to return |
| 400  | Bad Request           | Invalid request format or parameters     |
| 401  | Unauthorized          | Authentication required or token invalid |
| 403  | Forbidden             | Insufficient permissions                 |
| 404  | Not Found             | Resource not found                       |
| 409  | Conflict              | Resource already exists                  |
| 422  | Unprocessable Entity  | Validation errors                        |
| 429  | Too Many Requests     | Rate limit exceeded                      |
| 500  | Internal Server Error | Server error                             |

---

## 10. Error Response Format

All error responses follow a consistent format:

### Standard Error Response

```json
{
  "error_code": "ERROR_CODE_HERE",
  "message": "Human-readable error message",
  "status_code": 400,
  "timestamp": "2025-10-22T10:40:00Z",
  "path": "/api/v1/auth/login",
  "details": {
    "additional": "context"
  }
}
```

### Field Validation Error Response

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "status_code": 422,
  "field_errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "EMAIL_INVALID",
      "severity": "error"
    },
    {
      "field": "password",
      "message": "Password must contain at least 8 characters",
      "code": "PASSWORD_TOO_SHORT",
      "severity": "error"
    }
  ]
}
```

### Common Error Codes

#### Authentication Errors

- `INVALID_CREDENTIALS`: Invalid email or password
- `TOKEN_INVALID`: Invalid or expired token
- `TOKEN_MISSING`: Authorization token not provided
- `EMAIL_NOT_VERIFIED`: Email not verified
- `USER_INACTIVE`: User account is inactive
- `USER_NOT_APPROVED`: User pending admin approval

#### Validation Errors

- `VALIDATION_ERROR`: General validation error
- `EMAIL_INVALID`: Invalid email format
- `PASSWORD_TOO_SHORT`: Password less than 8 characters
- `PASSWORD_WEAK`: Password doesn't meet complexity requirements
- `FIELD_REQUIRED`: Required field missing

#### User Management Errors

- `USER_NOT_FOUND`: User does not exist
- `USER_ALREADY_EXISTS`: User with email already exists
- `PROFILE_NOT_FOUND`: User profile not found
- `SELF_DELETE_FORBIDDEN`: Cannot delete your own account

#### Authorization Errors

- `ACCESS_DENIED`: Insufficient permissions
- `ADMIN_REQUIRED`: Admin access required
- `RBAC_ACCESS_DENIED`: RBAC permission denied

#### Rate Limiting Errors

- `RATE_LIMIT_EXCEEDED`: Too many requests

#### System Errors

- `INTERNAL_ERROR`: Unexpected server error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

---

## 11. Authentication Flow Examples

### Standard JWT Flow

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:8001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
  }),
});

const { access_token, refresh_token } = await loginResponse.json();

// 2. Store tokens securely (use httpOnly cookies in production)
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// 3. Make authenticated request
const profileResponse = await fetch('http://localhost:8001/api/v1/profile/me', {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});

const profile = await profileResponse.json();

// 4. Handle token expiration
if (profileResponse.status === 401) {
  // Refresh token
  const refreshResponse = await fetch('http://localhost:8001/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refresh_token}`,
    },
  });

  const newTokens = await refreshResponse.json();
  localStorage.setItem('access_token', newTokens.access_token);
  localStorage.setItem('refresh_token', newTokens.refresh_token);

  // Retry original request
  const retryResponse = await fetch('http://localhost:8001/api/v1/profile/me', {
    headers: {
      Authorization: `Bearer ${newTokens.access_token}`,
    },
  });
}

// 5. Logout
await fetch('http://localhost:8001/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});

localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

### Secure Cookie Flow (Recommended for Production)

```javascript
// 1. Login (tokens stored in httpOnly cookies automatically)
const loginResponse = await fetch('http://localhost:8001/api/v1/auth/login-secure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
  }),
});

const { user } = await loginResponse.json();
// No tokens in response body - they're in httpOnly cookies

// 2. Get CSRF token
const csrfResponse = await fetch('http://localhost:8001/api/v1/auth/csrf-token', {
  credentials: 'include',
});

const { csrf_token } = await csrfResponse.json();
localStorage.setItem('csrf_token', csrf_token);

// 3. Make authenticated request
const profileResponse = await fetch('http://localhost:8001/api/v1/profile/me', {
  credentials: 'include', // Automatically sends cookies
});

const profile = await profileResponse.json();

// 4. Make mutating request (POST/PUT/DELETE) with CSRF token
const updateResponse = await fetch('http://localhost:8001/api/v1/profile/me', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': localStorage.getItem('csrf_token'),
  },
  credentials: 'include',
  body: JSON.stringify({
    first_name: 'Jane',
    last_name: 'Smith',
  }),
});

// 5. Refresh token (automatic with cookies)
const refreshResponse = await fetch('http://localhost:8001/api/v1/auth/refresh-secure', {
  method: 'POST',
  credentials: 'include',
});

// 6. Logout
await fetch('http://localhost:8001/api/v1/auth/logout-secure', {
  method: 'POST',
  credentials: 'include',
});

localStorage.removeItem('csrf_token');
```

### Registration Flow

```javascript
// 1. Register new user
const registerResponse = await fetch('http://localhost:8001/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'SecurePass123!',
    confirm_password: 'SecurePass123!',
    first_name: 'John',
    last_name: 'Doe',
  }),
});

const registerData = await registerResponse.json();
// registerData.verification_required === true
// registerData.approval_required === true

// 2. User receives email with verification link
// Link contains token: https://app.example.com/verify-email?token=xyz

// 3. Verify email
const verifyResponse = await fetch('http://localhost:8001/api/v1/auth/verify-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: 'xyz',
  }),
});

const verifyData = await verifyResponse.json();
// verifyData.approval_required === true (still needs admin approval)

// 4. Admin approves user (via admin panel)
// Now user can login

// 5. Login
const loginResponse = await fetch('http://localhost:8001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'SecurePass123!',
  }),
});

const { access_token } = await loginResponse.json();
```

### Password Reset Flow

```javascript
// 1. User forgets password
const forgotResponse = await fetch('http://localhost:8001/api/v1/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
  }),
});

// Always returns success (security)

// 2. User receives email with reset link
// Link contains token: https://app.example.com/reset-password?token=xyz

// 3. Reset password
const resetResponse = await fetch('http://localhost:8001/api/v1/auth/reset-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: 'xyz',
    new_password: 'NewSecurePass123!',
    confirm_password: 'NewSecurePass123!',
  }),
});

const resetData = await resetResponse.json();
// resetData.success === true

// 4. Login with new password
```

---

## Rate Limiting

**Default Limits:**

- Standard endpoints: 100 requests per minute per IP
- Login endpoints: 5 requests per minute per IP, 3 requests per minute per email
- Registration: 10 requests per hour per IP

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1729594800
```

**Rate Limit Exceeded Response (429):**

```json
{
  "error_code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "status_code": 429,
  "retry_after": 60
}
```

---

## CORS Configuration

**Development:**

- Allowed Origins: `http://localhost:3000`, `http://localhost:3001`
- Credentials: Allowed

**Production:**

- Configure allowed origins in environment variables
- Credentials: Allowed for cookie-based auth

---

## Pagination

List endpoints support pagination with these query parameters:

- `page`: Page number (1-indexed)
- `limit`: Items per page (max 100)

**Paginated Response Format:**

```json
{
  "items": [...],
  "total": 1542,
  "limit": 20,
  "offset": 0,
  "has_next": true,
  "has_prev": false
}
```

---

## Date/Time Format

All timestamps are in ISO 8601 format with UTC timezone:

- Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `2025-10-22T10:40:00.123Z`

---

## Best Practices for UI Integration

1. **Token Management:**
   - Use secure cookie auth for production (`/auth/login-secure`)
   - Implement automatic token refresh
   - Clear tokens on logout

2. **Error Handling:**
   - Display field-level validation errors
   - Show user-friendly error messages
   - Log errors to backend (`/logs/frontend-errors`)

3. **Security:**
   - Never store tokens in localStorage for production
   - Include CSRF tokens for cookie-based auth
   - Validate all inputs client-side before submission

4. **UX:**
   - Show loading states during API calls
   - Implement retry logic for failed requests
   - Display rate limit messages clearly

5. **Performance:**
   - Cache non-sensitive data
   - Implement debouncing for search/filter
   - Use pagination for large lists

---

## Support

For questions or issues with API integration:

- Documentation: This file
- API Errors: Check error codes section
- Contact: backend-team@example.com

---

**End of Documentation**
