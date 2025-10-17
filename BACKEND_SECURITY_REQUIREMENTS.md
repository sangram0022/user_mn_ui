# Backend Requirements for Frontend Security

## Overview

This document outlines the backend changes required to complete the security hardening of the user management application. The frontend has been prepared to support these features, but they require backend implementation to be fully functional.

---

## 1. httpOnly Cookie Authentication (HIGH PRIORITY)

### Current Issue

- **Severity**: HIGH
- **Problem**: Access tokens currently stored in `localStorage` are vulnerable to XSS attacks
- **Risk**: If an attacker injects malicious JavaScript, they can steal authentication tokens

### Required Backend Changes

#### 1.1 Set Authentication Cookies

**Endpoint**: `POST /api/v1/auth/login`

**Response Changes**:

```json
// ❌ CURRENT (Don't send tokens in response body)
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { ... }
}

// ✅ NEW (Set cookies, return only user data)
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

**Cookie Configuration**:

```http
Set-Cookie: access_token=eyJ...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
Set-Cookie: refresh_token=eyJ...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=604800
```

**Cookie Attributes Explained**:

- `HttpOnly`: Prevents JavaScript access (XSS protection)
- `Secure`: Only sent over HTTPS
- `SameSite=Strict`: Prevents CSRF attacks
- `Path=/`: Cookie available to all routes (access_token)
- `Path=/api/v1/auth/refresh`: Refresh token only available to refresh endpoint
- `Max-Age=900`: 15 minutes for access token
- `Max-Age=604800`: 7 days for refresh token

#### 1.2 Validate Cookies on All Requests

**Middleware Required**:

```python
# Example Python/FastAPI implementation
from fastapi import Request, HTTPException
from jose import jwt, JWTError

async def validate_access_token(request: Request):
    """Validate access token from httpOnly cookie"""
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### 1.3 Token Refresh Endpoint

**Endpoint**: `POST /api/v1/auth/refresh`

**Request**:

```http
POST /api/v1/auth/refresh HTTP/1.1
Cookie: refresh_token=eyJ...
```

**Response**:

```http
HTTP/1.1 200 OK
Set-Cookie: access_token=eyJNEW...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900

{
  "message": "Token refreshed successfully"
}
```

**Behavior**:

- Read `refresh_token` from cookie
- Validate refresh token
- Generate new access token
- Set new `access_token` cookie
- Return success message (no token in body)

#### 1.4 Logout Endpoint

**Endpoint**: `POST /api/v1/auth/logout`

**Response**:

```http
HTTP/1.1 200 OK
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=0

{
  "message": "Logged out successfully"
}
```

**Behavior**:

- Clear both cookies by setting `Max-Age=0`
- Optionally blacklist refresh token in database

### Frontend Changes Required (Already Prepared)

**Authentication Store** (`src/domains/auth/store/authStore.ts`):

```typescript
// Frontend will:
// 1. Remove token from localStorage
// 2. Rely on browser to send cookies automatically
// 3. Handle 401 responses to trigger refresh
```

**API Client** (`src/infrastructure/api/client.ts`):

```typescript
// Frontend will:
// 1. Set credentials: 'include' on all requests
// 2. Remove Authorization header logic
// 3. Let browser handle cookies
```

---

## 2. CSRF Protection (HIGH PRIORITY)

### Current Issue

- **Severity**: HIGH
- **Problem**: No CSRF token validation on state-changing requests
- **Risk**: Attackers can trick users into making unwanted requests

### Required Backend Changes

#### 2.1 CSRF Token Generation Endpoint

**Endpoint**: `GET /api/v1/auth/csrf-token`

**Request**:

```http
GET /api/v1/auth/csrf-token HTTP/1.1
Cookie: session_id=abc123
```

**Response**:

```json
{
  "csrf_token": "a7f3d2c1b5e6...",
  "expires_at": "2025-10-17T13:00:00Z"
}
```

**Implementation Requirements**:

- Generate cryptographically secure random token
- Store token in session or cache (Redis recommended)
- Associate with user session
- Set expiration (15-30 minutes recommended)
- Allow token refresh before expiration

#### 2.2 CSRF Token Validation Middleware

**Validation Logic**:

