# FastAPI User Management System - Complete API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000`  
**API Prefix:** `/api/v1`

---

## Quick Start Guide

### Prerequisites
- Python 3.12+
- DynamoDB (local or AWS)
- Redis (optional, for caching)

### Authentication
Most endpoints require authentication via JWT tokens:

```bash
# 1. Register a new account
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!", "first_name": "John", "last_name": "Doe"}'

# 2. Login to get access token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!"}'

# 3. Use the access_token in subsequent requests
curl -X GET "http://localhost:8000/api/v1/profile/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Token Expiration
- **Access Token:** 60 minutes (3600 seconds)
- **Refresh Token:** 30 days (2592000 seconds)
- **Email Verification Token:** 24 hours
- **Password Reset Token:** 1 hour
- **CSRF Token:** Session-based

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Authentication - Secure (httpOnly Cookies)](#authentication-secure)
3. [Profile Management](#profile-management)
4. [Admin - User Management](#admin-user-management)
5. [Admin - RBAC (Role Management)](#admin-rbac)
6. [Audit Logs](#audit-logs)
7. [GDPR Compliance](#gdpr-compliance)
8. [Frontend Logging](#frontend-logging)
9. [Health Check Endpoints](#health-check-endpoints)
10. [Health - Patterns Monitoring](#health-patterns-monitoring)
11. [Circuit Breakers](#circuit-breakers)
12. [Application Metrics](#application-metrics)

---

## Authentication Endpoints

Base Path: `/api/v1/auth`

### 1. User Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate user with email and password, returns JWT access and refresh tokens.

**Authentication Required:** ❌ No

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Request Body Schema:**
- `email` (string, required): User's email address (must be valid email format)
- `password` (string, required): User's password (minimum 8 characters)

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "user_id": "usr_1234567890",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "roles": ["user"],
    "is_active": true,
    "is_verified": true
  }
}
```

**Error Responses:**

*400 Bad Request - Invalid Credentials:*
```json
{
  "status_code": 400,
  "error_code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "details": {}
}
```

*400 Bad Request - Email Not Verified:*
```json
{
  "status_code": 400,
  "error_code": "EMAIL_NOT_VERIFIED",
  "message": "Email address not verified",
  "details": {
    "email": "user@example.com"
  }
}
```

*400 Bad Request - User Inactive:*
```json
{
  "status_code": 400,
  "error_code": "USER_INACTIVE",
  "message": "User account is inactive",
  "details": {
    "email": "user@example.com"
  }
}
```

*429 Too Many Requests - Rate Limited:*
```json
{
  "status_code": 429,
  "error_code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many login attempts. Please try again later.",
  "details": {
    "retry_after": 300
  }
}
```

**Example cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

---

### 2. User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Register a new user account. Sends verification email upon successful registration.

**Authentication Required:** ❌ No

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**Request Body Schema:**
- `email` (string, required): User's email address (must be unique and valid format)
- `password` (string, required): User's password (min 8 chars, must contain uppercase, lowercase, number, special char)
- `first_name` (string, required): User's first name (2-50 characters)
- `last_name` (string, required): User's last name (2-50 characters)

**Success Response (201 Created):**
```json
{
  "user_id": "usr_1234567890",
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "message": "Registration successful. Please check your email to verify your account.",
  "verification_sent": true,
  "created_at": "2025-10-27T10:30:00Z"
}
```

**Error Responses:**

*400 Bad Request - User Already Exists:*
```json
{
  "status_code": 400,
  "error_code": "USER_ALREADY_EXISTS",
  "message": "User with this email already exists",
  "details": {
    "email": "newuser@example.com"
  }
}
```

*422 Unprocessable Entity - Validation Error:*
```json
{
  "status_code": 422,
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "field_errors": [
      {
        "field": "password",
        "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      }
    ]
  }
}
```

**Example cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "first_name": "Jane",
    "last_name": "Smith"
  }'
```

---

### 3. User Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Logout the current user and invalidate the access token.

**Authentication Required:** ✅ Yes (Bearer Token)

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Success Response (200 OK):**
```json
{
  "message": "Logout successful",
  "user_id": "usr_1234567890",
  "logged_out_at": "2025-10-27T11:00:00Z"
}
```

**Error Responses:**

*401 Unauthorized - Invalid Token:*
```json
{
  "status_code": 401,
  "error_code": "INVALID_TOKEN",
  "message": "Invalid or expired token",
  "details": {}
}
```

**Example cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/logout" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 4. Password Reset Request

**Endpoint:** `POST /api/v1/auth/password-reset`

**Description:** Request a password reset link to be sent to the user's email.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "If an account with this email exists, a password reset link has been sent",
  "email": "user@example.com",
  "reset_token_sent": true
}
```

**Example cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/password-reset" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

### 5. Refresh Access Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Description:** Refresh the access token using a valid refresh token.

**Authentication Required:** ✅ Yes (Refresh Token)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status_code": 401,
  "error_code": "INVALID_REFRESH_TOKEN",
  "message": "Invalid or expired refresh token"
}
```

---

### 6. Verify Email

**Endpoint:** `POST /api/v1/auth/verify-email`

**Description:** Verify user's email address using verification token sent via email.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "user_id": "usr_1234567890",
  "email": "user@example.com",
  "verified_at": "2025-10-27T10:35:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "status_code": 400,
  "error_code": "INVALID_TOKEN",
  "message": "Invalid or expired verification token"
}
```

---

### 7. Resend Verification Email

**Endpoint:** `POST /api/v1/auth/resend-verification`

**Description:** Resend email verification link to user.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Verification email sent successfully",
  "email": "user@example.com"
}
```

---

### 8. Forgot Password

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Description:** Initiate forgot password flow, sends reset token to email.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Password reset instructions sent to email",
  "email": "user@example.com"
}
```

---

### 9. Reset Password with Token

**Endpoint:** `POST /api/v1/auth/reset-password`

**Description:** Reset password using token received via email.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Password reset successful",
  "user_id": "usr_1234567890"
}
```

**Error Response (400 Bad Request):**
```json
{
  "status_code": 400,
  "error_code": "INVALID_TOKEN",
  "message": "Invalid or expired reset token"
}
```

---

### 10. Change Password

**Endpoint:** `POST /api/v1/auth/change-password`

**Description:** Change password for authenticated user (requires current password).

**Authentication Required:** ✅ Yes

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Response (400 Bad Request - Invalid Current Password):**
```json
{
  "status_code": 400,
  "error_code": "INVALID_CREDENTIALS",
  "message": "Current password is incorrect"
}
```

---

### 11. Password Reset Request (Legacy)

**Endpoint:** `POST /api/v1/auth/password-reset-request`

**Description:** Legacy endpoint for password reset request (backward compatible).

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Password reset email sent successfully",
  "email": "user@example.com",
  "reset_token_sent": true
}
```

---

## Authentication - Secure (httpOnly Cookies)

Base Path: `/api/v1/auth`

These endpoints use httpOnly cookies for token storage, providing enhanced security against XSS attacks. They also implement CSRF protection.

