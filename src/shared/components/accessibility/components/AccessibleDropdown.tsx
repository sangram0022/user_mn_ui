/**
 * AccessibleDropdown Component
 * Dropdown menu with keyboard navigation (arrows, enter, escape)
 */

import { useState, useRef, useEffect } from 'react';
import { useKeyboardNavigation } from '@/shared/hooks/accessibility';

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

export type { DropdownItem, AccessibleDropdownProps };
