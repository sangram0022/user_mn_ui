/**
 * Comprehensive Accessibility (a11y) Utilities
 * WCAG 2.1 AA compliant implementation by 20-year React expert
 */

import React, { useEffect, 
  useRef, 
  useCallback, 
  useState } from 'react';
import type { KeyboardEvent,
  ReactNode } from 'react';

// ==================== ARIA UTILITIES ====================

export interface AriaAttributes { 'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-disabled'?: boolean;
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean | 'mixed';
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-owns'?: string;
  'aria-controls'?: string;
  'aria-activedescendant'?: string;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  'aria-level'?: number;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-errormessage'?: string;
  role?: string;
  tabIndex?: number; }

export class AriaManager {
  private static idCounter = 0;

  /**
   * Generate unique IDs for ARIA attributes
   */
  static generateId(prefix: string = 'aria'): string {
    return `${prefix}-${++this.idCounter}-${Date.now()}`;
  }

  /**
   * Create ARIA attributes for form fields
   */
  static createFieldAttributes(options: { label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    invalid?: boolean;
  }): AriaAttributes { const { label, description, error, required = false, invalid = false } = options;
    
    const attributes: AriaAttributes = {};
    
    if (label) { attributes['aria-label'] = label;
    }
    
    if (description) { const descId = this.generateId('desc');
      attributes['aria-describedby'] = descId;
    }
    
    if (error) { const errorId = this.generateId('error');
      attributes['aria-errormessage'] = errorId;
    }
    
    if (required) { attributes['aria-required'] = true;
    }
    
    if (invalid) { attributes['aria-invalid'] = true;
    }
    
    return attributes;
  }
}

// ==================== KEYBOARD NAVIGATION ====================

export class KeyboardManager { private static focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
    'audio[controls]',
    'video[controls]',
    'details > summary',
    'iframe'
  ].join(', ');

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: Element): HTMLElement[] {
    const elements = container.querySelectorAll(this.focusableSelectors);
    return Array.from(elements) as HTMLElement[];
  }

  /**
   * Get the first focusable element in a container
   */
  static getFirstFocusableElement(container: Element): HTMLElement | null { const elements = this.getFocusableElements(container);
    return elements.length > 0 ? elements[0] || null : null;
  }

  /**
   * Get the last focusable element in a container
   */
  static getLastFocusableElement(container: Element): HTMLElement | null { const elements = this.getFocusableElements(container);
    return elements.length > 0 ? elements[elements.length - 1] || null : null;
  }

  /**
   * Handle arrow key navigation for lists and menus
   */
  static handleArrowNavigation(
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    options: { orientation?: 'horizontal' | 'vertical';
      wrap?: boolean;
      onSelect?: (element: HTMLElement, index: number) => void;
    } = {}
  ): number { const { orientation = 'vertical', wrap = true, onSelect } = options;
    
    let newIndex = currentIndex;
    
    switch (event.key) { case 'ArrowUp':
        if (orientation === 'vertical') {
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? elements.length - 1 : 0);
        }
        break;
        
      case 'ArrowDown':
        if (orientation === 'vertical') { event.preventDefault();
          newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : (wrap ? 0 : elements.length - 1);
        }
        break;
        
      case 'ArrowLeft':
        if (orientation === 'horizontal') { event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? elements.length - 1 : 0);
        }
        break;
        
      case 'ArrowRight':
        if (orientation === 'horizontal') { event.preventDefault();
          newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : (wrap ? 0 : elements.length - 1);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
        
      case 'End':
        event.preventDefault();
        newIndex = elements.length - 1;
        break;
        
      case 'Enter':
      case ' ':
        if (onSelect && elements[currentIndex]) { event.preventDefault();
          onSelect(elements[currentIndex], currentIndex);
        }
        break;
    }
    
    if (newIndex !== currentIndex && elements[newIndex]) { elements[newIndex]?.focus();
    }
    
    return newIndex;
  }
}

// ==================== FOCUS MANAGEMENT ====================