### 12. Secure Login (httpOnly Cookies)

**Endpoint:** `POST /api/v1/auth/login-secure`

**Description:** Authenticate user and set access/refresh tokens as httpOnly cookies.

**Authentication Required:** ❌ No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "user_id": "usr_1234567890",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "roles": ["user"]
  },
  "csrf_token": "csrf_token_value_here"
}
```

**Response Cookies Set:**
- `access_token` (httpOnly, Secure, SameSite=Strict): JWT access token
- `refresh_token` (httpOnly, Secure, SameSite=Strict): JWT refresh token
- `csrf_token` (Secure, SameSite=Strict): CSRF protection token

---

### 13. Secure Logout

**Endpoint:** `POST /api/v1/auth/logout-secure`

**Description:** Logout user and clear all authentication cookies.

**Authentication Required:** ✅ Yes (Cookie-based)

**Request Headers:**
```http
Cookie: access_token=eyJhbGci...; refresh_token=eyJhbGci...
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "message": "Logout successful",
  "user_id": "usr_1234567890",
  "logged_out_at": "2025-10-27T11:00:00Z"
}
```

**Response:** Clears all authentication cookies

---

### 14. Refresh Token (Secure)

**Endpoint:** `POST /api/v1/auth/refresh-secure`

**Description:** Refresh access token using refresh token from cookie.

**Authentication Required:** ✅ Yes (Refresh token cookie)

**Request Headers:**
```http
Cookie: refresh_token=eyJhbGci...
```

**Success Response (200 OK):**
```json
{
  "message": "Token refreshed successfully"
}
```

**Response:** Updates `access_token` and `refresh_token` cookies

**Error Response (401 Unauthorized):**
```json
{
  "status_code": 401,
  "error_code": "TOKEN_MISSING",
  "message": "Refresh token not found in cookies"
}
```

---

### 15. Get CSRF Token

**Endpoint:** `GET /api/v1/auth/csrf-token`

**Description:** Get CSRF token for authenticated user to include in state-changing requests.

**Authentication Required:** ✅ Yes

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Success Response (200 OK):**
```json
{
  "csrf_token": "csrf_token_value_here",
  "expires_at": "2025-10-27T12:00:00Z"
}
```

---

### 16. Validate CSRF Token

**Endpoint:** `POST /api/v1/auth/validate-csrf`

**Description:** Validate a CSRF token for the current user.

**Authentication Required:** ✅ Yes

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Request Body:**
```json
{
  "csrf_token": "csrf_token_value_here"
}
```

**Success Response (200 OK):**
```json
{
  "valid": true,
  "message": "CSRF token is valid"
}
```

**Error Response (400 Bad Request):**
```json
{
  "valid": false,
  "message": "Invalid or expired CSRF token"
}
```

---

## Profile Management

Base Path: `/api/v1/profile`

### 17. Get Current User Profile

**Endpoint:** `GET /api/v1/profile/me`

**Description:** Retrieve the authenticated user's profile information.

**Authentication Required:** ✅ Yes

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Success Response (200 OK):**
```json
{
  "user_id": "usr_1234567890",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "roles": ["user"],
  "status": "active",
  "is_verified": true,
  "created_at": "2025-01-15T10:00:00Z",
  "last_login": "2025-10-27T09:30:00Z"
}
```

---

### 18. Update Current User Profile

**Endpoint:** `PUT /api/v1/profile/me`

**Description:** Update the authenticated user's profile information.

**Authentication Required:** ✅ Yes

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "newemail@example.com"
}
```

**Request Body Schema (all fields optional):**
- `first_name` (string): User's first name
- `last_name` (string): User's last name
- `email` (string): User's email (must be unique)

**Success Response (200 OK):**
```json
{
  "user_id": "usr_1234567890",
  "email": "newemail@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "roles": ["user"],
  "status": "active",
  "is_verified": true,
  "created_at": "2025-01-15T10:00:00Z",
  "last_login": "2025-10-27T09:30:00Z"
}
```

**Error Response (400 Bad Request - Email Already Exists):**
```json
{
  "status_code": 400,
  "error_code": "EMAIL_ALREADY_EXISTS",
  "message": "Email address is already in use"
}
```

---

## Admin - User Management

Base Path: `/api/v1/admin`

These endpoints require admin role authentication.

### 19. List All Users (Admin)

**Endpoint:** `GET /api/v1/admin/users`

**Description:** Retrieve paginated list of all users with filtering and search capabilities.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Query Parameters:**
- `page` (integer, default: 1): Page number for pagination
- `page_size` (integer, default: 10): Number of users per page
- `status` (string, optional): Filter by user status (active, inactive, suspended)
- `role` (string, optional): Filter by user role
- `search` (string, optional): Search in email, first name, last name

**Success Response (200 OK):**
```json
{
  "users": [
    {
      "user_id": "usr_1234567890",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "roles": ["user"],
      "status": "active",
      "is_verified": true,
      "created_at": "2025-01-15T10:00:00Z",
      "last_login": "2025-10-27T09:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 10,
    "total_users": 150,
    "total_pages": 15,
    "has_next": true,
    "has_previous": false
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users?page=1&page_size=20&status=active" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 20. Get User by ID (Admin)

**Endpoint:** `GET /api/v1/admin/users/{user_id}`

**Description:** Retrieve detailed information about a specific user.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Success Response (200 OK):**
```json
{
  "user_id": "usr_1234567890",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "roles": ["user"],
  "status": "active",
  "is_verified": true,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-10-20T14:30:00Z",
  "last_login": "2025-10-27T09:30:00Z",
  "login_count": 45,
  "failed_login_attempts": 0
}
```

**Error Response (404 Not Found):**
```json
{
  "status_code": 404,
  "error_code": "USER_NOT_FOUND",
  "message": "User not found"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/usr_1234567890" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 21. Create User (Admin)

**Endpoint:** `POST /api/v1/admin/users`

**Description:** Create a new user account with admin privileges (bypasses email verification).

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "roles": ["user"],
  "status": "active"
}
```

**Request Body Schema:**
- `email` (string, required): User's email address (must be unique)
- `password` (string, required): User's password (min 8 chars)
- `first_name` (string, required): User's first name
- `last_name` (string, required): User's last name
- `roles` (array, optional): User roles (default: ["user"])
- `status` (string, optional): Account status (default: "active")

**Success Response (201 Created):**
```json
{
  "user_id": "usr_9876543210",
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "roles": ["user"],
  "status": "active",
  "is_verified": true,
  "created_at": "2025-10-27T11:00:00Z"
}
```

**Error Response (400 Bad Request - Email Exists):**
```json
{
  "status_code": 400,
  "error_code": "EMAIL_ALREADY_EXISTS",
  "message": "Email address is already in use"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/users" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "first_name": "Jane",
    "last_name": "Smith"
  }'
```

---

### 22. Update User (Admin)

**Endpoint:** `PUT /api/v1/admin/users/{user_id}`

**Description:** Update user information including roles and status.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "newemail@example.com",
  "roles": ["user", "moderator"],
  "status": "active"
}
```

