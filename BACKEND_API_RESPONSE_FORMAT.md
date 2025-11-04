# Backend API Response Format - Expected Wrappers

This document specifies the expected response format for all backend APIs to ensure frontend compatibility.

## 🎯 Current Issues

The backend is currently returning **arrays directly** instead of **wrapped responses** with pagination and metadata. This requires frontend adapters to handle the inconsistency.

---

## 📋 Users API - Expected Format

### Endpoint
```
GET /api/v1/admin/users
```

### ❌ Current Backend Response (WRONG)
```json
[
  {
    "user_id": "user-001",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "status": "active",
    "roles": ["user"],
    "is_approved": true,
    "email_verified": true,
    "phone_verified": false,
    "login_count": 42,
    "failed_login_attempts": 0,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-11-03T14:20:00Z"
  },
  ...more users...
]
```

### ✅ Expected Backend Response (CORRECT)
```json
{
  "users": [
    {
      "user_id": "user-001",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "phone_number": "+1234567890",
      "date_of_birth": "1990-05-15",
      "gender": "male",
      "profile_picture_url": "https://...",
      "bio": "Software engineer",
      
      "status": "active",
      "account_type": "standard",
      "roles": ["user"],
      
      "email_verified": true,
      "phone_verified": false,
      "is_approved": true,
      
      "last_login": "2025-11-03T14:20:00Z",
      "last_active": "2025-11-03T15:45:00Z",
      "login_count": 42,
      "failed_login_attempts": 0,
      
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-11-03T14:20:00Z",
      "created_by": "admin-001",
      "updated_by": "admin-001",
      "approved_at": "2025-01-15T11:00:00Z",
      "approved_by": "admin-001"
    },
    ...more users...
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_items": 42,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "status": ["active"],
    "role": ["user"],
    "search": "john"
  },
  "summary": {
    "total_users": 42,
    "active_users": 38,
    "inactive_users": 3,
    "pending_approval": 1
  }
}
```

### Python FastAPI Implementation
```python
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class PaginationInfo(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_prev: bool

class UsersSummary(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    pending_approval: int

class ListUsersResponse(BaseModel):
    users: List[AdminUser]
    pagination: PaginationInfo
    filters_applied: Dict[str, Any]
    summary: Optional[UsersSummary] = None

@router.get("/users", response_model=ListUsersResponse)
async def list_users(
    page: int = 1,
    page_size: int = 10,
    status: Optional[str] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
    # ... other filters
):
    # Query database with filters
    users = await user_service.list_users(...)
    total = await user_service.count_users(...)
    
    return ListUsersResponse(
        users=users,
        pagination=PaginationInfo(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=math.ceil(total / page_size),
            has_next=page * page_size < total,
            has_prev=page > 1
        ),
        filters_applied={
            "status": status,
            "role": role,
            "search": search
        },
        summary=UsersSummary(
            total_users=total,
            active_users=await user_service.count_active(),
            inactive_users=await user_service.count_inactive(),
            pending_approval=await user_service.count_pending()
        )
    )
```

---

## 📋 Audit Logs API - Expected Format

### Endpoint
```
GET /api/v1/admin/audit-logs
```

### ❌ Current Backend Response (WRONG)
Backend returns array with **different field names**:
```json
[
  {
    "audit_id": "audit-001",           // ❌ Frontend expects: log_id
    "user_id": "super-admin-001",      // ❌ Frontend expects: actor.user_id
    "action": "user_login",            // ✅ Match
    "resource_type": "authentication", // ❌ Frontend expects: resource
    "resource_id": null,               // ❌ Frontend expects: target.resource_id
    "severity": "info",                // ✅ Match
    "timestamp": "2025-11-03T20:40:47.995574Z", // ✅ Match
    "metadata": {"success": true},     // ❌ Frontend expects: details
    "outcome": null,                   // ❌ Frontend expects: result
    "ip_address": "127.0.0.1",         // ❌ Frontend expects: actor.ip_address
    "user_agent": null                 // ✅ Match
  }
]
```

### ✅ Expected Backend Response (CORRECT)
```json
{
  "logs": [
    {
      "log_id": "audit-001",
      "timestamp": "2025-11-03T20:40:47.995574Z",
      "action": "user_login",
      "resource": "authentication",
      "severity": "info",
      
      "actor": {
        "user_id": "super-admin-001",
        "email": "admin@example.com",
        "username": "admin",
        "ip_address": "127.0.0.1"
      },
      
      "target": {
        "user_id": "user-123",
        "resource_id": "resource-456",
        "resource_type": "user_account"
      },
      
      "details": {
        "success": true,
        "method": "POST",
        "endpoint": "/api/v1/auth/login",
        "changes": {
          "last_login": "2025-11-03T20:40:47Z"
        }
      },
      
      "result": "success",
      "duration_ms": 125,
      "user_agent": "Mozilla/5.0...",
      "session_id": "session-abc123"
    },
    ...more logs...
  ],
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total_items": 2,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  },
  "filters_applied": {
    "severity": "low",
    "action": ["user_login", "user_logout"],
    "date_from": "2025-11-01T00:00:00Z",
    "date_to": "2025-11-04T23:59:59Z"
  },
  "summary": {
    "total_logs_in_period": 2,
    "by_severity": {
      "low": 0,
      "medium": 0,
      "high": 0,
      "critical": 0
    },
    "by_action": {
      "user_login": 1,
      "user_logout": 0,
      "password_change": 0
    }
  }
}
```

