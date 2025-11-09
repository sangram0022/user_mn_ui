# Authentication 401 Error - Investigation Guide

## Problem Statement

**Backend Error:**
```
INFO: 127.0.0.1:55227 - "GET /api/v1/admin/users?page=1&page_size=10&sort_by=first_name&sort_order=asc HTTP/1.1" 401 Unauthorized
❌ Not authenticated - returning 401
Context: {"path":"/api/v1/admin/users","method":"GET","required_role":"admin"}
```

**Symptom:** Backend JWT middleware reports "Not authenticated" - no Authorization header in request.

**Impact:** Admin functionality blocked (user management, role management, etc.)

---

## Investigation Findings

### ✅ Code Review - All Correct

1. **Token Storage** (`src/domains/auth/services/tokenService.ts`)
   - `storeTokens()`: Correctly stores access_token, refresh_token, expires_in
   - `getAccessToken()`: Correctly retrieves from localStorage
   - Enhanced debug logging showing token storage/retrieval

2. **API Client** (`src/services/api/apiClient.ts`)
   - Request interceptor: Gets token from `tokenService.getAccessToken()`
   - Correctly sets `Authorization: Bearer <token>` header
   - Enhanced debug logging showing when header is set
   - Response interceptor: Handles 401 with token refresh

3. **Login Flow** (`src/domains/auth/pages/LoginPage.tsx`)
   - Correctly calls `setAuthState()` (AuthContext.login())
   - Properly constructs user object from login response
   - Passes tokens with correct structure:
     ```typescript
     {
       access_token: result.access_token,
       refresh_token: result.refresh_token,
       token_type: result.token_type,
       expires_in: result.expires_in,
     }
     ```

4. **Auth Context** (`src/domains/auth/context/AuthContext.tsx`)
   - `login()` method: Stores tokens via tokenService.storeTokens()
   - Verification logging confirms tokens are stored
   - Auto-validates token on mount with checkAuth()

5. **Routing** (`src/core/routing/config.ts` + `src/App.tsx`)
   - Login route correctly configured with `LazyLoginPage`
   - AuthProvider wraps entire app
   - Routes render correctly

### 🔍 Hypothesis

Since all code is correct, the issue is likely one of these:

**1. Token Not Being Stored After Login**
   - Login API returns token
   - But `setAuthState()` is not being called
   - OR localStorage is being cleared immediately after storage

**2. Token Being Cleared Prematurely**
   - Token stored successfully
   - But something clears localStorage before API request
   - Could be: logout logic, checkAuth clearing invalid token, browser extension

**3. Wrong Login Form Being Used**
   - There are multiple login forms in codebase:
     - `src/domains/auth/pages/LoginPage.tsx` ✅ (calls setAuthState)
     - `src/domains/auth/components/LoginForm.tsx` ❌ (does NOT call setAuthState)
     - `src/domains/auth/components/ModernLoginForm.tsx` (unknown)
   - If wrong form is being used, tokens never get stored

**4. Race Condition**
   - Token stored
   - But admin page loads before storage completes
   - apiClient interceptor runs before token is available

**5. Multiple Auth Contexts**
   - Multiple instances of AuthContext
   - Token stored in one instance, but read from different instance

---

## Diagnostic Tools Added

### 🔧 Auth Debugger (commit 37b595e)

Created `src/domains/auth/utils/authDebugger.ts` with:

**Browser Console Functions:**
```javascript
// Check current auth state
window.authDebug.diagnoseAuthState()
// Returns: {
//   hasAccessToken: boolean,
//   hasRefreshToken: boolean,
//   tokenExpiry: string | null,
//   isExpired: boolean,
//   accessTokenPreview: string | null,
//   storageKeys: string[]
// }

// Check if request will have auth header
window.authDebug.diagnoseRequestAuth('/api/v1/admin/users')
// Returns: {
//   willHaveAuthHeader: boolean,
//   tokenFound: boolean,
//   tokenPreview: string | null,
//   isPublicEndpoint: boolean
// }

// Clear all auth state (with logging)
window.authDebug.clearAuthStateWithLogging()

// Monitor localStorage changes in real-time
window.authDebug.startStorageMonitoring()
// Returns cleanup function
// Logs every localStorage.setItem/removeItem/clear with stack trace
```

**Auto-Monitoring:**
- Storage monitoring starts automatically in development
- Initial auth state diagnosis on app load
- All auth-related logging visible in console

---

## Diagnostic Steps

### Step 1: Check Initial State

1. Open browser DevTools Console
2. Refresh the app
3. Look for these log messages:
   ```
   🔍 Auth State Diagnosis
   👀 Storage monitoring started
   ```
