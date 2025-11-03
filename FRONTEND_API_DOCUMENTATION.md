# 🚀 Complete API Documentation for React Frontend Team

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000/api/v1`  
**Last Updated:** November 3, 2025

---

## 📋 Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
   - [Register User](#1-register-user)
   - [Login](#2-login)
   - [Logout](#3-logout)
   - [Refresh Token](#3a-refresh-token)
   - [Forgot Password](#4-forgot-password)
   - [Reset Password](#5-reset-password)
   - [Change Password](#6-change-password)
   - [Verify Email](#7-verify-email)
   - [Resend Verification Email](#8-resend-verification-email)
2. [User Profile Management](#user-profile-management)
   - [Get My Profile](#9-get-my-profile)
   - [Update My Profile](#10-update-my-profile)
3. [Response Format Standards](#response-format-standards)
4. [Error Handling](#error-handling)
5. [Authentication Flow](#authentication-flow)
6. [Security Best Practices](#security-best-practices)

---

## 🔐 Authentication & Authorization

All authenticated endpoints require the `Authorization` header with a Bearer token:

```
Authorization: Bearer <access_token>
```

### Rate Limiting

- **Login:** 200 requests per 5 minutes per IP/email
- **Register:** 200 requests per 10 minutes per IP
- **Forgot Password:** 200 requests per 10 minutes per IP
- **Reset Password:** 200 requests per 10 minutes per IP
- **Verify Email:** 200 requests per 10 minutes per IP

---

## 📝 API Endpoints

### 1. Register User

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Register a new user account. Creates an inactive account requiring email verification and optionally admin approval.

**Authentication Required:** ❌ No

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "terms_accepted": true
}
```

**Request Body Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | ✅ Yes | Valid email format, max 255 chars | User's email address (will be normalized to lowercase) |
| `password` | string | ✅ Yes | 8-128 chars, must contain uppercase, lowercase, digit, special char | User's password |
| `confirm_password` | string | ⚠️ Optional | Must match password if provided | Password confirmation |
| `first_name` | string | ⚠️ Optional* | 2-50 chars, letters/spaces/hyphens/apostrophes only | User's first name |
| `last_name` | string | ⚠️ Optional* | 2-50 chars, letters/spaces/hyphens/apostrophes only | User's last name |
| `full_name` | string | ⚠️ Optional* | 2-100 chars (legacy field) | Full name (will be split into first_name/last_name) |
| `username` | string | ❌ No | 3-30 chars, alphanumeric + underscore | Optional username |
| `terms_accepted` | boolean | ❌ No | Default: true | Terms and conditions acceptance |

**Note:** *You must provide either (`first_name` AND `last_name`) OR `full_name`. If you provide `full_name`, it will be automatically split.

**Password Requirements:**
- Minimum 8 characters, maximum 128 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character: `!@#$%^&*()_+-={}:;"'`~<>,.?/`

**Email Requirements:**
- Valid email format (e.g., user@domain.com)
- Domain must contain at least one dot
- Automatically normalized to lowercase
- Maximum 255 characters
- Cannot use blacklisted domains (example.com, test.com)

**Name Requirements:**
- Only letters, spaces, hyphens (-), and apostrophes (')
- No consecutive special characters
- No leading/trailing spaces
- Automatically sanitized

---

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "message_code": "AUTH_REGISTER_SUCCESS",
  "timestamp": "2025-11-03T14:30:00.000Z",
  "data": {
    "user_id": "usr_abc123xyz",
    "email": "user@example.com",
    "verification_required": true,
    "approval_required": true,
    "created_at": "2025-11-03T14:30:00.000Z"
  },
  "errors": null,
  "field_errors": null,
  "request_id": "req_xyz789",
  "api_version": "v1"
}
```

**Success Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful registration |
| `message` | string | Human-readable success message |
| `message_code` | string | Code for frontend localization: `AUTH_REGISTER_SUCCESS` |
| `timestamp` | string (ISO 8601) | Response timestamp in UTC |
| `data.user_id` | string | Unique user identifier |
| `data.email` | string | Registered email (normalized) |
| `data.verification_required` | boolean | If true, user must verify email before login |
| `data.approval_required` | boolean | If true, admin must approve account before login |
| `data.created_at` | string (ISO 8601) | Account creation timestamp |
| `request_id` | string | Request tracking ID for debugging |
| `api_version` | string | API version (v1) |

---

**Error Responses:**

#### Validation Error (422 Unprocessable Entity)

**Scenario:** Invalid input data (missing required fields, invalid format, etc.)

```json
{
  "success": false,
  "message": "Registration validation failed",
  "message_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-03T14:30:00.000Z",
  "data": null,
  "errors": [
    {
      "field": "email",
      "code": "FIELD_EMAIL_ERROR",
      "message": "Invalid email address format",
      "context": null
    },
    {
      "field": "password",
      "code": "FIELD_PASSWORD_ERROR",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      "context": null
    }
  ],
  "field_errors": {
    "email": ["Invalid email address format"],
    "password": ["Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"]
  },
  "request_id": "req_xyz789",
  "api_version": "v1"
}
```

