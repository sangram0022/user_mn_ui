# Unified Light Theme - Implementation Guide

## Overview

This document describes the new **Unified Light Theme System** - a professional, modern light-only theme that consolidates all CSS into a single, maintainable source of truth.

**Status**: Phase 1 Complete - Design System Created

## What Changed

### Removed (Old System)

- ❌ Dark theme support (`dark-theme.css`)
- ❌ Theme switching logic (`ThemeSwitcher.tsx`)
- ❌ Multiple theme token files (primitives, semantic, component-tokens)
- ❌ CSS custom properties for theme variations
- ❌ Complexity of managing multiple themes

### Added (New System)

- ✅ **Unified Light Theme** (`unified-theme.css`) - Single design system with all CSS variables
- ✅ **Unified Typography** (`unified-typography.css`) - Consistent font sizing and hierarchy
- ✅ **Unified Form Components** (`unified-form.css`) - Standardized inputs, checkboxes, radios (checkbox size fixed!)
- ✅ **Unified Button System** (`unified-button.css`) - All button variations from one system
- ✅ **Unified Containers** (`unified-container.css`) - Cards, panels, grids, stacks
- ✅ **Centralized CSS Index** (`index.css`) - Single entry point for all styles

## Color Palette

### Professional Light Theme

**Primary Colors**

- Primary: `#0066cc` (Blue - Professional & Trustworthy)
- Primary Hover: `#0052a3`
- Primary Active: `#003d7a`
- Primary Light: `#e6f0ff`

**Semantic Colors**

```css
--color-success: #22c55e /* Green */ --color-warning: #f59e0b /* Amber */ --color-error: #ef4444
  /* Red */ --color-info: #3b82f6 /* Blue */;
```

**Neutral Grays** (9-level hierarchy for precise UI)

```css
--color-gray-50: #fafafa --color-gray-100: #f3f4f6 --color-gray-200: #e5e7eb
  --color-gray-300: #d1d5db --color-gray-400: #9ca3af --color-gray-500: #6b7280
  --color-gray-600: #4b5563 --color-gray-700: #374151 --color-gray-800: #1f2937
  --color-gray-900: #111827;
```

**Text Colors** (Semantic hierarchy)

```css
--color-text-primary: #111827 /* Main text */ --color-text-secondary: #4b5563 /* Secondary text */
  --color-text-tertiary: #9ca3af /* Hints */ --color-text-inverse: #ffffff /* On dark backgrounds */
  --color-text-disabled: #d1d5db /* Disabled state */;
```

## Spacing System

**Base Unit**: 4px (1rem = 16px)

```css
--spacing-xs: 0.25rem; /* 4px  */
--spacing-sm: 0.5rem; /* 8px  */
--spacing-md: 1rem; /* 16px */
--spacing-lg: 1.5rem; /* 24px */
--spacing-xl: 2rem; /* 32px */
--spacing-2xl: 2.5rem; /* 40px */
--spacing-3xl: 3rem; /* 48px */
```

## Component Sizing

All components use standardized sizes for professional appearance:

### Buttons

```css
Small:   height 32px,  padding 0 12px
Medium:  height 40px,  padding 0 16px  /* DEFAULT */
Large:   height 48px,  padding 0 24px
```

Classes:

- `.btn-primary`, `.btn-primary-sm`, `.btn-primary-lg`
- `.btn-secondary`, `.btn-secondary-sm`, `.btn-secondary-lg`
- `.btn-tertiary` (low emphasis, link-like)
- `.btn-danger`, `.btn-success`, `.btn-icon`

### Form Elements

```css
Input Height:    40px
Input Padding:   10px vertical, 12px horizontal
Input Radius:    6px

Checkbox Size:   20px  ✅ FIXED (was too large)
Radio Size:      20px
Toggle Width:    44px, Height: 24px
```

### Cards

```css
Border Radius:   8px
Padding:         24px (1.5rem)
Border:          1px solid var(--color-border-primary)
Shadow:          var(--shadow-sm) on hover
```

## Typography Scale

**Font Sizes** (Modular 1.125 ratio)

```css
12px   (--font-size-xs)
14px   (--font-size-sm)
16px   (--font-size-base)  ← BASE
18px   (--font-size-lg)
20px   (--font-size-xl)
24px   (--font-size-2xl)
30px   (--font-size-3xl)
36px   (--font-size-4xl)
48px   (--font-size-5xl)
```

**Font Weights**

```css
Light:     300
Normal:    400
Medium:    500
Semibold:  600
Bold:      700
```

**Line Heights**

```css
Tight:    1.2
Normal:   1.5  ← BASE
Relaxed:  1.75
Loose:    2.0
```

## Available CSS Classes

### Buttons

```tsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-primary-sm">Small</button>
<button className="btn btn-primary-lg">Large</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-danger">Danger</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-icon">Icon</button>
<button className="btn btn-tertiary">Link Style</button>
```

### Forms

```tsx
<input type="text" placeholder="Text input" />
<input type="checkbox" />
<input type="radio" />
<input type="checkbox" className="toggle" />
```

### Containers & Layout

```tsx
<div className="card">Content</div>
<div className="card card-elevated">Elevated</div>
<div className="card card-sm">Small padding</div>
<div className="card card-lg">Large padding</div>

<div className="container container-md">Max 1024px</div>

<div className="stack stack-lg">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div className="grid grid-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<div className="section section-dark">
  Section content
</div>
```

### Typography