```python
from fastapi import Request, HTTPException

async def validate_csrf_token(request: Request):
    """Validate CSRF token on mutating requests"""
    # Skip validation for GET, HEAD, OPTIONS
    if request.method in ["GET", "HEAD", "OPTIONS"]:
        return

    # Get token from header
    token_from_header = request.headers.get("X-CSRF-Token")

    if not token_from_header:
        raise HTTPException(status_code=403, detail="CSRF token missing")

    # Get token from session/cache
    session_id = request.cookies.get("session_id")
    stored_token = await get_csrf_token_from_session(session_id)

    if not stored_token:
        raise HTTPException(status_code=403, detail="CSRF token expired")

    # Compare tokens (constant-time comparison)
    if not secrets.compare_digest(token_from_header, stored_token):
        raise HTTPException(status_code=403, detail="CSRF token invalid")
```

**Apply to Routes**:

```python
from fastapi import Depends

@app.post("/api/v1/users", dependencies=[Depends(validate_csrf_token)])
async def create_user(user: UserCreate):
    # ... create user logic

@app.put("/api/v1/users/{user_id}", dependencies=[Depends(validate_csrf_token)])
async def update_user(user_id: str, user: UserUpdate):
    # ... update user logic

@app.delete("/api/v1/users/{user_id}", dependencies=[Depends(validate_csrf_token)])
async def delete_user(user_id: str):
    # ... delete user logic
```

#### 2.3 Token Refresh Logic

**Automatic Refresh**:

```python
async def get_or_refresh_csrf_token(session_id: str) -> str:
    """Get existing token or create new one"""
    token = await get_csrf_token_from_session(session_id)

    if not token:
        # Generate new token
        token = secrets.token_urlsafe(32)

        # Store in cache with expiration
        await set_csrf_token_in_session(
            session_id,
            token,
            expires_in=1800  # 30 minutes
        )

    return token
```

### Frontend Changes Required (Already Prepared)

**CSRF Module** (`src/infrastructure/api/csrf.ts`):

```typescript
// Frontend will:
// 1. Fetch CSRF token on app initialization
// 2. Add X-CSRF-Token header to all POST/PUT/DELETE requests
// 3. Refresh token before expiration
// 4. Handle 403 CSRF errors by fetching new token
```

**API Client Integration**:

```typescript
// Already implemented in frontend:
import { CSRFProtection } from './csrf';

class ApiClient {
  async post(url: string, data: unknown) {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    // Add CSRF token
    await CSRFProtection.addToHeaders(headers);

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }
}
```

---

## 3. CORS Configuration

### Required Backend Changes

**Update CORS Settings**:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://app.yourdomain.com",
        # Add staging/dev URLs as needed
    ],
    allow_credentials=True,  # Required for cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=[
        "Content-Type",
        "X-CSRF-Token",  # Allow CSRF header
        "Authorization",  # For backward compatibility during migration
    ],
    expose_headers=["Set-Cookie"],
)
```

**Important**:

- `allow_credentials=True` is **required** for cookies to work
- `allow_origins` must be **specific domains** (not `*`) when using credentials
- Include `X-CSRF-Token` in `allow_headers`

---

## 4. Session Management

### Required Backend Changes

#### 4.1 Session Storage

**Use Redis for Sessions** (Recommended):

```python
import redis
from datetime import timedelta

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True
)

async def create_session(user_id: str) -> str:
    """Create new session"""
    session_id = secrets.token_urlsafe(32)

    # Store session data
    await redis_client.setex(
        f"session:{session_id}",
        timedelta(hours=24),  # Session expires in 24 hours
        json.dumps({
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
        })
    )

    return session_id

async def get_session(session_id: str) -> dict:
    """Retrieve session data"""
    data = await redis_client.get(f"session:{session_id}")
    return json.loads(data) if data else None

async def delete_session(session_id: str):
    """Delete session on logout"""
    await redis_client.delete(f"session:{session_id}")
```

#### 4.2 Session Cookie

**Set on Login**:

```http
Set-Cookie: session_id=abc123...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```

---

## 5. Security Headers

### Required Backend Changes

**Add Security Headers Middleware**:

```python
from fastapi import Response

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    # CSRF Protection
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # HSTS (HTTPS only)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # CSP
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https://api.yourdomain.com"
    )

    return response
```

---

## 6. Rate Limiting (Backend)

### Required Backend Changes

**Implement Rate Limiting Middleware**:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Apply to sensitive endpoints
@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")  # 5 attempts per minute
async def login(credentials: LoginRequest):
    # ... login logic

@app.post("/api/v1/auth/password-reset")
@limiter.limit("3/hour")  # 3 attempts per hour
async def request_password_reset(email: EmailRequest):
    # ... password reset logic

@app.post("/api/v1/users")
@limiter.limit("10/minute")  # 10 user creations per minute
async def create_user(user: UserCreate):
    # ... create user logic
```