**Common Validation Errors:**

| Field | Error Message | Reason |
|-------|---------------|--------|
| `email` | "Email is required" | Missing email field |
| `email` | "Invalid email address format" | Email doesn't match pattern |
| `email` | "Email address is too long" | Email exceeds 255 characters |
| `password` | "Password is required" | Missing password field |
| `password` | "Password must be at least 8 characters long" | Password too short |
| `password` | "Password is too long (maximum 128 characters)" | Password exceeds limit |
| `password` | "Password must contain at least one uppercase letter..." | Password doesn't meet complexity requirements |
| `confirm_password` | "Passwords do not match" | Password and confirmation don't match |
| `first_name` | "First name is required" | Missing first name (and no full_name provided) |
| `first_name` | "First name must be between 2 and 50 characters" | Name length invalid |
| `first_name` | "First name can only contain letters, spaces, hyphens, and apostrophes" | Invalid characters in name |
| `last_name` | "Last name is required" | Missing last name (and no full_name provided) |
| `general` | "Either provide first_name and last_name, or full_name" | Name fields missing |

#### User Already Exists (409 Conflict)

**Scenario:** Email is already registered

```json
{
  "success": false,
  "message": "User with this email already exists",
  "message_code": "AUTH_EMAIL_ALREADY_EXISTS",
  "timestamp": "2025-11-03T14:30:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "email": ["User with this email already exists"]
  },
  "request_id": "req_xyz789",
  "api_version": "v1"
}
```

#### Rate Limit Exceeded (429 Too Many Requests)

**Scenario:** Too many registration attempts from same IP

```json
{
  "detail": "Rate limit exceeded. Please try again later"
}
```

#### System Error (500 Internal Server Error)

**Scenario:** Unexpected server error

```json
{
  "success": false,
  "message": "Registration failed due to system error",
  "message_code": "SYSTEM_ERROR",
  "timestamp": "2025-11-03T14:30:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "general": ["System temporarily unavailable"]
  },
  "request_id": "req_xyz789",
  "api_version": "v1"
}
```

---

**Example Requests:**

#### 1. Basic Registration with First/Last Name
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "MySecure123!",
    "confirm_password": "MySecure123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

#### 2. Registration with Full Name (Legacy)
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "SecurePass456!",
    "full_name": "Jane Smith"
  }'
```

#### 3. Registration with All Optional Fields
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.wonder@example.com",
    "password": "AlicePass789!",
    "confirm_password": "AlicePass789!",
    "first_name": "Alice",
    "last_name": "Wonder",
    "username": "alicew",
    "terms_accepted": true
  }'
```

---

### 2. Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate user and receive access/refresh tokens. Returns JWT tokens for subsequent authenticated requests.

**Authentication Required:** ❌ No

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Request Body Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | ✅ Yes | Valid email format | User's email address |
| `password` | string | ✅ Yes | Minimum 1 character | User's password |

---

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "message_code": "AUTH_LOGIN_SUCCESS",
  "timestamp": "2025-11-03T14:35:00.000Z",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800,
    "refresh_expires_in": 604800,
    "user_id": "usr_abc123xyz",
    "email": "user@example.com",
    "roles": ["user"],
    "last_login_at": "2025-11-02T10:20:00.000Z"
  },
  "errors": null,
  "field_errors": null,
  "request_id": "req_login123",
  "api_version": "v1"
}
```

**Success Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data.access_token` | string | JWT access token (use in Authorization header) |
| `data.refresh_token` | string | JWT refresh token (use to get new access token) |
| `data.token_type` | string | Always "bearer" |
| `data.expires_in` | number | Access token expiration in seconds (default: 1800 = 30 minutes) |
| `data.refresh_expires_in` | number | Refresh token expiration in seconds (default: 604800 = 7 days) |
| `data.user_id` | string | Unique user identifier |
| `data.email` | string | User's email address |
| `data.roles` | array of strings | User's roles (e.g., ["user"], ["admin"], ["user", "auditor"]) |
| `data.last_login_at` | string or null | Last successful login timestamp (ISO 8601) |

---

**Error Responses:**

#### Invalid Credentials (401 Unauthorized)

**Scenario:** Wrong email or password

```json
{
  "success": false,
  "message": "Invalid email or password",
  "message_code": "AUTH_INVALID_CREDENTIALS",
  "timestamp": "2025-11-03T14:35:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "email": ["Invalid email or password"]
  },
  "request_id": "req_login123",
  "api_version": "v1"
}
```

#### Email Not Verified (403 Forbidden)

**Scenario:** User hasn't verified email yet