**Request Body Schema (all fields optional):**
- `first_name` (string): User's first name
- `last_name` (string): User's last name
- `email` (string): User's email address
- `roles` (array): User roles
- `status` (string): Account status (active, inactive, suspended)

**Success Response (200 OK):**
```json
{
  "user_id": "usr_1234567890",
  "email": "newemail@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "roles": ["user", "moderator"],
  "status": "active",
  "is_verified": true,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-10-27T11:15:00Z"
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:8000/api/v1/admin/users/usr_1234567890" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended",
    "roles": ["user"]
  }'
```

---

### 23. Delete User (Admin)

**Endpoint:** `DELETE /api/v1/admin/users/{user_id}`

**Description:** Permanently delete a user account and all associated data.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Success Response (200 OK):**
```json
{
  "message": "User deleted successfully",
  "user_id": "usr_1234567890",
  "deleted_at": "2025-10-27T11:20:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "status_code": 404,
  "error_code": "USER_NOT_FOUND",
  "message": "User not found"
}
```

**Error Response (403 Forbidden - Cannot Delete Self):**
```json
{
  "status_code": 403,
  "error_code": "CANNOT_DELETE_SELF",
  "message": "Cannot delete your own account"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/admin/users/usr_1234567890" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 24. Approve User (Admin)

**Endpoint:** `POST /api/v1/admin/users/{user_id}/approve`

**Description:** Approve a pending user registration.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Success Response (200 OK):**
```json
{
  "message": "User approved successfully",
  "user_id": "usr_1234567890",
  "status": "active",
  "approved_at": "2025-10-27T11:25:00Z"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/users/usr_1234567890/approve" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 25. Suspend User (Admin)

**Endpoint:** `POST /api/v1/admin/users/{user_id}/suspend`

**Description:** Suspend a user account temporarily.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Request Body (optional):**
```json
{
  "reason": "Violation of terms of service",
  "duration_days": 30
}
```

**Success Response (200 OK):**
```json
{
  "message": "User suspended successfully",
  "user_id": "usr_1234567890",
  "status": "suspended",
  "suspended_at": "2025-10-27T11:30:00Z",
  "suspended_until": "2025-11-26T11:30:00Z"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/users/usr_1234567890/suspend" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Suspicious activity",
    "duration_days": 7
  }'
```

---

### 26. Reactivate User (Admin)

**Endpoint:** `POST /api/v1/admin/users/{user_id}/reactivate`

**Description:** Reactivate a suspended or inactive user account.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Success Response (200 OK):**
```json
{
  "message": "User reactivated successfully",
  "user_id": "usr_1234567890",
  "status": "active",
  "reactivated_at": "2025-10-27T11:35:00Z"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/users/usr_1234567890/reactivate" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 27. Get User Statistics (Admin)

**Endpoint:** `GET /api/v1/admin/users/{user_id}/statistics`

**Description:** Get detailed statistics and activity metrics for a specific user.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Success Response (200 OK):**
```json
{
  "user_id": "usr_1234567890",
  "statistics": {
    "total_logins": 145,
    "failed_login_attempts": 2,
    "last_login": "2025-10-27T09:30:00Z",
    "account_age_days": 285,
    "password_last_changed": "2025-09-15T10:00:00Z",
    "mfa_enabled": true,
    "total_sessions": 156,
    "active_sessions": 2
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/usr_1234567890/statistics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 28. Get System Statistics (Admin)

**Endpoint:** `GET /api/v1/admin/statistics`

**Description:** Get overall system statistics including user counts, registrations, and activity metrics.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Query Parameters:**
- `period` (string, optional): Time period for statistics (today, week, month, year, all)

**Success Response (200 OK):**
```json
{
  "period": "month",
  "total_users": 1250,
  "active_users": 980,
  "suspended_users": 15,
  "inactive_users": 255,
  "new_registrations": 45,
  "verified_users": 1180,
  "unverified_users": 70,
  "users_by_role": {
    "user": 1200,
    "moderator": 35,
    "admin": 15
  },
  "login_statistics": {
    "total_logins": 15678,
    "unique_users_logged_in": 856,
    "average_logins_per_user": 18.3,
    "failed_login_attempts": 234
  },
  "generated_at": "2025-10-27T11:40:00Z"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/statistics?period=month" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Admin - RBAC (Role-Based Access Control)

Base Path: `/api/v1/admin/rbac`

These endpoints manage roles, permissions, and role assignments.

### 29. Create Role

**Endpoint:** `POST /api/v1/admin/rbac/roles`

**Description:** Create a new role with specified permissions.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Request Body:**
```json
{
  "role_name": "moderator",
  "description": "Content moderator role",
  "permissions": ["read:users", "write:content", "delete:content"]
}
```

**Request Body Schema:**
- `role_name` (string, required): Unique role identifier
- `description` (string, optional): Role description
- `permissions` (array, required): Array of permission strings

**Success Response (201 Created):**
```json
{
  "role_id": "rol_9876543210",
  "role_name": "moderator",
  "description": "Content moderator role",
  "permissions": ["read:users", "write:content", "delete:content"],
  "created_at": "2025-10-27T12:00:00Z"
}
```

**Error Response (400 Bad Request - Role Exists):**
```json
{
  "status_code": 400,
  "error_code": "ROLE_ALREADY_EXISTS",
  "message": "Role with this name already exists"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/rbac/roles" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role_name": "moderator",
    "description": "Content moderator role",
    "permissions": ["read:users", "write:content"]
  }'
```

---

### 30. Get All Roles

**Endpoint:** `GET /api/v1/admin/rbac/roles`

**Description:** Retrieve list of all roles with their permissions.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Success Response (200 OK):**
```json
{
  "roles": [
    {
      "role_id": "rol_1234567890",
      "role_name": "admin",
      "description": "Administrator with full access",
      "permissions": ["*"],
      "user_count": 15,
      "created_at": "2025-01-01T00:00:00Z"
    },
    {
      "role_id": "rol_9876543210",
      "role_name": "moderator",
      "description": "Content moderator role",
      "permissions": ["read:users", "write:content", "delete:content"],
      "user_count": 35,
      "created_at": "2025-10-27T12:00:00Z"
    }
  ],
  "total_roles": 2
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/rbac/roles" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 31. Get Role by ID

**Endpoint:** `GET /api/v1/admin/rbac/roles/{role_id}`

**Description:** Retrieve detailed information about a specific role.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `role_id` (string, required): Unique identifier of the role

**Success Response (200 OK):**
```json
{
  "role_id": "rol_9876543210",
  "role_name": "moderator",
  "description": "Content moderator role",
  "permissions": ["read:users", "write:content", "delete:content"],
  "user_count": 35,
  "created_at": "2025-10-27T12:00:00Z",
  "updated_at": "2025-10-27T12:00:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "status_code": 404,
  "error_code": "ROLE_NOT_FOUND",
  "message": "Role not found"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/rbac/roles/rol_9876543210" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 32. Update Role

**Endpoint:** `PUT /api/v1/admin/rbac/roles/{role_id}`

**Description:** Update role information and permissions.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Path Parameters:**
- `role_id` (string, required): Unique identifier of the role

**Request Body:**
```json
{
  "description": "Updated moderator role",
  "permissions": ["read:users", "write:content", "delete:content", "ban:users"]
}
```

**Request Body Schema (all fields optional):**
- `description` (string): Role description
- `permissions` (array): Array of permission strings

**Success Response (200 OK):**
```json
{
  "role_id": "rol_9876543210",
  "role_name": "moderator",
  "description": "Updated moderator role",
  "permissions": ["read:users", "write:content", "delete:content", "ban:users"],
  "updated_at": "2025-10-27T12:30:00Z"
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:8000/api/v1/admin/rbac/roles/rol_9876543210" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["read:users", "write:content", "delete:content", "ban:users"]
  }'
```

---

### 33. Delete Role

**Endpoint:** `DELETE /api/v1/admin/rbac/roles/{role_id}`

**Description:** Delete a role (cannot delete if users are assigned to this role).

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `role_id` (string, required): Unique identifier of the role

**Success Response (200 OK):**
```json
{
  "message": "Role deleted successfully",
  "role_id": "rol_9876543210",
  "deleted_at": "2025-10-27T12:45:00Z"
}
```

**Error Response (400 Bad Request - Role In Use):**
```json
{
  "status_code": 400,
  "error_code": "ROLE_IN_USE",
  "message": "Cannot delete role with assigned users",
  "user_count": 35
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/admin/rbac/roles/rol_9876543210" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 34. Get All Permissions

**Endpoint:** `GET /api/v1/admin/rbac/permissions`

**Description:** Retrieve list of all available permissions in the system.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Success Response (200 OK):**
```json
{
  "permissions": [
    {
      "permission": "read:users",
      "description": "View user information",
      "category": "users"
    },
    {
      "permission": "write:users",
      "description": "Create and update users",
      "category": "users"
    },
    {
      "permission": "delete:users",
      "description": "Delete users",
      "category": "users"
    },
    {
      "permission": "read:content",
      "description": "View content",
      "category": "content"
    }
  ],
  "total_permissions": 4,
  "categories": ["users", "content", "admin", "system"]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/rbac/permissions" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 35. Assign Role to User

**Endpoint:** `POST /api/v1/admin/rbac/users/{user_id}/roles`

**Description:** Assign one or more roles to a user.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Request Body:**
```json
{
  "roles": ["moderator", "editor"]
}
```

**Request Body Schema:**
- `roles` (array, required): Array of role names to assign

**Success Response (200 OK):**
```json
{
  "message": "Roles assigned successfully",
  "user_id": "usr_1234567890",
  "roles": ["user", "moderator", "editor"],
  "assigned_at": "2025-10-27T13:00:00Z"
}
```

**Error Response (404 Not Found - Role Not Found):**
```json
{
  "status_code": 404,
  "error_code": "ROLE_NOT_FOUND",
  "message": "One or more roles not found",
  "invalid_roles": ["editor"]
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/rbac/users/usr_1234567890/roles" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["moderator"]
  }'
```

---

### 36. Remove Role from User

**Endpoint:** `DELETE /api/v1/admin/rbac/users/{user_id}/roles/{role_name}`

**Description:** Remove a specific role from a user.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user
- `role_name` (string, required): Name of the role to remove

**Success Response (200 OK):**
```json
{
  "message": "Role removed successfully",
  "user_id": "usr_1234567890",
  "removed_role": "moderator",
  "remaining_roles": ["user"],
  "removed_at": "2025-10-27T13:15:00Z"
}
```

**Error Response (400 Bad Request - Cannot Remove Last Role):**
```json
{
  "status_code": 400,
  "error_code": "CANNOT_REMOVE_LAST_ROLE",
  "message": "User must have at least one role"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/admin/rbac/users/usr_1234567890/roles/moderator" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 37. Get User Roles

**Endpoint:** `GET /api/v1/admin/rbac/users/{user_id}/roles`

**Description:** Retrieve all roles assigned to a specific user.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Success Response (200 OK):**
```json
{
  "user_id": "usr_1234567890",
  "roles": [
    {
      "role_id": "rol_1111111111",
      "role_name": "user",
      "description": "Standard user role",
      "permissions": ["read:own_profile", "write:own_profile"]
    },
    {
      "role_id": "rol_9876543210",
      "role_name": "moderator",
      "description": "Content moderator role",
      "permissions": ["read:users", "write:content", "delete:content"]
    }
  ],
  "total_roles": 2,
  "all_permissions": ["read:own_profile", "write:own_profile", "read:users", "write:content", "delete:content"]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/rbac/users/usr_1234567890/roles" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 38. Get Users by Role

**Endpoint:** `GET /api/v1/admin/rbac/roles/{role_name}/users`

**Description:** Retrieve all users assigned to a specific role.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `role_name` (string, required): Name of the role

**Query Parameters:**
- `page` (integer, default: 1): Page number for pagination
- `page_size` (integer, default: 10): Number of users per page

**Success Response (200 OK):**
```json
{
  "role_name": "moderator",
  "users": [
    {
      "user_id": "usr_1234567890",
      "email": "moderator1@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "status": "active"
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 10,
    "total_users": 35,
    "total_pages": 4,
    "has_next": true,
    "has_previous": false
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/rbac/roles/moderator/users?page=1&page_size=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 39. Check User Permission

**Endpoint:** `POST /api/v1/admin/rbac/users/{user_id}/check-permission`

**Description:** Check if a user has a specific permission.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Path Parameters:**
- `user_id` (string, required): Unique identifier of the user

**Request Body:**
```json
{
  "permission": "write:content"
}
```

**Success Response (200 OK):**
```json
{
  "user_id": "usr_1234567890",
  "permission": "write:content",
  "has_permission": true,
  "granted_by_roles": ["moderator"]
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/rbac/users/usr_1234567890/check-permission" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "write:content"
  }'
```

---

### 40. Bulk Assign Roles

**Endpoint:** `POST /api/v1/admin/rbac/bulk-assign`

**Description:** Assign roles to multiple users at once.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_ids": ["usr_1234567890", "usr_9876543210"],
  "roles": ["moderator"]
}
```

**Request Body Schema:**
- `user_ids` (array, required): Array of user IDs
- `roles` (array, required): Array of role names to assign

**Success Response (200 OK):**
```json
{
  "message": "Roles assigned successfully",
  "successful_assignments": 2,
  "failed_assignments": 0,
  "results": [
    {
      "user_id": "usr_1234567890",
      "status": "success",
      "assigned_roles": ["moderator"]
    },
    {
      "user_id": "usr_9876543210",
      "status": "success",
      "assigned_roles": ["moderator"]
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/rbac/bulk-assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["usr_1234567890", "usr_9876543210"],
    "roles": ["moderator"]
  }'
```

---

## Audit Logs

Base Path: `/api/v1/audit`

These endpoints provide access to system audit logs.

### 41. Get Audit Logs

**Endpoint:** `GET /api/v1/audit/logs`

**Description:** Retrieve paginated audit logs with filtering options.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Query Parameters:**
- `page` (integer, default: 1): Page number for pagination
- `page_size` (integer, default: 50): Number of logs per page
- `user_id` (string, optional): Filter by user ID
- `action` (string, optional): Filter by action type (login, logout, create, update, delete, etc.)
- `start_date` (string, optional): Start date (ISO 8601 format)
- `end_date` (string, optional): End date (ISO 8601 format)
- `status` (string, optional): Filter by status (success, failure)

**Success Response (200 OK):**
```json
{
  "logs": [
    {
      "log_id": "log_1234567890",
      "timestamp": "2025-10-27T13:45:00Z",
      "user_id": "usr_1234567890",
      "email": "user@example.com",
      "action": "login",
      "resource_type": "authentication",
      "resource_id": null,
      "status": "success",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "details": {
        "method": "password",
        "location": "New York, US"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 50,
    "total_logs": 1250,
    "total_pages": 25,
    "has_next": true,
    "has_previous": false
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/audit/logs?page=1&action=login&status=success" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 42. Get Audit Log by ID

**Endpoint:** `GET /api/v1/audit/logs/{log_id}`

**Description:** Retrieve detailed information about a specific audit log entry.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `log_id` (string, required): Unique identifier of the audit log

**Success Response (200 OK):**
```json
{
  "log_id": "log_1234567890",
  "timestamp": "2025-10-27T13:45:00Z",
  "user_id": "usr_1234567890",
  "email": "user@example.com",
  "action": "update",
  "resource_type": "user",
  "resource_id": "usr_9876543210",
  "status": "success",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "details": {
    "changes": {
      "status": {
        "old": "active",
        "new": "suspended"
      }
    },
    "reason": "Terms violation"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "status_code": 404,
  "error_code": "LOG_NOT_FOUND",
  "message": "Audit log not found"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/audit/logs/log_1234567890" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## GDPR Data Management

Base Path: `/api/v1/gdpr`

These endpoints handle GDPR-related data requests.

### 43. Request Data Export

**Endpoint:** `POST /api/v1/gdpr/export`

**Description:** Request export of all user data (GDPR right to data portability).

**Authentication Required:** ✅ Yes

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Success Response (202 Accepted):**
```json
{
  "message": "Data export request submitted",
  "request_id": "exp_1234567890",
  "user_id": "usr_1234567890",
  "status": "processing",
  "estimated_completion": "2025-10-27T14:30:00Z",
  "created_at": "2025-10-27T14:00:00Z"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/gdpr/export" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 44. Get Export Status

**Endpoint:** `GET /api/v1/gdpr/export/{request_id}`

**Description:** Check the status of a data export request.

**Authentication Required:** ✅ Yes

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `request_id` (string, required): Unique identifier of the export request

**Success Response (200 OK - Completed):**
```json
{
  "request_id": "exp_1234567890",
  "user_id": "usr_1234567890",
  "status": "completed",
  "download_url": "https://example.com/exports/usr_1234567890_20251027.zip",
  "expires_at": "2025-11-03T14:30:00Z",
  "file_size_bytes": 2457600,
  "created_at": "2025-10-27T14:00:00Z",
  "completed_at": "2025-10-27T14:25:00Z"
}
```

**Success Response (200 OK - Processing):**
```json
{
  "request_id": "exp_1234567890",
  "user_id": "usr_1234567890",
  "status": "processing",
  "progress_percentage": 65,
  "estimated_completion": "2025-10-27T14:30:00Z",
  "created_at": "2025-10-27T14:00:00Z"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/gdpr/export/exp_1234567890" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 45. Request Account Deletion

**Endpoint:** `POST /api/v1/gdpr/delete`

**Description:** Request permanent deletion of user account and all associated data (GDPR right to erasure).

**Authentication Required:** ✅ Yes

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Request Body:**
```json
{
  "confirmation": "DELETE MY ACCOUNT",
  "reason": "No longer need the service"
}
```

**Request Body Schema:**
- `confirmation` (string, required): Must be exactly "DELETE MY ACCOUNT"
- `reason` (string, optional): Reason for account deletion

**Success Response (202 Accepted):**
```json
{
  "message": "Account deletion request submitted",
  "request_id": "del_1234567890",
  "user_id": "usr_1234567890",
  "status": "pending",
  "scheduled_deletion": "2025-11-03T14:00:00Z",
  "grace_period_days": 7,
  "created_at": "2025-10-27T14:00:00Z"
}
```

**Error Response (400 Bad Request - Invalid Confirmation):**
```json
{
  "status_code": 400,
  "error_code": "INVALID_CONFIRMATION",
  "message": "Confirmation text must be exactly 'DELETE MY ACCOUNT'"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/gdpr/delete" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "confirmation": "DELETE MY ACCOUNT",
    "reason": "No longer need the service"
  }'
```

---

## Frontend Logging

Base Path: `/api/v1/frontend`

### 46. Submit Frontend Logs

**Endpoint:** `POST /api/v1/frontend/logs`

**Description:** Submit client-side logs for monitoring and debugging purposes.

**Authentication Required:** ❌ No (Optional authentication)

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer eyJhbGci... (optional)
```

**Request Body:**
```json
{
  "logs": [
    {
      "level": "error",
      "message": "Failed to load user profile",
      "timestamp": "2025-10-27T14:00:00Z",
      "context": {
        "component": "ProfilePage",
        "user_agent": "Mozilla/5.0...",
        "url": "/profile",
        "error_stack": "Error: Network request failed\n  at fetch..."
      }
    }
  ]
}
```

**Request Body Schema:**
- `logs` (array, required): Array of log entries
  - `level` (string, required): Log level (debug, info, warn, error)
  - `message` (string, required): Log message
  - `timestamp` (string, required): ISO 8601 timestamp
  - `context` (object, optional): Additional context information

**Success Response (200 OK):**
```json
{
  "message": "Logs received successfully",
  "received_count": 1,
  "log_ids": ["flog_1234567890"]
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/frontend/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {
        "level": "error",
        "message": "Failed to load user profile",
        "timestamp": "2025-10-27T14:00:00Z"
      }
    ]
  }'
```

---

## Health & Monitoring

Base Path: `/api/v1/health`

These endpoints provide system health checks and monitoring information.

### 47. Basic Health Check

**Endpoint:** `GET /api/v1/health`

**Description:** Simple health check to verify API is running.

**Authentication Required:** ❌ No

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-27T14:30:00Z",
  "service": "user-management-api",
  "version": "1.0.0"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

---

### 48. Detailed Health Check

**Endpoint:** `GET /api/v1/health/detailed`

**Description:** Detailed health check including all system components.

**Authentication Required:** ❌ No

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-27T14:30:00Z",
  "service": "user-management-api",
  "version": "1.0.0",
  "components": {
    "database": {
      "status": "healthy",
      "response_time_ms": 15,
      "details": "DynamoDB connection successful"
    },
    "cache": {
      "status": "healthy",
      "response_time_ms": 5,
      "details": "Redis connection successful"
    },
    "email_service": {
      "status": "healthy",
      "details": "Email service operational"
    }
  },
  "uptime_seconds": 345600,
  "memory_usage_mb": 256
}
```

**Degraded Response (200 OK - Some Issues):**
```json
{
  "status": "degraded",
  "timestamp": "2025-10-27T14:30:00Z",
  "service": "user-management-api",
  "version": "1.0.0",
  "components": {
    "database": {
      "status": "healthy",
      "response_time_ms": 15
    },
    "cache": {
      "status": "unhealthy",
      "error": "Connection timeout",
      "details": "Redis connection failed"
    },
    "email_service": {
      "status": "healthy"
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health/detailed"
```

---

### 49. Readiness Check

**Endpoint:** `GET /api/v1/health/ready`

**Description:** Check if the service is ready to accept requests (used by Kubernetes/load balancers).

**Authentication Required:** ❌ No

**Success Response (200 OK):**
```json
{
  "ready": true,
  "timestamp": "2025-10-27T14:30:00Z"
}
```

**Not Ready Response (503 Service Unavailable):**
```json
{
  "ready": false,
  "timestamp": "2025-10-27T14:30:00Z",
  "reason": "Database connection not established"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health/ready"
```

---

### 50. Liveness Check

**Endpoint:** `GET /api/v1/health/alive`

**Description:** Check if the service is alive (used by Kubernetes for restart decisions).

**Authentication Required:** ❌ No

**Success Response (200 OK):**
```json
{
  "alive": true,
  "timestamp": "2025-10-27T14:30:00Z"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health/alive"
```

---

### 51. Startup Check

**Endpoint:** `GET /api/v1/health/startup`

**Description:** Check if the service has completed startup (used by Kubernetes).

**Authentication Required:** ❌ No

**Success Response (200 OK):**
```json
{
  "started": true,
  "timestamp": "2025-10-27T14:30:00Z",
  "startup_duration_seconds": 12.5
}
```

**Still Starting Response (503 Service Unavailable):**
```json
{
  "started": false,
  "timestamp": "2025-10-27T14:30:00Z",
  "progress": "Initializing database connections"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health/startup"
```

---

### 52. Database Health

**Endpoint:** `GET /api/v1/health/database`

**Description:** Check database connectivity and performance.

**Authentication Required:** ❌ No

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "database_type": "DynamoDB",
  "response_time_ms": 15,
  "connection_pool": {
    "active_connections": 5,
    "idle_connections": 15,
    "max_connections": 20
  },
  "last_query_timestamp": "2025-10-27T14:29:55Z"
}
```

**Unhealthy Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "database_type": "DynamoDB",
  "error": "Connection timeout",
  "last_successful_connection": "2025-10-27T14:25:00Z"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health/database"
```

---

## Health Patterns & Monitoring

Base Path: `/api/v1/health/patterns`

Advanced health monitoring endpoints.

### 53. Circuit Breaker Status

**Endpoint:** `GET /api/v1/health/patterns/circuit-breakers`

**Description:** Get status of all circuit breakers in the system.

**Authentication Required:** ✅ Yes (Admin role recommended)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci... (optional)
```

**Success Response (200 OK):**
```json
{
  "circuit_breakers": [
    {
      "name": "database_circuit",
      "state": "closed",
      "failure_count": 0,
      "success_count": 1250,
      "last_failure": null,
      "threshold": 5
    },
    {
      "name": "email_service_circuit",
      "state": "open",
      "failure_count": 8,
      "success_count": 945,
      "last_failure": "2025-10-27T14:25:00Z",
      "threshold": 5,
      "reset_timeout_seconds": 60
    }
  ],
  "total_breakers": 2
}
```

**Circuit Breaker States:**
- `closed`: Operating normally
- `open`: Circuit broken due to failures, requests fail immediately
- `half_open`: Testing if service recovered

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health/patterns/circuit-breakers"
```

---

### 54. Reset Circuit Breaker

**Endpoint:** `POST /api/v1/health/patterns/circuit-breakers/{name}/reset`

**Description:** Manually reset a circuit breaker (admin only).

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Path Parameters:**
- `name` (string, required): Name of the circuit breaker

**Success Response (200 OK):**
```json
{
  "message": "Circuit breaker reset successfully",
  "name": "email_service_circuit",
  "previous_state": "open",
  "current_state": "closed",
  "reset_at": "2025-10-27T14:30:00Z"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/health/patterns/circuit-breakers/email_service_circuit/reset" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 55. Rate Limiter Status

**Endpoint:** `GET /api/v1/health/patterns/rate-limiters`

**Description:** Get status of rate limiters across the system.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Success Response (200 OK):**
```json
{
  "rate_limiters": [
    {
      "endpoint": "/api/v1/auth/login",
      "type": "endpoint",
      "limit": 5,
      "window_seconds": 60,
      "current_usage": 3,
      "remaining": 2
    },
    {
      "endpoint": "/api/v1/auth/register",
      "type": "endpoint",
      "limit": 3,
      "window_seconds": 3600,
      "current_usage": 1,
      "remaining": 2
    }
  ],
  "global_limit": {
    "requests_per_minute": 1000,
    "current_usage": 456,
    "remaining": 544
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health/patterns/rate-limiters" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 56. Retry Pattern Statistics

**Endpoint:** `GET /api/v1/health/patterns/retry-stats`

**Description:** Get statistics about retry patterns in external service calls.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Success Response (200 OK):**
```json
{
  "retry_statistics": [
    {
      "service": "email_service",
      "total_attempts": 1500,
      "successful_first_attempt": 1450,
      "successful_after_retry": 45,
      "failed_after_all_retries": 5,
      "average_retries": 0.03,
      "max_retries_configured": 3
    },
    {
      "service": "sms_service",
      "total_attempts": 800,
      "successful_first_attempt": 790,
      "successful_after_retry": 8,
      "failed_after_all_retries": 2,
      "average_retries": 0.01,
      "max_retries_configured": 3
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health/patterns/retry-stats" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 57. Bulkhead Status

**Endpoint:** `GET /api/v1/health/patterns/bulkheads`

**Description:** Get status of bulkhead pattern implementations (resource isolation).

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Success Response (200 OK):**
```json
{
  "bulkheads": [
    {
      "name": "database_pool",
      "type": "connection_pool",
      "max_size": 20,
      "current_size": 8,
      "active": 5,
      "idle": 3,
      "waiting_requests": 0
    },
    {
      "name": "external_api_pool",
      "type": "thread_pool",
      "max_threads": 10,
      "active_threads": 3,
      "queued_tasks": 2,
      "rejected_tasks": 0
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/health/patterns/bulkheads" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## System Metrics

Base Path: `/api/v1/metrics`

### 58. Get System Metrics

**Endpoint:** `GET /api/v1/metrics`

**Description:** Get comprehensive system metrics (Prometheus-compatible format optional).

**Authentication Required:** ✅ Yes (Admin role recommended)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci... (optional)
Accept: application/json (or text/plain for Prometheus format)
```

**Query Parameters:**
- `format` (string, optional): Response format (json or prometheus)

**Success Response (200 OK - JSON format):**
```json
{
  "timestamp": "2025-10-27T14:30:00Z",
  "system": {
    "cpu_usage_percent": 45.2,
    "memory_usage_mb": 256,
    "memory_total_mb": 1024,
    "disk_usage_percent": 62.5,
    "uptime_seconds": 345600
  },
  "application": {
    "total_requests": 125000,
    "requests_per_second": 35.5,
    "average_response_time_ms": 125,
    "error_rate_percent": 0.5,
    "active_connections": 150
  },
  "database": {
    "total_queries": 450000,
    "queries_per_second": 125,
    "average_query_time_ms": 15,
    "connection_pool_usage_percent": 40
  },
  "cache": {
    "hit_rate_percent": 85.5,
    "total_hits": 95000,
    "total_misses": 16000,
    "memory_usage_mb": 128
  }
}
```

**Success Response (200 OK - Prometheus format):**
```text
# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total 125000

# HELP api_request_duration_seconds API request duration in seconds
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_sum 15625.5
api_request_duration_seconds_count 125000
```

**cURL Example:**
```bash
# JSON format
curl -X GET "http://localhost:8000/api/v1/metrics" \
  -H "Accept: application/json"

# Prometheus format
curl -X GET "http://localhost:8000/api/v1/metrics?format=prometheus" \
  -H "Accept: text/plain"
```

---

### 59. Get Endpoint Metrics

**Endpoint:** `GET /api/v1/metrics/endpoints`

**Description:** Get detailed metrics for all API endpoints.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Query Parameters:**
- `sort_by` (string, optional): Sort by field (requests, errors, response_time)
- `limit` (integer, optional): Limit number of results

**Success Response (200 OK):**
```json
{
  "endpoints": [
    {
      "path": "/api/v1/auth/login",
      "method": "POST",
      "total_requests": 15000,
      "successful_requests": 14850,
      "failed_requests": 150,
      "error_rate_percent": 1.0,
      "average_response_time_ms": 250,
      "min_response_time_ms": 120,
      "max_response_time_ms": 1500,
      "requests_per_minute": 35
    },
    {
      "path": "/api/v1/profile/me",
      "method": "GET",
      "total_requests": 25000,
      "successful_requests": 24900,
      "failed_requests": 100,
      "error_rate_percent": 0.4,
      "average_response_time_ms": 85,
      "min_response_time_ms": 45,
      "max_response_time_ms": 450,
      "requests_per_minute": 58
    }
  ],
  "total_endpoints": 2
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/metrics/endpoints?sort_by=requests&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 60. Get User Activity Metrics

**Endpoint:** `GET /api/v1/metrics/users`

**Description:** Get user activity and engagement metrics.

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
```

**Query Parameters:**
- `period` (string, optional): Time period (hour, day, week, month)

**Success Response (200 OK):**
```json
{
  "period": "day",
  "timestamp": "2025-10-27T14:30:00Z",
  "active_users": {
    "total": 856,
    "new_today": 23,
    "returning": 833
  },
  "authentication": {
    "total_logins": 1250,
    "unique_users": 856,
    "failed_logins": 45,
    "average_session_duration_minutes": 35
  },
  "registration": {
    "new_registrations": 23,
    "verified_users": 20,
    "pending_verification": 3
  },
  "engagement": {
    "daily_active_users": 856,
    "weekly_active_users": 2340,
    "monthly_active_users": 8500
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/metrics/users?period=day" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 61. Reset Metrics

**Endpoint:** `POST /api/v1/metrics/reset`

**Description:** Reset application metrics (admin only, use with caution).

**Authentication Required:** ✅ Yes (Admin role)

**Request Headers:**
```http
Authorization: Bearer eyJhbGci...
Content-Type: application/json
```

**Request Body (optional):**
```json
{
  "metric_types": ["endpoint_metrics", "cache_metrics"],
  "confirmation": "RESET METRICS"
}
```

**Request Body Schema:**
- `metric_types` (array, optional): Specific metrics to reset (if empty, resets all)
- `confirmation` (string, required): Must be "RESET METRICS"

**Success Response (200 OK):**
```json
{
  "message": "Metrics reset successfully",
  "reset_types": ["endpoint_metrics", "cache_metrics"],
  "reset_at": "2025-10-27T14:30:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "status_code": 400,
  "error_code": "INVALID_CONFIRMATION",
  "message": "Confirmation text must be exactly 'RESET METRICS'"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/metrics/reset" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "metric_types": ["endpoint_metrics"],
    "confirmation": "RESET METRICS"
  }'
```

---

## Appendix

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `USER_NOT_FOUND` | 404 | User does not exist |
| `EMAIL_ALREADY_EXISTS` | 400 | Email is already registered |
| `INVALID_CREDENTIALS` | 401 | Incorrect email or password |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `TOKEN_INVALID` | 401 | JWT token is malformed or invalid |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `ACCOUNT_SUSPENDED` | 403 | User account is suspended |
| `ACCOUNT_NOT_VERIFIED` | 403 | Email not verified |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Authentication Patterns

**Standard Bearer Token:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Secure Cookie-Based (httpOnly):**
```http
Cookie: access_token=eyJhbGci...; refresh_token=eyJhbGci...
```

### Rate Limiting

Most endpoints implement rate limiting:
- **Authentication endpoints:** 5 requests per minute per IP
- **Registration:** 3 requests per hour per IP
- **API calls (authenticated):** 1000 requests per minute per user
- **Admin endpoints:** 100 requests per minute per admin

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 856
X-RateLimit-Reset: 1730041800
```

### Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `page_size` (integer, default: 10, max: 100): Items per page

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "page_size": 10,
    "total_items": 150,
    "total_pages": 15,
    "has_next": true,
    "has_previous": false
  }
}
```

### Timestamps

All timestamps use ISO 8601 format in UTC:
```
2025-10-27T14:30:00Z
```

### Support & Documentation

- **API Version:** 1.0.0
- **Base URL:** `http://localhost:8000` (development)
- **Production URL:** Contact administrator for production endpoint
- **Support:** Contact your system administrator

---

## Environment Variables

### Required Configuration

```bash
# Application
APP_ENV=development  # development, staging, production
DEBUG=true

# Security
SECRET_KEY=your-secret-key-here-minimum-32-characters
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# Database
DYNAMODB_TABLE_NAME=users
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Optional: Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-email-password
FROM_EMAIL=noreply@example.com

# Rate Limiting
RATE_LIMIT_ENABLED=true
LOGIN_RATE_LIMIT=5  # requests per minute
REGISTER_RATE_LIMIT=3  # requests per hour

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
ALLOWED_HOSTS=*
```

---

## Security Best Practices

### 1. Token Management
- **Never expose access tokens** in URLs or query parameters
- **Store refresh tokens securely** (httpOnly cookies recommended)
- **Implement token rotation** for long-lived sessions
- **Revoke tokens** on logout and password change

### 2. Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Password history: Cannot reuse last 5 passwords

### 3. API Security Headers

All responses include security headers:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### 4. Input Validation
- All input is validated and sanitized
- SQL/NoSQL injection protection
- XSS prevention through output encoding
- CSRF protection on state-changing operations

### 5. Rate Limiting
Implement rate limiting to prevent abuse:
- **Login:** 5 attempts per minute per IP
- **Registration:** 3 attempts per hour per IP
- **Password Reset:** 3 attempts per hour per email
- **API Calls:** 1000 requests per minute per user

---

## Common Integration Patterns

### 1. Standard Web Application Flow

```javascript
// Frontend JavaScript Example
async function login(email, password) {
  const response = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Store tokens securely
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  
  return data;
}

async function fetchWithAuth(url) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh it
    await refreshToken();
    return fetchWithAuth(url); // Retry
  }
  
  return response.json();
}

async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  
  const response = await fetch('http://localhost:8000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh })
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
}
```

### 2. Secure Cookie-Based Flow (Recommended)

```javascript
// Frontend JavaScript Example with httpOnly Cookies
async function secureLogin(email, password) {
  const response = await fetch('http://localhost:8000/api/v1/auth/login-secure', {
    method: 'POST',
    credentials: 'include', // Important: include cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Store CSRF token
  sessionStorage.setItem('csrf_token', data.csrf_token);
  
  return data;
}

async function secureApiCall(url, options = {}) {
  const csrfToken = sessionStorage.getItem('csrf_token');
  
  return fetch(url, {
    ...options,
    credentials: 'include', // Include cookies
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken, // Include CSRF token
      'Content-Type': 'application/json'
    }
  });
}
```

### 3. Mobile Application Integration

```python
# Python Example using requests library
import requests

class APIClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
    
    def login(self, email, password):
        response = requests.post(
            f"{self.base_url}/api/v1/auth/login",
            json={"email": email, "password": password}
        )
        data = response.json()
        
        self.access_token = data['access_token']
        self.refresh_token = data['refresh_token']
        
        return data
    
    def get_profile(self):
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(
            f"{self.base_url}/api/v1/profile/me",
            headers=headers
        )
        
        if response.status_code == 401:
            # Token expired, refresh
            self.refresh_access_token()
            return self.get_profile()
        
        return response.json()
    
    def refresh_access_token(self):
        response = requests.post(
            f"{self.base_url}/api/v1/auth/refresh",
            json={"refresh_token": self.refresh_token}
        )
        data = response.json()
        
        self.access_token = data['access_token']
        self.refresh_token = data['refresh_token']

# Usage
client = APIClient("http://localhost:8000")
client.login("user@example.com", "password")
profile = client.get_profile()
```

---

## Error Handling Best Practices

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "status_code": 400,
  "error_code": "SPECIFIC_ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context about the error"
  },
  "timestamp": "2025-10-27T14:30:00Z",
  "path": "/api/v1/endpoint"
}
```

### Handling Specific Errors

```javascript
async function handleApiError(response) {
  const error = await response.json();
  
  switch (error.error_code) {
    case 'TOKEN_EXPIRED':
      // Refresh token and retry
      await refreshToken();
      break;
      
    case 'RATE_LIMIT_EXCEEDED':
      // Wait and retry
      const retryAfter = error.details.retry_after;
      await sleep(retryAfter * 1000);
      break;
      
    case 'VALIDATION_ERROR':
      // Display field-specific errors
      error.details.field_errors.forEach(err => {
        showFieldError(err.field, err.message);
      });
      break;
      
    case 'INSUFFICIENT_PERMISSIONS':
      // Redirect to access denied page
      window.location = '/access-denied';
      break;
      
    default:
      // Show generic error
      showErrorMessage(error.message);
  }
}
```

---

## Testing the API

### Using cURL

```bash
# Store token in variable
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' \
  | jq -r '.access_token')

# Use token in requests
curl -X GET "http://localhost:8000/api/v1/profile/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:8000`
   - `access_token`: (empty initially)

2. **Login Request:**
   - Method: POST
   - URL: `{{base_url}}/api/v1/auth/login`
   - Body: `{"email": "user@example.com", "password": "password"}`
   - Tests Tab (to auto-save token):
   ```javascript
   const response = pm.response.json();
   pm.environment.set("access_token", response.access_token);
   ```

3. **Subsequent Requests:**
   - Add header: `Authorization: Bearer {{access_token}}`

### Using Python pytest

```python
import pytest
import requests

BASE_URL = "http://localhost:8000"

@pytest.fixture
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"email": "test@example.com", "password": "TestPass123!"}
    )
    return response.json()['access_token']

def test_get_profile(auth_token):
    """Test getting user profile"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.get(f"{BASE_URL}/api/v1/profile/me", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "email" in data
```

---

## Troubleshooting

### Common Issues

#### 1. 401 Unauthorized
**Cause:** Invalid or expired token  
**Solution:** 
- Check token expiration
- Refresh token using `/api/v1/auth/refresh`
- Login again if refresh token expired

#### 2. 403 Forbidden
**Cause:** Insufficient permissions  
**Solution:**
- Verify user has required role/permissions
- Contact administrator to grant necessary access

#### 3. 429 Rate Limit Exceeded
**Cause:** Too many requests  
**Solution:**
- Implement exponential backoff
- Check `X-RateLimit-Reset` header for reset time
- Reduce request frequency

#### 4. 422 Validation Error
**Cause:** Invalid request data  
**Solution:**
- Check request body schema
- Validate all required fields
- Ensure data types match specification

#### 5. 503 Service Unavailable
**Cause:** Service dependency issue  
**Solution:**
- Check `/api/v1/health/detailed` for component status
- Verify database connectivity
- Wait for service recovery

---

## Performance Optimization

### Client-Side Best Practices

1. **Token Caching:** Cache tokens to avoid unnecessary login requests
2. **Request Batching:** Batch multiple requests when possible
3. **Pagination:** Use pagination for large datasets
4. **Compression:** Enable gzip compression for responses
5. **Conditional Requests:** Use ETags and If-None-Match headers

### Server-Side Features

- **Response Caching:** Frequently accessed data is cached
- **Database Indexing:** Optimized queries for fast retrieval
- **Connection Pooling:** Efficient database connection management
- **Async Operations:** Non-blocking I/O for better throughput

---

## API Versioning

Current Version: **v1**

### Version Strategy
- **URL Path Versioning:** `/api/v1/`, `/api/v2/`
- **Backward Compatibility:** v1 will be maintained for 12 months after v2 release
- **Deprecation Notice:** 6 months advance notice before version sunset
- **Migration Guide:** Provided with each major version update

### Checking API Version

```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

Response includes version information:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "api_version": "v1"
}
```

---

## Changelog

### Version 1.0.0 (2025-10-27)
- Initial release
- 61 API endpoints
- JWT and httpOnly cookie authentication
- RBAC system
- GDPR compliance endpoints
- Comprehensive health monitoring
- Circuit breakers and resilience patterns
- Audit logging

---

**Document Version:** 1.0.0  
**Last Updated:** October 27, 2025  
**Total Endpoints:** 61

