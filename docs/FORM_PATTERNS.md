# Form Patterns Guide

**Version:** 1.0  
**Last Updated:** November 10, 2025  
**Status:** Production Standard

## Overview

This document defines the **single source of truth** for form handling patterns across the React frontend. All forms MUST follow the patterns defined here.

---

## Standard Pattern: React Hook Form + Zod

### Stack

- **Form Library:** `react-hook-form` v7.x
- **Validation:** `zod` v3.x + `@hookform/resolvers/zod`
- **Error Handling:** `useStandardErrorHandler`
- **Success Feedback:** `useToast`

### Why This Stack?

1. **Type Safety:** Zod schemas generate TypeScript types
2. **Performance:** Minimal re-renders (uncontrolled inputs)
3. **Developer Experience:** Clean API, great error messages
4. **Validation:** Client-side validation matches backend 100%
5. **Integration:** Works seamlessly with TanStack Query mutations

---

## Basic Form Pattern

### Complete Example

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { useToast } from '@/hooks/useToast';

// 1. Define Zod schema (matches backend validation)
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// 2. Infer TypeScript type from schema
type LoginFormData = z.infer<typeof loginSchema>;

// 3. Component
export function LoginForm() {
  const handleError = useStandardErrorHandler();
  const toast = useToast();

  // 4. Initialize form with Zod resolver
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 5. TanStack Query mutation
  const loginMutation = useLoginMutation();

  // 6. Submit handler
  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      toast.success('Login successful!');
    } catch (error) {
      handleError(error, {
        context: { operation: 'login' },
        fieldErrorSetter: form.setError,
      });
    }
  };

  // 7. Render form
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <span className="error">
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
        />
        {form.formState.errors.password && (
          <span className="error">
            {form.formState.errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Validation Patterns

### Pattern 1: Simple Fields

```typescript
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3).max(30),
  age: z.number().int().min(18).max(120),
  isActive: z.boolean(),
});
```

### Pattern 2: Email and Password

```typescript
import { z } from 'zod';
import { EMAIL_REGEX, PASSWORD_RULES } from '@/core/validation';

const schema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Invalid email format'),
  password: z.string()
    .min(PASSWORD_RULES.minLength)
    .max(PASSWORD_RULES.maxLength)
    .regex(PASSWORD_RULES.uppercase, 'Must contain uppercase letter')
    .regex(PASSWORD_RULES.lowercase, 'Must contain lowercase letter')
    .regex(PASSWORD_RULES.digit, 'Must contain digit')
    .regex(PASSWORD_RULES.specialChar, 'Must contain special character'),
});
```

### Pattern 3: Conditional Validation

```typescript
import { z } from 'zod';

const schema = z.object({
  accountType: z.enum(['personal', 'business']),
  companyName: z.string().optional(),
}).refine(
  (data) => {
    // If business account, company name is required
    if (data.accountType === 'business') {
      return !!data.companyName;
    }
    return true;
  },
  {
    message: 'Company name is required for business accounts',
    path: ['companyName'],
  }
);
```

### Pattern 4: Nested Objects

```typescript
import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().regex(/^\d{5}$/),
});

const schema = z.object({
  name: z.string().min(1),
  address: addressSchema,
});
```

### Pattern 5: Arrays

```typescript
import { z } from 'zod';

const schema = z.object({
  tags: z.array(z.string()).min(1, 'At least one tag required'),
  permissions: z.array(z.enum(['read', 'write', 'delete'])),
});
```

---

## Backend Validation Alignment

**CRITICAL:** All Zod schemas MUST match backend validation exactly.

### Backend Reference

```python
# user_mn/src/app/core/validation/patterns.py
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
USERNAME_REGEX = r'^[a-zA-Z0-9_]{3,30}$'
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128
```

### Frontend Implementation

```typescript
// src/core/validation/index.ts
import { EMAIL_REGEX, USERNAME_REGEX, PASSWORD_RULES } from '@/core/validation';

export const userSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Invalid email'),
  username: z.string().regex(USERNAME_REGEX, 'Invalid username'),
  password: z.string()
    .min(PASSWORD_RULES.minLength)
    .max(PASSWORD_RULES.maxLength),
});
```

**Verification:** See `BACKEND_FRONTEND_VALIDATION_ALIGNMENT.md` for full pattern comparison.

---

## Form State Management

### Loading States

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
});

// During submission
const isSubmitting = form.formState.isSubmitting;

// In button
<button disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</button>
```

### Dirty State (Unsaved Changes)

```typescript
// Check if form has been modified
const isDirty = form.formState.isDirty;

// Warn before leaving page
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

### Validation Modes

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Validate on blur (default: onChange)
  reValidateMode: 'onChange', // Revalidate on change after first submission
});
```

---

## Advanced Patterns

### Pattern 1: Multi-Step Forms

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const step1Schema = z.object({ name: z.string().min(1) });
const step2Schema = z.object({ email: z.string().email() });
const step3Schema = z.object({ password: z.string().min(8) });

function MultiStepForm() {
  const [step, setStep] = useState(1);
  const form = useForm();

  const handleStep1 = async (data) => {
    const result = step1Schema.safeParse(data);
    if (result.success) {
      setStep(2);
    }
  };

  const handleStep2 = async (data) => {
    const result = step2Schema.safeParse(data);
    if (result.success) {
      setStep(3);
    }
  };

  const handleFinalSubmit = async (data) => {
    // Submit all data
  };

  return (
    <form>
      {step === 1 && <Step1 form={form} onNext={handleStep1} />}
      {step === 2 && <Step2 form={form} onNext={handleStep2} />}
      {step === 3 && <Step3 form={form} onSubmit={handleFinalSubmit} />}
    </form>
  );
}
```