### Python FastAPI Implementation
```python
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class AuditSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AuditLogActor(BaseModel):
    user_id: str
    email: Optional[str] = None
    username: Optional[str] = None
    ip_address: str

class AuditLogTarget(BaseModel):
    user_id: Optional[str] = None
    resource_id: str
    resource_type: str

class AuditLog(BaseModel):
    log_id: str
    timestamp: str
    action: str
    resource: str
    severity: AuditSeverity
    
    actor: AuditLogActor
    target: Optional[AuditLogTarget] = None
    
    details: Dict[str, Any]
    result: str
    duration_ms: int
    user_agent: Optional[str] = None
    session_id: Optional[str] = None

class AuditLogSummary(BaseModel):
    total_logs_in_period: int
    by_severity: Dict[str, int]
    by_action: Dict[str, int]

class AuditLogsResponse(BaseModel):
    logs: List[AuditLog]
    pagination: PaginationInfo
    filters_applied: Dict[str, Any]
    summary: AuditLogSummary

@router.get("/audit-logs", response_model=AuditLogsResponse)
async def get_audit_logs(
    page: int = 1,
    page_size: int = 50,
    severity: Optional[str] = None,
    action: Optional[str] = None,
    # ... other filters
):
    logs = await audit_service.list_logs(...)
    total = await audit_service.count_logs(...)
    
    return AuditLogsResponse(
        logs=[
            AuditLog(
                log_id=log.id,
                timestamp=log.timestamp.isoformat(),
                action=log.action,
                resource=log.resource,
                severity=log.severity,
                actor=AuditLogActor(
                    user_id=log.user_id,
                    email=log.user_email,
                    username=log.username,
                    ip_address=log.ip_address
                ),
                target=AuditLogTarget(
                    resource_id=log.resource_id,
                    resource_type=log.resource_type
                ) if log.resource_id else None,
                details=log.metadata or {},
                result=log.outcome or "unknown",
                duration_ms=log.duration_ms or 0,
                user_agent=log.user_agent,
                session_id=log.session_id
            )
            for log in logs
        ],
        pagination=PaginationInfo(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=math.ceil(total / page_size),
            has_next=page * page_size < total,
            has_prev=page > 1
        ),
        filters_applied={
            "severity": severity,
            "action": action
        },
        summary=AuditLogSummary(
            total_logs_in_period=total,
            by_severity=await audit_service.count_by_severity(),
            by_action=await audit_service.count_by_action()
        )
    )
```

---

## 🔑 Key Requirements

### 1. **Always Wrap Collections**
Never return raw arrays. Always wrap in an object with:
- `data` field (users, logs, roles, etc.)
- `pagination` object
- `filters_applied` object
- Optional `summary` or `metadata`

### 2. **Consistent Field Names**
Use the **same field names** between backend and frontend:
- ✅ `log_id` (not `audit_id`)
- ✅ `resource` (not `resource_type`)
- ✅ `details` (not `metadata`)
- ✅ `result` (not `outcome`)
- ✅ `actor.user_id` (not flat `user_id`)

### 3. **Always Include Pagination**
Even for small datasets, include pagination info:
```json
{
  "page": 1,
  "page_size": 10,
  "total_items": 42,
  "total_pages": 5,
  "has_next": true,
  "has_prev": false
}
```

### 4. **Nested Objects for Related Data**
Use nested objects for related entities:
```json
{
  "actor": {
    "user_id": "...",
    "ip_address": "..."
  },
  "target": {
    "resource_id": "...",
    "resource_type": "..."
  }
}
```

### 5. **Summary/Metadata**
Include summary statistics when useful:
```json
{
  "summary": {
    "total_users": 42,
    "active_users": 38,
    "inactive_users": 3,
    "pending_approval": 1
  }
}
```

---

## 🛠️ Temporary Frontend Solution

Until the backend is updated, the frontend uses **adapter functions** to handle both formats:

```typescript
// In adminService.ts and adminAuditService.ts
function adaptResponse(response: unknown): ExpectedResponse {
  // Check if already in correct format
  if (hasExpectedStructure(response)) {
    return response as ExpectedResponse;
  }
  
  // If array, wrap it and compute pagination
  if (Array.isArray(response)) {
    return {
      data: transformFieldNames(response),
      pagination: computePagination(response),
      filters_applied: {},
      summary: computeSummary(response)
    };
  }
  
  return emptyResponse();
}
```

---

## 📚 References

- Frontend User Type: `src/domains/admin/types/adminUser.types.ts` (AdminUser interface)
- Frontend Audit Type: `src/domains/admin/types/adminAudit.types.ts` (AuditLog interface)
- User Service Adapter: `src/domains/admin/services/adminService.ts` (adaptUserListResponse)
- Audit Service Adapter: `src/domains/admin/services/adminAuditService.ts` (adaptAuditLogsResponse)
- Validation Alignment: `BACKEND_FRONTEND_VALIDATION_ALIGNMENT.md`

---

## ✅ Action Items for Backend Team

1. **Update `/api/v1/admin/users` endpoint**
   - Return `ListUsersResponse` format with wrapped users array
   - Include pagination, filters_applied, and summary

2. **Update `/api/v1/admin/audit-logs` endpoint**
   - Return `AuditLogsResponse` format with wrapped logs array
   - Change field names to match frontend (audit_id → log_id, etc.)
   - Nest actor and target information
   - Include pagination and summary

3. **Verify Field Name Consistency**
   - Review all API endpoints
   - Ensure field names match TypeScript interfaces
   - Use consistent naming conventions (snake_case)

4. **Add Response Models**
   - Define Pydantic models for all responses
   - Use consistent pagination structure across all endpoints
   - Include OpenAPI documentation
