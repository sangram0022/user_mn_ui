# 🔄 DDD Migration Guide - Step-by-Step

**Project**: User Management UI  
**Migration**: Traditional Structure → Domain-Driven Design (DDD)  
**Duration**: 2-4 weeks (recommended incremental approach)  
**Risk Level**: Medium (requires careful testing)

---

## 📋 Table of Contents

1. [Migration Overview](#migration-overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Phase 1: Infrastructure Setup](#phase-1-infrastructure-setup)
4. [Phase 2: Domain Creation](#phase-2-domain-creation)
5. [Phase 3: Code Migration](#phase-3-code-migration)
6. [Phase 4: Testing & Validation](#phase-4-testing--validation)
7. [Phase 5: Cleanup](#phase-5-cleanup)
8. [Rollback Plan](#rollback-plan)

---

## 🎯 Migration Overview

### Current Structure → Target Structure

**BEFORE** (Traditional):
```
src/
├── components/          # All components mixed together
├── hooks/              # All hooks mixed together
├── services/           # All services mixed together
├── utils/              # All utilities mixed together
└── types/              # All types mixed together
```

**AFTER** (DDD):
```
src/
├── domains/            # Business domains (auth, users, workflows, etc.)
├── infrastructure/     # External concerns (API, storage, monitoring)
├── shared/             # Truly reusable code (UI, utilities, hooks)
└── app/                # Application bootstrap
```

### Migration Goals

✅ **Achieved Benefits**:
- Clear domain boundaries
- Improved testability
- Better scalability
- Team productivity
- Reduced coupling

---

## ✅ Pre-Migration Checklist

### 1. Backup & Version Control

```bash
# Create migration branch
git checkout -b feature/ddd-architecture-migration

# Ensure clean working tree
git status

# Tag current state
git tag pre-ddd-migration
```

### 2. Documentation Review

- [ ] Read `ARCHITECTURE.md` completely
- [ ] Understand domain boundaries
- [ ] Identify current components/services
- [ ] Map components to domains

### 3. Environment Setup

```bash
# Install dependencies (if needed)
npm install

# Run tests to establish baseline
npm test

# Build to ensure no errors
npm run build
```

### 4. Team Communication

- [ ] Notify team of migration start
- [ ] Schedule code freeze (if necessary)
- [ ] Plan code review sessions
- [ ] Set up migration tracking board

---

## 🔧 Phase 1: Infrastructure Setup

**Duration**: 2-3 days  
**Risk**: Low  
**Goal**: Create infrastructure layer without breaking existing code

### Step 1.1: Create Infrastructure Folders

```bash
# Create infrastructure structure
mkdir -p src/infrastructure/{api,storage,monitoring,security}
mkdir -p src/infrastructure/api/{services,utils}
mkdir -p src/infrastructure/storage/adapters
mkdir -p src/infrastructure/monitoring/hooks
mkdir -p src/infrastructure/security/utils
```

✅ **Status**: COMPLETE (folders already created)

### Step 1.2: Move API Client to Infrastructure

**Current Location**: `src/services/apiClient.ts` or `src/utils/api.ts`  
**Target Location**: `src/infrastructure/api/apiClient.ts`

```bash
# Move API client
mv src/services/apiClient.ts src/infrastructure/api/apiClient.ts
# OR
mv src/utils/api.ts src/infrastructure/api/apiClient.ts
```

**Update imports** in `apiClient.ts`:
```typescript
// Before
import axios from 'axios';

// After (if using barrel exports)
import axios from 'axios';
import type { ApiResponse, ApiError } from './types';
```

### Step 1.3: Move Logger to Infrastructure

**Current Location**: Check for logger in `src/utils/` or `src/services/`  
**Target Location**: `src/infrastructure/monitoring/logger.ts`

```bash
# If logger exists
mv src/utils/logger.ts src/infrastructure/monitoring/logger.ts
```

### Step 1.4: Move GlobalErrorHandler to Infrastructure

**Current Location**: May be in `src/utils/errorHandling.ts`  
**Target Location**: `src/infrastructure/monitoring/GlobalErrorHandler.ts`

```bash
# Move error handler
mv src/utils/errorHandling.ts src/infrastructure/monitoring/GlobalErrorHandler.ts
```

### Step 1.5: Create Infrastructure Barrel Exports

Create `src/infrastructure/api/index.ts`:
```typescript
export { apiClient } from './apiClient';
export * from './types';
```

Create `src/infrastructure/monitoring/index.ts`:
```typescript
export { logger } from './logger';
export { GlobalErrorHandler } from './GlobalErrorHandler';
export * from './types';
```

### Step 1.6: Update Infrastructure Imports

Find and replace imports across codebase:

```bash
# Find all apiClient imports
grep -r "from.*apiClient" src/

# Find all logger imports
grep -r "from.*logger" src/
```

**Update pattern**:
```typescript
// Before
import { apiClient } from '../services/apiClient';
import { logger } from '../utils/logger';

// After
import { apiClient } from '@infrastructure/api';
import { logger } from '@infrastructure/monitoring';
```

### Step 1.7: Test Infrastructure Layer

```bash
# Run tests
npm test

# Build project
npm run build

# Check for errors
npm run lint
```

**Expected Result**: ✅ No build errors, all tests pass

---

## 🏗️ Phase 2: Domain Creation

**Duration**: 3-5 days  
**Risk**: Medium  
**Goal**: Create domain structure and identify domain boundaries

### Step 2.1: Identify Domains

Review your codebase and identify domains. Based on your files:

**Identified Domains**:
1. **Authentication Domain** (`domains/authentication/`)
   - Login, Register, Password Reset
   - Components: `LoginPageFixed.tsx`, `LoginPageNew.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`
   
2. **User Management Domain** (`domains/user-management/`)
   - User CRUD, User List, User Profile
   - Components: `UserManagement.tsx`, `UserManagementEnhanced.tsx`, `AccountPage.tsx`, `ProfilePage.tsx`
   
3. **Workflow Engine Domain** (`domains/workflow-engine/`)
   - Workflow Management, Approvals, Tasks
   - Components: `WorkflowManagement.tsx`, `ApprovalsPage.tsx`
   
4. **Analytics Dashboard Domain** (`domains/analytics-dashboard/`)
   - Dashboard, Analytics, Reports
   - Components: `Dashboard.tsx`, `DashboardNew.tsx`, `Analytics.tsx`, `ReportsPage.tsx`
   
5. **System Administration Domain** (`domains/system-administration/`)
   - System Settings, Security, Moderation
   - Components: `SettingsPage.tsx`, `SecurityPage.tsx`, `ModerationPage.tsx`, `SystemStatus.tsx`, `ActivityPage.tsx`

### Step 2.2: Create Domain Folders

```bash
# Create all domains
mkdir -p src/domains/{authentication,user-management,workflow-engine,analytics-dashboard,system-administration}

# Create standard domain structure for each
for domain in authentication user-management workflow-engine analytics-dashboard system-administration; do
  mkdir -p src/domains/$domain/{components,hooks,services,types,pages,utils}
  touch src/domains/$domain/index.ts
done
```

✅ **Status**: Authentication domain structure COMPLETE

### Step 2.3: Create Domain Type Definitions

For each domain, create `types/` files:

**Example - Authentication Domain** (✅ COMPLETE):
- `src/domains/authentication/types/auth.types.ts`

**TODO - Other Domains**:
- `src/domains/user-management/types/user.types.ts`
- `src/domains/workflow-engine/types/workflow.types.ts`
- `src/domains/analytics-dashboard/types/analytics.types.ts`
- `src/domains/system-administration/types/admin.types.ts`

### Step 2.4: Plan Component Migration

Create a migration map:

| Current Component | Target Domain | Target Location |
|------------------|---------------|-----------------|
| `LoginPageFixed.tsx` | authentication | `domains/authentication/pages/LoginPage.tsx` |
| `RegisterPage.tsx` | authentication | `domains/authentication/pages/RegisterPage.tsx` |
| `UserManagement.tsx` | user-management | `domains/user-management/pages/UserManagementPage.tsx` |
| `WorkflowManagement.tsx` | workflow-engine | `domains/workflow-engine/pages/WorkflowManagementPage.tsx` |
| `Dashboard.tsx` | analytics-dashboard | `domains/analytics-dashboard/pages/DashboardPage.tsx` |
| `SettingsPage.tsx` | system-administration | `domains/system-administration/pages/SettingsPage.tsx` |

---

## 🔄 Phase 3: Code Migration

**Duration**: 1-2 weeks  
**Risk**: High  
**Goal**: Move code to domains without breaking functionality

### Step 3.1: Migrate Authentication Domain (PRIORITY 1)

#### 3.1.1: Move Page Components

```bash
# Move authentication pages
mv src/components/LoginPageFixed.tsx src/domains/authentication/pages/LoginPage.tsx
mv src/components/RegisterPage.tsx src/domains/authentication/pages/RegisterPage.tsx
mv src/components/ForgotPasswordPage.tsx src/domains/authentication/pages/ForgotPasswordPage.tsx
mv src/components/ResetPasswordPage.tsx src/domains/authentication/pages/ResetPasswordPage.tsx
```

#### 3.1.2: Create Authentication Components

Extract login form logic from `LoginPage.tsx` into:
- `src/domains/authentication/components/LoginForm.tsx`
- `src/domains/authentication/components/RegisterForm.tsx`

#### 3.1.3: Create Authentication Hooks

Extract authentication logic into hooks:
- `src/domains/authentication/hooks/useLogin.ts`
- `src/domains/authentication/hooks/useRegister.ts`
- `src/domains/authentication/hooks/useAuthState.ts`

**Example - useLogin hook**:
```typescript
// src/domains/authentication/hooks/useLogin.ts
import { useState } from 'react';
import { apiClient } from '@infrastructure/api';
import type { LoginCredentials, LoginResponse } from '../types';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      // Handle success
      return response.data;
    } catch (err) {
      setError('Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
```

#### 3.1.4: Create Authentication Services

Create business logic services:
- `src/domains/authentication/services/AuthService.ts`
- `src/domains/authentication/services/TokenService.ts`
- `src/domains/authentication/services/SessionService.ts`

**Example - AuthService**:
```typescript
// src/domains/authentication/services/AuthService.ts
import { apiClient } from '@infrastructure/api';
import { TokenService } from './TokenService';
import type { LoginCredentials, RegisterData, LoginResponse } from '../types';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Save token
    TokenService.saveToken(response.data.token);
    
    return response.data;
  }

  static async register(data: RegisterData): Promise<void> {
    await apiClient.post('/auth/register', data);
  }

  static async logout(): Promise<void> {
    TokenService.clearToken();
    await apiClient.post('/auth/logout');
  }
}
```

#### 3.1.5: Update Authentication Barrel Export

Update `src/domains/authentication/index.ts` to export actual implementations.

#### 3.1.6: Update Imports in App

Find all authentication imports and update:
```typescript
// Before
import { LoginPageFixed } from './components/LoginPageFixed';

// After
import { LoginForm } from '@domains/authentication';
```

### Step 3.2: Migrate User Management Domain (PRIORITY 2)

Follow same pattern as authentication:

1. Move components
2. Create hooks
3. Create services
4. Update barrel exports
5. Update imports

### Step 3.3: Migrate Remaining Domains

Continue with:
- Workflow Engine Domain
- Analytics Dashboard Domain
- System Administration Domain

---

## 🧪 Phase 4: Testing & Validation

**Duration**: 3-5 days  
**Risk**: Low  
**Goal**: Ensure no regressions

### Step 4.1: Unit Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

**Checklist**:
- [ ] All existing tests pass
- [ ] New domain tests added
- [ ] Infrastructure tests added
- [ ] Coverage maintained or improved

### Step 4.2: Integration Tests

```bash
# Run E2E tests
npm run test:e2e
```

**Test critical flows**:
- [ ] Login flow
- [ ] User creation
- [ ] Workflow approval
- [ ] Dashboard rendering

### Step 4.3: Manual Testing

**Test checklist**:
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Password reset
- [ ] User management CRUD
- [ ] Workflow creation
- [ ] Dashboard navigation
- [ ] Settings modification

### Step 4.4: Performance Testing

```bash
# Build for production
npm run build

# Analyze bundle
npm run analyze
```

**Verify**:
- [ ] Bundle size not increased significantly
- [ ] No circular dependencies
- [ ] Lazy loading working correctly

---

## 🧹 Phase 5: Cleanup

**Duration**: 2-3 days  
**Risk**: Low  
**Goal**: Remove legacy code and finalize migration

### Step 5.1: Remove Empty Folders

```bash
# Find empty directories
find src/ -type d -empty

# Remove them
find src/ -type d -empty -delete
```

### Step 5.2: Update Documentation

- [ ] Update README.md with new structure
- [ ] Document domain boundaries
- [ ] Update developer onboarding guide
- [ ] Create API documentation for each domain

### Step 5.3: Remove Legacy Path Aliases

Update `vite.config.ts` and `tsconfig.app.json` to remove deprecated paths:

```typescript
// Remove these after migration complete
// '@features/*': ['src/features/*'],
// '@widgets/*': ['src/widgets/*'],
```

### Step 5.4: Final Build & Test

```bash
# Clean build
rm -rf node_modules dist
npm install
npm run build
npm test
npm run lint
```

### Step 5.5: Code Review

- [ ] Schedule team code review
- [ ] Address feedback
- [ ] Update based on suggestions

---

## 🔙 Rollback Plan

If migration encounters critical issues:

### Option 1: Revert to Tag

```bash
# Revert to pre-migration state
git reset --hard pre-ddd-migration
```

### Option 2: Incremental Rollback

```bash
# Revert specific commits
git log --oneline
git revert <commit-hash>
```

### Option 3: Keep Both Structures Temporarily

Create compatibility layer:
```typescript
// src/legacy/index.ts
// Re-export from new structure
export * from '@domains/authentication';
export * from '@domains/user-management';
```

---

## 📊 Migration Progress Tracking

### Phase Completion

- [x] Phase 0: Pre-Migration Setup - **COMPLETE**
- [x] Phase 1: Infrastructure Setup - **COMPLETE** (folders created, path aliases configured)
- [ ] Phase 2: Domain Creation - **IN PROGRESS** (authentication domain types created)
- [ ] Phase 3: Code Migration - **PENDING**
- [ ] Phase 4: Testing & Validation - **PENDING**
- [ ] Phase 5: Cleanup - **PENDING**

### Domain Completion

- [ ] Authentication Domain - **IN PROGRESS** (10% - types created)
- [ ] User Management Domain - **PENDING** (0%)
- [ ] Workflow Engine Domain - **PENDING** (0%)
- [ ] Analytics Dashboard Domain - **PENDING** (0%)
- [ ] System Administration Domain - **PENDING** (0%)

### Files Migrated

**Infrastructure**:
- [x] Infrastructure folders created
- [x] Path aliases configured
- [ ] API client moved
- [ ] Logger moved
- [ ] GlobalErrorHandler moved
- [ ] Storage adapters created

**Domains**:
- [x] Authentication types created
- [x] Authentication barrel export created
- [ ] Authentication components migrated
- [ ] Authentication hooks created
- [ ] Authentication services created

---

## 🎯 Next Steps

**Immediate Actions**:
1. Complete authentication domain implementation
2. Create authentication hooks (useLogin, useRegister, etc.)
3. Create authentication services (AuthService, TokenService, etc.)
4. Move existing LoginPage components to authentication domain
5. Test authentication domain in isolation

**Week 1 Goals**:
- Complete authentication domain
- Complete user management domain
- Begin workflow engine domain

**Week 2 Goals**:
- Complete remaining domains
- Begin integration testing
- Update all imports

---

## 📞 Support & Questions

**Questions?** Contact:
- Architecture Lead: [Your email]
- Team Lead: [Team lead email]
- Slack Channel: #ddd-migration

**Resources**:
- `ARCHITECTURE.md` - Full architecture documentation
- Domain-Driven Design book
- Team wiki

---

**Last Updated**: October 10, 2025  
**Migration Status**: Phase 1 Complete, Phase 2 In Progress (10%)  
**Next Review Date**: October 17, 2025
