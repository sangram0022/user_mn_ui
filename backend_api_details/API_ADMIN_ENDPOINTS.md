# Admin Endpoints - Detailed Documentation

**Base Path:** `/admin`  
**Authentication Required:** ✅ Yes (Admin role required)

---

## Table of Contents

1. [User Management](#user-management)
2. [Role Management](#role-management)
3. [User Approval](#user-approval)
4. [Audit Logs](#audit-logs)

---

## User Management

### GET /admin/users

**Description:** List all users with pagination and filtering.

**Authentication:** ✅ Required (Admin role)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | ❌ No | 1 | Page number (min: 1) |
| `limit` | integer | ❌ No | 10 | Items per page (min: 1, max: 100) |
| `role` | string | ❌ No | - | Filter by role (user/admin/auditor) |
| `is_active` | boolean | ❌ No | - | Filter by active status |

**Request Example:**

```http
GET /admin/users?page=1&limit=20&role=user&is_active=true HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer <admin_access_token>
```

**Success Response (200 OK):**

```json
[
  {
    "user_id": "usr_123456",
    "email": "user1@example.com",
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
  },
  {
    "user_id": "usr_123457",
    "email": "user2@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "user",
    "is_active": true,
    "is_verified": true,
    "is_approved": false,
    "approved_by": null,
    "approved_at": null,
    "created_at": "2025-10-18T14:20:00Z",
    "last_login_at": null
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string | Unique user identifier |
| `email` | string | User email address |
| `first_name` | string | User first name |
| `last_name` | string | User last name |
| `role` | string | User role (user/admin/auditor) |
| `is_active` | boolean | Account active status |
| `is_verified` | boolean | Email verified status |
| `is_approved` | boolean | Admin approval status |
| `approved_by` | string\|null | Admin ID who approved |
| `approved_at` | string\|null | Approval timestamp (ISO 8601) |
| `created_at` | string | Account creation timestamp |
| `last_login_at` | string\|null | Last login timestamp |

**Error Responses:**

**403 Forbidden - Not Admin:**

```json
{
  "error_code": "PERMISSION_DENIED",
  "message": "Admin access required",
  "status_code": 403,
  "timestamp": "2025-10-19T10:30:00Z",
  "request_id": "req_abc123"
}
```

**Code Example (Python):**

```python
import requests

url = "https://api.yourdomain.com/admin/users"
headers = {"Authorization": f"Bearer {admin_token}"}
params = {
    "page": 1,
    "limit": 20,
    "role": "user",
    "is_active": True
}

response = requests.get(url, headers=headers, params=params)
users = response.json()

for user in users:
    print(f"User: {user['email']} - Role: {user['role']}")
```

---

### POST /admin/users

**Description:** Create a new user (admin-created users are pre-verified and approved).

**Authentication:** ✅ Required (Admin role)

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user"
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | ✅ Yes | Valid email, unique | User email |
| `password` | string | ✅ Yes | Min 8 chars, strong | Initial password |
| `first_name` | string | ✅ Yes | 1-100 chars | First name |
| `last_name` | string | ✅ Yes | 1-100 chars | Last name |
| `role` | string | ❌ No | user/admin/auditor | User role (default: user) |

**Success Response (201 Created):**

```json
{
  "user_id": "usr_987654",
  "email": "newuser@example.com",
  "message": "User created successfully"
}
```

**Error Responses:**

**409 Conflict - User Exists:**

```json
{
  "error_code": "USER_ALREADY_EXISTS",
  "message": "User with this email already exists",
  "status_code": 409,
  "data": {
    "email": "newuser@example.com"
  }
}
```

---

### GET /admin/users/{user_id}

**Description:** Get detailed information about a specific user.

**Authentication:** ✅ Required (Admin role)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | ✅ Yes | User ID to retrieve |

**Success Response (200 OK):**

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

**Additional Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `updated_at` | string | Last profile update timestamp |
| `login_count` | integer | Total number of logins |

**Error Responses:**

**404 Not Found:**

```json
{
  "error_code": "USER_NOT_FOUND",
  "message": "User not found",
  "status_code": 404,
  "data": {
    "user_id": "usr_999999"
  }
}
```

---

### PUT /admin/users/{user_id}

**Description:** Update user profile (admin can update any field).

**Authentication:** ✅ Required (Admin role)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | ✅ Yes | User ID to update |

**Request Body (all fields optional):**

```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "role": "admin",
  "is_active": false
}
```

**Updatable Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `first_name` | string | 1-100 chars | User first name |
| `last_name` | string | 1-100 chars | User last name |
| `role` | string | user/admin/auditor | User role |
| `is_active` | boolean | - | Account active status |

**Success Response (200 OK):**

```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "first_name": "Updated",
  "last_name": "Name",
  "role": "admin",
  "is_active": false,
  "is_verified": true,
  "is_approved": true,
  "approved_by": "admin_789",
  "approved_at": "2025-10-15T10:00:00Z",
  "created_at": "2025-10-01T08:30:00Z",
  "updated_at": "2025-10-19T10:30:00Z",
  "last_login_at": "2025-10-19T09:15:00Z",
  "login_count": 42
}
```

**Note:** An audit event is published for each change.

---

### DELETE /admin/users/{user_id}

**Description:** Delete user account (soft delete - data retained for audit).

**Authentication:** ✅ Required (Admin role)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | ✅ Yes | User ID to delete |

**Success Response (200 OK):**

```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "message": "User deleted successfully",
  "deleted_at": "2025-10-19T10:30:00Z"
}
```

**Error Responses:**

**400 Bad Request - Self Delete:**

```json
{
  "error_code": "SELF_DELETE_FORBIDDEN",
  "message": "Cannot delete your own account",
  "status_code": 400
}
```

**Code Example (Python):**

```python
import requests

url = f"https://api.yourdomain.com/admin/users/{user_id}"
headers = {"Authorization": f"Bearer {admin_token}"}

response = requests.delete(url, headers=headers)

if response.status_code == 200:
    print("User deleted successfully")
```

---

## User Approval

### POST /admin/approve-user

**Description:** Approve user account after email verification.

**Authentication:** ✅ Required (Admin role)

**Request Body:**

```json
{
  "user_id": "usr_123456"
}
```

**Success Response (200 OK):**

```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "approved_by": "admin_789",
  "approved_at": "2025-10-19T10:30:00Z",
  "message": "User approved successfully"
}
```

---

### POST /admin/users/{user_id}/approve

**Description:** Approve user (RESTful alternative endpoint).

**Authentication:** ✅ Required (Admin role)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | ✅ Yes | User ID to approve |

**Success Response (200 OK):**

```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "approved_by": "admin_789",
  "approved_at": "2025-10-19T10:30:00Z",
  "message": "User approved successfully"
}
```

---

### POST /admin/users/{user_id}/reject

**Description:** Reject user account application.

**Authentication:** ✅ Required (Admin role)

**Request Body:**

```json
{
  "reason": "Invalid registration information"
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `reason` | string | ✅ Yes | 10-500 chars | Rejection reason |

**Success Response (200 OK):**

```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "rejected_by": "admin_789",
  "rejected_at": "2025-10-19T10:30:00Z",
  "reason": "Invalid registration information",
  "message": "User rejected successfully"
}
```

---

## Role Management

### GET /admin/roles

**Description:** List all available roles.

**Authentication:** ✅ Required (Admin role)

**Success Response (200 OK):**

```json
[
  {
    "role_name": "user",
    "description": "Standard user with basic permissions",
    "permissions": ["read_profile", "update_profile"],
    "created_at": "2025-01-01T00:00:00Z"
  },
  {
    "role_name": "admin",
    "description": "Administrator with full permissions",
    "permissions": ["*"],
    "created_at": "2025-01-01T00:00:00Z"
  },
  {
    "role_name": "auditor",
    "description": "Auditor with read-only audit log access",
    "permissions": ["read_audit_logs"],
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### POST /admin/roles

**Description:** Create new custom role.

**Authentication:** ✅ Required (Admin role)

**Request Body:**

```json
{
  "role_name": "moderator",
  "description": "Content moderator role",
  "permissions": ["read_users", "update_users"]
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `role_name` | string | ✅ Yes | 3-50 chars, lowercase, unique | Role identifier |
| `description` | string | ✅ Yes | 10-200 chars | Role description |
| `permissions` | array | ✅ Yes | Non-empty array | Permission list |

**Success Response (201 Created):**

```json
{
  "role_name": "moderator",
  "description": "Content moderator role",
  "permissions": ["read_users", "update_users"],
  "created_at": "2025-10-19T10:30:00Z",
  "message": "Role created successfully"
}
```

---

### GET /admin/roles/{role_name}

**Description:** Get role details.

**Authentication:** ✅ Required (Admin role)

**Success Response (200 OK):**

```json
{
  "role_name": "moderator",
  "description": "Content moderator role",
  "permissions": ["read_users", "update_users"],
  "created_at": "2025-10-19T10:30:00Z",
  "updated_at": null,
  "user_count": 5
}
```

---

### PUT /admin/roles/{role_name}

**Description:** Update role permissions.

**Authentication:** ✅ Required (Admin role)

**Request Body:**

```json
{
  "description": "Updated moderator role",
  "permissions": ["read_users", "update_users", "delete_users"]
}
```

**Success Response (200 OK):**

```json
{
  "role_name": "moderator",
  "description": "Updated moderator role",
  "permissions": ["read_users", "update_users", "delete_users"],
  "created_at": "2025-10-19T10:30:00Z",
  "updated_at": "2025-10-19T11:00:00Z",
  "message": "Role updated successfully"
}
```

---

### DELETE /admin/roles/{role_name}

**Description:** Delete custom role (cannot delete system roles: user, admin, auditor).

**Authentication:** ✅ Required (Admin role)

**Success Response (200 OK):**

```json
{
  "role_name": "moderator",
  "message": "Role deleted successfully",
  "deleted_at": "2025-10-19T10:30:00Z"
}
```

**Error Response:**

**400 Bad Request - System Role:**

```json
{
  "error_code": "SYSTEM_ROLE_DELETE_FORBIDDEN",
  "message": "Cannot delete system role",
  "status_code": 400,
  "data": {
    "role_name": "admin"
  }
}
```

---

### POST /admin/users/{user_id}/assign-role

**Description:** Assign role to user.

**Authentication:** ✅ Required (Admin role)

**Request Body:**

```json
{
  "role": "moderator"
}
```

**Success Response (200 OK):**

```json
{
  "user_id": "usr_123456",
  "role": "moderator",
  "assigned_by": "admin_789",
  "assigned_at": "2025-10-19T10:30:00Z",
  "message": "Role assigned successfully"
}
```

---

### POST /admin/users/{user_id}/revoke-role

**Description:** Revoke role from user (resets to default 'user' role).

**Authentication:** ✅ Required (Admin role)

**Success Response (200 OK):**

```json
{
  "user_id": "usr_123456",
  "previous_role": "moderator",
  "new_role": "user",
  "revoked_by": "admin_789",
  "revoked_at": "2025-10-19T10:30:00Z",
  "message": "Role revoked successfully"
}
```

---

## Audit Logs

### GET /admin/audit-logs

**Description:** Get audit logs (paginated).

**Authentication:** ✅ Required (Admin role)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | ❌ No | 1 | Page number |
| `limit` | integer | ❌ No | 10 | Items per page (max: 100) |
| `action` | string | ❌ No | - | Filter by action |
| `user_id` | string | ❌ No | - | Filter by user |

**Success Response (200 OK):**

```json
{
  "items": [
    {
      "audit_id": "aud_123456",
      "user_id": "usr_789",
      "action": "USER_UPDATED",
      "resource_type": "user",
      "resource_id": "usr_123456",
      "severity": "info",
      "timestamp": "2025-10-19T10:30:00Z",
      "metadata": {
        "changes": {
          "role": ["user", "admin"]
        }
      },
      "outcome": "success",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    }
  ],
  "total": 1250,
  "limit": 10,
  "offset": 0,
  "has_next": true,
  "has_prev": false
}
```

---

**Next:** [Profile & GDPR Endpoints](./API_PROFILE_GDPR_ENDPOINTS.md)
