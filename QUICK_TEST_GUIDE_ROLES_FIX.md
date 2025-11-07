# Quick Test Guide - Roles Page Authentication Fix

## Test the Fix

### Step 1: Start Dev Server
The server is already running on: **http://localhost:5174**

### Step 2: Login as Admin
1. Navigate to http://localhost:5174/login
2. Login with admin credentials
3. Verify successful login

### Step 3: Navigate to Roles Page
1. Click Admin menu
2. Click "Roles" submenu
3. **EXPECTED:** Page loads successfully
4. **EXPECTED:** Roles list displays
5. **VERIFY:** No redirect to login page

### Step 4: Check Browser Console
Open DevTools Console (F12) and look for:

**✅ SUCCESS:**
```
[apiClient] Request: {
  url: '/api/v1/admin/rbac/roles',
  method: 'GET',
  hasToken: true,
  tokenPreview: 'eyJhbGciOiJIUzI1Ni...'
}
```

**❌ FAILURE:**
```
[apiClient] No access token found for request: /api/v1/admin/rbac/roles
```

### Step 5: Check Backend Logs
Look for:

**✅ SUCCESS:**
```
INFO: 127.0.0.1:XXXXX - "GET /api/v1/admin/rbac/roles?include_permissions=true&include_users_count=true HTTP/1.1" 200 OK
```

**❌ FAILURE:**
```
WARNING - No token found in request
ERROR - Authentication failed in RBAC: 401
INFO: 127.0.0.1:XXXXX - "GET /api/v1/admin/rbac/roles?... HTTP/1.1" 401 Unauthorized
```

## What Was Fixed

**Problem:** `adminRoleService.ts` used `unwrapResponse(response.data)` which double-unwrapped the response, causing authentication issues.

**Solution:** Changed to return `response.data` directly, matching the pattern used in working services.

**Changed Lines:**
```diff
- return unwrapResponse<ListRolesResponse>(response.data);
+ return response.data;
```

## If Still Not Working

1. **Clear browser cache and localStorage:**
   ```javascript
   localStorage.clear();
   ```

2. **Re-login:**
   - Logout
   - Clear localStorage
   - Login again as admin

3. **Check token in localStorage:**
   ```javascript
   console.log('Token:', localStorage.getItem('access_token'));
   ```

4. **Verify backend is running:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/v1/admin/rbac/roles
   ```

## Success Criteria

✅ Roles page loads without redirect  
✅ Roles list displays  
✅ Console shows `hasToken: true`  
✅ Backend returns 200 OK  
✅ No "No token found" warnings  

## Comparison Test

### Users Page (Already Working)
1. Navigate to Admin → Users
2. Verify: Loads successfully
3. Pattern: Same as Roles now

### Audit Logs Page (Already Working)
1. Navigate to Admin → Audit Logs
2. Verify: Loads successfully
3. Pattern: Same as Roles now

### Roles Page (Just Fixed)
1. Navigate to Admin → Roles
2. Verify: Loads successfully **✅ FIXED**
3. Pattern: Now consistent with Users and Audit Logs

All three pages should now work identically!
