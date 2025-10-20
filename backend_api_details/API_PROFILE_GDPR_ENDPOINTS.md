# Profile, GDPR, Audit & Health Endpoints

---

## Profile Endpoints

**Base Path:** `/profile`  
**Authentication Required:** ✅ Yes (User role)

### GET /profile/me

**Description:** Get current user's profile information.

**Authentication:** ✅ Required (Any authenticated user)

**Request:**

```http
GET /profile/me HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string | Unique user identifier |
| `email` | string | User email address |
| `first_name` | string | User first name |
| `last_name` | string | User last name |
| `role` | string | User role (user/admin/auditor) |
| `status` | string | Account status (active/inactive) |
| `is_verified` | boolean | Email verification status |
| `created_at` | string | Account creation timestamp |
| `last_login` | string\|null | Last login timestamp |

**Error Responses:**

**401 Unauthorized:**

```json
{
  "error_code": "AUTHENTICATION_REQUIRED",
  "message": "Authentication required",
  "status_code": 401
}
```

**404 Not Found - Profile Not Found:**

```json
{
  "error_code": "PROFILE_NOT_FOUND",
  "message": "User profile not found",
  "status_code": 404,
  "data": {
    "user_id": "usr_123456"
  }
}
```

**Code Example (Python):**

```python
import requests

url = "https://api.yourdomain.com/profile/me"
headers = {"Authorization": f"Bearer {access_token}"}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    profile = response.json()
    print(f"User: {profile['first_name']} {profile['last_name']}")
    print(f"Email: {profile['email']}")
    print(f"Role: {profile['role']}")
```

**Alternative Endpoints:**

- `GET /profile` - Same as `/profile/me`
- `GET /profile/` - Same as `/profile/me`

---

### PUT /profile/me

**Description:** Update current user's profile.

**Authentication:** ✅ Required (Any authenticated user)

**Request Body (all fields optional):**

```json
{
  "first_name": "John",
  "last_name": "Smith"
}
```

**Updatable Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `first_name` | string | 1-100 chars, letters only | User first name |
| `last_name` | string | 1-100 chars, letters only | User last name |

**Note:** Users cannot update their own `email`, `role`, or `is_active` status. Only admins can modify these fields.

**Success Response (200 OK):**

```json
{
  "user_id": "usr_123456",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "role": "user",
  "status": "active",
  "is_verified": true,
  "created_at": "2025-10-01T08:30:00Z",
  "last_login": "2025-10-19T09:15:00Z"
}
```

**Error Responses:**

**422 Unprocessable Entity - Validation Error:**

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Profile update validation failed",
  "status_code": 422,
  "errors": [
    {
      "field": "first_name",
      "message": "First name must contain only letters",
      "code": "invalid_format"
    }
  ]
}
```

**Code Example (Python):**

```python
import requests

url = "https://api.yourdomain.com/profile/me"
headers = {"Authorization": f"Bearer {access_token}"}
data = {
    "first_name": "John",
    "last_name": "Smith"
}

response = requests.put(url, headers=headers, json=data)

if response.status_code == 200:
    updated_profile = response.json()
    print("Profile updated successfully!")
```

**Alternative Endpoints:**

- `PUT /profile` - Same as `/profile/me`
- `PUT /profile/` - Same as `/profile/me`

---

## GDPR Endpoints

**Base Path:** `/gdpr`  
**Authentication Required:** ✅ Yes (User role)

### POST /gdpr/export/my-data

**Description:** Export all personal data (GDPR Article 15 - Right of Access).

**Authentication:** ✅ Required (Any authenticated user)

**GDPR Compliance:**

- Article 15: Right of access by the data subject
- Data provided in structured, commonly used, machine-readable format
- Must complete within 1 month of request

**Request Body:**

