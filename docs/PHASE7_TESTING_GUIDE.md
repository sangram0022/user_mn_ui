# Phase 7: Testing Implementation Guide

**Status**: 🚧 In Progress  
**Target**: >90% code coverage  
**Priority**: High (Required before production)

---

## Overview

This document outlines the comprehensive testing strategy for all backend integration components. Tests are organized by priority and complexity.

---

## Testing Strategy

### Test Pyramid

```
        /\
       /E2E\          <- 10% (Critical user journeys)
      /------\
     /Integration\    <- 30% (Page-level workflows)
    /------------\
   /  Component   \   <- 40% (UI components)
  /----------------\
 /   Unit Tests     \ <- 20% (Utilities & hooks)
/--------------------\
```

---

## Test Suites Created

### ✅ Unit Tests

#### 1. Error Mapper (`errorMapper.test.ts`)

**File**: `src/infrastructure/api/__tests__/errorMapper.test.ts`  
**Status**: ✅ Created  
**Coverage Target**: 100%

**Test Cases**:

- ✅ Maps known error codes to localized messages
- ✅ Handles all error categories (AUTH, USER, VALIDATION, etc.)
- ✅ Returns generic message for unknown codes
- ✅ Handles edge cases (null, undefined, empty string)
- ✅ Validates message quality (grammar, actionability)

**Run**: `npm test errorMapper.test.ts`

---

## Recommended Testing Order

### Week 1: Foundation Tests

#### Day 1-2: Unit Tests

- [x] errorMapper utility
- [ ] useApiCall hook (basic functionality)
- [ ] useUserListFilters hook
- [ ] useAuditLogFilters hook

#### Day 3-4: Component Tests

- [ ] UserListFilters component
- [ ] AuditLogFilters component
- [ ] GDPRDataExport component
- [ ] GDPRAccountDeletion component

#### Day 5: Health Monitoring

- [ ] HealthMonitoringDashboard component
- [ ] Auto-refresh functionality
- [ ] Error states and retry

### Week 2: Integration Tests

#### Day 1-2: Admin Pages

- [ ] AdminUsersPage integration
- [ ] AdminAuditLogPage integration
- [ ] Filter + API + UI interactions

#### Day 3-4: User Pages

- [ ] ProfilePage with GDPR features
- [ ] Tab navigation
- [ ] Data export workflow
- [ ] Account deletion workflow

#### Day 5: Dashboard

- [ ] AdminDashboardPage integration
- [ ] Health monitoring auto-refresh
- [ ] Statistics display

### Week 3: E2E Tests

#### Day 1-2: Critical Paths

- [ ] User management workflow
- [ ] Audit log viewing and filtering
- [ ] GDPR data export end-to-end

#### Day 3-4: Edge Cases

- [ ] Error scenarios
- [ ] Network failures
- [ ] Rate limiting
- [ ] Concurrent operations

#### Day 5: Performance & Accessibility

- [ ] Large dataset handling
- [ ] Screen reader testing
- [ ] Keyboard navigation
- [ ] Performance profiling

---

## Test Examples

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { yourFunction } from '../yourModule';

describe('YourModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should handle expected input', () => {
      const result = yourFunction('input');
      expect(result).toBe('expected');
    });

    it('should handle edge cases', () => {
      expect(yourFunction(null)).toBeDefined();
      expect(yourFunction(undefined)).toBeDefined();
    });
  });
});
```

### Component Test Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const mockFn = vi.fn();
    render(<YourComponent onAction={mockFn} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockFn).toHaveBeenCalled();
    });
  });
});
```

### Integration Test Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import YourPage from '../YourPage';

describe('YourPage Integration', () => {
  it('should complete full workflow', async () => {
    const mockApi = vi.fn().mockResolvedValue({ data: [] });

    render(<YourPage />);

    // 1. Load data
    await waitFor(() => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument();
    });

    // 2. Apply filter
    fireEvent.change(screen.getByLabelText('Filter'), {
      target: { value: 'test' }
    });

    // 3. Verify filtered results
    await waitFor(() => {
      expect(mockApi).toHaveBeenCalled();
    });
  });
});
```

---

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test File

```bash
npm test errorMapper.test.ts
```

### With Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

### UI Mode (Interactive)

```bash
npm run test:ui
```

---

## Coverage Requirements

### Minimum Thresholds (CI will fail if below)

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Target Thresholds (Goal)

- **All metrics**: >90%

### Excluded from Coverage

- Test files (`*.test.ts`, `*.spec.ts`)
- Config files (`*.config.ts`)
- Type definitions (`*.d.ts`)
- Mock data and test utilities
- Entry points (thin wrappers)

---

## Test Utilities

### Mock Data Factories

```typescript
// src/test/factories/userFactory.ts
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  status: 'active',
  ...overrides,
});

export const createMockAuditLog = (overrides = {}) => ({
  id: 1,
  action: 'USER_LOGIN',
  user_id: '1',
  timestamp: new Date().toISOString(),
  severity: 'info',
  ...overrides,
});
```

### Custom Render Function

```typescript
// src/test/utils/customRender.tsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '@contexts/ToastContext';

export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  return render(
    <MemoryRouter>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </MemoryRouter>,
    options
  );
};
```

---

## Testing Best Practices

### DO ✅

- Test user behavior, not implementation details
- Use descriptive test names (it should...)
- Test edge cases and error scenarios
- Mock external dependencies (API calls, timers)
- Clean up after tests (vi.clearAllMocks())
- Use waitFor for async operations
- Test accessibility (ARIA roles, labels)

### DON'T ❌

- Test third-party libraries
- Test implementation details (internal state)
- Ignore flaky tests (fix or remove them)
- Use hard-coded delays (use waitFor)
- Skip accessibility tests
- Forget to test error states
- Leave console errors/warnings

---

## CI/CD Integration

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run test:changed
npm run lint
```

### PR Checks

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:coverage

- name: Check coverage thresholds
  run: npm run test:coverage -- --coverage.thresholds.fail=true
```

---

## Next Steps

### Immediate (This Week)

1. ✅ Create errorMapper tests
2. ⏳ Create useApiCall tests (simplified)
3. ⏳ Create filter hook tests
4. ⏳ Create basic component tests

### Short-term (Next 2 Weeks)

1. Complete all unit tests
2. Add component tests for GDPR features
3. Add integration tests for admin pages
4. Set up E2E test framework

### Long-term (Before Production)

1. Achieve >90% coverage
2. Add performance tests
3. Add accessibility audit
4. Add visual regression tests
5. Document all test scenarios

---

## Resources

### Documentation

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Tools

- Vitest (unit/component tests)
- React Testing Library (component testing)
- Playwright (E2E tests - already configured)
- Lighthouse (performance/accessibility)

---

## Success Criteria

### Phase 7 Complete When:

- ✅ All unit tests written (>90% coverage)
- ✅ All component tests written (>85% coverage)
- ✅ Integration tests for critical paths (>80% coverage)
- ✅ E2E tests for user journeys (all happy paths)
- ✅ Overall coverage >90%
- ✅ All tests passing in CI
- ✅ No flaky tests
- ✅ Test documentation complete

---

**Status**: Foundation tests created, continuing with comprehensive test suite implementation.

**Next Action**: Continue creating tests for hooks and components following the testing order outlined above.
