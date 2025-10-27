# CSS Architecture Documentation

## 📚 Table of Contents

1. [Variable Naming Conventions](#variable-naming-conventions)
2. [File Organization](#file-organization)
3. [When to Use Utilities vs Custom CSS](#when-to-use-utilities-vs-custom-css)
4. [Component Styling Guide](#component-styling-guide)
5. [Responsive Design Patterns](#responsive-design-patterns)
6. [Animation Guidelines](#animation-guidelines)
7. [Shadow System](#shadow-system)
8. [Migration Guides](#migration-guides)

---

## Variable Naming Conventions

### Hierarchy

Our CSS variables follow a three-tier system:

```
Primitives → Semantic → Component
```

### Naming Pattern

```css
--{category}-{element}-{variant}-{state}
```

### Examples

#### Colors

```css
/* Primitives - Raw color values */
--color-blue-500: oklch(58% 0.2 255);
--color-gray-100: oklch(97% 0 0);

/* Semantic - Meaning-based */
--color-primary: var(--color-blue-500);
--color-surface-elevated: var(--color-gray-100);

/* Component - Specific use */
--button-bg-primary: var(--color-primary);
--input-border: var(--color-border-default);
```

#### Spacing

```css
/* Primitives */
--space-1: 0.25rem; /* 4px */
--space-4: 1rem; /* 16px */

/* Semantic */
--space-component-gap: var(--space-4);
--space-section-vertical: 5rem;

/* Component */
--button-padding-x: 2rem;
--input-padding-x: 1rem;
```

---

## File Organization

### Directory Structure

```
src/styles/
├── index-new.css              # Main entry point
├── design-system.css          # Core design tokens
├── form-overrides.css         # Form-specific overrides
│
├── tokens/                    # Design tokens (primitives)
│   ├── colors.css
│   ├── spacing.css
│   ├── typography.css
│   └── shadows.css
│
├── components/                # Component-specific styles
│   ├── unified-form.css
│   ├── unified-button.css
│   ├── modal.css
│   └── toast.css
│
└── utilities/                 # Utility classes
    ├── icon-sizes.css
    ├── responsive-spacing.css
    ├── animations.css
    └── shadows.css
```

### Import Order (Critical!)

```css
1. Tailwind base
2. Theme files (colors, tokens)
3. Design system (layouts, components)
4. Component CSS files
5. Utility classes
6. Form overrides (MUST BE LAST)
```

**Why this matters:**

- CSS cascade depends on order
- Later imports override earlier ones
- Form overrides come last to ensure proper specificity

---

## When to Use Utilities vs Custom CSS

### ✅ Use Utility Classes When:

1. **One-off styling needs**

   ```tsx
   <div className="flex items-center gap-4">
   ```

2. **Standard spacing/sizing**

   ```tsx
   <button className="px-responsive py-responsive">
   ```

3. **Responsive variants**

   ```tsx
   <Icon className="icon-responsive-sm" />
   ```

4. **Common patterns**
   ```tsx
   <div className="shadow-card rounded-lg">
   ```

### ✅ Use Custom CSS Classes When:

1. **Reusable component patterns**

   ```css
   .stats-card {
     background: var(--color-surface-elevated);
     padding: 1.5rem;
     border-radius: var(--radius-lg);
   }
   ```

2. **Complex state management**

   ```css
   .button-primary:hover:not(:disabled) {
     background: var(--color-brand-primary-hover);
     transform: translateY(-1px);
   }
   ```

3. **Component-specific behavior**
   ```css
   .modal-container {
     position: fixed;
     inset: 0;
     z-index: var(--z-modal);
   }
   ```

### ❌ Avoid:

1. **@apply directive** (deprecated in Tailwind v4)
2. **Inline styles** (except for dynamic values)
3. **Hardcoded colors** (use CSS variables)
4. **Magic numbers** (use design tokens)

---

## Component Styling Guide

### Button Pattern

```tsx
// ✅ Good - Using utility classes + CSS class
<button className="btn-primary px-responsive">Click me</button>
```

```css
/* CSS */
.btn-primary {
  background: var(--color-brand-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}
```

### Card Pattern

```tsx
// ✅ Good - Semantic class + utilities
<div className="stats-card shadow-card">
  <div className="stats-card-value">1,234</div>
  <div className="stats-card-label">Total Users</div>
</div>
```

### Form Pattern

```tsx
// ✅ Good - Using form system
<div className="form-group">
  <label className="form-label">Email</label>
  <input type="email" className="form-input" />
</div>
```

---

## Responsive Design Patterns

### Mobile-First Approach

Always start with mobile styles, then add desktop:

```css
/* ✅ Good - Mobile first */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* ❌ Bad - Desktop first */
.container {
  padding: 2rem;
}

@media (max-width: 767px) {
  .container {
    padding: 1rem;
  }
}
```

### Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */

@media (min-width: 768px) {
  /* Tablet+ */
}
@media (min-width: 1024px) {
  /* Desktop+ */
}
```

### Utility Classes

```tsx
// Use responsive utility classes
<div className="p-responsive gap-responsive">
  <Icon className="icon-responsive-sm" />
  <span className="text-responsive-base">Hello</span>
</div>
```

---

## Animation Guidelines

### When to Animate

- ✅ Modal entrance/exit
- ✅ Dropdown menus
- ✅ Toast notifications
- ✅ Loading states
- ✅ Hover feedback

### Performance Tips

1. **Use transform and opacity** (GPU accelerated)

   ```css
   /* ✅ Good */
   transform: translateY(10px);
   opacity: 0;

   /* ❌ Bad */
   top: 10px;
   display: none;
   ```

2. **Respect user preferences**

   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
     }
   }
   ```

3. **Keep animations short** (150-300ms)

### Available Animations

```tsx
// Entrance animations
<div className="animate-fade-in">
<div className="animate-slide-up">
<div className="animate-scale-in">

// Loading animations
<div className="animate-spin-slow">
<div className="animate-shimmer">
<div className="animate-pulse-soft">

// Interaction feedback
<div className="animate-shake">        // Errors
<div className="animate-bounce-subtle"> // Attention
```

---

## Shadow System

### Elevation Hierarchy

```
Level 0: shadow-none      → Flat elements
Level 1: shadow-subtle    → Minimal separation
Level 2: shadow-card      → Default cards
Level 3: shadow-elevated  → Active states
Level 4: shadow-float     → Dropdowns
Level 5: shadow-modal     → Modals
Level 6: shadow-maximum   → Toasts
```

### Usage Examples

```tsx
// Static card
<div className="shadow-card">

// Interactive card
<div className="shadow-hover-card">

// Dropdown menu
<div className="shadow-float">

// Modal dialog
<div className="shadow-modal">

// Button hover (with color)
<button className="hover:shadow-primary">

// Input focus
<input className="focus:shadow-focus">
```

---

## Migration Guides

### From Inline Classes to Utilities

#### Icons

```tsx
// Before
<Icon className="h-4 w-4" />
<Icon className="h-3 w-3 max-md:h-5 max-md:w-5" />

// After
<Icon className="icon-sm" />
<Icon className="icon-responsive-xs" />
```

#### Spacing

```tsx
// Before
<div className="p-4 md:p-6 lg:p-8">
<div className="mb-4 md:mb-6 lg:mb-8">

// After
<div className="p-responsive">
<div className="mb-responsive">
```

#### Shadows

```tsx
// Before
<div className="shadow-sm hover:shadow-md">

// After
<div className="shadow-hover-card">
```

### From @apply to Pure CSS

```css
/* Before */
.card {
  @apply bg-white rounded-lg shadow-sm border p-6;
}

/* After */
.card {
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow-flat);
  border: 1px solid var(--color-border-card);
  padding: 1.5rem;
}
```

---

## Best Practices Summary

### DO ✅

- Use CSS variables for colors and spacing
- Follow mobile-first responsive design
- Use semantic class names
- Keep animations short and purposeful
- Respect `prefers-reduced-motion`
- Document complex CSS patterns
- Use utility classes for one-off styling

### DON'T ❌

- Use @apply directive
- Hardcode colors or spacing values
- Create desktop-first media queries
- Animate properties that cause reflow
- Duplicate CSS across files
- Mix inline styles with CSS classes
- Ignore accessibility considerations

---

## Quick Reference

### Common Patterns

```tsx
// Page layout
<div className="page-wrapper">
  <div className="container-full">
    <div className="page-header">
      <h1 className="page-title">Title</h1>
    </div>
  </div>
</div>

// Card with content
<div className="stats-card shadow-card">
  <div className="flex-between mb-responsive">
    <span className="stats-card-label">Label</span>
    <Icon className="icon-md icon-primary" />
  </div>
  <div className="stats-card-value">Value</div>
</div>

// Modal structure
<div className="modal-container animate-fade-in">
  <div className="modal-content animate-scale-in shadow-modal">
    <div className="modal-header">Header</div>
    <div className="modal-body">Content</div>
    <div className="modal-footer">
      <button className="btn-primary">Action</button>
    </div>
  </div>
</div>

// Form group
<div className="form-group">
  <label className="form-label">Label</label>
  <input type="text" className="form-input" />
  <span className="form-helper">Helper text</span>
</div>
```

---

## Questions?

For issues or suggestions, please refer to:

- Design system files in `src/styles/`
- Component examples in Storybook
- Copilot instructions in `.github/copilot-instructions.md`
