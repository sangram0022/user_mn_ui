/* eslint-disable react-refresh/only-export-components, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Unit Tests: Performance Optimization Utilities
 *
 * Tests all performance utilities including:
 * - WeakCache
 * - LRUCache
 * - CleanupRegistry
 * - Custom hooks (useStableCallback, useIntersectionObserver, etc.)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  WeakCache,
  LRUCache,
  CleanupRegistry,
  useCleanupEffect,
  useCleanupRegistry,
  useStableCallback,
  useMemoizedObject,
  useDeepMemo,
  useDeferredValue,
  useIntersectionObserver,
  useResizeObserver,
  useRenderCount,
  useWhyDidYouUpdate,
} from '@shared/utils/performance-optimizations';

// ============================================================================
// WeakCache Tests
// ============================================================================

describe('WeakCache', () => {
  let cache: WeakCache<object, string>;

  beforeEach(() => {
    cache = new WeakCache<object, string>();
  });

  it('should store and retrieve values', () => {
    const key = { id: 1 };
    const value = 'test-value';

    cache.set(key, value);
    expect(cache.get(key)).toBe(value);
  });

  it('should return undefined for non-existent keys', () => {
    const key = { id: 1 };
    expect(cache.get(key)).toBeUndefined();
  });

  it('should check if key exists', () => {
    const key = { id: 1 };

    expect(cache.has(key)).toBe(false);

    cache.set(key, 'value');
    expect(cache.has(key)).toBe(true);
  });

  it('should delete keys', () => {
    const key = { id: 1 };
    cache.set(key, 'value');

    expect(cache.has(key)).toBe(true);

    cache.delete(key);
    expect(cache.has(key)).toBe(false);
  });

  it('should allow garbage collection of keys', () => {
    let key: object | null = { id: 1 };
    cache.set(key, 'value');

    expect(cache.has(key)).toBe(true);

    // Remove reference to key
    key = null;

    // Force garbage collection (if available)
    if (global.gc) {
      global.gc();
    }

    // After GC, the entry should eventually be collected
    // Note: This is difficult to test reliably in practice
  });

  it('should work with different object types', () => {
    const objKey = { id: 1 };
    const arrayKey = [1, 2, 3];
    const functionKey = () => {};

    cache.set(objKey, 'object-value');
    cache.set(arrayKey as any, 'array-value');
    cache.set(functionKey as any, 'function-value');

    expect(cache.get(objKey)).toBe('object-value');
    expect(cache.get(arrayKey as any)).toBe('array-value');
    expect(cache.get(functionKey as any)).toBe('function-value');
  });
});

// ============================================================================
// LRUCache Tests
// ============================================================================

describe('LRUCache', () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>(3); // Max 3 items
  });

  it('should store and retrieve values', () => {
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
  });

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
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

    expect(cache.has('a')).toBe(false); // Evicted
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(true);
  });

  it('should evict least recently used item', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    // Access 'a' to make it recently used
    cache.get('a');

    // Add 'd' - should evict 'b' (least recently used)
    cache.set('d', 4);

    expect(cache.has('a')).toBe(true); // Recently accessed
    expect(cache.has('b')).toBe(false); // Evicted
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(true);
  });

  it('should update existing keys without eviction', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    cache.set('a', 10); // Update existing

    expect(cache.get('a')).toBe(10);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);
  });

  it('should delete keys', () => {
    cache.set('a', 1);
    expect(cache.has('a')).toBe(true);

    cache.delete('a');
    expect(cache.has('a')).toBe(false);
  });

  it('should clear all entries', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    cache.clear();

    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(false);
  });

  it('should return correct size', () => {
    expect(cache.size).toBe(0);

    cache.set('a', 1);
    expect(cache.size).toBe(1);

    cache.set('b', 2);
    expect(cache.size).toBe(2);

    cache.delete('a');
    expect(cache.size).toBe(1);
  });
});

// ============================================================================
// CleanupRegistry Tests
// ============================================================================

describe('CleanupRegistry', () => {
  let registry: CleanupRegistry;

  beforeEach(() => {
    registry = new CleanupRegistry();
  });

  afterEach(() => {
    registry.cleanupAll();
  });

  it('should register and execute cleanup functions', () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();

    registry.register('task1', cleanup1);
    registry.register('task2', cleanup2);

    registry.cleanupAll();

    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(cleanup2).toHaveBeenCalledTimes(1);
  });

  it('should cleanup specific task by name', () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();

    registry.register('task1', cleanup1);
    registry.register('task2', cleanup2);

    registry.cleanup('task1');

    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(cleanup2).toHaveBeenCalledTimes(0);

    registry.cleanupAll();
    expect(cleanup2).toHaveBeenCalledTimes(1);
  });

  it('should handle cleanup errors gracefully', () => {
    const cleanup1 = vi.fn(() => {
      throw new Error('Cleanup failed');
    });
    const cleanup2 = vi.fn();

    registry.register('task1', cleanup1);
    registry.register('task2', cleanup2);

    // Should not throw
    expect(() => registry.cleanupAll()).not.toThrow();

    // Both should be attempted
    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(cleanup2).toHaveBeenCalledTimes(1);
  });

  it('should allow re-registering same name', () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();

    registry.register('task', cleanup1);
    registry.register('task', cleanup2); // Overwrites

    registry.cleanup('task');

    expect(cleanup1).toHaveBeenCalledTimes(0);
    expect(cleanup2).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// useCleanupEffect Tests
// ============================================================================

describe('useCleanupEffect', () => {
  it('should run cleanup on unmount', () => {
    const cleanup = vi.fn();

    const { unmount } = renderHook(() => {
      useCleanupEffect(() => {
        return cleanup;
      }, []);
    });

    expect(cleanup).not.toHaveBeenCalled();

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should run cleanup when dependencies change', () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();
    let callCount = 0;

    const { rerender } = renderHook(
      ({ dep }) => {
        useCleanupEffect(() => {
          callCount++;
          return callCount === 1 ? cleanup1 : cleanup2;
        }, [dep]);
      },
      { initialProps: { dep: 'initial' } }
    );

    expect(cleanup1).not.toHaveBeenCalled();

    // Change dependency
    rerender({ dep: 'changed' });

    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(cleanup2).not.toHaveBeenCalled();
  });
});

// ============================================================================
// useStableCallback Tests
// ============================================================================

describe('useStableCallback', () => {
  it('should return stable callback reference', () => {
    const { result, rerender } = renderHook(
      ({ count }) => {
        return useStableCallback(() => count);
      },
      { initialProps: { count: 0 } }
    );

    const callback1 = result.current;

    rerender({ count: 1 });
    const callback2 = result.current;

    rerender({ count: 2 });
    const callback3 = result.current;

    // All callbacks should be the same reference
    expect(callback1).toBe(callback2);
    expect(callback2).toBe(callback3);
  });

  it('should use latest values when called', () => {
    const { result, rerender } = renderHook(
      ({ count }) => {
        return useStableCallback(() => count);
      },
      { initialProps: { count: 0 } }
    );

    expect(result.current()).toBe(0);

    rerender({ count: 5 });
    expect(result.current()).toBe(5);

    rerender({ count: 10 });
    expect(result.current()).toBe(10);
  });
});

// ============================================================================
// useMemoizedObject Tests
// ============================================================================

describe('useMemoizedObject', () => {
  it('should memoize object by content', () => {
    const { result, rerender } = renderHook(({ obj }) => useMemoizedObject(obj), {
      initialProps: { obj: { a: 1, b: 2 } },
    });

    const obj1 = result.current;

    // Rerender with same content but different reference
    rerender({ obj: { a: 1, b: 2 } });
    const obj2 = result.current;

    // Should return same reference
    expect(obj1).toBe(obj2);
  });

  it('should return new reference when content changes', () => {
    const { result, rerender } = renderHook(({ obj }) => useMemoizedObject(obj), {
      initialProps: { obj: { a: 1, b: 2 } },
    });

    const obj1 = result.current;

    // Rerender with different content
    rerender({ obj: { a: 1, b: 3 } });
    const obj2 = result.current;

    // Should return different reference
    expect(obj1).not.toBe(obj2);
    expect(obj2.b).toBe(3);
  });
});

// ============================================================================
// useDeepMemo Tests
// ============================================================================

describe('useDeepMemo', () => {
  it('should memoize based on deep equality', () => {
    const factory = vi.fn((obj: unknown) => ({ ...obj, computed: true }));

    const { result, rerender } = renderHook(({ obj }) => useDeepMemo(() => factory(obj), [obj]), {
      initialProps: { obj: { a: 1, b: { c: 2 } } },
    });

    expect(factory).toHaveBeenCalledTimes(1);
    const result1 = result.current;

    // Rerender with same deep content
    rerender({ obj: { a: 1, b: { c: 2 } } });

    // Factory should not be called again
    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(result1);
  });

  it('should recompute when deep content changes', () => {
    const factory = vi.fn((obj: unknown) => ({ ...obj, computed: true }));

    const { result, rerender } = renderHook(({ obj }) => useDeepMemo(() => factory(obj), [obj]), {
      initialProps: { obj: { a: 1, b: { c: 2 } } },
    });

    expect(factory).toHaveBeenCalledTimes(1);

    // Rerender with different deep content
    rerender({ obj: { a: 1, b: { c: 3 } } });

    // Factory should be called again
    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current.b.c).toBe(3);
  });
});

// ============================================================================
// useIntersectionObserver Tests
// ============================================================================

describe('useIntersectionObserver', () => {
  it('should create intersection observer', () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useIntersectionObserver(callback, { threshold: 0.5 }));

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull(); // No element attached yet
  });

  it('should call callback when element intersects', () => {
    const callback = vi.fn();
    const mockIntersectionObserver = vi.fn();

    // Store the callback passed to IntersectionObserver
    let observerCallback: IntersectionObserverCallback | null = null;

    global.IntersectionObserver = vi.fn().mockImplementation((cb) => {
      observerCallback = cb;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }) as any;

    const { result } = renderHook(() => useIntersectionObserver(callback));

    // Simulate element attachment
    const mockElement = document.createElement('div');
    act(() => {
      if (result.current) {
        (result.current as any).current = mockElement;
      }
    });

    // Simulate intersection
    if (observerCallback) {
      const entries: IntersectionObserverEntry[] = [
        {
          isIntersecting: true,
          target: mockElement,
          intersectionRatio: 1,
          boundingClientRect: mockElement.getBoundingClientRect(),
          intersectionRect: mockElement.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        },
      ];

      observerCallback(entries, null as any);
      expect(callback).toHaveBeenCalledWith(entries);
    }
  });
});

// ============================================================================
// useRenderCount Tests
// ============================================================================

describe('useRenderCount', () => {
  it('should track render count', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { rerender } = renderHook(() => useRenderCount('TestComponent'));

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent'),
      expect.stringContaining('Render #1')
    );

    rerender();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent'),
      expect.stringContaining('Render #2')
    );

    rerender();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent'),
      expect.stringContaining('Render #3')
    );

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// useWhyDidYouUpdate Tests
// ============================================================================

describe('useWhyDidYouUpdate', () => {
  it('should log changed props', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { rerender } = renderHook(({ props }) => useWhyDidYouUpdate('TestComponent', props), {
      initialProps: { props: { count: 0, name: 'test' } },
    });

    // First render should not log changes
    expect(consoleSpy).not.toHaveBeenCalled();

    // Change one prop
    rerender({ props: { count: 1, name: 'test' } });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent'),
      expect.stringContaining('Changed props'),
      expect.objectContaining({
        count: expect.objectContaining({
          from: 0,
          to: 1,
        }),
      })
    );

    consoleSpy.mockRestore();
  });

  it('should not log when props unchanged', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { rerender } = renderHook(({ props }) => useWhyDidYouUpdate('TestComponent', props), {
      initialProps: { props: { count: 0 } },
    });

    consoleSpy.mockClear();

    // Rerender with same props
    rerender({ props: { count: 0 } });

    // Should not log if nothing changed
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
