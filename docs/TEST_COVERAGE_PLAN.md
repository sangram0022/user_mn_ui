# Test Coverage & Implementation Plan

## Current Status

- **Test Pass Rate:** 387/423 (91.5%)
- **Failed Tests:** 2 (rate limiting timeout issues)
- **Skipped Tests:** 34
- **Missing Test Files:** 5 critical session management tests
- **Target Coverage:** 100%

---

## Phase 1: Fix Failing Tests (1-2 hours)

### Issue 1: Rate Limit Test Timeout

**File:** `src/lib/api/__tests__/api-errors.test.ts`
**Lines:** 218, 293
**Problem:** Tests timeout after 10 seconds during rate limit retry logic
**Root Cause:** Possible infinite loop or miscalculated retry delays

**Fix Strategy:**

1. Increase test timeout to 20 seconds
2. Add debug logging to retry logic
3. Verify mock fetch is resolving properly
4. Check exponential backoff calculation

---

## Phase 2: Create Session Management Tests (4-6 hours)

### Test File 1: useSessionManagement.test.ts

```typescript
// src/hooks/__tests__/useSessionManagement.test.ts

describe('useSessionManagement Hook', () => {
  // ✅ Session Initialization
  - should initialize session on user login
  - should restore session from sessionStorage
  - should clear expired session

  // ✅ Activity Tracking
  - should update activity on mouse movement
  - should update activity on keyboard input
  - should update activity on scroll
  - should update activity on touch
  - should clear warning on activity

  // ✅ Timeout Management
  - should show warning 5 minutes before timeout
  - should extend session on activity
  - should automatically logout on timeout
  - should track remaining time countdown

  // ✅ Manual Control
  - should allow manual session extension
  - should allow manual logout
  - should clear all session data on logout

  // ✅ Edge Cases
  - should handle multiple rapid activity events
  - should prevent duplicate setup in StrictMode
  - should cleanup listeners on unmount
  - should handle missing sessionStorage gracefully
})
```

### Test File 2: tokenService.test.ts

```typescript
// src/shared/services/auth/__tests__/tokenService.test.ts

describe('TokenService', () => {
  // ✅ Token Storage
  - should store tokens securely
  - should store in cookies (production)
  - should store in localStorage (development)
  - should set proper cookie attributes

  // ✅ Token Retrieval
  - should get access token
  - should get refresh token
  - should get user info

  // ✅ Token Expiration
  - should detect expired access token
  - should detect expired refresh token
  - should check authentication status

  // ✅ Token Management
  - should clear all tokens
  - should update access token only
  - should handle concurrent token operations

  // ✅ Security
  - should not expose tokens in logs
  - should use secure cookie flags
  - should validate token format
})
```

### Test File 3: secureTokenStore.test.ts

```typescript
// src/shared/services/auth/__tests__/secureTokenStore.test.ts

describe('SecureTokenStore', () => {
  // ✅ Encryption/Decryption
  - should encrypt tokens before storage
  - should decrypt tokens from storage
  - should handle encryption errors
  - should validate encryption key

  // ✅ Token Operations
  - should store and retrieve tokens
  - should update access token only
  - should clear all tokens

  // ✅ Expiry Handling
  - should validate token expiry
  - should apply buffer time correctly
  - should return null for expired tokens
  - should get time until expiry

  // ✅ Security
  - should check if tokens exist
  - should get token data (debug only)
  - should handle corrupted data
})
```

### Test File 4: csrfTokenService.test.ts

```typescript
// src/shared/services/auth/__tests__/csrfTokenService.test.ts

describe('CSRFTokenService', () => {
  // ✅ Token Fetching
  - should fetch CSRF token from server
  - should validate token format
  - should set token expiry

  // ✅ Token Storage
  - should store token in sessionStorage
  - should load token from sessionStorage
  - should clear token from storage

  // ✅ Token Refresh
  - should refresh expired token
  - should prevent duplicate refresh requests
  - should use refresh threshold correctly

  // ✅ Token Validation
  - should detect expired token
  - should validate token length

  // ✅ Error Handling
  - should handle network errors
  - should handle invalid server response
  - should handle storage errors
})
```

