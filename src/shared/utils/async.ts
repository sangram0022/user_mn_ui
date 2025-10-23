/**
 * Async Utility Functions
 *
 * Common asynchronous patterns and timing utilities to reduce code duplication
 * and provide consistent async operations across the application.
 *
 * @module asyncUtils
 */

/**
 * Debounces a function (delays execution until after wait time of no calls)
 *
 * @param fn - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function with cancel method
 *
 * @example
 * const search = debounce((query) => fetchResults(query), 300);
 * search('test'); // Won't execute immediately
 * search('test2'); // Cancels previous, waits 300ms
 * search.cancel(); // Cancels pending execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, wait);
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Throttles a function (limits execution to once per time period)
 *
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function with cancel method
 *
 * @example
 * const handleScroll = throttle(() => updateScrollPosition(), 100);
 * window.addEventListener('scroll', handleScroll);
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    lastArgs = args;

    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      lastArgs = null;

      timeoutId = setTimeout(() => {
        inThrottle = false;
        if (lastArgs !== null) {
          throttled.apply(this, lastArgs);
        }
      }, limit);
    }
  } as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    inThrottle = false;
    lastArgs = null;
  };

  return throttled;
}

/**
 * Delays execution for a specified time
 *
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 *
 * @example
 * await delay(1000); // Wait 1 second
 * console.log('Executed after 1 second');
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise with function result
 *
 * @example
 * const data = await retry(() => fetchData(), { maxAttempts: 3, delayMs: 1000 });
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    exponentialBackoff?: boolean;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, exponentialBackoff = true, onRetry } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        const currentDelay = exponentialBackoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

        onRetry?.(lastError, attempt);
        await delay(currentDelay);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Executes async function with timeout
 *
 * @param fn - Async function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutError - Optional custom timeout error
 * @returns Promise with function result or timeout error
 *
 * @example
 * const data = await withTimeout(() => fetchData(), 5000);
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutError?: Error
): Promise<T> {
  return Promise.race([
    fn(),
    delay(timeoutMs).then(() => {
      throw timeoutError || new Error(`Operation timed out after ${timeoutMs}ms`);
    }),
  ]);
}

/**
 * Batches async operations with concurrency limit
 *
 * @param items - Items to process
 * @param fn - Async function to execute for each item
 * @param concurrency - Maximum concurrent operations (default: 5)
 * @returns Promise with array of results
 *
 * @example
 * const results = await batchAsync(userIds, (id) => fetchUser(id), 3);
 */
export async function batchAsync<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const promise = fn(items[i], i).then((result) => {
      results[i] = result;
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Executes async operations in series (one after another)
 *
 * @param items - Items to process
 * @param fn - Async function to execute for each item
 * @returns Promise with array of results
 *
 * @example
 * const results = await series(tasks, (task) => executeTask(task));
 */
export async function series<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i++) {
    results.push(await fn(items[i], i));
  }

  return results;
}

/**
 * Executes async operations in parallel
 *
 * @param items - Items to process
 * @param fn - Async function to execute for each item
 * @returns Promise with array of results
 *
 * @example
 * const results = await parallel(userIds, (id) => fetchUser(id));
 */
export async function parallel<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  return Promise.all(items.map((item, index) => fn(item, index)));
}

/**
 * Race multiple promises with results
 *
 * @param promises - Array of promises to race
 * @returns Promise with first successful result and its index
 *
 * @example
 * const { result, index } = await raceWithIndex([promise1, promise2, promise3]);
 */
export async function raceWithIndex<T>(
  promises: Promise<T>[]
): Promise<{ result: T; index: number }> {
  return Promise.race(
    promises.map((promise, index) => promise.then((result) => ({ result, index })))
  );
}

/**
 * Memoizes async function results with TTL
 *
 * @param fn - Async function to memoize
 * @param options - Memoization options
 * @returns Memoized function with cache clear method
 *
 * @example
 * const getUser = memoizeAsync((id) => fetchUser(id), { ttl: 60000 });
 * const user = await getUser(1); // Fetches from API
 * const cached = await getUser(1); // Returns cached result
 * getUser.clear(); // Clear cache
 */
