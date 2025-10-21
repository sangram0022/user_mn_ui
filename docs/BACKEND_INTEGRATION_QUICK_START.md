# 🚀 Backend Integration - Quick Configuration Guide

**Date**: October 21, 2025  
**Backend**: `http://127.0.0.1:8001`  
**Status**: Ready to configure

---

## ✅ Step 1: Update Test Credentials

Edit `scripts/test-backend-integration.ts` and update these credentials:

```typescript
const TEST_ADMIN = {
  email: 'YOUR_ADMIN_EMAIL@example.com', // ← Update this
  password: 'YOUR_ADMIN_PASSWORD', // ← Update this
};

const TEST_USER = {
  email: 'YOUR_USER_EMAIL@example.com', // ← Update this
  password: 'YOUR_USER_PASSWORD', // ← Update this
};
```

---

## ✅ Step 2: Run Integration Test

```powershell
npx tsx scripts/test-backend-integration.ts
```

This will test:

- ✅ Authentication (login, register, logout)
- ✅ Profile endpoints (GET/PUT /profile/me)
- ✅ Admin user management (GET/POST/PUT /admin/users)
- ✅ Admin roles (GET/POST /admin/roles)
- ✅ Audit logs (GET /audit/logs, /audit/summary)
- ✅ GDPR (POST /gdpr/export/my-data)

---

## ✅ Step 3: Review Results

The test will show:

- **Passed**: Endpoints working correctly ✅
- **Failed**: Endpoints with errors ❌
- **Skipped**: Endpoints that need authentication ⏭️

---

## 🔍 What We've Already Fixed

### 1. API Client Configuration

✅ Disabled secure endpoints (httpOnly cookies) - using standard JWT
✅ Configured base URL: `http://127.0.0.1:8001/api/v1`
✅ Standard authentication working

### 2. Known Backend Limitations

⚠️ **Health endpoints not implemented** (`/health/*`)

- Impact: Health monitoring dashboard won't have real data
- Solution: Using mock data in UI

⚠️ **Secure auth endpoints not implemented** (`/auth/secure-*`)

- Impact: httpOnly cookie auth not available
- Solution: Using standard JWT authentication (already configured)

---

## 📋 Backend API Endpoints Available

Based on verification test, your backend has these endpoints:

### ✅ Authentication (Working)

```
POST   /auth/login                 - Login with email/password
POST   /auth/register             - Register new user
POST   /auth/logout               - Logout user
POST   /auth/refresh              - Refresh access token
POST   /auth/verify-email         - Verify email with token
POST   /auth/resend-verification  - Resend verification email
POST   /auth/forgot-password      - Request password reset
POST   /auth/reset-password       - Reset password
POST   /auth/change-password      - Change password (authenticated)
GET    /auth/csrf-token           - Get CSRF token
```

### ✅ Profile (Requires Auth)

```
GET    /profile/me                - Get current user profile
PUT    /profile/me                - Update current user profile
GET    /profile                   - Get profile (alias)
```

### ✅ Admin - Users (Requires Admin Auth)

```
GET    /admin/users               - List all users (with filters)
POST   /admin/users               - Create new user
GET    /admin/users/{id}          - Get user by ID
PUT    /admin/users/{id}          - Update user
DELETE /admin/users/{id}          - Delete user
POST   /admin/users/{id}/approve  - Approve user
POST   /admin/users/{id}/reject   - Reject user
```

### ✅ Admin - Roles (Requires Admin Auth)

```
GET    /admin/roles               - List all roles
POST   /admin/roles               - Create new role
GET    /admin/roles/{name}        - Get role by name
PUT    /admin/roles/{name}        - Update role
DELETE /admin/roles/{name}        - Delete role
POST   /admin/users/{id}/assign-role  - Assign role to user
POST   /admin/users/{id}/revoke-role  - Revoke role from user
```

### ✅ Audit Logs (Requires Admin Auth)

```
GET    /audit/logs                - Get audit logs (with filters)
GET    /audit/summary             - Get audit summary statistics
GET    /admin/audit-logs          - Admin audit logs (alias)
```

### ✅ GDPR (Requires Auth)

```
POST   /gdpr/export/my-data       - Request data export
GET    /gdpr/export/status/{id}   - Check export status
DELETE /gdpr/delete/my-account    - Delete account (GDPR)
```

### ✅ Logs

```
POST   /logs/frontend-errors      - Log frontend errors to backend
```

### ❌ Health (NOT Implemented)

```
GET    /health                    - Basic health check (404)
GET    /health/ping               - Ping endpoint (404)
GET    /health/ready              - Readiness probe (404)
GET    /health/live               - Liveness probe (404)
GET    /health/detailed           - Detailed health (404)
GET    /health/database           - Database health (404)
GET    /health/system             - System health (404)
```

---

## 🎯 Next Steps

### Option 1: Run Full Integration Test (Recommended)

```powershell
# 1. Update credentials in scripts/test-backend-integration.ts
# 2. Run the test
npx tsx scripts/test-backend-integration.ts
```

### Option 2: Start Dev Server & Manual Test

```powershell
# Start frontend
npm run dev

# Navigate to http://localhost:5173
# Try to login with your admin credentials
```

### Option 3: Check Specific Endpoint

```powershell
# Test login endpoint
curl -X POST http://127.0.0.1:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{\"email\":\"admin@example.com\",\"password\":\"your_password\"}'
```

---

## 📝 What to Tell Me

After running the integration test, please share:

1. **Did the test pass?**
   - ✅ Passed / ❌ Failed

2. **Which endpoints failed?** (if any)
   - List any failed endpoints

3. **Your admin credentials** (for me to update the test)
   - Admin email: `___________`
   - Admin password: `___________`

4. **Do you want to:**
   - A) Fix any failing endpoints
   - B) Remove features for unavailable endpoints (e.g., health monitoring)
   - C) Proceed with what works

---

## 💡 Quick Actions

### To start testing RIGHT NOW:

```powershell
# 1. Open the test file
code scripts/test-backend-integration.ts

# 2. Update lines 11-12 with your admin email/password
# 3. Update lines 16-17 with your user email/password (or keep admin)

# 4. Run the test
npx tsx scripts/test-backend-integration.ts
```

---

## 🚀 Ready?

Once you've updated the credentials, just run:

```powershell
npx tsx scripts/test-backend-integration.ts
```

And share the results! I'll help you fix any issues.
