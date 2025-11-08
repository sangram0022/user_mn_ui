# Token & Session Management - Improvement Plan

**Date:** November 9, 2025  
**Status:** Ready for Implementation  
**Estimated Effort:** 3.5 days  
**Priority:** Medium (Current implementation is production-ready)

---

## Executive Summary

Based on the comprehensive audit, the token/session implementation is **excellent (9.2/10)** and production-ready. This plan addresses minor inconsistencies and improvements for better maintainability and code clarity.

**Key Findings:**
- ✅ Core functionality is solid and secure
- ✅ No critical bugs or security issues
- ⚠️ Minor code duplication (authStorage vs tokenService)
- ⚠️ Some direct localStorage access bypassing services
- ⚠️ Token stored in both localStorage and React state

---

## Issues to Address

### 1. Dual Storage Abstractions (Priority: HIGH)

**Problem:** Two services provide overlapping localStorage functionality

**Files:**
- `src/domains/auth/services/tokenService.ts` (Primary, used by interceptors)
- `src/domains/auth/utils/authStorage.ts` (Unclear purpose, possibly unused)

**Impact:** 
- Developer confusion
- Potential inconsistency
- Harder to maintain

**Solution Options:**

#### Option A: Remove authStorage.ts (Recommended)

```bash
# Step 1: Check usage
grep -r "authStorage" src/ --exclude-dir=node_modules

# Step 2: If no usage found, remove
rm src/domains/auth/utils/authStorage.ts

# Step 3: Update imports if any exist
# Replace: import { authStorage } from '...'
# With: import tokenService from '...'
```

#### Option B: Document Separation of Concerns

```typescript
/**
 * authStorage.ts - Simple localStorage abstraction
 * 
 * PURPOSE: Lightweight storage utilities for React components
 * USE WHEN: You need simple get/set without API calls
 * 
 * DON'T USE FOR: Token refresh, API calls (use tokenService instead)
 * 
 * RELATIONSHIP:
 * - tokenService: Full-featured service with API integration
 * - authStorage: Simple storage layer for components
 */
```

**Recommendation:** Choose Option A unless authStorage serves a specific documented purpose.

**Effort:** 2 hours  
**Risk:** Low

---

### 2. Centralize localStorage Access (Priority: HIGH)

**Problem:** Some components directly access localStorage for auth data

**Files to Update:**

#### `src/core/auth/AuthContext.tsx`

**Current Code:**
```typescript
// Line 35
const storedUser = localStorage.getItem('auth_user');

// Line 58
localStorage.removeItem('auth_user');

// Line 135
localStorage.setItem('auth_user', JSON.stringify(userData));

// Line 147
localStorage.setItem('auth_user', JSON.stringify(updatedUser));
```

**Fixed Code:**
```typescript
// Use tokenService instead
const storedUser = tokenService.getUser();

tokenService.removeUser();

tokenService.storeUser(userData);

tokenService.storeUser(updatedUser);
```

**Steps:**

1. Update AuthContext.tsx:
```typescript
// Before
useEffect(() => {
  const initAuth = async () => {
    const storedToken = tokenService.getAccessToken();
    
    if (storedToken) {
      try {
        setToken(storedToken);
        const storedUser = localStorage.getItem('auth_user'); // ❌
        if (storedUser) {
          setUser(JSON.parse(storedUser)); // ❌
        }
      } catch (error) {
        // ...
      }
    }
  };
}, []);

// After
useEffect(() => {
  const initAuth = async () => {
    const storedToken = tokenService.getAccessToken();
    
    if (storedToken) {
      try {
        setToken(storedToken);
        const storedUser = tokenService.getUser(); // ✅
        if (storedUser) {
          setUser(storedUser as User); // ✅
        }
      } catch (error) {
        // ...
      }
    }
  };
}, []);
```

2. Update login function:
```typescript
// Before
async function login(credentials: LoginCredentials) {
  // ...
  setToken(data.access_token);
  setUser(userData);
  localStorage.setItem('auth_user', JSON.stringify(userData)); // ❌
}

// After
async function login(credentials: LoginCredentials) {
  // ...
  setToken(data.access_token);
  setUser(userData);
  tokenService.storeUser(userData); // ✅
}
```

