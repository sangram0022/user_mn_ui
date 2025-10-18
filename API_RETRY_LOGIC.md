# API Retry Logic with Exponential Backoff

## Overview

The API client now includes automatic retry logic with exponential backoff for transient errors. This makes the application more resilient to temporary backend failures, network issues, and overload situations.

## Features

### 1. **Automatic Retries for Transient Errors**

The client automatically retries requests that fail due to:

- **Server Errors (5xx)**
  - `500` Internal Server Error
  - `502` Bad Gateway
  - `503` Service Unavailable
  - `504` Gateway Timeout

- **Network Failures**
  - `TypeError: Failed to fetch` (network disconnection)
  - Connection reset/timeout errors
  - DNS resolution failures

### 2. **Exponential Backoff Strategy**

Each retry attempt uses an exponentially increasing delay to avoid overwhelming a recovering server:

```typescript
// Retry delays
Attempt 1: 1 second   (1000ms)
Attempt 2: 2 seconds  (2000ms)
Attempt 3: 4 seconds  (4000ms)
Maximum:   30 seconds (30000ms)
```

**Formula:** `delay = min(baseDelay * 2^attempt, maxDelay)`

### 3. **Configurable Retry Behavior**

Default configuration in `src/lib/api/client.ts`:

```typescript
private retryConfig = {
  maxRetries: 3,                              // Maximum retry attempts
  baseDelay: 1000,                            // Initial delay (1 second)
  maxDelay: 30000,                            // Maximum delay (30 seconds)
  retryableStatusCodes: [500, 502, 503, 504], // Retryable HTTP status codes
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'], // Network errors
};
```

### 4. **Non-Retryable Errors**

The client **does NOT retry** for client errors (4xx) as these require user/developer action:

- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `422` Validation Error
- All other 4xx errors

### 5. **Logging and Monitoring**

Each retry attempt is logged for debugging:

```typescript
⚠️  [API] Retry 1/3 for GET /api/users after 1000ms
    {
      error: 'HTTP 500',
      statusCode: 500,
      attempt: 1,
      delay: 1000
    }

⚠️  [API] Retry 2/3 for GET /api/users after 2000ms
    {
      error: 'HTTP 500',
      statusCode: 500,
      attempt: 2,
      delay: 2000
    }

⚠️  [API] Max retries (3) reached for GET /api/users
```

## Implementation Details

### Internal Methods

#### `retryWithBackoff<T>()`

Main retry wrapper that handles the retry logic:

```typescript
private async retryWithBackoff<T>(
  operation: () => Promise<T>,
  context: string,
  attempt = 0
): Promise<T>
```

- Wraps any async operation
- Implements exponential backoff
- Handles retry limit
- Logs retry attempts

#### `isRetryableError()`

Determines if an error should trigger a retry:

```typescript
private isRetryableError(error: unknown): boolean
```

- Checks HTTP status codes (5xx)
- Detects network errors (status 0, `NETWORK_ERROR` code)
- Identifies `TypeError: Failed to fetch`

#### `calculateRetryDelay()`

Calculates the delay for the next retry attempt:

```typescript
private calculateRetryDelay(attempt: number): number
```

- Exponential backoff: `baseDelay * 2^attempt`
- Caps at `maxDelay` (30 seconds)

### Request Flow

```
┌─────────────────────┐
│   API Request       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ retryWithBackoff    │ ◄──────┐
└──────────┬──────────┘         │
           │                     │
           ▼                     │
┌─────────────────────┐         │
│ _executeRequest     │         │
│ (fetch API call)    │         │
└──────────┬──────────┘         │
           │                     │
      ┌────▼────┐                │
      │ Success? │───Yes───► Return Result
      └────┬────┘
           No
           │
           ▼
┌─────────────────────┐         │
│ isRetryableError()  │         │
└──────────┬──────────┘         │
           │                     │
      ┌────▼────┐                │
      │Retryable?│───No───► Throw Error
      └────┬────┘
          Yes
           │
           ▼
┌─────────────────────┐         │
│ Has retries left?   │         │
└──────────┬──────────┘         │
           │                     │
      ┌────▼────┐                │
      │  Yes?   │───No───► Throw Error
      └────┬────┘
          Yes
           │
           ▼
┌─────────────────────┐         │
│ Sleep (exponential  │         │
│ backoff delay)      │         │
└──────────┬──────────┘         │
           │                     │
           └──────────────────────┘
```

## Examples

### Example 1: Successful Retry