```json
{
  "success": false,
  "message": "Please verify your email before logging in",
  "message_code": "AUTH_EMAIL_NOT_VERIFIED",
  "timestamp": "2025-11-03T14:35:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "email": ["Please verify your email before logging in"]
  },
  "request_id": "req_login123",
  "api_version": "v1"
}
```

#### Account Inactive (403 Forbidden)

**Scenario:** Account is disabled or awaiting admin approval

```json
{
  "success": false,
  "message": "Account is inactive. Contact support.",
  "message_code": "AUTH_ACCOUNT_INACTIVE",
  "timestamp": "2025-11-03T14:35:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "email": ["Account is inactive. Contact support."]
  },
  "request_id": "req_login123",
  "api_version": "v1"
}
```

#### Validation Error (422 Unprocessable Entity)

**Scenario:** Missing or invalid input

```json
{
  "success": false,
  "message": "Login validation failed",
  "message_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-03T14:35:00.000Z",
  "data": null,
  "errors": [
    {
      "field": "email",
      "code": "FIELD_EMAIL_ERROR",
      "message": "Email is required",
      "context": null
    }
  ],
  "field_errors": {
    "email": ["Email is required"]
  },
  "request_id": "req_login123",
  "api_version": "v1"
}
```

#### Rate Limit Exceeded (429 Too Many Requests)

**Scenario:** Too many login attempts

```json
{
  "detail": "Rate limit exceeded. Please try again later"
}
```

---

**Example Requests:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Using the Access Token:**

After successful login, include the access token in subsequent requests:

```bash
curl -X GET http://localhost:8000/api/v1/users/profile/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Logout current user and revoke access token.

**Authentication Required:** ⚠️ Optional (works with or without token)

**Request Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Request Body:** None

---

**Success Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

---

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3a. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Description:** Refresh access token using a valid refresh token. Returns new access and refresh tokens. Use this endpoint when the access token expires (after 30 minutes) to get a new one without requiring the user to log in again.

**Authentication Required:** ✅ Yes (requires valid refresh token)

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <refresh_token>"
}
```

**Request Body:** None (refresh token is extracted from Authorization header)

---

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "message_code": "AUTH_TOKEN_REFRESH_SUCCESS",
  "timestamp": "2025-11-03T14:40:00.000Z",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800,
    "refresh_expires_in": 604800,
    "user_id": "usr_abc123xyz",
    "email": "user@example.com",
    "roles": ["user"],
    "last_login_at": "2025-11-03T14:35:00.000Z"
  },
  "errors": null,
  "field_errors": null,
  "request_id": "req_refresh123",
  "api_version": "v1"
}
```

**Success Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data.access_token` | string | New JWT access token (use in Authorization header) |
| `data.refresh_token` | string | New JWT refresh token (replace the old one) |
| `data.token_type` | string | Always "bearer" |
| `data.expires_in` | number | New access token expiration in seconds (1800 = 30 minutes) |
| `data.refresh_expires_in` | number | New refresh token expiration in seconds (604800 = 7 days) |
| `data.user_id` | string | User identifier |
| `data.email` | string | User's email address |
| `data.roles` | array of strings | User's roles |
| `data.last_login_at` | string or null | Last login timestamp |

---

**Error Responses:**

#### Invalid/Expired Refresh Token (401 Unauthorized)

**Scenario:** Refresh token is invalid, expired, or revoked

```json
{
  "detail": "Not authenticated"
}
```

**Or:**

```json
{
  "success": false,
  "message": "Token refresh failed",
  "message_code": "TOKEN_REFRESH_FAILED",
  "timestamp": "2025-11-03T14:40:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "token": ["Invalid or expired refresh token"]
  },
  "request_id": "req_refresh123",
  "api_version": "v1"
}
```

#### System Error (500 Internal Server Error)

**Scenario:** Server error during token refresh

```json
{
  "success": false,
  "message": "Token refresh failed",
  "message_code": "SYSTEM_ERROR",
  "timestamp": "2025-11-03T14:40:00.000Z",
  "data": null,
  "errors": null,
  "field_errors": {
    "general": ["System temporarily unavailable"]
  },
  "request_id": "req_refresh123",
  "api_version": "v1"
}
```

---

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Important Notes:**
- Always replace BOTH tokens when you receive a refresh response
- The old refresh token is invalidated when a new one is issued
- Access tokens expire after 30 minutes
- Refresh tokens expire after 7 days
- Implement automatic token refresh before access token expires

---

