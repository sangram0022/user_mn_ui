# API Error Codes & Request/Response Models Reference

---

## Table of Contents

1. [Error Response Structure](#error-response-structure)
2. [HTTP Status Codes](#http-status-codes)
3. [Error Code Reference](#error-code-reference)
4. [Request/Response Models](#requestresponse-models)
5. [Validation Rules](#validation-rules)

---

## Error Response Structure

All API errors follow a consistent JSON structure:

### Standard Error Response

```json
{
  "error_code": "USER_NOT_FOUND",
  "message": "User not found",
  "status_code": 404,
  "timestamp": "2025-10-19T10:30:00.123Z",
  "request_id": "req_abc123xyz789",
  "data": {
    "user_id": "usr_999999"
  }
}
```

### Validation Error Response

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "status_code": 422,
  "timestamp": "2025-10-19T10:30:00.123Z",
  "request_id": "req_abc123xyz789",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters",
      "code": "min_length"
    }
  ]
}
```

### Error Response Fields

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `error_code` | string | ✅ Yes | Machine-readable error code |
| `message` | string | ✅ Yes | Human-readable error message |
| `status_code` | integer | ✅ Yes | HTTP status code |
| `timestamp` | string | ✅ Yes | Error timestamp (ISO 8601) |
| `request_id` | string | ✅ Yes | Unique request identifier for debugging |
| `data` | object | ❌ No | Additional error context (varies by error) |
| `errors` | array | ❌ No | Field-level validation errors (422 only) |
| `retry_after` | integer | ❌ No | Seconds to wait before retry (429 only) |

---

## HTTP Status Codes

| Code | Name | Description | When Used |
|------|------|-------------|-----------|
| **2xx Success** |
| 200 | OK | Request successful | GET, PUT, DELETE success |
| 201 | Created | Resource created | POST user registration, create user |
| 202 | Accepted | Request accepted | Log frontend errors |
| **4xx Client Errors** |
| 400 | Bad Request | Invalid request | Malformed JSON, invalid token |
| 401 | Unauthorized | Authentication failed | Invalid credentials, expired token |
| 403 | Forbidden | Permission denied | Insufficient role, inactive account |
| 404 | Not Found | Resource not found | User/role not found |
| 409 | Conflict | Resource conflict | Email already exists |
| 422 | Unprocessable Entity | Validation failed | Field validation errors |
| 429 | Too Many Requests | Rate limit exceeded | Too many login attempts |
| **5xx Server Errors** |
| 500 | Internal Server Error | Server error | Unexpected system errors |
| 503 | Service Unavailable | Service down | Database unavailable |

---

## Error Code Reference

### Authentication Errors (AUTH_*)

| Error Code | HTTP Status | Message | Cause | Solution |
|------------|-------------|---------|-------|----------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password | Wrong email/password | Check credentials |
| `EMAIL_NOT_VERIFIED` | 401 | Email address not verified | Email not verified | Check email for verification link |
| `TOKEN_INVALID` | 401 | Invalid or expired token | Token expired/malformed | Login again or refresh token |
| `TOKEN_REFRESH_FAILED` | 401 | Token refresh failed | Invalid refresh token | Login again |
| `AUTHENTICATION_REQUIRED` | 401 | Authentication required | Missing Authorization header | Include Bearer token |
| `LOGIN_FAILED` | 500 | Login failed | System error during login | Contact support |
| `REGISTRATION_FAILED` | 500 | Registration failed | System error during registration | Contact support |
| `PASSWORD_RESET_FAILED` | 500 | Password reset failed | System error | Contact support |
| `EMAIL_VERIFICATION_FAILED` | 500 | Email verification failed | System error | Contact support |
| `LOGOUT_FAILED` | 500 | Logout failed | System error | Contact support |

### User Errors (USER_*)

| Error Code | HTTP Status | Message | Cause | Solution |
|------------|-------------|---------|-------|----------|
| `USER_NOT_FOUND` | 404 | User not found | User ID doesn't exist | Verify user ID |
| `USER_ALREADY_EXISTS` | 409 | User with this email already exists | Email in use | Use different email |
| `USER_INACTIVE` | 403 | User account is inactive | Account deactivated | Contact support |
| `PROFILE_NOT_FOUND` | 404 | User profile not found | Profile doesn't exist | Contact support |
| `PROFILE_RETRIEVAL_FAILED` | 500 | Failed to retrieve profile | System error | Contact support |
| `PROFILE_UPDATE_FAILED` | 500 | Failed to update profile | System error | Contact support |
| `SELF_DELETE_FORBIDDEN` | 400 | Cannot delete your own account | Admin trying to delete self | Have another admin delete |
| `NOT_VERIFIED` | 403 | Email not verified | Email verification pending | Check email |

### Admin Errors (ADMIN_*)

| Error Code | HTTP Status | Message | Cause | Solution |
|------------|-------------|---------|-------|----------|
| `PERMISSION_DENIED` | 403 | Admin access required | Non-admin accessing admin endpoint | Login as admin |
| `USER_LIST_FAILED` | 500 | Failed to list users | System error | Contact support |
| `CREATION_FAILED` | 500 | User creation failed | System error | Contact support |
| `USER_DETAIL_FAILED` | 500 | Failed to retrieve user details | System error | Contact support |
| `USER_UPDATE_FAILED` | 500 | Failed to update user | System error | Contact support |
| `USER_DELETE_FAILED` | 500 | Failed to delete user | System error | Contact support |
| `APPROVAL_FAILED` | 500 | User approval failed | System error | Contact support |

### Validation Errors (VALIDATION_*)

| Error Code | HTTP Status | Message | Cause | Solution |
|------------|-------------|---------|-------|----------|
| `VALIDATION_ERROR` | 422 | Validation failed | Field validation errors | Check `errors` array |
| `INVALID_EMAIL` | 422 | Invalid email format | Email format invalid | Use valid email |
| `INVALID_PASSWORD` | 422 | Password requirements not met | Weak password | Use stronger password |
| `INVALID_NAME` | 422 | Name format invalid | Name contains numbers/symbols | Use letters only |
| `FIELD_REQUIRED` | 422 | Required field missing | Required field not provided | Include required field |
| `FIELD_TOO_LONG` | 422 | Field exceeds maximum length | String too long | Reduce length |
| `FIELD_TOO_SHORT` | 422 | Field below minimum length | String too short | Increase length |

### Rate Limiting Errors

| Error Code | HTTP Status | Message | Cause | Solution |
|------------|-------------|---------|-------|----------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Rate limit exceeded | Wait before retrying |

### Audit Errors (AUDIT_*)

| Error Code | HTTP Status | Message | Cause | Solution |
|------------|-------------|---------|-------|----------|
| `INVALID_RANGE` | 400 | Invalid date range | start_date > end_date | Fix date range |
| `RETRIEVAL_FAILED` | 500 | Audit log retrieval failed | System error | Contact support |

### System Errors (SYSTEM_*)

| Error Code | HTTP Status | Message | Cause | Solution |
|------------|-------------|---------|-------|----------|
| `DATABASE_ERROR` | 500 | Database error | Database connection failed | Contact support |
| `INTERNAL_ERROR` | 500 | Internal server error | Unexpected error | Contact support |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable | System maintenance | Try again later |

---

## Request/Response Models

### Authentication Models

#### LoginRequest

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Fields:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | Valid email, max 255 chars |
| `password` | string | ✅ Yes | Min 8 chars |

#### LoginResponse

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "usr_123456",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "is_verified": true,
    "is_active": true
  }
}
```

#### RegisterRequest

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Fields:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | Valid email, unique, max 255 chars |
| `password` | string | ✅ Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |
| `first_name` | string | ✅ Yes | 1-100 chars, letters only |
| `last_name` | string | ✅ Yes | 1-100 chars, letters only |

#### RegisterResponse

```json
{
  "user_id": "usr_789012",
  "email": "newuser@example.com",
  "message": "User registered successfully. Please check your email to verify your account.",
  "verification_required": true,
  "approval_required": false
}
```

#### ChangePasswordRequest

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePassword123!"
}
```

#### VerifyEmailRequest

```json
{
  "token": "verify_abc123def456"
}
```

#### ForgotPasswordRequest

```json
{
  "email": "user@example.com"
}
```

#### ResetPasswordRequest

```json
{
  "token": "reset_abc123def456",
  "new_password": "NewSecurePassword123!"
}
```

---

### Profile Models

#### UserProfile

```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "status": "active",
  "is_verified": true,
  "created_at": "2025-10-01T08:30:00Z",
  "last_login": "2025-10-19T09:15:00Z"
}
```

#### UpdateProfileRequest

```json
{
  "first_name": "John",
  "last_name": "Smith"
}
```

**Fields:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `first_name` | string | ❌ No | 1-100 chars, letters only |
| `last_name` | string | ❌ No | 1-100 chars, letters only |

---

### Admin Models

#### CreateUserRequest

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user"
}
```

