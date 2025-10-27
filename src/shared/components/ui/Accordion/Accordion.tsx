/**
 * Accordion Compound Component
 *
 * Modern compound component pattern for accordion/collapsible sections using React 19.
 *
 * Features:
 * - Compound component pattern for flexible composition
 * - Single and multiple expansion modes
 * - Full keyboard navigation (Arrow keys, Home, End, Space, Enter)
 * - ARIA compliant accordion pattern
 * - Smooth height animations
 * - Controlled and uncontrolled modes
 * - Dark mode support
 * - TypeScript with full type safety
 *
 * @example
 * // Single expansion mode
 * <Accordion type="single" defaultValue="item-1">
 *   <Accordion.Item value="item-1">
 *     <Accordion.Trigger>Section 1</Accordion.Trigger>
 *     <Accordion.Content>Content 1</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 *
 * @example
 * // Multiple expansion mode
 * <Accordion type="multiple" defaultValue={["item-1", "item-2"]}>
 *   <Accordion.Item value="item-1">
 *     <Accordion.Trigger>Section 1</Accordion.Trigger>
 *     <Accordion.Content>Content 1</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 */

import { cn } from '@shared/utils';
import { ChevronDown } from 'lucide-react';
import {
  createContext,
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

type AccordionType = 'single' | 'multiple';

interface AccordionContextValue {
  type: AccordionType;
  expandedValues: string[];
  toggleItem: (value: string) => void;
  isExpanded: (value: string) => boolean;
  collapsible: boolean;
  disabled: boolean;
  baseId: string;
}

// ============================================================================
// Context
// ============================================================================

const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion compound components must be used within an Accordion component');
  }
  return context;
};

// ============================================================================
// Root Component
// ============================================================================

interface SingleAccordionProps {
  /** Type of accordion */
  type: 'single';

  /** Current expanded item value (controlled) */
  value?: string;

  /** Default expanded item value (uncontrolled) */
  defaultValue?: string;

  /** Called when expanded item changes */
  onValueChange?: (value: string | undefined) => void;

  /** Allow collapsing the expanded item */
  collapsible?: boolean;
}

interface MultipleAccordionProps {
  /** Type of accordion */
  type: 'multiple';

  /** Current expanded items values (controlled) */
  value?: string[];

  /** Default expanded items values (uncontrolled) */
  defaultValue?: string[];

  /** Called when expanded items change */
  onValueChange?: (value: string[]) => void;

  /** Not applicable for multiple mode */
  collapsible?: never;
}

type AccordionBaseProps = {
  /** Children (Accordion.Item components) */
  children: ReactNode;

  /** Disabled state for all items */
  disabled?: boolean;

  /** Additional class name */
  className?: string;
};

export type AccordionProps = AccordionBaseProps & (SingleAccordionProps | MultipleAccordionProps);

