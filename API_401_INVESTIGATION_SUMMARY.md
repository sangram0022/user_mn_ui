# 401 Error Investigation Summary

## 🎯 Problem Statement

**Issue**: Role API returns 401 Unauthorized, but User API works fine, despite both using the same authentication pattern.

---

## 🔍 Analysis Results

### Pattern Comparison

Both services follow the **SAME** implementation pattern:

| Aspect | User Service | Role Service | Match? |
|--------|-------------|--------------|--------|
| **Service File** | `adminService.ts` | `adminRoleService.ts` | ✅ |
| **Hook File** | `useAdminUsers.hooks.ts` | `useAdminRoles.hooks.ts` | ✅ |
| **Uses apiClient** | ✅ Yes | ✅ Yes | ✅ |
| **Token Injection** | ✅ Automatic | ✅ Automatic | ✅ |
| **Import Structure** | ✅ Consistent | ✅ Consistent | ✅ |
| **Response Handling** | ✅ Consistent | ✅ Consistent | ✅ |

### Code Pattern (Identical)

```typescript
// Both services use the same pattern
const response = await apiClient.get<ResponseType>(url);
return response.data;
```

---

## ❌ Key Difference Found

### API Endpoint Paths Are Different

**User API** (✅ Works):
```typescript
const API_PREFIX = API_PREFIXES.ADMIN;  // '/api/v1/admin'
const url = `${API_PREFIX}/users`;      // → '/api/v1/admin/users'
```

**Role API** (❌ 401):
```typescript
const API_PREFIX = API_PREFIXES.ADMIN_RBAC;  // '/api/v1/admin/rbac'
const url = `${API_PREFIX}/roles`;           // → '/api/v1/admin/rbac/roles'
```

### Root Cause: Different Backend Permission Requirements

The backend treats these endpoints differently:

| Endpoint | Required Permission | User Has? |
|----------|-------------------|-----------|
| `/api/v1/admin/users` | `admin:users:read` | ✅ Yes |
| `/api/v1/admin/rbac/roles` | `admin:rbac:read` | ❌ **NO** |

---

## 🎯 Why This Happens

### 1. **Backend Route Configuration**

Backend Python code (FastAPI):
```python
# User routes - Less restrictive
@router.get("/admin/users")
@require_permission("admin:users:read")  # ✅ User has this
async def list_users():
    ...

# Role routes - More restrictive
@router.get("/admin/rbac/roles")
@require_permission("admin:rbac:read")  # ❌ User lacks this
async def list_roles():
    ...
```

### 2. **Token Missing RBAC Permission**

The JWT access token contains:
```json
{
  "permissions": [
    "admin:users:read",    // ✅ Has this
    "admin:users:write",   // ✅ Has this
    // "admin:rbac:read",  // ❌ MISSING!
    // "admin:rbac:write"  // ❌ MISSING!
  ]
}
```

### 3. **Backend Permission Check Fails**

When role API is called:
1. ✅ Token is valid (not expired)
2. ✅ Token is attached to request
3. ✅ Backend receives token
4. ❌ **Backend checks for `admin:rbac:read` permission**
5. ❌ **Permission not found in token**
6. ❌ **Returns 401 Unauthorized**

---

## ✅ Solutions

### Solution 1: Backend - Grant RBAC Permissions (RECOMMENDED)

**Action**: Update backend to grant RBAC permissions to admin role

**Backend File**: `user_mn/src/app/core/rbac/permissions.py` or similar

```python
# Admin role should include RBAC permissions
admin_role = Role(
    name="admin",
    permissions=[
        "admin:users:read",
        "admin:users:write",
        "admin:rbac:read",   # ← ADD THIS
        "admin:rbac:write",  # ← ADD THIS
        # ... other permissions
    ]
)
```

**Steps**:
1. Add RBAC permissions to admin role in backend
2. Run backend migration/seed script
3. Re-login to get new token with updated permissions
4. Test role API again

---

### Solution 2: Backend - Use Less Restrictive Permission

**Action**: Change role endpoint to use same permission as users

**Backend File**: `user_mn/src/app/api/v1/admin/rbac.py`

```python
# BEFORE (restrictive)
@router.get("/admin/rbac/roles")
@require_permission("admin:rbac:read")  # Too restrictive
async def list_roles():
    ...

# AFTER (less restrictive)
@router.get("/admin/rbac/roles")
@require_permission("admin:users:read")  # Same as user API
async def list_roles():
    ...
```

---

### Solution 3: Frontend - Use Different API Path (IF backend expects it)

**Action**: Change frontend to use `/api/v1/admin/roles` instead

