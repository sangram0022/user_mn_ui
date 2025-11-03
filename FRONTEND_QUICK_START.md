# 🚀 Quick Start Guide for Frontend Team

## 📌 Essential Information

**Base URL:** `http://localhost:8000/api/v1`  
**Full Documentation:** See `FRONTEND_API_DOCUMENTATION.md`

---

## 🔑 Quick Setup

### 1. Environment Variables

```typescript
// .env file
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

### 2. Axios Setup

```typescript
// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📋 API Endpoints Cheat Sheet

### Authentication

```typescript
// Register
POST /auth/register
Body: { email, password, first_name, last_name }
Response: { success, data: { user_id, verification_required } }

// Login
POST /auth/login
Body: { email, password }
Response: { success, data: { access_token, refresh_token, user_id, roles } }

// Logout
POST /auth/logout
Headers: { Authorization: Bearer <token> }
Response: { message }

// Refresh Token
POST /auth/refresh
Headers: { Authorization: Bearer <refresh_token> }
Response: { success, data: { access_token, refresh_token, user_id, roles } }

// Forgot Password
POST /auth/forgot-password
Body: { email }
Response: { success, email, requested_at }

// Reset Password
POST /auth/reset-password
Body: { token, new_password, confirm_password }
Response: { success, reset_at }

// Change Password
POST /auth/change-password
Headers: { Authorization: Bearer <token> }
Body: { current_password, new_password, confirm_password }
Response: { success, changed_at }

// Verify Email
POST /auth/verify-email
Body: { token }
Response: { success, verified_at, approval_required }

// Resend Verification
POST /auth/resend-verification
Body: { email }
Response: { success, resent_at }
```

### User Profile

```typescript
// Get Profile
GET /users/profile/me
Headers: { Authorization: Bearer <token> }
Response: { user_id, email, first_name, last_name, roles, status, phone_number?, avatar_url?, preferences?, metadata? }

// Update Profile
PUT /users/profile/me
Headers: { Authorization: Bearer <token> }
Body: { first_name?, last_name?, phone_number?, avatar_url?, preferences?, metadata? }  // All fields optional
Response: { user_id, email, first_name, last_name, roles, status, phone_number?, avatar_url?, preferences?, metadata? }
```

---

## 🎯 Common Patterns

### Pattern 1: Registration Flow

```typescript
import api from './api/axios';

interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}

export const register = async (data: RegisterData) => {
  try {
    const response = await api.post('/auth/register', data);
    
    if (response.data.success) {
      return {
        success: true,
        userId: response.data.data.user_id,
        needsVerification: response.data.data.verification_required,
        needsApproval: response.data.data.approval_required,
      };
    }
    return { success: false };
  } catch (error: any) {
    return {
      success: false,
      errors: error.response?.data?.field_errors || {},
    };
  }
};

// Usage
const result = await register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  confirm_password: 'SecurePass123!',
  first_name: 'John',
  last_name: 'Doe',
});

if (result.success) {
  if (result.needsVerification) {
    showMessage('Please check your email to verify your account');
  }
}
```

### Pattern 2: Login & Token Storage

```typescript
import api from './api/axios';

interface LoginData {
  email: string;
  password: string;
}

export const login = async (data: LoginData) => {
  try {
    const response = await api.post('/auth/login', data);
    
    if (response.data.success) {
      const { access_token, refresh_token, user_id, email, roles } = response.data.data;
      
      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify({ user_id, email, roles }));
      
      return { success: true, user: { user_id, email, roles } };
    }
    return { success: false };
  } catch (error: any) {
    const errorCode = error.response?.data?.message_code;
    
    return {
      success: false,
      errorCode,
      message: error.response?.data?.message || 'Login failed',
    };
  }
};

// Usage
const result = await login({
  email: 'user@example.com',
  password: 'SecurePass123!',
});

if (result.success) {
  navigate('/dashboard');
} else {
  if (result.errorCode === 'AUTH_EMAIL_NOT_VERIFIED') {
    showMessage('Please verify your email first');
  } else if (result.errorCode === 'AUTH_INVALID_CREDENTIALS') {
    showMessage('Invalid email or password');
  }
}
```

### Pattern 3: Token Refresh (Auto-Refresh Before Expiry)

