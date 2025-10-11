# Backend Configuration Guide

## 📍 Single Source of Truth

All backend host and port configurations are centralized in **ONE place** for easy management.

## 🎯 Where to Change Backend URL

### Option 1: Environment Variables (Recommended)

Edit `.env` file in the project root:

```bash
# Change these values to match your backend
VITE_BACKEND_URL=http://127.0.0.1:8001
VITE_API_BASE_URL=http://127.0.0.1:8001/api/v1
```

**This is the recommended approach** as it allows different configurations for different environments without code changes.

### Option 2: Default Configuration

If you need to change the default fallback values (when environment variables are not set), edit:

**File:** `src/shared/config/api.ts`

```typescript
export const BACKEND_CONFIG = {
  // Change these URLs to match your backend server
  BASE_URL: import.meta.env['VITE_BACKEND_URL'] || 'http://127.0.0.1:8001',
  API_BASE_URL: import.meta.env.DEV
    ? '/api/v1' // Use proxy in development
    : import.meta.env['VITE_BACKEND_URL']
      ? `${import.meta.env['VITE_BACKEND_URL']}/api/v1`
      : 'http://127.0.0.1:8001/api/v1', // ← Change port here
  // ...
};
```

## 📋 All Files Using Centralized Configuration

The following files automatically import from `src/shared/config/api.ts`:

1. ✅ `src/config/env.ts` - Environment configuration
2. ✅ `src/shared/constants/appConstants.ts` - App constants
3. ✅ `src/shared/config/constants.ts` - Global constants
4. ✅ `src/shared/security/securityHeaders.ts` - Security headers
5. ✅ `src/lib/api/client.ts` - API client
6. ✅ `src/infrastructure/api/apiClient.ts` - Infrastructure API client
7. ✅ `vite.config.ts` - Vite proxy configuration

## 🔧 How It Works

### Development Mode (npm run dev)

- Frontend runs on: `http://localhost:5174`
- API requests go to: `/api/v1/*`
- Vite proxy forwards to: `http://127.0.0.1:8001/api/v1/*`

### Production Mode (npm run build)

- Frontend uses absolute URLs: `http://127.0.0.1:8001/api/v1/*`
- No proxy needed

## 🚀 Quick Start

### 1. Start Backend Server

```bash
cd d:\code\user_mn
# Start your backend on port 8001
python manage.py runserver 127.0.0.1:8001
```

### 2. Update Environment Variables (if needed)

```bash
# Edit .env file
VITE_BACKEND_URL=http://127.0.0.1:8001
VITE_API_BASE_URL=http://127.0.0.1:8001/api/v1
```

### 3. Start Frontend

```bash
cd d:\code\reactjs\user_mn_ui
npm run dev
```

## 🔍 Verification

After starting the development server, check the terminal output:

```
VITE v6.3.6  ready in 697 ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
➜  press h + enter to show help
```

If you see proxy errors like `ECONNREFUSED`, it means:

- ❌ Backend server is not running on port 8001
- ❌ Port number is incorrect in configuration

## 🎨 Benefits of Centralized Configuration

✅ **Single Source of Truth** - Change in one place, updates everywhere
✅ **Type Safety** - TypeScript ensures correct usage
✅ **Environment Flexibility** - Different configs for dev/staging/prod
✅ **Easy Maintenance** - No need to search through multiple files
✅ **Reduced Errors** - No hardcoded URLs scattered in code

## 📝 Notes

- **Port 8001**: Your backend runs on this port (not the default 8000)
- **Auto-reload**: Frontend automatically reloads when backend URL changes
- **Proxy in Dev**: Avoids CORS issues during development
- **Production Build**: Uses absolute URLs (no proxy)

## 🆘 Troubleshooting

### Backend Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:8001
```

**Solution:**

1. Verify backend is running: `http://127.0.0.1:8001/api/v1/health`
2. Check port in `.env` matches backend port
3. Restart frontend: `npm run dev`

### Port Already in Use

```
Port 8001 is already in use
```

**Solution:**

1. Kill process using port: `netstat -ano | findstr :8001`
2. Or change to different port in `.env`

## 🔐 Security Note

Never commit sensitive backend URLs or API keys to version control. Use `.env` for local development and proper secrets management for production.