### 4. Forgot Password

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Description:** Request password reset link. Sends email with reset token. Always returns success (even if email doesn't exist) to prevent email enumeration attacks.

**Authentication Required:** ❌ No

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Request Body Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | ✅ Yes | Valid email format | Email address to send reset link |

---

**Success Response (200 OK):**

**Note:** This response is returned even if the email doesn't exist (security best practice to prevent user enumeration).

```json
{
  "success": true,
  "message": "Password reset token sent to your email",
  "email": "user@example.com",
  "requested_at": "2025-11-03T14:40:00.000Z"
}
```

**Success Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` |
| `message` | string | Confirmation message |
| `email` | string | Email address where reset was sent |
| `requested_at` | string (ISO 8601) | Request timestamp |

---

**Error Responses:**

#### Validation Error (422 Unprocessable Entity)

**Scenario:** Invalid email format

```json
{
  "detail": {
    "status_code": 422,
    "error_code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "field_errors": {
      "email": ["Invalid email address format"]
    }
  }
}
```

#### System Error (500 Internal Server Error)

**Scenario:** Server error (email service down, etc.)

```json
{
  "detail": {
    "status_code": 500,
    "error_code": "SYSTEM_ERROR",
    "message": "Password reset request failed",
    "field_errors": {
      "general": ["System temporarily unavailable"]
    }
  }
}
```

---

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

### 5. Reset Password

**Endpoint:** `POST /api/v1/auth/reset-password`

**Description:** Reset password using the token received via email. Token expires in 60 minutes (configurable).

**Authentication Required:** ❌ No

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewSecure456!",
  "confirm_password": "NewSecure456!"
}
```

**Request Body Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `token` | string | ✅ Yes | Minimum 1 character | Reset token from email |
| `new_password` | string | ✅ Yes | 8-128 chars, must meet password requirements | New password |
| `confirm_password` | string | ✅ Yes | Must match new_password | Password confirmation |

---

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset successful",
  "reset_at": "2025-11-03T14:45:00.000Z"
}
```

---

**Error Responses:**

#### Invalid/Expired Token (400 Bad Request)

**Scenario:** Token is invalid, expired, or already used

```json
{
  "detail": {
    "status_code": 400,
    "error_code": "INVALID_TOKEN",
    "message": "Invalid or expired token",
    "field_errors": {
      "token": ["Invalid or expired token"]
    }
  }
}
```

#### Validation Error (422 Unprocessable Entity)

**Scenario:** Invalid password or passwords don't match

```json
{
  "detail": {
    "status_code": 422,
    "error_code": "VALIDATION_ERROR",
    "message": "Password reset validation failed",
    "field_errors": {
      "new_password": ["Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"],
      "confirm_password": ["Password confirmation does not match"]
    }
  }
}
```

**Common Validation Errors:**

| Field | Error Message | Reason |
|-------|---------------|--------|
| `new_password` | "Password must be at least 8 characters long" | Password too short |
| `new_password` | "Password must contain at least one uppercase letter..." | Password doesn't meet requirements |
| `confirm_password` | "Password confirmation does not match" | Passwords don't match |

---

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "new_password": "NewSecure456!",
    "confirm_password": "NewSecure456!"
  }'
```

---

### 6. Change Password

**Endpoint:** `POST /api/v1/auth/change-password`

**Description:** Change password for authenticated user. Requires current password for security.

**Authentication Required:** ✅ Yes

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}
```

**Request Body:**

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecure456!",
  "confirm_password": "NewSecure456!"
}
```

**Request Body Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `current_password` | string | ✅ Yes | Minimum 1 character | Current password |
| `new_password` | string | ✅ Yes | 8-128 chars, must meet requirements | New password |
| `confirm_password` | string | ✅ Yes | Must match new_password | Password confirmation |

---

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "changed_at": "2025-11-03T14:50:00.000Z"
}
```

---

**Error Responses:**

#### Unauthorized (401 Unauthorized)

**Scenario:** Missing or invalid access token

```json
{
  "detail": "Not authenticated"
}
```

#### Wrong Current Password (200 OK with success=false)

**Scenario:** Current password is incorrect

```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

#### Validation Error (422 Unprocessable Entity)

**Scenario:** Invalid new password or passwords don't match

```json
{
  "detail": {
    "status_code": 422,
    "error_code": "VALIDATION_ERROR",
    "message": "Password change validation failed",
    "field_errors": {
      "new_password": ["New password must be different from current password"],
      "confirm_password": ["Password confirmation does not match"]
    }
  }
}
```

**Common Validation Errors:**

| Field | Error Message | Reason |
|-------|---------------|--------|
| `new_password` | "New password must be different from current password" | New password same as old |
| `new_password` | "Password must be at least 8 characters long" | Password too short |
| `confirm_password` | "Password confirmation does not match" | Passwords don't match |

---

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "current_password": "OldPassword123!",
    "new_password": "NewSecure456!",
    "confirm_password": "NewSecure456!"
  }'
```

---

### 7. Verify Email

**Endpoint:** `POST /api/v1/auth/verify-email`

**Description:** Verify email address using token received via email. Token expires in 24 hours (configurable).

**Authentication Required:** ❌ No

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "token": "verification_token_from_email"
}
```

**Request Body Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `token` | string | ✅ Yes | Minimum 1 character | Email verification token |

