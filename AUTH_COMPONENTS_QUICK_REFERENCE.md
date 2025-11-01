# Auth Components Quick Reference

## 🚀 Usage Examples

### LoginForm
```tsx
import { LoginForm } from '@/domains/auth/components';

function LoginPage() {
  return (
    <LoginForm
      onSuccess={() => console.log('Logged in!')}
      onError={(error) => console.error(error)}
      redirectTo="/dashboard"
    />
  );
}
```

### RegisterForm
```tsx
import { RegisterForm } from '@/domains/auth/components';

function RegisterPage() {
  return (
    <RegisterForm
      onSuccess={() => console.log('Account created!')}
      redirectTo="/auth/verify"
    />
  );
}
```

### ForgotPasswordForm
```tsx
import { ForgotPasswordForm } from '@/domains/auth/components';

function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      onSuccess={() => console.log('Reset email sent!')}
    />
  );
}
```

### ResetPasswordForm
```tsx
import { ResetPasswordForm } from '@/domains/auth/components';

function ResetPasswordPage() {
  const { token } = useParams();
  
  return (
    <ResetPasswordForm
      token={token}
      onSuccess={() => console.log('Password reset!')}
      redirectTo="/auth/login"
    />
  );
}
```

### ChangePasswordForm
```tsx
import { ChangePasswordForm } from '@/domains/auth/components';

function ChangePasswordPage() {
  return (
    <ChangePasswordForm
      onSuccess={() => {
        toast.success('Password changed successfully!');
      }}
    />
  );
}
```

### SessionExpiry
```tsx
import { SessionExpiry } from '@/domains/auth/components';

function AppLayout() {
  return (
    <>
      {/* Your app content */}
      <SessionExpiry
        warningThreshold={300} // 5 minutes
        onSessionExpired={() => {
          window.location.href = '/auth/login?expired=true';
        }}
        onSessionRefreshed={() => {
          console.log('Session refreshed');
        }}
      />
    </>
  );
}
```

### OAuthButtons
```tsx
import { OAuthButtons } from '@/domains/auth/components';

function LoginPage() {
  return (
    <>
      <LoginForm />
      <OAuthButtons
        onGoogleLogin={() => {
          // Custom Google OAuth logic
        }}
        onGitHubLogin={() => {
          // Custom GitHub OAuth logic
        }}
      />
    </>
  );
}
```

### PasswordStrength
```tsx
import { PasswordStrength } from '@/domains/auth/components';

function PasswordField() {
  const [password, setPassword] = useState('');
  
  return (
    <>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordStrength password={password} showLabel={true} />
    </>
  );
}
```

## 📋 Props Reference

### LoginFormProps
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string; // default: '/dashboard'
}
```

### RegisterFormProps
```typescript
interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string; // default: '/auth/verify'
}
```

### ForgotPasswordFormProps
```typescript
interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

### ResetPasswordFormProps
```typescript
interface ResetPasswordFormProps {
  token: string; // Required: reset token from URL
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string; // default: '/auth/login'
}
```

### ChangePasswordFormProps
```typescript
interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

### SessionExpiryProps
```typescript
interface SessionExpiryProps {
  warningThreshold?: number; // seconds before expiry, default: 300 (5 min)
  onSessionExpired?: () => void;
  onSessionRefreshed?: () => void;
}
```

### OAuthButtonsProps
```typescript
interface OAuthButtonsProps {
  onGoogleLogin?: () => void; // Custom handler or auto-redirect
  onGitHubLogin?: () => void; // Custom handler or auto-redirect
  disabled?: boolean; // default: false
}
```

### PasswordStrengthProps
```typescript
interface PasswordStrengthProps {
  password: string; // Required: password to analyze
  showLabel?: boolean; // default: true
}
```

## 🎨 Styling

All components use **Tailwind CSS** classes with:
- Light/dark mode support (e.g., `dark:bg-gray-800`)
- Responsive design (e.g., `md:grid-cols-2`)
- Consistent spacing and colors
- Accessible focus states

## 🔗 Hook Integration

| Component | Hook Used | Endpoint |
|-----------|-----------|----------|
| LoginForm | `useLogin` | POST /api/v1/auth/login |
| RegisterForm | `useRegister` | POST /api/v1/auth/register |
| ForgotPasswordForm | `useForgotPassword` | POST /api/v1/auth/forgot-password |
| ResetPasswordForm | `useResetPassword` | POST /api/v1/auth/reset-password |
| ChangePasswordForm | `useChangePassword` | POST /api/v1/auth/change-password |
| SessionExpiry | `useRefreshToken` | POST /api/v1/auth/refresh |

## ✅ Features

- ✅ TypeScript strict mode
- ✅ Automatic token management
- ✅ Loading states with spinners
- ✅ Error handling with user-friendly messages
- ✅ Form validation (client-side)
- ✅ Password visibility toggles
- ✅ Dark mode support
- ✅ Responsive layouts
- ✅ Accessibility (ARIA labels, focus management)
- ✅ Auto-focus on primary inputs

## 🐛 Error Handling

All form components display errors in a consistent format:

```tsx
{mutation.isError && (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
    <p className="text-sm text-red-800 dark:text-red-200">
      {mutation.error.message || 'Fallback error message'}
    </p>
  </div>
)}
```

## 📦 Bundle Size

```
✓ 1715 modules transformed
✓ LoginPage: 6.25 kB (gzip: 2.58 kB)
✓ RegisterPage: 7.89 kB (gzip: 2.90 kB)
✓ ForgotPasswordPage: 3.38 kB (gzip: 1.45 kB)
```

## 🔄 State Management

All components use:
- `useState` for local form state
- React Query hooks for API calls
- No global state (forms are self-contained)
- Proper cleanup on unmount

## 🎯 Best Practices

1. **Always provide onSuccess/onError handlers** for better UX
2. **Use redirectTo prop** for post-action navigation
3. **Wrap SessionExpiry at app level** for global session management
4. **Customize OAuth handlers** if not using default backend endpoints
5. **Test error scenarios** (network failures, invalid tokens, etc.)

## 🚦 Loading States

All forms disable inputs and show loading spinners:

```tsx
{mutation.isPending ? (
  <span className="flex items-center justify-center">
    <svg className="animate-spin h-5 w-5 mr-3">...</svg>
    Loading...
  </span>
) : (
  'Submit'
)}
```

---

**Need help?** Check `AUTH_COMPONENTS_COMPLETE.md` for full documentation.