```json
{
  "format": "json",
  "include_audit_logs": true,
  "include_metadata": true
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `format` | string | ❌ No | "json" or "csv" | Export format (default: json) |
| `include_audit_logs` | boolean | ❌ No | - | Include audit trail (default: true) |
| `include_metadata` | boolean | ❌ No | - | Include system metadata (default: true) |

**Success Response (200 OK):**

Returns a downloadable file (JSON or CSV format).

**Response Headers:**

```http
Content-Type: application/json; charset=utf-8
Content-Disposition: attachment; filename="gdpr_export_usr_123456_exp_abc123.json"
X-Export-ID: exp_abc123
X-Record-Count: 142
```

**JSON Export Structure:**

```json
{
  "metadata": {
    "export_id": "exp_abc123",
    "user_id": "usr_123456",
    "export_date": "2025-10-19T10:30:00Z",
    "format": "json",
    "record_count": 142,
    "categories": [
      "personal_data",
      "account_settings",
      "activity_logs",
      "audit_trail"
    ]
  },
  "personal_data": {
    "user_profile": {
      "user_id": "usr_123456",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "created_at": "2025-10-01T08:30:00Z",
      "is_verified": true,
      "is_active": true
    },
    "account_settings": {
      "last_login": "2025-10-19T09:15:00Z",
      "login_count": 42,
      "email_verified_at": "2025-10-01T08:45:00Z"
    },
    "activity_logs": [
      {
        "action": "LOGIN",
        "timestamp": "2025-10-19T09:15:00Z",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0..."
      }
    ],
    "audit_trail": [
      {
        "audit_id": "aud_123",
        "action": "PROFILE_UPDATED",
        "timestamp": "2025-10-18T14:20:00Z",
        "changes": {
          "first_name": ["Old", "New"]
        }
      }
    ]
  }
}
```

**Exported Data Categories:**

| Category | Description | Included Fields |
|----------|-------------|-----------------|
| **Personal Information** | User profile data | name, email, phone, address |
| **Account Data** | Account settings | registration date, last login, preferences |
| **Activity Logs** | Login history | login timestamps, IP addresses, devices |
| **Audit Trail** | Account changes | profile updates, security events |

**Error Responses:**

**500 Internal Server Error:**

```json
{
  "error_code": "EXPORT_FAILED",
  "message": "Data export failed: <error_details>",
  "status_code": 500
}
```

**Code Example (Python):**

```python
import requests

url = "https://api.yourdomain.com/gdpr/export/my-data"
headers = {"Authorization": f"Bearer {access_token}"}
data = {
    "format": "json",
    "include_audit_logs": True,
    "include_metadata": True
}

response = requests.post(url, headers=headers, json=data)

if response.status_code == 200:
    # Save the export to file
    filename = response.headers.get('Content-Disposition').split('filename=')[1].strip('"')
    with open(filename, 'wb') as f:
        f.write(response.content)
    print(f"Data exported to {filename}")
```

---

### DELETE /gdpr/delete/my-account

**Description:** Delete account and all personal data (GDPR Article 17 - Right to Erasure).

**Authentication:** ✅ Required (Any authenticated user)

**GDPR Compliance:**

- Article 17: Right to erasure ("right to be forgotten")
- Data deleted without undue delay
- Some data may be retained if required by law (audit logs for 7 years)

**⚠️ WARNING:** This action is IRREVERSIBLE. All data will be permanently deleted.

**Request Body:**

```json
{
  "confirmation": "DELETE MY ACCOUNT",
  "reason": "No longer need the service"
}
```

**Field Validations:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `confirmation` | string | ✅ Yes | Must be exactly "DELETE MY ACCOUNT" | Deletion confirmation |
| `reason` | string | ❌ No | Max 500 chars | Optional deletion reason |

**Success Response (200 OK):**

```json
{
  "deletion_id": "del_xyz789",
  "user_id": "usr_123456",
  "deletion_date": "2025-10-19T10:30:00Z",
  "records_deleted": 142,
  "categories_deleted": [
    "user_profile",
    "activity_logs",
    "preferences"
  ],
  "anonymization_applied": true
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `deletion_id` | string | Unique deletion identifier |
| `user_id` | string | Deleted user ID |
| `deletion_date` | string | Deletion timestamp (ISO 8601) |
| `records_deleted` | integer | Total records deleted |
| `categories_deleted` | array | Data categories deleted |
| `anonymization_applied` | boolean | Whether data was anonymized vs hard-deleted |

**Deletion Process:**

1. ✅ Validate deletion request (requires explicit confirmation)
2. ✅ Delete user profile and account data
3. ✅ Delete activity logs and preferences
4. ✅ Anonymize audit logs (retain for compliance, remove PII)
5. ✅ Invalidate all sessions and tokens
6. ✅ Send deletion confirmation email

**Data Retention:**

| Data Type | Action |
|-----------|--------|
| User Profile | ❌ DELETED |
| Activity Logs | ❌ DELETED |
| Audit Logs | ⚠️ ANONYMIZED (user_id replaced with "deleted_user_XXX") |
| Financial Records | ✅ RETAINED (legal requirement, 7 years) |

**Error Responses:**

**422 Unprocessable Entity - Invalid Confirmation:**

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid confirmation text",
  "status_code": 422,
  "errors": [
    {
      "field": "confirmation",
      "message": "Must type 'DELETE MY ACCOUNT' to confirm",
      "code": "invalid_confirmation"
    }
  ]
}
```

**Code Example (Python):**

```python
import requests