export function useFocusManagement(options: { trapFocus?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  enabled?: boolean; } = {}) { const { trapFocus = false, autoFocus = false, restoreFocus = false, enabled = true } = options;
  
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => { if (!enabled || !containerRef.current) return;

    // Store previously focused element
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    // Auto focus first element
    if (autoFocus) { const firstFocusable = KeyboardManager.getFirstFocusableElement(containerRef.current);
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    // Focus trap
    if (trapFocus) { const handleKeyDown = (event: Event) => {
        const keyboardEvent = event as unknown as KeyboardEvent;
        if (keyboardEvent.key === 'Tab' && containerRef.current) {
          const focusableElements = KeyboardManager.getFocusableElements(containerRef.current);
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (keyboardEvent.shiftKey) {
            if (document.activeElement === firstElement) {
              keyboardEvent.preventDefault();
              lastElement?.focus();
            }
          } else { if (document.activeElement === lastElement) {
              keyboardEvent.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => { document.removeEventListener('keydown', handleKeyDown);
        
        // Restore focus
        if (restoreFocus && previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }

    return () => { // Restore focus when component unmounts
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [trapFocus, autoFocus, restoreFocus, enabled]);

  return containerRef;
}

// ==================== SCREEN READER UTILITIES ====================

export interface ScreenReaderAnnouncementOptions { priority?: 'polite' | 'assertive';
  atomic?: boolean;
  delay?: number; }

export class ScreenReaderManager { private static announceRegion: HTMLElement | null = null;

  /**
   * Initialize screen reader announcement region
   */
  static initialize(): void {
    if (this.announceRegion || typeof document === 'undefined') return;

    this.announceRegion = document.createElement('div');
    this.announceRegion.setAttribute('aria-live', 'polite');
    this.announceRegion.setAttribute('aria-atomic', 'true');
    this.announceRegion.className = 'sr-only'; // Screen reader only styles
    this.announceRegion.style.cssText = `
      position: absolute !important;
      left: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
    `;
    
    document.body.appendChild(this.announceRegion);
  }

  /**
   * Announce message to screen readers
   */
  static announce(
    message: string,
    options: ScreenReaderAnnouncementOptions = {}
  ): void { const { priority = 'polite', atomic = true, delay = 100 } = options;

    if (!this.announceRegion) { this.initialize();
    }

    if (!this.announceRegion || !message.trim()) return;

    // Update ARIA attributes
    this.announceRegion.setAttribute('aria-live', priority);
    this.announceRegion.setAttribute('aria-atomic', atomic.toString());

    // Clear previous content and announce new message after a brief delay
    setTimeout(() => { if (this.announceRegion) {
        this.announceRegion.textContent = message;
      }
    }, delay);

    // Clear the message after it's been announced
    setTimeout(() => { if (this.announceRegion) {
        this.announceRegion.textContent = '';
      }
    }, delay + 1000);
  }

  /**
   * Announce form validation errors
   */
  static announceFormError(fieldName: string, error: string): void {
    this.announce(`Error in ${fieldName}: ${error}`, { priority: 'assertive' });
  }

  /**
   * Announce successful actions
   */
  static announceSuccess(message: string): void { this.announce(message, { priority: 'polite' });
  }
}

// ==================== COLOR CONTRAST UTILITIES ====================

export class ColorContrastManager { /**
   * Calculate relative luminance of a color
   */
  static getRelativeLuminance(color: string): number {
    const rgb = this.parseColor(color);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * (r || 0) + 0.7152 * (g || 0) + 0.0722 * (b || 0);
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number { const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if color combination meets WCAG contrast requirements
   */
  static meetsContrastRequirement(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean { const ratio = this.getContrastRatio(foreground, background);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    } else { return size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }
  }

  /**
   * Parse color string to RGB values
   */
  private static parseColor(color: string): [number, number, number] | null { // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return [
          parseInt((hex[0] || '0') + (hex[0] || '0'), 16),
          parseInt((hex[1] || '0') + (hex[1] || '0'), 16),
          parseInt((hex[2] || '0') + (hex[2] || '0'), 16)
        ];
      } else if (hex.length === 6) { return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16)
        ];
      }
    }

    // Handle rgb colors
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) { return [
        parseInt(rgbMatch[1] || '0'),
        parseInt(rgbMatch[2] || '0'),
        parseInt(rgbMatch[3] || '0')
      ];
    }

    return null;
  }
}

// ==================== ACCESSIBILITY COMPONENTS ====================

export interface SkipLinkProps { href: string;
  children: ReactNode;
  className?: string; }

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children, className = '' }) => {
  return (
    <a
      href={href}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 
        bg-blue-600 text-white p-2 z-50 ${className}`}
      onFocus={(e) => { e.target.scrollIntoView();
      }}
    >
      {children}
    </a>
  );
};

export interface VisuallyHiddenProps { children: ReactNode;
  focusable?: boolean; }

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, 
  focusable = false  }) => {
  return (
    <span
      className={focusable ? 'sr-only focus:not-sr-only' : 'sr-only'}
      style={{ position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      {children}
    </span>
  );
};

// ==================== ACCESSIBILITY HOOKS ====================

export function useAnnounceToScreenReader() { useEffect(() => {
    ScreenReaderManager.initialize();
  }, []);

  return useCallback((message: string, options?: ScreenReaderAnnouncementOptions) => { ScreenReaderManager.announce(message, options);
  }, []);
}

export function useKeyboardNavigation(
  items: HTMLElement[],
  options: { orientation?: 'horizontal' | 'vertical';
    wrap?: boolean;
    onSelect?: (element: HTMLElement, index: number) => void;
  } = {}
) { const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const newIndex = KeyboardManager.handleArrowNavigation(
      event,
      items,
      activeIndex,
      {
        ...options,
        onSelect: (element, index) => {
          setActiveIndex(index);
          options.onSelect?.(element, index);
        }
      }
    );
    
    if (newIndex !== activeIndex) { setActiveIndex(newIndex);
    }
  }, [items, activeIndex, options]);

  return { activeIndex, handleKeyDown, setActiveIndex };
}

// ==================== EXPORTS ====================

export const a11yUtils = { aria: AriaManager,
  keyboard: KeyboardManager,
  screenReader: ScreenReaderManager,
  colorContrast: ColorContrastManager,
  useFocusManagement,
  useAnnounceToScreenReader,
  useKeyboardNavigation,
  SkipLink,
  VisuallyHidden };

export default a11yUtils;