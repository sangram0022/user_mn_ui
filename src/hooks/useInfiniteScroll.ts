import { useEffect, useRef, useState } from 'react';

/**
 * Configuration options for infinite scroll
 */
export interface InfiniteScrollOptions {
  /** Callback function to load more data */
  onLoadMore: () => void | Promise<void>;
  /** Whether more data is available to load */
  hasMore: boolean;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Root margin for intersection observer (triggers before reaching bottom) */
  rootMargin?: string;
  /** Intersection threshold (0-1) */
  threshold?: number;
  /** Delay before triggering load (debounce in ms) */
  loadDelay?: number;
  /** Enable/disable infinite scroll */
  enabled?: boolean;
}

/**
 * Return type for useInfiniteScroll hook
 */
export interface InfiniteScrollResult {
  /** Ref to attach to the sentinel/trigger element at the bottom of the list */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  /** Whether the hook is currently loading data */
  isLoading: boolean;
  /** Whether there is more data to load */
  hasMore: boolean;
  /** Manual trigger to load more (useful for retry buttons) */
  loadMore: () => void;
  /** Reset the infinite scroll state */
  reset: () => void;
}

/**
 * Custom hook for implementing infinite scroll with Intersection Observer
 *
 * Automatically loads more data when user scrolls near the bottom of a list.
 * Uses Intersection Observer API for efficient scroll detection without event listeners.
 *
 * @example
 * ```tsx
 * const [items, setItems] = useState([]);
 * const [page, setPage] = useState(1);
 * const [hasMore, setHasMore] = useState(true);
 * const [isLoading, setIsLoading] = useState(false);
 *
 * const loadMore = async () => {
 *   setIsLoading(true);
 *   try {
 *     const newItems = await fetchItems(page);
 *     setItems(prev => [...prev, ...newItems]);
 *     setPage(prev => prev + 1);
 *     setHasMore(newItems.length > 0);
 *   } finally {
 *     setIsLoading(false);
 *   }
 * };
 *
 * const { sentinelRef } = useInfiniteScroll({
 *   onLoadMore: loadMore,
 *   hasMore,
 *   isLoading,
 *   rootMargin: '100px', // Start loading 100px before reaching the bottom
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     {hasMore && <div ref={sentinelRef}>Loading...</div>}
 *   </div>
 * );
 * ```
 *
 * @param options - Configuration options for infinite scroll
 * @returns Infinite scroll utilities
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '100px',
  threshold = 0.1,
  loadDelay = 0,
  enabled = true,
}: InfiniteScrollOptions): InfiniteScrollResult {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadTimerRef = useRef<number | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (loadTimerRef.current !== null) {
        window.clearTimeout(loadTimerRef.current);
      }
    };
  }, []);

  // Handle load more with optional delay
  const handleLoadMore = async () => {
    if (!hasMore || isLoading || internalLoading || !enabled) return;

    setInternalLoading(true);

    try {
      if (loadDelay > 0) {
        await new Promise((resolve) => {
          loadTimerRef.current = window.setTimeout(resolve, loadDelay);
        });
      }

      await Promise.resolve(onLoadMore());
    } finally {
      setInternalLoading(false);
    }
  };

  // Set up intersection observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        // Load more when sentinel is visible
        if (entry.isIntersecting && hasMore && !isLoading && !internalLoading) {
          handleLoadMore();
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(sentinel);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, internalLoading, enabled, rootMargin, threshold, handleLoadMore]);

  // Manual load more trigger
  const loadMore = () => {
    handleLoadMore();
  };

  // Reset function
  const reset = () => {
    setInternalLoading(false);
    if (loadTimerRef.current !== null) {
      window.clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  };

  return {
    sentinelRef,
    isLoading: isLoading || internalLoading,
    hasMore,
    loadMore,
    reset,
  };
}

/**
 * Hook for bi-directional infinite scroll (both top and bottom)
 *
 * Useful for chat applications or timelines where you want to load
 * both newer and older content.
 *
 * @example
 * ```tsx
 * const {
 *   topSentinelRef,
 *   bottomSentinelRef,
 *   loadNewer,
 *   loadOlder
 * } = useBidirectionalInfiniteScroll({
 *   onLoadNewer: loadNewerMessages,
 *   onLoadOlder: loadOlderMessages,
 *   hasNewer: true,
 *   hasOlder: true,
 *   isLoading,
 * });
 * ```
 */
export function useBidirectionalInfiniteScroll({
  onLoadNewer,
  onLoadOlder,
  hasNewer,
  hasOlder,
  isLoading,
  rootMargin = '100px',
  threshold = 0.1,
  enabled = true,
}: {
  onLoadNewer: () => void | Promise<void>;
  onLoadOlder: () => void | Promise<void>;
  hasNewer: boolean;
  hasOlder: boolean;
  isLoading: boolean;
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}) {
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const [loadingDirection, setLoadingDirection] = useState<'newer' | 'older' | null>(null);

  const handleLoadNewer = async () => {
    if (!hasNewer || isLoading || loadingDirection || !enabled) return;

    setLoadingDirection('newer');
    try {
      await Promise.resolve(onLoadNewer());
    } finally {
      setLoadingDirection(null);
    }
  };

  const handleLoadOlder = async () => {
    if (!hasOlder || isLoading || loadingDirection || !enabled) return;

    setLoadingDirection('older');
    try {
      await Promise.resolve(onLoadOlder());
    } finally {
      setLoadingDirection(null);
    }
  };

  // Observer for top sentinel (newer content)
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNewer && !isLoading && !loadingDirection) {
          handleLoadNewer();
        }
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNewer, isLoading, loadingDirection, enabled, rootMargin, threshold, handleLoadNewer]);

  // Observer for bottom sentinel (older content)
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasOlder && !isLoading && !loadingDirection) {
          handleLoadOlder();
        }
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasOlder, isLoading, loadingDirection, enabled, rootMargin, threshold, handleLoadOlder]);

  return {
    topSentinelRef,
    bottomSentinelRef,
    loadNewer: handleLoadNewer,
    loadOlder: handleLoadOlder,
    isLoadingNewer: loadingDirection === 'newer',
    isLoadingOlder: loadingDirection === 'older',
    hasNewer,
    hasOlder,
  };
}

/**
 * Hook for scroll restoration (maintains scroll position after navigation)
 *
 * Useful for maintaining scroll position when navigating back to a list view.
 *
 * @example
 * ```tsx
 * const { scrollRef, saveScrollPosition, restoreScrollPosition } = useScrollRestoration('users-list');
 *
 * useEffect(() => {
 *   restoreScrollPosition();
 * }, []);
 *
 * const handleItemClick = () => {
 *   saveScrollPosition();
 *   navigate('/item/123');
 * };
 * ```
 */
export function useScrollRestoration(key: string) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const storageKey = `scroll-position-${key}`;

  const saveScrollPosition = () => {
    if (scrollRef.current) {
      sessionStorage.setItem(storageKey, String(scrollRef.current.scrollTop));
    }
  };

  const restoreScrollPosition = () => {
    const savedPosition = sessionStorage.getItem(storageKey);
    if (savedPosition && scrollRef.current) {
      scrollRef.current.scrollTop = Number(savedPosition);
    }
  };

  const clearScrollPosition = () => {
    sessionStorage.removeItem(storageKey);
  };

  return {
    scrollRef,
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
  };
}