url = "https://api.yourdomain.com/gdpr/delete/my-account"
headers = {"Authorization": f"Bearer {access_token}"}
data = {
    "confirmation": "DELETE MY ACCOUNT",
    "reason": "No longer need the service"
}

response = requests.delete(url, headers=headers, json=data)

if response.status_code == 200:
    result = response.json()
    print(f"Account deleted: {result['records_deleted']} records removed")
```

---

### GET /gdpr/export/status/{export_id}

**Description:** Check status of data export request (for async exports).

**Authentication:** ✅ Required (Any authenticated user)

**Note:** Currently exports are synchronous, but this endpoint is included for future async export support.

**Success Response (200 OK):**

```json
{
  "export_id": "exp_abc123",
  "status": "completed",
  "created_at": "2025-10-19T10:30:00Z",
  "completed_at": "2025-10-19T10:30:15Z",
  "download_url": null,
  "expires_at": null
}
```

---

## Audit Endpoints

**Base Path:** `/audit`  
**Authentication Required:** ✅ Yes (Auditor or Admin role)

### GET /audit/logs

**Description:** Query audit logs with filtering and pagination.

**Authentication:** ✅ Required (Auditor or Admin role)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | string | ❌ No | - | Filter by action (e.g., "USER_LOGIN") |
| `resource` | string | ❌ No | - | Filter by resource type (e.g., "user") |
| `user_id` | string | ❌ No | - | Filter by user ID |
| `start_date` | datetime | ❌ No | - | Start date (ISO 8601, UTC) |
| `end_date` | datetime | ❌ No | - | End date (ISO 8601, UTC) |
| `severity` | string | ❌ No | - | Filter by severity (info/warning/error/critical) |
| `page` | integer | ❌ No | 1 | Page number (min: 1) |
| `limit` | integer | ❌ No | 10 | Items per page (min: 1, max: 100) |

**Request Example:**

```http
GET /audit/logs?action=USER_LOGIN&severity=info&page=1&limit=20 HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer <auditor_access_token>
```

**Success Response (200 OK):**

```json
{
  "items": [
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
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
    },
    {
      "audit_id": "aud_123457",
      "user_id": "usr_789",
      "action": "PROFILE_UPDATED",
      "resource_type": "user",
      "resource_id": "usr_789",
      "severity": "info",
      "timestamp": "2025-10-19T10:25:00Z",
      "metadata": {
        "changes": {
          "first_name": ["Old", "New"]
        }
      },
      "outcome": "success",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    }
  ],
  "total": 1250,
  "limit": 20,
  "offset": 0,
  "has_next": true,
  "has_prev": false
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | Array of audit log entries |
| `total` | integer | Total matching records |
| `limit` | integer | Items per page |
| `offset` | integer | Offset from start |
| `has_next` | boolean | Whether next page exists |
| `has_prev` | boolean | Whether previous page exists |

**Audit Entry Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `audit_id` | string | Unique audit entry ID |
| `user_id` | string | User who performed action |
| `action` | string | Action type (e.g., USER_LOGIN, PROFILE_UPDATED) |
| `resource_type` | string | Resource type affected (user/session/role) |
| `resource_id` | string | ID of affected resource |
| `severity` | string | Severity level (info/warning/error/critical) |
| `timestamp` | string | Action timestamp (ISO 8601) |
| `metadata` | object | Additional action details |
| `outcome` | string | Action outcome (success/failure) |
| `ip_address` | string | Client IP address |
| `user_agent` | string | Client user agent |

