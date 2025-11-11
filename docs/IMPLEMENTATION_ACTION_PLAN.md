# Implementation Action Plan

**Based on:** Phase 0 Audit Report  
**Date:** November 11, 2025  
**Status:** Ready for Execution

---

## Quick Start

### Week 1 Priorities

1. **Clean up backup files** (2 hours)
2. **Fix console.warn** (30 minutes)
3. **Add pre-commit hooks** (1 hour)
4. **Document current state** (1 hour)

**Total Effort:** ~5 hours

---

## Phase-by-Phase Implementation

### ✅ Phase 0: Audit - COMPLETE

**Status:** ✅ Complete  
**Deliverables:**

- Comprehensive audit report
- Prioritized findings (P0-P3)
- Pattern compliance assessment
- Performance metrics
- Security assessment

**Outcome:**
Overall grade: **A- (8.5/10)**

---

### 🔄 Phase 1: SSOT Infrastructure (Week 2)

**Status:** 🟡 Minimal work needed  
**Effort:** 4-6 hours  
**Priority:** Medium

#### Tasks

1. **Consolidate config modules** (2 hours)
   - Merge scattered config files
   - Create `src/core/config/index.ts`
   - Single source for env variables

2. **Enhance queryKeys factory** (1 hour)
   - Add missing query key definitions
   - Document query key patterns

3. **Clean up token management** (1 hour)
   - Verify no duplicate localStorage access
   - Document tokenService SSOT

4. **Update imports** (2 hours)
   - Find and update all config imports
   - Ensure consistent import paths

#### Deliverables

- [ ] `src/core/config/index.ts` - Central config module
- [ ] Updated queryKeys with all definitions
- [ ] Import audit and cleanup
- [ ] Documentation updates

---

### 🔄 Phase 2: Services & Hooks (Weeks 3-4)

**Status:** 🟡 Some work needed  
**Effort:** 12-18 hours  
**Priority:** Medium

#### Tasks

1. **Audit all domain services** (3 hours)
   - Verify service→hook→component pattern
   - Identify violations

2. **Migrate to TanStack Query patterns** (4 hours)
   - Replace remaining direct apiClient calls in components
   - Ensure all data fetching through hooks

3. **Standardize error handling** (3 hours)
   - Ensure all hooks use `useStandardErrorHandler`
   - Add error boundaries where missing

4. **Add React 19 patterns** (6 hours)
   - Migrate `useContext` → `use()`
   - Add `useOptimistic` to user-facing mutations
   - Implement `useSuspenseQuery` where appropriate

#### Deliverables

- [ ] All services follow service→hook→component
- [ ] All hooks use useStandardErrorHandler
- [ ] React 19 patterns adopted in high-traffic areas
- [ ] Updated documentation

---

### 🔄 Phase 3: Validation & Types (Week 5)

**Status:** ✅ Mostly complete  
**Effort:** 2-4 hours  
**Priority:** Low

#### Tasks

1. **Audit validation usage** (1 hour)
   - Verify all forms use centralized validators
   - Check for ad-hoc validation

2. **Type-only import audit** (1 hour)
   - Find non-type-only imports for types
   - Update to `import type`

3. **Document validation patterns** (2 hours)
   - Create validation guide
   - Add examples

#### Deliverables

- [ ] Validation audit report
- [ ] Type import corrections
- [ ] Validation usage guide

---

### 🔄 Phase 4: Auth/RBAC/UI Patterns (Week 6)

**Status:** ✅ Mostly complete  
**Effort:** 4-6 hours  
**Priority:** Low

#### Tasks

1. **Standardize loading states** (2 hours)
   - Ensure all components use StandardLoading
   - Create loading state guide

2. **Standardize error states** (2 hours)
   - Ensure all components use StandardError
   - Create error state guide

3. **RBAC pattern audit** (2 hours)
   - Verify all protected routes use CanAccess
   - Check for hard-coded permission checks

#### Deliverables

- [ ] Loading state standardization
- [ ] Error state standardization
- [ ] RBAC pattern guide
- [ ] Component pattern documentation

---

### 🔄 Phase 5: Performance & Tests (Weeks 7-9)

**Status:** 🟡 Significant work needed  
**Effort:** 24-36 hours  
**Priority:** High

#### Tasks

1. **Expand test coverage** (16 hours)
   - Add integration tests for critical flows
   - Expand E2E test coverage
   - Target 80% coverage

2. **Optimize bundle size** (6 hours)
   - Lazy load heavy libraries
   - Dedupe dependencies
   - Reduce vendor chunk to <500 KB

3. **Add virtualization** (6 hours)
   - Implement for UserTable
   - Implement for AuditLogTable
   - Add virtualization guide

4. **Performance audit** (6 hours)
   - Run Lighthouse audits
   - Measure and optimize key metrics
   - Document performance targets

#### Deliverables

- [ ] Test coverage report (80%+)
- [ ] Bundle size optimized (<500 KB vendor)
- [ ] Virtualization implemented for large lists
- [ ] Performance metrics documentation

---

### 🔄 Phase 6: Cleanup & Documentation (Week 10)

**Status:** 🟡 Some work needed  
**Effort:** 8-12 hours  
**Priority:** Medium

#### Tasks

1. **Remove dead code** (4 hours)
   - Delete backup files
   - Remove unused components
   - Run dead code detection tools

2. **Update documentation** (4 hours)
   - Create developer guide
   - Document all patterns
   - Add architecture decision records

