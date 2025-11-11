# Code Quality Implementation Plan

**Based on:** CODE_QUALITY_DEEP_DIVE_2025.md  
**Version:** 1.0.0  
**Created:** January 2025  
**Total Effort:** 150 hours (~4 weeks)

---

## Quick Start

This document provides a **step-by-step implementation plan** for fixing the 101 code quality issues identified in the deep dive analysis.

**Read this if you are:**

- 👨‍💻 Developer assigned to fix specific issues
- 🎯 Tech lead planning sprint work
- 📊 Manager tracking progress

---

## Phase 1: Critical Fixes (Week 1)

**Goal:** Fix architecture violations and high-impact DRY issues  
**Effort:** 21 hours  
**Team:** 2-3 developers

### Task 1.1: Migrate Services to apiHelpers

**Priority:** 🔴 P0 Critical  
**Effort:** 12 hours  
**Owner:** Backend Developer

#### Problem

40+ service files directly use `apiClient` instead of centralized `apiHelpers` abstraction:

```typescript
// ❌ CURRENT - Direct apiClient usage
import { apiClient } from '@/services/api/apiClient';
import { unwrapResponse } from '@/services/api/common';

export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return unwrapResponse(response);
  },
};
```

#### Solution

```typescript
// ✅ TARGET - Use apiHelpers
import { get, post, put, del } from '@/core/api/apiHelpers';

export const profileService = {
  getProfile: () => get<UserProfile>('/users/profile'),
  updateProfile: (data: ProfileUpdate) => put('/users/profile', data),
};
```

#### Files to Update

**Profile Domain:**

- `src/domains/profile/services/profileService.ts`

**Users Domain:**

- `src/domains/users/services/userService.ts`

**Auth Domain:**

- `src/domains/auth/services/authService.ts`
- `src/domains/auth/services/secureAuthService.ts`
- `src/domains/auth/services/tokenService.ts`

**Admin Domain:**

- `src/domains/admin/services/adminService.ts`
- `src/domains/admin/services/adminAuditService.ts`
- `src/domains/admin/services/adminApprovalService.ts`
- `src/domains/admin/services/adminExportService.ts`
- `src/domains/admin/services/adminRoleService.ts`
- `src/domains/admin/services/adminAnalyticsService.ts`

#### Steps

1. **Create branch**

   ```bash
   git checkout -b fix/migrate-services-to-apihelpers
   ```

2. **Update imports**

   ```typescript
   // Remove
   import { apiClient } from '@/services/api/apiClient';
   import { unwrapResponse } from '@/services/api/common';

   // Add
   import { get, post, put, del } from '@/core/api/apiHelpers';
   ```

3. **Refactor service methods**

   ```typescript
   // Before
   async getUsers(params) {
     const response = await apiClient.get('/users', { params });
     return unwrapResponse(response);
   }

   // After
   getUsers: (params) => get<User[]>('/users', { params }),
   ```

4. **Run tests**

   ```bash
   npm run test src/domains/profile
   npm run test src/domains/users
   npm run test src/domains/auth
   npm run test src/domains/admin
   ```

5. **Verify types**

   ```bash
   npm run type-check
   ```

6. **Create PR**
   - Title: "Migrate all services to apiHelpers abstraction"
   - Reference: CODE_QUALITY_DEEP_DIVE_2025.md Section 1.2
   - Checklist: All tests pass, types correct, no breaking changes

#### Testing Checklist

- [ ] All existing tests pass
- [ ] No type errors
- [ ] Build succeeds
- [ ] Manual smoke test: Login, fetch users, update profile
- [ ] No console errors in browser

---

### Task 1.2: Consolidate Date Formatters

**Priority:** 🔴 P0 Critical  
**Effort:** 3 hours  
**Owner:** Frontend Developer

#### Problem

Multiple duplicate date formatting functions across codebase:

- `formatTimeRemaining` in `auth/utils/sessionUtils.ts`
- `formatTime` in `auth/components/SessionExpiry.tsx`
- `formatTimestamp` in `admin/components/AuditLogTable.tsx`
- `formatTimestamp` in `admin/components/VirtualizedAuditLogTable.tsx`

#### Solution

**Step 1: Add missing functions to central module**

