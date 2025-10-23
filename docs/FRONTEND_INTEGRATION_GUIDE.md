# Frontend Integration Guide

## ✅ Backend Status: FULLY OPERATIONAL

**Server:** Running on `http://127.0.0.1:8001`  
**API Prefix:** `/api/v1`  
**Single-Table Design:** ✅ Implemented (all data in `ums` table)  
**Audit Logging:** ✅ Working

---

## 🔐 Authentication Flow

### 1. Login with httpOnly Cookies

**Endpoint:** `POST /api/v1/auth/login-secure`

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "Admin@123456"
}
```

**Response (200 OK):**

```json
{
  "message": "Login successful",
  "user": {
    "user_id": "admin-001",
    "email": "admin@example.com",
    "role": "admin",
    "last_login_at": "2025-10-23T14:08:42.119Z"
  }
}
```

**Important:** The backend automatically sets **httpOnly cookies** in the response headers:

- `access_token` - Used for authentication (expires in 30 minutes)
- `refresh_token` - Used to get new access tokens (expires in 7 days)

### 2. Get CSRF Token (After Login)

**Endpoint:** `GET /api/v1/auth/csrf-token`

**Headers Required:**

```
Cookie: access_token=<token_from_login>
```

**Response (200 OK):**

```json
{
  "csrf_token": "abc123...",
  "expires_at": "2025-10-23T15:08:42Z"
}
```

### 3. Make Authenticated Requests

**Headers Required for ALL authenticated endpoints:**

```
Cookie: access_token=<token>
X-CSRF-Token: <csrf_token_from_step_2>
```

---

## ⚠️ Frontend Issues to Fix

Based on the server logs, here are the issues your frontend needs to fix:

### 1. ❌ Duplicate API Prefix

**Current (Wrong):**

```
GET /api/v1/api/v1/auth/csrf-token
```

**Should Be:**

```
GET /api/v1/auth/csrf-token
```

**Fix:** Remove the duplicate `/api/v1` prefix in your frontend base URL configuration.

### 2. ❌ Missing Cookies in Requests

**Issue:** After successful login, the frontend isn't sending the httpOnly cookies back to the server.

**Logs:**

```
Authentication attempt without credentials
```

**Fix:** Configure your HTTP client to include credentials (cookies):

**Fetch API:**

```javascript
fetch('http://127.0.0.1:8001/api/v1/auth/csrf-token', {
  credentials: 'include', // ← Add this!
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Axios:**

```javascript
axios.get('http://127.0.0.1:8001/api/v1/auth/csrf-token', {
  withCredentials: true, // ← Add this!
});
```

### 3. ❌ Missing CSRF Token Header

**Issue:** POST requests are failing CSRF validation.

**Logs:**

```
CSRF validation failed
```

**Fix:** Include the CSRF token in the request header:

```javascript
// After getting CSRF token from step 2
const csrfToken = 'abc123...'; // From GET /api/v1/auth/csrf-token

fetch('http://127.0.0.1:8001/api/v1/logs/frontend-errors', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken, // ← Add this!
  },
  body: JSON.stringify({
    /* your data */
  }),
});
```

### 4. ❌ Invalid Request Body for Frontend Logs

**Issue:** The frontend error logging endpoint is receiving invalid data.

**Logs:**

```
Pydantic validation error on POST /api/v1/logs/frontend-errors: 1 errors
```

**Fix:** Check the API documentation for the correct request body format.

---

## 📋 Correct Frontend Implementation

Here's a complete example of how your frontend should handle authentication:

```javascript
// 1. Login
async function login(email, password) {
  const response = await fetch('http://127.0.0.1:8001/api/v1/auth/login-secure', {
    method: 'POST',
    credentials: 'include', // Important: Include cookies
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  console.log('Logged in as:', data.user);

  return data.user;
}

// 2. Get CSRF Token
async function getCsrfToken() {
  const response = await fetch('http://127.0.0.1:8001/api/v1/auth/csrf-token', {
    credentials: 'include', // Important: Include cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get CSRF token');
  }

  const data = await response.json();
  return data.csrf_token;
}

// 3. Make authenticated request with CSRF token
async function getUserProfile(csrfToken) {
  const response = await fetch('http://127.0.0.1:8001/api/v1/profile/me', {
    credentials: 'include', // Important: Include cookies
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken, // Important: Include CSRF token
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get profile');
  }

  return response.json();
}

// Complete flow
async function completeAuthFlow() {
  try {
    // Step 1: Login
    const user = await login('admin@example.com', 'Admin@123456');
    console.log('User:', user);

    // Step 2: Get CSRF token
    const csrfToken = await getCsrfToken();
    console.log('CSRF Token:', csrfToken);

    // Step 3: Use authenticated endpoints
    const profile = await getUserProfile(csrfToken);
    console.log('Profile:', profile);
  } catch (error) {
    console.error('Auth flow failed:', error);
  }
}
```

---

## 🔧 Quick Checklist for Frontend Developers

- [ ] Remove duplicate `/api/v1` prefix from base URL
- [ ] Add `credentials: 'include'` (fetch) or `withCredentials: true` (axios) to ALL requests
- [ ] Get CSRF token after successful login
- [ ] Include `X-CSRF-Token` header in all POST/PUT/DELETE/PATCH requests
- [ ] Store CSRF token in memory (not localStorage - it's sensitive)
- [ ] Refresh CSRF token before it expires (check `expires_at` field)

---

## 📚 Available Test Credentials

### Super Admin

- **Email:** `sangram1@gmail.com`
- **Password:** `Sangram@1`
- **Role:** ADMIN (super_admin)

### Regular Admin

- **Email:** `admin@example.com`
- **Password:** `Admin@123456`
- **Role:** ADMIN

### Test Users

- **User 3:** `user3@example.com` / `Password@3` (Role: USER)
- **User 4:** `user4@example.com` / `Password@4` (Role: MANAGER)

---

## 📖 Full API Documentation

See `BACKEND_API_DOCUMENTATION_FOR_UI_TEAM.md` for complete API documentation including:

- All endpoints with request/response schemas
- Validation rules
- Error codes
- Usage examples

---

## ✅ Backend is Ready!

The backend is fully functional and ready for integration. All issues in the logs are frontend-side implementation details that need to be fixed in your JavaScript/TypeScript code.

**Next Steps:**

1. Fix the duplicate API prefix in your frontend configuration
2. Enable credentials/cookies in your HTTP client
3. Implement the CSRF token flow as shown above
4. Test with the provided credentials

Happy coding! 🚀
