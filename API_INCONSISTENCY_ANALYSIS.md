# API 401 Error - Inconsistency Analysis

## 🔍 Problem Identified

**Issue**: Role API returns 401 error, but User API works fine

**Root Cause**: Inconsistent API prefix usage between services

---

## 📊 Comparison Analysis

### ✅ User Service (WORKS)

**File**: `src/domains/admin/services/adminService.ts`

```typescript
const API_PREFIX = API_PREFIXES.ADMIN; // '/api/v1/admin'

export const listUsers = async (filters?: ListUsersFilters) => {
  const url = `${API_PREFIX}/users`; // → '/api/v1/admin/users'
  const response = await apiClient.get<ListUsersResponse>(url);
  return response.data;
};
```

**Actual Endpoint**: `/api/v1/admin/users` ✅

---

### ❌ Role Service (FAILS with 401)

**File**: `src/domains/admin/services/adminRoleService.ts`

```typescript
const API_PREFIX = API_PREFIXES.ADMIN_RBAC; // '/api/v1/admin/rbac'

export const listRoles = async (params?: ListRolesParams) => {
  const url = `${API_PREFIX}/roles`; // → '/api/v1/admin/rbac/roles'
  const response = await apiClient.get<ListRolesResponse>(url);
  return response.data;
};
```

**Actual Endpoint**: `/api/v1/admin/rbac/roles` ❌ (401 Unauthorized)

---

## 🚨 Root Causes

### 1. **Endpoint Path Inconsistency**

The role service uses `ADMIN_RBAC` prefix, which creates a different endpoint structure:

| Service | API Prefix | Full URL | Status |
|---------|-----------|----------|--------|
| Users | `ADMIN` (`/api/v1/admin`) | `/api/v1/admin/users` | ✅ Works |
| Roles | `ADMIN_RBAC` (`/api/v1/admin/rbac`) | `/api/v1/admin/rbac/roles` | ❌ 401 |

### 2. **Backend Permission Configuration**

The backend likely has different permission requirements for different endpoint paths:

```
/api/v1/admin/users     → Requires: admin:users:read
/api/v1/admin/rbac/roles → Requires: admin:rbac:read (MORE RESTRICTIVE)
```

### 3. **Token May Not Include RBAC Permissions**

The access token might have `admin:users:*` permissions but not `admin:rbac:*` permissions.

---

## 🔧 Potential Issues

### Issue #1: Backend Route Configuration

**Backend might have**:
```python
# More permissive
@router.get("/admin/users")
@require_permission("admin:users:read")
async def list_users():
    ...

# More restrictive
@router.get("/admin/rbac/roles")
@require_permission("admin:rbac:read")  # Stricter permission
async def list_roles():
    ...
```

### Issue #2: User Lacks RBAC Permissions

The logged-in user might have:
- ✅ `admin:users:read` permission
- ❌ Missing `admin:rbac:read` permission

### Issue #3: Token Not Refreshing Properly

The token might:
- ✅ Work for `/admin/users` (cached permission)
- ❌ Fail for `/admin/rbac/roles` (permission check happens fresh)

---

## 🔍 Investigation Steps

### Step 1: Check Token Contents

```typescript
// In browser console
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token permissions:', payload.permissions);
console.log('Token roles:', payload.roles);
```

**Expected Output**:
```json
{
  "permissions": [
    "admin:users:read",
    "admin:users:write",
    // Should also include:
    "admin:rbac:read",  // ← CHECK IF THIS EXISTS
    "admin:rbac:write"
  ]
}
```

### Step 2: Check Backend Logs

Look for permission check failures:
```
[ERROR] Permission denied: admin:rbac:read
[ERROR] User lacks required permission: admin:rbac:read
```

### Step 3: Compare API Calls

**Working User API**:
```http
GET /api/v1/admin/users HTTP/1.1
Authorization: Bearer eyJhbGc...
X-Requested-With: XMLHttpRequest

→ Response: 200 OK
```

**Failing Role API**:
```http
GET /api/v1/admin/rbac/roles HTTP/1.1
Authorization: Bearer eyJhbGc...
X-Requested-With: XMLHttpRequest

→ Response: 401 Unauthorized
{
  "success": false,
  "error": "Insufficient permissions"
}
```

---

## ✅ Solutions

### Solution 1: Check Backend Permission Requirements

**File**: `user_mn/src/app/api/v1/admin/rbac.py` (backend)

```python
# Verify permission requirements
@router.get("/rbac/roles")
@require_permission("admin:rbac:read")  # ← This might be too restrictive
async def list_roles():
    ...

# Option A: Use same permission as users endpoint
@router.get("/rbac/roles")
@require_permission("admin:users:read")  # ← Less restrictive
async def list_roles():
    ...

# Option B: Grant user the admin:rbac:read permission
# (in backend user management)
```

