import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../client';
import { ApiError } from '../error';

describe('ApiClient - Retry Logic', () => {
  let client: ApiClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8001/api/v1', false);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('Exponential Backoff', () => {
    it('should retry on 500 server error with exponential backoff', async () => {
      let attemptCount = 0;
      const mockFetch = vi.fn(async () => {
        attemptCount++;
        if (attemptCount <= 2) {
          // Fail first 2 attempts with 500 error
          return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        // Succeed on 3rd attempt
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      const result = await client['request']('/test', { method: 'GET' });

      expect(attemptCount).toBe(3); // Initial + 2 retries
      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should retry on 503 service unavailable error', async () => {
      let attemptCount = 0;
      const mockFetch = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          return new Response(JSON.stringify({ error: 'Service Unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      const result = await client['request']('/test', { method: 'GET' });

      expect(attemptCount).toBe(2); // Initial + 1 retry
      expect(result).toEqual({ success: true });
    });

    it('should retry on 502 bad gateway error', async () => {
      let attemptCount = 0;
      const mockFetch = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          return new Response(JSON.stringify({ error: 'Bad Gateway' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      const result = await client['request']('/test', { method: 'GET' });

      expect(attemptCount).toBe(2);
      expect(result).toEqual({ success: true });
    });

    it('should retry on 504 gateway timeout error', async () => {
      let attemptCount = 0;
      const mockFetch = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          return new Response(JSON.stringify({ error: 'Gateway Timeout' }), {
            status: 504,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      const result = await client['request']('/test', { method: 'GET' });

      expect(attemptCount).toBe(2);
      expect(result).toEqual({ success: true });
    });

    it('should retry on network errors (fetch failures)', async () => {
      let attemptCount = 0;
      const mockFetch = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new TypeError('Failed to fetch');
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      const result = await client['request']('/test', { method: 'GET' });

      expect(attemptCount).toBe(2);
      expect(result).toEqual({ success: true });
    });
  });

  describe('Max Retry Limit', () => {
    it('should stop retrying after max retries (3) and throw error', async () => {
      const mockFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      await expect(client['request']('/test', { method: 'GET' })).rejects.toThrow(ApiError);

      // Should try: initial + 3 retries = 4 total attempts
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should include error details after max retries', async () => {
      const mockFetch = vi.fn(async () => {
        return new Response(
          JSON.stringify({ error: 'Service Error', message: 'Server overloaded' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      });

      global.fetch = mockFetch;

      try {
        await client['request']('/test', { method: 'GET' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(503);
        expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
      }
    });
  });

  describe('Non-Retryable Errors', () => {
    it('should NOT retry on 400 bad request error', async () => {
      const mockFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ error: 'Bad Request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      await expect(client['request']('/test', { method: 'GET' })).rejects.toThrow(ApiError);

      // Should only try once (no retries for 4xx errors)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on 401 unauthorized error', async () => {
      const mockFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      await expect(client['request']('/test', { method: 'GET' })).rejects.toThrow(ApiError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on 403 forbidden error', async () => {
      const mockFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      await expect(client['request']('/test', { method: 'GET' })).rejects.toThrow(ApiError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on 404 not found error', async () => {
      const mockFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      await expect(client['request']('/test', { method: 'GET' })).rejects.toThrow(ApiError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on 422 validation error', async () => {
      const mockFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ error: 'Validation Error' }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      await expect(client['request']('/test', { method: 'GET' })).rejects.toThrow(ApiError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Delay Calculation', () => {
    it('should use exponential backoff delays: 1s, 2s, 4s', async () => {
      const delays: number[] = [];
      const startTime = Date.now();

      let attemptCount = 0;
      const mockFetch = vi.fn(async () => {
        const now = Date.now();
        if (attemptCount > 0) {
          delays.push(now - startTime);
        }
        attemptCount++;

        if (attemptCount <= 3) {
          return new Response(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      // Use fake timers for deterministic testing
      vi.useFakeTimers();

      const requestPromise = client['request']('/test', { method: 'GET' });

      // Advance time for each retry
      await vi.advanceTimersByTimeAsync(1000); // 1st retry after 1s
      await vi.advanceTimersByTimeAsync(2000); // 2nd retry after 2s
      await vi.advanceTimersByTimeAsync(4000); // 3rd retry after 4s

      const result = await requestPromise;

      expect(attemptCount).toBe(4); // Initial + 3 retries
      expect(result).toEqual({ success: true });

      vi.useRealTimers();
    });
  });

  describe('Request Deduplication with Retry', () => {
    it('should not duplicate retry logic for deduplicated requests', async () => {
      let attemptCount = 0;
      const mockFetch = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          return new Response(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: true, attempt: attemptCount }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      // Make 2 identical requests simultaneously
      const [result1, result2] = await Promise.all([
        client['dedupedRequest']('/test', { method: 'GET' }),
        client['dedupedRequest']('/test', { method: 'GET' }),
      ]);

      // Both should get the same result from deduplicated request
      expect(result1).toEqual(result2);
      expect(result1).toEqual({ success: true, attempt: 2 });

      // Should only make 2 fetch calls (initial + 1 retry), not 4 (2 requests * 2 attempts)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Successful Immediate Response', () => {
    it('should not retry when request succeeds on first attempt', async () => {
      const mockFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      global.fetch = mockFetch;

      const result = await client['request']('/test', { method: 'GET' });

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only once, no retries needed
    });
  });
});