---

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "verified_at": "2025-11-03T14:55:00.000Z",
  "approval_required": true,
  "user_id": "usr_abc123xyz"
}
```

**Success Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful verification |
| `message` | string | Confirmation message |
| `verified_at` | string or null (ISO 8601) | Verification timestamp |
| `approval_required` | boolean | If true, admin approval still needed before login |
| `user_id` | string or null | User identifier |

---

**Error Responses:**

#### Invalid/Expired Token (400 Bad Request)

**Scenario:** Token is invalid, expired, or already used

```json
{
  "detail": {
    "status_code": 400,
    "error_code": "INVALID_TOKEN",
    "message": "Invalid or expired token",
    "field_errors": {
      "token": ["Invalid or expired token"]
    }
  }
}
```

#### Verification Failed (200 OK with success=false)

**Scenario:** Verification process failed

```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

---

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification_token_from_email"
  }'
```

---

### 8. Resend Verification Email

**Endpoint:** `POST /api/v1/auth/resend-verification`

**Description:** Resend email verification link to user.

**Authentication Required:** ❌ No

**Request Headers:**
```json
{
  "Content-Type": application/json"
}
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Request Body Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | ✅ Yes | Valid email format | Email address to resend verification |

---

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "email": "user@example.com",
  "resent_at": "2025-11-03T15:00:00.000Z"
}
```

---

**Error Responses:**

#### System Error (500 Internal Server Error)

**Scenario:** Email service unavailable

```json
{
  "detail": {
    "status_code": 500,
    "error_code": "SYSTEM_ERROR",
    "message": "Failed to resend verification email",
    "field_errors": {
      "general": ["System temporarily unavailable"]
    }
  }
}
```

---

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

## 👤 User Profile Management

### 9. Get My Profile

**Endpoint:** `GET /api/v1/users/profile/me`

**Alternative Endpoints:**
- `GET /api/v1/users/profile`
- `GET /api/v1/users/profile/`

**Description:** Get current authenticated user's profile information.

**Authentication Required:** ✅ Yes

**Request Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Request Body:** None

---

**Success Response (200 OK):**

```json
{
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "roles": ["user"],
  "status": "active",
  "is_verified": true,
  "created_at": "2025-10-15T10:30:00.000Z",
  "last_login": "2025-11-03T14:35:00.000Z",
  "updated_at": "2025-11-02T16:20:00.000Z",
  "phone_number": "+1234567890",
  "avatar_url": "https://example.com/avatars/user123.jpg",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications": true
  },
  "metadata": {
    "source": "web_registration",
    "last_updated_via": "mobile_app"
  },
  "profile_data": null
}
```

**Success Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string | Unique user identifier |
| `email` | string | User's email address |
| `first_name` | string | User's first name |
| `last_name` | string | User's last name |
| `roles` | array of strings | User's roles (e.g., ["user"], ["admin", "user"]) |
| `status` | string | Account status: "active" or "inactive" |
| `is_verified` | boolean | Whether email is verified |
| `created_at` | string (ISO 8601) | Account creation timestamp |
| `last_login` | string or null (ISO 8601) | Last successful login timestamp |
| `updated_at` | string or null (ISO 8601) | Last profile update timestamp |
| `phone_number` | string or null | User's phone number (optional) |
| `avatar_url` | string or null | URL to user's profile image/avatar (optional) |
| `preferences` | object or null | User preferences (theme, language, notifications, etc.) |
| `metadata` | object or null | Additional user metadata (optional) |
| `profile_data` | object or null | Legacy profile data field (optional) |

---

**Error Responses:**

#### Unauthorized (401 Unauthorized)

**Scenario:** Missing or invalid access token

```json
{
  "detail": "Not authenticated"
}
```

#### Profile Not Found (404 Not Found)

**Scenario:** User profile doesn't exist (rare)

```json
{
  "detail": {
    "status_code": 404,
    "error_code": "PROFILE_NOT_FOUND",
    "message": "User profile not found",
    "field_errors": {
      "user_id": ["Profile not found for this user"]
    }
  }
}
```

---

**Example Request:**

```bash
curl -X GET http://localhost:8000/api/v1/users/profile/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 10. Update My Profile

**Endpoint:** `PUT /api/v1/users/profile/me`

**Alternative Endpoints:**
- `PUT /api/v1/users/profile`
- `PUT /api/v1/users/profile/`

**Description:** Update current authenticated user's profile. Only provided fields will be updated (partial update supported).

**Authentication Required:** ✅ Yes

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}
```

**Request Body:**

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "+1987654321",
  "avatar_url": "https://example.com/avatars/jane456.jpg",
  "preferences": {
    "theme": "light",
    "language": "es",
    "notifications": false
  },
  "metadata": {
    "updated_via": "mobile_app",
    "version": "2.1.0"
  }
}
```

