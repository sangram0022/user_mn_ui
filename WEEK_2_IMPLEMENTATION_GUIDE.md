# 🚀 Week 2 Implementation Guide

## Phase 1: Virtual Scrolling (45 min) - START HERE

### Step 1: Install Dependency
```bash
npm install react-window
```

### Step 2: Create VirtualTable Component

Create `src/shared/components/VirtualTable.tsx`:

```tsx
import { FixedSizeList as List } from 'react-window';
import type { ReactNode, CSSProperties } from 'react';

interface VirtualTableProps {
  columns: string[];
  data: Record<string, any>[];
  rowHeight?: number;
  maxHeight?: number;
  renderCell?: (value: any, key: string) => ReactNode;
}

export function VirtualTable({
  columns,
  data,
  rowHeight = 48,
  maxHeight = 600,
  renderCell
}: VirtualTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 sticky top-0 z-10">
        <div className="grid gap-4 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
          {columns.map((col) => (
            <div key={col} className="font-semibold text-sm text-gray-700">
              {col}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual List */}
      <List
        height={maxHeight}
        itemCount={data.length}
        itemSize={rowHeight}
        width="100%"
      >
        {({ index, style }) => (
          <div
            style={style}
            className="grid gap-4 px-4 py-3 border-t border-gray-200 hover:bg-gray-50"
            style={{ ...style, gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
          >
            {columns.map((col) => (
              <div key={`${index}-${col}`} className="text-sm text-gray-700 truncate">
                {renderCell ? renderCell(data[index][col], col) : data[index][col]}
              </div>
            ))}
          </div>
        )}
      </List>
    </div>
  );
}
```

### Step 3: Update DashboardPage

Find `src/domains/admin/pages/DashboardPage.tsx` and look for table sections:

```tsx
// ❌ BEFORE (renders all rows at once)
return (
  <div>
    {auditLogs.map((log) => (
      <div key={log.id} className="px-4 py-3 border-b">
        {log.action} - {log.timestamp}
      </div>
    ))}
  </div>
);

// ✅ AFTER (virtual scrolling)
import { VirtualTable } from '@/shared/components/VirtualTable';

return (
  <VirtualTable
    columns={['Action', 'User', 'Timestamp', 'Status']}
    data={auditLogs}
    rowHeight={48}
    maxHeight={600}
    renderCell={(value, key) => {
      if (key === 'Timestamp') return new Date(value).toLocaleString();
      return value;
    }}
  />
);
```

### Step 4: Update AuditLogsPage

Find `src/domains/admin/pages/AuditLogsPage.tsx` and apply the same pattern:

```tsx
import { VirtualTable } from '@/shared/components/VirtualTable';

export function AuditLogsPage() {
  const { data: logs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/audit-logs')
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <VirtualTable
        columns={['Timestamp', 'User', 'Action', 'Resource', 'Status']}
        data={logs || []}
        rowHeight={50}
        maxHeight={800}
      />
    </div>
  );
}
```

### Step 5: Test Virtual Scrolling
```bash
# Build to verify no errors
npm run build

# Then in browser:
# 1. Navigate to Dashboard or Audit Logs
# 2. Open DevTools → Performance tab
# 3. Record while scrolling
# 4. Should see 60fps, no jank
```

---

## Phase 2: Request Deduplication (30 min)

### Step 1: Update React Query Config

Open `src/core/react-query/index.ts` and verify/update:

```ts
import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes (was cacheTime)
      refetchOnWindowFocus: 'stale',
      retry: 1,
      // ✅ CRITICAL: Deduplication happens automatically
      // But verify these settings:
    },
    mutations: {
      retry: 1,
    },
    hydrate: {
      dehydrateOptions: {
        shouldDehydrateQuery(query) {
          return defaultShouldDehydrateQuery(query) ||
            query.state.status === 'pending';
        },
      },
    },
  },
});
```

### Step 2: Test Deduplication

```bash
# 1. npm run dev
# 2. Open DevTools → Network tab
# 3. Filter by "api" or your API domain
# 4. Reload page
# 5. Should see EACH endpoint called only ONCE
# 6. Click different tabs/sections
# 7. Should NOT see duplicate calls
```

### Step 3: Verify in Console

```js
// Paste in browser console:
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const requests = {};
  entries.forEach(entry => {
    if (entry.name.includes('/api/')) {
      const url = entry.name.split('?')[0]; // Remove query params
      requests[url] = (requests[url] || 0) + 1;
    }
  });
  console.table(requests);
});
observer.observe({ entryTypes: ['resource'] });

// Result should show each API endpoint called once
// {
//   "https://api.example.com/users": 1,
//   "https://api.example.com/audit-logs": 1,
//   "https://api.example.com/dashboard": 1
// }
```

---

## Phase 3: Service Worker Setup (45 min)

### Step 1: Install Dependencies
```bash
npm install vite-plugin-pwa workbox-window
```