```typescript
import api from './api/axios';

// Token refresh function
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }

    const response = await api.post('/auth/refresh', null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (response.data.success) {
      const { access_token, refresh_token: new_refresh_token } = response.data.data;
      
      // Update both tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', new_refresh_token);
      
      // Update axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return false;
  }
};

// Automatic token refresh scheduler
export const setupTokenRefresh = () => {
  // Refresh token every 25 minutes (before 30-minute expiry)
  setInterval(async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('Auto-refreshing token...');
      await refreshAccessToken();
    }
  }, 25 * 60 * 1000); // 25 minutes
};

// Call this after successful login
// setupTokenRefresh();

// Alternative: Refresh on 401 error (using axios interceptor)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // Retry original request with new token
        const newToken = localStorage.getItem('access_token');
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Pattern 4: Protected Route Component

```typescript
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Usage in App.tsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Pattern 5: Complete Profile Management with All Fields

```typescript
import { useState, useEffect } from 'react';
import api from './api/axios';

interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  status: string;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
  updated_at: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  preferences: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  } | null;
  metadata: Record<string, any> | null;
}

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
  metadata?: Record<string, any>;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const getProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/profile/me');
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    setLoading(true);
    setErrors({});
    try {
      const response = await api.put('/users/profile/me', data);
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      if (error.response?.data?.field_errors) {
        setErrors(error.response.data.field_errors);
      }
      return { success: false, errors: error.response?.data?.field_errors || {} };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return { profile, loading, errors, getProfile, updateProfile };
};

// Usage in component
const ProfilePage = () => {
  const { profile, loading, errors, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    avatar_url: '',
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: true,
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number || '',
        avatar_url: profile.avatar_url || '',
        preferences: profile.preferences || {
          theme: 'light',
          language: 'en',
          notifications: true,
        },
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      alert('Profile updated successfully!');
    }
  };

  if (loading && !profile) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>First Name</label>
        <input
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
        />
        {errors.first_name && <span className="error">{errors.first_name[0]}</span>}
      </div>

      <div>
        <label>Last Name</label>
        <input
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
        />
        {errors.last_name && <span className="error">{errors.last_name[0]}</span>}
      </div>

      <div>
        <label>Phone Number</label>
        <input
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          placeholder="+1234567890"
        />
        {errors.phone_number && <span className="error">{errors.phone_number[0]}</span>}
      </div>

      <div>
        <label>Avatar URL</label>
        <input
          value={formData.avatar_url}
          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
          placeholder="https://example.com/avatar.jpg"
        />
        {errors.avatar_url && <span className="error">{errors.avatar_url[0]}</span>}
      </div>

      <div>
        <label>Theme</label>
        <select
          value={formData.preferences.theme}
          onChange={(e) => setFormData({
            ...formData,
            preferences: { ...formData.preferences, theme: e.target.value }
          })}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label>Language</label>
        <select
          value={formData.preferences.language}
          onChange={(e) => setFormData({
            ...formData,
            preferences: { ...formData.preferences, language: e.target.value }
          })}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.preferences.notifications}
            onChange={(e) => setFormData({
              ...formData,
              preferences: { ...formData.preferences, notifications: e.target.checked }
            })}
          />
          Enable Notifications
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};
```

### Pattern 6: Form with Validation Errors

```typescript
import { useState } from 'react';
import api from './api/axios';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.data.success) {
        alert('Registration successful! Check your email.');
      }
    } catch (error: any) {
      if (error.response?.data?.field_errors) {
        setErrors(error.response.data.field_errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email?.map((err, i) => (
          <span key={i} className="error">{err}</span>
        ))}
      </div>
      
      {/* Repeat for other fields */}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};
```

---

## ⚠️ Common Validation Rules

### Email
- Must be valid format: `user@domain.com`
- Maximum 255 characters
- Automatically converted to lowercase

### Password
- **Length:** 8-128 characters
- **Must contain:**
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 digit (0-9)
  - At least 1 special character: `!@#$%^&*()_+-={}:;"'`~<>,.?/`

### Names (first_name, last_name)
- **Length:** 2-50 characters
- **Allowed:** Letters, spaces, hyphens (-), apostrophes (')
- **Example:** "Mary-Jane", "O'Brien"

---

## 🚨 Error Handling

### Standard Error Response

```typescript
interface ApiError {
  success: false;
  message: string;
  message_code: string;
  field_errors?: Record<string, string[]>;
  errors?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
}

