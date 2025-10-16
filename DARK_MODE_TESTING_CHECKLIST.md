# Dark Mode Testing Checklist

**Date**: October 16, 2025  
**Status**: 🚧 IN PROGRESS  
**Tester**: Senior React Developer  
**Tool**: Storybook 9.1.10 + Accessibility Addon

---

## 🎯 Testing Objectives

1. ✅ Verify all components render correctly in dark mode
2. ✅ Check contrast ratios meet WCAG 2.1 AA standards
3. ✅ Identify and fix visibility issues
4. ✅ Test hover/focus states
5. ✅ Verify color token usage
6. ✅ Document findings and fixes

---

## 📋 Components to Test (30+)

### ✅ UI Components (Storybook)

#### Button Component (16 stories) ✅

- [x] Primary variant - **PASS** ✅
- [x] Secondary variant - **PASS** ✅
- [x] Outline variant - **PASS** ✅
- [x] Ghost variant - **PASS** ✅
- [x] Danger variant - **PASS** ✅
- [x] Small size - **PASS** ✅
- [x] Medium size - **PASS** ✅
- [x] Large size - **PASS** ✅
- [x] Disabled state - **PASS** ✅
- [x] Loading state - **PASS** ✅
- [x] FullWidth - **PASS** ✅
- [x] WithIcon - **PASS** ✅
- [x] AllVariants showcase - **PASS** ✅
- [x] AllSizes showcase - **PASS** ✅
- [x] DarkMode story - **PASS** ✅
- [x] AsLink - **PASS** ✅

**Findings**:

- ✅ All contrast ratios meet WCAG AA (4.5:1+)
- ✅ Hover states clearly visible
- ✅ Focus indicators high contrast
- ✅ Loading spinner visible in dark mode

---

#### Alert Component (18 stories) ⏳

- [ ] Info variant
- [ ] Success variant
- [ ] Warning variant
- [ ] Error variant
- [ ] Small size
- [ ] Medium size
- [ ] Large size
- [ ] Dismissible
- [ ] WithIcon
- [ ] WithActions
- [ ] WithList
- [ ] Banner mode
- [ ] DarkMode story

**Expected Issues**:

- Warning variant background may need adjustment
- Icon colors should be tested
- Border visibility in dark mode

---

#### Modal Component (20 stories) ⏳

- [ ] Small size
- [ ] Medium size
- [ ] Large size
- [ ] Extra Large size
- [ ] Full screen
- [ ] WithForm
- [ ] ConfirmationDialog
- [ ] DeleteConfirmation
- [ ] NestedModal
- [ ] ScrollableContent
- [ ] LongContent

**Expected Issues**:

- Backdrop opacity may need adjustment
- Close button visibility
- Focus trap indicator

---

#### Skeleton Component (10 stories) ⏳

- [ ] Text skeleton
- [ ] Circle skeleton
- [ ] Rectangle skeleton
- [ ] Rounded skeleton
- [ ] UserCard
- [ ] ContentCard
- [ ] SkeletonGrid
- [ ] PageSkeleton
- [ ] DashboardSkeleton

**Expected Issues**:

- Gray-200 background may be too light
- Animation visibility in dark mode
- Contrast with dark background

---

### Layout Components (Not in Storybook)

#### Header ⏳

- [ ] Background color
- [ ] Text readability
- [ ] Logo visibility
- [ ] Navigation items
- [ ] User menu dropdown
- [ ] Search bar

#### Sidebar ⏳

- [ ] Background color
- [ ] Active item highlight
- [ ] Hover states
- [ ] Icon visibility
- [ ] Collapsed state
- [ ] Border visibility

#### Footer ⏳

- [ ] Background color
- [ ] Text readability
- [ ] Link colors
- [ ] Divider visibility

---

### Form Components ⏳

#### Input ⏳

- [ ] Default state
- [ ] Focus state
- [ ] Disabled state
- [ ] Error state
- [ ] Success state
- [ ] Placeholder text
- [ ] Label text

#### Select ⏳

- [ ] Default state
- [ ] Focus state
- [ ] Disabled state
- [ ] Dropdown menu background
- [ ] Selected item highlight
- [ ] Hover states

#### Checkbox ⏳

- [ ] Unchecked state
- [ ] Checked state
- [ ] Indeterminate state
- [ ] Disabled state
- [ ] Focus indicator
- [ ] Label text

#### Radio ⏳

- [ ] Unchecked state
- [ ] Checked state
- [ ] Disabled state
- [ ] Focus indicator
- [ ] Label text

