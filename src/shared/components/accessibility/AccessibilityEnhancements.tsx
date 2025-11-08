// ========================================
// Accessibility Enhancement System
// ========================================
// Comprehensive accessibility features:
// - Focus management with trapFocus
// - Screen reader optimizations
// - Keyboard navigation patterns
// - ARIA live regions for dynamic content
// - Skip links and landmarks
// ========================================

import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ========================================
// Focus Management System
// ========================================

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // This should trigger the parent to close the trap
        container.dispatchEvent(new CustomEvent('escapeFocusTrap'));
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

// ========================================
// Skip Links Component
// ========================================

export function SkipLinks() {
  const skipToContent = () => {
    const contentElement = document.getElementById('main-content') || 
                          document.querySelector('main') || 
                          document.querySelector('[role="main"]');
    
    if (contentElement) {
      (contentElement as HTMLElement).focus();
      contentElement.scrollIntoView();
    }
  };

  const skipToNavigation = () => {
    const navElement = document.getElementById('main-navigation') || 
                      document.querySelector('nav') || 
                      document.querySelector('[role="navigation"]');
    
    if (navElement) {
      (navElement as HTMLElement).focus();
      navElement.scrollIntoView();
    }
  };

  return (
    <div className="skip-links">
      <a
        href="#main-content"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        onClick={skipToNavigation}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg"
      >
        Skip to navigation
      </a>
    </div>
  );
}

// ========================================
// Live Region for Dynamic Announcements
// ========================================

