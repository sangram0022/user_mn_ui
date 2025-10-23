# Utility Functions Quick Reference

**Quick import reference for all available utility functions**

---

## 📝 String Utilities (`string.ts`)

```typescript
import {
  // Text Formatting
  capitalize, // "hello" → "Hello"
  capitalizeFirst, // "WORLD" → "World"
  toTitleCase, // "hello world" → "Hello World"
  camelToReadable, // "userName" → "User Name"
  snakeToReadable, // "user_name" → "User Name"
  kebabToReadable, // "user-name" → "User Name"

  // Text Processing
  truncate, // "Hello World" → "Hello..." (limit: 8)
  truncateWords, // Truncate at word boundary
  pluralize, // pluralize(5, 'item') → "5 items"
  removeWhitespace, // Remove all whitespace
  normalizeWhitespace, // Multiple spaces → single space
  slugify, // "Hello World!" → "hello-world"

  // Utilities
  escapeHtml, // Escape HTML characters
  isEmpty, // Check if empty/whitespace
  containsIgnoreCase, // Case-insensitive search
  getInitials, // "John Doe" → "JD"
  maskString, // "1234567890" → "123****890"
  formatPhone, // "1234567890" → "(123) 456-7890"
  randomString, // Generate random strings
} from '@/shared/utils';
```

### Common Use Cases

```typescript
// Form labels from field names
<label>{camelToReadable('firstName')}</label> // "First Name"

// User bio truncation
<p>{truncateWords(user.bio, 100)}</p>

// SEO-friendly URLs
const slug = slugify(post.title);

// User avatars
<Avatar>{getInitials(user.name)}</Avatar>

// Item counts
<span>{pluralize(items.length, 'item')}</span> // "5 items"
```

---

## 🔢 Array Utilities (`array.ts`)

```typescript
import {
  // Collection Operations
  unique, // Remove duplicates: unique([1, 2, 2]) → [1, 2]
  groupBy, // Group by key: groupBy(users, 'role')
  sortBy, // Sort: sortBy(users, 'createdAt', 'desc')
  chunk, // Split: chunk([1,2,3,4,5], 2) → [[1,2], [3,4], [5]]
  flatten, // Flatten nested arrays

  // Set Operations
  intersection, // Common elements
  difference, // Elements in arr1 not in arr2
  partition, // Split by predicate

  // Random & Selection
  shuffle, // Random shuffle
  sample, // Random item
  sampleSize, // N random items
  take, // First n items
  takeLast, // Last n items

  // Aggregation
  countBy, // Count occurrences
  sum, // Sum values
  average, // Average values
  min, // Min value/item
  max, // Max value/item

  // Utilities
  compact, // Remove falsy values
  range, // range(1, 5) → [1, 2, 3, 4]
} from '@/shared/utils';
```

### Common Use Cases

```typescript
// Group users by role
const usersByRole = groupBy(users, 'role');

// Remove duplicate emails
const uniqueEmails = unique(users.map((u) => u.email));

// Pagination
const pages = chunk(items, 10);

// Sort newest first
const recentUsers = sortBy(users, 'createdAt', 'desc');

// Calculate statistics
const avgAge = average(users, 'age');
const total = sum(orders, 'amount');
```

---

## ⏱️ Async Utilities (`async.ts`)

```typescript
import {
  // Timing Control
  debounce, // Delay execution: debounce(fn, 300)
  throttle, // Limit rate: throttle(fn, 100)
  delay, // await delay(1000)

  // Execution Patterns
  retry, // Retry with backoff
  withTimeout, // Execute with timeout
  batchAsync, // Batch with concurrency limit
  series, // Execute sequentially
  parallel, // Execute in parallel

  // Advanced
  raceWithIndex, // Race with result index
  memoizeAsync, // Memoize with TTL
  poll, // Poll until condition met
  makeCancelable, // Add cancel() method
  limitConcurrency, // Limit concurrent calls
  withLoading, // Wrap with loading state
} from '@/shared/utils';
```

### Common Use Cases

```typescript
// Debounced search
const debouncedSearch = debounce((query) => searchAPI(query), 300);

// Throttled scroll handler
const handleScroll = throttle(() => updatePosition(), 100);

// API retry with backoff
const data = await retry(() => fetchData(), {
  maxAttempts: 3,
  delayMs: 1000,
  exponentialBackoff: true,
});

// Limit concurrent API calls
const results = await batchAsync(userIds, fetchUser, 5); // Max 5 concurrent

// Poll for completion
const status = await poll(() => checkJobStatus(jobId), {
  condition: (s) => s === 'complete',
  interval: 1000,
  timeout: 30000,
});

// Loading state wrapper
const [loading, setLoading] = useState(false);
const fetchWithLoading = withLoading(fetchData, setLoading);
```

---

## 🔗 URL Utilities (`url.ts`)