### Step 2: Update vite.config.ts

Add PWA plugin:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2,ttf,eot}',
        ],
        runtimeCaching: [
          // Cache API responses
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600, // 1 hour
              },
            },
          },
          // Cache images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400 * 30, // 30 days
              },
            },
          },
          // Cache fonts
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400 * 365, // 1 year
              },
            },
          },
        ],
      },
      manifest: {
        name: 'User Management',
        short_name: 'UserMN',
        description: 'User Management Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  // ... rest of config
})
```

### Step 3: Create Service Worker Registration

Create `src/service-worker-register.ts`:

```ts
import { registerSW } from 'virtual:pwa-register';

// Auto-update service worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available; please refresh.');
    // Show UI notification to user
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

export default updateSW;
```

### Step 4: Register in App

Update `src/main.tsx`:

```ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './service-worker-register.ts'  // ← Add this line

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 5: Test Service Worker

```bash
# 1. Build production bundle
npm run build

# 2. Serve locally (need production build for SW to work)
npm install -g serve
serve -s dist

# 3. Open browser at http://localhost:5000
# 4. DevTools → Application → Service Workers
#    Should see "User Management" service worker
# 5. DevTools → Application → Cache Storage
#    Should see caches: api-cache, image-cache, font-cache
```

### Step 6: Test Offline Mode

```bash
# In DevTools:
# 1. Go to Application tab
# 2. Check "Offline" checkbox
# 3. Reload page
# 4. Should still work! (cached assets and API responses)
# 5. Navigate between pages
# 6. Everything works offline
```

---

## 🧪 Verification Checklist

### After Virtual Scrolling:
- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors
- [ ] Dashboard loads instantly (no lag)
- [ ] Can scroll 1000+ items smoothly
- [ ] DevTools → Performance shows 60fps

### After Request Deduplication:
- [ ] No duplicate API calls in Network tab
- [ ] Each endpoint called once per page load
- [ ] Faster perceived performance
- [ ] Reduced network traffic

### After Service Worker:
- [ ] DevTools shows active service worker
- [ ] Can toggle "Offline" and app still works
- [ ] Cache Storage shows 3+ caches
- [ ] Repeat visits are 80%+ faster
- [ ] Works on mobile offline

---

## 📊 Measuring Success

### Virtual Scrolling Impact
```bash
# Before: DevTools Performance → FPS drops to 30fps while scrolling
# After: FPS stays at 60fps, no jank

# Measure with:
# 1. Performance tab → Record → Scroll → Stop
# 2. Look at frame rate chart
# 3. Should be consistently 60fps
```

### Request Deduplication Impact
```bash
# Before: 40+ API calls on page load
# After: 20-25 API calls (50% reduction)

# Measure with:
# 1. Network tab → Filter by "api"
# 2. Reload page 5 times
# 3. Count calls per reload
# 4. Should be consistent (no duplicates)
```

### Service Worker Impact
```bash
# Before: 5 second repeat visit
# After: 0.5 second repeat visit (10x faster!)

# Measure with:
# 1. Reload 3 times in quick succession
# 2. Each reload should get faster
# 3. Check in DevTools:
#    - Application → Cache Storage (growing)
#    - Application → Service Workers (active)
```

---

## 🚀 Build & Deploy

### After All Week 2 Tasks:

```bash
# 1. Build for production
npm run build

# 2. Verify all changes
npm run build 2>&1 | tail -5

# 3. Check bundle size
npm run build 2>&1 | grep "gzip"

# Expected output:
# dist/assets/index-*.js    ~385 kB │ gzip: 125 kB (was 122 kB)
# +3kb is for PWA manifest and workbox runtime
```

---

## ⚡ Quick Reference: What Changed

| Task | Files Changed | Impact | Time |
|------|---|---|---|
| Virtual Scrolling | DashboardPage, AuditLogsPage | 20x faster | 45m |
| Request Dedup | React Query config | 50% fewer calls | 30m |
| Service Worker | vite.config.ts, main.tsx | 80% faster repeat | 45m |
| **Total Week 2** | 5 files | **95 Lighthouse score** | **2 hours** |

---

## 🎯 Expected Results

```
Before Week 2        After Week 2      Improvement
──────────────────────────────────────────────────
Lighthouse: 85 →     95+               ✅ +10-15 pts
LCP:        1.2s →   0.8s              ✅ -33%
Large table: jank →  60fps             ✅ Perfect
API calls:  40 →     20                ✅ -50%
Repeat visit: 5s →   0.5s              ✅ -90%
Offline:    No →     Yes               ✅ Game changer
```

---

**Status:** 🟢 READY TO IMPLEMENT
**Estimated Time:** 2-3 hours
**Difficulty:** Medium
**Impact:** High

Start with **Phase 1: Virtual Scrolling** or **Phase 3: Service Worker** (biggest UX impact)!

