/**
 * Unit Tests: Advanced Performance Optimization Utilities
 *
 * Tests all performance utilities including:
 * - LRUCache class and hook
 * - Performance hooks (useDebounce, useThrottle, useIntersectionObserver, etc.)
 * - Resource optimization functions
 * - Network quality detection
 */

import {
  generateSrcSet,
  getNetworkQuality,
  LRUCache,
  preconnectToOrigin,
  reportWebVitals,
  useDebounce,
  useIntersectionObserver,
  useLRUCache,
  useThrottle,
} from '@shared/utils/advanced-performance';
import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================================================
// Resource Optimization Tests
// ============================================================================

describe('Resource Optimization', () => {
  beforeEach(() => {
    // Mock DOM
    const mockElement = {
      rel: '',
      href: '',
      crossOrigin: '',
      as: '',
      type: '',
      fetchPriority: '',
    };

    vi.stubGlobal('document', {
      head: {
        appendChild: vi.fn(),
      },
      querySelector: vi.fn(() => null),
      createElement: vi.fn(() => mockElement),
    });
  });

  describe('preconnectToOrigin', () => {
    it('should create preconnect link when document exists', () => {
      const createElement = vi.fn(() => ({ rel: '', href: '', crossOrigin: '' }));
      const appendChild = vi.fn();

      vi.stubGlobal('document', {
        head: { appendChild },
        querySelector: vi.fn(() => null),
        createElement,
      });

      preconnectToOrigin('https://api.example.com', true);

      expect(createElement).toHaveBeenCalledTimes(2); // preconnect + dns-prefetch
      expect(appendChild).toHaveBeenCalledTimes(2);
    });

    it('should handle server-side rendering gracefully', () => {
      vi.stubGlobal('document', undefined);

      expect(() => {
        preconnectToOrigin('https://api.example.com');
      }).not.toThrow();
    });
  });

  describe('generateSrcSet', () => {
    it('should generate correct srcset string', () => {
      const baseUrl = 'https://example.com/image';
      const widths = [320, 640, 1024];

      const result = generateSrcSet(baseUrl, widths);

      expect(result).toBe(
        'https://example.com/image?w=320 320w, https://example.com/image?w=640 640w, https://example.com/image?w=1024 1024w'
      );
    });

    it('should handle single width', () => {
      const result = generateSrcSet('https://example.com/image', [480]);
      expect(result).toBe('https://example.com/image?w=480 480w');
    });

    it('should handle empty widths array', () => {
      const result = generateSrcSet('https://example.com/image', []);
      expect(result).toBe('');
    });
  });
});

// ============================================================================
// LRUCache Tests
// ============================================================================

describe('LRUCache', () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>(3);
  });

  it('should store and retrieve values', () => {
    cache.set('a', 1);
    cache.set('b', 2);

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
  });

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('non-existent')).toBeUndefined();
  });

  it('should check if key exists', () => {
    expect(cache.has('a')).toBe(false);

    cache.set('a', 1);
    expect(cache.has('a')).toBe(true);
  });

  it('should respect max size limit', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // Should evict 'a'

    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(true);
  });

  it('should evict least recently used item', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    // Access 'a' to make it most recently used
    cache.get('a');

    // Add new item, should evict 'b' (least recently used)
    cache.set('d', 4);

    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(true);
  });

  it('should update existing keys without eviction', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    cache.set('b', 20); // Update existing key

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(20);
    expect(cache.get('c')).toBe(3);
  });

  it('should clear all entries', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
  });

  it('should return correct size', () => {
    expect(cache.size).toBe(0);

    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size).toBe(2);
  });
});

// ============================================================================
// useLRUCache Hook Tests
// ============================================================================

describe('useLRUCache', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should create and return LRU cache instance', () => {
    let cacheInstance: LRUCache<string, string>;

    function TestComponent() {
      cacheInstance = useLRUCache<string, string>(3);
      return React.createElement('div');
    }

    render(React.createElement(TestComponent), { container });

    expect(cacheInstance!).toBeInstanceOf(LRUCache);
    // Test that the cache works with the expected capacity
    cacheInstance!.set('a', 'value1');
    cacheInstance!.set('b', 'value2');
    cacheInstance!.set('c', 'value3');
    expect(cacheInstance!.size).toBe(3);
  });
});

// ============================================================================
// Performance Hooks Tests
// ============================================================================