**Fields:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | Valid email, unique |
| `password` | string | ✅ Yes | Min 8 chars, strong |
| `first_name` | string | ✅ Yes | 1-100 chars |
| `last_name` | string | ✅ Yes | 1-100 chars |
| `role` | string | ❌ No | user/admin/auditor (default: user) |

#### UpdateUserRequest

```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "role": "admin",
  "is_active": false
}
```

**Fields (all optional):**

| Field | Type | Constraints |
|-------|------|-------------|
| `first_name` | string | 1-100 chars |
| `last_name` | string | 1-100 chars |
| `role` | string | user/admin/auditor |
| `is_active` | boolean | - |

#### UserListResponse

```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "approved_by": "admin_789",
  "approved_at": "2025-10-15T10:00:00Z",
  "created_at": "2025-10-01T08:30:00Z",
  "last_login_at": "2025-10-19T09:15:00Z"
}
```

#### UserDetailResponse

```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "approved_by": "admin_789",
  "approved_at": "2025-10-15T10:00:00Z",
  "created_at": "2025-10-01T08:30:00Z",
  "updated_at": "2025-10-18T14:20:00Z",
  "last_login_at": "2025-10-19T09:15:00Z",
  "login_count": 42
}
```

#### ApproveUserRequest

```json
{
  "user_id": "usr_123456"
}
```

