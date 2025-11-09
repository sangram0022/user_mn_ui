# Manual Testing Checklist

**Purpose:** Comprehensive manual testing checklist for code audit fixes (Phases 1-4)  
**Date Created:** 2025-11-09  
**Audit Reference:** CODE_AUDIT_FIX_PLAN.md Phase 4.3  

This checklist validates the implementation of:
- Phase 1: Error Handling Standardization (useStandardErrorHandler)
- Phase 2: API Standardization (TanStack Query, type-only imports)
- Phase 3: React 19 Cleanup (hook optimization, async/await)

---

## 🔐 Authentication Flow

### Login Flow
- [ ] **Happy Path**
  - [ ] Enter valid credentials → Login successful
  - [ ] Redirected to dashboard
  - [ ] Toast shows "Login successful"
  - [ ] User profile loaded and displayed
  - [ ] Token stored in localStorage
  
- [ ] **Error Scenarios**
  - [ ] Invalid email format → Field error shown (client-side validation)
  - [ ] Wrong password → Toast shows "Invalid credentials"
  - [ ] Empty fields → Field errors shown
  - [ ] Network offline → Toast shows "Network error"
  - [ ] 401 response → Toast shows error, stays on login page
  - [ ] 500 server error → Toast shows "Server error, please try again"

- [ ] **Loading States**
  - [ ] Submit button shows loading spinner during API call
  - [ ] Submit button disabled while loading
  - [ ] Form fields remain enabled (can be cancelled)

### Registration Flow
- [ ] **Happy Path**
  - [ ] Enter valid data → Registration successful
  - [ ] Toast shows "Registration successful"
  - [ ] Redirected to login or verification page
  - [ ] Email validation works (real-time)
  - [ ] Password strength indicator updates correctly
  
- [ ] **Validation Errors (Client-side)**
  - [ ] Invalid email → Field error shown immediately
  - [ ] Password too short (< 8 chars) → Field error shown
  - [ ] Password missing uppercase → Strength indicator shows weak
  - [ ] Username invalid format → Field error shown
  - [ ] Phone number invalid → Field error shown

- [ ] **Server Validation Errors (422)**
  - [ ] Email already exists → Field error under email input
  - [ ] Username taken → Field error under username input
  - [ ] Multiple field errors → All errors displayed correctly
  - [ ] Toast shows "Please fix the errors below"

- [ ] **Error Scenarios**
  - [ ] Network offline → Toast shows network error
  - [ ] 500 server error → Toast shows server error
  - [ ] Rate limit (429) → Toast shows "Too many requests"

### Logout Flow
- [ ] **Happy Path**
  - [ ] Click logout → Confirmation modal shown (if enabled)
  - [ ] Confirm → User logged out
  - [ ] Redirected to login page
  - [ ] Token removed from localStorage
  - [ ] User profile cleared
  - [ ] Toast shows "Logged out successfully"

- [ ] **Error Scenarios**
  - [ ] Logout API fails → Still clears local session (fail gracefully)
  - [ ] Toast shows warning if API failed

### Password Reset Flow
- [ ] **Happy Path**
  - [ ] Enter email → "Reset link sent" toast shown
  - [ ] Email validation works
  - [ ] Click reset link → Redirected to reset password page
  - [ ] Enter new password → "Password reset successful" toast
  - [ ] Redirected to login page

- [ ] **Error Scenarios**
  - [ ] Invalid email format → Field error shown
  - [ ] Email not found → Toast shows "Email not found" (or generic message for security)
  - [ ] Reset token expired → Toast shows "Link expired, request new one"
  - [ ] Network error → Toast shows network error

### Token Refresh
- [ ] **Automatic Refresh**
  - [ ] Token expires → Automatically refreshed in background
  - [ ] No interruption to user experience
  - [ ] API calls continue seamlessly

- [ ] **Refresh Failure**
  - [ ] Refresh token expired → Automatic redirect to login
  - [ ] Toast shows "Session expired, please login again"
  - [ ] Return URL preserved (redirects back after login)

---

## 👤 Profile Management

### View Profile
- [ ] **Happy Path**
  - [ ] Navigate to profile page → Profile data loads
  - [ ] Loading skeleton shown while fetching
  - [ ] All fields populated correctly
  - [ ] Avatar displayed (or placeholder if none)