**Request Body Fields (All Optional):**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `first_name` | string | ❌ No | 2-50 chars, letters/spaces/hyphens/apostrophes only | Update first name |
| `last_name` | string | ❌ No | 2-50 chars, letters/spaces/hyphens/apostrophes only | Update last name |
| `phone_number` | string | ❌ No | Valid phone format with country code | Update phone number |
| `avatar_url` | string | ❌ No | Valid URL (http:// or https://), XSS-safe | Update profile picture URL |
| `preferences` | object | ❌ No | JSON object with user settings | Update user preferences (theme, language, etc.) |
| `metadata` | object | ❌ No | JSON object with additional data | Update user metadata |
| `profile_data` | object | ❌ No | JSON object (legacy field) | Update legacy profile data |

**Note:** You can update one field, multiple fields, or send an empty body (returns current profile).

**Avatar URL Requirements:**
- Must start with `http://` or `https://`
- Automatically sanitized to prevent XSS attacks
- JavaScript URLs (`javascript:`) are rejected
- Data URLs are rejected for security

---

**Success Response (200 OK):**

```json
{
  "user_id": "usr_abc123xyz",
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "roles": ["user"],
  "status": "active",
  "is_verified": true,
  "created_at": "2025-10-15T10:30:00.000Z",
  "last_login": "2025-11-03T14:35:00.000Z",
  "updated_at": "2025-11-03T15:10:00.000Z",
  "phone_number": "+1987654321",
  "avatar_url": "https://example.com/avatars/jane456.jpg",
  "preferences": {
    "theme": "light",
    "language": "es",
    "notifications": false
  },
  "metadata": {
    "updated_via": "mobile_app",
    "version": "2.1.0"
  },
  "profile_data": null
}
```

---

**Error Responses:**

#### Unauthorized (401 Unauthorized)

**Scenario:** Missing or invalid access token

```json
{
  "detail": "Not authenticated"
}
```

#### Validation Error (400 Bad Request)

**Scenario:** Invalid field values

```json
{
  "detail": {
    "status_code": 400,
    "error_code": "VALIDATION_ERROR",
    "message": "Profile validation failed",
    "field_errors": {
      "first_name": ["First name can only contain letters, spaces, hyphens, and apostrophes"],
      "avatar_url": ["Avatar URL must start with http:// or https://"]
    }
  }
}
```

**Common Validation Errors:**

| Field | Error Message | Reason |
|-------|---------------|--------|
| `first_name` | "First name must be between 2 and 50 characters" | Name length invalid |
| `first_name` | "First name can only contain letters, spaces, hyphens, and apostrophes" | Invalid characters |
| `last_name` | "Last name must be between 2 and 50 characters" | Name length invalid |
| `phone_number` | "Invalid phone number format" | Phone number format invalid |
| `avatar_url` | "Avatar URL must start with http:// or https://" | Invalid URL protocol |

#### Profile Not Found (404 Not Found)

**Scenario:** User profile doesn't exist

```json
{
  "detail": {
    "status_code": 404,
    "error_code": "PROFILE_NOT_FOUND",
    "message": "User profile not found"
  }
}
```

---

**Example Requests:**

#### Update First Name Only

```bash
curl -X PUT http://localhost:8000/api/v1/users/profile/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "first_name": "Jane"
  }'
```

#### Update Multiple Fields

```bash
curl -X PUT http://localhost:8000/api/v1/users/profile/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "phone_number": "+1987654321",
    "avatar_url": "https://example.com/avatars/jane456.jpg"
  }'
```

#### Update Preferences

```bash
curl -X PUT http://localhost:8000/api/v1/users/profile/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": true
    }
  }'
```

#### Get Current Profile (Empty Body)

```bash
curl -X PUT http://localhost:8000/api/v1/users/profile/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{}'
```

---

## 📊 Response Format Standards

### Standard Success Response Structure

All successful API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "message_code": "OPERATION_SUCCESS",
  "timestamp": "2025-11-03T15:00:00.000Z",
  "data": {
    // Response data here
  },
  "errors": null,
  "field_errors": null,
  "request_id": "req_xyz789",
  "api_version": "v1"
}
```

### Standard Error Response Structure

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Operation failed",
  "message_code": "OPERATION_FAILED",
  "timestamp": "2025-11-03T15:00:00.000Z",
  "data": null,
  "errors": [
    {
      "field": "field_name",
      "code": "ERROR_CODE",
      "message": "Error description",
      "context": null
    }
  ],
  "field_errors": {
    "field_name": ["Error message 1", "Error message 2"]
  },
  "request_id": "req_xyz789",
  "api_version": "v1"
}
```

---

## 🚨 Error Handling

### HTTP Status Codes

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| 200 OK | Success | Request succeeded |
| 201 Created | Resource Created | User registration successful |
| 400 Bad Request | Invalid Request | Invalid token, malformed request |
| 401 Unauthorized | Authentication Required | Missing or invalid access token |
| 403 Forbidden | Access Denied | Email not verified, account inactive |
| 404 Not Found | Resource Not Found | Profile doesn't exist |
| 409 Conflict | Resource Conflict | Email already registered |
| 422 Unprocessable Entity | Validation Failed | Invalid input data, field validation errors |
| 429 Too Many Requests | Rate Limit Exceeded | Too many requests from same IP/user |
| 500 Internal Server Error | Server Error | Unexpected server error |