**Common Action Types:**

| Action | Description |
|--------|-------------|
| `USER_LOGIN` | User logged in |
| `USER_LOGOUT` | User logged out |
| `USER_CREATED` | New user registered |
| `USER_UPDATED` | User profile updated |
| `USER_DELETED` | User account deleted |
| `PROFILE_UPDATED` | Profile information changed |
| `PASSWORD_CHANGED` | Password changed |
| `PASSWORD_RESET` | Password reset requested |
| `EMAIL_VERIFIED` | Email address verified |
| `ROLE_ASSIGNED` | Role assigned to user |
| `ROLE_REVOKED` | Role revoked from user |

**Error Responses:**

**400 Bad Request - Invalid Date Range:**

```json
{
  "code": "INVALID_RANGE",
  "message": "Start date must be before end date",
  "details": {
    "data": [
      {
        "start_date": "2025-10-20T00:00:00Z",
        "end_date": "2025-10-19T00:00:00Z"
      }
    ]
  }
}
```

**403 Forbidden - Not Authorized:**

```json
{
  "error_code": "PERMISSION_DENIED",
  "message": "Auditor or Admin access required",
  "status_code": 403
}
```

**Code Example (Python):**

```python
import requests
from datetime import datetime, timedelta

url = "https://api.yourdomain.com/audit/logs"
headers = {"Authorization": f"Bearer {auditor_token}"}

# Query last 24 hours of login events
params = {
    "action": "USER_LOGIN",
    "start_date": (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z",
    "end_date": datetime.utcnow().isoformat() + "Z",
    "page": 1,
    "limit": 50
}

response = requests.get(url, headers=headers, params=params)

if response.status_code == 200:
    data = response.json()
    print(f"Found {data['total']} audit entries")
    for entry in data['items']:
        print(f"{entry['timestamp']}: {entry['action']} by {entry['user_id']}")
```

---

### GET /audit/summary

**Description:** Get audit log summary statistics.

**Authentication:** ✅ Required (Auditor or Admin role)

**Success Response (200 OK):**

```json
{
  "total_entries": 12450,
  "date_range": {
    "earliest": "2025-01-01T00:00:00Z",
    "latest": "2025-10-19T10:30:00Z"
  },
  "by_action": {
    "USER_LOGIN": 4230,
    "USER_LOGOUT": 4180,
    "PROFILE_UPDATED": 850,
    "PASSWORD_CHANGED": 120,
    "USER_CREATED": 520
  },
  "by_severity": {
    "info": 11200,
    "warning": 850,
    "error": 350,
    "critical": 50
  },
  "by_outcome": {
    "success": 11800,
    "failure": 650
  }
}
```

---

## Health Endpoints

**Base Path:** `/health`  
**Authentication Required:** ❌ No

### GET /health/

**Description:** Basic health check (always returns healthy for liveness probes).

**Success Response (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T10:30:00Z",
  "environment": "production",
  "service": "User Management API",
  "version": "1.0.0"
}
```

---

### GET /health/ping

**Description:** Lightweight ping endpoint.

**Success Response (200 OK):**

```json
{
  "message": "pong",
  "timestamp": "2025-10-19T10:30:00Z"
}
```

---

### GET /health/ready

**Description:** Readiness check for orchestrators (Kubernetes, ECS).

**Success Response (200 OK):**

```json
{
  "status": "ready",
  "timestamp": "2025-10-19T10:30:00Z",
  "environment": "production"
}
```

---

### GET /health/detailed

**Description:** Comprehensive health status with subsystem checks.

**Success Response (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T10:30:00Z",
  "environment": "production",
  "service": "User Management API",
  "version": "1.0.0",
  "uptime_seconds": 86400.5,
  "checks": {
    "database": {
      "status": "healthy",
      "connected": true,
      "response_time_ms": 12.5
    },
    "system": {
      "status": "healthy",
      "cpu_usage_percent": 25.3,
      "memory_usage_percent": 45.2,
      "disk_usage_percent": 60.1
    },
    "configuration": {
      "status": "healthy",
      "valid": true
    }
  }
}
```

---

**Next:** [Error Codes & Models Reference](./API_ERROR_CODES.md)