3. Update refreshAuth function:
```typescript
// Before
if (user && data.email !== user.email) {
  const updatedUser: User = { ...user, email: data.email, roles: data.roles };
  setUser(updatedUser);
  localStorage.setItem('auth_user', JSON.stringify(updatedUser)); // ❌
}

// After
if (user && data.email !== user.email) {
  const updatedUser: User = { ...user, email: data.email, roles: data.roles };
  setUser(updatedUser);
  tokenService.storeUser(updatedUser); // ✅
}
```

**Effort:** 2 hours  
**Risk:** Low (well-tested)

---

### 3. Remove Token from AuthContext State (Priority: MEDIUM)

**Problem:** Token stored in both localStorage and React state

**File:** `src/core/auth/AuthContext.tsx`

**Current Implementation:**
```typescript
const [token, setToken] = useState<string | null>(null);
const isAuthenticated = !!user && !!token;

// Token in localStorage via tokenService
// Token in state via setToken()
// Must keep both in sync!
```

**Proposed Implementation:**
```typescript
// Remove token from state
const isAuthenticated = !!user && !!tokenService.getAccessToken();

// No need to maintain token in state
// Single source of truth: localStorage via tokenService
```

**Detailed Changes:**

#### Step 1: Remove token state
```typescript
// Before
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // ❌ Remove
  const [isLoading, setIsLoading] = useState(true);
  
  const isAuthenticated = !!user && !!token; // ❌ Remove token check
}

// After
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAuthenticated = !!user && !!tokenService.getAccessToken(); // ✅
}
```

#### Step 2: Remove setToken calls
```typescript
// Before
async function login(credentials: LoginCredentials) {
  // ...
  setToken(data.access_token); // ❌ Remove
  setUser(userData);
}

// After
async function login(credentials: LoginCredentials) {
  // ...
  // Token already in localStorage via tokenService.storeTokens()
  setUser(userData);
}
```

#### Step 3: Update logout
```typescript
// Before
function logout() {
  tokenService.clearTokens();
  setUser(null);
  setToken(null); // ❌ Remove
}

// After
function logout() {
  tokenService.clearTokens();
  setUser(null);
  // Token cleared via tokenService
}
```

#### Step 4: Update refreshAuth
```typescript
// Before
async function refreshAuth() {
  // ...
  tokenService.storeTokens({ ... });
  setToken(data.access_token); // ❌ Remove
}

// After
async function refreshAuth() {
  // ...
  tokenService.storeTokens({ ... });
  // Token updated via tokenService
}
```

#### Step 5: Update useEffect initialization
```typescript
// Before
useEffect(() => {
  const initAuth = async () => {
    const storedToken = tokenService.getAccessToken();
    
    if (storedToken) {
      setToken(storedToken); // ❌ Remove
      const storedUser = tokenService.getUser();
      if (storedUser) {
        setUser(storedUser as User);
      }
    } else {
      tokenService.clearTokens();
    }
    setIsLoading(false);
  };
  
  initAuth();
}, []);

// After
useEffect(() => {
  const initAuth = async () => {
    const storedToken = tokenService.getAccessToken();
    
    if (storedToken) {
      // No need to set token in state
      const storedUser = tokenService.getUser();
      if (storedUser) {
        setUser(storedUser as User);
      }
    } else {
      tokenService.clearTokens();
    }
    setIsLoading(false);
  };
  
  initAuth();
}, []);
```

#### Step 6: Update AuthContext type
```typescript
// Before
export interface AuthContextType {
  user: User | null;
  token: string | null; // ❌ Remove
  isAuthenticated: boolean;
  // ...
}

// After
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  // ...
}
```

**Benefits:**
- ✅ Single source of truth for token
- ✅ No synchronization issues
- ✅ Simpler state management
- ✅ Fewer potential bugs

**Testing Required:**
1. ✅ Login flow
2. ✅ Logout flow
3. ✅ Token refresh
4. ✅ isAuthenticated checks
5. ✅ Protected routes
6. ✅ API calls with token injection

**Effort:** 3 hours  
**Risk:** Medium (affects core auth flow, needs thorough testing)

---

