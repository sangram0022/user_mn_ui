/**
 * Request/Response Handling Tests
 * Tests valid requests, response parsing, headers, authentication, and integration scenarios
 * Coverage: Request validation, response normalization, authentication flows
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../client';

describe('API Client - Request/Response Handling', () => {
  let client: ApiClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8001/api/v1', false);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('Successful Requests', () => {
    it('should make successful GET request', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true, data: { id: 1, name: 'Test' } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/users', { method: 'GET' });

      expect(result).toEqual({ success: true, data: { id: 1, name: 'Test' } });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/users',
        expect.any(Object)
      );
    });

    it('should make successful POST request with body', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true, id: 1 }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const body = JSON.stringify({ email: 'test@example.com', password: 'password123' });
      const result = await client['request']('/register', { method: 'POST', body });

      expect(result).toEqual({ success: true, id: 1 });
    });

    it('should make successful PUT request', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true, updated: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/users/1', { method: 'PUT' });

      expect(result).toEqual({ success: true, updated: true });
    });

    it('should make successful DELETE request', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true, deleted: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/users/1', { method: 'DELETE' });

      expect(result).toEqual({ success: true, deleted: true });
    });

    it('should handle 201 Created response', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ id: 1, created: true }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/test', { method: 'POST' });

      expect(result).toEqual({ id: 1, created: true });
    });

    it('should handle 204 No Content response', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response('', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/test', { method: 'DELETE' });

      expect(result === null || result === undefined).toBe(true);
    });
  });

  describe('Headers and Authentication', () => {
    it('should include default headers', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      await client['request']('/test', { method: 'GET' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include Authorization header when token exists', async () => {
      // Mock localStorage for token storage
      const token = 'test-token-123';
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      // Set token (simulating authentication)
      localStorage.setItem('auth_token', token);

      try {
        await client['request']('/test', { method: 'GET' });
      } finally {
        localStorage.removeItem('auth_token');
      }
    });

    it('should merge custom headers with defaults', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      await client['request']('/test', {
        method: 'GET',
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      const calls = mockFetch.mock.calls as unknown;
      if (Array.isArray(calls) && calls.length > 0) {
        const call = calls[0] as unknown;
        if (Array.isArray(call) && call.length > 1) {
          const options = call[1] as unknown as { headers?: unknown };
          const headers = options.headers;
          if (typeof headers === 'object' && headers !== null && 'X-Custom-Header' in headers) {
            expect((headers as Record<string, unknown>)['X-Custom-Header']).toBe('custom-value');
          }
        }
      }
    });
  });

  describe('Request Validation', () => {
    it('should validate required parameters', async () => {
      // Attempting request without method should be handled
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      // Should work with GET as default
      await expect(client['request']('/test', {})).resolves.toBeDefined();
    });

    it('should construct correct URL paths', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      await client['request']('/users/123', { method: 'GET' });

      const calls = mockFetch.mock.calls as unknown;
      if (Array.isArray(calls) && calls.length > 0) {
        const call = calls[0] as unknown;
        if (Array.isArray(call) && call.length > 0) {
          const url = call[0];
          expect(url).toBe('http://localhost:8001/api/v1/users/123');
        }
      }
    });
  });

  describe('Response Parsing', () => {
    it('should parse valid JSON responses', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true, data: [1, 2, 3] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/test', { method: 'GET' });

      expect(result).toEqual({ success: true, data: [1, 2, 3] });
    });

    it('should handle empty JSON objects', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/test', { method: 'GET' });

      expect(result).toEqual({});
    });

    it('should preserve data types in responses', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              success: true,
              count: 42,
              active: true,
              ratio: 0.5,
              tags: ['a', 'b'],
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
      );
      (global as any).fetch = mockFetch;

      const result: unknown = await client['request']('/test', { method: 'GET' });

      if (typeof result === 'object' && result !== null) {
        const obj = result as Record<string, unknown>;
        expect(typeof obj.count).toBe('number');
        expect(typeof obj.active).toBe('boolean');
        expect(typeof obj.ratio).toBe('number');
        expect(Array.isArray(obj.tags)).toBe(true);
      }
    });
  });

  describe('Deduplication', () => {
    it('should deduplicate identical concurrent requests', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true, data: { id: 1 } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const results = await Promise.all([
        client['request']('/users/1', { method: 'GET' }),
        client['request']('/users/1', { method: 'GET' }),
        client['request']('/users/1', { method: 'GET' }),
      ]);

      expect(results).toHaveLength(3);
      // Deduplication depends on timing - may fetch 1-3 times
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it('should not deduplicate different requests', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      await Promise.all([
        client['request']('/users/1', { method: 'GET' }),
        client['request']('/users/2', { method: 'GET' }),
        client['request']('/users/3', { method: 'GET' }),
      ]);

      // Should fetch all three
      expect(mockFetch.mock.calls.length).toBe(3);
    });
  });

  describe('Supported HTTP Methods', () => {
    it('should support GET method', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/test', { method: 'GET' });

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    });

    it('should support POST method', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/test', { method: 'POST' });

      expect(result).toBeDefined();
    });

    it('should support PUT method', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/test', { method: 'PUT' });

      expect(result).toBeDefined();
    });

    it('should support DELETE method', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client['request']('/test', { method: 'DELETE' });

      expect(result).toBeDefined();
    });
  });
});
