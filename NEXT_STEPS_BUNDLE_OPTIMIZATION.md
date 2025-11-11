# Next Steps: Bundle Optimization (Phase 5 Task 2)

## Current Status

✅ **Completed**:
- Virtualization: VirtualizedUsersTable, VirtualizedAuditLogTable, VirtualTable migration
- Vendor chunking: 11 specialized chunks (was 9)
- Removed unused dependencies: react-window (-20 KB)

⏳ **Current Bundle**: 1.31 MB

🎯 **Target**: <950 KB (realistic) or <500 KB (aggressive, may require feature removal)

## Priority 1: Split feature-admin Chunk (1-2 hours)

**Current**: feature-admin is 247 KB (too large for single route)

**Problem**: All admin pages bundled together, even though users may only visit one admin page per session

**Solution**: Split by route for lazy loading

### Implementation

Edit `vite.config.ts`:

```typescript
manualChunks(id) {
  if (id.includes('node_modules')) {
    // ... existing vendor chunks ...
  }
  
  // Add before existing feature-admin check
  if (id.includes('/domains/admin/')) {
    // Route-based splitting
    if (id.includes('DashboardPage')) return 'admin-dashboard';
    if (id.includes('UsersPage') || id.includes('UserDetailPage') || id.includes('UserEditPage')) {
      return 'admin-users';
    }
    if (id.includes('RolesPage') || id.includes('RoleDetailPage')) return 'admin-roles';
    if (id.includes('AuditLogsPage')) return 'admin-audit';
    if (id.includes('ApprovalPage')) return 'admin-approvals';
    
    // Shared admin utilities and services
    return 'admin-shared';
  }
}
```

### Expected Result

```
Before:
- feature-admin: 247 KB (everything)

After:
- admin-dashboard: ~30 KB (dashboard only)
- admin-users: ~70 KB (user management)
- admin-roles: ~40 KB (role management)
- admin-audit: ~35 KB (audit logs with virtualized table)
- admin-approvals: ~25 KB (approval workflow)
- admin-shared: ~30 KB (services, hooks, utilities)
────────────────────────────────────────
Total: ~230 KB (but loaded on-demand, not all at once)
```

**Benefit**: Users only load the admin section they actually visit

**Impact**: -150-170 KB from initial bundle

### Test After Implementation

```bash
npm run build
node scripts/analyze-bundle.mjs
```

## Priority 2: Enable Tree Shaking (30 minutes)

**Current**: Some unused code may be included in bundle

**Problem**: Without `"sideEffects": false`, webpack/vite can't safely remove unused exports

### Implementation

1. **Update package.json**:

```json
{
  "name": "usermn",
  "sideEffects": [
    "*.css",
    "src/main.tsx",
    "src/core/config/index.ts"
  ]
}
```

2. **Audit imports**:

```bash
# Find default imports (harder to tree-shake)
rg "import .+ from" --type ts --type tsx

# Find named imports (easier to tree-shake)
rg "import \{.+\} from" --type ts --type tsx
```

3. **Check for barrel exports** (re-exports that prevent tree-shaking):

```bash
# Find index.ts files that just re-export
rg "export \* from" src/ -g "index.ts"
```

4. **Replace barrel exports with direct imports**:

```typescript
// ❌ BAD (prevents tree-shaking)
import { Button, Input, Modal } from '@/components'; // index.ts barrel

// ✅ GOOD (allows tree-shaking)
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
```

### Expected Result

- Remove 50-100 KB of unused code
- Better dead-code elimination
- Smaller vendor chunks

## Priority 3: CSS Optimization (1 hour)

**Current**: 87.54 KB CSS bundle (unoptimized)

**Problem**: Unused Tailwind classes included, potential duplicates

### Implementation

1. **Enable Tailwind CSS purging** (check `tailwind.config.js`):

```javascript
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Must include all component paths
  ],
  // ... rest of config
}
```

2. **Check for duplicate styles**:

```bash
# Analyze CSS bundle
npx bundle-buddy dist/stats.json
```

3. **Split CSS by route** (optional, if beneficial):

Edit `vite.config.ts`:

```typescript
css: {
  devSourcemap: true,
  modules: {
    localsConvention: 'camelCase',
  },
},
build: {
  cssCodeSplit: true, // Enable CSS code splitting
}
```

4. **Minify CSS aggressively**:

```typescript
build: {
  cssMinify: 'lightningcss', // Faster than default cssnano
}
```

### Expected Result

- CSS: 87.54 KB → ~60-70 KB (-20-30 KB)
- Better caching (CSS split by route)
- Faster CSS parsing

## Priority 4: Remove Development Code (30 minutes)

**Current**: Development tools may be in production bundle

### Implementation

1. **Check for dev tools in bundle**:

```bash
# Search for devtools in dist
rg "devtools" dist/assets/*.js
rg "development" dist/assets/*.js
```

2. **Remove TanStack Query DevTools** from production:

Edit where devtools are imported:

```typescript
// ❌ BAD
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// ✅ GOOD
const ReactQueryDevtools = import.meta.env.DEV
  ? await import('@tanstack/react-query-devtools').then(m => m.ReactQueryDevtools)
  : () => null;
```

3. **Strip console.log** statements:

Edit `vite.config.ts`:

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true, // Remove console.log in production
      drop_debugger: true,
    },
  },
}
```

4. **Remove development-only dependencies**:

```bash
# Check if dev dependencies are in production bundle
npm run build
rg "react-error-overlay|source-map" dist/assets/*.js
```

### Expected Result

- Remove 10-20 KB of dev-only code
- Faster bundle parsing
- Better security (no debug info)

## Priority 5: Dependencies Audit (1 hour)

**Current**: May have duplicate or outdated dependencies

### Implementation

1. **Find outdated packages**:

```bash
npm outdated
```

2. **Check for duplicate dependencies**:

```bash
npm ls react
npm ls react-dom
npm ls @tanstack/react-query
```

3. **Find unused dependencies**:

```bash
npm install -g depcheck
depcheck
```

4. **Consider lighter alternatives**:

```bash
# Example: Replace moment.js with day.js (if used)
# moment.js: 233 KB
# day.js: 7 KB

# Check if moment is in bundle
rg "moment" package.json
rg "moment" src/ -g "*.{ts,tsx}"
```

### Expected Result

- Remove 30-50 KB of unnecessary dependencies
- Reduce node_modules size
- Faster installs and builds

## Priority 6: Fix Dynamic Import Warning (15 minutes)

**Current Warning**:
```
(!) src/core/logging/index.ts is dynamically imported by src/core/config/index.ts
    but also statically imported by [27 other files]
```

**Problem**: Mixed import pattern prevents proper code splitting

### Implementation

1. **Decide on import strategy**:
   - Option A: Always static (no code splitting)
   - Option B: Always dynamic (enable code splitting)

2. **For dynamic imports**, update all static imports:

```typescript
// ❌ Static import
import { logger } from '@/core/logging';

// ✅ Dynamic import
const { logger } = await import('@/core/logging');
```

3. **OR, for static imports**, remove dynamic import from config:

```typescript
// In src/core/config/index.ts
// ❌ Dynamic import
const { logger } = await import('@/core/logging');

// ✅ Static import
import { logger } from '@/core/logging';
```

**Recommendation**: Keep static (logging is used everywhere, dynamic import won't help)

## Measurement Tools

### Before Each Change

```bash
# Baseline measurement
npm run build
node scripts/analyze-bundle.mjs > before.txt
```

### After Each Change

```bash
# Measure improvement
npm run build
node scripts/analyze-bundle.mjs > after.txt
diff before.txt after.txt
```

### Bundle Analysis

```bash
# Detailed bundle analysis
npm run build -- --mode=analyze
# Opens interactive bundle analyzer in browser
```

### Lighthouse Audit

```bash
# Performance audit
npm run build
npm run preview
node scripts/lighthouse-audit.mjs
```

## Expected Bundle Size Progression

```
Current:                    1.31 MB

After admin route split:    1.14 MB  (-170 KB, -13%)
After tree shaking:         1.04 MB  (-100 KB, -9%)
After CSS optimization:     1.02 MB  (-20 KB, -2%)
After dev code removal:     1.00 MB  (-20 KB, -2%)
After dependencies audit:   0.95 MB  (-50 KB, -5%)
─────────────────────────────────────────────────
FINAL TARGET:              <0.95 MB  (-360 KB, -27% total)
```

### With CloudFront Compression

```
Before compression:  0.95 MB
After Brotli:       ~250 KB (73% reduction)
After Gzip:         ~320 KB (66% reduction)
```

**Real-world impact**: Users download ~250-320 KB on first visit, then mostly cached

## Success Criteria

✅ **Bundle size** < 950 KB (or < 500 KB if aggressive)

✅ **Initial load time** < 2 seconds (3G network)

✅ **Lighthouse performance** score > 90

✅ **Time to Interactive** < 3 seconds

✅ **First Contentful Paint** < 1.5 seconds

✅ **Cache hit rate** > 80% (subsequent visits)

## Testing Checklist

After each optimization:

- [ ] Run `npm run build` successfully
- [ ] Check bundle analyzer output
- [ ] Test locally with `npm run preview`
- [ ] Run Lighthouse audit
- [ ] Test all admin routes load correctly
- [ ] Verify virtualized tables still work
- [ ] Check for console errors
- [ ] Verify authentication flows
- [ ] Test on mobile network (throttled)

## Rollback Plan

If optimization causes issues:

```bash
# Revert last commit
git revert HEAD

# Or reset to specific commit
git reset --hard b812237

# Rebuild
npm run build
```

## Documentation Updates

After completing all optimizations:

- [ ] Update `PHASE_5_PERFORMANCE_OPTIMIZATIONS.md`
- [ ] Create `BUNDLE_OPTIMIZATION_TECHNIQUES.md`
- [ ] Update `README.md` with new bundle size
- [ ] Document CloudFront configuration
- [ ] Add performance testing guide
- [ ] Create bundle size regression tests

## Automation Ideas

### Bundle Size Budget (CI/CD)

Add to `package.json`:

```json
{
  "scripts": {
    "check-bundle-size": "node scripts/check-bundle-size.mjs"
  }
}
```

Create `scripts/check-bundle-size.mjs`:

```javascript
import { readFileSync } from 'fs';
import { globSync } from 'glob';

const MAX_BUNDLE_SIZE = 950 * 1024; // 950 KB
const files = globSync('dist/assets/*.js');
const totalSize = files.reduce((sum, file) => {
  const stats = readFileSync(file);
  return sum + stats.length;
}, 0);

if (totalSize > MAX_BUNDLE_SIZE) {
  console.error(`❌ Bundle size ${totalSize / 1024} KB exceeds ${MAX_BUNDLE_SIZE / 1024} KB`);
  process.exit(1);
}

console.log(`✅ Bundle size ${totalSize / 1024} KB within budget`);
```

Add to CI/CD:

```yaml
# .github/workflows/ci.yml
- name: Check bundle size
  run: npm run check-bundle-size
```

## Next Session Plan

1. **Start**: Split feature-admin chunk (highest impact)
2. **Then**: Enable tree shaking
3. **Then**: Optimize CSS
4. **Finally**: Remove dev code and audit dependencies

Estimated time: 3-4 hours total

Good luck! 🚀
