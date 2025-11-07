# Enhanced Debug Logging for Roles Page Auth Issue

## Changes Made

### 1. Enhanced apiClient Request Interceptor
**File:** `src/services/api/apiClient.ts`

Added more detailed logging:
```typescript
console.log('[apiClient] Request interceptor:', {
  url: config.url,
  method: config.method,
  hasToken: !!accessToken,
  tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'none',
  headers: config.headers ? Object.keys(config.headers) : [],  // NEW
});

// NEW: Log when Authorization header is set
if (accessToken) {
  config.headers.Authorization = `Bearer ${accessToken}`;
  console.log('[apiClient] ✅ Authorization header SET for:', config.url);
} else {
  console.warn('[apiClient] ❌ No access token found for request:', config.url);
}
```

### 2. Added Debug Logging to adminRoleService
**File:** `src/domains/admin/services/adminRoleService.ts`

Added logging before and after the API call:
```typescript
export const listRoles = async (params?: ListRolesParams): Promise<ListRolesResponse> => {
  // ... query params setup ...
  
  console.log('[adminRoleService.listRoles] About to call apiClient.get:', url);
  
  const response = await apiClient.get<ListRolesResponse>(url);
  
  console.log('[adminRoleService.listRoles] Response received:', {
    status: response.status,
    hasData: !!response.data,
    dataKeys: response.data ? Object.keys(response.data) : [],
  });
  
  return response.data;
};
```

## Testing Instructions

### Step 1: Open Browser DevTools
1. Navigate to http://localhost:5174
2. Open DevTools (F12)
3. Go to Console tab
4. Clear console

### Step 2: Login as Admin
1. Login with admin credentials
2. Watch console for auth-related logs

### Step 3: Navigate to Roles Page
1. Click Admin menu
2. Click Roles submenu
3. **WATCH CONSOLE CAREFULLY**

### Expected Console Output (SUCCESS)

```
[adminRoleService.listRoles] About to call apiClient.get: /api/v1/admin/rbac/roles?include_permissions=true&include_users_count=true

[apiClient] Request interceptor: {
  url: '/api/v1/admin/rbac/roles?include_permissions=true&include_users_count=true',
  method: 'get',
  hasToken: true,
  tokenPreview: 'eyJhbGciOiJIUzI1Ni...',
  headers: ['Content-Type', 'Accept', ...] 
}

[apiClient] ✅ Authorization header SET for: /api/v1/admin/rbac/roles?include_permissions=true&include_users_count=true

[adminRoleService.listRoles] Response received: {
  status: 200,
  hasData: true,
  dataKeys: ['roles', 'total_roles']
}
```

### Expected Console Output (FAILURE)

```
[adminRoleService.listRoles] About to call apiClient.get: /api/v1/admin/rbac/roles?include_permissions=true&include_users_count=true

[apiClient] Request interceptor: {
  url: '/api/v1/admin/rbac/roles?include_permissions=true&include_users_count=true',
  method: 'get',
  hasToken: false,  // ❌ PROBLEM!
  tokenPreview: 'none',
  headers: ['Content-Type', 'Accept']
}

[apiClient] ❌ No access token found for request: /api/v1/admin/rbac/roles?include_permissions=true&include_users_count=true

[ERROR] ... 401 Unauthorized ...
```

## Diagnostic Checklist

Based on console output, diagnose the issue:

### If `hasToken: false`
**Problem:** Token not in localStorage

**Check:**
1. Open DevTools → Application → Local Storage
2. Look for key: `access_token`
3. If missing: Auth context not initialized properly
4. If present: tokenService.getAccessToken() has a bug

**Fix:**
- Check AuthContext initialization
- Check ProtectedRoute wrapper
- Verify tokenService.getAccessToken() implementation

### If `hasToken: true` but still 401
**Problem:** Token is present but not being sent to backend

**Check:**
1. Look for `✅ Authorization header SET` log
2. If missing: Headers not being set properly
3. Check Network tab → Headers → Request Headers
4. Verify `Authorization: Bearer ...` is present

**Fix:**
- Check if axios interceptor is being bypassed
- Check if another interceptor is removing the header
- Verify config.headers is writable

### If Authorization header present but still 401
**Problem:** Backend not receiving or recognizing token

**Check:**
1. Backend logs for token validation errors
2. Token format (should be `Bearer <token>`)
3. Token expiration
4. CORS issues

**Fix:**
- Refresh token
- Re-login
- Check backend authentication middleware

## Dev Server Status

✅ Running on: **http://localhost:5174**  
✅ Build successful  
✅ Enhanced debug logging active  

## Next Steps

1. Navigate to Roles page
2. Copy console output
3. Analyze based on diagnostic checklist above
4. Report findings with console logs

## Comparison Test

To verify the issue is specific to Roles:

1. **Users Page** (http://localhost:5174/admin/users)
   - Check console logs
   - Should show `hasToken: true` and work

2. **Audit Logs Page** (http://localhost:5174/admin/audit-logs)
   - Check console logs
   - Should show `hasToken: true` and work

3. **Roles Page** (http://localhost:5174/admin/roles)
   - Check console logs
   - Compare with Users/Audit logs output
   - Identify differences
