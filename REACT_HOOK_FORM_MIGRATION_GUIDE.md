# React Hook Form Migration Guide

## Overview

This guide shows how to migrate from manual form handling with `useState` to React Hook Form with Zod validation. The new approach provides:

- **60% less boilerplate code**
- **Better performance** (fewer re-renders)
- **Type-safe validation** with Zod schemas
- **Built-in error handling** and toast notifications
- **Consistent validation** across the app

## Performance Benefits

### Before (Manual State)
```tsx
// ❌ Re-renders on every keystroke
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Manual validation logic (potential inconsistency)
  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Invalid email';
    return '';
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Manual validation
    const newErrors: Record<string, string> = {};
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)} // Triggers re-render
      />
      {errors.email && <span>{errors.email}</span>}
      {/* More fields... */}
    </form>
  );
}
```

### After (React Hook Form)
```tsx
// ✅ Optimized re-renders, consistent validation
function LoginForm() {
  const form = useLoginForm({
    onSuccess: async (data) => {
      await loginMutation.mutateAsync(data);
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        {...form.register('email')}
        className={form.formState.errors.email ? 'error' : ''}
      />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
      {/* Other fields... */}
    </form>
  );
}
```

## Migration Steps

### Step 1: Install Dependencies

Already completed in this project:
- `react-hook-form`
- `@hookform/resolvers`
- `zod`

### Step 2: Use Pre-built Form Hooks

Import the appropriate hook for your form:

```tsx
import { 
  useLoginForm, 
  useRegisterForm, 
  useContactForm, 
  useUserEditForm 
} from '@/core/validation';
```

### Step 3: Replace Manual State with Hook

#### Login Form Example

**Before:**
```tsx
const [formData, setFormData] = useState({ email: '', password: '' });
const [errors, setErrors] = useState<Record<string, string>>({});

const handleChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};
```

**After:**
```tsx
const form = useLoginForm({
  onSuccess: async (data) => {
    // Type-safe data: { email: string, password: string }
    await loginMutation.mutateAsync(data);
  },
  successMessage: 'Welcome back!',
  errorMessage: 'Login failed. Please check your credentials.'
});
```

### Step 4: Update Form JSX

#### Input Fields

**Before:**
```tsx
<input
  type="email"
  value={formData.email}
  onChange={(e) => handleChange('email', e.target.value)}
  className={errors.email ? 'error' : ''}
/>
{errors.email && <span className="error">{errors.email}</span>}
```

**After:**
```tsx
<input
  type="email"
  {...form.register('email')}
  className={form.formState.errors.email ? 'error' : ''}
/>
{form.formState.errors.email && (
  <span className="error">{form.formState.errors.email.message}</span>
)}
```

#### Submit Button

**Before:**
```tsx
<button 
  type="submit" 
  disabled={isSubmitting || Object.keys(errors).length > 0}
>
  {isSubmitting ? 'Submitting...' : 'Login'}
</button>
```

**After:**
```tsx
<button 
  type="submit" 
  disabled={form.isDisabled}
>
  {form.formState.isSubmitting ? 'Submitting...' : 'Login'}
</button>
```

### Step 5: Handle Form Submission

**Before:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    // Manual validation
    const validationResult = validateFormData(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    
    await loginMutation.mutateAsync(formData);
    toast.success('Login successful!');
  } catch (error) {
    toast.error('Login failed');
  } finally {
    setIsSubmitting(false);
  }
};
```

**After:**
```tsx
// Just use the form.handleSubmit - everything else is handled!
<form onSubmit={form.handleSubmit}>
```

## Migration Examples for Each Form

### 1. Login Form (src/domains/auth/pages/LoginPage.tsx)

```tsx
// Replace existing state and validation with:
import { useLoginForm } from '@/core/validation';