```tsx
<h1>Heading 1</h1>
<p className="lead">Lead paragraph</p>
<p className="text-secondary">Secondary text</p>
<p className="text-sm">Small text</p>
<p className="text-error">Error message</p>
<p className="text-success">Success message</p>
```

## CSS File Structure

```
/src/styles/
├── index.css ......................... ← MAIN ENTRY (new!)
├── unified-theme.css ................. ← ALL CSS VARIABLES (new!)
├── components/
│   ├── unified-button.css ............ ← ALL BUTTON STYLES (new!)
│   ├── unified-form.css ............. ← ALL FORM STYLES (new!)
│   ├── unified-container.css ......... ← CARDS, GRIDS, STACKS (new!)
│   ├── unified-typography.css ........ ← TYPOGRAPHY & HEADINGS (new!)
│   ├── alert.css .................... (keeping)
│   ├── modal.css .................... (keeping)
│   ├── toast.css .................... (keeping)
│   ├── skeleton.css ................. (keeping)
│   └── virtual-table.css ............ (keeping)
├── compositions/
│   └── layouts.css .................. (keeping)
├── design-system/
│   └── index.css .................... (keeping)
├── tokens/ ........................... ← TO BE REMOVED
│   ├── primitives.css ............... (OLD - remove)
│   ├── semantic.css ................. (OLD - remove)
│   ├── component-tokens.css ......... (OLD - remove)
│   └── dark-theme.css ............... (OLD - remove)
├── accessibility.css ................ (keeping)
├── common-classes.css ............... (keeping)
├── container-queries.css ............ (keeping)
├── critical.css ..................... (keeping)
├── view-transitions.css ............. (keeping)
└── index-new.css .................... (OLD - deprecate)
```

## Migration Path for Components

### Before (Old System)

```tsx
// Header.tsx - using theme variables
const Header = () => {
  return (
    <header style={{ background: 'var(--theme-primary)' }}>
      <button style={{ color: 'var(--theme-text-inverse)' }}>Sign In</button>
    </header>
  );
};
```

### After (New System)

```tsx
// Header.tsx - using unified CSS classes
const Header = () => {
  return (
    <header className="bg-primary text-inverse p-md">
      <button className="btn btn-primary">Sign In</button>
    </header>
  );
};
```

## Removing Theme Switching

### Step 1: Delete Theme Switcher Component

```bash
rm -rf src/shared/components/ThemeSwitcher/
```

### Step 2: Remove Theme Context

- Delete any `ThemeContext.tsx` or `useTheme()` hook
- Remove from `App.tsx` provider setup

### Step 3: Remove from Components

Search for and remove:

- `import { useTheme } from '...'`
- `const { theme, toggleTheme } = useTheme()`
- Any `[data-theme="dark"]` attributes
- Any `if (theme === 'dark')` conditionals

## Focus States & Accessibility

All components include consistent focus states for keyboard navigation:

```css
&:focus-visible {
  outline: 2px solid var(--focus-ring-color);
  outline-offset: 2px;
}
```

**Color Variables**:

- `--focus-ring-color: rgba(0, 102, 204, 0.5)` (Semi-transparent blue)
- `--focus-ring-width: 2px`
- `--focus-ring-offset: 2px`

## Responsive Design

Mobile-first approach using modern CSS media queries:

```css
/* Mobile (base): < 640px */
/* Tablet: 640px - 1024px */
/* Desktop: > 1024px */
```

Utility classes support responsive behavior:

```tsx
<div className="grid grid-2 md:grid-3 lg:grid-4">{/* Grid adapts based on screen size */}</div>
```

## Next Steps

### Phase 2: Refactor Components

- [ ] Update Header.tsx to use new button classes
- [ ] Update Footer.tsx to use new container/typography classes
- [ ] Update ErrorBoundary.tsx to use semantic color classes
- [ ] Update SimpleRoutes.tsx fallback page
- [ ] Update all form components to use new form classes

### Phase 3: Remove Old Files

- [ ] Delete `/src/styles/tokens/` folder
- [ ] Delete `ThemeSwitcher.tsx` component
- [ ] Remove theme-related context/hooks
- [ ] Delete old `index-new.css`

### Phase 4: Validation & Testing

- [ ] ESLint validation: 0 errors
- [ ] Build succeeds: `npm run build`
- [ ] No visual regressions
- [ ] Cross-browser testing
- [ ] Accessibility audit

## CSS Variables Reference

All variables are defined in `unified-theme.css` and prefixed with `--color-`, `--spacing-`, `--font-`, `--shadow-`, or `--border-radius-`.

Access via CSS:

```css
.element {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow-lg);
}
```

Or as utility classes:

```tsx
<div className="bg-primary p-md text-lg shadow-lg">{/* Same result */}</div>
```

## Performance Benefits

1. **Smaller CSS**: Single unified file instead of multiple theme files
2. **Faster Load**: No theme switching logic needed
3. **Better Caching**: Single CSS file can be cached effectively
4. **Cleaner HTML**: Less style attributes, more semantic classes
5. **Easier Maintenance**: Single source of truth for all styles

## Questions & Support

- Check `/src/styles/unified-theme.css` for all CSS variables
- Check component files (`unified-button.css`, `unified-form.css`, etc.) for available classes
- Use browser DevTools to inspect applied styles
- Run ESLint to catch styling issues early

---

**Created**: Professional Light Theme System  
**Scope**: Frontend UI styling consolidation  
**Deployment**: AWS (no additional infrastructure needed)
