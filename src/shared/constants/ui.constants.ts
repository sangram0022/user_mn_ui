/**
 * UI Constants
 *
 * Centralized constants for UI dimensions, animations, and layout
 * @module constants/ui
 */

// ============================================================================
// Virtual Scroll
// ============================================================================

export const VIRTUAL_SCROLL = {
  /** Default item height in pixels for fixed-height virtual scroll */
  DEFAULT_ITEM_HEIGHT: 72,
  /** Default container height in pixels */
  DEFAULT_CONTAINER_HEIGHT: 600,
  /** Estimated item height for dynamic-height virtual scroll */
  ESTIMATED_ITEM_HEIGHT: 150,
  /** Number of items to render above/below viewport (overscan) */
  OVERSCAN_COUNT: 3,
  /** Target frames per second for smooth scrolling */
  TARGET_FPS: 60,
  /** Maximum items efficiently handled */
  MAX_ITEMS: 10_000,
} as const;

// ============================================================================
// Toast Notifications
// ============================================================================

export const TOAST = {
  /** Maximum number of toasts displayed simultaneously */
  MAX_TOASTS: 5,
  /** Default toast duration in milliseconds */
  DEFAULT_DURATION: 5000,
  /** Toast animation duration in milliseconds */
  ANIMATION_DURATION: 300,
} as const;

// ============================================================================
// Pagination
// ============================================================================

export const PAGINATION = {
  /** Default page number */
  DEFAULT_PAGE: 1,
  /** Default items per page */
  DEFAULT_LIMIT: 10,
  /** Default page size */
  DEFAULT_PAGE_SIZE: 20,
} as const;

// ============================================================================
// Performance Monitoring
// ============================================================================

export const PERFORMANCE = {
  /** Maximum metrics to store */
  MAX_METRICS: 100,
  /** Sample rate (0-1, where 1 = 100% of events) */
  SAMPLE_RATE: 1.0,
  /** Percentile thresholds for performance stats */
  PERCENTILES: {
    MEDIAN: 50,
    P95: 95,
    P99: 99,
  } as const,
} as const;

// ============================================================================
// Animation & Timing
// ============================================================================

export const ANIMATION = {
  /** Standard transition duration in milliseconds */
  TRANSITION_DURATION: 300,
  /** Fast transition duration in milliseconds */
  FAST_TRANSITION: 150,
  /** Slow transition duration in milliseconds */
  SLOW_TRANSITION: 500,
} as const;

// ============================================================================
// Grid & Layout
// ============================================================================

export const LAYOUT = {
  /** Default grid gap in pixels */
  GRID_GAP: 16,
  /** Standard padding in pixels */
  PADDING: {
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24,
    XLARGE: 32,
  } as const,
  /** Standard margin in pixels */
  MARGIN: {
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24,
    XLARGE: 32,
  } as const,
} as const;

// ============================================================================
// Z-Index Layers
// ============================================================================

export const Z_INDEX = {
  /** Base content layer */
  BASE: 0,
  /** Dropdown menus */
  DROPDOWN: 1000,
  /** Sticky headers */
  STICKY: 1020,
  /** Fixed position elements */
  FIXED: 1030,
  /** Modal backdrop */
  MODAL_BACKDROP: 1040,
  /** Modal content */
  MODAL: 1050,
  /** Popover content */
  POPOVER: 1060,
  /** Toast notifications */
  TOAST: 1070,
  /** Tooltip */
  TOOLTIP: 1080,
} as const;
