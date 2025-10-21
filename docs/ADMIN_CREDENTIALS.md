# Admin Credentials - User Management System

**Last Updated:** October 21, 2025  
**Status:** ✅ Credentials Confirmed

---

## 🔐 Admin Account Credentials

### Production Admin Account

```
Email:    sangram0202@gmail.com
Password: Sangram@1
Role:     admin
```

---

## ⚠️ Current Status

**Backend Status:** ✅ Running at `http://127.0.0.1:8001`  
**Admin User:** ❌ Not created yet in database  
**Next Action:** Create admin user in backend

---

## 🚀 Quick Setup

### Step 1: Create Admin User in Backend

```powershell
# Navigate to backend directory
cd d:\code\python\user_mn

# Run database seed script to create admin user
python seed_rbac_roles.py
```

**Expected Output:**
```
✅ Admin user created successfully
Email: sangram0202@gmail.com
Password: Sangram@1
```

### Step 2: Test Login

```powershell
# Test login with PowerShell
Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/v1/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"sangram0202@gmail.com","password":"Sangram@1"}'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "usr_...",
    "email": "sangram0202@gmail.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin",
    "is_verified": true,
    "is_active": true
  }
}
```

### Step 3: Start UI and Login

```powershell
# From UI directory
cd d:\code\reactjs\user_mn_ui

# Start development server
npm run dev

# Browser will open at: http://localhost:5173
```

**Login to UI:**
1. Navigate to http://localhost:5173
2. Click "Login" or navigate to login page
3. Enter credentials:
   - Email: `sangram0202@gmail.com`
   - Password: `Sangram@1`
4. Click "Sign In"

---

## 🔍 Troubleshooting

### Error: "Login failed due to server error" (500)

**Cause:** Admin user not created in backend database

**Solution:** Run the seed script:
```powershell
cd d:\code\python\user_mn
python seed_rbac_roles.py
```

### Error: "Invalid credentials" (401)

**Cause:** Wrong email or password

**Solution:** Use exact credentials:
- Email: `sangram0202@gmail.com` (case-sensitive)
- Password: `Sangram@1` (case-sensitive)

### Error: "Network error" or "Connection refused"

**Cause:** Backend not running

**Solution:** Start the backend:
```powershell
cd d:\code\python\user_mn
# Activate virtual environment if needed
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

---

## 📝 Security Notes

### ⚠️ Important Security Reminders

1. **Change Password After First Login**
   - Navigate to Profile → Change Password
   - Use a strong, unique password

2. **Production Deployment**
   - Update credentials before deploying to production
   - Use environment variables for credentials
   - Enable HTTPS for all API communication
   - Set secure password policies

3. **Credential Storage**
   - Never commit credentials to version control
   - Use secure credential management (AWS Secrets Manager, etc.)
   - Rotate credentials periodically

---

## 🧪 Testing Login Flow

### Manual Test

1. **Health Check**
   ```powershell
   curl http://127.0.0.1:8001/health
   # Expected: 200 OK
   ```

2. **Login Test**
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/v1/auth/login" `
     -Method Post `
     -ContentType "application/json" `
     -Body '{"email":"sangram0202@gmail.com","password":"Sangram@1"}'
   ```

3. **Save Token**
   ```powershell
   $response = Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/v1/auth/login" `
     -Method Post `
     -ContentType "application/json" `
     -Body '{"email":"sangram0202@gmail.com","password":"Sangram@1"}'
   
   $token = $response.access_token
   ```

4. **Test Protected Endpoint**
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/v1/profile/me" `
     -Method Get `
     -Headers @{Authorization = "Bearer $token"}
   ```

### Automated Test

```powershell
# Run integration test script
npx tsx scripts/test-backend-integration.ts
```

The script will automatically:
- Test health endpoint
- Login with admin credentials
- Test protected endpoints
- Generate detailed report

---

## 📚 Related Documentation

- `docs/BACKEND_SETUP_GUIDE.md` - Complete backend setup instructions
- `docs/BACKEND_INTEGRATION_CORRECTED.md` - Full integration status (48 endpoints)
- `scripts/test-backend-integration.ts` - Automated testing script

---

## ✅ Success Checklist

- [ ] Backend running at `http://127.0.0.1:8001`
- [ ] Health endpoint returns 200 OK
- [ ] Admin user created via `seed_rbac_roles.py`
- [ ] Login returns access token (not 500 error)
- [ ] Protected endpoints accessible with token
- [ ] UI login page accepts credentials
- [ ] Admin dashboard loads successfully

**Current Status:** Step 3 - Admin user needs to be created

**Next Action:** Run `python seed_rbac_roles.py` in backend directory
