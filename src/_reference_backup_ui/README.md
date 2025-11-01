# Reference UI Pages - Backup Project

This folder contains reference pages copied from `usermn_backup_non_react` project.

## Purpose

These files are for **visual reference only** during development to ensure styling consistency.

## Files Included

- `HtmlShowcase.tsx` - Complete showcase of HTML elements and components
- `ModernHtmlPage.tsx` - Modern HTML semantics with performance optimization (coming soon)
- `ProductsPage.tsx` - E-commerce product listing page
- `ServicesPage.tsx` - Services portfolio page
- `index.tsx` - Landing page with links to all reference pages

## How to Access

Navigate to these URLs in your browser:

- **Index**: http://localhost:5179/reference
- **HTML Showcase**: http://localhost:5179/reference/html-showcase
- **Products**: http://localhost:5179/reference/products
- **Services**: http://localhost:5179/reference/services

Or click the **📚 Reference** link in the header navigation.

## Usage

1. Keep these files **as-is** for visual comparison
2. Import paths have been updated to match current project structure
3. All components use the same design system from `src/design-system/`
4. **DO NOT modify** these files - they are reference only
5. Use them to compare styling with your current pages

## What's Included

### HtmlShowcase.tsx
- Complete typography system showcase
- All button variants (primary, secondary, accent, success, danger, outline, ghost)
- Badge collection (all variants)
- Form elements (inputs, selects, textareas, checkboxes, radios)
- Interactive elements with animations
- Truncated version (full version too large)

### ProductsPage.tsx
- Product grid layout
- Category filtering
- Product cards with:
  - Images with hover effects
  - Star ratings
  - Pricing with discounts
  - Feature lists
  - Stock status badges
  - Add to cart buttons
- Newsletter signup section

### ServicesPage.tsx
- Hero services section
- Detailed service cards
- Process timeline (4 steps)
- Customer testimonials
- Pricing information
- CTA section with gradient background

## Cleanup

**DELETE this entire folder** (`src/_reference_backup_ui/`) when project is complete.

Also remember to:
1. Remove routes from `src/app/App.tsx`
2. Remove ROUTE_PATHS from `src/core/routing/routes.tsx`
3. Remove the Reference link from `src/shared/components/layout/Header.tsx`

## Updated Import Paths

All imports have been changed to use **barrel exports** for cleaner code:

**Old way (verbose):**
```tsx
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { typographyVariants } from '../design-system/variants';
```

**New way (clean):**
```tsx
import { Button, Card, Badge } from '../components';
import { typographyVariants } from '../design-system';
```

This allows them to run in the current project structure with better maintainability.

