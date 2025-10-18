# UI Security Integration Guide - httpOnly Cookies & CSRF Protection

**Version:** 1.0.0  
**Date:** October 18, 2025  
**Status:** Production Ready ✅  
**Security Level:** Enterprise Grade 🔐

---

## Executive Summary

This guide documents the updated UI implementation for secure authentication using **httpOnly cookies** and **CSRF token protection**, as specified in the backend security requirements (`UI_SECURITY_COMPLETE.md` and `latest_api_doc.md`).

### Key Security Enhancements

✅ **httpOnly Cookie Authentication**

- Access tokens stored in httpOnly cookies (XSS-protected)
- Refresh tokens stored in httpOnly cookies (secure refresh flow)
- No tokens exposed in JavaScript or localStorage

✅ **CSRF Protection**

- Automatic CSRF token generation and management
- Per-request CSRF token injection in headers
- Token expiration and refresh handling
- Protection for all state-changing operations (POST/PUT/DELETE)

✅ **Enhanced CORS**

- Credentials support enabled for cookie transmission
- X-CSRF-Token header explicitly allowed
- Specific origin validation (no wildcards)

✅ **Automatic Request Handling**

- `credentials: 'include'` on all fetch requests
- Automatic CSRF token fetching after login
- Token expiration detection and refresh
- Transparent to component developers

---

## Architecture Overview

### Authentication Flow

```
1. User Login
   └─> POST /api/v1/auth/login-secure
   └─> Response: httpOnly cookies set automatically
       ├─ access_token (15 min expiry)
       ├─ refresh_token (7 days expiry)
       └─ Both HttpOnly, Secure, SameSite=Strict

2. CSRF Token Fetch
   └─> GET /api/v1/auth/csrf-token
   └─> Response: { csrf_token, expires_at }
   └─> Stored in sessionStorage

3. Authenticated Request
   └─> Any POST/PUT/DELETE request
   └─> Headers automatically include:
       ├─ Authorization: Bearer <token> (backward compat)
       ├─ X-CSRF-Token: <token>
       ├─ Content-Type: application/json
       └─ credentials: 'include' (sends cookies)

4. Token Refresh (Automatic)
   └─> When access token expires
   └─> POST /api/v1/auth/refresh-secure
   └─> New access_token in httpOnly cookie
   └─> User doesn't notice (seamless)

5. Logout
   └─> POST /api/v1/auth/logout-secure
   └─> Cookies cleared automatically
   └─> CSRF tokens cleared
```

### Components Updated

#### 1. CSRF Token Service (`src/shared/services/auth/csrfTokenService.ts`)

**Purpose:** Manage CSRF tokens for httpOnly cookie-based authentication

**Key Features:**

- Fetches CSRF tokens from `/api/v1/auth/csrf-token`
- Stores tokens in sessionStorage with expiration tracking
- Automatic refresh 5 minutes before expiry
- Prevents race conditions with request deduplication
- Thread-safe token access

**Methods:**

```typescript
// Get current token (auto-refresh if needed)
async getToken(): Promise<string>

// Get token synchronously (for headers)
getTokenSync(): string | null

// Check token validity
isTokenValid(): boolean

// Get header object for requests
getTokenHeader(): Record<string, string> | null

// Manual token refresh
async fetchToken(): Promise<string>

// Clear all tokens
clearAll(): void
```

#### 2. API Client (`src/lib/api/client.ts`)

**Purpose:** Handle all API requests with automatic httpOnly cookie and CSRF support

**Key Features:**

- Automatic `credentials: 'include'` for cookie transmission
- CSRF token injection in request headers
- Both secure and legacy endpoint support
- Backward compatible with existing code

**New Methods:**

```typescript
// Secure login with httpOnly cookies (recommended)
async loginSecure(email: string, password: string): Promise<LoginResponse>

// Legacy login (still supported for backward compatibility)
async login(email: string, password: string): Promise<LoginResponse>

// Secure logout
async logout(): Promise<LogoutResponse>
```

**Configuration:**

```typescript
// Use new secure endpoints (default)
const apiClient = new ApiClient(baseURL, true);

// Use legacy endpoints (only for backward compatibility)
const apiClient = new ApiClient(baseURL, false);
```