```typescript
// Request fails twice (500 error), succeeds on 3rd attempt
const users = await apiClient.getUserProfile();

// Console logs:
// ℹ️  [API] GET http://api.example.com/api/v1/profile
// ℹ️  [API] Response 500
// ⚠️  [API] Retry 1/3 for GET /api/v1/profile after 1000ms
// ℹ️  [API] GET http://api.example.com/api/v1/profile
// ℹ️  [API] Response 500
// ⚠️  [API] Retry 2/3 for GET /api/v1/profile after 2000ms
// ℹ️  [API] GET http://api.example.com/api/v1/profile
// ℹ️  [API] Response 200
// ✅ Success!
```

### Example 2: Max Retries Exhausted

```typescript
// Request fails 4 times (initial + 3 retries)
try {
  const users = await apiClient.getUsers();
} catch (error) {
  console.error('Failed after 4 attempts:', error);
}

// Console logs:
// ℹ️  [API] GET http://api.example.com/api/v1/users
// ℹ️  [API] Response 503
// ⚠️  [API] Retry 1/3 for GET /api/v1/users after 1000ms
// ℹ️  [API] GET http://api.example.com/api/v1/users
// ℹ️  [API] Response 503
// ⚠️  [API] Retry 2/3 for GET /api/v1/users after 2000ms
// ℹ️  [API] GET http://api.example.com/api/v1/users
// ℹ️  [API] Response 503
// ⚠️  [API] Retry 3/3 for GET /api/v1/users after 4000ms
// ℹ️  [API] GET http://api.example.com/api/v1/users
// ℹ️  [API] Response 503
// ⚠️  [API] Max retries (3) reached for GET /api/v1/users
// ❌ ApiError: HTTP 503
```

### Example 3: Non-Retryable Error

```typescript
// 400 Bad Request - no retries
try {
  const user = await apiClient.createUser({
    /* invalid data */
  });
} catch (error) {
  console.error('Bad request, fix input:', error);
}

// Console logs:
// ℹ️  [API] POST http://api.example.com/api/v1/users
// ℹ️  [API] Response 400
// 🐛 [API] Non-retryable error for POST /api/v1/users
// ❌ ApiError: HTTP 400 - Bad Request
```

### Example 4: Network Failure with Retry

```typescript
// Network disconnection - retries automatically
const profile = await apiClient.getUserProfile();

// Console logs:
// ℹ️  [API] GET http://api.example.com/api/v1/profile
// ⚠️  [API] Retry 1/3 for GET /api/v1/profile after 1000ms (Failed to fetch)
// ℹ️  [API] GET http://api.example.com/api/v1/profile
// ℹ️  [API] Response 200
// ✅ Success!
```

## Testing

Comprehensive test suite in `src/lib/api/__tests__/client.retry.test.ts`:

- ✅ Retries on 500, 502, 503, 504 errors
- ✅ Retries on network failures
- ✅ Exponential backoff timing (1s, 2s, 4s)
- ✅ Max retry limit enforcement
- ✅ Non-retryable errors (4xx) fail immediately
- ✅ Successful requests don't retry
- ✅ Request deduplication works with retries

**Test Results:**

```
✓ ApiClient - Retry Logic (15 tests) 22.2s
  ✓ Exponential Backoff (5)
  ✓ Max Retry Limit (2)
  ✓ Non-Retryable Errors (5)
  ✓ Delay Calculation (1)
  ✓ Request Deduplication with Retry (1)
  ✓ Successful Immediate Response (1)
```

## Performance Impact

- **Zero overhead for successful requests** - retry logic only activates on errors
- **Smart backoff** - prevents request storms that could overwhelm recovering servers
- **Request deduplication** - multiple identical requests share the same retry attempt
- **Transparent** - existing code continues to work without changes

## Benefits

1. **Improved Reliability** - Application handles transient failures gracefully
2. **Better User Experience** - Users don't see errors from temporary backend issues
3. **Reduced Support Load** - Fewer false alarms from temporary network glitches
4. **Production Ready** - Industry-standard resilience pattern
5. **Observable** - Comprehensive logging for debugging

## Compatibility

- Works with all existing API methods
- Compatible with request deduplication
- Plays well with rate limiting (429 errors have separate handling)
- Works in browser and SSR environments

## Future Enhancements

Potential improvements:

1. **Jitter** - Add randomization to avoid thundering herd problem
2. **Circuit Breaker** - Fail fast if backend is consistently down
3. **Custom Retry Policies** - Per-endpoint retry configuration
4. **Metrics** - Track retry success/failure rates
5. **Retry-After Header** - Respect server-suggested retry timing

## References

- [MDN: Exponential Backoff](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After)
- [AWS Architecture: Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [Google Cloud: Retry Pattern](https://cloud.google.com/architecture/scalable-and-resilient-apps#retry_pattern)