4. Check the diagnosis output:
   ```javascript
   {
     hasAccessToken: false,  // Should be true after login
     hasRefreshToken: false,
     storageKeys: ['access_token', 'refresh_token', ...]  // Should show these keys
   }
   ```

### Step 2: Test Login Flow

1. Go to login page: http://localhost:5173/auth/login
2. Open DevTools Console
3. Enter credentials and click Login
4. Watch for log messages:
   ```
   [tokenService] Storing tokens
   📝 localStorage.setItem called { key: 'access_token', ... }
   [tokenService] Token storage verification { stored: true, matches: true }
   ✓ Tokens stored in localStorage
   ✓ Auth state updated
   ```
5. Immediately run in console:
   ```javascript
   window.authDebug.diagnoseAuthState()
   ```
6. Check if `hasAccessToken: true`

### Step 3: Test API Request

1. After successful login, navigate to admin users page
2. Watch console for:
   ```
   API Request interceptor { hasToken: true, tokenPreview: '...' }
   ✓ Authorization header SET for request
   ```
3. If you see "⚠ No access token found", token was cleared between login and navigation

### Step 4: Check localStorage Directly

1. Open DevTools → Application tab → Local Storage
2. Check for these keys:
   - `access_token`
   - `refresh_token`
   - `token_expires_at`
   - `user`
3. Verify `access_token` value is present (long JWT string)

### Step 5: Check Network Headers

1. Open DevTools → Network tab
2. Navigate to admin page (triggers API call)
3. Find request: `GET /api/v1/admin/users`
4. Click request → Headers tab
5. Check Request Headers section for:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
6. If missing, token was not added by interceptor

### Step 6: Monitor Storage Changes

1. In console, run:
   ```javascript
   window.authDebug.startStorageMonitoring()
   ```
2. Perform login
3. Navigate to admin page
4. Watch for any unexpected `🗑️ localStorage.removeItem` or `🧨 localStorage.clear` calls
5. Stack traces will show where tokens are being cleared

---

## Expected Behavior vs Actual

### ✅ Expected Flow

1. User enters credentials on `/auth/login`
2. LoginPage calls `loginMutation.mutateAsync()`
3. Backend returns: `{ access_token, refresh_token, user_id, email, roles, ... }`
4. LoginPage calls `setAuthState(tokens, user, rememberMe)`
5. AuthContext.login() calls `tokenService.storeTokens()`
6. tokenService stores: `access_token`, `refresh_token`, `token_expires_at`, `user`
7. User navigates to `/admin/users`
8. apiClient interceptor calls `tokenService.getAccessToken()`
9. Interceptor adds `Authorization: Bearer <token>` header
10. Backend receives request with auth header
11. JWT middleware validates token
12. Request succeeds

### ❌ Actual Flow (Suspected)

1. User enters credentials on `/auth/login`
2. LoginPage calls `loginMutation.mutateAsync()`
3. Backend returns: `{ access_token, ... }`
4. **PROBLEM: Something goes wrong here**
   - Option A: `setAuthState()` never called
   - Option B: Tokens stored but immediately cleared
   - Option C: Tokens stored in wrong location
5. User navigates to `/admin/users`
6. apiClient interceptor calls `tokenService.getAccessToken()`
7. Returns `null` (no token found)
8. No Authorization header added
9. Backend receives request WITHOUT auth header
10. JWT middleware returns 401 Unauthorized

---

## Possible Root Causes

### 1. Wrong Login Component in Use

**Check which login component is actually rendering:**

```bash
# Search for active route usage
cd d:\code\reactjs\usermn1
grep -r "LoginForm" src/core/routing/
```

**Files to check:**
- `src/core/routing/config.ts` - Should use `LazyLoginPage` ✅
- `src/domains/auth/components/LoginForm.tsx` - Does NOT call setAuthState ❌
- `src/domains/auth/pages/LoginPage.tsx` - DOES call setAuthState ✅

**Solution:** Ensure routing uses `LoginPage.tsx`, not `LoginForm.tsx`

### 2. Auth Context Not Wrapped Properly

**Check App.tsx structure:**
```tsx
<AuthProvider>  {/* Must wrap all routes */}
  <Routes>
    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/admin/users" element={<UsersPage />} />
  </Routes>
</AuthProvider>
```

**If routes are OUTSIDE AuthProvider, tokens won't be accessible.**

### 3. localStorage Being Cleared

**Check for:**
- Browser extensions (ad blockers, privacy tools)
- Logout logic being called prematurely
- checkAuth() clearing tokens due to validation error
- Multiple AuthProvider instances competing

### 4. CORS or Cookie Issues

**Backend might expect cookies instead of Bearer token:**
- Check backend middleware expects `Authorization` header
- Check if backend expects session cookies
- Verify CORS allows `Authorization` header

### 5. Token Format Mismatch