- [ ] **Error Scenarios**
  - [ ] 401 Unauthorized → Automatic redirect to login
  - [ ] 404 Not Found → Toast shows "Profile not found"
  - [ ] Network error → Toast shows network error
  - [ ] Error boundary catches unexpected errors

### Update Profile
- [ ] **Happy Path**
  - [ ] Edit first name → Save → Toast shows "Profile updated"
  - [ ] Edit last name → Save → Success toast
  - [ ] Edit phone → Save → Success toast
  - [ ] Profile data refreshed automatically
  - [ ] Form reset to saved values

- [ ] **Validation (Client-side)**
  - [ ] Empty first name → Field error shown
  - [ ] Invalid phone format → Field error shown
  - [ ] Name with numbers → Field error shown
  - [ ] Save button disabled while errors exist

- [ ] **Server Validation (422)**
  - [ ] Phone already in use → Field error under phone
  - [ ] Multiple errors → All field errors shown
  - [ ] Toast shows "Please fix the errors"

- [ ] **Error Scenarios**
  - [ ] 401 during update → Redirect to login
  - [ ] Network error → Toast shows error, form state preserved
  - [ ] 500 server error → Toast shows error, can retry
  - [ ] Optimistic update rolls back on error

- [ ] **Loading States**
  - [ ] Save button shows spinner during save
  - [ ] Save button disabled while saving
  - [ ] Form fields remain enabled

---

## 👥 User Management (Admin)

### List Users
- [ ] **Happy Path**
  - [ ] Navigate to users page → Users list loads
  - [ ] Loading skeleton shown while fetching
  - [ ] Pagination works correctly
  - [ ] Search filters users
  - [ ] Sort by column works

- [ ] **Error Scenarios**
  - [ ] 403 Forbidden → Toast shows "Insufficient permissions"
  - [ ] Network error → Toast shows error, retry button shown
  - [ ] Empty state shown if no users

### Create User
- [ ] **Happy Path**
  - [ ] Click "Add User" → Modal/form opens
  - [ ] Fill valid data → Submit → User created
  - [ ] Toast shows "User created successfully"
  - [ ] Modal closes
  - [ ] User list refreshed (new user appears)

- [ ] **Validation**
  - [ ] Email validation works
  - [ ] Password validation works
  - [ ] Role selection required
  - [ ] All field errors shown

- [ ] **Error Scenarios**
  - [ ] Email already exists → Field error shown
  - [ ] Network error → Toast shows error, form preserved
  - [ ] 403 Forbidden → Toast shows permission error

### Update User
- [ ] **Happy Path**
  - [ ] Click edit → Form pre-populated with user data
  - [ ] Update fields → Save → User updated
  - [ ] Toast shows "User updated successfully"
  - [ ] User list refreshed

- [ ] **Error Scenarios**
  - [ ] 404 User not found → Toast shows error
  - [ ] 422 Validation errors → Field errors shown
  - [ ] Network error → Form preserved

### Delete User
- [ ] **Happy Path**
  - [ ] Click delete → Confirmation modal shown
  - [ ] Confirm → User deleted
  - [ ] Toast shows "User deleted successfully"
  - [ ] User removed from list

- [ ] **Error Scenarios**
  - [ ] 403 Forbidden → Toast shows permission error
  - [ ] 404 Not found → Toast shows "User already deleted"
  - [ ] Network error → Toast shows error

### Bulk Operations
- [ ] **Approve Multiple Users**
  - [ ] Select users → Click "Approve" → All approved
  - [ ] Toast shows "X users approved"
  - [ ] List refreshed

- [ ] **Delete Multiple Users**
  - [ ] Select users → Click "Delete" → Confirmation shown
  - [ ] Confirm → All deleted
  - [ ] Toast shows "X users deleted"

---

## 🔑 Role Management (Admin)

### List Roles
- [ ] **Happy Path**
  - [ ] Navigate to roles page → Roles list loads
  - [ ] Loading skeleton shown
  - [ ] Permissions grouped by category
  - [ ] Search filters roles

- [ ] **Error Scenarios**
  - [ ] 403 Forbidden → Toast shows permission error
  - [ ] Network error → Retry button shown

### Create Role
- [ ] **Happy Path**
  - [ ] Click "Add Role" → Form opens
  - [ ] Enter role name → Select permissions → Save
  - [ ] Toast shows "Role created successfully"
  - [ ] Role list refreshed

