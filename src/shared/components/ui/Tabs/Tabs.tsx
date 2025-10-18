/**
 * Tabs Compound Component
 *
 * Modern compound component pattern for tab navigation using React 19.
 *
 * Features:
 * - Compound component pattern for flexible composition
 * - Full keyboard navigation (Arrow keys, Home, End)
 * - ARIA compliant (tabs, tablist, tabpanel roles)
 * - Controlled and uncontrolled modes
 * - Multiple variants (line, enclosed, pills)
 * - Dark mode support
 * - TypeScript with full type safety
 *
 * @example
 * <Tabs defaultValue="tab1">
 *   <Tabs.List>
 *     <Tabs.Tab value="tab1">Profile</Tabs.Tab>
 *     <Tabs.Tab value="tab2">Settings</Tabs.Tab>
 *   </Tabs.List>
 *
 *   <Tabs.Panel value="tab1">
 *     Profile content
 *   </Tabs.Panel>
 *   <Tabs.Panel value="tab2">
 *     Settings content
 *   </Tabs.Panel>
 * </Tabs>
 */

import { cn } from '@shared/utils';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type TabsVariant = 'line' | 'enclosed' | 'pills';
export type TabsOrientation = 'horizontal' | 'vertical';

interface TabsContextValue {
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  variant: TabsVariant;
  orientation: TabsOrientation;
  baseId: string;
  registerTab: (value: string, element: HTMLButtonElement) => void;
  unregisterTab: (value: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs component');
  }
  return context;
};

// ============================================================================
// Root Component
// ============================================================================

export interface TabsProps {
  /** Current selected tab value (controlled) */
  value?: string;

  /** Default selected tab value (uncontrolled) */
  defaultValue?: string;

  /** Called when tab changes */
  onChange?: (value: string) => void;

  /** Visual variant */
  variant?: TabsVariant;

  /** Tab orientation */
  orientation?: TabsOrientation;

  /** Children (Tab.List and Tab.Panel components) */
  children: ReactNode;

  /** Additional class name */
  className?: string;
}

function TabsRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  variant = 'line',
  orientation = 'horizontal',
  children,
  className = '',
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
  const tabsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const baseId = useId();

  // Determine if controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const selectedValue = isControlled ? controlledValue : uncontrolledValue;

  const setSelectedValue = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  const registerTab = useCallback((value: string, element: HTMLButtonElement) => {
    tabsRef.current.set(value, element);
  }, []);

  const unregisterTab = useCallback((value: string) => {
    tabsRef.current.delete(value);
  }, []);

  const contextValue: TabsContextValue = {
    selectedValue,
    setSelectedValue,
    variant,
    orientation,
    baseId,
    registerTab,
    unregisterTab,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('tabs-root', orientation === 'vertical' && 'flex gap-4', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ============================================================================
// TabsList Component
// ============================================================================

export interface TabsListProps {
  /** Children (Tab components) */
  children: ReactNode;

  /** Additional class name */
  className?: string;

  /** Aria label for the tab list */
  'aria-label'?: string;
}

function TabsList({ children, className = '', 'aria-label': ariaLabel }: TabsListProps) {
  const { variant, orientation, baseId } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') || []
    );
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  };

  const variantStyles = {
    line: `
      border-b border-gray-200 dark:border-gray-700
    `,
    enclosed: `
      border border-gray-200 dark:border-gray-700
      rounded-lg p-1 bg-gray-50 dark:bg-gray-800/50
    `,
    pills: `
      bg-gray-100 dark:bg-gray-800 rounded-lg p-1
    `,
  };

  const orientationStyles = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col',
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel || 'Tabs'}
      aria-orientation={orientation}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'tabs-list',
        variantStyles[variant],
        orientationStyles[orientation],
        variant === 'line' && orientation === 'horizontal' && 'gap-6',
        variant !== 'line' && 'gap-1',
        className
      )}
      id={`${baseId}-tablist`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Tab Component
// ============================================================================

export interface TabProps {
  /** Tab value (unique identifier) */
  value: string;

  /** Children */
  children: ReactNode;

  /** Disabled state */
  disabled?: boolean;

  /** Additional class name */
  className?: string;
}

function Tab({ value, children, disabled = false, className = '' }: TabProps) {
  const { selectedValue, setSelectedValue, variant, baseId, registerTab, unregisterTab } =
    useTabsContext();
  const ref = useRef<HTMLButtonElement>(null);
  const isSelected = selectedValue === value;

  useEffect(() => {
    if (ref.current) {
      registerTab(value, ref.current);
    }
    return () => unregisterTab(value);
  }, [value, registerTab, unregisterTab]);

  const handleClick = () => {
    if (!disabled) {
      setSelectedValue(value);
    }
  };

  const baseStyles = `
    px-4 py-2.5
    font-medium text-sm
    transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    line: isSelected
      ? `
        text-blue-600 dark:text-blue-400
        border-b-2 border-blue-600 dark:border-blue-400
        -mb-px
      `
      : `
        text-gray-600 dark:text-gray-400
        border-b-2 border-transparent
        hover:text-gray-900 dark:hover:text-gray-200
        hover:border-gray-300 dark:hover:border-gray-600
        -mb-px
      `,
    enclosed: isSelected
      ? `
        bg-white dark:bg-gray-900
        text-blue-600 dark:text-blue-400
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-sm
      `
      : `
        text-gray-600 dark:text-gray-400
        hover:text-gray-900 dark:hover:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-700/50
        rounded-lg
      `,
    pills: isSelected
      ? `
        bg-white dark:bg-gray-900
        text-blue-600 dark:text-blue-400
        rounded-md shadow-sm
      `
      : `
        text-gray-600 dark:text-gray-400
        hover:text-gray-900 dark:hover:text-gray-200
        hover:bg-gray-200 dark:hover:bg-gray-700
        rounded-md
      `,
  };

  return (
    <button
      ref={ref}
      role="tab"
      type="button"
      aria-selected={isSelected}
      aria-controls={`${baseId}-panel-${value}`}
      id={`${baseId}-tab-${value}`}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </button>
  );
}

// ============================================================================
// TabPanel Component
// ============================================================================

export interface TabPanelProps {
  /** Panel value (must match corresponding Tab value) */
  value: string;

  /** Children */
  children: ReactNode;

  /** Additional class name */
  className?: string;

  /** Keep panel mounted when not visible */
  keepMounted?: boolean;
}

function TabPanel({ value, children, className = '', keepMounted = false }: TabPanelProps) {
  const { selectedValue, baseId } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!isSelected && !keepMounted) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!isSelected}
      tabIndex={0}
      className={cn(
        'tabs-panel',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg',
        !isSelected && keepMounted && 'hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Create compound component with sub-components (React 19 compatible)
// ============================================================================

// Set display names
TabsRoot.displayName = 'Tabs';
TabsList.displayName = 'Tabs.List';
Tab.displayName = 'Tabs.Tab';
TabPanel.displayName = 'Tabs.Panel';

// Create compound component object
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab,
  Panel: TabPanel,
});

// Export individual components for advanced use cases
export { Tab, TabPanel, TabsList };
export default Tabs;