```typescript
import {
  // Query String Management
  buildQueryString, // Object → query string
  parseQueryString, // Query string → object
  appendQueryParams, // Add params to URL
  updateQueryParams, // Update existing params
  removeQueryParams, // Remove params
  getQueryParam, // Get single param

  // URL Manipulation
  getPathSegments, // Extract path parts
  joinUrl, // Join URL parts safely
  normalizeUrl, // Normalize URL format
  buildApiUrl, // Build complete API URL

  // URL Analysis
  isAbsoluteUrl, // Check if has protocol
  isExternalUrl, // Check if different origin
  getDomain, // Extract domain
  safeUrl, // SSR-safe URL creation
} from '@/shared/utils';
```

### Common Use Cases

```typescript
// Build API URLs
const url = buildApiUrl(API_BASE, '/users', { page: 1, sort: 'name' });
// "https://api.example.com/users?page=1&sort=name"

// Parse current URL params
const params = parseQueryString(window.location.search);
console.log(params.page); // "1"

// Update URL params
const newUrl = updateQueryParams('/users', { page: 2 });

// Add filters
const filtered = appendQueryParams('/search', {
  q: query,
  filters: ['active', 'verified'],
});

// Check external links
if (isExternalUrl(link)) {
  // Open in new tab
}

// Normalize for SEO
const canonical = normalizeUrl(url, {
  removeTrailingSlash: true,
  sortQueryParams: true,
});
```

---

## 🕒 Date Utilities (Enhanced `dateUtils.ts`)

```typescript
import {
  getCurrentISOTimestamp, // new Date().toISOString()
  getISOTimestamp, // Convert to ISO with fallback

  // Existing utilities
  formatDate, // Format date
  formatTime, // Format time
  formatRelativeTime, // "2 hours ago"
  formatDateTime, // Date + time
  isToday, // Check if today
  isSameDay, // Compare dates
} from '@/shared/utils';
```

---

## 🌍 Environment Utilities (`env.ts`)

```typescript
import {
  isBrowser, // Check if browser
  isSSR, // Check if server-side
  browserOnly, // Execute only in browser
  isDevelopment, // Check if dev environment
  isProduction, // Check if production
  isTest, // Check if test environment
  getEnvironment, // Get environment name
  isFeatureEnabled, // Feature flags
} from '@/shared/utils';
```

### Common Use Cases

```typescript
// SSR-safe code
browserOnly(() => {
  window.localStorage.setItem('key', 'value');
});

// Conditional logging
if (isDevelopment()) {
  console.log('Debug info');
}

// Feature flags
if (isFeatureEnabled('NEW_FEATURE')) {
  // Show new feature
}
```

---

## 💾 Storage Utilities

### Session Storage (`safeSessionStorage.ts`)

```typescript
import { safeSessionStorage } from '@/shared/utils';

// Auth session management
const session = safeSessionStorage.loadAuthSession();
safeSessionStorage.saveAuthSession(session);
safeSessionStorage.clearAuthSession();

// General usage
safeSessionStorage.setItem('key', 'value');
const value = safeSessionStorage.getItem('key');

// JSON helpers
safeSessionStorage.setJSON('data', { foo: 'bar' });
const data = safeSessionStorage.getJSON('data');
```

### Local Storage (`safeLocalStorage.ts`)

```typescript
import { safeLocalStorage } from '@/shared/utils';

// Same API as safeSessionStorage
safeLocalStorage.setItem('key', 'value');
const value = safeLocalStorage.getItem('key');
```

---

## 🎯 Import Everything

```typescript
// Import all utilities at once
import * as utils from '@/shared/utils';

// Use with namespace
utils.capitalize('hello');
utils.groupBy(users, 'role');
utils.debounce(fn, 300);
utils.buildQueryString({ page: 1 });
```

---

## 💡 Tips

### Tree-Shaking

All utilities support tree-shaking. Import only what you need:

```typescript
import { capitalize, groupBy } from '@/shared/utils';
```

### TypeScript Support

All utilities have full TypeScript support with generics:

```typescript
const users: User[] = [...];
const grouped = groupBy(users, 'role'); // Fully typed
```

### SSR Safety

All utilities are SSR-safe and handle `window`/`document` checks:

```typescript
// Safe to use in Next.js/SSR
const url = buildApiUrl(API_BASE, '/users');
```

### Error Handling

All utilities include comprehensive error handling:

```typescript
// Never throws, returns null on error
const value = safeSessionStorage.getItem('key');
```

---

## 📚 Full Documentation

See `REFACTORING_IMPLEMENTATION_SUMMARY.md` for:

- Complete function list with examples
- Before/after refactoring examples
- Use cases and benefits
- Implementation details

---

**Total Functions Available:** 150+  
**Latest Commit:** 277f9bb  
**Status:** ✅ All implemented and tested