```typescript
// src/shared/utils/dateFormatters.ts

/**
 * Format duration in human-readable form
 * @example formatDuration(90000) // "1 minute"
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds <= 0) return 'Expired';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

/**
 * Format countdown timer (MM:SS)
 * @example formatCountdown(90) // "1:30"
 */
export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
```

**Step 2: Update sessionUtils.ts**

```typescript
// src/domains/auth/utils/sessionUtils.ts

// Replace local implementation
export { formatDuration as formatTimeRemaining } from '@/shared/utils/dateFormatters';
```

**Step 3: Update SessionExpiry.tsx**

```typescript
// src/domains/auth/components/SessionExpiry.tsx

import { formatCountdown } from '@/shared/utils/dateFormatters';

// Remove local formatTime function
// Replace usage:
<span className="font-bold">{formatCountdown(timeRemaining)}</span>;
```

**Step 4: Update AuditLogTable.tsx**

```typescript
// src/domains/admin/components/AuditLogTable.tsx

import { formatDateTime } from '@/utils/formatters';

// Remove local formatTimestamp
// Replace usage:
{
  formatDateTime(log.timestamp);
}
```

**Step 5: Update VirtualizedAuditLogTable.tsx** (same as above)

#### Files to Update

- ✅ Add: `src/shared/utils/dateFormatters.ts` (2 new functions)
- ✅ Update: `src/utils/formatters.ts` (export new functions)
- ❌ Remove: Local formatTimeRemaining from `sessionUtils.ts`
- ❌ Remove: Local formatTime from `SessionExpiry.tsx`
- ❌ Remove: Local formatTimestamp from `AuditLogTable.tsx`
- ❌ Remove: Local formatTimestamp from `VirtualizedAuditLogTable.tsx`

#### Testing

```bash
npm run test src/shared/utils/dateFormatters.test.ts
npm run test src/domains/auth
npm run test src/domains/admin
```

---

### Task 1.3: Remove Console.log Violations

**Priority:** 🔴 P0 Critical  
**Effort:** 2 hours  
**Owner:** Any Developer

#### Problem

38 instances of `console.log/error/warn/debug` found, should use centralized `logger()`

#### Files to Fix

**1. Config warnings**

```typescript
// src/core/config/index.ts

// Before
console.warn('Missing environment variable:', key);

// After
import { logger } from '@/core/logging/logger';
logger().warn('Missing environment variable', { key });
```

**2. Old logger utility**

```bash
# Delete old logger
rm src/utils/logger.ts
```

**3. Modernization showcase**

```typescript
// src/pages/ModernizationShowcase.tsx

// Before
const startMonitoring = () => console.log('Monitoring active');

// After
import { logger } from '@/core/logging/logger';
const startMonitoring = () => logger().info('AWS CloudWatch: Monitoring active');
```

#### Steps

1. Search and replace:

   ```bash
   # Find all console usage
   grep -r "console\." src/ --exclude-dir=node_modules

   # Replace with logger
   # Do manually to ensure correctness
   ```

2. Add ESLint rule:

   ```json
   // eslint.config.js
   {
     "rules": {
       "no-console": ["error", { "allow": [] }]
     }
   }
   ```

3. Run linter:
   ```bash
   npm run lint -- --fix
   ```

#### Exceptions

Keep console in:

- `src/core/logging/diagnostic.ts` (intentional dev tools)
- `src/domains/auth/utils/authDebugger.ts` (debug utility)

Add eslint-disable comments:

```typescript
// eslint-disable-next-line no-console
console.log('[DEBUG]', data);
```

---

### Task 1.4: Archive Reference Files

**Priority:** 🔴 P0 Critical  
**Effort:** 2 hours  
**Owner:** Any Developer

#### Problem

12 reference UI files in `src/_reference_backup_ui/` clutter the codebase

#### Solution

**Option A: Archive to docs (Recommended)**