### 4. Document Diagnostic Tool Fetch Usage (Priority: LOW)

**Problem:** Diagnostic tool uses raw fetch without explanation

**File:** `src/core/api/diagnosticTool.ts`

**Current Code:**
```typescript
testEndpoints: async () => {
  const token = localStorage.getItem('access_token');
  
  // Uses fetch instead of apiClient
  const userResponse = await fetch(`${baseURL}/api/v1/admin/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}
```

**Fixed Code:**
```typescript
/**
 * Test API endpoints directly
 * 
 * IMPORTANT: This function intentionally uses raw fetch() instead of apiClient
 * to diagnose token injection and interceptor behavior. Using apiClient would
 * defeat the purpose of this diagnostic tool since we need to test the
 * interceptors themselves.
 * 
 * DO NOT refactor this to use apiClient!
 */
testEndpoints: async () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.error('❌ No access token found');
    return;
  }
  
  const baseURL = 'http://localhost:8000';
  
  // Test User API (working)
  console.log('\n🧪 Testing User API...');
  try {
    // Direct fetch allows us to verify token injection behavior
    const userResponse = await fetch(`${baseURL}/api/v1/admin/users?page=1&page_size=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    // ...
  } catch (error) {
    console.error('❌ User API Request Failed:', error);
  }
}
```

**Effort:** 15 minutes  
**Risk:** None

---

### 5. Add Content-Security-Policy Headers (Priority: MEDIUM)

**Problem:** localStorage tokens vulnerable to XSS (standard SPA risk)

**Mitigation:** Add CSP headers to prevent XSS attacks

**Implementation Locations:**

#### Option A: Nginx Configuration (Production)

**File:** `nginx.conf`

```nginx
server {
  listen 80;
  
  # Add CSP headers
  add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://api.yourdomain.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  " always;
  
  # Additional security headers
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  
  # ...rest of config
}
```

#### Option B: Vite Configuration (Development)

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  },
  // ...
});
```

#### Option C: React Helmet (Runtime)

**File:** `src/App.tsx`

```typescript
import { Helmet } from 'react-helmet-async';