**Return Rate Limit Headers**:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1697529600
Retry-After: 60

{
  "error": "Too many requests",
  "retry_after": 60
}
```

---

## 7. Implementation Checklist

### Phase 1: httpOnly Cookies (Week 1)

- [ ] Update login endpoint to set httpOnly cookies
- [ ] Create token refresh endpoint
- [ ] Update logout endpoint to clear cookies
- [ ] Add cookie validation middleware
- [ ] Update CORS configuration
- [ ] Test with frontend in development
- [ ] Deploy to staging
- [ ] Test in staging
- [ ] Deploy to production

### Phase 2: CSRF Protection (Week 2)

- [ ] Create CSRF token generation endpoint
- [ ] Implement CSRF validation middleware
- [ ] Apply to all mutating endpoints
- [ ] Add session storage for CSRF tokens
- [ ] Test with frontend in development
- [ ] Deploy to staging
- [ ] Test in staging
- [ ] Deploy to production

### Phase 3: Security Headers & Rate Limiting (Week 3)

- [ ] Add security headers middleware
- [ ] Implement rate limiting
- [ ] Configure Redis for sessions
- [ ] Update monitoring alerts
- [ ] Deploy to staging
- [ ] Test in staging
- [ ] Deploy to production

---

## 8. Testing Requirements

### Backend Tests Needed

```python
# test_auth_cookies.py
async def test_login_sets_httponly_cookies():
    response = await client.post("/api/v1/auth/login", json={
        "email": "user@test.com",
        "password": "password123"
    })

    assert response.status_code == 200
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

    # Verify cookie attributes
    cookie = response.cookies["access_token"]
    assert cookie.httponly == True
    assert cookie.secure == True
    assert cookie.samesite == "strict"

async def test_csrf_token_validation():
    # Login first
    await login_user()

    # Try request without CSRF token
    response = await client.post("/api/v1/users", json={
        "email": "new@test.com"
    })
    assert response.status_code == 403

    # Get CSRF token
    csrf_response = await client.get("/api/v1/auth/csrf-token")
    csrf_token = csrf_response.json()["csrf_token"]

    # Try with CSRF token
    response = await client.post("/api/v1/users",
        json={"email": "new@test.com"},
        headers={"X-CSRF-Token": csrf_token}
    )
    assert response.status_code == 201
```

---

## 9. Migration Strategy

### Gradual Migration Plan

**Step 1: Deploy Backend Changes**

- Deploy cookie-based auth alongside token-based auth
- Support both methods simultaneously

**Step 2: Deploy Frontend Changes**

- Update frontend to use new cookie-based auth
- Add feature flag to switch between methods

**Step 3: Monitor & Verify**

- Monitor error rates
- Verify all users can authenticate
- Check for any compatibility issues

**Step 4: Deprecate Old Method**

- After 2 weeks of successful operation, remove token-based auth
- Clean up old code

### Rollback Plan

If issues occur:

1. Set feature flag to use old token-based auth
2. Investigate issues
3. Fix and redeploy
4. Re-enable cookie-based auth

---

## 10. Documentation Requirements

### API Documentation Updates

**Update Swagger/OpenAPI Spec**:

```yaml
paths:
  /api/v1/auth/login:
    post:
      summary: User login
      responses:
        '200':
          description: Login successful
          headers:
            Set-Cookie:
              description: Authentication cookies
              schema:
                type: string
                example: access_token=eyJ...; HttpOnly; Secure; SameSite=Strict

  /api/v1/auth/csrf-token:
    get:
      summary: Get CSRF token
      security:
        - cookieAuth: []
      responses:
        '200':
          description: CSRF token
          content:
            application/json:
              schema:
                type: object
                properties:
                  csrf_token:
                    type: string
                  expires_at:
                    type: string
```

---

## 11. Security Considerations

### Additional Recommendations

1. **Token Rotation**
   - Rotate refresh tokens on each use
   - Invalidate old refresh tokens

2. **Suspicious Activity Detection**
   - Log failed login attempts
   - Alert on unusual patterns
   - Implement account lockout after N failed attempts

3. **Audit Logging**
   - Log all authentication events
   - Log CSRF validation failures
   - Monitor for attack patterns

4. **Penetration Testing**
   - Test CSRF protection
   - Test cookie security
   - Test session management
   - Verify XSS prevention

---

## Contact & Support

**Frontend Team**: [Your contact]  
**Backend Team**: [Backend contact]  
**Security Team**: [Security contact]

**Timeline**: 3 weeks for full implementation  
**Priority**: HIGH - Security critical