### Pattern 2: Dynamic Fields

```typescript
import { useFieldArray } from 'react-hook-form';

const schema = z.object({
  contacts: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })
  ).min(1, 'At least one contact required'),
});

function ContactsForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      contacts: [{ name: '', email: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  });

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...form.register(`contacts.${index}.name`)} />
          <input {...form.register(`contacts.${index}.email`)} />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ name: '', email: '' })}
      >
        Add Contact
      </button>
    </form>
  );
}
```

### Pattern 3: File Upload

```typescript
const schema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png'].includes(file.type),
    'Only JPEG and PNG files are allowed'
  ),
});

function FileUploadForm() {
  const form = useForm<{ file: File }>({
    resolver: zodResolver(schema),
  });

  return (
    <form>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            form.setValue('file', file);
            form.trigger('file'); // Trigger validation
          }
        }}
      />
      {form.formState.errors.file && (
        <span>{form.formState.errors.file.message}</span>
      )}
    </form>
  );
}
```

### Pattern 4: Debounced Validation

```typescript
import { useDebounce } from '@/hooks/useDebounce';

function UsernameForm() {
  const form = useForm();
  const username = form.watch('username');
  const debouncedUsername = useDebounce(username, 500);

  const { data: isAvailable } = useQuery({
    queryKey: ['username-check', debouncedUsername],
    queryFn: () => checkUsernameAvailability(debouncedUsername),
    enabled: !!debouncedUsername,
  });

  return (
    <form>
      <input {...form.register('username')} />
      {isAvailable === false && (
        <span>Username is already taken</span>
      )}
    </form>
  );
}
```

---

## Error Handling Integration

### Pattern: Backend Field Errors

```typescript
const onSubmit = async (data: FormData) => {
  try {
    await mutation.mutateAsync(data);
    toast.success('Form submitted successfully!');
  } catch (error) {
    // Automatically extracts field_errors from 422 response
    // and calls form.setError for each field
    handleError(error, {
      context: { operation: 'submitForm' },
      fieldErrorSetter: form.setError,
    });
  }
};
```

### Backend Response Format (422)

```json
{
  "success": false,
  "error": "Validation failed",
  "field_errors": {
    "email": ["Email is already registered"],
    "username": ["Username contains invalid characters"]
  }
}
```

### Automatic Field Error Mapping

```typescript
// useStandardErrorHandler automatically does this:
if (error.response?.status === 422) {
  const fieldErrors = error.response.data.field_errors;
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    form.setError(field, {
      type: 'server',
      message: messages[0], // First error message
    });
  });
}
```

---