```bash
# Create archive directory
mkdir -p docs/archived-reference-examples

# Move files
mv src/_reference_backup_ui/* docs/archived-reference-examples/

# Remove empty directory
rmdir src/_reference_backup_ui

# Update README
cat > docs/archived-reference-examples/README.md << 'EOF'
# Archived Reference Examples

**⚠️ HISTORICAL REFERENCE ONLY**

These files are **archived examples** from the original codebase before refactoring.

**DO NOT USE** these patterns in new code. They contain outdated:
- Validation patterns (use core/validation/validators)
- Component patterns (use current domain structure)
- Import patterns (use absolute imports)

**Purpose:** Historical reference for understanding old codebase decisions.

**For Current Patterns:** See `/docs/` and `/src/design-system/`

Last Active: November 2024  
Archived: January 2025
EOF
```

**Option B: Convert to Storybook**

If patterns are valuable, convert to Storybook stories:

```typescript
// .storybook/stories/FormPatterns.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

export const BasicForm: StoryObj = {
  // ...updated to current patterns
};
```

#### Steps

1. **Choose option** (recommend Option A for now)

2. **Execute migration**

   ```bash
   git checkout -b chore/archive-reference-files
   # Run commands above
   git add .
   git commit -m "chore: Archive reference UI files to docs"
   ```

3. **Update build config** (if needed)

   ```typescript
   // vite.config.ts - Ensure _reference_backup_ui not in build
   ```

4. **Verify no imports**
   ```bash
   grep -r "_reference_backup_ui" src/
   # Should return nothing
   ```

---

### Task 1.5: Setup ESLint Rules

**Priority:** 🔴 P0 Critical  
**Effort:** 2 hours  
**Owner:** Tech Lead

#### Goal

Prevent future violations via automated enforcement

#### Rules to Add

```javascript
// eslint.config.js

export default [
  {
    rules: {
      // Prevent console usage
      'no-console': ['error', { allow: [] }],

      // Prevent relative parent imports
      'import/no-relative-parent-imports': 'error',

      // Remove unused imports
      'unused-imports/no-unused-imports': 'error',

      // Prevent unused variables
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Enforce type-only imports where possible
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
];
```

#### Install Dependencies

```bash
npm install --save-dev eslint-plugin-unused-imports
```

#### Setup Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky lint-staged

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

#### Test

```bash
# Run on all files
npm run lint -- --fix

# Commit to test pre-commit hook
git add .
git commit -m "test: Verify lint rules work"
```

---

## Phase 2: High-Priority Improvements (Week 2-3)

**Goal:** SOLID improvements and remaining DRY issues  
**Effort:** 47 hours  
**Team:** 2-3 developers

### Task 2.1: Enforce Absolute Imports

**Priority:** 🟠 P1 High  
**Effort:** 2 hours

#### Automated Migration

```bash
# Install codemod tool
npm install --save-dev jscodeshift

# Create transform script
cat > scripts/transform-relative-imports.js << 'EOF'
module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find all relative imports
  root.find(j.ImportDeclaration)
    .filter(path => {
      const source = path.value.source.value;
      return source.startsWith('../') || source.startsWith('./');
    })
    .forEach(path => {
      const source = path.value.source.value;
      // Convert to absolute based on project structure
      const absolute = convertToAbsolute(source, fileInfo.path);
      path.value.source.value = absolute;
    });

  return root.toSource();
};
EOF

# Run transform
npx jscodeshift -t scripts/transform-relative-imports.js src/
```

#### Manual Review

Some imports may need manual adjustment. Review git diff carefully.

---

### Task 2.2: Add Data Fetching Abstraction

**Priority:** 🟠 P1 High  
**Effort:** 20 hours  
**Owner:** Senior Developer

#### Goal

Abstract TanStack Query to enable future library changes

#### Create Abstraction Layer

```typescript
// src/core/data-fetching/types.ts

export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface MutationResult<T> {
  mutate: (data: T) => void;
  mutateAsync: (data: T) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export interface DataFetcher {
  useQuery<T>(key: unknown[], fetcher: () => Promise<T>): QueryResult<T>;
  useMutation<T>(mutator: (data: T) => Promise<void>): MutationResult<T>;
  invalidate(key: unknown[]): void;
}
```