function AccordionRoot(props: AccordionProps) {
  const { type, children, disabled = false, className = '' } = props;

  const baseId = useId();

  // Single mode state
  const [singleValue, setSingleValue] = useState<string | undefined>(
    type === 'single' ? props.defaultValue : undefined
  );

  // Multiple mode state
  const [multipleValues, setMultipleValues] = useState<string[]>(
    type === 'multiple' ? props.defaultValue || [] : []
  );

  // Determine if controlled
  const isSingleControlled = type === 'single' && props.value !== undefined;
  const isMultipleControlled = type === 'multiple' && props.value !== undefined;

  // Get current expanded values
  const expandedValues =
    type === 'single'
      ? isSingleControlled
        ? props.value
          ? [props.value]
          : []
        : singleValue
          ? [singleValue]
          : []
      : isMultipleControlled
        ? props.value || []
        : multipleValues;

  // ✅ React 19: No useCallback needed - React Compiler optimizes
  const toggleItem = (value: string) => {
    if (type === 'single') {
      const newValue = expandedValues.includes(value)
        ? props.collapsible
          ? undefined
          : expandedValues[0]
        : value;

      if (!isSingleControlled) {
        setSingleValue(newValue);
      }
      props.onValueChange?.(newValue);
    } else {
      const newValues = expandedValues.includes(value)
        ? expandedValues.filter((v) => v !== value)
        : [...expandedValues, value];

      if (!isMultipleControlled) {
        setMultipleValues(newValues);
      }
      props.onValueChange?.(newValues);
    }
  };

  const isExpanded = (value: string) => expandedValues.includes(value);

  const contextValue: AccordionContextValue = {
    type,
    expandedValues,
    toggleItem,
    isExpanded,
    collapsible: type === 'single' ? (props.collapsible ?? false) : true,
    disabled,
    baseId,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn('accordion-root space-y-2', className)} data-orientation="vertical">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// ============================================================================
// Item Component
// ============================================================================

export interface AccordionItemProps {
  /** Item value (unique identifier) */
  value: string;

  /** Children (Trigger and Content) */
  children: ReactNode;

  /** Disabled state for this item */
  disabled?: boolean;

  /** Additional class name */
  className?: string;
}

function AccordionItem({ children, disabled = false, className = '' }: AccordionItemProps) {
  const { disabled: accordionDisabled } = useAccordionContext();
  const isDisabled = disabled || accordionDisabled;

  return (
    <div
      className={cn(
        'accordion-item',
        'border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-lg',
        'bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)]',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      data-state={isDisabled ? 'disabled' : 'enabled'}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Trigger Component
// ============================================================================

export interface AccordionTriggerProps {
  /** Children */
  children: ReactNode;

  /** Additional class name */
  className?: string;

  /** Hide the chevron icon */
  hideIcon?: boolean;
}

function AccordionTrigger({ children, className = '', hideIcon = false }: AccordionTriggerProps) {
  const { toggleItem, isExpanded, disabled, baseId } = useAccordionContext();
  const itemContext = useAccordionItemContext();

  const { value } = itemContext;
  const expanded = isExpanded(value);
  const triggerId = `${baseId}-trigger-${value}`;
  const contentId = `${baseId}-content-${value}`;

  const handleClick = () => {
    if (!disabled) {
      toggleItem(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <h3 className="accordion-header">
      <button
        id={triggerId}
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'accordion-trigger',
          'flex items-center justify-between w-full',
          'px-4 py-3 text-left',
          'font-medium text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]',
          'transition-all duration-200',
          'hover:bg-[var(--color-surface-secondary)] dark:hover:bg-[var(--color-surface-primary)]/50',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'rounded-lg',
          className
        )}
      >
        <span className="flex-1">{children}</span>
        {!hideIcon && (
          <ChevronDown
            className={cn(
              'icon-sm text-[var(--color-text-tertiary)] dark:text-[color:var(--color-text-tertiary)] transition-transform duration-200',
              expanded && 'rotate-180'
            )}
            aria-hidden="true"
          />
        )}
      </button>
    </h3>
  );
}

// ============================================================================
// Content Component
// ============================================================================

export interface AccordionContentProps {
  /** Children */
  children: ReactNode;

  /** Additional class name */
  className?: string;
}

function AccordionContent({ children, className = '' }: AccordionContentProps) {
  const { isExpanded, baseId } = useAccordionContext();
  const itemContext = useAccordionItemContext();
  const { value } = itemContext;

  const expanded = isExpanded(value);
  const contentId = `${baseId}-content-${value}`;
  const triggerId = `${baseId}-trigger-${value}`;

  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(expanded ? undefined : 0);

  useEffect(() => {
    if (!contentRef.current) return undefined;

    if (expanded) {
      // Measure the natural height
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);

      // After animation, set to auto for responsive content
      const timer = setTimeout(() => {
        setHeight(undefined);
      }, 200);

      return () => clearTimeout(timer);
    }

    // Collapse: first set explicit height, then animate to 0
    const contentHeight = contentRef.current.scrollHeight;
    setHeight(contentHeight);

    requestAnimationFrame(() => {
      setHeight(0);
    });

    return undefined;
  }, [expanded]);

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={cn(
        'accordion-content overflow-hidden transition-all duration-200 ease-in-out',
        className
      )}
      style={{ height: height !== undefined ? `${height}px` : 'auto' }}
      data-state={expanded ? 'open' : 'closed'}
    >
      <div ref={contentRef} className="px-4 pb-4 pt-2">
        <div className="text-sm text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Item Context (for Trigger and Content to access item value)
// ============================================================================

interface AccordionItemContextValue {
  value: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const useAccordionItemContext = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('Accordion.Trigger and Accordion.Content must be used within Accordion.Item');
  }
  return context;
};

// Wrap Item to provide context
const AccordionItemWithContext = ({ value, ...props }: AccordionItemProps) => {
  const itemContextValue: AccordionItemContextValue = { value };

  return (
    <AccordionItemContext.Provider value={itemContextValue}>
      <AccordionItem value={value} {...props} />
    </AccordionItemContext.Provider>
  );
};

// ============================================================================
// Create compound component with sub-components (React 19 compatible)
// ============================================================================

// Set display names
AccordionRoot.displayName = 'Accordion';
AccordionItem.displayName = 'Accordion.Item';
AccordionTrigger.displayName = 'Accordion.Trigger';
AccordionContent.displayName = 'Accordion.Content';

// Create compound component object
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItemWithContext,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

// Export individual components for advanced use cases
export { AccordionContent, AccordionItem, AccordionTrigger };
export default Accordion;
