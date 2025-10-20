# Authentication Endpoints - Detailed Documentation

**Base Path:** `/auth`

---

## Table of Contents

1. [POST /auth/login](#post-authlogin)
2. [POST /auth/register](#post-authregister)
3. [POST /auth/logout](#post-authlogout)
4. [POST /auth/refresh](#post-authrefresh)
5. [POST /auth/verify-email](#post-authverify-email)
6. [POST /auth/resend-verification](#post-authresend-verification)
7. [POST /auth/forgot-password](#post-authforgot-password)
8. [POST /auth/reset-password](#post-authreset-password)
9. [POST /auth/change-password](#post-authchange-password)
10. [POST /auth/password-reset](#post-authpassword-reset)

---

## POST /auth/login

**Description:** Authenticate user and receive access tokens.

**Authentication Required:** ❌ No

**Rate Limiting:** ✅ Yes
- **IP-based:** 10 requests per minute
- **Email-based:** 5 requests per minute

### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | ✅ Yes | Valid email format, max 255 chars | User email address |
| `password` | string | ✅ Yes | Min 8 chars | User password |

### Response

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNyXzEyMzQ1NiIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzI5MzUwMDAwLCJpYXQiOjE3MjkzNDgyMDB9.signature",
  "token_type": "bearer",
  "expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNyXzEyMzQ1NiIsInR5cGUiOiJyZWZyZXNoIiwiZXhwIjoxNzMxOTQwMjAwfQ.signature",
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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | JWT access token (30 min expiry) |
| `token_type` | string | Always "bearer" |
| `expires_in` | integer | Token expiry in seconds (1800 = 30 min) |
| `refresh_token` | string | JWT refresh token (30 days expiry) |
| `user.user_id` | string | Unique user identifier |
| `user.email` | string | User email address |
| `user.first_name` | string | User first name |
| `user.last_name` | string | User last name |
| `user.role` | string | User role (user/admin/auditor) |
| `user.is_verified` | boolean | Email verification status |
| `user.is_active` | boolean | Account active status |

### Error Responses

**401 Unauthorized - Invalid Credentials:**
```json
{
  "error_code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "status_code": 401,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123"
}
```

**401 Unauthorized - Email Not Verified:**
```json
{
  "error_code": "EMAIL_NOT_VERIFIED",
  "message": "Email address not verified. Please check your email for verification link.",
  "status_code": 401,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123",
  "data": {
    "email": "user@example.com"
  }
}
```

**403 Forbidden - User Inactive:**
```json
{
  "error_code": "USER_INACTIVE",
  "message": "User account is inactive. Please contact support.",
  "status_code": 403,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123",
  "data": {
    "email": "user@example.com"
  }
}
```

**404 Not Found - User Not Found:**
```json
{
  "error_code": "USER_NOT_FOUND",
  "message": "User not found",
  "status_code": 404,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123",
  "data": {
    "email": "user@example.com"
  }
}
```

**422 Unprocessable Entity - Validation Error:**
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "status_code": 422,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123",
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

**429 Too Many Requests - Rate Limit Exceeded:**
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

### Code Examples

**Python:**
```python
import requests

url = "https://api.yourdomain.com/auth/login"
payload = {
    "email": "user@example.com",
    "password": "SecurePassword123!"
}

response = requests.post(url, json=payload)

if response.status_code == 200:
    data = response.json()
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]
    print(f"Login successful! Token: {access_token}")
else:
    error = response.json()
    print(f"Login failed: {error['message']}")
```

**JavaScript (Node.js):**
```javascript
const axios = require('axios');

async function login(email, password) {
  try {
    const response = await axios.post('https://api.yourdomain.com/auth/login', {
      email: email,
      password: password
    });
    
    const { access_token, refresh_token, user } = response.data;
    console.log('Login successful!', user);
    return { access_token, refresh_token };
  } catch (error) {
    console.error('Login failed:', error.response.data);
    throw error;
  }
}

login('user@example.com', 'SecurePassword123!');
```

**cURL:**
```bash
curl -X POST "https://api.yourdomain.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

---

## POST /auth/register

**Description:** Register a new user account.

**Authentication Required:** ❌ No

**Rate Limiting:** ✅ Yes (10 requests per hour per IP)

### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | ✅ Yes | Valid email, max 255 chars, unique | User email address |
| `password` | string | ✅ Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit | User password |
| `first_name` | string | ✅ Yes | Min 1 char, max 100 chars, letters only | User first name |
| `last_name` | string | ✅ Yes | Min 1 char, max 100 chars, letters only | User last name |

### Response

**Success Response (201 Created):**
```json
{
  "user_id": "usr_789012",
  "email": "newuser@example.com",
  "message": "User registered successfully. Please check your email to verify your account.",
  "verification_required": true,
  "approval_required": false
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string | Newly created user ID |
| `email` | string | Registered email address |
| `message` | string | Success message with next steps |
| `verification_required` | boolean | Whether email verification is required |
| `approval_required` | boolean | Whether admin approval is required |

### Error Responses

**409 Conflict - User Already Exists:**
```json
{
  "error_code": "USER_ALREADY_EXISTS",
  "message": "User with this email already exists",
  "status_code": 409,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123",
  "data": {
    "email": "newuser@example.com"
  }
}
```

**422 Unprocessable Entity - Validation Error:**
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Registration validation failed",
  "status_code": 422,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter",
      "code": "password_strength"
    },
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_format"
    }
  ]
}
```

### Code Examples

**Python:**
```python
import requests

url = "https://api.yourdomain.com/auth/register"
payload = {
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe"
}

response = requests.post(url, json=payload)

if response.status_code == 201:
    data = response.json()
    print(f"Registration successful! User ID: {data['user_id']}")
    print(f"Message: {data['message']}")
else:
    error = response.json()
    print(f"Registration failed: {error['message']}")
```

---

## POST /auth/logout

**Description:** Logout user and invalidate current session.

**Authentication Required:** ✅ Yes (Bearer token)

### Request

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:** Empty (no body required)

### Response

**Success Response (200 OK):**
```json
{
  "message": "Logout successful",
  "logged_out_at": "2025-10-19T10:30:00Z"
}
```

### Error Responses

**401 Unauthorized - Invalid Token:**
```json
{
  "error_code": "INVALID_TOKEN",
  "message": "Invalid or expired token",
  "status_code": 401,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123"
}
```

### Code Examples

**Python:**
```python
import requests

url = "https://api.yourdomain.com/auth/logout"
headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.post(url, headers=headers)

if response.status_code == 200:
    print("Logout successful!")
```

---

## POST /auth/refresh

**Description:** Refresh access token using refresh token.

**Authentication Required:** ✅ Yes (Refresh token in Authorization header)

### Request

**Headers:**
```http
Authorization: Bearer <refresh_token>
Content-Type: application/json
```

**Body:** Empty

### Response

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "usr_123456",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Error Responses

**401 Unauthorized - Invalid Refresh Token:**
```json
{
  "error_code": "TOKEN_INVALID",
  "message": "Invalid or expired refresh token",
  "status_code": 401,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123"
}
```

### Code Examples

**Python:**
```python
import requests

url = "https://api.yourdomain.com/auth/refresh"
headers = {
    "Authorization": f"Bearer {refresh_token}"
}

response = requests.post(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    new_access_token = data["access_token"]
    print(f"Token refreshed successfully!")
```

---

## POST /auth/verify-email

**Description:** Verify user email address using verification token sent via email.

**Authentication Required:** ❌ No

### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "token": "verify_abc123def456"
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `token` | string | ✅ Yes | Min 10 chars | Email verification token |

### Response

**Success Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "verified_at": "2025-10-19T10:30:00Z",
  "user_id": null,
  "approval_required": false
}
```

### Error Responses

**400 Bad Request - Invalid Token:**
```json
{
  "error_code": "TOKEN_INVALID",
  "message": "Invalid or expired verification token",
  "status_code": 400,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123"
}
```

**404 Not Found - User Not Found:**
```json
{
  "error_code": "USER_NOT_FOUND",
  "message": "User not found",
  "status_code": 404,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123"
}
```

---

## POST /auth/resend-verification

**Description:** Resend email verification link.

**Authentication Required:** ❌ No

### Request

**Body:**
```json
{
  "email": "user@example.com"
}
```

### Response

**Success Response (200 OK):**
```json
{
  "message": "If the email exists in our system, a verification email has been sent.",
  "email": "user@example.com",
  "resent_at": "2025-10-19T10:30:00Z"
}
```

**Note:** For security, always returns success even if user doesn't exist.

---

## POST /auth/forgot-password

**Description:** Request password reset email.

**Authentication Required:** ❌ No

### Request

**Body:**
```json
{
  "email": "user@example.com"
}
```

### Response

**Success Response (200 OK):**
```json
{
  "message": "If the email exists in our system, a password reset link has been sent.",
  "email": "user@example.com"
}
```

**Note:** For security, always returns success even if user doesn't exist.

---

## POST /auth/reset-password

**Description:** Reset password using token from email.

**Authentication Required:** ❌ No

### Request

**Body:**
```json
{
  "token": "reset_abc123def456",
  "new_password": "NewSecurePassword123!"
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `token` | string | ✅ Yes | Min 10 chars | Password reset token |
| `new_password` | string | ✅ Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit | New password |

### Response

**Success Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

### Error Responses

**400 Bad Request - Invalid Token:**
```json
{
  "error_code": "TOKEN_INVALID",
  "message": "Invalid or expired reset token",
  "status_code": 400,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123"
}
```

**422 Unprocessable Entity - Weak Password:**
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Password reset validation failed",
  "status_code": 422,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123",
  "errors": [
    {
      "field": "new_password",
      "message": "Password must contain at least one uppercase letter",
      "code": "password_strength"
    }
  ]
}
```

---

## POST /auth/change-password

**Description:** Change password for authenticated user.

**Authentication Required:** ✅ Yes (Bearer token)

### Request

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePassword123!"
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `current_password` | string | ✅ Yes | - | Current password for verification |
| `new_password` | string | ✅ Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit | New password |

### Response

**Success Response (200 OK):**
```json
{
  "message": "Password changed successfully",
  "changed_at": "2025-10-19T10:30:00Z"
}
```

### Error Responses

**401 Unauthorized - Wrong Current Password:**
```json
{
  "error_code": "INVALID_CREDENTIALS",
  "message": "Current password is incorrect",
  "status_code": 401,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123"
}
```

---

## POST /auth/password-reset

**Description:** Alias for `/auth/forgot-password` - request password reset.

**Authentication Required:** ❌ No

*See `/auth/forgot-password` for full documentation.*

---

**Next:** [Admin Endpoints Documentation](./API_ADMIN_ENDPOINTS.md)
