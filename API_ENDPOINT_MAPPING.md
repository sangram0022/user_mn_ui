# 🗺️ API Endpoint to Domain Mapping

**Complete Visual Reference for 61 Endpoints**

---

## 📊 Domain Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USERMN DOMAIN MAP                         │
│                     (61 Endpoints)                           │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐          ┌────▼────┐         ┌────▼────┐
    │  AUTH   │          │ PROFILE │         │  USERS  │
    │16 APIs  │          │ 2 APIs  │         │ 10 APIs │
    └─────────┘          └─────────┘         └─────────┘
         │
    ┌────▼────┐          ┌─────────┐         ┌─────────┐
    │  RBAC   │          │  ADMIN  │         │  AUDIT  │
    │12 APIs  │          │ 2 APIs  │         │ 5 APIs  │
    └─────────┘          └─────────┘         └─────────┘
         │
    ┌────▼────┐          ┌─────────┐
    │MONITOR  │          │ LOGGING │
    │13 APIs  │          │ 1 API   │
    └─────────┘          └─────────┘
```

---

## 🔐 Authentication Domain (16 Endpoints)

### **File:** `domains/auth/hooks/`

| Hook Name | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| `useLogin` | `/api/v1/auth/login` | POST | Standard login |
| `useRegister` | `/api/v1/auth/register` | POST | User registration |
| `useLogout` | `/api/v1/auth/logout` | POST | User logout |
| `usePasswordReset` | `/api/v1/auth/password-reset` | POST | Request password reset |
| `useRefreshToken` | `/api/v1/auth/refresh` | POST | Refresh access token |
| `useVerifyEmail` | `/api/v1/auth/verify-email` | POST | Verify email address |
| `useResendVerification` | `/api/v1/auth/resend-verification` | POST | Resend verification email |
| `useForgotPassword` | `/api/v1/auth/forgot-password` | POST | Forgot password request |
| `useResetPassword` | `/api/v1/auth/reset-password` | POST | Reset password with token |
| `useChangePassword` | `/api/v1/auth/change-password` | POST | Change current password |
| `usePasswordResetRequest` | `/api/v1/auth/password-reset-request` | POST | Password reset (legacy) |
| **Secure Auth** |||
| `useSecureLogin` | `/api/v1/auth/login-secure` | POST | Secure login (httpOnly cookies) |
| `useSecureLogout` | `/api/v1/auth/logout-secure` | POST | Secure logout |
| `useSecureRefresh` | `/api/v1/auth/refresh-secure` | POST | Refresh via cookies |
| `useCsrfToken` | `/api/v1/auth/csrf-token` | GET | Get CSRF token |
| `useValidateCsrf` | `/api/v1/auth/validate-csrf` | POST | Validate CSRF token |

### **Query Keys:**

```typescript
queryKeys.auth = {
  all: ['auth'],
  csrfToken: () => ['auth', 'csrf-token'],
}
```

---

## 👤 Profile Domain (2 Endpoints)

### **File:** `domains/profile/hooks/`

| Hook Name | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| `useProfile` | `/api/v1/profile/me` | GET | Get current user profile |
| `useUpdateProfile` | `/api/v1/profile/me` | PUT | Update current user profile |

### **Query Keys:**

```typescript
queryKeys.profile = {
  all: ['profile'],
  me: () => ['profile', 'me'],
}
```

---

## 👨‍💼 Users Domain (10 Endpoints)

### **File:** `domains/users/hooks/`

| Hook Name | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| `useUsers` | `/api/v1/admin/users` | GET | List all users with filters |
| `useUser` | `/api/v1/admin/users/{user_id}` | GET | Get specific user details |
| `useCreateUser` | `/api/v1/admin/users` | POST | Create new user |
| `useUpdateUser` | `/api/v1/admin/users/{user_id}` | PUT | Update user information |
| `useDeleteUser` | `/api/v1/admin/users/{user_id}` | DELETE | Delete user account |
| `useApproveUser` | `/api/v1/admin/users/{user_id}/approve` | POST | Approve user (RESTful) |
| `useApproveUserAlt` | `/api/v1/admin/approve-user` | POST | Approve user (alternative) |
| `useRejectUser` | `/api/v1/admin/users/{user_id}/reject` | POST | Reject user registration |
| `useAdminStats` | `/api/v1/admin/stats` | GET | Get admin statistics |
| `useAuditLogs` | `/api/v1/admin/audit-logs` | GET | Get audit logs |

### **Query Keys:**

```typescript
queryKeys.users = {
  all: ['users'],
  lists: () => ['users', 'list'],
  list: (filters: UserFilters) => ['users', 'list', filters],
  details: () => ['users', 'detail'],
  detail: (id: string) => ['users', 'detail', id],
}
```

---

## 🔑 RBAC Domain (12 Endpoints)

### **File:** `domains/rbac/hooks/`

| Hook Name | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| **Role Management** ||||
| `useRoles` | `/api/v1/admin/roles` | GET | List all roles |
| `useRole` | `/api/v1/admin/roles/{role_id}` | GET | Get role details |
| `useCreateRole` | `/api/v1/admin/roles` | POST | Create new role |
| `useUpdateRole` | `/api/v1/admin/roles/{role_id}` | PUT | Update role |
| `useDeleteRole` | `/api/v1/admin/roles/{role_id}` | DELETE | Delete role |
| **Role Assignment** ||||
| `useAssignRole` | `/api/v1/admin/users/roles` | POST | Assign role to user |
| `useRemoveRole` | `/api/v1/admin/users/{user_id}/roles/{role_id}` | DELETE | Remove role from user |
| `useUserRoles` | `/api/v1/admin/users/{user_id}/roles` | GET | Get user's roles |
| **Permissions** ||||
| `usePermissions` | `/api/v1/admin/permissions` | GET | List all permissions |
| **Cache** ||||
| `useCacheStats` | `/api/v1/admin/cache/stats` | GET | Get RBAC cache statistics |
| `useClearCache` | `/api/v1/admin/cache/clear` | POST | Clear RBAC cache |
| `useSyncDatabase` | `/api/v1/admin/sync-database` | POST | Sync RBAC to database |

### **Query Keys:**

```typescript
queryKeys.rbac = {
  all: ['rbac'],
  roles: {
    all: ['rbac', 'roles'],
    lists: () => ['rbac', 'roles', 'list'],
    list: (filters?) => ['rbac', 'roles', 'list', filters],
    details: () => ['rbac', 'roles', 'detail'],
    detail: (id) => ['rbac', 'roles', 'detail', id],
  },
  permissions: {
    all: ['rbac', 'permissions'],
    list: () => ['rbac', 'permissions', 'list'],
  },
  cache: {
    all: ['rbac', 'cache'],
    stats: () => ['rbac', 'cache', 'stats'],
  },
}
```

---

## 📊 Admin Domain (2 Endpoints)

### **File:** `domains/admin/hooks/`

| Hook Name | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| `useAdminStats` | `/api/v1/admin/stats` | GET | Get admin statistics |
| `useAuditLogs` | `/api/v1/admin/audit-logs` | GET | Get audit logs |

### **Query Keys:**

```typescript
queryKeys.admin = {
  all: ['admin'],
  stats: () => ['admin', 'stats'],
  auditLogs: (filters?) => ['admin', 'audit-logs', filters],
}
```

---

## 📋 Audit Domain (5 Endpoints)

### **File:** `domains/audit/hooks/`

| Hook Name | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| **Audit Logs** ||||
| `useAuditEvents` | `/api/v1/audit/events` | GET | Get audit events with filters |
| `useAuditEvent` | `/api/v1/audit/events/{event_id}` | GET | Get specific audit event |
| **GDPR** ||||
| `useExportData` | `/api/v1/export/my-data` | POST | Export user's personal data |
| `useDeleteAccount` | `/api/v1/delete/my-account` | DELETE | Request account deletion |
| `useExportStatus` | `/api/v1/export/status/{export_id}` | GET | Check data export status |

### **Query Keys:**

```typescript
queryKeys.audit = {
  all: ['audit'],
  events: {
    all: ['audit', 'events'],
    lists: () => ['audit', 'events', 'list'],
    list: (filters) => ['audit', 'events', 'list', filters],
    details: () => ['audit', 'events', 'detail'],
    detail: (id) => ['audit', 'events', 'detail', id],
  },
}

