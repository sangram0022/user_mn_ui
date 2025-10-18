# UI Enhancement Quick Reference Guide

## 🎨 Theme Token Usage Guide

### ✅ DO - Use Neutral Tokens for Surfaces

```tsx
// ✅ CORRECT - Input fields
<input
  style={{
    background: 'var(--theme-input-bg)',
    borderColor: 'var(--theme-input-border)',
    color: 'var(--theme-input-text)'
  }}
/>

// ✅ CORRECT - Cards and containers
<div
  className="card"
  // Uses --theme-card-bg automatically
/>

// ✅ CORRECT - Layout containers
<section className="layout-section">
  <div className="layout-container">
    {/* content */}
  </div>
</section>
```

### ❌ DON'T - Use Primary Color for Backgrounds

```tsx
// ❌ WRONG - Don't use primary for inputs
<input style={{ background: 'var(--theme-primary)' }} />

// ❌ WRONG - Don't use primary for cards
<div style={{ background: 'var(--theme-primary)' }}>

// ❌ WRONG - Hardcoded Tailwind colors
<input className="bg-blue-500 text-gray-900" />
```

---

## 🔘 Button Usage Guide

### Variants

```tsx
// Primary - Main CTAs (Sign Up, Submit, Save)
<Button variant="primary">Sign Up</Button>

// Secondary - Alternative actions
<Button variant="secondary">Cancel</Button>

// Outline - Secondary CTAs with less emphasis
<Button variant="outline">Learn More</Button>

// Ghost - Tertiary actions, minimal emphasis
<Button variant="ghost">Skip</Button>

// Danger - Destructive actions (Delete, Remove)
<Button variant="danger">Delete Account</Button>

// Success - Positive confirmations
<Button variant="success">Confirm</Button>
```

### Sizes

```tsx
// Small - Compact spaces, inline actions
<Button size="sm">Edit</Button>

// Medium (default) - Standard actions
<Button size="md">Submit</Button>

// Large - Hero CTAs, important actions
<Button size="lg">Get Started</Button>
```

### Modifiers

```tsx
// Full width
<Button fullWidth>Continue</Button>

// With icon
<Button icon={<ArrowRight />} iconPosition="right">
  Next Step
</Button>

// Loading state
<Button isLoading>Processing...</Button>

// Disabled
<Button disabled>Unavailable</Button>
```

---

## 📐 Layout System Guide

### Section Containers

```tsx
// Use for full-width page sections
<section className="layout-section" style={{ background: 'var(--theme-surface)' }}>
  {/* Responsive padding: 4rem (mobile) → 5rem (desktop) */}
</section>
```

### Content Containers

```tsx
// Standard width content (max-width: 80rem)
<div className="layout-container">
  {/* Centered, max-width content */}
</div>

// Narrow content - forms, articles (max-width: 42rem)
<div className="layout-narrow">
  {/* Centered, narrow content */}
</div>
```

### Complete Page Example

```tsx
const MyPage = () => (
  <div style={{ background: 'var(--theme-background)' }}>
    {/* Hero Section */}
    <section className="layout-section" style={{ background: 'var(--theme-surface)' }}>
      <div className="layout-container">
        <h1>Welcome</h1>
        <Button variant="primary" size="lg">
          Get Started
        </Button>
      </div>
    </section>

    {/* Content Section */}
    <section className="layout-section">
      <div className="layout-container">{/* Content */}</div>
    </section>

    {/* Form Section */}
    <section className="layout-section">
      <div className="layout-narrow">
        <div className="card">{/* Form content */}</div>
      </div>
    </section>
  </div>
);
```

---

## 🎯 Color Usage Guide

### When to Use Primary Color

✅ **Use Primary For:**

- Action buttons (Submit, Sign Up, Save)
- Active navigation items
- Links and clickable text
- Focus indicators (borders, rings)
- Brand elements (logo backgrounds)
- Icon containers in hero sections

❌ **DON'T Use Primary For:**

- Input field backgrounds
- Card backgrounds
- Page backgrounds
- Section backgrounds
- Table row backgrounds
- Border colors (use `--theme-border`)

### Neutral Color Hierarchy

```
--theme-background     → Page background (lightest)
--theme-surface        → Card/modal backgrounds
--theme-input-bg       → Input field backgrounds
--theme-border         → Borders and dividers
--theme-text           → Primary text
--theme-textSecondary  → Secondary text, labels
```

---

## 📝 Form Component Guide

### Using FormInput

```tsx
import { FormInput } from '@shared/ui/FormInput';
import { Mail, Lock } from 'lucide-react';

// Basic text input
<FormInput
  id="email"
  name="email"
  type="email"
  label="Email Address"
  value={email}
  onChange={handleChange}
  required
  placeholder="you@example.com"
/>

// With icon
<FormInput
  id="email"
  name="email"
  type="email"
  label="Email"
  value={email}
  onChange={handleChange}
  Icon={Mail}
  autoComplete="email"
/>

// Password with toggle
<FormInput
  id="password"
  name="password"
  type={showPassword ? 'text' : 'password'}
  label="Password"
  value={password}
  onChange={handleChange}
  Icon={Lock}
  ToggleIcon={showPassword ? <EyeOff /> : <Eye />}
  onToggle={() => setShowPassword(!showPassword)}
  helperTextContent="Must be at least 8 characters"
/>
```

