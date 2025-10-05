# API Documentation: FastAPI User Management System

## Overview
This document provides a detailed reference for all API endpoints exposed by the User Management and Audit modules. It is intended for the UI team and other API consumers.

---

## Authentication Endpoints (`/auth`)

### POST `/auth/login`
- **Description:** User login endpoint.
- **Request Body:**
  - `email` (str): User's email address
  - `password` (str): User's password
- **Response:**
  - `access_token` (str): JWT token
  - `token_type` (str): Token type (usually "bearer")
  - `expires_in` (int): Expiry in seconds
  - `user` (object): User profile summary
- **Errors:**
  - 401: Invalid credentials
  - 404: User not found

### POST `/auth/register`
- **Description:** Register a new user account.
- **Request Body:**
  - `email`, `password`, `first_name`, `last_name`, etc.
- **Response:**
  - Registration confirmation and user info
- **Errors:**
  - 400: Validation error
  - 409: User already exists

### POST `/auth/logout`
- **Description:** Logout the current user (JWT token invalidation if supported).
- **Response:**
  - Success message

### POST `/auth/password-reset-request`
- **Description:** Request a password reset email.
- **Request Body:**
  - `email` (str)
- **Response:**
  - Success message

### POST `/auth/reset-password`
- **Description:** Reset password using a token.
- **Request Body:**
  - `token` (str), `new_password` (str)
- **Response:**
  - Success message

### POST `/auth/verify-email`
- **Description:** Verify user email with a token.
- **Request Body:**
  - `token` (str)
- **Response:**
  - Success message

---

## Profile Endpoints (`/profile`)

### GET `/profile/me`
- **Description:** Get the current user's profile.
- **Authentication:** Required
- **Response:**
  - User profile object (id, email, name, role, status, etc.)
- **Errors:**
  - 404: Profile not found

### PUT `/profile/me`
- **Description:** Update the current user's profile.
- **Authentication:** Required
- **Request Body:**
  - Any updatable profile fields
- **Response:**
  - Updated user profile
- **Errors:**
  - 404: Profile not found
  - 400/500: Update failed

---

## Admin Endpoints (`/admin`)

### GET `/admin/users`
- **Description:** List all users (paginated, filterable by role/status).
- **Authentication:** Admin required
- **Query Params:**
  - `page` (int), `limit` (int), `role` (str), `is_active` (bool)
- **Response:**
  - List of user summaries

### POST `/admin/users`
- **Description:** Create a new user (admin action).
- **Request Body:**
  - User creation fields
- **Response:**
  - Created user info

### PUT `/admin/users/{user_id}`
- **Description:** Update a user's details.
- **Request Body:**
  - Updatable user fields
- **Response:**
  - Updated user info

### DELETE `/admin/users/{user_id}`
- **Description:** Delete a user.
- **Response:**
  - Success message

---

## Audit Endpoints (`/audit`)

### GET `/audit/logs`
- **Description:** Query audit logs (filterable by action, resource, user, date).
- **Authentication:** Auditor required
- **Query Params:**
  - `action`, `resource`, `user_id`, `start_date`, `end_date`, `page`, `limit`
- **Response:**
  - List of audit log entries
- **Errors:**
  - 500: Retrieval failed

### GET `/audit/summary`
- **Description:** Get audit log summary statistics.
- **Authentication:** Auditor required
- **Response:**
  - Summary object (total logs, recent actions, security events)

---

## API Details: Input, Headers, Query, Path Params

---

## Authentication Endpoints (`/auth`)

### POST `/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123!"
  }
  ```
- **Response:**
  - `access_token` (str), `token_type` (str), `expires_in` (int), `user` (object)
- **Errors:** 401, 404

### POST `/auth/register`
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "newuser@example.com",
    "password": "securePassword123!",
    "confirm_password": "securePassword123!",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```
- **Response:**
  - `message`, `user_id`, `email`, `verification_required`, `approval_required`, `created_at`, `verification_token`
