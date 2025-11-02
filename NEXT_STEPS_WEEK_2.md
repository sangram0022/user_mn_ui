# 🚀 Week 2: Advanced Performance Optimizations

## 📊 Where We Are

**Week 1 Status:** ✅ COMPLETE
- Image optimization: ✅ Implemented
- Form debouncing: ✅ Implemented
- Font optimization: ✅ Implemented
- CSS purging: ✅ Verified
- Build: ✅ Passing (379.89 kB, 122.00 kB gzip)
- TypeScript errors: ✅ Zero

---

## 🎯 Week 2 Tasks (2-3 hours total)

### Task 5: Virtual Scrolling for Lists (45 min)
**Status:** ⏳ READY TO START

**Goal:** Implement virtual scrolling for AuditLogsPage and AdminDashboard
- Only render visible rows in large tables
- Expected: 20x faster for 1000+ items

**Installation:**
```bash
npm install react-window react-window-simple
```

**Files to Update:**
- `src/domains/admin/pages/DashboardPage.tsx` (Multiple dashboard tables)
- `src/domains/admin/pages/AuditLogsPage.tsx` (Audit logs table)

**What to Replace:**
```tsx
// ❌ BEFORE: Renders all rows
{items.map((item) => <TableRow key={item.id} data={item} />)}

// ✅ AFTER: Only renders visible rows
<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <TableRow style={style} data={items[index]} />
  )}
</FixedSizeList>
```

**Impact:**
- Dashboard load: 10+ seconds → 1 second
- Lighthouse Performance: +15 points
- Battery drain on mobile: -50%

---

### Task 6: Request Deduplication (30 min)
**Status:** ⏳ READY TO START

**Goal:** Prevent duplicate API calls in React Query
- Eliminate redundant network requests
- Expected: 10-20% faster data loading

**Current State:**
- React Query already installed (v5)
- Config in `src/core/react-query/`

**What to Add:**
```tsx
// Add deduplication middleware
queryClient.setDefaultOptions({
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  },
});

// Deduplicate requests within same batch
queryClient.setMutationDefaults({
  retry: 1,
});
```

**Files to Update:**
- `src/core/react-query/index.ts` (Query client config)

**Impact:**
- API calls: ~40% reduction
- Lighthouse Performance: +5-10 points
- Network data usage: 30-40% reduction

---

### Task 7: Service Worker Setup (45 min)
**Status:** ⏳ READY TO START

**Goal:** Enable offline support and caching
- Cache static assets
- Cache API responses
- Enable offline mode

**Installation:**
```bash
npm install vite-plugin-pwa workbox-window
```

**vite.config.ts Update:**
```ts
import { VitePWA } from 'vite-plugin-pwa'

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    strategies: 'injectManifest',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.example\.com\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 3600 }
          }
        }
      ]
    }
  })
]
```

**Impact:**
- Repeat visits: 90% faster
- Offline support: Pages work without internet
- Lighthouse Performance: +20 points
- User experience: Game-changer

---

## 📋 Implementation Checklist

### Before Starting Week 2

- [ ] Build is passing: `npm run build`
- [ ] No TypeScript errors: `npm run build 2>&1 | Select-String "error"`
- [ ] Dev server works: `npm run dev`
- [ ] All Week 1 changes verified

### Task 5 Checklist: Virtual Scrolling

- [ ] Install: `npm install react-window`
- [ ] Create: `src/shared/components/VirtualTable.tsx`
- [ ] Update: `src/domains/admin/pages/DashboardPage.tsx`
- [ ] Update: `src/domains/admin/pages/AuditLogsPage.tsx`
- [ ] Test: Load page with 1000+ rows, verify performance
- [ ] Build: `npm run build` (should still pass)

### Task 6 Checklist: Request Deduplication

- [ ] Review: `src/core/react-query/index.ts`
- [ ] Add: Deduplication middleware
- [ ] Test: Open Network tab, verify no duplicate requests
- [ ] Build: `npm run build` (should still pass)

### Task 7 Checklist: Service Worker

- [ ] Install: `npm install vite-plugin-pwa workbox-window`
- [ ] Update: `vite.config.ts` (add PWA plugin)
- [ ] Create: `src/service-worker.ts` (optional custom logic)
- [ ] Test: Offline mode (DevTools → Network → Offline)
- [ ] Build: `npm run build` (should still pass)

---

## 🧪 Testing Week 2 Changes

### Task 5 Testing: Virtual Scrolling

