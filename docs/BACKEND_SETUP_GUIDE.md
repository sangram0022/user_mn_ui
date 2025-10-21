# Backend Integration Setup Guide

**Date**: October 21, 2025  
**Status**: Backend Running ✅ | Needs Admin User Setup ❌

---

## 🔍 Current Status

### ✅ What's Working

- Backend is running at `http://127.0.0.1:8001`
- Health endpoint accessible: `/health`
- API endpoints responding (some with errors)

### ❌ What Needs Setup

- Admin user not created
- Database may need initialization
- RBAC roles need to be seeded

---

## 🛠️ Backend Setup Instructions

### Step 1: Navigate to Backend Directory

```powershell
cd d:\code\python\user_mn
```

### Step 2: Initialize Database (if needed)

```powershell
# Initialize DynamoDB tables
python init_dynamodb.py

# Seed RBAC roles and create admin user
python seed_rbac_roles.py
```

### Step 3: Verify Backend is Running

```powershell
# Test health endpoint
curl http://127.0.0.1:8001/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-21T...",
#   "environment": "development",
#   "service": "FastAPI User Management System",
#   "version": "1.0.0"
# }
```

### Step 4: Test Login

```powershell
# Test login with admin credentials
Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/v1/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"sangram0202@gmail.com","password":"Sangram@1"}'

# Should return:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "bearer",
#   "expires_in": 1800,
#   "refresh_token": "..."
# }
```

---

## 🔧 UI Configuration (Already Done ✅)

### .env File Configuration

Your `.env` file is already configured correctly:

```env
VITE_BACKEND_URL=http://127.0.0.1:8001
VITE_API_BASE_URL=http://127.0.0.1:8001/api/v1
```

### API Client Configuration

The API client in `src/lib/api/client.ts` is configured to use:

- Base URL: `http://127.0.0.1:8001/api/v1`
- JWT Bearer token authentication
- All 48 backend endpoints mapped

---

## 📋 Backend Endpoints Available

### Authentication Endpoints (10)

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/resend-verification` - Resend verification
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

9. `POST /api/v1/auth/change-password` - Change password
10. `POST /api/v1/auth/password-reset` - Password reset (alias)
11. `POST /api/v1/auth/secure-login` - Secure login (cookies)
12. `POST /api/v1/auth/secure-logout` - Secure logout
13. `POST /api/v1/auth/secure-refresh` - Secure refresh

- `GET /api/v1/auth/csrf-token` - Get CSRF token

### Profile Endpoints (1)

### Profile (6 endpoints)

1. `GET /api/v1/profile/me` - Get current user profile
2. `GET /api/v1/profile` - Get profile (alias)
3. `GET /api/v1/profile/` - Get profile (alias)
4. `PUT /api/v1/profile/me` - Update current user profile
5. `PUT /api/v1/profile` - Update profile (alias)
6. `PUT /api/v1/profile/` - Update profile (alias)

- `PUT /api/v1/profile/me` - Update current user profile

### Admin Users (9 endpoints)

- `GET /api/v1/admin/users` - List all users
- `POST /api/v1/admin/users` - Create user
- `GET /api/v1/admin/users/{userId}` - Get user details
- `PUT /api/v1/admin/users/{userId}` - Update user
- `DELETE /api/v1/admin/users/{userId}` - Delete user
- `POST /api/v1/admin/users/{userId}/approve` - Approve user
- `POST /api/v1/admin/users/{userId}/reject` - Reject user

### Admin Role Management (7)

- `GET /api/v1/admin/roles` - List all roles
- `POST /api/v1/admin/roles` - Create role
- `GET /api/v1/admin/roles/{roleName}` - Get role details
- `PUT /api/v1/admin/roles/{roleName}` - Update role
- `DELETE /api/v1/admin/roles/{roleName}` - Delete role
- `POST /api/v1/admin/users/{userId}/assign-role` - Assign role
- `POST /api/v1/admin/users/{userId}/revoke-role` - Revoke role

### Audit Endpoints (2)

- `GET /api/v1/audit/logs` - Query audit logs
- `GET /api/v1/audit/summary` - Get audit summary

### GDPR Endpoints (3)

- `POST /api/v1/gdpr/export/my-data` - Export personal data
- `GET /api/v1/gdpr/export/status/{exportId}` - Check export status
- `DELETE /api/v1/gdpr/delete/my-account` - Delete account

### Health Endpoints (1)

- `GET /health` - Basic health check (Note: NO /api/v1 prefix)

### Logs Endpoints (1)

- `POST /api/v1/logs/frontend-errors` - Log frontend errors

**Total: 39 endpoints**

---

## 🧪 Testing Backend Integration

### Option 1: Using the Test Script

```powershell
# From UI directory
cd d:\code\reactjs\user_mn_ui

# Run integration test
npx tsx scripts/test-backend-integration.ts
```

### Option 2: Manual Testing

```powershell
# 1. Test health
curl http://127.0.0.1:8001/health

# 2. Test login
Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/v1/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"sangram0202@gmail.com","password":"Sangram@1"}'

# 3. Save the token
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Use actual token from step 2

# 4. Test protected endpoint
Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/v1/profile/me" `
  -Method Get `
  -Headers @{Authorization = "Bearer $token"}

# 5. Test admin endpoint
Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/v1/admin/users" `
  -Method Get `
  -Headers @{Authorization = "Bearer $token"}
```

---

## 🚀 Start the UI Application

Once backend is set up and working:

```powershell
# From UI directory
cd d:\code\reactjs\user_mn_ui

# Start development server
npm run dev

# Open browser
# Navigate to: http://localhost:5173

# Login with admin credentials
# Email: sangram0202@gmail.com
# Password: Sangram@1
```

---

## 🐛 Troubleshooting

### Issue: "Login failed due to server error" (500)

**Cause**: Admin user not created in backend

**Solution**:

```powershell
cd d:\code\python\user_mn
python seed_rbac_roles.py
```

### Issue: "Connection refused" or "ECONNREFUSED"

**Cause**: Backend not running

**Solution**:

```powershell
cd d:\code\python\user_mn
# Check if backend is running
# Start backend if needed (check backend README for start command)
```

### Issue: Health endpoint returns 404

**Cause**: Wrong endpoint path

**Solution**: Use `/health` instead of `/api/v1/health`

### Issue: CORS errors in browser

**Cause**: Backend CORS not configured for localhost:5173

**Solution**: Check backend CORS configuration in `src/app/main.py`

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Backend health check returns 200: `curl http://127.0.0.1:8001/health`
2. ✅ Login returns access token: `POST /api/v1/auth/login`
3. ✅ Profile endpoint returns user data: `GET /api/v1/profile/me`
4. ✅ Admin endpoint returns users list: `GET /api/v1/admin/users`
5. ✅ UI can login and display admin dashboard

---

## 📞 Next Steps

### If Backend Setup is Complete:

1. Run integration test: `npx tsx scripts/test-backend-integration.ts`
2. Start UI: `npm run dev`
3. Test login at: `http://localhost:5173`
4. Verify all features work

### If Backend Needs Setup:

1. Navigate to backend: `cd d:\code\python\user_mn`
2. Initialize database: `python init_dynamodb.py`
3. Seed admin user: `python seed_rbac_roles.py`
4. Verify login works (see Step 4 above)
5. Then proceed with UI testing

---

## 🎯 Summary

**UI is ready ✅** - All configuration is complete  
**Backend needs setup ❌** - Admin user must be created

**Next immediate action**: Run `python seed_rbac_roles.py` in backend directory