3. **Add CI improvements** (2 hours)
   - Add dead code detection to CI
   - Enhance pre-commit hooks
   - Document CI/CD process

4. **Create PR checklist** (2 hours)
   - Define PR requirements
   - Add PR template
   - Document review process

#### Deliverables

- [ ] Dead code removed
- [ ] Developer guide completed
- [ ] CI/CD enhancements
- [ ] PR checklist and templates

---

## Resource Allocation

### Time Estimates by Phase

| Phase | Effort | Priority | Status |
|-------|--------|----------|--------|
| Phase 0 | Complete | - | ✅ Done |
| Phase 1 | 4-6 hours | Medium | 🔄 Ready |
| Phase 2 | 12-18 hours | Medium | 🔄 Ready |
| Phase 3 | 2-4 hours | Low | 🔄 Ready |
| Phase 4 | 4-6 hours | Low | 🔄 Ready |
| Phase 5 | 24-36 hours | High | 🔄 Ready |
| Phase 6 | 8-12 hours | Medium | 🔄 Ready |
| **Total** | **54-82 hours** | - | - |

### Recommended Timeline

**10-week implementation:**

- Weeks 1-2: Phase 1 (SSOT)
- Weeks 3-4: Phase 2 (Services)
- Week 5: Phase 3 (Validation)
- Week 6: Phase 4 (Auth/RBAC)
- Weeks 7-9: Phase 5 (Performance)
- Week 10: Phase 6 (Cleanup)

**Fast-track (6 weeks):**

- Week 1: Phases 1 + 3
- Weeks 2-3: Phase 2
- Week 4: Phase 4
- Week 5: Phase 5 (focused on tests)
- Week 6: Phase 6

---

## Quick Wins (Week 1)

### 1. Remove Backup Files

**Effort:** 2 hours  
**Impact:** High (reduces noise)

**Commands:**

```bash
# Create archive
mkdir -p archive/original-pages

# Move backup files
mv src/domains/admin/pages/*.original.* archive/original-pages/
mv src/domains/auth/pages/*.original.* archive/original-pages/
mv src/domains/home/pages/*.original.* archive/original-pages/

# Commit
git add .
git commit -m "chore: archive backup files outside src/"
```

---

### 2. Fix console.warn

**Effort:** 30 minutes  
**Impact:** Medium (consistency)

**File:** `src/shared/hooks/useApiError.ts:71`

**Change:**

```typescript
// Before
console.warn('useApiError is deprecated. Use useStandardErrorHandler instead.');

// After
logger().warn('useApiError is deprecated. Use useStandardErrorHandler instead.', {
  context: 'useApiError.deprecation',
  stack: new Error().stack,
});
```

---

### 3. Add Pre-commit Hooks

**Effort:** 1 hour  
**Impact:** High (prevents issues)

**Commands:**

```bash
# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"

# Test
git commit -m "test: verify pre-commit hook"
```

---

### 4. Document Current State

**Effort:** 1 hour  
**Impact:** High (clarity)

**Tasks:**

- Update README with audit findings
- Add badges (build status, coverage, etc.)
- Link to audit report
- Document next steps

---

## Success Criteria

### Phase Completion Criteria

**Phase 1:**

- ✅ All config in single module
- ✅ All imports updated
- ✅ Documentation complete

**Phase 2:**

- ✅ All services follow pattern
- ✅ All hooks use error handler
- ✅ React 19 patterns documented

**Phase 3:**

- ✅ All validation centralized
- ✅ All type imports correct
- ✅ Documentation complete

**Phase 4:**

- ✅ UI patterns standardized
- ✅ RBAC patterns consistent
- ✅ Documentation complete

**Phase 5:**

- ✅ Test coverage ≥80%
- ✅ Bundle size <500 KB vendor
- ✅ Virtualization implemented
- ✅ Performance targets met

**Phase 6:**

- ✅ Dead code removed
- ✅ Documentation complete
- ✅ CI/CD enhanced
- ✅ PR process defined

---

## Risk Mitigation

### Known Risks

1. **Test coverage expansion takes longer than estimated**
   - Mitigation: Prioritize critical paths
   - Focus on integration tests first

2. **Bundle size optimization difficult**
   - Mitigation: Start with low-hanging fruit (lazy loading)
   - Analyze dependencies carefully

3. **React 19 migration breaks existing code**
   - Mitigation: Incremental migration
   - Comprehensive testing after each change

4. **Team bandwidth limited**
   - Mitigation: Prioritize quick wins
   - Consider fast-track timeline

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Code Quality**
   - Type errors: 0 (currently: ✅ 0)
   - Lint warnings: 0 (currently: ✅ 0)
   - Test coverage: Target 80% (currently: ~60%)

2. **Performance**
   - Bundle size: <500 KB vendor (currently: 777 KB)
   - Initial load: <2s on 3G (currently: ~3-4s)
   - Lighthouse score: >90 (currently: not measured)

3. **Maintainability**
   - Dead code: 0% (currently: ~5%)
   - Documentation coverage: 100% (currently: ~80%)
   - Pattern compliance: 100% (currently: ~95%)

---

## Support & Communication

### Weekly Check-ins

- Review progress against plan
- Identify blockers
- Adjust timeline if needed

### Documentation Updates

- Update this plan as phases complete
- Document learnings and decisions
- Share knowledge across team

### Questions & Issues

- Create GitHub issues for blockers
- Tag issues with phase labels
- Prioritize and triage regularly

---

**End of Action Plan**
