# DRY Components Quick Reference

## 🚀 Quick Start

Import reusable components instead of duplicating code:

```tsx
import { 
  LoadingSpinner, 
  LoadingFallback, 
  SkeletonCard, 
  SkeletonText 
} from '@/components';

import { validators } from '@/shared/utils/validation';
```

---

## 🎨 Loading States

### Full Screen Loading
```tsx
// Replace inline loading divs with:
<LoadingFallback />
```

### Sized Spinners
```tsx
<LoadingSpinner size="sm" />   // 16px (h-4 w-4)
<LoadingSpinner size="md" />   // 32px (h-8 w-8) - default
<LoadingSpinner size="lg" />   // 48px (h-12 w-12)
<LoadingSpinner size="xl" />   // 64px (h-16 w-16)
```

### With Custom Text
```tsx
<LoadingSpinner text="Loading users..." />
```

### Inline Spinner
```tsx
<button disabled>
  <InlineSpinner text="Saving..." />
</button>
```

---

## 💀 Skeleton Screens

### Text Skeleton
```tsx
// Replace 3 duplicate skeleton divs with:
<SkeletonText lines={3} />

// Single line:
<SkeletonLine />
<SkeletonLine width="w-3/4" />
```

### Card Skeleton
```tsx
// Replace entire card skeleton structure:
<SkeletonCard />
```

### Avatar Skeleton
```tsx
<SkeletonAvatar size="sm" />  // 32px
<SkeletonAvatar size="md" />  // 48px
<SkeletonAvatar size="lg" />  // 64px
```

### Button Skeleton
```tsx
<SkeletonButton />
```

---

## ✅ Form Validation

### Single Field Validation

```tsx
const handleValidate = () => {
  // Email
  const emailError = validators.email(formData.email);
  if (emailError) setErrors({ ...errors, email: emailError });
  
  // Password
  const pwdError = validators.password(formData.password);
  if (pwdError) setErrors({ ...errors, password: pwdError });
  
  // Confirm Password
  const confirmError = validators.confirmPassword(
    formData.password, 
    formData.confirmPassword
  );
  if (confirmError) setErrors({ ...errors, confirmPassword: confirmError });
};
```

### Available Validators

| Validator | Usage | Description |
|-----------|-------|-------------|
| `email` | `validators.email(value)` | RFC 5322 email validation |
| `password` | `validators.password(value)` | Min 8 characters |
| `passwordStrong` | `validators.passwordStrong(value)` | Strong password (upper, lower, number, special) |
| `confirmPassword` | `validators.confirmPassword(pwd, confirm)` | Password matching |
| `required` | `validators.required(value, 'Name')` | Non-empty field |
| `minLength` | `validators.minLength(value, 3, 'Username')` | Min length check |
| `maxLength` | `validators.maxLength(value, 50, 'Bio')` | Max length check |
| `phone` | `validators.phone(value)` | US phone format |
| `url` | `validators.url(value)` | Valid URL |
| `number` | `validators.number(value)` | Numeric value |
| `range` | `validators.range(value, 1, 100, 'Age')` | Number in range |
| `username` | `validators.username(value)` | Alphanumeric + underscore |
| `zipCode` | `validators.zipCode(value)` | US zip code |

### Generic Form Validation

```tsx
import { validateForm } from '@/shared/utils/validation';

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  const validationErrors = validateForm(formData, {
    email: validators.email,
    password: validators.passwordStrong,
    confirmPassword: (value) => validators.confirmPassword(formData.password, value),
    username: validators.username,
  });
  
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  // Proceed with form submission
};
```

---

## 🎯 Before & After Examples

### Loading Spinner

❌ **BEFORE** (Duplicate code):
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
```

✅ **AFTER** (Reusable component):
```tsx
<LoadingSpinner size="md" />
```

---

### Skeleton Screen

❌ **BEFORE** (Duplicate code):
```tsx
<div className="space-y-3">
  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
</div>
```

✅ **AFTER** (Reusable component):
```tsx
<SkeletonText lines={3} />
```

---

### Email Validation

❌ **BEFORE** (Duplicate validation):
```tsx
if (!formData.email) {
  newErrors.email = 'Email is required';
} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
  newErrors.email = 'Email is invalid';
}
```

✅ **AFTER** (Centralized validator):
```tsx
const emailError = validators.email(formData.email);
if (emailError) newErrors.email = emailError;
```

---

## 📦 Component Locations

```
src/
├── shared/
│   ├── components/
│   │   ├── LoadingSpinner.tsx    // All loading states
│   │   └── SkeletonLoader.tsx    // All skeleton screens
│   └── utils/
│       └── validation.ts          // All form validators
└── components/
    └── index.ts                   // Barrel exports (use this!)
```

---

## 🚫 Don't Repeat Yourself

### ❌ DON'T DO THIS:
```tsx
// Creating inline loading spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

// Creating inline skeleton
<div className="h-4 bg-gray-200 rounded animate-pulse"></div>

// Creating inline email validation
if (!/\S+@\S+\.\S+/.test(email)) { /* ... */ }
```

### ✅ DO THIS INSTEAD:
```tsx
// Import and reuse
import { LoadingSpinner, SkeletonText } from '@/components';
import { validators } from '@/shared/utils/validation';

<LoadingSpinner />
<SkeletonText lines={3} />
validators.email(email)
```

---

## 🎓 Benefits

- ✅ **Less Code:** No need to write duplicate loading/skeleton/validation logic
- ✅ **Consistency:** Same UI patterns throughout the app
- ✅ **Maintainability:** Fix once, applies everywhere
- ✅ **Accessibility:** Built-in ARIA labels
- ✅ **Dark Mode:** Automatic support
- ✅ **Type Safety:** Full TypeScript support

---

## 📚 Full Documentation

See `DRY_REFACTORING_COMPLETE.md` for complete details on:
- All component props and variants
- Implementation details
- Refactoring impact metrics
- Best practices applied

---

**Questions?** Check the reference pages:
- UI Elements: `/reference/ui-elements`
- Form Patterns: `/reference/form-patterns`
- Component Patterns: `/reference/component-patterns`