export function LoginPage() {
  const form = useLoginForm({
    onSuccess: async (data) => {
      await loginMutation.mutateAsync(data);
      navigate('/dashboard');
    }
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...form.register('email')}
          className={form.formState.errors.email ? 'error' : ''}
        />
        {form.formState.errors.email && (
          <span className="text-red-600 text-sm">
            {form.formState.errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...form.register('password')}
          className={form.formState.errors.password ? 'error' : ''}
        />
        {form.formState.errors.password && (
          <span className="text-red-600 text-sm">
            {form.formState.errors.password.message}
          </span>
        )}
      </div>

      <button 
        type="submit" 
        disabled={form.isDisabled}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### 2. Register Form (src/domains/auth/pages/RegisterPage.tsx)

```tsx
import { useRegisterForm } from '@/core/validation';

export function RegisterPage() {
  const form = useRegisterForm({
    onSuccess: async (data) => {
      await registerMutation.mutateAsync(data);
      navigate('/login');
    }
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      {/* Email, username, password, confirmPassword fields */}
      {/* Similar pattern to login form */}
    </form>
  );
}
```

### 3. User Edit Form (src/domains/users/pages/UserEditPage.tsx)

```tsx
import { useUserEditForm } from '@/core/validation';

export function UserEditPage() {
  const { data: user } = useQuery(['user', userId], () => fetchUser(userId));
  
  const form = useUserEditForm({
    defaultValues: user ? {
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    } : undefined,
    onSuccess: async (data) => {
      await updateUserMutation.mutateAsync({ userId, ...data });
      navigate('/users');
    }
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      });
    }
  }, [user, form]);

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Best Practices

### 1. Error Display Component

Create a reusable error display component:

```tsx
interface FieldErrorProps {
  error?: { message?: string };
}

export function FieldError({ error }: FieldErrorProps) {
  if (!error?.message) return null;
  
  return (
    <span className="text-red-600 text-sm mt-1 block">
      {error.message}
    </span>
  );
}

// Usage:
<FieldError error={form.formState.errors.email} />
```

### 2. Field Wrapper Component

Create a field wrapper for consistency:

```tsx
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  form: ReturnType<typeof useLoginForm>;
  required?: boolean;
}

export function FormField({ label, name, type = 'text', form, required }: FormFieldProps) {
  const error = form.formState.errors[name];
  
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        {...form.register(name)}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
        `}
      />
      <FieldError error={error} />
    </div>
  );
}

// Usage:
<FormField label="Email" name="email" type="email" form={form} required />
```

### 3. Form State Debugging

Use the built-in state indicators in development:

```tsx
{import.meta.env.DEV && (
  <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
    <div>Valid: {form.formState.isValid.toString()}</div>
    <div>Dirty: {form.formState.isDirty.toString()}</div>
    <div>Submitting: {form.formState.isSubmitting.toString()}</div>
    <div>Errors: {Object.keys(form.formState.errors).length}</div>
  </div>
)}
```

## Performance Metrics

After migration, you should see:

1. **Reduced Bundle Size**: Form validation logic consolidated
2. **Fewer Re-renders**: Only re-render on form state changes, not field changes
3. **Type Safety**: Compile-time validation of form data structure
4. **Consistent Validation**: Same validation rules across all forms
5. **Better UX**: Real-time validation feedback

## Testing

Update tests to work with React Hook Form:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';

test('validates email field', async () => {
  render(<LoginPage />);
  
  const emailInput = screen.getByLabelText(/email/i);
  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  fireEvent.blur(emailInput);
  
  await waitFor(() => {
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });
});
```

## Next Steps

1. **Migrate Login Form** - Start with the simplest form
2. **Migrate Register Form** - Add password confirmation validation
3. **Migrate User Edit Form** - Handle default values and async data
4. **Update Tests** - Ensure all form tests pass
5. **Remove Old Validation Code** - Clean up unused manual validation logic
6. **Performance Testing** - Measure improvement in re-render count

This migration will significantly improve your form handling performance and developer experience while maintaining type safety and validation consistency.