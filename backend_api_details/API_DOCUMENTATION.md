# User Management System - API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.yourdomain.com` (or `http://localhost:8000` for development)  
**Date:** October 19, 2025  
**Author:** Backend Team

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Integration Guide](#integration-guide)

---

## Overview

This User Management System provides a comprehensive REST API for managing users, authentication, authorization, audit logs, GDPR compliance, and health monitoring. The API is built with FastAPI and follows REST principles.

### Key Features

- ✅ User Registration & Authentication
- ✅ JWT-based Token Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Admin User Management
- ✅ Audit Logging
- ✅ GDPR Compliance (Data Export & Deletion)
- ✅ Health Monitoring
- ✅ Rate Limiting
- ✅ Field-level Validation
- ✅ Comprehensive Error Handling

### API Categories

| Category | Prefix | Description |
|----------|--------|-------------|
| **Authentication** | `/auth` | User login, registration, password management |
| **Profile** | `/profile` | User profile management |
| **Admin** | `/admin` | Administrative user management |
| **Audit** | `/audit` | Audit log queries |
| **GDPR** | `/gdpr` | Data export and account deletion |
| **Health** | `/health` | System health checks |
| **Logs** | `/logs` | Frontend error logging |

---

## Authentication & Authorization

### Authentication Methods

#### 1. JWT Token Authentication (Primary)

**How it works:**
1. User logs in with email/password at `/auth/login`
2. Server returns `access_token` and `refresh_token`
3. Client includes token in subsequent requests: `Authorization: Bearer <access_token>`
4. Token expires after 30 minutes (configurable)
5. Use `/auth/refresh` to get new token

**Token Structure:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Payload:**
```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "role": "user",
  "exp": 1729350000,
  "iat": 1729348200
}
```

#### 2. Secure Cookie Authentication (Alternative)

Available at `/auth/secure-*` endpoints for web applications requiring httpOnly cookies.

### Authorization Levels

| Role | Description | Access |
|------|-------------|--------|
| **user** | Standard user | Own profile, auth endpoints |
| **admin** | Administrator | All user management, audit logs |
| **auditor** | Audit viewer | Read-only audit logs |

### Including Authentication in Requests

**HTTP Header:**
```http
GET /profile/me HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**cURL Example:**
```bash
curl -X GET "https://api.yourdomain.com/profile/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Python Example:**
```python
import requests

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

response = requests.get(
    "https://api.yourdomain.com/profile/me",
    headers=headers
)
```

---

## API Endpoints Reference

### Complete Endpoint List

| # | Method | Endpoint | Auth Required | Role | Description |
|---|--------|----------|---------------|------|-------------|
| **AUTHENTICATION ENDPOINTS** |
| 1 | POST | `/auth/login` | ❌ No | - | User login |
| 2 | POST | `/auth/register` | ❌ No | - | User registration |
| 3 | POST | `/auth/logout` | ✅ Yes | user | User logout |
| 4 | POST | `/auth/refresh` | ✅ Yes | user | Refresh access token |
| 5 | POST | `/auth/verify-email` | ❌ No | - | Verify email with token |
| 6 | POST | `/auth/resend-verification` | ❌ No | - | Resend verification email |
| 7 | POST | `/auth/forgot-password` | ❌ No | - | Request password reset |
| 8 | POST | `/auth/reset-password` | ❌ No | - | Reset password with token |
| 9 | POST | `/auth/change-password` | ✅ Yes | user | Change password (authenticated) |
| 10 | POST | `/auth/password-reset` | ❌ No | - | Request password reset (alias) |
| **SECURE AUTHENTICATION (httpOnly Cookies)** |
| 11 | POST | `/auth/secure-login` | ❌ No | - | Login with secure cookies |
| 12 | POST | `/auth/secure-logout` | ✅ Yes | user | Logout (clear cookies) |
| 13 | POST | `/auth/secure-refresh` | ✅ Yes | user | Refresh token (cookies) |
| **PROFILE ENDPOINTS** |
| 14 | GET | `/profile/me` | ✅ Yes | user | Get current user profile |
| 15 | GET | `/profile` | ✅ Yes | user | Get profile (alias) |
| 16 | GET | `/profile/` | ✅ Yes | user | Get profile (alias) |
| 17 | PUT | `/profile/me` | ✅ Yes | user | Update current user profile |
| 18 | PUT | `/profile` | ✅ Yes | user | Update profile (alias) |
| 19 | PUT | `/profile/` | ✅ Yes | user | Update profile (alias) |
| **ADMIN ENDPOINTS** |
| 20 | GET | `/admin/users` | ✅ Yes | admin | List all users (paginated) |
| 21 | POST | `/admin/users` | ✅ Yes | admin | Create new user |
| 22 | GET | `/admin/users/{user_id}` | ✅ Yes | admin | Get user details |
| 23 | PUT | `/admin/users/{user_id}` | ✅ Yes | admin | Update user |
| 24 | DELETE | `/admin/users/{user_id}` | ✅ Yes | admin | Delete user |
| 25 | POST | `/admin/approve-user` | ✅ Yes | admin | Approve user account |
| 26 | POST | `/admin/users/{user_id}/approve` | ✅ Yes | admin | Approve user (RESTful) |
| 27 | POST | `/admin/users/{user_id}/reject` | ✅ Yes | admin | Reject user account |
| 28 | GET | `/admin/roles` | ✅ Yes | admin | List all roles |
| 29 | POST | `/admin/roles` | ✅ Yes | admin | Create new role |
| 30 | GET | `/admin/roles/{role_name}` | ✅ Yes | admin | Get role details |
| 31 | PUT | `/admin/roles/{role_name}` | ✅ Yes | admin | Update role |
| 32 | DELETE | `/admin/roles/{role_name}` | ✅ Yes | admin | Delete role |
| 33 | POST | `/admin/users/{user_id}/assign-role` | ✅ Yes | admin | Assign role to user |
| 34 | POST | `/admin/users/{user_id}/revoke-role` | ✅ Yes | admin | Revoke role from user |
| 35 | GET | `/admin/audit-logs` | ✅ Yes | admin | Get audit logs (paginated) |
| **AUDIT ENDPOINTS** |
| 36 | GET | `/audit/logs` | ✅ Yes | auditor | Query audit logs |
| 37 | GET | `/audit/summary` | ✅ Yes | auditor | Get audit summary statistics |
| **GDPR ENDPOINTS** |
| 38 | POST | `/gdpr/export/my-data` | ✅ Yes | user | Export personal data |
| 39 | DELETE | `/gdpr/delete/my-account` | ✅ Yes | user | Delete account (GDPR) |
| 40 | GET | `/gdpr/export/status/{export_id}` | ✅ Yes | user | Check export status |
| **HEALTH ENDPOINTS** |
| 41 | GET | `/health/` | ❌ No | - | Basic health check |
| 42 | GET | `/health/ping` | ❌ No | - | Ping endpoint |
| 43 | GET | `/health/ready` | ❌ No | - | Readiness probe |
| 44 | GET | `/health/live` | ❌ No | - | Liveness probe |
| 45 | GET | `/health/detailed` | ❌ No | - | Detailed health status |
| 46 | GET | `/health/database` | ❌ No | - | Database health check |
| 47 | GET | `/health/system` | ❌ No | - | System resources check |
| **LOGS ENDPOINTS** |
| 48 | POST | `/logs/frontend-errors` | ❌ No | - | Log frontend errors |

**Total Endpoints:** 48 API endpoints

---

## Quick Start Integration

### 1. Register a New User

```bash
curl -X POST "https://api.yourdomain.com/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### 2. Login

```bash
curl -X POST "https://api.yourdomain.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Access Protected Endpoint

```bash
curl -X GET "https://api.yourdomain.com/profile/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

**Continue to detailed endpoint documentation:**
- [Authentication Endpoints](./API_AUTH_ENDPOINTS.md)
- [Admin Endpoints](./API_ADMIN_ENDPOINTS.md)
- [Request/Response Models](./API_MODELS.md)
- [Error Codes Reference](./API_ERROR_CODES.md)