- [ ] **Validation**
  - [ ] Role name required
  - [ ] At least one permission required
  - [ ] Field errors shown

### Update Role
- [ ] **Happy Path**
  - [ ] Click edit → Form pre-populated
  - [ ] Update permissions → Save → Role updated
  - [ ] Toast shows success

### Delete Role
- [ ] **Happy Path**
  - [ ] Click delete → Confirmation shown
  - [ ] Confirm → Role deleted
  - [ ] Toast shows success

---

## 🚨 Error Scenarios (Cross-Feature)

### Network Errors
- [ ] **Offline Mode**
  - [ ] Disconnect internet → Try any API call
  - [ ] Toast shows "Network error - please check your connection"
  - [ ] Retry button available (if applicable)
  - [ ] No console errors

- [ ] **Slow Network**
  - [ ] Throttle network → Try API call
  - [ ] Loading state shown
  - [ ] Timeout after reasonable duration
  - [ ] Error message clear

### Authentication Errors
- [ ] **401 Unauthorized**
  - [ ] Token expired → Any API call triggers redirect to login
  - [ ] Toast shows "Session expired, please login again"
  - [ ] Return URL preserved
  - [ ] No infinite redirect loops

- [ ] **403 Forbidden**
  - [ ] Try accessing admin page without permission
  - [ ] Toast shows "Insufficient permissions"
  - [ ] Redirected to appropriate page (or stay with message)
  - [ ] No console errors

### Validation Errors (422)
- [ ] **Single Field Error**
  - [ ] Submit form with invalid email
  - [ ] Error shown under email field
  - [ ] Error message clear and specific
  - [ ] Toast shows "Please fix the errors below"

- [ ] **Multiple Field Errors**
  - [ ] Submit form with multiple invalid fields
  - [ ] All field errors shown
  - [ ] Errors cleared when fields corrected
  - [ ] Form submits after corrections

### Server Errors
- [ ] **500 Internal Server Error**
  - [ ] Trigger server error (if possible)
  - [ ] Toast shows "Server error - please try again"
  - [ ] Error logged (check console/logging)
  - [ ] User can retry
  - [ ] No app crash

- [ ] **503 Service Unavailable**
  - [ ] Toast shows "Service temporarily unavailable"
  - [ ] Retry option available

### Rate Limiting (429)
- [ ] **Too Many Requests**
  - [ ] Trigger rate limit (rapid requests)
  - [ ] Toast shows "Too many requests - please wait"
  - [ ] Retry after delay works

---

## 🎨 UI/UX Validation

### Loading States
- [ ] **Data Fetching**
  - [ ] Skeleton loaders shown while loading
  - [ ] Spinners appropriate size and placement
  - [ ] No layout shift when data loads
  - [ ] Loading text clear ("Loading users...")

- [ ] **Form Submission**
  - [ ] Submit button shows spinner
  - [ ] Submit button disabled during submission
  - [ ] Form fields remain enabled (or disabled if desired)
  - [ ] Loading doesn't block view of form

### Toast Notifications
- [ ] **Success Toasts**
  - [ ] Green color/checkmark icon
  - [ ] Message clear and concise
  - [ ] Auto-dismiss after 3-5 seconds
  - [ ] Can manually dismiss

- [ ] **Error Toasts**
  - [ ] Red color/error icon
  - [ ] Message helpful (not just "Error")
  - [ ] Auto-dismiss after 5-7 seconds
  - [ ] Can manually dismiss
  - [ ] Retry button (if applicable)

- [ ] **Warning Toasts**
  - [ ] Yellow/orange color
  - [ ] Message clear
  - [ ] Appropriate duration

### Error Boundaries
- [ ] **Component Crash**
  - [ ] Force component error (if test mode available)
  - [ ] Error boundary catches error
  - [ ] Fallback UI shown
  - [ ] "Try again" button works
  - [ ] Error logged

- [ ] **Page Crash**
  - [ ] Entire page error boundary works
  - [ ] User not stuck on broken page
  - [ ] Can navigate away

### Field Validation UI
- [ ] **Error Display**
  - [ ] Error text red color
  - [ ] Icon shown (if design includes)
  - [ ] Error below or beside field
  - [ ] Doesn't break layout

- [ ] **Success Display**
  - [ ] Green checkmark (if design includes)
  - [ ] Clear visual feedback

- [ ] **Inline Validation**
  - [ ] Validates on blur (email, phone, etc.)
  - [ ] Doesn't validate on every keystroke (unless desired)
  - [ ] Clear when user starts correcting