- **Errors:** 400, 409

### POST `/auth/logout`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - Success message

### POST `/auth/password-reset-request`
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  - Success message

### POST `/auth/reset-password`
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "token": "reset-token-value",
    "new_password": "NewPassword123!"
  }
  ```
- **Response:**
  - Success message

### POST `/auth/verify-email`
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "token": "verification-token-value"
  }
  ```
- **Response:**
  - Success message

---

## Profile Endpoints (`/profile`)

### GET `/profile/me`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - User profile object (see below)
- **Errors:** 404

#### User Profile Example
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "status": "active",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-10T15:45:00Z",
  "phone_number": "+1234567890",
  "avatar_url": "https://example.com/avatars/user123.jpg",
  "preferences": {"theme": "dark", "notifications": true, "language": "en"},
  "metadata": {"source": "web_registration", "referrer": "google"}
}
```

### PUT `/profile/me`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "first_name": "Jane",
    "last_name": "Smith",
    "phone_number": "+1234567890",
    "avatar_url": "https://example.com/avatars/user123.jpg",
    "preferences": {"theme": "light"},
    "metadata": {"referrer": "linkedin"}
  }
  ```
- **Response:**
  - Updated user profile (see above)
- **Errors:** 404, 400/500

---

## Admin Endpoints (`/admin`)

### GET `/admin/users`
- **Headers:**
  - `Authorization: Bearer <admin-token>`
- **Query Params:**
  - `page` (int, default=1)
  - `limit` (int, default=10)
  - `role` (str, optional)
  - `is_active` (bool, optional)
- **Response:**
  - List of user summaries (see below)

#### User Summary Example
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "approved_by": "admin@example.com",
  "approved_at": "2024-01-01T12:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "last_login_at": "2024-01-15T10:30:00Z"
}
```

### POST `/admin/users`
- **Headers:**
  - `Authorization: Bearer <admin-token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "newuser@company.com",
    "password": "SecurePass123!",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "user",
    "is_active": true
  }
  ```
- **Response:**
  - Created user info (see above)

### PUT `/admin/users/{user_id}`
- **Headers:**
  - `Authorization: Bearer <admin-token>`
  - `Content-Type: application/json`
- **Path Params:**
  - `user_id` (str): ID of the user to update
- **Request Body:**
  - Any updatable user fields (same as creation, but all optional)
- **Response:**
  - Updated user info

### DELETE `/admin/users/{user_id}`
- **Headers:**
  - `Authorization: Bearer <admin-token>`
- **Path Params:**
  - `user_id` (str): ID of the user to delete
- **Response:**
  - Success message

---

## Audit Endpoints (`/audit`)

### GET `/audit/logs`
- **Headers:**
  - `Authorization: Bearer <auditor-token>`
- **Query Params:**
  - `action` (str, optional)
  - `resource` (str, optional)
  - `user_id` (str, optional)
  - `start_date` (str, optional, ISO format)
  - `end_date` (str, optional, ISO format)
  - `page` (int, default=1)
  - `limit` (int, default=10)
- **Response:**
  - List of audit log entries (see below)

#### Audit Log Example
```json
{
  "log_id": "log-uuid",
  "user_id": "user-uuid",
  "action": "login",
  "resource": "user",
  "resource_id": "user-uuid",
  "details": {"ip": "127.0.0.1"},
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### GET `/audit/summary`
- **Headers:**
  - `Authorization: Bearer <auditor-token>`
- **Response:**
  - Summary object (e.g., `{ "total_logs": 0, "recent_actions": [], "security_events": 0 }`)

---

## General Notes
- All endpoints return JSON.
- Most endpoints require JWT authentication via the `Authorization: Bearer <token>` header.
- Error responses follow a standard format with `detail` and HTTP status code.
- See OpenAPI/Swagger UI for full request/response models and examples.

---

For further details, see the OpenAPI docs at `/docs` or contact the backend team.
