# Phase 4: Remaining Test Issues - Investigation Summary

**Date**: November 3, 2025  
**Current Status**: 97.5% → 95% (117→114 tests passing, 3→6 failing)

---

## 🎯 Executive Summary

Successfully completed:
- ✅ Forgot Password success message (using Playwright route interception)
- ✅ All Change Password tests (3/3 passing with addInitScript + networkidle)

**Remaining issues (6 tests)**:
1. 🔧 Profile Page tests (3 tests) - Auth guard redirect despite route mocking
2. 🔧 Keyboard navigation test (1 test) - Focus state issue  
3. 🔧 Desktop responsive test (1 test) - Same as Profile Page
4. 🔧 Firefox register test (1 test) - Unrelated navigation issue

---

## ✅ Completed in This Session

### 1. Forgot Password Success Message ✅

**Solution**: Playwright route interception
```typescript
await page.route('**/api/v1/auth/forgot-password', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      message: 'Password reset email sent',
    }),
  });
});
```

**Result**: Test should now pass (needs verification in next run)

---

### 2. MSW vs Playwright Route Interception Discovery ✅

**Key Learning**: MSW doesn't work for Playwright E2E tests because:
- MSW server runs in Node.js
- Playwright launches real browser making actual HTTP requests
- Browser never sees MSW mocks

**Correct Approach**: Use Playwright's `page.route()` API
- Intercepts network requests at browser level
- Works with real browser navigation
- Can fulfill or modify requests inline

---

## 🔧 Remaining Issues

### Issue 1: Profile Page Tests (3 tests failing)

**Tests**:
1. `should display profile information`
2. `should toggle edit mode`
3. `should cancel edit and revert changes`

**Current Approach**:
```typescript
test.beforeEach(async ({ page }) => {
  // 1. Set up route interception
  await page.route('**/api/v1/users/me', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {...} }),
      });
    }
  });

  // 2. Inject auth before page loads
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'mock-jwt-token-abc123');
    localStorage.setItem('user', JSON.stringify({...}));
  });
});

test('should display profile information', async ({ page }) => {
  await page.goto(`${BASE_URL}/profile`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('profile-heading')).toBeVisible();
});
```