export function useLiveRegion() {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; priority: 'polite' | 'assertive' }>>([]);

  const announce = useCallback((text: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `announcement-${Date.now()}`;
    setMessages(prev => [...prev, { id, text, priority }]);

    // Auto-clear after announcement
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }, 1000);
  }, []);

  const LiveRegion = () => (
    <>
      {/* Polite announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {messages
          .filter(msg => msg.priority === 'polite')
          .map(msg => (
            <div key={msg.id}>{msg.text}</div>
          ))}
      </div>

      {/* Assertive announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {messages
          .filter(msg => msg.priority === 'assertive')
          .map(msg => (
            <div key={msg.id}>{msg.text}</div>
          ))}
      </div>
    </>
  );

  return { announce, LiveRegion };
}

// ========================================
// Accessible Modal Component
// ========================================

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  size = 'md',
}: AccessibleModalProps) {
  const containerRef = useFocusTrap(isOpen);
  const { announce } = useLiveRegion();

  // Announce modal state changes
  useEffect(() => {
    if (isOpen) {
      announce(`${title} dialog opened`, 'polite');
    }
  }, [isOpen, title, announce]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscape = useCallback(() => {
    if (closeOnEscape) {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  // Handle escape key from focus trap
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleEscapeEvent = () => handleEscape();
    container.addEventListener('escapeFocusTrap', handleEscapeEvent);

    return () => {
      container.removeEventListener('escapeFocusTrap', handleEscapeEvent);
    };
  }, [handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={containerRef}
        className={`bg-white rounded-lg shadow-xl p-6 m-4 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div role="document">
          {children}
        </div>
      </div>
    </div>
  );
}

// ========================================
// Accessible Navigation with Breadcrumbs
// ========================================

interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

interface AccessibleBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function AccessibleBreadcrumbs({ items, className = '' }: AccessibleBreadcrumbsProps) {
  const navigate = useNavigate();

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {item.current || !item.path ? (
              <span
                aria-current={item.current ? 'page' : undefined}
                className={item.current ? 'font-medium text-gray-900' : 'text-gray-500'}
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(item.path!)}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ========================================
// Keyboard Navigation Hook
// ========================================

interface KeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: (e: KeyboardEvent) => void;
  disabled?: boolean;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (options.disabled) return;

    const element = elementRef.current;
    if (!element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          options.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          options.onArrowDown?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          options.onArrowLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          options.onArrowRight?.();
          break;
        case 'Enter':
          e.preventDefault();
          options.onEnter?.();
          break;
        case 'Escape':
          e.preventDefault();
          options.onEscape?.();
          break;
        case 'Tab':
          options.onTab?.(e);
          break;
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [options]);

  return elementRef;
}

// ========================================
// Accessible Dropdown Menu
// ========================================

interface DropdownItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface AccessibleDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
}

export function AccessibleDropdown({ trigger, items, className = '' }: AccessibleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const navRef = useKeyboardNavigation({
    onArrowUp: () => {
      setActiveIndex(prev => {
        const newIndex = prev <= 0 ? items.length - 1 : prev - 1;
        return items[newIndex]?.disabled ? newIndex - 1 : newIndex;
      });
    },
    onArrowDown: () => {
      setActiveIndex(prev => {
        const newIndex = prev >= items.length - 1 ? 0 : prev + 1;
        return items[newIndex]?.disabled ? newIndex + 1 : newIndex;
      });
    },
    onEnter: () => {
      if (activeIndex >= 0 && !items[activeIndex]?.disabled) {
        items[activeIndex].onClick();
        setIsOpen(false);
      }
    },
    onEscape: () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    disabled: !isOpen,
  });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveIndex(-1);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        id="dropdown-trigger"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={(el) => {
            menuRef.current = el;
            if (navRef.current !== el) {
              (navRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }
          }}
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-trigger"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={`
                  flex items-center w-full px-4 py-2 text-sm text-left transition-colors
                  ${item.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${activeIndex === index ? 'bg-blue-50 text-blue-700' : ''}
                `}
                role="menuitem"
                disabled={item.disabled}
                tabIndex={-1}
              >
                {item.icon && <span className="mr-3 shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// Page Announcements Component
// ========================================

export function PageAnnouncements() {
  const location = useLocation();
  const { announce } = useLiveRegion();

  // Announce page changes
  useEffect(() => {
    // Get page title or generate from pathname
    const pageTitle = document.title || location.pathname.split('/').filter(Boolean).join(' ');
    announce(`Navigated to ${pageTitle}`, 'polite');
  }, [location, announce]);

  return null; // This component only handles announcements
}

// ========================================
// Form Accessibility Enhancements
// ========================================

interface AccessibleFormFieldProps {
  id: string;
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function AccessibleFormField({
  id,
  label,
  error,
  helpText,
  required,
  children,
}: AccessibleFormFieldProps) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      <div>
        {children}
      </div>
      
      {helpText && (
        <p id={helpId} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
      
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
}

// ========================================
// Accessibility Testing Component
// ========================================

export function AccessibilityDemo() {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { announce, LiveRegion } = useLiveRegion();

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Accessibility', path: '/accessibility' },
    { label: 'Demo', current: true },
  ];

  const dropdownItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'View Profile',
      onClick: () => announce('Profile selected'),
      icon: '👤',
    },
    {
      id: 'settings',
      label: 'Settings',
      onClick: () => announce('Settings selected'),
      icon: '⚙️',
    },
    {
      id: 'logout',
      label: 'Log Out',
      onClick: () => announce('Logged out'),
      icon: '🚪',
    },
    {
      id: 'disabled',
      label: 'Disabled Item',
      onClick: () => {},
      disabled: true,
      icon: '🚫',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <SkipLinks />
      <LiveRegion />
      <PageAnnouncements />

      <header>
        <h1 className="text-3xl font-bold mb-4">Accessibility Enhancement Demo</h1>
        <AccessibleBreadcrumbs items={breadcrumbItems} />
      </header>

      <main id="main-content" tabIndex={-1} role="main">
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Interactive Components</h2>

          {/* Modal Demo */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Accessible Modal</h3>
            <p className="text-gray-600 mb-4">
              Modal with focus trapping, escape key handling, and screen reader announcements.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Open Modal
            </button>

            <AccessibleModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title="Example Modal"
              size="md"
            >
              <p className="mb-4">
                This is an accessible modal with proper focus management. 
                Try using the Tab key to navigate and Escape to close.
              </p>
              
              <AccessibleFormField
                id="modal-input"
                label="Example Input"
                helpText="This input is properly labeled and described"
                required
              >
                <input
                  id="modal-input"
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type something..."
                  aria-describedby="modal-input-help"
                />
              </AccessibleFormField>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    announce('Form submitted successfully!', 'assertive');
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit
                </button>
              </div>
            </AccessibleModal>
          </div>

          {/* Dropdown Demo */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Accessible Dropdown</h3>
            <p className="text-gray-600 mb-4">
              Dropdown with keyboard navigation (arrow keys, enter, escape) and screen reader support.
            </p>
            
            <AccessibleDropdown
              trigger={
                <span className="flex items-center">
                  User Menu
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              }
              items={dropdownItems}
            />
          </div>

          {/* Live Region Demo */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Live Region Announcements</h3>
            <p className="text-gray-600 mb-4">
              Buttons that make announcements to screen readers without visual changes.
            </p>
            
            <div className="space-x-2">
              <button
                onClick={() => announce('Polite announcement made', 'polite')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Polite Announcement
              </button>
              
              <button
                onClick={() => announce('Urgent announcement!', 'assertive')}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Assertive Announcement
              </button>
            </div>
          </div>

          {/* Keyboard Navigation Demo */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Keyboard Navigation</h3>
            <p className="text-gray-600 mb-4">
              Use arrow keys to navigate, Enter to select, Escape to clear selection.
            </p>
            
            <KeyboardNavigationGrid
              items={['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6']}
              onSelect={(item) => {
                setSelectedItem(item);
                announce(`Selected ${item}`, 'polite');
              }}
              selectedItem={selectedItem}
            />
            
            {selectedItem && (
              <p className="mt-2 text-sm text-blue-600">
                Selected: <strong>{selectedItem}</strong>
              </p>
            )}
          </div>
        </section>
      </main>

      <footer role="contentinfo" className="text-center text-gray-500 text-sm">
        <p>Press Ctrl+Shift+A to toggle accessibility features</p>
      </footer>
    </div>
  );
}

// ========================================
// Keyboard Navigation Grid Component
// ========================================

interface KeyboardNavigationGridProps {
  items: string[];
  onSelect: (item: string) => void;
  selectedItem: string | null;
  columns?: number;
}

function KeyboardNavigationGrid({ 
  items, 
  onSelect, 
  selectedItem, 
  columns = 3 
}: KeyboardNavigationGridProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const gridRef = useKeyboardNavigation({
    onArrowUp: () => {
      setFocusedIndex(prev => {
        const newIndex = prev - columns;
        return newIndex >= 0 ? newIndex : prev;
      });
    },
    onArrowDown: () => {
      setFocusedIndex(prev => {
        const newIndex = prev + columns;
        return newIndex < items.length ? newIndex : prev;
      });
    },
    onArrowLeft: () => {
      setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
    },
    onArrowRight: () => {
      setFocusedIndex(prev => prev < items.length - 1 ? prev + 1 : prev);
    },
    onEnter: () => {
      onSelect(items[focusedIndex]);
    },
    onEscape: () => {
      onSelect('');
    },
  });

  return (
    <div
      ref={gridRef as React.RefObject<HTMLDivElement>}
      className={`grid grid-cols-${columns} gap-2`}
      role="grid"
      tabIndex={0}
      aria-label="Navigatable item grid"
    >
      {items.map((item, index) => (
        <div
          key={item}
          className={`
            p-3 border rounded text-center cursor-pointer transition-colors
            ${focusedIndex === index ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
            ${selectedItem === item ? 'bg-green-100 border-green-500' : 'border-gray-300 hover:bg-gray-50'}
          `}
          role="gridcell"
          aria-selected={selectedItem === item}
          onClick={() => onSelect(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );
};