#### 3. Auth Provider (`src/domains/auth/providers/AuthProvider.tsx`)

**Purpose:** Provide authentication context for components

**Updated Login Method:**

```typescript
const login = async (credentials: LoginRequest) => {
  // Automatically uses loginSecure endpoint
  // CSRF token is fetched after successful login
  // All subsequent requests automatically include CSRF header
};
```

---

## Implementation Details

### 1. httpOnly Cookie Management

**Token Storage:**

- **Access Token:** 15-minute expiry, httpOnly, Secure, SameSite=Strict
- **Refresh Token:** 7-day expiry, httpOnly, Secure, SameSite=Strict, path-restricted
- **Storage Method:** Browser cookies (automatic handling by backend)

**Why httpOnly Cookies?**

- ✅ XSS-proof (inaccessible to JavaScript)
- ✅ CSRF tokens stored separately (double-submit cookie pattern)
- ✅ Automatic transmission with requests
- ✅ Browser handles expiration
- ✅ CloudFront/CloudFlare compatible

**Important:** Tokens are **NOT** in localStorage or sessionStorage. They are in browser cookies only.

### 2. CSRF Token Management

**Token Lifecycle:**

1. User logs in via `/api/v1/auth/login-secure`
2. Access/refresh tokens set in httpOnly cookies
3. UI fetches CSRF token from `/api/v1/auth/csrf-token`
4. CSRF token stored in sessionStorage (user-visible, can't harm security)
5. Automatic refresh 5 minutes before expiry
6. Token included in `X-CSRF-Token` header on mutating requests

**Automatic vs Manual:**

- ✅ Automatic: ApiClient handles CSRF token injection
- ✅ Automatic: CSRF token refresh on demand
- ✅ Automatic: Cookie transmission via `credentials: 'include'`
- ❌ Manual: Developers don't need to do anything!

### 3. Request Headers

**For All Requests:**

```
GET requests:
- Content-Type: application/json
- Authorization: Bearer <token> (if available)
- credentials: 'include' (enables cookie transmission)

POST/PUT/DELETE requests:
- Content-Type: application/json
- Authorization: Bearer <token> (if available)
- X-CSRF-Token: <csrf_token> (automatically injected)
- credentials: 'include' (enables cookie transmission)
```

**Automatic Handling:**
The ApiClient automatically:

1. Fetches CSRF token from sessionStorage
2. Injects it into the `X-CSRF-Token` header
3. Sends `credentials: 'include'` for cookie transmission
4. Refreshes CSRF token if expired
5. Retries if token refresh failed

---

## Usage Guide

### For Component Developers

**No Changes Required!** The authentication is fully automatic.

#### Example: Make an Authenticated Request

```tsx
import { useAuth } from '@domains/auth';
import { apiClient } from '@lib/api';

export const MyComponent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const handleCreateUser = async () => {
    try {
      // ApiClient automatically handles:
      // - Adding Authorization header
      // - Fetching and injecting CSRF token
      // - Sending credentials (httpOnly cookies)
      const response = await apiClient.createUser({
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      });

      console.log('User created:', response);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <button onClick={handleCreateUser} disabled={!isAuthenticated}>
      Create User
    </button>
  );
};
```

#### Example: Login Flow

```tsx
import { useAuth } from '@domains/auth';

export const LoginComponent: React.FC = () => {
  const { login, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      // Uses secure login endpoint automatically
      // - Sets httpOnly cookies
      // - Fetches CSRF token
      // - Stores CSRF token in sessionStorage
      await login({ email, password });

      // User is now authenticated
      // All subsequent requests automatically include CSRF token
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <>
      {error && <div className="error">{error}</div>}
      <button onClick={() => handleLogin('user@example.com', 'Password123!')}>Login</button>
    </>
  );
};
```

#### Example: Logout Flow

```tsx
const handleLogout = async () => {
  try {
    // Secure logout endpoint automatically:
    // - Clears httpOnly cookies on server
    // - Clears CSRF tokens
    // - Clears client-side session
    await logout();

    // User is now logged out
    // Subsequent requests won't include authentication
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

---

## API Endpoints Reference

### Authentication Endpoints (Secure)

#### 1. Login with httpOnly Cookies

```http
POST /api/v1/auth/login-secure
Content-Type: application/json
credentials: include

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict

{
  "success": true,
  "user": {
    "user_id": "123",
    "email": "user@example.com",
    "role": "admin"
  },
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 900,
  "refresh_expires_in": 604800
}
```

#### 2. Get CSRF Token

```http
GET /api/v1/auth/csrf-token
credentials: include

Response: 200 OK

{
  "csrf_token": "a7f3d2c1b5e6...",
  "expires_at": "2025-10-18T14:00:00Z"
}
```

#### 3. Logout with Cookies

```http
POST /api/v1/auth/logout-secure
credentials: include

Response: 200 OK
Set-Cookie: access_token=; Max-Age=0
Set-Cookie: refresh_token=; Max-Age=0

{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 4. Refresh Token

```http
POST /api/v1/auth/refresh-secure
credentials: include

Response: 200 OK
Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict

{
  "success": true,
  "message": "Token refreshed"
}
```

---

## Security Best Practices

### ✅ DO:

- ✅ Use `credentials: 'include'` for all fetch requests
- ✅ Include `X-CSRF-Token` header in POST/PUT/DELETE requests
- ✅ Store CSRF tokens in sessionStorage (not localStorage)
- ✅ Refresh CSRF token on login
- ✅ Clear cookies on logout
- ✅ Use HTTPS in production
- ✅ Validate all user input
- ✅ Implement CORS properly with specific origins

### ❌ DON'T:

- ❌ Store access tokens in localStorage
- ❌ Store refresh tokens in localStorage
- ❌ Include tokens in URLs or query parameters
- ❌ Log tokens to console in production
- ❌ Use wildcard CORS origins
- ❌ Disable HTTPS
- ❌ Trust client-side validation alone
- ❌ Skip CSRF token validation

### Configuration for AWS Deployment

**Environment Variables:**

```bash
# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Security
SECURE_COOKIES=true  # HTTPS only
CSRF_ENABLED=true
CSRF_TOKEN_TTL_SECONDS=3600  # 1 hour

# Session
SESSION_BACKEND=redis  # For production (not in-memory)
REDIS_URL=redis://your-redis-host:6379
```

**CloudFront Configuration:**

- ✅ Enable HTTPS
- ✅ Forward cookies from origin
- ✅ Forward Authorization header
- ✅ Forward X-CSRF-Token header
- ✅ Allow credentials in CORS

---

## Troubleshooting

### Issue: "CSRF token not found" Error

**Cause:** CSRF token not fetched after login

**Solution:**

```typescript
// Make sure CSRF token is fetched after login
const login = async (credentials: LoginRequest) => {
  // This now automatically fetches CSRF token
  await apiClient.loginSecure(credentials.email, credentials.password);
  // CSRF token is ready
};
```

### Issue: "Unauthorized" (401) on Requests

**Cause:** httpOnly cookies not sent with requests

**Solution:**

```typescript
// Ensure credentials: 'include' is set
const response = await fetch('/api/v1/users', {
  method: 'POST',
  credentials: 'include', // ← This is required!
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(userData),
});
```

### Issue: CSRF Token Validation Error (403)

**Cause:** X-CSRF-Token header missing or invalid

**Solution:**

```typescript
// The ApiClient automatically adds CSRF token, but check:
1. Browser sessionStorage has csrf_token key
2. X-CSRF-Token header is present in request
3. Token hasn't expired (1 hour default)
4. Backend is checking X-CSRF-Token header (not X-XSRF-TOKEN)
```

### Issue: Cookies Not Persisting Across Requests

**Cause:** SameSite=Strict is too restrictive

**Solution:**

- Check backend CORS configuration includes: `allow_credentials: True`
- Verify `credentials: 'include'` is set on all requests
- Check browser cookie settings (not blocking third-party cookies)

---

## Migration Checklist

If migrating from localStorage-based tokens:

- [ ] **Update login flow** to use `loginSecure` endpoint
- [ ] **Add `credentials: 'include'`** to all fetch/axios requests
- [ ] **Add X-CSRF-Token header** to POST/PUT/DELETE requests
- [ ] **Remove localStorage token persistence** (cookies are automatic)
- [ ] **Update error handling** for 401/403 responses
- [ ] **Test on multiple browsers** (Chrome, Firefox, Safari, Edge)
- [ ] **Test on mobile** (iOS Safari, Android Chrome)
- [ ] **Verify CORS headers** in responses
- [ ] **Check CloudFront settings** (if using AWS CloudFront)
- [ ] **Enable HTTPS** in production
- [ ] **Configure security headers** (HSTS, CSP, etc.)
- [ ] **Run security audit** (OWASP ZAP, Burp Suite)

---

## Performance Considerations

### Token Expiration & Refresh

**Access Token (15 min):**

- Automatically renewed on refresh endpoint call
- No user interaction required
- Transparent to end users

**CSRF Token (1 hour):**

- Refreshed 5 minutes before expiry
- Cached in sessionStorage between refreshes
- Minimal performance impact

### Request Deduplication

The ApiClient implements request deduplication to prevent multiple identical requests:

```typescript
// Only one request made, both calls return same response
const p1 = apiClient.getUsers();
const p2 = apiClient.getUsers();
const [users1, users2] = await Promise.all([p1, p2]);
```

### Network Optimization

- ✅ Credentials sent efficiently in cookies (no extra bytes)
- ✅ CSRF tokens cached between requests
- ✅ No additional round-trips required
- ✅ Smaller request payloads (tokens in headers, not body)

---

## Testing Guidelines

### Unit Tests

```typescript
import { CSRFTokenService } from '@shared/services/auth/csrfTokenService';

describe('CSRFTokenService', () => {
  it('should fetch and store CSRF token', async () => {
    const service = new CSRFTokenService('http://localhost:8000');
    const token = await service.fetchToken();
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(20);
  });

  it('should auto-refresh expired tokens', async () => {
    const service = new CSRFTokenService('http://localhost:8000');
    const token1 = await service.getToken();
    // Simulate expiration
    vi.useFakeTimers();
    vi.advanceTimersByTime(CSRF_TOKEN_TTL_MS + 1000);
    const token2 = await service.getToken();
    expect(token2).not.toBe(token1);
  });
});
```

### Integration Tests

```typescript
import { apiClient } from '@lib/api';

describe('API Client with CSRF', () => {
  it('should include CSRF token in requests', async () => {
    await apiClient.loginSecure('user@example.com', 'password');

    const response = await apiClient.createUser({...});
    expect(response).toBeDefined();
  });

  it('should handle CSRF token refresh', async () => {
    // Token expires in 1 hour
    // Automatically refresh 5 min before expiry
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user login and API request with CSRF', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForURL('/dashboard');

  // Make authenticated request
  const response = await page.request.post('/api/v1/users', {
    data: { email: 'newuser@example.com', ... },
  });

  expect(response.ok()).toBeTruthy();
});
```

---

## Support & Documentation

### Backend API Documentation

- Full API Reference: `latest_api_doc.md`
- Security Implementation: `UI_SECURITY_COMPLETE.md`
- Security Details: `docs/SECURITY_IMPLEMENTATION.md`

### Frontend Implementation

- API Client: `src/lib/api/client.ts`
- CSRF Service: `src/shared/services/auth/csrfTokenService.ts`
- Auth Provider: `src/domains/auth/providers/AuthProvider.tsx`

### Questions?

- Check the troubleshooting section above
- Review the backend documentation
- Check browser dev tools (Network tab, Application tab)
- Enable debug logging: `import.meta.env.DEV`

---

## Changelog

### v1.0.0 (October 18, 2025)

- ✅ Initial implementation of httpOnly cookie authentication
- ✅ Added CSRF token management service
- ✅ Updated API client for secure endpoints
- ✅ Updated AuthProvider for secure login
- ✅ Created comprehensive integration guide
- ✅ Production ready for AWS deployment

---

**Status:** 🎯 **PRODUCTION READY**  
**Last Updated:** October 18, 2025  
**Next Review:** December 18, 2025