## Component Patterns

### Pattern 1: Reusable Form Input

```typescript
import { useFormContext } from 'react-hook-form';

interface FormInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export function FormInput({
  name,
  label,
  type = 'text',
  placeholder,
}: FormInputProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        aria-invalid={!!error}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

// Usage
<FormProvider {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormInput name="email" label="Email" type="email" />
    <FormInput name="password" label="Password" type="password" />
  </form>
</FormProvider>
```

### Pattern 2: Form with Sections

```typescript
function UserProfileForm() {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <section>
          <h2>Personal Information</h2>
          <FormInput name="firstName" label="First Name" />
          <FormInput name="lastName" label="Last Name" />
        </section>

        <section>
          <h2>Contact Information</h2>
          <FormInput name="email" label="Email" type="email" />
          <FormInput name="phone" label="Phone" type="tel" />
        </section>

        <button type="submit">Save Profile</button>
      </form>
    </FormProvider>
  );
}
```

---

## Testing Forms

### Unit Test Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should validate email format', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass123!');

    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });
    });
  });
});
```

---

## Migration Guide

### From useState to React Hook Form

**Before:**

```typescript
function OldForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Manual validation
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login({ email, password });
    } catch (error) {
      // Manual error handling
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <span>{errors.email}</span>}
    </form>
  );
}
```

**After:**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Too short'),
});

function NewForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      handleError(error, { fieldErrorSetter: form.setError });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
    </form>
  );
}
```

---

## Best Practices

### Do's ✅

1. **Use Zod for validation** - Type-safe, matches backend
2. **Use zodResolver** - Integrates Zod with React Hook Form
3. **Infer types from schemas** - `type T = z.infer<typeof schema>`
4. **Use uncontrolled inputs** - Better performance (default)
5. **Provide default values** - Prevents uncontrolled → controlled warnings
6. **Use fieldErrorSetter** - Automatic backend error mapping
7. **Show loading states** - `isSubmitting` for better UX
8. **Validate on blur** - Less intrusive than onChange

### Don'ts ❌

1. **Don't use useState for form fields** - Use React Hook Form
2. **Don't manually validate** - Use Zod schemas
3. **Don't manually handle field errors** - Use `fieldErrorSetter`
4. **Don't ignore dirty state** - Warn before losing unsaved changes
5. **Don't hardcode validation messages** - Use Zod message params
6. **Don't skip accessibility** - Use labels, ARIA attributes
7. **Don't forget loading states** - Disable buttons during submission

---

## Common Patterns Quick Reference

```typescript
// Basic form
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { field: '' },
});

// Submit with error handling
const onSubmit = async (data) => {
  try {
    await mutation.mutateAsync(data);
    toast.success('Success!');
  } catch (error) {
    handleError(error, { fieldErrorSetter: form.setError });
  }
};

// Dynamic fields
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'items',
});

// Watch field value
const value = form.watch('fieldName');

// Set field value programmatically
form.setValue('fieldName', newValue);

// Trigger validation
form.trigger('fieldName');

// Reset form
form.reset();

// Check if form is valid
const isValid = form.formState.isValid;

// Check if form has been modified
const isDirty = form.formState.isDirty;
```

---

## Troubleshooting

### Issue: Validation not working

**Check:**

1. Is `zodResolver` imported and used?
2. Is schema defined correctly?
3. Are field names registered correctly?

### Issue: Field errors not showing

**Check:**

1. Is `formState.errors` accessed correctly?
2. Does error object have `message` property?
3. Is error rendering conditionally?

### Issue: Form not submitting

**Check:**

1. Is `handleSubmit` wrapper used?
2. Is button type="submit"?
3. Are there validation errors preventing submission?

---

## Support

**Questions?**

- See: `src/domains/auth/components/LoginForm.tsx` (example)
- See: `src/domains/admin/components/UserForm.tsx` (complex example)
- See: React Hook Form docs: https://react-hook-form.com/
- See: Zod docs: https://zod.dev/

---

## Version History

- **v1.0** (Nov 10, 2025) - Initial documentation
  - Established React Hook Form + Zod as standard
  - Documented all patterns and examples
  - Migration guide from useState forms