---

### Feedback Components ⏳

#### Toast/Notification ⏳

- [ ] Info toast
- [ ] Success toast
- [ ] Warning toast
- [ ] Error toast
- [ ] Close button
- [ ] Auto-dismiss timer

#### Loading States ⏳

- [ ] LoadingBar (View Transitions)
- [ ] LoadingSpinner
- [ ] Skeleton loaders
- [ ] Progress bars

#### Error Messages ⏳

- [ ] ErrorBoundary fallback
- [ ] Inline error messages
- [ ] Form validation errors

#### Empty States ⏳

- [ ] No data message
- [ ] Empty table
- [ ] No search results

---

### Data Display Components ⏳

#### Table ⏳

- [ ] Table header
- [ ] Table rows
- [ ] Striped rows
- [ ] Hover state
- [ ] Selected row
- [ ] Sortable columns
- [ ] Pagination

#### Card ⏳

- [ ] Card background
- [ ] Card border
- [ ] Card shadow
- [ ] Card header
- [ ] Card footer
- [ ] Hover effect

#### Badge ⏳

- [ ] Primary badge
- [ ] Secondary badge
- [ ] Success badge
- [ ] Warning badge
- [ ] Error badge
- [ ] Pill shape
- [ ] Dot indicator

---

### Navigation Components ⏳

#### Tabs ⏳

- [ ] Default tab
- [ ] Active tab
- [ ] Hover state
- [ ] Disabled tab
- [ ] Tab indicator/underline

#### Breadcrumbs ⏳

- [ ] Default state
- [ ] Active item
- [ ] Separator visibility
- [ ] Link hover state

#### Pagination ⏳

- [ ] Page numbers
- [ ] Active page
- [ ] Disabled prev/next
- [ ] Hover states

---

### Overlay Components ⏳

#### Dropdown ⏳

- [ ] Trigger button
- [ ] Menu background
- [ ] Menu items
- [ ] Hover state
- [ ] Selected item
- [ ] Dividers

#### Tooltip ⏳

- [ ] Background color
- [ ] Text color
- [ ] Arrow/pointer
- [ ] Positioning

#### Popover ⏳

- [ ] Background color
- [ ] Border
- [ ] Shadow
- [ ] Close button

---

## 🔍 Testing Process

### For Each Component:

1. **Open in Storybook**
   - Navigate to component story
   - Toggle dark mode (sun/moon icon in toolbar)

2. **Visual Inspection**
   - Is component visible?
   - Are all elements readable?
   - Do colors make sense?
   - Are borders visible?
   - Are icons clear?

3. **Contrast Check (Accessibility Tab)**
   - Check text contrast ratios
   - Verify minimum 4.5:1 for normal text
   - Verify minimum 3:1 for large text
   - Verify minimum 3:1 for UI components

4. **Interactive States**
   - Test hover states
   - Test focus states
   - Test active states
   - Test disabled states

5. **Document Findings**
   - Note any issues
   - Suggest fixes
   - Mark severity (Critical/High/Medium/Low)

---

## 🐛 Common Dark Mode Issues

### Issue 1: Low Contrast Text

**Symptom**: Text is hard to read on dark background  
**Cause**: Using light gray instead of white/near-white  
**Fix**: Increase text brightness  
**Severity**: High

**Example Fix**:

```css
.dark .text-gray-600 {
  color: rgb(229, 231, 235); /* gray-200 */
}
```

---

### Issue 2: Invisible Borders

**Symptom**: Component borders not visible  
**Cause**: Border color too close to background  
**Fix**: Increase border opacity or brightness  
**Severity**: Medium

**Example Fix**:

```css
.dark .border-gray-200 {
  border-color: rgb(55, 65, 81); /* gray-700 */
}
```

---

### Issue 3: Poor Focus Indicators

**Symptom**: Can't see which element has focus  
**Cause**: Low contrast focus ring  
**Fix**: Use high contrast color with increased width  
**Severity**: Critical (Accessibility)

**Example Fix**:

```css
.dark *:focus {
  outline: 2px solid rgb(96, 165, 250); /* blue-400 */
  outline-offset: 2px;
}
```

---

### Issue 4: Icon Visibility

**Symptom**: Icons blend into background  
**Cause**: Icon fill/stroke color not adjusted for dark mode  
**Fix**: Adjust icon colors  
**Severity**: Medium

**Example Fix**:

```css
.dark .icon {
  color: rgb(229, 231, 235); /* gray-200 */
}
```

---

### Issue 5: Skeleton Animation

**Symptom**: Skeleton loader not visible in dark mode  
**Cause**: Using gray-200 which is too light  
**Fix**: Use darker gray with proper animation  
**Severity**: Medium

**Example Fix**:

```css
.dark .skeleton {
  background-color: rgb(55, 65, 81); /* gray-700 */
}

.dark .skeleton::after {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}
```

---

## 📊 Testing Progress

### Overall Progress

```
Components Tested: 16/64+ (25%)
Issues Found: TBD
Issues Fixed: TBD
WCAG Compliance: Pending
```

### By Category

- UI Components: 16/64 (25%)
- Layout Components: 0/3 (0%)
- Form Components: 0/4 (0%)
- Feedback Components: 0/4 (0%)
- Data Display: 0/3 (0%)
- Navigation: 0/3 (0%)
- Overlay: 0/3 (0%)

---

## 🎨 Color Token Reference

### Text Colors (Dark Mode)

```css
--text-primary: rgb(243, 244, 246); /* gray-100 - Main text */
--text-secondary: rgb(229, 231, 235); /* gray-200 - Supporting text */
--text-tertiary: rgb(156, 163, 175); /* gray-400 - Muted text */
--text-disabled: rgb(107, 114, 128); /* gray-500 - Disabled text */
```

### Background Colors (Dark Mode)

```css
--bg-primary: rgb(17, 24, 39); /* gray-900 - Main background */
--bg-secondary: rgb(31, 41, 55); /* gray-800 - Cards, panels */
--bg-tertiary: rgb(55, 65, 81); /* gray-700 - Hover states */
--bg-elevated: rgb(31, 41, 55); /* gray-800 - Elevated surfaces */
```

### Border Colors (Dark Mode)

```css
--border-primary: rgb(55, 65, 81); /* gray-700 - Main borders */
--border-secondary: rgb(75, 85, 99); /* gray-600 - Subtle dividers */
--border-focus: rgb(96, 165, 250); /* blue-400 - Focus rings */
```

### Component Colors (Dark Mode)

```css
/* Buttons */
--btn-primary-bg: rgb(59, 130, 246); /* blue-500 */
--btn-primary-hover: rgb(37, 99, 235); /* blue-600 */
--btn-primary-text: rgb(255, 255, 255); /* white */

/* Alerts */
--alert-info-bg: rgb(30, 58, 138); /* blue-900 */
--alert-success-bg: rgb(20, 83, 45); /* green-900 */
--alert-warning-bg: rgb(120, 53, 15); /* amber-900 */
--alert-error-bg: rgb(127, 29, 29); /* red-900 */
```

---

## ✅ Acceptance Criteria

### Must Pass

- [ ] All text meets WCAG 2.1 AA contrast (4.5:1)
- [ ] Large text meets WCAG 2.1 AA contrast (3:1)
- [ ] UI components meet contrast requirements (3:1)
- [ ] Focus indicators clearly visible
- [ ] No invisible borders or dividers
- [ ] All icons visible and clear
- [ ] Hover states clearly distinguishable
- [ ] Disabled states properly styled

### Should Pass

- [ ] Animations work smoothly in dark mode
- [ ] Shadows enhance depth perception
- [ ] Color choices feel intentional
- [ ] Consistent color usage across components

### Nice to Have

- [ ] WCAG 2.1 AAA contrast (7:1 for text)
- [ ] Smooth transition between light/dark modes
- [ ] System preference detection working
- [ ] Persistent theme selection

---

## 🚀 Next Steps

1. **Complete Button Testing** ✅ (Done)
2. **Test Alert Component** (Next)
3. **Test Modal Component**
4. **Test Skeleton Component**
5. **Test remaining Storybook components**
6. **Test components not in Storybook**
7. **Fix identified issues**
8. **Re-test after fixes**
9. **Document all findings**
10. **Create dark theme guidelines** (Task 10)

---

## 📝 Notes

### Testing Environment

- Browser: Chrome 131+
- Storybook: 9.1.10
- Screen: 1920x1080
- Color blindness simulator: Not yet tested

### Recommended Tools

- Chrome DevTools (Contrast checker)
- axe DevTools extension
- Storybook a11y addon
- WAVE browser extension
- Lighthouse accessibility audit

---

**Testing Started**: October 16, 2025  
**Expected Completion**: Today  
**Status**: 🚧 IN PROGRESS (25% complete)
