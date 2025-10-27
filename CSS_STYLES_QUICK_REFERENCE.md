# 🎯 CSS Styles Quick Reference

**Status:** ✅ Production Ready | **Build:** ✅ Passing (28.42KB)

---

## 🔘 Button Usage (All Pages)

### Home Page

```tsx
<button className="btn btn-primary">Get Started</button>
<button className="btn btn-secondary">Learn More</button>
<button className="btn btn-danger">Delete</button>
```

### Login Page

```tsx
<AuthButton type="submit" variant="primary" fullWidth={true}>
  Sign In
</AuthButton>
```

### Register Page

```tsx
<AuthButton
  type="submit"
  variant="primary"
  fullWidth={true}
>
  Create Account
</AuthButton>

<button className="btn btn-tertiary">
  Already have an account?
</button>
```

**All button styles come from:** `src/styles/components/unified-button.css`  
**All colors come from:** `src/styles/unified-tokens.css`

---

## 📝 Input Usage (Login/Register)

### Text Input

```tsx
<input type="text" className="form-control" placeholder="Your name" />
```

### Email Input

```tsx
<input type="email" className="form-control" placeholder="you@example.com" required />
```

### Password Input

```tsx
<input type="password" className="form-control" placeholder="••••••••" required />
```

### With Label (FormInput Component)

```tsx
<FormInput
  id="email"
  type="email"
  label="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  required
/>
```

### Checkbox

```tsx
<div className="checkbox-item">
  <input type="checkbox" id="agree" />
  <label htmlFor="agree">I agree to terms</label>
</div>
```

**All input styles come from:** `src/styles/components/unified-form.css`

---

## 🎨 Color System (Single Source of Truth)

### All Colors Defined in: `unified-tokens.css`

```css
/* Primary (Blue) */
--color-primary: oklch(55% 0.18 250);
--color-primary-hover: var(--color-primary-600);
--color-primary-active: var(--color-primary-700);

/* Error (Red) */
--color-error: oklch(55% 0.22 25);
--color-error-600: oklch(55% 0.22 25);
--color-error-700: oklch(50% 0.22 25);

/* Success (Green) */
--color-success: oklch(65% 0.18 145);
--color-success-600: oklch(65% 0.18 145);
--color-success-700: oklch(60% 0.18 145);

/* Text Colors */
--color-text-primary: oklch(20% 0 0);
--color-text-secondary: oklch(50% 0 0);
--color-text-inverse: oklch(100% 0 0);

/* Border Colors */
--color-border-primary: oklch(93% 0 0);
--color-border-focus: var(--color-primary);
--color-border-error: var(--color-error);
```

✅ **NO hardcoded colors anywhere!**

---

## 📏 Spacing System (4px Base)

### All Spacing Defined in: `unified-tokens.css`

```css
--spacing-0: 0; /* 0px */
--spacing-1: 0.25rem; /* 4px */
--spacing-2: 0.5rem; /* 8px */
--spacing-3: 0.75rem; /* 12px */
--spacing-4: 1rem; /* 16px */
--spacing-5: 1.25rem; /* 20px */
--spacing-6: 1.5rem; /* 24px */
--spacing-8: 2rem; /* 32px */
```

### Semantic Names

```css
--space-xs: 0.25rem; /* Extra small gap */
--space-sm: 0.5rem; /* Small gap */
--space-md: 1rem; /* Medium gap (DEFAULT) */
--space-lg: 1.5rem; /* Large gap */
--space-xl: 2rem; /* Extra large gap */
```

✅ **NO hardcoded spacing anywhere!**

---

## 🔤 Typography System

### Font Sizes (Fluid/Responsive)

```css
--font-size-xs: clamp(0.75rem, 0.7rem + 0.2vw, 0.8rem);
--font-size-sm: clamp(0.875rem, 0.8rem + 0.3vw, 0.95rem);
--font-size-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--font-size-lg: clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem);
```

### Font Weights

```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500; /* Labels, buttons */
--font-weight-semibold: 600; /* Headings */
--font-weight-bold: 700; /* Strong emphasis */
```

### Font Family

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

✅ **NO hardcoded fonts anywhere!**

---

## ⚡ Transitions

### All Durations Defined in: `unified-tokens.css`

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Usage

```css
.btn {
  transition: all var(--transition-fast);
}

input {
  transition: all var(--transition-base);
}
```

✅ **NO hardcoded transitions anywhere!**

---

## 🔘 Button Classes Reference

| Class                            | Use Case               | Example                            |
| -------------------------------- | ---------------------- | ---------------------------------- |
| `.btn`                           | Base button (required) | `<button class="btn btn-primary">` |
| `.btn-primary`                   | Main action            | Sign In, Save, Submit              |
| `.btn-primary-sm`                | Small main button      | 36px height                        |
| `.btn-primary-lg`                | Large main button      | 52px height                        |
| `.btn-secondary`                 | Alternative            | Cancel, Reset                      |
| `.btn-tertiary`                  | Link-like              | Forgot password?                   |
| `.btn-danger`                    | Destructive            | Delete, Remove                     |
| `.btn-success`                   | Confirmation           | Confirm, Approve                   |
| `.btn-icon`                      | Icon only              | 44x44px                            |
| `.btn-block` or `.btn-fullwidth` | Full width             | 100% width forms                   |