describe('useDebounce', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should debounce value changes', () => {
    let debouncedValue: string;
    let renderCount = 0;

    function TestComponent({ value }: { value: string }) {
      renderCount++;
      debouncedValue = useDebounce(value, 500);
      return React.createElement('div');
    }

    const { rerender } = render(React.createElement(TestComponent, { value: 'initial' }), {
      container,
    });

    expect(debouncedValue!).toBe('initial');
    expect(renderCount).toBe(1);

    rerender(React.createElement(TestComponent, { value: 'updated' }));
    expect(debouncedValue!).toBe('initial'); // Should still be initial

    vi.advanceTimersByTime(500);
    expect(debouncedValue!).toBe('updated'); // Should now be updated
  });
});

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Ensure DOM body exists for React Testing Library
    if (!document.body) {
      document.body = document.createElement('body');
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle function calls', () => {
    const mockFn = vi.fn();
    let throttledFn: typeof mockFn;

    function TestComponent() {
      throttledFn = useThrottle(mockFn, 1000);
      return React.createElement('div');
    }

    render(React.createElement(TestComponent));

    // Call multiple times rapidly
    throttledFn!();
    throttledFn!();
    throttledFn!();

    expect(mockFn).toHaveBeenCalledTimes(1);

    // Advance time and call again
    vi.advanceTimersByTime(1000);
    throttledFn!();

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    // Ensure DOM body exists for React Testing Library
    if (!document.body) {
      document.body = document.createElement('body');
    }

    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);
  });
  it('should create intersection observer with options', () => {
    let hookResult: ReturnType<typeof useIntersectionObserver>;

    function TestComponent() {
      hookResult = useIntersectionObserver({ threshold: 0.5 });
      return React.createElement('div');
    }

    render(React.createElement(TestComponent));

    expect(hookResult!).toBeDefined();
    expect(Array.isArray(hookResult!)).toBe(true);
    expect(hookResult!).toHaveLength(2);

    const [ref, isIntersecting] = hookResult!;
    expect(ref).toBeDefined();
    expect(typeof isIntersecting).toBe('boolean');
  });

  it('should handle IntersectionObserver not being available', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    let hookResult: ReturnType<typeof useIntersectionObserver>;

    function TestComponent() {
      hookResult = useIntersectionObserver();
      return React.createElement('div');
    }

    render(React.createElement(TestComponent));

    const [ref, isIntersecting] = hookResult!;
    expect(ref).toBeDefined();
    expect(isIntersecting).toBe(true); // Fallback behavior
  });
});

// ============================================================================
// Network Quality Tests
// ============================================================================

describe('getNetworkQuality', () => {
  it('should return network quality information', () => {
    // Mock navigator.connection
    vi.stubGlobal('navigator', {
      connection: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
      },
    });

    const quality = getNetworkQuality();

    expect(quality).toEqual({
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
    });
  });

  it('should handle missing connection API', () => {
    // Completely remove navigator to test the fallback
    vi.stubGlobal('navigator', undefined);

    const quality = getNetworkQuality();

    expect(quality).toEqual({
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
    });
  });
});

// ============================================================================
// Web Vitals Tests
// ============================================================================

describe('reportWebVitals', () => {
  it('should handle metric reporting without errors', () => {
    const mockMetric = {
      name: 'CLS',
      value: 0.1,
      id: 'test-id',
      delta: 0.05,
    };

    expect(() => {
      reportWebVitals(mockMetric);
    }).not.toThrow();
  });

  it('should handle different metric types', () => {
    const metrics = [
      { name: 'FCP', value: 1200, id: 'fcp-1', delta: 100 },
      { name: 'LCP', value: 2400, id: 'lcp-1', delta: 200 },
      { name: 'FID', value: 50, id: 'fid-1', delta: 10 },
    ];

    metrics.forEach((metric) => {
      expect(() => {
        reportWebVitals(metric);
      }).not.toThrow();
    });
  });
});

// ============================================================================
// Performance Hook Tests (Temporarily Skipped)
// ============================================================================

// Test already exists above - removing duplicate

describe('useIntersectionObserver', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((_callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should create intersection observer with options', () => {
    let targetRef: React.RefObject<HTMLElement>;
    let isIntersecting: boolean;

    function TestComponent() {
      [targetRef, isIntersecting] = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: '10px',
      });
      return React.createElement('div', { ref: targetRef });
    }

    render(React.createElement(TestComponent), { container });

    expect(targetRef!.current).toBeNull(); // Initially null before mounting
    expect(isIntersecting!).toBe(false);
    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.5,
        rootMargin: '10px',
      })
    );
  });

  it('should handle IntersectionObserver not being available', () => {
    // Mock IntersectionObserver as undefined
    const originalIntersectionObserver = global.IntersectionObserver;
    // @ts-expect-error - Intentionally setting to undefined for test
    global.IntersectionObserver = undefined;

    let targetRef: React.RefObject<HTMLElement>;
    let isIntersecting: boolean;

    function TestComponent() {
      [targetRef, isIntersecting] = useIntersectionObserver({
        threshold: 0.5,
      });
      return React.createElement('div', { ref: targetRef });
    }

    expect(() => {
      render(React.createElement(TestComponent), { container });
    }).not.toThrow();

    expect(targetRef!.current).toBeNull();
    expect(isIntersecting!).toBe(true); // Should default to true when observer not available

    // Restore
    global.IntersectionObserver = originalIntersectionObserver;
  });
});