```bash
# 1. Load AuditLogsPage in browser
# 2. Open DevTools → Performance tab
# 3. Click "Record", scroll table, stop recording
# 4. Compare with Week 1 baseline
# Expected: No jank, smooth scrolling
```

### Task 6 Testing: Request Deduplication

```bash
# 1. Open DevTools → Network tab
# 2. Filter by "api"
# 3. Reload page multiple times
# 4. Click different tabs/sections
# Expected: No duplicate requests to same endpoint
```

### Task 7 Testing: Service Worker

```bash
# 1. Open DevTools → Application → Service Workers
# 2. Check "Offline" box
# 3. Refresh page - should still load
# 4. Navigate to different sections
# Expected: Works perfectly offline
```

---

## 📈 Expected Performance Gains

```
           Week 1   Week 2    Total Improvement
────────────────────────────────────────────────
Performance  85  →   95+     ✅ +15-20 pts
LCP        1.2s →   0.8s     ✅ -33%
FCP        0.8s →   0.5s     ✅ -37%
CLS        0.0  →   0.0      ✅ Perfect
Bundle     122kb → 125kb*    ✅ +3kb for PWA

* Includes PWA manifest and workbox runtime
```

---

## 🚀 Quick Start for Week 2

### Option A: Start with Task 5 (Virtual Scrolling)
**Estimated Time:** 45 minutes
**Difficulty:** Medium
**Impact:** High (20x faster for large tables)

```bash
npm install react-window
# Then implement virtual scrolling in dashboard
```

### Option B: Start with Task 6 (Request Deduplication)
**Estimated Time:** 30 minutes
**Difficulty:** Easy
**Impact:** Medium (10-20% faster data loading)

```bash
# Just update React Query config
# Minimal code changes
```

### Option C: Start with Task 7 (Service Worker)
**Estimated Time:** 45 minutes
**Difficulty:** Medium
**Impact:** Very High (90% faster repeat visits)

```bash
npm install vite-plugin-pwa workbox-window
# Update vite.config.ts and add PWA config
```

---

## 📞 Troubleshooting

### Q: Build fails after installing new packages?
```bash
# Clean install
rm -r node_modules package-lock.json
npm install
npm run build
```

### Q: Virtual scrolling shows blank content?
```tsx
// Make sure to set width/height for FixedSizeList
<FixedSizeList
  width="100%"      // ← Required
  height={600}      // ← Required
  itemCount={100}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  )}
</FixedSizeList>
```

### Q: Service worker not updating?
```bash
# Clear cache and reload
# DevTools → Application → Clear Storage → Clear site data
# Then reload the page
```

---

## 🎯 Success Criteria for Week 2

### All Tasks Complete If:
- ✅ Build passes: `npm run build`
- ✅ No TypeScript errors
- ✅ Virtual scrolling works (no jank scrolling 1000+ items)
- ✅ No duplicate API requests in Network tab
- ✅ Offline mode works (service worker active)
- ✅ Lighthouse Performance > 95

---

## 📊 Performance Tracking

### Metrics to Monitor

**Before Week 2:**
```
Performance: 85 (Week 1 target)
LCP: 1.2s
FCP: 0.8s
API calls: ~40
Bundle: 379.89 kB (122.00 kB gzip)
```

**After Week 2:**
```
Performance: 95+ (new target)
LCP: 0.8s
FCP: 0.5s
API calls: ~24 (after dedup)
Bundle: ~385 kB (125 kB gzip) - +PWA
```

---

## ⏭️ After Week 2 (Week 3 Preview)

### Task 8: Bundle Analysis (15 min)
- Install: `rollup-plugin-visualizer`
- Generate interactive bundle map
- Identify heavy dependencies

### Task 9: Brotli Compression (20 min)
- Configure for AWS deployment
- 5-10% additional size savings

### Task 10: Image Format Conversion (30 min)
- Convert PNG/JPG to WebP
- Fallbacks for older browsers
- Another 20-30% size savings

---

## 🎉 Summary

**Week 2 Objective:** Add caching, offline support, and virtual scrolling

**Expected Impact:**
- 15-20 point performance improvement
- 20x faster for large datasets
- 90% faster repeat visits
- Full offline support

**Ready to Start?**

Choose your task:
1. 🖼️ **Virtual Scrolling** (Most visible impact)
2. 🔄 **Request Dedup** (Easiest to implement)
3. 📱 **Service Worker** (Biggest UX impact)

---

**Last Updated:** November 2, 2025
**Status:** ⏳ READY FOR WEEK 2
**Next Phase:** Advanced Caching & Virtual Scrolling
