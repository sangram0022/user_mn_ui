# 🚀 Authentication Quick Start Guide

## 📦 Installation & Setup

The authentication system is already configured. Just import and use the hooks!

## 🔥 Quick Examples

### 1. **Login**

```typescript
import { useLogin } from '@/domains/auth/hooks/useLogin';

function LoginPage() {
  const loginMutation = useLogin({
    onSuccess: (data) => {
      // Tokens automatically stored
      // User data in: data.user
      // Redirect to dashboard
    },
  });

  const handleLogin = (email: string, password: string) => {
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin('user@example.com', 'password');
    }}>
      <input type="email" required />
      <input type="password" required />
      <button disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
      {loginMutation.error && <p>{loginMutation.error.message}</p>}
    </form>
  );
}
```

### 2. **Register**

```typescript
import { useRegister } from '@/domains/auth/hooks/useRegister';

function RegisterPage() {
  const registerMutation = useRegister({
    onSuccess: (data) => {
      alert(`Check ${data.email} for verification email`);
    },
  });

  return (
    <button onClick={() => registerMutation.mutate({
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe',
    })}>
      Register
    </button>
  );
}
```

### 3. **Logout**

```typescript
import { useLogout } from '@/domains/auth/hooks/useLogout';

function LogoutButton() {
  const logoutMutation = useLogout();

  return (
    <button onClick={() => logoutMutation.mutate()}>
      Logout
    </button>
  );
}
```

### 4. **Password Reset**

```typescript
import { usePasswordReset } from '@/domains/auth/hooks/usePasswordReset';

function ForgotPassword() {
  const resetMutation = usePasswordReset({
    onSuccess: () => alert('Check your email'),
  });

  return (
    <button onClick={() => resetMutation.mutate({ 
      email: 'user@example.com' 
    })}>
      Reset Password
    </button>
  );
}
```

### 5. **Change Password (Authenticated)**

```typescript
import { useChangePassword } from '@/domains/auth/hooks/useChangePassword';

function ChangePasswordForm() {
  const changePwdMutation = useChangePassword({
    onSuccess: () => alert('Password changed!'),
  });

  return (
    <button onClick={() => changePwdMutation.mutate({
      current_password: 'OldPass123!',
      new_password: 'NewPass123!',
    })}>
      Change Password
    </button>
  );
}
```

### 6. **Email Verification**

```typescript
import { useVerifyEmail } from '@/domains/auth/hooks/useVerifyEmail';

function VerifyEmailPage({ token }: { token: string }) {
  const verifyMutation = useVerifyEmail({
    onSuccess: (data) => {
      alert(`Email ${data.email} verified!`);
      // Redirect to login
    },
  });

  // Auto-verify on mount
  useEffect(() => {
    verifyMutation.mutate({ token });
  }, [token]);

  return verifyMutation.isPending ? <p>Verifying...</p> : null;
}
```

### 7. **Secure Login (httpOnly Cookies)**

```typescript
import { useSecureLogin } from '@/domains/auth/hooks/useSecureAuth';

function SecureLoginForm() {
  const secureLoginMutation = useSecureLogin({
    onSuccess: (data) => {
      // Tokens in httpOnly cookies (more secure)
      console.log('CSRF Token:', data.csrf_token);
    },
  });

  return (
    <button onClick={() => secureLoginMutation.mutate({
      email: 'user@example.com',
      password: 'password',
    })}>
      Secure Login
    </button>
  );
}
```

### 8. **CSRF Token**

```typescript
import { useCsrfToken } from '@/domains/auth/hooks/useCsrfToken';

function ProtectedForm() {
  const { data: csrfData, isLoading } = useCsrfToken();

  if (isLoading) return <p>Loading...</p>;

  return (
    <form>
      <input type="hidden" value={csrfData?.csrf_token} />
      {/* Other form fields */}
    </form>
  );
}
```

## 📊 Mutation States

All hooks return standard React Query mutation states:

```typescript
const mutation = useLogin();

// States
mutation.isPending    // true while loading
mutation.isSuccess    // true on success
mutation.isError      // true on error
mutation.error        // Error object
mutation.data         // Response data

// Methods
mutation.mutate(data)   // Trigger mutation
mutation.reset()        // Reset mutation state
```

## 🎯 Error Handling

```typescript
const loginMutation = useLogin({
  onError: (error) => {
    if (error.message === 'EMAIL_NOT_VERIFIED') {
      // Show resend verification button
    } else if (error.message === 'INVALID_CREDENTIALS') {
      // Show error message
    } else {
      // Generic error handling
    }
  },
});
```

## 🔧 Token Management

```typescript
import tokenService from '@/domains/auth/services/tokenService';

// Get tokens
const token = tokenService.getAccessToken();
const refreshToken = tokenService.getRefreshToken();

// Check if expired
if (tokenService.isTokenExpired()) {
  // Token expired
}

// Get expiry time (seconds)
const expiryTime = tokenService.getTokenExpiryTime();

// Clear all tokens
tokenService.clearTokens();
```

## 🌐 API Base URL

Configure in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## 📁 Import Paths

```typescript
// Hooks
import { useLogin } from '@/domains/auth/hooks/useLogin';
import { useRegister } from '@/domains/auth/hooks/useRegister';
import { useLogout } from '@/domains/auth/hooks/useLogout';
// ... etc

// Services
import authService from '@/domains/auth/services/authService';
import tokenService from '@/domains/auth/services/tokenService';

// Types
import type { LoginRequest, LoginResponse } from '@/domains/auth/types/auth.types';
```

## 🎨 Complete Login Example

```typescript
import { useState } from 'react';
import { useLogin } from '@/domains/auth/hooks/useLogin';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin({
    onSuccess: (data) => {
      console.log('Logged in as:', data.user.email);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loginMutation.isPending}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loginMutation.isPending}
          />
        </div>
        {loginMutation.error && (
          <div className="error">
            {loginMutation.error.message}
          </div>
        )}
        <button 
          type="submit" 
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (automatic with our implementation)
3. **Clear tokens on logout** (automatic)
4. **Validate user input** before sending
5. **Handle token refresh** (automatic)
6. **Use CSRF tokens** for state-changing operations
7. **Implement rate limiting** on frontend

## 📚 Available Hooks

| Hook | Endpoint | Purpose |
|------|----------|---------|
| `useLogin` | POST /auth/login | Standard login |
| `useRegister` | POST /auth/register | User registration |
| `useLogout` | POST /auth/logout | Logout user |
| `usePasswordReset` | POST /auth/password-reset | Request reset link |
| `useResetPassword` | POST /auth/reset-password | Reset with token |
| `useForgotPassword` | POST /auth/forgot-password | Forgot password flow |
| `useChangePassword` | POST /auth/change-password | Change password |
| `useVerifyEmail` | POST /auth/verify-email | Verify email |
| `useResendVerification` | POST /auth/resend-verification | Resend email |
| `useRefreshToken` | POST /auth/refresh | Refresh access token |
| `useSecureLogin` | POST /auth/login-secure | Secure cookie login |
| `useSecureLogout` | POST /auth/logout-secure | Secure cookie logout |
| `useCsrfToken` | GET /auth/csrf-token | Get CSRF token |

## 🎉 That's It!

You're ready to implement authentication in your app. All hooks follow the same pattern and include proper TypeScript types.

For more details, see: `AUTH_IMPLEMENTATION_COMPLETE.md`
