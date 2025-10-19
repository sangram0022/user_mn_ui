# Backend API Documentation - Complete Reference Guide

**Version:** 2.0  
**Status:** Production Ready  
**Last Updated:** October 19, 2025  
**Audience:** Frontend React Team  
**Purpose:** Single source of truth for all backend API endpoints

---

## Table of Contents

1. [Overview & Base Configuration](#overview--base-configuration)
2. [Authentication APIs](#authentication-apis)
3. [Secure Authentication APIs (httpOnly Cookies)](#secure-authentication-apis-httonly-cookies)
4. [User Profile APIs](#user-profile-apis)
5. [Admin User Management APIs](#admin-user-management-apis)
6. [Admin Role Management APIs](#admin-role-management-apis)
7. [RBAC (Role-Based Access Control) APIs](#rbac-role-based-access-control-apis)
8. [Audit Logging APIs](#audit-logging-apis)
9. [GDPR Compliance APIs](#gdpr-compliance-apis)
10. [Response Models & Data Structures](#response-models--data-structures)
11. [Error Handling & Status Codes](#error-handling--status-codes)
12. [Authentication & Security](#authentication--security)

---

## Overview & Base Configuration

### Base URL

```
http://localhost:8000/api
```

### API Versioning

All endpoints are under `/api/v1` when versioned. Current endpoints use base `/api` structure.

### Common Headers

**All Requests Should Include:**

```
Content-Type: application/json
```

**Authentication Header (where required):**

```
Authorization: Bearer <jwt_token>
```

### Rate Limiting

- **Default:** 100 requests per minute per user
- **Endpoint-specific overrides:** Defined in individual endpoint documentation
- **Response Header:** `X-RateLimit-Remaining`

### Pagination

Common query parameters for list endpoints:

- `skip`: Number of items to skip (default: 0)
- `limit`: Number of items to return (default: 20, max: 100)
- `sort_by`: Field to sort by
- `order`: "asc" or "desc" (default: "desc")

---

## Authentication APIs

### Base Path: `/auth`

These endpoints handle user authentication without relying on httpOnly cookies. Tokens are returned in response body.

#### 1. User Login

```
POST /auth/login
```

**Description:** Authenticate user and receive access token and refresh token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_email_verified": true,
    "is_active": true,
    "created_at": "2025-10-19T10:00:00Z"
  },
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**Status Codes:**

- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

**Errors:**

```json
{
  "detail": "Invalid email or password",
  "code": "AUTH_INVALID_CREDENTIALS",
  "timestamp": "2025-10-19T10:00:00Z"
}
```

---

#### 2. User Registration

```
POST /auth/register
```

**Description:** Register a new user account.

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&\*)

**Response (201 Created):**

```json
{
  "id": "user-456",
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890",
  "is_email_verified": false,
  "created_at": "2025-10-19T10:00:00Z",
  "message": "Registration successful. Please check your email for verification link."
}
```

**Status Codes:**

- `201 Created` - User created successfully
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists
- `422 Unprocessable Entity` - Validation failed

---

#### 3. Verify Email

```
POST /auth/verify-email
```

**Description:** Verify user email using verification token received in email.

**Request Body:**

```json
{
  "token": "verification-token-received-in-email"
}
```

**Response (200 OK):**

```json
{
  "message": "Email verified successfully",
  "is_email_verified": true
}
```

**Status Codes:**

- `200 OK` - Email verified
- `400 Bad Request` - Invalid or expired token

---

#### 4. Resend Verification Email

```
POST /auth/resend-verification
```

**Description:** Request a new verification email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "message": "Verification email sent",
  "email": "user@example.com"
}
```

---

#### 5. Refresh Token

```
POST /auth/refresh
```

**Description:** Get a new access token using refresh token.

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Status Codes:**

- `200 OK` - Token refreshed
- `401 Unauthorized` - Invalid or expired refresh token

---

#### 6. Forgot Password

```
POST /auth/forgot-password
```

**Description:** Request password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "message": "If this email exists, a password reset link has been sent",
  "email": "user@example.com"
}
```

---

#### 7. Reset Password

```
POST /auth/reset-password
```

**Description:** Reset password using token from email.

**Request Body:**

```json
{
  "token": "password-reset-token",
  "new_password": "NewSecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "message": "Password reset successfully",
  "email": "user@example.com"
}
```

**Status Codes:**

- `200 OK` - Password reset successful
- `400 Bad Request` - Invalid or expired token
- `422 Unprocessable Entity` - Password does not meet requirements

---

#### 8. Change Password (Authenticated)

```
POST /auth/change-password
```

**Description:** Change password for authenticated user.

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "current_password": "CurrentPassword123!",
  "new_password": "NewSecurePassword456!"
}
```

**Response (200 OK):**

```json
{
  "message": "Password changed successfully"
}
```

**Status Codes:**

- `200 OK` - Password changed
- `401 Unauthorized` - Not authenticated
- `400 Bad Request` - Current password incorrect
- `422 Unprocessable Entity` - New password invalid

---

#### 9. Logout

```
POST /auth/logout
```

**Description:** Logout user and invalidate session.

**Authentication:** Required (Bearer token)

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

---

## Secure Authentication APIs (httpOnly Cookies)

### Base Path: `/auth`

These endpoints handle authentication using httpOnly cookies for enhanced security. Tokens are stored in HTTP-only, Secure cookies that cannot be accessed via JavaScript.

**Use Cases:**

- Maximum security requirements
- Protection against XSS attacks
- Automatic token refresh via cookies

#### 1. Secure Login

```
POST /auth/login-secure
```

**Description:** Login with httpOnly cookie-based token storage.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_email_verified": true,
    "is_active": true
  },
  "token_type": "Bearer",
  "expires_in": 3600,
  "message": "Login successful. Tokens set in httpOnly cookies."
}
```

**Response Headers:**

```
Set-Cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/
Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/
Set-Cookie: CSRF-Token=<token>; Secure; SameSite=Strict; Path=/
```

---

#### 2. Get CSRF Token

```
GET /auth/csrf-token
```

**Description:** Retrieve CSRF token for POST/PUT/DELETE requests.

**Response (200 OK):**

```json
{
  "csrf_token": "csrf-token-value",
  "expires_in": 3600
}
```

**Usage:** Include CSRF token in request header for state-changing operations:

```
X-CSRF-Token: <csrf-token>
```

---

#### 3. Validate CSRF

```
POST /auth/validate-csrf
```

**Description:** Validate CSRF token.

**Request Body:**

```json
{
  "csrf_token": "csrf-token-value"
}
```

**Response (200 OK):**

```json
{
  "valid": true,
  "message": "CSRF token is valid"
}
```

---

#### 4. Secure Logout

```
POST /auth/logout-secure
```

**Description:** Logout and clear httpOnly cookies.

**Response (200 OK):**

```json
{
  "message": "Logged out successfully. Tokens cleared."
}
```

**Response Headers:**

```
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
Set-Cookie: CSRF-Token=; Secure; SameSite=Strict; Max-Age=0
```

---

#### 5. Refresh Token (Secure)

```
POST /auth/refresh-secure
```

**Description:** Refresh access token using httpOnly refresh token cookie.

**Response (200 OK):**

```json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "message": "Token refreshed successfully"
}
```

**Response Headers:**

```
Set-Cookie: access_token=<new_jwt>; HttpOnly; Secure; SameSite=Strict; Path=/
```

---

## User Profile APIs

### Base Path: `/profile`

#### 1. Get Current User Profile

```
GET /profile/me
```

**Description:** Retrieve authenticated user's profile.

**Authentication:** Required (Bearer token)

**Response (200 OK):**

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Software developer",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications_enabled": true,
    "email_notifications": true
  },
  "roles": [
    {
      "id": "role-1",
      "name": "user",
      "description": "Regular user",
      "permissions": ["read_profile", "update_profile"]
    }
  ],
  "is_email_verified": true,
  "is_active": true,
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-10-19T10:00:00Z",
  "last_login": "2025-10-19T09:30:00Z"
}
```

**Status Codes:**

- `200 OK` - Profile retrieved
- `401 Unauthorized` - Not authenticated

---

#### 2. Update User Profile

```
PUT /profile/me
```

**Description:** Update authenticated user's profile.

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "bio": "Updated bio",
  "preferences": {
    "theme": "light",
    "language": "en",
    "notifications_enabled": true,
    "email_notifications": false
  }
}
```

**Response (200 OK):**

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "bio": "Updated bio",
  "preferences": {
    "theme": "light",
    "language": "en",
    "notifications_enabled": true,
    "email_notifications": false
  },
  "updated_at": "2025-10-19T10:00:00Z"
}
```

**Status Codes:**

- `200 OK` - Profile updated
- `401 Unauthorized` - Not authenticated
- `422 Unprocessable Entity` - Validation failed

---

## Admin User Management APIs

### Base Path: `/admin`

**Authentication:** Required (Bearer token with admin role)

#### 1. List All Users

```
GET /admin/users
```

**Query Parameters:**

- `skip`: Number to skip (default: 0)
- `limit`: Number to return (default: 20, max: 100)
- `sort_by`: Field to sort (email, created_at, first_name)
- `order`: Sort order (asc/desc, default: desc)
- `email`: Filter by email (partial match)
- `is_active`: Filter by status (true/false)
- `is_email_verified`: Filter by email verification

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "user-1",
      "email": "user1@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true,
      "is_email_verified": true,
      "created_at": "2025-01-01T10:00:00Z",
      "last_login": "2025-10-19T09:30:00Z",
      "roles": ["user"]
    }
  ],
  "total": 100,
  "skip": 0,
  "limit": 20
}
```

---

#### 2. Get User Details

```
GET /admin/users/{user_id}
```

**Path Parameters:**

- `user_id`: UUID of the user

**Response (200 OK):**

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Software developer",
  "is_email_verified": true,
  "is_active": true,
  "roles": ["user"],
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-10-19T10:00:00Z",
  "last_login": "2025-10-19T09:30:00Z"
}
```

---

#### 3. Create User (Admin)

```
POST /admin/users
```

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890",
  "roles": ["user"]
}
```

**Response (201 Created):**

```json
{
  "id": "user-456",
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890",
  "roles": ["user"],
  "is_active": true,
  "created_at": "2025-10-19T10:00:00Z",
  "message": "User created successfully"
}
```

---

#### 4. Update User (Admin)

```
PUT /admin/users/{user_id}
```

**Request Body:**

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890",
  "is_active": true,
  "roles": ["user", "moderator"]
}
```

**Response (200 OK):**

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "is_active": true,
  "roles": ["user", "moderator"],
  "updated_at": "2025-10-19T10:00:00Z"
}
```

---

#### 5. Delete User

```
DELETE /admin/users/{user_id}
```

**Response (200 OK):**

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "message": "User deleted successfully"
}
```

---

#### 6. Approve User

```
POST /admin/users/{user_id}/approve
```

**Request Body:**

```json
{
  "message": "User approved for platform access"
}
```

**Response (200 OK):**

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "is_approved": true,
  "approved_at": "2025-10-19T10:00:00Z",
  "message": "User approved successfully"
}
```

---

#### 7. Reject User

```
POST /admin/users/{user_id}/reject
```

**Request Body:**

```json
{
  "reason": "Does not meet platform requirements"
}
```

**Response (200 OK):**

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "is_rejected": true,
  "rejection_reason": "Does not meet platform requirements",
  "rejected_at": "2025-10-19T10:00:00Z"
}
```

---

## Admin Role Management APIs

### Base Path: `/admin`

#### 1. Get All Roles

```
GET /admin/roles
```

**Query Parameters:**

- `skip`: Number to skip (default: 0)
- `limit`: Number to return (default: 20)

**Response (200 OK):**

```json
[
  {
    "id": "role-1",
    "name": "user",
    "description": "Regular user role",
    "permissions": ["read_profile", "update_profile", "read_posts"],
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-10-19T10:00:00Z"
  },
  {
    "id": "role-2",
    "name": "moderator",
    "description": "Moderator role",
    "permissions": [
      "read_profile",
      "update_profile",
      "read_posts",
      "delete_posts",
      "moderate_users"
    ],
    "created_at": "2025-01-01T10:00:00Z"
  }
]
```

---

#### 2. Create Role

```
POST /admin/roles
```

**Request Body:**

```json
{
  "name": "editor",
  "description": "Editor role with content management permissions",
  "permissions": ["read_posts", "create_posts", "update_posts", "delete_own_posts"]
}
```

**Response (201 Created):**

```json
{
  "id": "role-3",
  "name": "editor",
  "description": "Editor role with content management permissions",
  "permissions": ["read_posts", "create_posts", "update_posts", "delete_own_posts"],
  "created_at": "2025-10-19T10:00:00Z"
}
```

---

#### 3. Update Role

```
PUT /admin/roles/{role_id}
```

**Request Body:**

```json
{
  "description": "Updated editor role description",
  "permissions": ["read_posts", "create_posts", "update_posts", "delete_posts"]
}
```

**Response (200 OK):**

```json
{
  "id": "role-3",
  "name": "editor",
  "description": "Updated editor role description",
  "permissions": ["read_posts", "create_posts", "update_posts", "delete_posts"],
  "updated_at": "2025-10-19T10:00:00Z"
}
```

---

#### 4. Delete Role

```
DELETE /admin/roles/{role_id}
```

**Response (200 OK):**

```json
{
  "id": "role-3",
  "name": "editor",
  "message": "Role deleted successfully"
}
```

---

#### 5. Get Admin Statistics

```
GET /admin/stats
```

**Response (200 OK):**

```json
{
  "total_users": 150,
  "active_users": 120,
  "verified_emails": 145,
  "new_users_today": 5,
  "new_users_this_week": 23,
  "total_roles": 5,
  "total_permissions": 32,
  "system_status": "healthy",
  "uptime": "99.9%",
  "generated_at": "2025-10-19T10:00:00Z"
}
```

---

#### 6. Get Audit Logs (Admin)

```
GET /admin/audit-logs
```

**Query Parameters:**

- `skip`: Number to skip (default: 0)
- `limit`: Number to return (default: 20)
- `user_id`: Filter by user
- `action`: Filter by action type
- `start_date`: Filter from date (ISO 8601)
- `end_date`: Filter to date (ISO 8601)

**Response (200 OK):**

```json
[
  {
    "id": "audit-1",
    "user_id": "user-123",
    "user_email": "user@example.com",
    "action": "UPDATE_PROFILE",
    "resource_type": "user_profile",
    "resource_id": "user-123",
    "changes": {
      "first_name": ["John", "Johnny"],
      "bio": [null, "Software developer"]
    },
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "status": "success",
    "timestamp": "2025-10-19T10:00:00Z"
  }
]
```

---

## RBAC (Role-Based Access Control) APIs

### Base Path: `/admin`

#### 1. Get Permissions

```
GET /admin/permissions
```

**Response (200 OK):**

```json
[
  {
    "id": "perm-1",
    "name": "read_profile",
    "description": "Read user profile",
    "resource_type": "profile",
    "action": "read"
  },
  {
    "id": "perm-2",
    "name": "update_profile",
    "description": "Update user profile",
    "resource_type": "profile",
    "action": "update"
  }
]
```

---

#### 2. Get User Permissions

```
GET /admin/users/{user_id}/permissions
```

**Response (200 OK):**

```json
{
  "user_id": "user-123",
  "email": "user@example.com",
  "roles": ["user", "moderator"],
  "permissions": ["read_profile", "update_profile", "read_posts", "delete_posts", "moderate_users"],
  "computed_at": "2025-10-19T10:00:00Z"
}
```

---

#### 3. Check Permission

```
GET /admin/users/{user_id}/check-permission
```

**Query Parameters:**

- `permission`: Permission name to check

**Response (200 OK):**

```json
{
  "user_id": "user-123",
  "permission": "update_profile",
  "has_permission": true
}
```

---

#### 4. Assign Role to User

```
POST /admin/users/{user_id}/roles
```

**Request Body:**

```json
{
  "role_id": "role-2"
}
```

**Response (201 Created):**

```json
{
  "user_id": "user-123",
  "role_id": "role-2",
  "role_name": "moderator",
  "message": "Role assigned successfully"
}
```

---

#### 5. Remove Role from User

```
DELETE /admin/users/{user_id}/roles/{role_id}
```

**Response (200 OK):**

```json
{
  "user_id": "user-123",
  "role_id": "role-2",
  "message": "Role removed successfully"
}
```

---

#### 6. Get User Roles

```
GET /admin/users/{user_id}/roles
```

**Response (200 OK):**

```json
{
  "user_id": "user-123",
  "email": "user@example.com",
  "roles": [
    {
      "id": "role-1",
      "name": "user",
      "description": "Regular user"
    },
    {
      "id": "role-2",
      "name": "moderator",
      "description": "Moderator role"
    }
  ]
}
```

---

#### 7. List Role Permissions

```
GET /admin/roles/{role_id}/permissions
```

**Response (200 OK):**

```json
{
  "role_id": "role-2",
  "role_name": "moderator",
  "permissions": ["read_profile", "update_profile", "read_posts", "delete_posts", "moderate_users"]
}
```

---

#### 8. Add Permission to Role

```
POST /admin/roles/{role_id}/permissions
```

**Request Body:**

```json
{
  "permission_id": "perm-5"
}
```

**Response (201 Created):**

```json
{
  "role_id": "role-2",
  "permission_id": "perm-5",
  "message": "Permission added to role"
}
```

---

#### 9. Remove Permission from Role

```
DELETE /admin/roles/{role_id}/permissions/{permission_id}
```

**Response (200 OK):**

```json
{
  "role_id": "role-2",
  "permission_id": "perm-5",
  "message": "Permission removed from role"
}
```

---

#### 10. Verify User Permission

```
POST /admin/users/{user_id}/verify-permission
```

**Request Body:**

```json
{
  "permission": "update_profile"
}
```

**Response (200 OK):**

```json
{
  "user_id": "user-123",
  "permission": "update_profile",
  "granted": true,
  "through_roles": ["user", "moderator"]
}
```

---

## Audit Logging APIs

### Base Path: `/audit`

#### 1. Query Audit Logs

```
GET /audit/logs
```

**Query Parameters:**

- `skip`: Number to skip (default: 0)
- `limit`: Number to return (default: 20)
- `user_id`: Filter by user ID
- `action`: Filter by action type (UPDATE_PROFILE, DELETE_USER, etc.)
- `resource_type`: Filter by resource type (user, profile, role)
- `start_date`: From date (ISO 8601)
- `end_date`: To date (ISO 8601)
- `status`: Filter by status (success, failure)

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "audit-1",
      "timestamp": "2025-10-19T10:00:00Z",
      "user_id": "user-123",
      "user_email": "user@example.com",
      "action": "UPDATE_PROFILE",
      "resource_type": "user_profile",
      "resource_id": "user-123",
      "changes": {
        "first_name": ["John", "Johnny"],
        "bio": [null, "Software developer"]
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "status": "success",
      "error_message": null,
      "request_id": "req-xyz-123"
    }
  ],
  "total": 5432,
  "skip": 0,
  "limit": 20
}
```

---

#### 2. Get Audit Summary

```
GET /audit/summary
```

**Query Parameters:**

- `start_date`: From date (ISO 8601)
- `end_date`: To date (ISO 8601)
- `group_by`: Group by (action, user_id, resource_type, default: action)

**Response (200 OK):**

```json
{
  "period": {
    "start": "2025-10-01T00:00:00Z",
    "end": "2025-10-19T23:59:59Z"
  },
  "summary": {
    "total_events": 5432,
    "successful_events": 5400,
    "failed_events": 32,
    "by_action": {
      "UPDATE_PROFILE": 1200,
      "DELETE_USER": 45,
      "LOGIN": 3000,
      "CREATE_USER": 187
    },
    "by_resource_type": {
      "user": 2100,
      "profile": 1500,
      "role": 800,
      "permission": 32
    }
  }
}
```

---

## GDPR Compliance APIs

### Base Path: `/gdpr`

These endpoints implement GDPR Article 15 (Right of Access) and Article 17 (Right to Erasure).

#### 1. Export User Data

```
POST /gdpr/export/my-data
```

**Description:** Export all personal data associated with the authenticated user.

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "format": "json",
  "include_audit_logs": true,
  "include_metadata": true
}
```

**Supported Formats:**

- `json` - JSON format
- `csv` - CSV format

**Response (202 Accepted):**

```json
{
  "export_id": "export-123",
  "status": "processing",
  "format": "json",
  "user_id": "user-123",
  "user_email": "user@example.com",
  "created_at": "2025-10-19T10:00:00Z",
  "estimated_completion": "2025-10-19T10:05:00Z",
  "message": "Data export in progress. You will receive download link via email."
}
```

---

#### 2. Check Export Status

```
GET /gdpr/export/status/{export_id}
```

**Response (200 OK) - Processing:**

```json
{
  "export_id": "export-123",
  "status": "processing",
  "progress": 45,
  "message": "Processing user data...",
  "created_at": "2025-10-19T10:00:00Z"
}
```

**Response (200 OK) - Complete:**

```json
{
  "export_id": "export-123",
  "status": "completed",
  "progress": 100,
  "download_url": "https://example.com/exports/export-123/data.json",
  "download_expires_at": "2025-10-26T10:00:00Z",
  "file_size_bytes": 2048,
  "created_at": "2025-10-19T10:00:00Z",
  "completed_at": "2025-10-19T10:05:00Z"
}
```

---

#### 3. Delete Account (Right to Erasure)

```
DELETE /gdpr/delete/my-account
```

**Description:** Permanently delete user account and all personal data.

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "confirmation": "DELETE MY ACCOUNT",
  "reason": "No longer needed"
}
```