---

## 🧪 Edge Cases

### Empty States
- [ ] **No Data**
  - [ ] Empty user list shows empty state
  - [ ] Empty roles list shows empty state
  - [ ] Message clear ("No users yet")
  - [ ] Action button available ("Add User")

### Long Content
- [ ] **Long Names**
  - [ ] User with very long name → Truncated with ellipsis
  - [ ] Tooltip shows full name

- [ ] **Long Error Messages**
  - [ ] Server returns long error → Toast truncated or scrollable
  - [ ] Full error in console for debugging

### Concurrent Operations
- [ ] **Multiple Tabs**
  - [ ] Login in Tab 1 → Tab 2 reflects logged-in state
  - [ ] Logout in Tab 1 → Tab 2 redirects to login

- [ ] **Race Conditions**
  - [ ] Rapid updates to same resource → Last update wins
  - [ ] No flickering or incorrect data

### Browser Compatibility
- [ ] **Modern Browsers**
  - [ ] Chrome latest → All features work
  - [ ] Firefox latest → All features work
  - [ ] Safari latest → All features work
  - [ ] Edge latest → All features work

---

## 📊 Performance Checks

### Bundle Size
- [ ] **Check bundle size before/after changes**
  - [ ] Run `npm run analyze-bundle`
  - [ ] Compare with baseline
  - [ ] No significant increase (or justified)

### Loading Performance
- [ ] **Time to Interactive (TTI)**
  - [ ] Use Lighthouse or similar tool
  - [ ] TTI < 5 seconds on 3G
  - [ ] No regressions from audit changes

### React Performance
- [ ] **No Unnecessary Re-renders**
  - [ ] Use React DevTools Profiler
  - [ ] Check components don't re-render on unrelated state changes
  - [ ] useCallback/useMemo used appropriately (with justification)

### Memory Leaks
- [ ] **Check for leaks**
  - [ ] Open page → Navigate away → Repeat
  - [ ] Chrome DevTools Memory tab
  - [ ] Memory doesn't continuously grow

---

## ✅ Audit Fix Validation

### Phase 1: Error Handling
- [ ] **useStandardErrorHandler Usage**
  - [ ] All API errors show toast
  - [ ] 401 → Auto-redirect to login
  - [ ] Field errors extracted from 422 responses
  - [ ] Errors logged to console (structured)

- [ ] **No Manual Error Handling**
  - [ ] Check codebase: No manual `if (error.status === 401)` checks
  - [ ] All errors go through standard handler

### Phase 2: API Patterns
- [ ] **TanStack Query Usage**
  - [ ] All API calls use query/mutation hooks
  - [ ] No raw axios/fetch in components
  - [ ] Cache invalidation works correctly

- [ ] **Type-Only Imports**
  - [ ] Check imports: All types use `import type`
  - [ ] ESLint rule enforces this
  - [ ] No compilation errors

- [ ] **Async/Await Pattern**
  - [ ] Check codebase: No `.then()/.catch()` chains (except React.lazy)
  - [ ] All use async/await with try/catch

### Phase 3: React 19 Patterns
- [ ] **useCallback/useMemo Removed**
  - [ ] Check codebase: Simple computations don't use useMemo
  - [ ] Event handlers don't use useCallback
  - [ ] Remaining hooks have justification comments

- [ ] **React Compiler Optimization**
  - [ ] No React warnings in console
  - [ ] Performance unchanged or improved

---

## 📝 Test Completion

### Sign-off
- [ ] **All critical paths tested**
- [ ] **All error scenarios tested**
- [ ] **Performance validated**
- [ ] **No regressions found**

**Tester Name:** _________________  
**Date:** _________________  
**Notes/Issues Found:** _________________

---

## 🐛 Issue Tracking Template

If you find issues during testing, document them here:

### Issue #1
- **Feature:** [e.g., Login]
- **Step:** [e.g., Invalid credentials]
- **Expected:** [e.g., Toast shows "Invalid credentials"]
- **Actual:** [e.g., Toast shows "Error"]
- **Severity:** [Critical / High / Medium / Low]
- **Screenshot:** [Attach if available]

### Issue #2
...

---

**Last Updated:** 2025-11-09  
**Version:** 1.0  
**Related:** CODE_AUDIT_FIX_PLAN.md Phase 4.3