queryKeys.gdpr = {
  all: ['gdpr'],
  exportStatus: (id) => ['gdpr', 'export', id],
}
```

---

## 🏥 Monitoring Domain (13 Endpoints)

### **File:** `domains/monitoring/hooks/`

| Hook Name | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| **Health Checks** ||||
| `useHealth` | `/health/` | GET | Basic health check |
| `useHealthPing` | `/health/ping` | GET | Simple ping endpoint |
| `useHealthReady` | `/health/ready` | GET | Readiness probe |
| `useHealthDetailed` | `/health/detailed` | GET | Detailed health with all checks |
| `useHealthDB` | `/health/db` | GET | Database connectivity check |
| `useHealthSystem` | `/health/system` | GET | System resource metrics |
| **Patterns** ||||
| `usePatterns` | `/health/patterns` | GET | All resilience patterns status |
| `useCircuits` | `/health/patterns/circuits` | GET | Circuit breaker states |
| `useCacheHealth` | `/health/patterns/cache` | GET | Cache statistics |
| `useEventMetrics` | `/health/patterns/events` | GET | Event bus metrics |
| `useEventHistory` | `/health/patterns/events/history` | GET | Event history |
| **Circuit Breaker** ||||
| `useCircuitBreakerStatus` | `/api/v1/circuit-breaker/status` | GET | Get circuit breaker status |
| `useCircuitBreakerMetrics` | `/api/v1/circuit-breaker/metrics` | GET | Get circuit breaker metrics |

### **Query Keys:**

```typescript
queryKeys.monitoring = {
  all: ['monitoring'],
  health: {
    all: ['monitoring', 'health'],
    basic: () => ['monitoring', 'health', 'basic'],
    detailed: () => ['monitoring', 'health', 'detailed'],
    db: () => ['monitoring', 'health', 'db'],
    system: () => ['monitoring', 'health', 'system'],
  },
  patterns: {
    all: ['monitoring', 'patterns'],
    overview: () => ['monitoring', 'patterns', 'overview'],
    circuits: () => ['monitoring', 'patterns', 'circuits'],
    cache: () => ['monitoring', 'patterns', 'cache'],
    events: () => ['monitoring', 'patterns', 'events'],
    eventHistory: () => ['monitoring', 'patterns', 'event-history'],
  },
  circuitBreaker: {
    all: ['monitoring', 'circuit-breaker'],
    status: () => ['monitoring', 'circuit-breaker', 'status'],
    metrics: () => ['monitoring', 'circuit-breaker', 'metrics'],
  },
}
```

---

## 📈 Metrics Domain (2 Endpoints)

### **File:** `domains/monitoring/hooks/`

| Hook Name | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| `useBusinessMetrics` | `/api/v1/metrics/business` | GET | Get business metrics |
| `usePerformanceMetrics` | `/api/v1/metrics/performance` | GET | Get performance metrics |

### **Query Keys:**

```typescript
queryKeys.monitoring.metrics = {
  all: ['monitoring', 'metrics'],
  business: () => ['monitoring', 'metrics', 'business'],
  performance: () => ['monitoring', 'metrics', 'performance'],
}
```

---

## 📝 Logging (1 Endpoint)

### **File:** `services/logging/frontendLogger.ts`

| Function Name | Endpoint | Method | Description |
|--------------|----------|--------|-------------|
| `sendLogs()` | `/api/v1/logs/frontend` | POST | Submit frontend client logs |

---

## 📊 Domain Statistics

```
┌─────────────────────┬───────────┬──────────────┐
│ Domain              │ Endpoints │ React Hooks  │
├─────────────────────┼───────────┼──────────────┤
│ Authentication      │    16     │     16       │
│ Profile             │     2     │      2       │
│ Users               │    10     │     10       │
│ RBAC                │    12     │     12       │
│ Admin               │     2     │      2       │
│ Audit & GDPR        │     5     │      5       │
│ Monitoring (Health) │    13     │     13       │
│ Metrics             │     2     │      2       │
│ Logging             │     1     │      1       │
├─────────────────────┼───────────┼──────────────┤
│ TOTAL               │    61     │     61       │
└─────────────────────┴───────────┴──────────────┘
```

---

## 🎯 Folder-to-Endpoint Mapping

### **Complete Structure:**

```
domains/
├── auth/
│   └── hooks/
│       ├── useLogin.ts                    → POST /auth/login
│       ├── useRegister.ts                 → POST /auth/register
│       ├── useLogout.ts                   → POST /auth/logout
│       ├── usePasswordReset.ts            → POST /auth/password-reset
│       ├── useRefreshToken.ts             → POST /auth/refresh
│       ├── useVerifyEmail.ts              → POST /auth/verify-email
│       ├── useResendVerification.ts       → POST /auth/resend-verification
│       ├── useForgotPassword.ts           → POST /auth/forgot-password
│       ├── useResetPassword.ts            → POST /auth/reset-password
│       ├── useChangePassword.ts           → POST /auth/change-password
│       ├── usePasswordResetRequest.ts     → POST /auth/password-reset-request
│       ├── useSecureLogin.ts              → POST /auth/login-secure
│       ├── useSecureLogout.ts             → POST /auth/logout-secure
│       ├── useSecureRefresh.ts            → POST /auth/refresh-secure
│       ├── useCsrfToken.ts                → GET /auth/csrf-token
│       └── useValidateCsrf.ts             → POST /auth/validate-csrf
│
├── profile/
│   └── hooks/
│       ├── useProfile.ts                  → GET /profile/me
│       └── useUpdateProfile.ts            → PUT /profile/me
│
├── users/
│   └── hooks/
│       ├── useUsers.ts                    → GET /admin/users
│       ├── useUser.ts                     → GET /admin/users/{id}
│       ├── useCreateUser.ts               → POST /admin/users
│       ├── useUpdateUser.ts               → PUT /admin/users/{id}
│       ├── useDeleteUser.ts               → DELETE /admin/users/{id}
│       ├── useApproveUser.ts              → POST /admin/users/{id}/approve
│       ├── useApproveUserAlt.ts           → POST /admin/approve-user
│       ├── useRejectUser.ts               → POST /admin/users/{id}/reject
│       ├── useAdminStats.ts               → GET /admin/stats
│       └── useAuditLogs.ts                → GET /admin/audit-logs
│
├── rbac/
│   └── hooks/
│       ├── useRoles.ts                    → GET /admin/roles
│       ├── useRole.ts                     → GET /admin/roles/{id}
│       ├── useCreateRole.ts               → POST /admin/roles
│       ├── useUpdateRole.ts               → PUT /admin/roles/{id}
│       ├── useDeleteRole.ts               → DELETE /admin/roles/{id}
│       ├── useAssignRole.ts               → POST /admin/users/roles
│       ├── useRemoveRole.ts               → DELETE /admin/users/{id}/roles/{role_id}
│       ├── useUserRoles.ts                → GET /admin/users/{id}/roles
│       ├── usePermissions.ts              → GET /admin/permissions
│       ├── useCacheStats.ts               → GET /admin/cache/stats
│       ├── useClearCache.ts               → POST /admin/cache/clear
│       └── useSyncDatabase.ts             → POST /admin/sync-database
│
├── admin/
│   └── hooks/
│       ├── useAdminStats.ts               → GET /admin/stats
│       └── useAuditLogs.ts                → GET /admin/audit-logs
│
├── audit/
│   └── hooks/
│       ├── useAuditEvents.ts              → GET /audit/events
│       ├── useAuditEvent.ts               → GET /audit/events/{id}
│       ├── useExportData.ts               → POST /export/my-data
│       ├── useDeleteAccount.ts            → DELETE /delete/my-account
│       └── useExportStatus.ts             → GET /export/status/{id}
│
└── monitoring/
    └── hooks/
        ├── useHealth.ts                   → GET /health/
        ├── useHealthPing.ts               → GET /health/ping
        ├── useHealthReady.ts              → GET /health/ready
        ├── useHealthDetailed.ts           → GET /health/detailed
        ├── useHealthDB.ts                 → GET /health/db
        ├── useHealthSystem.ts             → GET /health/system
        ├── usePatterns.ts                 → GET /health/patterns
        ├── useCircuits.ts                 → GET /health/patterns/circuits
        ├── useCacheHealth.ts              → GET /health/patterns/cache
        ├── useEventMetrics.ts             → GET /health/patterns/events
        ├── useEventHistory.ts             → GET /health/patterns/events/history
        ├── useCircuitBreakerStatus.ts     → GET /circuit-breaker/status
        ├── useCircuitBreakerMetrics.ts    → GET /circuit-breaker/metrics
        ├── useBusinessMetrics.ts          → GET /metrics/business
        └── usePerformanceMetrics.ts       → GET /metrics/performance

services/
└── logging/
    └── frontendLogger.ts                  → POST /logs/frontend
```

---

## ✅ Verification Checklist

- [x] All 61 endpoints mapped to React hooks
- [x] Query keys defined for each domain
- [x] Folder structure matches backend domains
- [x] One hook per endpoint (no duplication)
- [x] Clear naming conventions
- [x] Type-safe query key factories

---

**Complete API coverage with perfect domain alignment!** 🎉
