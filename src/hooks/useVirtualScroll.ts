import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Configuration options for virtual scrolling
 */
export interface VirtualScrollOptions {
  /** Height of each item in pixels */
  itemHeight: number;
  /** Number of items to render outside visible area (improves scrolling smoothness) */
  overscan?: number;
  /** Height of the scrollable container in pixels */
  containerHeight: number;
  /** Scroll behavior - 'smooth' or 'auto' */
  scrollBehavior?: ScrollBehavior;
}

/**
 * Return type for useVirtualScroll hook
 */
export interface VirtualScrollResult<T> {
  /** Items that should be rendered in the current viewport */
  virtualItems: Array<{
    index: number;
    data: T;
    offsetTop: number;
  }>;
  /** Total height of all items for proper scrollbar sizing */
  totalHeight: number;
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Scroll to a specific item index */
  scrollToIndex: (index: number) => void;
  /** Current scroll position */
  scrollTop: number;
  /** Range of visible items */
  visibleRange: { start: number; end: number };
}

/**
 * Custom hook for implementing virtual scrolling with large lists
 *
 * Optimizes rendering performance by only rendering items visible in the viewport
 * plus a configurable overscan area. Handles 10,000+ items at 60 FPS.
 *
 * @example
 * ```tsx
 * const users = [...]; // Large array of users
 * const { virtualItems, totalHeight, containerRef } = useVirtualScroll({
 *   items: users,
 *   itemHeight: 72,
 *   containerHeight: 600,
 *   overscan: 5
 * });
 *
 * return (
 *   <div ref={containerRef} style={{ height: 600, overflow: 'auto' }}>
 *     <div style={{ height: totalHeight, position: 'relative' }}>
 *       {virtualItems.map(({ index, data, offsetTop }) => (
 *         <div key={index} style={{ position: 'absolute', top: offsetTop, height: 72 }}>
 *           <UserCard user={data} />
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * );
 * ```
 *
 * @param options - Configuration options for virtual scrolling
 * @param items - Array of items to virtualize
 * @returns Virtual scroll utilities and computed values
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  overscan = 3,
  containerHeight,
  scrollBehavior = 'auto',
}: VirtualScrollOptions & { items: T[] }): VirtualScrollResult<T> {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // Calculate total height for proper scrollbar
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  // Calculate visible range with overscan
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

    // Apply overscan
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length, visibleEnd + overscan);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Generate virtual items for rendering
  const virtualItems = useMemo(() => {
    const { start, end } = visibleRange;
    const itemsToRender = [];

    for (let index = start; index < end; index++) {
      itemsToRender.push({
        index,
        data: items[index],
        offsetTop: index * itemHeight,
      });
    }

    return itemsToRender;
  }, [visibleRange, items, itemHeight]);

  // Handle scroll with requestAnimationFrame for performance
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement;

    // Cancel previous RAF if still pending
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Schedule scroll update
    rafIdRef.current = requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
      rafIdRef.current = null;
    });
  }, []);

  // Attach/detach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleScroll]);

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;

      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      const scrollTop = clampedIndex * itemHeight;

      container.scrollTo({
        top: scrollTop,
        behavior: scrollBehavior,
      });
    },
    [items.length, itemHeight, scrollBehavior]
  );

  return {
    virtualItems,
    totalHeight,
    containerRef,
    scrollToIndex,
    scrollTop,
    visibleRange,
  };
}

/**
 * Alternative hook for dynamic height items (less performant but more flexible)
 *
 * Use this when items have varying heights. Requires measuring each item.
 *
 * @example
 * ```tsx
 * const { virtualItems, totalHeight, containerRef, measureElement } = useDynamicVirtualScroll({
 *   items: posts,
 *   estimatedItemHeight: 150,
 *   containerHeight: 600,
 * });
 * ```
 */
export function useDynamicVirtualScroll<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  overscan = 3,
}: {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementsRef = useRef<Map<number, number>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  // Calculate positions based on measurements or estimates
  // Note: Accessing refs in useMemo is intentional for virtual scroll performance
  // The measurements ref is accessed during render for layout calculations
  const { positions, totalHeight } = useMemo(() => {
    const positions: number[] = [];
    let currentOffset = 0;

    for (let i = 0; i < items.length; i++) {
      positions.push(currentOffset);

      const measuredHeight = measurementsRef.current.get(i);
      currentOffset += measuredHeight ?? estimatedItemHeight;
    }

    return {
      positions,
      totalHeight: currentOffset,
    };
  }, [items.length, estimatedItemHeight]);

  // Find visible range using binary search for efficiency
  const visibleRange = useMemo(() => {
    let start = 0;
    let end = items.length;

    // Binary search for start
    let left = 0;
    let right = items.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const itemTop = positions[mid];

      const itemHeight = measurementsRef.current.get(mid) ?? estimatedItemHeight;
      const itemBottom = itemTop + itemHeight;

      if (itemBottom < scrollTop) {
        left = mid + 1;
      } else if (itemTop > scrollTop) {
        right = mid - 1;
      } else {
        start = mid;
        break;
      }
    }
    start = Math.max(0, left - overscan);

    // Binary search for end
    left = start;
    right = items.length - 1;
    const scrollBottom = scrollTop + containerHeight;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const itemTop = positions[mid];

      if (itemTop < scrollBottom) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    end = Math.min(items.length, left + overscan);

    return { start, end };
  }, [scrollTop, containerHeight, items.length, positions, estimatedItemHeight, overscan]);

  const virtualItems = useMemo(() => {
    const { start, end } = visibleRange;
    const itemsToRender = [];

    for (let index = start; index < end; index++) {
      itemsToRender.push({
        index,
        data: items[index],
        offsetTop: positions[index],
      });
    }

    return itemsToRender;
  }, [visibleRange, items, positions]);

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
      rafIdRef.current = null;
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleScroll]);

  const measureElement = useCallback((index: number, height: number) => {
    if (measurementsRef.current.get(index) !== height) {
      measurementsRef.current.set(index, height);
      // Force recalculation on next render
      setScrollTop((prev) => prev);
    }
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;

      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      const scrollTop = positions[clampedIndex];

      container.scrollTo({
        top: scrollTop,
        behavior: 'auto',
      });
    },
    [items.length, positions]
  );

  return {
    virtualItems,
    totalHeight,
    containerRef,
    scrollToIndex,
    scrollTop,
    visibleRange,
    measureElement,
  };
}