### Message Codes for Localization

Frontend teams can use these codes for internationalization (i18n):

#### Authentication Codes
- `AUTH_LOGIN_SUCCESS` - Login successful
- `AUTH_LOGIN_FAILED` - Login failed
- `AUTH_REGISTER_SUCCESS` - Registration successful
- `AUTH_REGISTER_FAILED` - Registration failed
- `AUTH_LOGOUT_SUCCESS` - Logout successful
- `AUTH_INVALID_CREDENTIALS` - Invalid email/password
- `AUTH_EMAIL_NOT_VERIFIED` - Email not verified
- `AUTH_ACCOUNT_INACTIVE` - Account inactive
- `AUTH_EMAIL_ALREADY_EXISTS` - Email already registered

#### Validation Codes
- `VALIDATION_ERROR` - Generic validation error
- `VALIDATION_REQUIRED_FIELD` - Required field missing
- `VALIDATION_INVALID_EMAIL` - Invalid email format
- `VALIDATION_PASSWORD_TOO_SHORT` - Password too short
- `VALIDATION_PASSWORDS_DONT_MATCH` - Passwords don't match

#### System Codes
- `SYSTEM_ERROR` - System error
- `SYSTEM_UNAVAILABLE` - System unavailable

### Field Error Structure

Field-level errors provide specific validation feedback:

```json
{
  "field_errors": {
    "email": [
      "Invalid email address format",
      "Email address is too long"
    ],
    "password": [
      "Password must be at least 8 characters long",
      "Password must contain at least one uppercase letter"
    ]
  }
}
```

---

## 🔄 Authentication Flow

### Complete User Registration & Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Email

    User->>Frontend: Enter registration details
    Frontend->>API: POST /api/v1/auth/register
    API-->>Frontend: 201 Created (user_id, verification_required: true)
    API->>Email: Send verification email
    Frontend-->>User: Show "Check your email" message

    User->>Email: Click verification link
    Email->>Frontend: Redirect with token
    Frontend->>API: POST /api/v1/auth/verify-email {token}
    API-->>Frontend: 200 OK (verified, approval_required: true)
    Frontend-->>User: Show "Awaiting admin approval" message

    Note over API: Admin approves user (manual step)

    User->>Frontend: Enter login credentials
    Frontend->>API: POST /api/v1/auth/login
    API-->>Frontend: 200 OK (access_token, refresh_token)
    Frontend-->>User: Redirect to dashboard

    Frontend->>API: GET /api/v1/users/profile/me (with access_token)
    API-->>Frontend: 200 OK (profile data)
    Frontend-->>User: Display profile
```

### Password Reset Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Email

    User->>Frontend: Click "Forgot Password"
    Frontend->>API: POST /api/v1/auth/forgot-password {email}
    API-->>Frontend: 200 OK
    API->>Email: Send reset email
    Frontend-->>User: Show "Check your email" message

    User->>Email: Click reset link
    Email->>Frontend: Redirect with token
    Frontend-->>User: Show reset password form

    User->>Frontend: Enter new password
    Frontend->>API: POST /api/v1/auth/reset-password {token, new_password}
    API-->>Frontend: 200 OK
    Frontend-->>User: Show "Password reset successful"

    User->>Frontend: Login with new password
    Frontend->>API: POST /api/v1/auth/login
    API-->>Frontend: 200 OK (access_token)
    Frontend-->>User: Redirect to dashboard
```

### Token Refresh Flow (Future Implementation)

```mermaid
sequenceDiagram
    participant Frontend
    participant API

    Frontend->>API: GET /api/v1/users/profile/me (expired access_token)
    API-->>Frontend: 401 Unauthorized

    Frontend->>API: POST /api/v1/auth/refresh {refresh_token}
    API-->>Frontend: 200 OK (new access_token, new refresh_token)

    Frontend->>API: GET /api/v1/users/profile/me (new access_token)
    API-->>Frontend: 200 OK (profile data)
```

---

## 🔒 Security Best Practices

### For Frontend Developers

1. **Token Storage**
   - Store `access_token` in memory (React state/context) or sessionStorage
   - Store `refresh_token` in httpOnly cookie (if backend supports) or secure localStorage
   - Never store tokens in localStorage on production (XSS vulnerability)
   - Clear tokens on logout

2. **Token Usage**
   - Always include `Authorization: Bearer <access_token>` header for authenticated requests
   - Implement automatic token refresh before expiration
   - Handle 401 responses by refreshing token or redirecting to login

3. **Password Handling**
   - Never log passwords to console
   - Use type="password" for password inputs
   - Clear password fields after submission
   - Implement password strength indicator