```typescript
// src/core/data-fetching/tanstack-adapter.ts

import {
  useQuery as useTanStackQuery,
  useMutation as useTanStackMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { DataFetcher, QueryResult, MutationResult } from './types';

export class TanStackDataFetcher implements DataFetcher {
  useQuery<T>(key: unknown[], fetcher: () => Promise<T>): QueryResult<T> {
    const { data, isLoading, error, refetch } = useTanStackQuery({
      queryKey: key,
      queryFn: fetcher,
    });

    return { data, isLoading, error: error as Error | null, refetch };
  }

  useMutation<T>(mutator: (data: T) => Promise<void>): MutationResult<T> {
    const { mutate, mutateAsync, isPending, error } = useTanStackMutation({
      mutationFn: mutator,
    });

    return {
      mutate,
      mutateAsync,
      isLoading: isPending,
      error: error as Error | null,
    };
  }

  invalidate(key: unknown[]): void {
    const queryClient = useQueryClient();
    queryClient.invalidateQueries({ queryKey: key });
  }
}
```

#### Gradual Migration

**Phase 2a: Create abstraction** (8h)

- Define interfaces
- Implement TanStack adapter
- Write tests

**Phase 2b: Migrate core hooks** (8h)

- Update `useApiModern`
- Update `useOptimisticUpdate`
- Verify functionality

**Phase 2c: Document & review** (4h)

- Add migration guide
- Code review
- Update dev docs

---

### Task 2.3: Consolidate Validation Schemas

**Priority:** 🟠 P1 High  
**Effort:** 5 hours

#### Create Validator-to-Zod Bridge

```typescript
// src/core/validation/zod-bridge.ts

import { z } from 'zod';
import {
  EmailValidator,
  PasswordValidator,
  PhoneValidator,
} from './validators';

export function emailSchema() {
  return z
    .string()
    .refine((val) => new EmailValidator().validate(val).isValid, {
      message: 'Invalid email address',
    });
}

export function passwordSchema() {
  return z
    .string()
    .refine((val) => new PasswordValidator().validate(val).isValid, {
      message: 'Invalid password',
    });
}

// Usage in forms
const formSchema = z.object({
  email: emailSchema(),
  password: passwordSchema(),
});
```

---

### Task 2.4: Split AuthContext

**Priority:** 🟠 P1 High  
**Effort:** 8 hours

#### Current Structure (333 lines)

```typescript
// ⚠️ TOO LARGE - Multiple responsibilities
export function AuthProvider({ children }) {
  // 1. Auth state (80 lines)
  // 2. Session management (100 lines)
  // 3. User updates (50 lines)
  // 4. Token management (100 lines)
}
```

#### Target Structure

```typescript
// 1. Auth state context
// src/domains/auth/context/AuthStateContext.tsx
export const AuthStateContext = createContext<AuthState>();

// 2. Auth actions context
// src/domains/auth/context/AuthActionsContext.tsx
export const AuthActionsContext = createContext<AuthActions>();

// 3. Session context
// src/domains/auth/context/SessionContext.tsx
export const SessionContext = createContext<SessionState>();

// 4. Composed provider
// src/domains/auth/context/AuthProvider.tsx
export function AuthProvider({ children }) {
  return (
    <AuthStateProvider>
      <AuthActionsProvider>
        <SessionProvider>{children}</SessionProvider>
      </AuthActionsProvider>
    </AuthStateProvider>
  );
}
```

---

### Task 2.5: Refactor Large Page Components

**Priority:** 🟠 P1 High  
**Effort:** 12 hours

**Target Pages:**

- `AdminDashboard` (400+ lines)
- `UsersPage` (350+ lines)
- `AuditLogsPage` (300+ lines)

**Pattern:**

1. Extract data logic → custom hooks
2. Extract UI sections → components
3. Keep page as composition only

**Example:**

```typescript
// Before: 350 lines
export function UsersPage() {
  // Everything mixed
}

// After: 50 lines
export function UsersPage() {
  const { users, isLoading } = useUserManagement();
  const actions = useUserActions();

  return (
    <PageLayout>
      <UsersHeader />
      <UsersFilters onFilter={actions.filter} />
      <UsersTable users={users} isLoading={isLoading} actions={actions} />
    </PageLayout>
  );
}
```

---

## Phase 3: Medium-Priority Polish (Week 4-6)

**Goal:** Code quality and maintainability  
**Effort:** 19 hours

### Task 3.1: Segregate API Response Types

**Priority:** 🟡 P2 Medium  
**Effort:** 10 hours

Create focused types for different use cases:

```typescript
// List views - minimal data
export interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// Detail views - full data
export interface UserDetail extends UserListItem {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin views - with audit
export interface UserAdmin extends UserDetail {
  permissions: Permission[];
  sessions: SessionInfo[];
  auditLog: AuditEntry[];
}
```

---

### Task 3.2: Add Storage Abstraction

**Priority:** 🟡 P2 Medium  
**Effort:** 4 hours

```typescript
// src/core/storage/types.ts
export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// src/core/storage/browser-storage.ts
export class BrowserStorage implements Storage {
  constructor(private storage: globalThis.Storage = localStorage) {}

  getItem(key: string) {
    return this.storage.getItem(key);
  }
  setItem(key: string, value: string) {
    this.storage.setItem(key, value);
  }
  removeItem(key: string) {
    this.storage.removeItem(key);
  }
  clear() {
    this.storage.clear();
  }
}

// Usage
const storage: Storage = new BrowserStorage();
// Easy to mock for tests
const mockStorage: Storage = new MockStorage();
```

---

### Task 3.3-3.5: Cleanup Tasks

**Remove Unused Imports:** 1 hour (automated via ESLint)  
**Review Orphaned Tests:** 2 hours (manual review)  
**Improve RBAC Consistency:** 2 hours (ensure role hierarchy usage)

---

## Progress Tracking

### Sprint Board Template

```markdown
## Sprint 1: Critical Fixes

### To Do

- [ ] Task 1.1: Migrate services to apiHelpers
- [ ] Task 1.2: Consolidate date formatters
- [ ] Task 1.3: Remove console.log violations
- [ ] Task 1.4: Archive reference files
- [ ] Task 1.5: Setup ESLint rules

### In Progress

### Done

### Blocked
```

---

## Success Criteria

### Definition of Done

Each task is considered done when:

- [ ] Code changes implemented
- [ ] All tests pass
- [ ] No type errors
- [ ] ESLint passes
- [ ] Code reviewed by senior developer
- [ ] Documentation updated
- [ ] PR merged to main
- [ ] Deployed to staging
- [ ] Manual smoke test passed

### Phase Completion Metrics

**Phase 1 Complete When:**

- [ ] All services use apiHelpers
- [ ] No duplicate date formatting
- [ ] No console.log violations
- [ ] Reference files archived
- [ ] ESLint rules active

**Phase 2 Complete When:**

- [ ] All imports absolute
- [ ] Data fetching abstraction in place
- [ ] Validation consolidated
- [ ] AuthContext split
- [ ] Large pages refactored

**Phase 3 Complete When:**

- [ ] API types optimized
- [ ] Storage abstraction added
- [ ] No unused imports
- [ ] Test suite lean
- [ ] RBAC consistent

---

## Communication

### Daily Standups

**Each developer reports:**

- What I completed yesterday
- What I'm working on today
- Any blockers

### Weekly Review

**Team reviews:**

- Progress vs plan
- Blockers and solutions
- Next week priorities

### PR Review Guidelines

**Reviewers check:**

- [ ] Follows implementation plan
- [ ] Tests included
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] ESLint passes
- [ ] Types correct

---

## Risk Management

### Common Issues & Solutions

**Issue:** "Tests failing after refactoring"

- **Solution:** Update test mocks, verify test data

**Issue:** "Type errors after abstracting TanStack Query"

- **Solution:** Review generic types, ensure proper type inference

**Issue:** "Performance regression"

- **Solution:** Profile before/after, optimize if needed

**Issue:** "Merge conflicts"

- **Solution:** Coordinate with team, rebase frequently

---

## Resources

### Documentation

- [CODE_QUALITY_DEEP_DIVE_2025.md](./CODE_QUALITY_DEEP_DIVE_2025.md) - Full analysis
- [COMPREHENSIVE_CODE_AUDIT_2025.md](./COMPREHENSIVE_CODE_AUDIT_2025.md) - Initial audit
- [API_PATTERNS.md](./API_PATTERNS.md) - API architecture

### Tools

- ESLint: Code quality enforcement
- TypeScript: Type checking
- Vitest: Unit testing
- Playwright: E2E testing

### Contacts

- **Tech Lead:** Review decisions
- **Senior Dev:** Architecture questions
- **QA:** Testing assistance

---

**End of Implementation Plan**