function App() {
  return (
    <>
      <Helmet>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'" />
      </Helmet>
      {/* ...rest of app */}
    </>
  );
}
```

**Recommendation:** Use Option A (nginx) for production deployment

**Effort:** 2 hours (including testing)  
**Risk:** Medium (may break inline scripts, needs testing)

---

## Implementation Timeline

### Phase 1: Code Cleanup (Day 1)

**Morning (4 hours):**
1. ✅ Audit `authStorage.ts` usage across codebase
2. ✅ Decision: Remove or document
3. ✅ Centralize localStorage access in AuthContext
4. ✅ Update all direct localStorage calls

**Afternoon (4 hours):**
1. ✅ Add documentation to diagnostic tool
2. ✅ Code review and testing
3. ✅ Commit: "refactor: centralize auth storage access"

**Deliverables:**
- [ ] authStorage removed OR documented
- [ ] All auth localStorage access goes through tokenService
- [ ] Documentation updated

---

### Phase 2: State Simplification (Day 2 Morning)

**Morning (4 hours):**
1. ✅ Remove token from AuthContext state
2. ✅ Update all references to use tokenService
3. ✅ Update AuthContextType interface
4. ✅ Comprehensive testing:
   - Login/logout flows
   - Token refresh
   - Protected routes
   - API calls

**Deliverables:**
- [ ] Token removed from React state
- [ ] All tests passing
- [ ] Commit: "refactor: use tokenService as single source of truth"

---

### Phase 3: Security Enhancements (Day 2 Afternoon + Day 3)

**Afternoon (4 hours):**
1. ✅ Add CSP headers to nginx.conf
2. ✅ Test CSP headers in staging
3. ✅ Verify no inline script breakage

**Day 3 Morning (4 hours):**
1. ✅ Add additional security headers
2. ✅ Review CORS configuration
3. ✅ Security audit checklist
4. ✅ Documentation update

**Deliverables:**
- [ ] CSP headers configured
- [ ] Security headers verified
- [ ] Security audit complete

---

### Phase 4: Nice-to-Have Improvements (Day 3 Afternoon + Day 4)

**Day 3 Afternoon (4 hours):**
1. ✅ Session expiry warning UI component
2. ✅ Token refresh metrics/logging
3. ✅ User activity dashboard (admin)

**Day 4 (Optional):**
1. ✅ Additional observability
2. ✅ Performance monitoring
3. ✅ Final documentation

**Deliverables:**
- [ ] Session warning modal
- [ ] Token refresh metrics
- [ ] Admin activity dashboard

---

## Testing Checklist

### Unit Tests

- [ ] tokenService.storeTokens()
- [ ] tokenService.getAccessToken()
- [ ] tokenService.getRefreshToken()
- [ ] tokenService.clearTokens()
- [ ] tokenService.isTokenExpired()
- [ ] sessionUtils.isSessionIdle()
- [ ] sessionUtils.checkSessionHealth()

### Integration Tests

- [ ] Login flow with token storage
- [ ] Logout flow with token clearing
- [ ] Token refresh on 401 error
- [ ] Multiple 401s during refresh (queue test)
- [ ] API calls with automatic token injection
- [ ] CSRF token injection for mutations
- [ ] Expired token redirect to login

### E2E Tests

- [ ] User logs in → token stored
- [ ] User makes API call → token injected
- [ ] Token expires → auto refresh
- [ ] Refresh fails → redirect to login
- [ ] User logs out → token cleared
- [ ] Protected route without token → redirect

### Manual Testing

- [ ] Login with "Remember Me"
- [ ] Login without "Remember Me"
- [ ] Session idle timeout
- [ ] Browser refresh maintains session
- [ ] Multiple tabs (token sync)
- [ ] Network error retry
- [ ] DevTools console (no errors)

---

## Rollback Plan

If issues arise during implementation:

### Step 1: Git Revert
```bash
git log --oneline -10
git revert <commit-hash>
git push origin main
```

### Step 2: Emergency Fixes
- Restore original AuthContext.tsx
- Restore original apiClient.ts
- Clear user localStorage on next login

### Step 3: Communicate
- Notify team of rollback
- Document issue in GitHub
- Schedule fix for next sprint

---

## Success Metrics

### Code Quality
- [ ] ESLint: 0 errors
- [ ] TypeScript: 0 errors
- [ ] Test coverage: >85%
- [ ] Code duplication: <5%

### Performance
- [ ] Token operations: <1ms
- [ ] API calls: No regression
- [ ] Bundle size: No increase

### Security
- [ ] CSP headers active
- [ ] No XSS vulnerabilities
- [ ] Token refresh working
- [ ] CSRF protection enabled

---

## Post-Implementation

### Documentation Updates

1. **Update README.md:**
   - Token management architecture
   - How to use tokenService
   - Security best practices

2. **Update API Documentation:**
   - Authentication flow diagrams
   - Token refresh process
   - Error handling patterns

3. **Update Developer Guide:**
   - How to add new authenticated API calls
   - When to use tokenService vs direct storage
   - Testing authenticated requests

### Team Training

1. **Code walkthrough session:**
   - New token architecture
   - Why changes were made
   - How to maintain going forward

2. **Best practices document:**
   - Always use tokenService for auth storage
   - Never access localStorage directly for tokens
   - How to handle 401 errors in new code

---

## Conclusion

This improvement plan addresses all minor issues found in the audit while maintaining the excellent foundation already in place. The current implementation is production-ready, and these improvements focus on:

1. ✅ **Consistency** - Single source of truth for storage
2. ✅ **Maintainability** - Easier to understand and modify
3. ✅ **Security** - Enhanced XSS protection
4. ✅ **Code Quality** - Eliminate duplication

**Total Effort:** 3.5 days  
**Risk Level:** Low to Medium  
**Recommended Approach:** Implement in phases, test thoroughly at each stage

---

## Approval & Sign-off

- [ ] Technical Lead Review
- [ ] Security Team Approval
- [ ] QA Test Plan Approved
- [ ] Deployment Plan Approved
- [ ] Rollback Plan Verified

**Approved by:** _______________  
**Date:** _______________

---

**Document Version:** 1.0  
**Last Updated:** November 9, 2025  
**Status:** Ready for Implementation