### Solution 2: Grant RBAC Permissions to User

**Backend**: Ensure admin users have RBAC permissions

```python
# In backend permission seeding/migration
admin_role.permissions = [
    "admin:users:read",
    "admin:users:write",
    "admin:rbac:read",   # ← ADD THIS
    "admin:rbac:write",  # ← ADD THIS
]
```

### Solution 3: Use Consistent API Prefix (Frontend)

If backend expects `/api/v1/admin/roles` instead of `/api/v1/admin/rbac/roles`:

**File**: `src/domains/admin/services/adminRoleService.ts`

```typescript
// BEFORE (causes 401)
const API_PREFIX = API_PREFIXES.ADMIN_RBAC; // '/api/v1/admin/rbac'

// AFTER (might fix 401)
const API_PREFIX = API_PREFIXES.ADMIN; // '/api/v1/admin'

export const listRoles = async (params?: ListRolesParams) => {
  const url = `${API_PREFIX}/roles`; // → '/api/v1/admin/roles'
  // ...
};
```

### Solution 4: Token Refresh Issue

If token is stale, force refresh:

```typescript
// In apiClient.ts response interceptor
if (error.response?.status === 401) {
  // Force token refresh
  await tokenService.refreshAccessToken();
  // Retry original request
  return apiClient.request(originalRequest);
}
```

---

## 🎯 Recommended Fix

### **RECOMMENDED: Verify Backend Endpoint Path**

1. **Check backend route registration**:
   ```python
   # What is the actual endpoint?
   # Option A: /api/v1/admin/roles
   # Option B: /api/v1/admin/rbac/roles
   ```

2. **If backend uses** `/api/v1/admin/roles`:
   ```typescript
   // Fix: Use ADMIN prefix instead of ADMIN_RBAC
   const API_PREFIX = API_PREFIXES.ADMIN;
   const url = `${API_PREFIX}/roles`; // → '/api/v1/admin/roles'
   ```

3. **If backend uses** `/api/v1/admin/rbac/roles`:
   ```python
   # Backend fix: Grant admin:rbac:read permission to admin role
   admin_role.permissions.append("admin:rbac:read")
   ```

---

## 🧪 Testing Steps

### Step 1: Test User API (Working)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/admin/users
# Should return: 200 OK
```

### Step 2: Test Role API (Failing)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/admin/rbac/roles
# Currently returns: 401 Unauthorized
```

### Step 3: Test Alternative Endpoint
```bash
# Try without /rbac/ in path
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/admin/roles
# Check if this works
```

### Step 4: Check Backend Routes
```bash
# In backend directory
cd d:\code\python\user_mn
grep -r "admin/rbac/roles" src/app/api/
grep -r "admin/roles" src/app/api/
```

---

## 📝 Action Items

### Immediate (Do Now)

1. ✅ **Check backend endpoint path**
   - Look at `user_mn/src/app/api/v1/admin/rbac.py`
   - Verify actual route: `/admin/rbac/roles` or `/admin/roles`?

2. ✅ **Check user permissions**
   - Decode JWT token
   - Verify `admin:rbac:read` permission exists

3. ✅ **Test both endpoints**
   - `/api/v1/admin/users` (works)
   - `/api/v1/admin/rbac/roles` (fails)
   - `/api/v1/admin/roles` (test this)

### Short Term (If Backend Issue)

1. **Backend fix**: Grant RBAC permissions to admin role
2. **Backend fix**: Use consistent permission scheme
3. **Re-login**: Get fresh token with new permissions

### Short Term (If Frontend Issue)

1. **Frontend fix**: Use correct API prefix
2. **Frontend fix**: Update `API_PREFIXES.ADMIN_RBAC` value
3. **Test**: Verify 401 is resolved

---

## 📊 Expected Outcome

After fix:

| Service | API Prefix | Full URL | Status |
|---------|-----------|----------|--------|
| Users | `ADMIN` | `/api/v1/admin/users` | ✅ 200 OK |
| Roles | `ADMIN` or `ADMIN_RBAC` | Matching backend route | ✅ 200 OK |

---

## 🔗 Related Files

**Frontend**:
- `src/services/api/common.ts` - API prefix definitions
- `src/domains/admin/services/adminRoleService.ts` - Role service
- `src/domains/admin/services/adminService.ts` - User service (working reference)
- `src/services/api/apiClient.ts` - Token injection

**Backend** (check these):
- `user_mn/src/app/api/v1/admin/rbac.py` - RBAC routes
- `user_mn/src/app/api/v1/admin/users.py` - User routes (working reference)
- `user_mn/src/app/core/auth/permissions.py` - Permission definitions

---

**Last Updated**: 2025-01-10  
**Status**: ⚠️ INVESTIGATION REQUIRED  
**Priority**: 🔴 HIGH (Blocking role management features)