### Test File 5: SessionWarningModal.test.tsx

```typescript
// src/domains/session/components/__tests__/SessionWarningModal.test.tsx

describe('SessionWarningModal', () => {
  // ✅ Rendering
  - should not render when isOpen is false
  - should render modal when isOpen is true
  - should display remaining time
  - should format countdown correctly

  // ✅ User Interactions
  - should call onExtend when "Stay Logged In" clicked
  - should call onLogout when "Log Out Now" clicked
  - should call onLogout on Escape key

  // ✅ Auto-logout
  - should call onLogout when countdown reaches 0
  - should update countdown every second

  // ✅ Focus Management
  - should focus "Stay Logged In" button on open
  - should trap focus within modal

  // ✅ Accessibility
  - should have proper aria-modal
  - should have aria-labelledby
  - should have aria-describedby
  - should be keyboard navigable
})
```

---

## Phase 3: Integration Tests (2-3 hours)

### Session Flow Integration Tests

```typescript
// src/__tests__/session-integration.test.ts

describe('Session Management Integration', () => {
  // ✅ Complete Session Flow
  - should complete full session lifecycle (login → active → warning → logout)
  - should refresh token before expiry
  - should detect and recover from network errors
  - should handle concurrent token operations

  // ✅ XSS Attack Prevention
  - should prevent XSS via token injection
  - should sanitize token data
  - should validate encryption integrity

  // ✅ CSRF Attack Prevention
  - should include CSRF token in state-changing requests
  - should validate CSRF token on server-side
  - should refresh expired CSRF token

  // ✅ Session Hijacking Prevention
  - should maintain session security across tab switches
  - should detect immediate session expiry
  - should handle session conflicts
})
```

---

## Phase 4: Coverage Goals

### Current Coverage by Component

```text
✅ API Client:           ~95% (retries, errors, requests)
✅ Error Handling:       ~90% (various error types)
✅ UI Components:        ~85% (accessibility tests)
✅ Utilities:            ~88% (validation, logging)
⚠️  Session Management:  ~0% (MISSING - PRIORITY)
⚠️  Token Service:       ~0% (MISSING - PRIORITY)
⚠️  CSRF Service:        ~0% (MISSING - PRIORITY)
```

### Target Coverage After Implementation

```text
✅ API Client:           95%+ (no changes needed)
✅ Error Handling:       95%+ (fix timeout tests)
✅ Session Management:   100% (new comprehensive tests)
✅ Token Service:        100% (new comprehensive tests)
✅ CSRF Service:         100% (new comprehensive tests)
✅ Overall:             100% (all tests passing)
```

---

## Test Execution Commands

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/hooks/__tests__/useSessionManagement.test.ts

# Run and watch
npm run test -- --watch

# Run failing tests only
npm run test -- --grep "Rate Limit"

# View coverage report
npx vite preview --outDir coverage
```

---

## Implementation Timeline

| Phase | Task                    | Duration  | Target Date |
| ----- | ----------------------- | --------- | ----------- |
| 1     | Fix rate limit timeouts | 1-2 hours | Today       |
| 2     | Create 5 test files     | 4-6 hours | Tomorrow    |
| 3     | Write 50+ test cases    | 6-8 hours | Day 3       |
| 4     | Add integration tests   | 2-3 hours | Day 3       |
| 5     | Achieve 100% coverage   | 1-2 hours | Day 4       |
| 6     | Review & document       | 1 hour    | Day 4       |

**Total Estimated Time:** 15-22 hours over 4 days

---

## Quality Assurance Checklist

- [ ] All 423 tests passing
- [ ] 100% code coverage achieved
- [ ] No TypeScript errors
- [ ] ESLint 0 errors
- [ ] Prettier formatting applied
- [ ] All tests run in < 120 seconds
- [ ] No flaky tests
- [ ] Documentation updated
- [ ] Changes committed to git
- [ ] Ready for production deployment