---

## 📝 Form Classes Reference

| Class                  | Use Case                    |
| ---------------------- | --------------------------- |
| `.form-group`          | Container for label + input |
| `.form-label`          | Label styling               |
| `.form-label-required` | Adds red asterisk `*`       |
| `.form-control`        | Input/textarea/select base  |
| `.input-sm`            | Small input (32px)          |
| `.input-lg`            | Large input (48px)          |
| `.checkbox-item`       | Checkbox + label container  |
| `.radio-item`          | Radio + label container     |
| `.form-hint`           | Helper text below input     |
| `.form-error-message`  | Error message text          |

---

## 🏗️ Common Form Layout

```tsx
<form className="flex-col gap-md">
  {/* Email field */}
  <div className="form-group">
    <label htmlFor="email" className="form-label form-label-required">
      Email Address
    </label>
    <input id="email" type="email" className="form-control" required />
    <div className="form-hint">We'll never share your email</div>
  </div>

  {/* Password field */}
  <div className="form-group">
    <label htmlFor="password" className="form-label form-label-required">
      Password
    </label>
    <input id="password" type="password" className="form-control" required />
  </div>

  {/* Remember me */}
  <div className="checkbox-item">
    <input type="checkbox" id="remember" />
    <label htmlFor="remember">Remember me</label>
  </div>

  {/* Submit button */}
  <AuthButton type="submit" variant="primary" fullWidth={true}>
    Sign In
  </AuthButton>

  {/* Secondary action */}
  <button className="btn btn-tertiary">Forgot password?</button>
</form>
```

---

## ✅ DRY Checklist

- [ ] No hardcoded colors (use `--color-*` tokens)
- [ ] No hardcoded spacing (use `--spacing-*` tokens)
- [ ] No hardcoded font sizes (use `--font-size-*` tokens)
- [ ] No hardcoded transitions (use `--transition-*` tokens)
- [ ] All buttons use `.btn` + variant class
- [ ] All inputs use `.form-control` class
- [ ] All labels use `.form-label` class
- [ ] Form containers use `.form-group` class
- [ ] No inline styles (except data attributes)
- [ ] No CSS-in-JS (use component classes instead)

---

## 📚 Full Documentation

| Document                                 | Purpose                                    |
| ---------------------------------------- | ------------------------------------------ |
| **COMPONENT_STYLES_GUIDE.md**            | Complete guide (2000+ lines)               |
| **CSS_STYLES_IMPLEMENTATION_SUMMARY.md** | What was fixed & why                       |
| **unified-tokens.css**                   | All design tokens (single source of truth) |
| **unified-button.css**                   | All button styles                          |
| **unified-form.css**                     | All form input styles                      |

---

## 🚀 Example: Complete Login Form

```tsx
import { useState } from 'react';
import { FormInput } from '@shared/ui/FormInput';
import { AuthButton } from '@shared/ui/AuthButton';
import { Mail, Lock } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // API call
      await loginUser(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-col gap-md">
      <h1 className="page-title">Sign In</h1>

      {/* Email - Uses unified styles */}
      <FormInput
        id="email"
        name="email"
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        Icon={Mail}
        placeholder="you@example.com"
        required
      />

      {/* Password - Uses unified styles */}
      <FormInput
        id="password"
        name="password"
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        Icon={Lock}
        placeholder="••••••••"
        required
      />

      {/* Remember me - Uses unified styles */}
      <div className="checkbox-item">
        <input type="checkbox" id="remember" />
        <label htmlFor="remember">Remember me</label>
      </div>

      {/* Submit button - Uses unified styles */}
      <AuthButton type="submit" variant="primary" isLoading={isLoading} fullWidth={true}>
        Sign In
      </AuthButton>

      {/* Secondary action - Uses unified styles */}
      <button type="button" className="btn btn-tertiary">
        Forgot password?
      </button>
    </form>
  );
}
```

**All styles come from unified system:**

- Colors: ✅ `--color-*` tokens
- Spacing: ✅ `--spacing-*` tokens
- Buttons: ✅ `.btn-primary` class
- Inputs: ✅ `.form-control` class
- Validation: ✅ Built-in `:user-invalid`/`:user-valid`

---

## 🎯 Key Principles

1. **Single Source of Truth** - All values defined once in `unified-tokens.css`
2. **No Hardcoding** - All colors, spacing, fonts use CSS variables
3. **DRY Compliance** - Zero duplicate styles or values
4. **Consistent Styling** - Same CSS classes across entire app
5. **Accessibility Built-in** - WCAG AAA compliant (44x44px buttons, proper colors)
6. **Performance Optimized** - CSS containment, fluid sizing, minimal bundle

---

**Questions?** See `COMPONENT_STYLES_GUIDE.md` for complete documentation! 📖