**Confirmation String:** User must type exactly "DELETE MY ACCOUNT" to confirm deletion.

**Response (200 OK):**

```json
{
  "account_id": "user-123",
  "email": "user@example.com",
  "status": "deletion_scheduled",
  "deletion_date": "2025-10-20T10:00:00Z",
  "grace_period_expires": "2025-10-20T23:59:59Z",
  "message": "Account scheduled for deletion. You have 24 hours to cancel."
}
```

**Status Codes:**

- `200 OK` - Deletion scheduled
- `400 Bad Request` - Invalid confirmation string
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Account already marked for deletion

---

## Response Models & Data Structures

### User Object

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Software developer",
  "is_email_verified": true,
  "is_active": true,
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-10-19T10:00:00Z",
  "last_login": "2025-10-19T09:30:00Z"
}
```

### Role Object

```json
{
  "id": "uuid",
  "name": "user",
  "description": "Regular user role",
  "permissions": ["permission1", "permission2"],
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-10-19T10:00:00Z"
}
```

### Audit Log Object

```json
{
  "id": "uuid",
  "timestamp": "2025-10-19T10:00:00Z",
  "user_id": "uuid",
  "user_email": "user@example.com",
  "action": "UPDATE_PROFILE",
  "resource_type": "user_profile",
  "resource_id": "uuid",
  "changes": {
    "field_name": ["old_value", "new_value"]
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "status": "success",
  "error_message": null,
  "request_id": "uuid"
}
```

---

## Error Handling & Status Codes

### HTTP Status Codes

| Code  | Meaning               | Use Case                                  |
| ----- | --------------------- | ----------------------------------------- |
| `200` | OK                    | Successful GET/PUT/DELETE                 |
| `201` | Created               | Successful POST with resource creation    |
| `202` | Accepted              | Request accepted for async processing     |
| `204` | No Content            | Successful request with no response body  |
| `400` | Bad Request           | Invalid request parameters or body        |
| `401` | Unauthorized          | Missing or invalid authentication         |
| `403` | Forbidden             | Authenticated but lacks permission        |
| `404` | Not Found             | Resource does not exist                   |
| `409` | Conflict              | Resource conflict (e.g., duplicate email) |
| `422` | Unprocessable Entity  | Validation failed                         |
| `429` | Too Many Requests     | Rate limit exceeded                       |
| `500` | Internal Server Error | Server error                              |

### Error Response Format

**Standard Error Response:**

```json
{
  "detail": "User email already exists",
  "code": "CONFLICT_EMAIL_DUPLICATE",
  "status_code": 409,
  "timestamp": "2025-10-19T10:00:00Z",
  "request_id": "req-abc-123",
  "trace_id": "trace-xyz-789"
}
```

**Validation Error Response:**

```json
{
  "detail": "Validation failed",
  "code": "VALIDATION_ERROR",
  "status_code": 422,
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter",
      "value": "password123!"
    },
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
```

---

## Authentication & Security

### Bearer Token Format

Access tokens are JWT tokens with the following structure:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTcyOTMzNjAwMCwiZXhwIjoxNzI5MzM5NjAwLCJyb2xlcyI6WyJ1c2VyIl19.signature
```

**Token Claims:**

```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "roles": ["user"],
  "permissions": ["read_profile", "update_profile"],
  "iat": 1729336000,
  "exp": 1729339600
}
```

### Token Expiration

- **Access Token:** 1 hour (3600 seconds)
- **Refresh Token:** 7 days (604800 seconds)

### CORS Headers

```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token
Access-Control-Allow-Credentials: true
```

### Rate Limiting

Rate limiting headers in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1729336060
Retry-After: 60
```

---

## Implementation Checklist for UI Team

### Authentication Flow

- [ ] Implement login endpoint call
- [ ] Store access token in state/localStorage
- [ ] Store refresh token securely (httpOnly cookie preferred)
- [ ] Implement automatic token refresh 5 minutes before expiration
- [ ] Implement logout and token cleanup
- [ ] Handle 401 responses with re-authentication prompt

### User Management

- [ ] Display user profile from `/profile/me`
- [ ] Implement profile edit form with PUT `/profile/me`
- [ ] Add password change functionality
- [ ] Implement email verification flow
- [ ] Add forgot password / reset password flow

### Admin Features

- [ ] Create user list with sorting and pagination
- [ ] Implement user detail view
- [ ] Add user creation dialog
- [ ] Create role management interface
- [ ] Add permission assignment UI
- [ ] Implement audit log viewer

### Security

- [ ] Validate email format before submission
- [ ] Validate password strength in real-time
- [ ] Implement CSRF token handling for secure endpoints
- [ ] Use httpOnly cookies when possible
- [ ] Implement secure logout with token invalidation
- [ ] Handle rate limiting gracefully

### Error Handling

- [ ] Parse error responses and display user-friendly messages
- [ ] Implement retry logic with exponential backoff
- [ ] Log errors for debugging
- [ ] Show validation errors next to form fields
- [ ] Implement session timeout notifications

---

## API Endpoint Summary Table

| #   | Method | Path                                                 | Auth | Description                 |
| --- | ------ | ---------------------------------------------------- | ---- | --------------------------- |
| 1   | POST   | `/auth/login`                                        | No   | User login                  |
| 2   | POST   | `/auth/register`                                     | No   | User registration           |
| 3   | POST   | `/auth/verify-email`                                 | No   | Verify email                |
| 4   | POST   | `/auth/resend-verification`                          | No   | Resend verification email   |
| 5   | POST   | `/auth/refresh`                                      | No   | Refresh access token        |
| 6   | POST   | `/auth/forgot-password`                              | No   | Request password reset      |
| 7   | POST   | `/auth/reset-password`                               | No   | Reset password              |
| 8   | POST   | `/auth/change-password`                              | Yes  | Change password             |
| 9   | POST   | `/auth/logout`                                       | Yes  | Logout                      |
| 10  | POST   | `/auth/login-secure`                                 | No   | Secure login (httpOnly)     |
| 11  | POST   | `/auth/logout-secure`                                | Yes  | Secure logout (httpOnly)    |
| 12  | POST   | `/auth/refresh-secure`                               | Yes  | Refresh secure token        |
| 13  | GET    | `/auth/csrf-token`                                   | No   | Get CSRF token              |
| 14  | POST   | `/auth/validate-csrf`                                | No   | Validate CSRF token         |
| 15  | GET    | `/profile/me`                                        | Yes  | Get user profile            |
| 16  | PUT    | `/profile/me`                                        | Yes  | Update user profile         |
| 17  | GET    | `/admin/users`                                       | Yes  | List all users              |
| 18  | POST   | `/admin/users`                                       | Yes  | Create user (admin)         |
| 19  | GET    | `/admin/users/{user_id}`                             | Yes  | Get user details            |
| 20  | PUT    | `/admin/users/{user_id}`                             | Yes  | Update user                 |
| 21  | DELETE | `/admin/users/{user_id}`                             | Yes  | Delete user                 |
| 22  | POST   | `/admin/users/{user_id}/approve`                     | Yes  | Approve user                |
| 23  | POST   | `/admin/users/{user_id}/reject`                      | Yes  | Reject user                 |
| 24  | GET    | `/admin/roles`                                       | Yes  | List all roles              |
| 25  | POST   | `/admin/roles`                                       | Yes  | Create role                 |
| 26  | PUT    | `/admin/roles/{role_id}`                             | Yes  | Update role                 |
| 27  | DELETE | `/admin/roles/{role_id}`                             | Yes  | Delete role                 |
| 28  | GET    | `/admin/stats`                                       | Yes  | Get system stats            |
| 29  | GET    | `/admin/audit-logs`                                  | Yes  | Get audit logs              |
| 30  | GET    | `/admin/permissions`                                 | Yes  | Get permissions             |
| 31  | GET    | `/admin/users/{user_id}/permissions`                 | Yes  | Get user permissions        |
| 32  | GET    | `/admin/users/{user_id}/check-permission`            | Yes  | Check permission            |
| 33  | POST   | `/admin/users/{user_id}/roles`                       | Yes  | Assign role to user         |
| 34  | DELETE | `/admin/users/{user_id}/roles/{role_id}`             | Yes  | Remove role from user       |
| 35  | GET    | `/admin/users/{user_id}/roles`                       | Yes  | Get user roles              |
| 36  | GET    | `/admin/roles/{role_id}/permissions`                 | Yes  | Get role permissions        |
| 37  | POST   | `/admin/roles/{role_id}/permissions`                 | Yes  | Add permission to role      |
| 38  | DELETE | `/admin/roles/{role_id}/permissions/{permission_id}` | Yes  | Remove permission from role |
| 39  | POST   | `/admin/users/{user_id}/verify-permission`           | Yes  | Verify user permission      |
| 40  | GET    | `/audit/logs`                                        | Yes  | Query audit logs            |
| 41  | GET    | `/audit/summary`                                     | Yes  | Get audit summary           |
| 42  | POST   | `/gdpr/export/my-data`                               | Yes  | Export user data            |
| 43  | GET    | `/gdpr/export/status/{export_id}`                    | Yes  | Check export status         |
| 44  | DELETE | `/gdpr/delete/my-account`                            | Yes  | Delete user account         |

**Total Endpoints: 44**

---

## Notes for UI Team

### Best Practices

1. Always include `Authorization` header for authenticated endpoints
2. Handle token expiration and refresh automatically
3. Implement loading states during API calls
4. Show meaningful error messages to users
5. Use pagination for large data sets
6. Implement request debouncing for search/filter endpoints
7. Cache frequently accessed data (user profile, roles, permissions)
8. Implement client-side validation before API calls
9. Log failed API requests for debugging
10. Test all error scenarios during development

### Common Gotchas

- Token refresh must happen before token expires
- CSRF token required for state-changing operations on secure endpoints
- Email verification required before certain operations
- Admin endpoints return 403 if user lacks admin role
- Password reset token expires after 1 hour
- Export data links expire after 7 days
- Soft deletes: deleted users still exist in database (marked as inactive)

---

**Document Status:** ✅ Complete and Ready for Integration
**Last Verified:** October 19, 2025
**Verification Coverage:** 44/44 endpoints documented (100%)