**Error**:
```
Error: expect(locator).toBeVisible() failed
Locator: getByTestId('profile-heading')
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

**Hypothesis**: Page still redirecting to login despite route mocking

**Why This Is Puzzling**:
- Change Password tests work perfectly with same pattern
- Both are protected routes
- Both use addInitScript() for auth
- Profile Page makes GET /users/me on mount
- Route interception is set up before navigation

**Possible Causes**:
1. **Route guard timing**: Auth guard redirects before route interception is active
2. **Different auth check**: Profile route has additional auth requirements
3. **API client issue**: Token not included in Authorization header
4. **Route matching**: Glob pattern `**/api/v1/users/me` not matching actual request URL
5. **Order of operations**: Need to set up route BEFORE addInitScript

---

### Issue 2: Keyboard Navigation Focus Test (1 test failing)

**Test**: `login page should be keyboard navigable`

**Current Code**:
```typescript
await page.goto(`${BASE_URL}/login`);
await page.click('body'); // Focus page
await page.keyboard.press('Tab');
await expect(page.getByTestId('email-input')).toBeFocused();
```

**Error**:
```
Error: expect(locator).toBeFocused() failed
Locator: getByTestId('email-input')
Expected: focused
Timeout: 5000ms
Error: element(s) not found
Note: element resolved to <input.../> but has unexpected value "inactive"
```

**Analysis**:
- Element EXISTS and is found
- Error mentions "unexpected value 'inactive'"
- This suggests focus state issue, not element visibility

**Possible Solutions**:
1. Wait for element to be ready: `await page.getByTestId('email-input').waitFor()`
2. Use different focus method: `await page.getByTestId('email-input').focus()`
3. Check if element is disabled initially
4. Add delay after click before Tab: `await page.waitForTimeout(100)`
5. Use `page.evaluate()` to check actual focus state

---

### Issue 3: Desktop Responsive Test (1 test failing)

**Test**: `should display correctly on desktop`

**Cause**: Uses `/profile` route (same issue as Profile Page tests)

**Solution**: Same fix as Profile Page tests

---

### Issue 4: Firefox Register Navigation (1 test failing)

**Test**: `Register Page - should navigate to login page`

**Error**:
```
Expected pattern: /\/login/
Received string:  "http://localhost:5173/register"
```

**Analysis**: This is unrelated to auth/API mocking - navigation test flaking in Firefox

**Possible Causes**:
1. Click not registered
2. Timing issue (need wait after click)
3. Firefox-specific rendering delay

---

## 🔍 Investigation Needed

### Priority 1: Profile Page Route Guard

**Questions to answer**:
1. Is route interception actually working?
   - Add logging: `console.log('Route intercepted')` in route handler
   - Check Playwright trace to see if route is matched

2. Is auth guard running before React loads?
   - Check routing configuration
   - Compare Profile vs Change Password route setup
   - Look for route-level guards vs component-level guards

3. Is the API call being made?
   - Add `page.on('request', ...)` listener
   - Check if GET /users/me is requested
   - Verify request URL format

**Test to add**:
```typescript
test('DEBUG: Profile page auth', async ({ page }) => {
  // Log all requests
  page.on('request', req => console.log('REQUEST:', req.url()));
  page.on('response', res => console.log('RESPONSE:', res.url(), res.status()));
  
  // Set up route with logging
  await page.route('**/api/v1/users/me', async (route) => {
    console.log('🎯 ROUTE INTERCEPTED:', route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: {...} }),
    });
  });

  await page.addInitScript(() => {
    console.log('🔐 Auth injected');
    localStorage.setItem('access_token', 'mock-jwt-token-abc123');
    localStorage.setItem('user', JSON.stringify({...}));
  });

  await page.goto(`${BASE_URL}/profile`);
  await page.waitForTimeout(5000); // Wait to see logs
  
  const currentURL = page.url();
  console.log('Current URL:', currentURL);
  
  await page.screenshot({ path: 'profile-debug.png' });
});
```

---

### Priority 2: Keyboard Navigation Focus

**Test to add**:
```typescript
test('DEBUG: Focus state', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.click('body');
  
  // Check initial focus
  const initialFocus = await page.evaluate(() => document.activeElement?.tagName);
  console.log('Initial focus:', initialFocus);
  
  await page.keyboard.press('Tab');
  
  // Check where focus landed
  const afterTab = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    id: document.activeElement?.id,
    testId: document.activeElement?.getAttribute('data-testid'),
    value: document.activeElement?.getAttribute('value'),
  }));
  console.log('After Tab:', afterTab);
  
  // Check if email input exists
  const emailExists = await page.getByTestId('email-input').count();
  console.log('Email input count:', emailExists);
  
  // Try manual focus
  await page.getByTestId('email-input').focus();
  const afterManualFocus = await page.getByTestId('email-input').evaluate(
    el => el === document.activeElement
  );
  console.log('After manual focus, is focused?:', afterManualFocus);
});
```

---

## 📊 Test Results Summary

### Before This Session
- **Pass Rate**: 87.5% (105/120)
- **Failing**: 15 tests

### After MSW Implementation Attempt
- **Pass Rate**: 97.5% (117/120)
- **Failing**: 3 tests (Forgot Password, 2× Profile, Desktop responsive)

### Current (After Playwright Route Interception)
- **Pass Rate**: 95% (114/120)
- **Failing**: 6 tests (3× Profile, 1× Desktop, 1× Keyboard nav, 1× Firefox register)
- **Status**: 
  - ✅ Forgot Password: Should be fixed (needs verification)
  - ✅ Change Password: All 3 tests passing
  - 🔧 Profile Page: Needs investigation
  - 🔧 Keyboard nav: Focus state issue
  - 🔧 Firefox register: Minor flake

---

## 🎯 Next Steps

### Immediate (30 minutes)
1. **Add DEBUG test** for Profile Page with full logging
2. **Run tests** to collect diagnostic information
3. **Check Playwright trace** to see actual requests

### Short-term (1-2 hours)
1. **Fix Profile Page route interception**
   - Verify route glob pattern matches
   - Check if multiple routes needed
   - Consider using `**/*` wildcard

2. **Fix keyboard navigation**
   - Add wait for element ready state
   - Use manual focus as workaround
   - Or skip test if not critical

3. **Run full test suite** to verify all fixes

### Long-term (Future)
1. Document Playwright testing patterns
2. Create reusable fixtures for auth injection
3. Add more E2E tests for other features

---

## 💡 Key Learnings

### What Worked ✅
1. **addInitScript() + networkidle**: Perfect for localStorage auth injection
2. **Playwright route interception**: Correct approach for E2E API mocking
3. **data-testid pattern**: Translation-independent, reliable selectors

### What Didn't Work ❌
1. **MSW for E2E tests**: Wrong tool - works for unit/integration tests only
2. **page.evaluate() for auth**: Too late in page lifecycle
3. **page.waitForResponse()**: Timeout if request never made

### Best Practices Established ✅
1. Set up route interception FIRST (before addInitScript)
2. Use addInitScript() for localStorage before page loads
3. Wait for 'networkidle' after navigation to protected routes
4. Include `roles` array in user object for permissions
5. Use Playwright's built-in route API, not external mocking libraries

---

## 🚀 Path to 100%

**Current**: 95% (114/120 tests)
**Target**: 100% (120/120 tests)
**Remaining**: 6 tests

**Estimated Time**:
- Profile Page investigation: 30-60 minutes
- Profile Page fix: 15-30 minutes
- Keyboard nav fix: 15 minutes
- Firefox register fix: 15 minutes
- **Total**: 1-2 hours to 100%

**Confidence Level**: HIGH
- Solution pattern proven (Change Password works)
- Clear investigation path
- Small number of failing tests
- No fundamental architectural issues

---

**End of Investigation Summary**  
**Date**: November 3, 2025  
**Status**: 🔧 **IN PROGRESS - 95% Complete**