#### RejectUserRequest

```json
{
  "reason": "Invalid registration information"
}
```

#### CreateRoleRequest

```json
{
  "role_name": "moderator",
  "description": "Content moderator role",
  "permissions": ["read_users", "update_users"]
}
```

---

### GDPR Models

#### DataExportRequest

```json
{
  "format": "json",
  "include_audit_logs": true,
  "include_metadata": true
}
```

**Fields:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `format` | string | ❌ No | "json" or "csv" (default: json) |
| `include_audit_logs` | boolean | ❌ No | Default: true |
| `include_metadata` | boolean | ❌ No | Default: true |

#### AccountDeletionRequest

```json
{
  "confirmation": "DELETE MY ACCOUNT",
  "reason": "No longer need the service"
}
```

**Fields:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `confirmation` | string | ✅ Yes | Must be exactly "DELETE MY ACCOUNT" |
| `reason` | string | ❌ No | Max 500 chars |

---

### Audit Models

#### AuditLogResponse

```json
{
  "audit_id": "aud_123456",
  "user_id": "usr_789",
  "action": "USER_LOGIN",
  "resource_type": "session",
  "resource_id": "sess_abc123",
  "severity": "info",
  "timestamp": "2025-10-19T10:30:00Z",
  "metadata": {
    "success": true,
    "method": "password"
  },
  "outcome": "success",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

#### AuditLogListResponse

```json
{
  "items": [...],
  "total": 1250,
  "limit": 20,
  "offset": 0,
  "has_next": true,
  "has_prev": false
}
```

---

## Validation Rules

### Email Validation

```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

**Rules:**

- Valid email format
- Maximum 255 characters
- Must be unique in system
- Case-insensitive

**Valid Examples:**

- `user@example.com`
- `john.doe+work@company.co.uk`
- `test.user123@sub.domain.com`

**Invalid Examples:**

- `invalid.email` (no @)
- `@example.com` (no local part)
- `user@.com` (invalid domain)

---

### Password Validation

**Rules:**

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 digit (0-9)
- Special characters recommended but not required

**Valid Examples:**

- `SecurePass123!`
- `MyPassword2025`
- `Abc12345`

**Invalid Examples:**

- `password` (no uppercase, no digit)
- `PASSWORD123` (no lowercase)
- `Pass12` (too short)

---

### Name Validation

**Rules:**

- Minimum 1 character
- Maximum 100 characters
- Letters only (a-z, A-Z)
- Spaces allowed
- No numbers or special characters

**Valid Examples:**

- `John`
- `Mary Jane`
- `O'Brien` (if apostrophes allowed)

**Invalid Examples:**

- `John123` (contains numbers)
- `@John` (contains special char)
- `""` (empty)

---

### User ID Format

**Pattern:** `usr_[12 alphanumeric chars]`

**Examples:**

- `usr_123456789abc`
- `usr_abc123def456`

---

### Token Format

**Verification Token:** `verify_[alphanumeric]`  
**Reset Token:** `reset_[alphanumeric]`  
**Session Token:** JWT format (3 base64 segments separated by dots)

---

## Rate Limiting

### Rate Limit Headers

When rate limiting is active, responses include these headers:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1729350000
```

### Rate Limits by Endpoint

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| `POST /auth/login` | 10 requests | per minute | IP address |
| `POST /auth/login` | 5 requests | per minute | Email address |
| `POST /auth/register` | 10 requests | per hour | IP address |
| `POST /auth/forgot-password` | 3 requests | per hour | Email address |
| Other endpoints | 100 requests | per minute | User ID |

### Rate Limit Error Response

```json
{
  "error_code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many login attempts. Please try again later.",
  "status_code": 429,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123",
  "retry_after": 60
}
```

---

**Next:** [Integration Examples & Best Practices](./API_INTEGRATION_GUIDE.md)
