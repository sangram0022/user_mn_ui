// ========================================
// Accessibility Configuration
// WCAG 2.1 Level AA Compliance
// ========================================

/**
 * Accessibility features implemented:
 * 
 * 1. Keyboard Navigation
 *    - Tab order management
 *    - Focus visible states
 *    - Skip links
 *    - Escape key handlers
 * 
 * 2. Screen Reader Support
 *    - ARIA labels and descriptions
 *    - Live regions for dynamic content
 *    - Role attributes
 *    - Alt text for images
 * 
 * 3. Color Contrast
 *    - WCAG AA compliant (4.5:1 for normal text, 3:1 for large text)
 *    - High contrast mode support
 *    - Color blind friendly palette
 * 
 * 4. Focus Management
 *    - Visible focus indicators
 *    - Focus trapping in modals
 *    - Focus restoration
 * 
 * 5. Form Accessibility
 *    - Label associations
 *    - Error announcements
 *    - Required field indicators
 *    - Input validation feedback
 * 
 * 6. Motion & Animation
 *    - Respect prefers-reduced-motion
 *    - Optional animation controls
 * 
 * 7. Text & Typography
 *    - Resizable text up to 200%
 *    - Line height 1.5 minimum
 *    - Readable font sizes (16px minimum)
 * 
 * 8. Interactive Elements
 *    - Minimum touch target size (44x44px)
 *    - Visible hover/active states
 *    - Clear focus indicators
 */

export const A11Y_CONFIG = {
  // Minimum touch target size (WCAG 2.5.5)
  MIN_TOUCH_TARGET: 44, // pixels
  
  // Color contrast ratios (WCAG 1.4.3)
  CONTRAST_RATIOS: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    UI_COMPONENTS: 3.0,
  },
  
  // Animation preferences
  ANIMATION: {
    DURATION_SHORT: 200, // ms
    DURATION_MEDIUM: 300, // ms
    DURATION_LONG: 500, // ms
  },
  
  // Typography
  TYPOGRAPHY: {
    MIN_FONT_SIZE: 16, // pixels
    MIN_LINE_HEIGHT: 1.5,
    PARAGRAPH_SPACING: 2, // em
  },
  
  // Focus management
  FOCUS: {
    OUTLINE_WIDTH: 2, // pixels
    OUTLINE_OFFSET: 2, // pixels
    OUTLINE_COLOR: '#3b82f6', // blue-600
  },
  
  // ARIA live region politeness
  LIVE_REGION: {
    POLITE: 'polite' as const,
    ASSERTIVE: 'assertive' as const,
    OFF: 'off' as const,
  },
} as const;

/**
 * Keyboard shortcuts configuration
 */
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  SKIP_TO_CONTENT: ['Alt', 'S'],
  SKIP_TO_NAV: ['Alt', 'N'],
  
  // Actions
  OPEN_MENU: ['Alt', 'M'],
  CLOSE_MODAL: ['Escape'],
  SUBMIT_FORM: ['Ctrl', 'Enter'],
  
  // Accessibility
  TOGGLE_HIGH_CONTRAST: ['Alt', 'Shift', 'H'],
  INCREASE_FONT_SIZE: ['Ctrl', '+'],
  DECREASE_FONT_SIZE: ['Ctrl', '-'],
} as const;

/**
 * ARIA role definitions for semantic HTML
 */
export const ARIA_ROLES = {
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  SEARCH: 'search',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  REGION: 'region',
  ALERT: 'alert',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  STATUS: 'status',
  LOG: 'log',
} as const;

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Focus trap for modals and dialogs
 */
export function createFocusTrap(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Get accessible label for element
 */
export function getAccessibleLabel(element: HTMLElement): string {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.getAttribute('title') ||
    element.textContent ||
    ''
  );
}
