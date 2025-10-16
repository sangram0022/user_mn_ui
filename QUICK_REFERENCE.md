# CSS/UI Quick Reference Card

## 🚀 Quick Start (30 seconds)

```typescript
// 1. Update main.tsx
import './styles/index-new.css';

// 2. Use new Button
import { Button } from '@shared/components/ui/Button/Button';
```

---

## 📐 Layout Compositions

```tsx
// Vertical spacing
<div className="stack" data-gap="md">

// Horizontal wrapping
<div className="cluster" data-gap="sm" data-align="between">

// Responsive grid
<div className="auto-grid" data-gap="md" data-columns="3">

// Max-width container
<div className="container" data-size="xl">

// Sidebar layout
<div className="with-sidebar">

// Centered content
<div className="center" data-text>
```

**Gaps**: `xs` `sm` `md` `lg` `xl`  
**Sizes**: `sm` `md` `lg` `xl` `2xl` `full`  
**Align**: `start` `center` `end` `between`

---

## 🎨 Design Tokens

### Colors (RGB format)

```css
/* Background */
background: rgb(var(--color-background-elevated));

/* Text */
color: rgb(var(--color-text-primary));

/* With opacity */
background: rgb(var(--color-gray-900) / 0.75);

/* States */
color: rgb(var(--color-success-solid));
color: rgb(var(--color-error-solid));
color: rgb(var(--color-warning-solid));
```

### Spacing

```css
padding: var(--spacing-component-md);
gap: var(--spacing-layout-lg);
margin: var(--space-4);
```

### Typography

```css
font-size: var(--font-size-base);
font-weight: var(--font-weight-semibold);
line-height: var(--line-height-normal);
```

---

## 🔘 Button Component

```tsx
import { Button, ButtonGroup, IconButton } from '@shared/components/ui/Button/Button';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button isLoading>Loading...</Button>
<Button disabled>Disabled</Button>

// Polymorphic
<Button as="a" href="/page">Link</Button>
<Button as={Link} to="/page">Router Link</Button>

// Icon button
<IconButton icon={<Icon />} aria-label="Label" />

// Button group
<ButtonGroup attached>
  <Button>Left</Button>
  <Button>Middle</Button>
  <Button>Right</Button>
</ButtonGroup>
```

---

## 🎭 Data Attributes for States

```tsx
// Loading
<div data-loading={isLoading || undefined}>

// Disabled
<div data-disabled={isDisabled || undefined}>

// Variants
<div data-variant="success">

// Sizes
<div data-size="lg">

// Custom
<div data-progress={progress}>
```

```css
/* In CSS */
[data-loading] {
  opacity: 0.6;
}
[data-disabled] {
  pointer-events: none;
}
[data-variant='success'] {
  color: green;
}
```

---

## 🌓 Dark Mode

### Automatic (via tokens)

```css
.my-component {
  background: rgb(var(--color-background-elevated));
  color: rgb(var(--color-text-primary));
}
/* Automatically switches! */
```

### Manual dark mode styles

```css
[data-theme='dark'] .my-component {
  /* Dark mode override */
}
```

---

## 📦 Component CSS Classes

### Button

```css
.btn .btn-primary .btn-secondary .btn-outline
.btn-danger .btn-success .btn-ghost .btn-link
.btn-sm .btn-md .btn-lg .btn-block .btn-icon
```

### Card

```css
.card .card-header .card-body .card-footer
```

### Toast

```css
.toast-container .toast .toast-progress .toast-progress-bar
```

### Form

```css
.form-input
```

---

## 🎨 CSS Layers

```css
@layer reset, base, tokens, layouts, components, utilities, overrides;

/* High priority override */
@layer overrides {
  .special {
    /* ... */
  }
}
```

---

## 🔧 Common Patterns

### Replace inline style

```tsx
// ❌ Before
<div style={{ padding: '1rem', background: '#fff' }}>

// ✅ After
<div className="box" data-padding="md">
```

### Dynamic values

```tsx
// ❌ Before
<div style={{ width: `${percentage}%` }}>

// ✅ After
<div style={{ '--width': `${percentage}%` }}>
```

```css
.progress {
  width: var(--width);
}
```

### Conditional styles

```tsx
// ❌ Before
<div style={{ opacity: isActive ? 1 : 0.5 }}>

// ✅ After
<div data-active={isActive || undefined}>
```

```css
[data-active] {
  opacity: 1;
}
:not([data-active]) {
  opacity: 0.5;
}
```

---

## 📏 Responsive

```css
/* Mobile-first */
.my-class {
  padding: var(--space-2);
}

@media (min-width: 640px) {
  .my-class {
    padding: var(--space-4);
  }
}

@media (min-width: 1024px) {
  .my-class {
    padding: var(--space-8);
  }
}
```

---

## ♿ Accessibility

```css
/* Focus ring */
*:focus-visible {
  outline: 2px solid rgb(var(--color-focus-ring));
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
  }
}

/* Touch target */
.btn {
  min-height: var(--touch-target-min-size);
}
```

---

## 🎯 Token Categories

### Primitive

```css
--color-blue-500
--space-4
--font-size-base
```

### Semantic

```css
--color-brand-primary
--spacing-component-md
--text-body-base
```

### Component

```css
--button-primary-bg
--card-padding
--modal-shadow
```

---

## 🚨 Avoiding Common Mistakes

### ❌ Don't

```css
/* Hardcoded values */
.btn { background: #3b82f6; }

/* Inline styles */
<div style={{ color: 'red' }}>

/* Scattered responsive */
<div style={{ padding: isMobile ? '0.5rem' : '1rem' }}>
```

### ✅ Do

```css
/* Use tokens */
.btn { background: rgb(var(--color-brand-primary)); }

/* Use classes */
<div className="text-error">

/* Use compositions */
<div className="box" data-padding="md">
```

---

## 📚 Documentation

- **css_ui1.md** - Full analysis (498 lines)
- **IMPLEMENTATION_SUMMARY.md** - Overview (350 lines)
- **MIGRATION_GUIDE.md** - Step-by-step (510 lines)
- **EXECUTIVE_SUMMARY.md** - Business case (450 lines)
- **DashboardExample.tsx** - Working example (180 lines)

---

## 🆘 Need Help?

1. Check MIGRATION_GUIDE.md for patterns
2. See DashboardExample.tsx for real usage
3. Review design tokens in src/styles/tokens/
4. Ask team for support

---

## ⚡ Performance Tips

- ✅ Use compositions over custom CSS
- ✅ Leverage CSS layers
- ✅ Use data attributes for states
- ✅ Batch style changes
- ✅ Use token system

---

**Last Updated**: October 15, 2025  
**Version**: 1.0  
**Status**: Production Ready
