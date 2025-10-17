# CSS Hardcoding and Design Mismatch Issues Found

## Critical Issues - Design Inconsistencies

### 1. Header.tsx - Sign In vs Get Started Mismatch

- **Sign In button**: Plain link with NO styling, just text color
- **Get Started button**: Full primary button with shadow, padding, border-radius
- **Issue**: On same page, buttons have completely different designs

### 2. NotFoundPage.tsx - Hardcoded Blue Colors

- **Go home button**: `bg-blue-600 hover:bg-blue-700` - hardcoded blue
- **Visit help center**: `border-gray-200 hover:bg-gray-50` - hardcoded gray
- **Issue**: Not using theme colors, inconsistent with rest of app

### 3. ErrorBoundary.tsx - Hardcoded Blue/Gray

- **Retry button**: `bg-blue-600 hover:bg-blue-700` - hardcoded blue
- **Cancel button**: `bg-gray-300 hover:bg-gray-400` - hardcoded gray
- **Issue**: Should use theme colors like other components

### 4. SimpleRoutes.tsx - Hardcoded Blue

- **Button**: `bg-blue-600 hover:bg-blue-700` - hardcoded blue
- **Issue**: Not using theme

### 5. Footer.tsx - Text Color Inconsistencies

- **Footer text**: `text-gray-400` and `hover:text-white` - hardcoded
- **Issue**: Should use theme text colors

### 6. Header.tsx - Logout Button

- **Color**: `text-red-600 hover:bg-red-50` - hardcoded red, not error theme
- **Issue**: Should use `var(--theme-error)`

## Additional Hardcoding Issues

### Color Values Not Using Theme:

- NotFoundPage.tsx: Line 9 - `text-blue-600` (error code)
- NotFoundPage.tsx: Line 11 - `text-gray-900`
- NotFoundPage.tsx: Line 13 - `text-gray-600`
- ErrorBoundary.tsx: Multiple lines with hardcoded colors
- SimpleRoutes.tsx: Multiple lines with hardcoded colors
- Footer.tsx: Multiple text colors hardcoded

### Spacing Inconsistencies:

- Various buttons have different padding (px-3 py-2 vs px-4 py-2 vs px-5 py-2.5)
- Border radius varies (rounded-md vs rounded-lg vs rounded-xl)
- Font sizes and weights inconsistent

## Action Items

- [ ] Fix Header Sign In button to match Get Started styling
- [ ] Fix NotFoundPage buttons to use theme colors
- [ ] Fix ErrorBoundary buttons to use theme colors
- [ ] Fix SimpleRoutes button to use theme colors
- [ ] Fix Footer text colors to use theme variables
- [ ] Standardize button sizing and spacing
- [ ] Replace all hardcoded blue, gray, red with theme variables