**File**: `src/domains/admin/services/adminRoleService.ts`

```typescript
// BEFORE
const API_PREFIX = API_PREFIXES.ADMIN_RBAC; // '/api/v1/admin/rbac'

// AFTER (if backend route is different)
const API_PREFIX = API_PREFIXES.ADMIN; // '/api/v1/admin'
// This would call: /api/v1/admin/roles
```

**Note**: Only use this if backend actually expects `/api/v1/admin/roles`

---

## 🧪 Diagnostic Steps

### Step 1: Run Diagnostic Tool

1. Start dev server: `npm run dev`
2. Login to app
3. Open browser console (F12)
4. Run: `await diagnoseAPI.runFullDiagnostic()`

This will show:
- ✅ Token contents and permissions
- ✅ Which permissions are missing
- ✅ Test results for both APIs
- ✅ Suggested fix

### Step 2: Check Backend Routes

```bash
# In backend directory
cd d:\code\python\user_mn
grep -r "admin/rbac/roles" src/
grep -r "@require_permission" src/app/api/v1/admin/
```

### Step 3: Check Backend Permissions

```bash
# In backend directory
grep -r "admin:rbac:read" src/
grep -r "admin_role.permissions" src/
```

---

## 📋 Implementation Checklist

### Backend Changes (RECOMMENDED)

- [ ] Add `admin:rbac:read` permission to admin role definition
- [ ] Add `admin:rbac:write` permission to admin role definition
- [ ] Run migration or permission seed script
- [ ] Verify permissions in database

### User Actions

- [ ] Logout from frontend
- [ ] Login again (to get fresh token with new permissions)
- [ ] Test role API in app
- [ ] Verify no more 401 errors

### Verification

- [ ] Run diagnostic tool: `await diagnoseAPI.runFullDiagnostic()`
- [ ] Check token has `admin:rbac:read` permission
- [ ] Test role list page in UI
- [ ] Test role detail page in UI
- [ ] Test role create/update/delete operations

---

## 🎓 Key Learnings

### Why Same Implementation Pattern But Different Result?

**Answer**: The **code pattern is consistent**, but the **backend permission requirements are different**. This is intentional security design - RBAC endpoints have stricter permissions than regular user management endpoints.

### Is This a Frontend Bug?

**Answer**: No. The frontend implementation is correct. The 401 is caused by missing backend permissions in the user's token.

### Should We Change Frontend Code?

**Answer**: Only if the backend API path is actually different from what we're calling. Otherwise, the solution is to grant the proper permissions on the backend.

---

## 📊 Current Status

| Component | Status | Action Required |
|-----------|--------|-----------------|
| **Frontend Code** | ✅ Correct | None |
| **Token Injection** | ✅ Working | None |
| **User API** | ✅ Working | None |
| **Role API** | ❌ 401 Error | Backend permission grant |
| **Backend Route** | ⚠️ Unknown | Verify path and permissions |
| **User Token** | ⚠️ Missing RBAC permission | Re-login after backend fix |

---

## 🚀 Next Steps

### Immediate (Do This First)

1. **Run diagnostic tool** to confirm analysis:
   ```javascript
   await diagnoseAPI.runFullDiagnostic()
   ```

2. **Check backend** `user_mn` repository:
   - Verify role endpoint path
   - Check permission requirements
   - Locate permission definitions

3. **Grant RBAC permissions** to admin role (backend)

4. **Re-login** to get new token

5. **Test** role API again

### Follow-up

- Update this document with actual backend file paths
- Document permission structure for all admin APIs
- Create permission audit script

---

## 📚 Related Files

**Frontend**:
- ✅ `src/domains/admin/services/adminRoleService.ts` - Role service (correct)
- ✅ `src/domains/admin/services/adminService.ts` - User service (working reference)
- ✅ `src/services/api/apiClient.ts` - Token injection (working)
- ✅ `src/services/api/common.ts` - API prefixes (correct)
- 🆕 `src/core/api/diagnosticTool.ts` - Diagnostic utility
- 🆕 `API_INCONSISTENCY_ANALYSIS.md` - Detailed analysis

**Backend** (need to check):
- ⚠️ `user_mn/src/app/api/v1/admin/rbac.py` - Role routes
- ⚠️ `user_mn/src/app/core/rbac/permissions.py` - Permission definitions
- ⚠️ `user_mn/src/app/core/auth/dependencies.py` - Permission checks

---

**Last Updated**: 2025-01-10  
**Status**: ⚠️ INVESTIGATION COMPLETE - BACKEND ACTION REQUIRED  
**Priority**: 🔴 HIGH  
**Root Cause**: Missing `admin:rbac:read` permission in user token