4. **Error Handling**
   - Display field-level errors under respective form fields
   - Show user-friendly messages (use `message` field)
   - Use `message_code` for internationalization
   - Log `request_id` for debugging with backend team

5. **Security Headers**
   - Implement Content Security Policy (CSP)
   - Use HTTPS in production
   - Enable CORS only for trusted domains

6. **Input Validation**
   - Implement client-side validation matching backend rules
   - Trim whitespace from inputs
   - Normalize email to lowercase before sending
   - Prevent form double-submission

7. **Rate Limiting**
   - Show "Too many attempts" message on 429 responses
   - Implement exponential backoff for retries
   - Disable submit button during request processing

---

## 📝 Common Integration Scenarios

### Scenario 1: User Registration with Email Verification

```typescript
// React example with TypeScript
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

interface RegisterResponse {
  success: boolean;
  message: string;
  message_code: string;
  data: {
    user_id: string;
    email: string;
    verification_required: boolean;
    approval_required: boolean;
  };
  field_errors?: Record<string, string[]>;
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const register = async (data: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
  }) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post<RegisterResponse>(
        `${API_BASE_URL}/auth/register`,
        data
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        setErrors(response.data.field_errors || {});
        return { success: false };
      }
    } catch (error: any) {
      if (error.response?.data?.field_errors) {
        setErrors(error.response.data.field_errors);
      } else {
        setErrors({ general: ['Registration failed. Please try again.'] });
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, errors };
};
```

### Scenario 2: Login with Token Management

```typescript
import { create } from 'zustand';
import axios from 'axios';

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { access_token, refresh_token, user_id, email, roles } = response.data.data;
        
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          user: { user_id, email, roles }
        });

        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  logout: async () => {
    const { accessToken } = get();
    
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ accessToken: null, refreshToken: null, user: null });
      delete axios.defaults.headers.common['Authorization'];
    }
  },

  getProfile: async () => {
    const { accessToken } = get();
    
    try {
      const response = await axios.get(`${API_BASE_URL}/users/profile/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      set({ user: response.data });
    } catch (error) {
      console.error('Get profile failed:', error);
      // Token might be expired, logout user
      get().logout();
    }
  }
}));
```

### Scenario 3: Form Validation with Error Display

```tsx
import React, { useState } from 'react';
import { useRegister } from './hooks/useRegister';

export const RegisterForm: React.FC = () => {
  const { register, loading, errors } = useRegister();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await register(formData);
    
    if (result.success) {
      // Show success message
      alert('Registration successful! Please check your email to verify your account.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && (
          <div className="error">
            {errors.email.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && (
          <div className="error">
            {errors.password.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          required
        />
        {errors.confirm_password && (
          <div className="error">
            {errors.confirm_password.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <label>First Name</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        {errors.first_name && (
          <div className="error">
            {errors.first_name.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <label>Last Name</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        {errors.last_name && (
          <div className="error">
            {errors.last_name.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}
      </div>

      {errors.general && (
        <div className="error-general">
          {errors.general.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};
```

---

## 🎯 Quick Reference

### API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register new user |
| POST | `/api/v1/auth/login` | ❌ | Login user |
| POST | `/api/v1/auth/logout` | ⚠️ | Logout user |
| POST | `/api/v1/auth/refresh` | ✅ | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | ❌ | Request password reset |
| POST | `/api/v1/auth/reset-password` | ❌ | Reset password with token |
| POST | `/api/v1/auth/change-password` | ✅ | Change password (authenticated) |
| POST | `/api/v1/auth/verify-email` | ❌ | Verify email with token |
| POST | `/api/v1/auth/resend-verification` | ❌ | Resend verification email |
| GET | `/api/v1/users/profile/me` | ✅ | Get current user profile |
| PUT | `/api/v1/users/profile/me` | ✅ | Update current user profile |

### Token Expiration Times

- **Access Token:** 30 minutes (1800 seconds)
- **Refresh Token:** 7 days (604800 seconds)
- **Password Reset Token:** 60 minutes
- **Email Verification Token:** 24 hours

### Validation Rules Quick Reference

#### Email
- Valid format: `user@domain.com`
- Maximum length: 255 characters
- Automatically converted to lowercase
- Domain must have at least one dot

#### Password
- Length: 8-128 characters
- Must contain: uppercase, lowercase, digit, special character
- Special characters allowed: `!@#$%^&*()_+-={}:;"'`~<>,.?/`

#### Names (first_name, last_name)
- Length: 2-50 characters
- Allowed characters: letters, spaces, hyphens, apostrophes
- Automatically sanitized (trim, normalize)

#### Username (optional)
- Length: 3-30 characters
- Allowed characters: alphanumeric + underscore

---

## 📞 Support & Contact

For API issues, questions, or feedback:
- **Backend Team:** [backend-team@example.com]
- **API Documentation:** This file
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

**Document Version:** 1.0.0  
**Last Updated:** November 3, 2025  
**Maintained By:** Backend Team