export function memoizeAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  } = {}
): T & { clear: () => void; clearKey: (key: string) => void } {
  const { ttl, keyGenerator = (...args) => JSON.stringify(args) } = options;

  const cache = new Map<string, { value: ReturnType<T>; expiresAt?: number }>();

  const memoized = async function (this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached) {
      if (!cached.expiresAt || Date.now() < cached.expiresAt) {
        return cached.value;
      }
      cache.delete(key);
    }

    const value = fn.apply(this, args) as ReturnType<T>;
    const expiresAt = ttl ? Date.now() + ttl : undefined;

    cache.set(key, { value, expiresAt });
    return value;
  } as T & { clear: () => void; clearKey: (key: string) => void };

  memoized.clear = () => cache.clear();
  memoized.clearKey = (key: string) => cache.delete(key);

  return memoized;
}

/**
 * Polls an async function until condition is met or timeout
 *
 * @param fn - Async function to poll
 * @param options - Polling options
 * @returns Promise with final result
 *
 * @example
 * const status = await poll(
 *   () => checkStatus(),
 *   { condition: (s) => s === 'complete', interval: 1000, timeout: 30000 }
 * );
 */
export async function poll<T>(
  fn: () => Promise<T>,
  options: {
    condition: (result: T) => boolean;
    interval?: number;
    timeout?: number;
    onPoll?: (result: T, attempt: number) => void;
  }
): Promise<T> {
  const { condition, interval = 1000, timeout = 30000, onPoll } = options;

  const startTime = Date.now();
  let attempt = 0;

  while (true) {
    attempt++;
    const result = await fn();

    onPoll?.(result, attempt);

    if (condition(result)) {
      return result;
    }

    if (Date.now() - startTime >= timeout) {
      throw new Error(`Polling timed out after ${timeout}ms`);
    }

    await delay(interval);
  }
}

/**
 * Creates a cancelable promise
 *
 * @param promise - Promise to make cancelable
 * @returns Cancelable promise with cancel method
 *
 * @example
 * const { promise, cancel } = makeCancelable(fetchData());
 * promise.then(data => console.log(data)).catch(err => console.error(err));
 * cancel(); // Cancels the promise
 */
export function makeCancelable<T>(promise: Promise<T>): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let isCanceled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then((value) => {
        if (!isCanceled) {
          resolve(value);
        }
      })
      .catch((error) => {
        if (!isCanceled) {
          reject(error);
        }
      });
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      isCanceled = true;
    },
  };
}

/**
 * Limits concurrent executions of an async function
 *
 * @param fn - Async function to limit
 * @param limit - Maximum concurrent executions
 * @returns Limited function
 *
 * @example
 * const limitedFetch = limitConcurrency(fetchData, 3);
 * // Only 3 fetches will run concurrently
 */
export function limitConcurrency<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  limit: number
): T {
  let running = 0;
  const queue: Array<{
    args: Parameters<T>;
    resolve: (value: ReturnType<T>) => void;
    reject: (error: unknown) => void;
  }> = [];

  async function execute(
    args: Parameters<T>,
    resolve: (value: ReturnType<T>) => void,
    reject: (error: unknown) => void
  ) {
    running++;

    try {
      const result = (await fn(...args)) as ReturnType<T>;
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      running--;
      processQueue();
    }
  }

  function processQueue() {
    if (running < limit && queue.length > 0) {
      const next = queue.shift();
      if (next) {
        execute(next.args, next.resolve, next.reject);
      }
    }
  }

  return async function (this: unknown, ...args: Parameters<T>) {
    return new Promise<ReturnType<T>>((resolve, reject) => {
      queue.push({ args, resolve, reject });
      processQueue();
    });
  } as T;
}

/**
 * Wraps async function with loading state management
 *
 * @param fn - Async function to wrap
 * @param setLoading - Loading state setter
 * @returns Wrapped function
 *
 * @example
 * const [loading, setLoading] = useState(false);
 * const fetchWithLoading = withLoading(fetchData, setLoading);
 * await fetchWithLoading(); // Sets loading true, then false
 */
export function withLoading<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  setLoading: (loading: boolean) => void
): T {
  return async function (this: unknown, ...args: Parameters<T>) {
    setLoading(true);
    try {
      return await fn.apply(this, args);
    } finally {
      setLoading(false);
    }
  } as T;
}