**Backend expects specific format:**
- Check backend expects: `Authorization: Bearer <token>`
- Verify token is valid JWT format
- Check backend JWT secret matches

---

## Quick Fix Attempts

### Fix 1: Force Token Storage

Add to LoginPage.tsx after line 47:

```typescript
// TEMPORARY: Force storage verification
console.log('🔍 Login result:', result);
console.log('🔍 Calling setAuthState with tokens:', {
  access_token: result.access_token.substring(0, 30) + '...',
  refresh_token: result.refresh_token.substring(0, 30) + '...',
});

setAuthState(...);

// Verify immediately
setTimeout(() => {
  const stored = localStorage.getItem('access_token');
  console.log('🔍 Token stored?', !!stored, stored?.substring(0, 30));
}, 100);
```

### Fix 2: Bypass AuthContext (Temporary Test)

Add to LoginPage.tsx after line 47:

```typescript
// TEMPORARY: Direct storage (bypass AuthContext)
tokenService.storeTokens({
  access_token: result.access_token,
  refresh_token: result.refresh_token,
  token_type: result.token_type,
  expires_in: result.expires_in,
});

console.log('🔍 Direct storage - token:', tokenService.getAccessToken()?.substring(0, 30));
```

This tests if AuthContext.login() is the issue.

### Fix 3: Add Delay Before Navigation

Replace line 68:

```typescript
// OLD: navigate immediately
navigate(redirectPath, { replace: true });

// NEW: Delay to ensure storage completes
setTimeout(() => {
  navigate(redirectPath, { replace: true });
}, 500);
```

This tests if race condition is the issue.

---

## Next Steps

1. **Run diagnostic steps above** to identify exact point of failure
2. **Check browser console** for all log messages during login
3. **Verify localStorage** has tokens after login
4. **Check network headers** for Authorization header
5. **Report findings** with:
   - Console logs from `diagnoseAuthState()`
   - localStorage screenshot
   - Network tab screenshot showing missing Authorization header
   - Any error messages

---

## Backend Verification Needed

### Check Backend JWT Middleware

File: `user_mn/src/app/core/middleware/jwt_permission_middleware.py`

**Verify:**
1. Middleware reads `Authorization` header:
   ```python
   auth_header = request.headers.get("Authorization")
   ```
2. Expects format: `Bearer <token>`
3. Logs when header is missing:
   ```python
   if not auth_header:
       logger.warning("❌ Not authenticated - returning 401")
   ```

**Add debug logging:**
```python
# Log ALL headers
logger.info("🔍 All request headers", extra={
    "headers": dict(request.headers),
    "path": request.url.path,
})
```

This will show if Authorization header is actually missing or just in wrong format.

---

## Success Criteria

Once fixed, you should see:

### ✅ Console Logs
```
[tokenService] Storing tokens { hasAccessToken: true, accessTokenLength: 200+ }
[tokenService] Token storage verification { stored: true, matches: true }
✓ Tokens stored in localStorage
✓ Auth state updated { isAuthenticated: true }
API Request interceptor { hasToken: true, tokenPreview: 'eyJhbGc...' }
✓ Authorization header SET for request
```

### ✅ localStorage
```
access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoi..."
refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoi..."
token_expires_at: "1735401234567"
user: "{\"user_id\":\"...\",\"email\":\"...\",\"roles\":[...]}"
```

### ✅ Network Tab
```
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
```

### ✅ Backend Logs
```
INFO: 127.0.0.1:55227 - "GET /api/v1/admin/users?page=1&page_size=10 HTTP/1.1" 200 OK
✅ User authenticated { user_id: "...", role: "admin" }
```

---

## Related Files

### Frontend (React/TypeScript)
- `src/domains/auth/services/tokenService.ts` - Token storage/retrieval
- `src/services/api/apiClient.ts` - Axios interceptors (adds auth header)
- `src/domains/auth/pages/LoginPage.tsx` - Login form (calls setAuthState)
- `src/domains/auth/context/AuthContext.tsx` - Global auth state management
- `src/domains/auth/utils/authDebugger.ts` - Diagnostic tools (NEW)

### Backend (Python/FastAPI)
- `user_mn/src/app/core/middleware/jwt_permission_middleware.py` - JWT validation
- `user_mn/src/app/api/v1/endpoints/auth.py` - Login endpoint
- `user_mn/src/app/core/validation/patterns.py` - Token validation patterns

---

## Timeline

- **Issue Reported:** User reported 401 on admin endpoints
- **Investigation Started:** Read apiClient.ts, tokenService.ts, LoginPage.tsx
- **Debugger Added:** commit 37b595e - authDebugger.ts with diagnostic tools
- **Status:** Awaiting diagnostic results from user
- **Next:** Fix based on diagnostic findings