---

## 🎨 Card Component Guide

```tsx
// Basic card
<div className="card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

// Card with hover effect (automatic)
<article className="card">
  {/* Hover adds elevated shadow */}
</article>

// Feature card pattern
<article className="card text-center hover:-translate-y-1">
  <div
    className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6"
    style={{ background: 'var(--theme-primary)' }}
  >
    <Icon className="w-8 h-8 text-white" />
  </div>
  <h3 style={{ color: 'var(--theme-text)' }}>Feature Title</h3>
  <p style={{ color: 'var(--theme-textSecondary)' }}>Description</p>
</article>
```

---

## 🎭 Common Patterns

### Hero Section

```tsx
<section
  className="layout-section"
  style={{
    background: 'var(--theme-surface)',
    borderBottom: '1px solid var(--theme-border)',
  }}
>
  <div className="layout-container text-center">
    <h1 className="text-4xl md:text-6xl font-bold mb-6">Your Headline</h1>
    <p className="text-xl mb-10" style={{ color: 'var(--theme-textSecondary)' }}>
      Descriptive subtitle text
    </p>
    <div className="flex gap-4 justify-center">
      <Button variant="primary" size="lg">
        Primary CTA
      </Button>
      <Button variant="outline" size="lg">
        Secondary CTA
      </Button>
    </div>
  </div>
</section>
```

### Feature Grid

```tsx
<section className="layout-section">
  <div className="layout-container">
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <article key={feature.id} className="card text-center hover:-translate-y-1">
          {/* Feature content */}
        </article>
      ))}
    </div>
  </div>
</section>
```

### Form Container

```tsx
<div className="layout-narrow py-8">
  <div className="text-center mb-8">
    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
      Form Title
    </h2>
    <p style={{ color: 'var(--theme-textSecondary)' }}>Subtitle</p>
  </div>

  <div className="card">
    <form className="flex flex-col gap-6">{/* Form fields */}</form>
  </div>
</div>
```

---

## 🚀 Quick Migration Checklist

When updating a component:

- [ ] Replace hardcoded `bg-blue-*` with appropriate theme tokens
- [ ] Use `layout-section` for sections instead of custom padding
- [ ] Use `layout-container` or `layout-narrow` for content
- [ ] Replace custom cards with `.card` class
- [ ] Use `Button` component with proper variant
- [ ] Use `FormInput` component instead of raw inputs
- [ ] Apply theme variables via inline styles or CSS custom properties
- [ ] Remove hardcoded Tailwind gray colors
- [ ] Ensure proper spacing with gap utilities (gap-4, gap-6, gap-8)
- [ ] Test with different themes to ensure colors adapt

---

## 🎯 Golden Rules

1. **Primary color = Actions only** (buttons, links, active states)
2. **Neutral colors = Surfaces** (inputs, cards, backgrounds)
3. **Use layout utilities** (layout-section, layout-container, layout-narrow)
4. **Use component classes** (card, btn, btn-outline)
5. **Theme variables everywhere** (--theme-text, --theme-surface, etc.)
6. **Consistent spacing** (4rem sections, 1.5rem cards, 0.75rem inputs)
7. **Test all themes** (ocean, forest, sunset, midnight, etc.)

---

## 📚 Token Reference

### Complete Token List

```css
/* Layout */
--theme-background
--theme-surface
--theme-border

/* Text */
--theme-text
--theme-textSecondary

/* Brand */
--theme-primary
--theme-secondary
--theme-accent
--theme-gradient

/* Inputs (New!) */
--theme-input-bg
--theme-input-border
--theme-input-text
--theme-input-placeholder

/* Cards (New!) */
--theme-card-bg
--theme-neutral-bg
--theme-neutral-surface

/* Focus (New!) */
--theme-focus-ring
--theme-focus-border
```

---

## ✅ Best Practices

### Typography

```tsx
// Headings - use theme-text
<h1 style={{ color: 'var(--theme-text)' }}>Heading</h1>

// Secondary text - use theme-textSecondary
<p style={{ color: 'var(--theme-textSecondary)' }}>Description</p>
```

### Spacing

```tsx
// Section spacing
className = 'layout-section'; // → py-16 (mobile), py-20 (desktop)

// Card spacing
className = 'card'; // → p-6 (1.5rem)

// Form gaps
className = 'flex flex-col gap-6'; // → 1.5rem between fields
```

### Colors

```tsx
// Backgrounds
style={{ background: 'var(--theme-surface)' }}

// Borders
style={{ borderColor: 'var(--theme-border)' }}

// Gradients
style={{ backgroundImage: 'var(--theme-gradient)' }}
```

---

**Remember:** When in doubt, check `UI_ENHANCEMENT_SUMMARY.md` for detailed explanations!