// Handle errors
try {
  const response = await api.post('/auth/register', data);
} catch (error: any) {
  const apiError = error.response?.data as ApiError;
  
  // Display field errors
  if (apiError.field_errors) {
    Object.entries(apiError.field_errors).forEach(([field, messages]) => {
      messages.forEach(msg => {
        showFieldError(field, msg);
      });
    });
  }
  
  // Display general message
  if (apiError.message) {
    showToast(apiError.message);
  }
}
```

### Common Error Codes

```typescript
// Use these for localization (i18n)
const ERROR_MESSAGES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email address',
  AUTH_ACCOUNT_INACTIVE: 'Your account is inactive. Contact support.',
  AUTH_EMAIL_ALREADY_EXISTS: 'This email is already registered',
  
  // Validation
  VALIDATION_ERROR: 'Please check your input',
  
  // System
  SYSTEM_ERROR: 'Something went wrong. Please try again.',
};

// Usage
const errorCode = error.response?.data?.message_code;
const message = ERROR_MESSAGES[errorCode] || 'An error occurred';
showToast(message);
```

---

## 🔒 Security Checklist

### ✅ Must Do

1. **Token Storage**
   - ✅ Store access_token in memory or sessionStorage
   - ✅ Store refresh_token in httpOnly cookie (if backend supports)
   - ❌ NEVER store tokens in plain localStorage in production

2. **HTTPS**
   - ✅ Always use HTTPS in production
   - ✅ Use http://localhost:8000 only for development

3. **Password Security**
   - ✅ Use `type="password"` for password inputs
   - ✅ Never log passwords to console
   - ✅ Clear password fields after submission

4. **Error Messages**
   - ✅ Show user-friendly messages
   - ✅ Log request_id for debugging
   - ❌ Don't expose sensitive error details to users

5. **Rate Limiting**
   - ✅ Handle 429 responses gracefully
   - ✅ Show "Too many attempts" message
   - ✅ Implement retry with exponential backoff

---

## 📊 Response Format Reference

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "message_code": "OPERATION_SUCCESS",
  "timestamp": "2025-11-03T15:00:00.000Z",
  "data": { /* response data */ },
  "request_id": "req_xyz789",
  "api_version": "v1"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "message_code": "OPERATION_FAILED",
  "timestamp": "2025-11-03T15:00:00.000Z",
  "field_errors": {
    "email": ["Invalid email format"],
    "password": ["Password too short"]
  },
  "request_id": "req_xyz789",
  "api_version": "v1"
}
```

---

## 🎓 TypeScript Types

```typescript
// Base response type
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  message_code: string;
  timestamp: string;
  data?: T;
  errors?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
  field_errors?: Record<string, string[]>;
  request_id: string;
  api_version: string;
}

// Auth types
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user_id: string;
  email: string;
  roles: string[];
  last_login_at: string | null;
}

interface RegisterResponse {
  user_id: string;
  email: string;
  verification_required: boolean;
  approval_required: boolean;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  status: 'active' | 'inactive';
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
  updated_at: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  preferences: {
    theme?: string;
    language?: string;
    notifications?: boolean;
    [key: string]: any;
  } | null;
  metadata: Record<string, any> | null;
  profile_data: Record<string, any> | null;
}

// Request types
interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  username?: string;
  terms_accepted?: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
  profile_data?: Record<string, any>;
}
```

---

## 🔗 Quick Links

- **Full API Documentation:** `FRONTEND_API_DOCUMENTATION.md`
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/health`

---

## 💡 Tips & Best Practices

1. **Always check `success` field** in response before accessing `data`
2. **Use `message_code`** for internationalization (i18n)
3. **Display `field_errors`** under respective form fields
4. **Log `request_id`** when reporting bugs to backend team
5. **Handle token expiration** by checking 401 responses
6. **Implement loading states** to prevent double submissions
7. **Validate on frontend** to provide instant feedback
8. **Use TypeScript** for type safety with API responses

---

**Need Help?**
- Check `FRONTEND_API_DOCUMENTATION.md` for detailed examples
- Contact backend team with the `request_id` from error responses
- Use Swagger UI at `/docs` for testing endpoints

**Last Updated:** November 3, 2025
