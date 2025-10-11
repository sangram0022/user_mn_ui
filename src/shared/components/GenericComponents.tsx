/**
 * Generic Reusable Components with Advanced TypeScript
 * Expert-level component patterns by 20-year React developer
 */

import {
  forwardRef,
  useMemo,
  useCallback,
  type ComponentProps,
  type ReactNode,
  type ElementType,
  type ComponentPropsWithRef,
  useEffect,
} from 'react';

// ==================== UTILITY TYPES ====================

export type PolymorphicRef<T extends ElementType> = ComponentPropsWithRef<T>['ref'];

export type PolymorphicComponentProp<T extends ElementType, P = object> = { as?: T } & P &
  Omit<ComponentProps<T>, keyof P | 'as'>;

// ==================== GENERIC BUTTON COMPONENT ====================

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps & Omit<ComponentProps<'button'>, keyof ButtonProps>
>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const buttonClasses = useMemo(() => {
      const baseClasses = [
        'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : '',
      ];

      const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      };

      const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
      };

      return [...baseClasses, variantClasses[variant], sizeClasses[size], className]
        .filter(Boolean)
        .join(' ');
    }, [variant, size, fullWidth, className]);

    const isDisabled = disabled || loading;

    return (
      <button ref={ref} className={buttonClasses} disabled={isDisabled} {...props}>
        {loading && (
          <svg
            className={`animate-spin -ml-1 h-4 w-4 ${leftIcon || rightIcon ? 'mr-2' : 'mr-3'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}

        {children}

        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ==================== GENERIC INPUT COMPONENT ====================

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  variant?: 'outline' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<
  HTMLInputElement,
  InputProps & Omit<ComponentProps<'input'>, keyof InputProps>
>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      variant = 'outline',
      size = 'md',
      leftAddon,
      rightAddon,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputClasses = useMemo(() => {
      const baseClasses = [
        'block transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        fullWidth ? 'w-full' : '',
        leftAddon ? 'rounded-l-none' : '',
        rightAddon ? 'rounded-r-none' : '',
      ];

      const variantClasses = {
        outline: [
          'border border-gray-300 rounded-md bg-white',
          'focus:ring-blue-500 focus:border-blue-500',
          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '',
        ],
        filled: [
          'border-0 rounded-md bg-gray-100',
          'focus:ring-blue-500 focus:bg-white',
          error ? 'bg-red-50 focus:ring-red-500' : '',
        ],
        underlined: [
          'border-0 border-b-2 border-gray-300 rounded-none bg-transparent',
          'focus:ring-0 focus:border-blue-500',
          error ? 'border-red-300 focus:border-red-500' : '',
        ],
      };

      const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      };

      return [...baseClasses, ...variantClasses[variant], sizeClasses[size], className]
        .filter(Boolean)
        .join(' ');
    }, [variant, size, fullWidth, leftAddon, rightAddon, error, className]);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1 ${error ? 'text-red-700' : 'text-gray-700'}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex">
          {leftAddon && (
            <div className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {rightAddon && (
            <div className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ==================== GENERIC CARD COMPONENT ====================

export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export const Card = forwardRef<
  HTMLDivElement,
  CardProps & Omit<ComponentProps<'div'>, keyof CardProps>
>(
  (
    { variant = 'elevated', padding = 'md', header, footer, children, className = '', ...props },
    ref
  ) => {
    const cardClasses = useMemo(() => {
      const baseClasses = ['rounded-lg overflow-hidden'];

      const variantClasses = {
        elevated: 'bg-white shadow-lg border border-gray-200',
        outlined: 'bg-white border-2 border-gray-200',
        filled: 'bg-gray-50 border border-gray-200',
      };

      return [...baseClasses, variantClasses[variant], className].filter(Boolean).join(' ');
    }, [variant, className]);

    const contentPadding = useMemo(() => {
      const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      };
      return paddingClasses[padding];
    }, [padding]);

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {header && <div className="border-b border-gray-200 px-6 py-4">{header}</div>}

        <div className={contentPadding}>{children}</div>

        {footer && <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">{footer}</div>}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ==================== GENERIC MODAL COMPONENT ====================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
}) => {
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const modalSizes = useMemo(() => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4',
    };
    return sizes[size];
  }, [size]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title ? 'modal-title' : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          className={`
          inline-block w-full overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:w-full
          ${modalSizes}
        `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              {title && (
                <h3 id="modal-title" className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ==================== GENERIC TABLE COMPONENT ====================

export interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: T[keyof T], item: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: ReactNode;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
  rowKey?: keyof T | ((item: T, index: number) => string | number);
  onRowClick?: (item: T, index: number) => void;
  striped?: boolean;
  hoverable?: boolean;
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyState,
  onSort,
  sortKey,
  sortDirection,
  rowKey,
  onRowClick,
  striped = false,
  hoverable = true,
}: TableProps<T>) {
  const handleSort = useCallback(
    (key: keyof T) => {
      if (!onSort) return;

      const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(key, newDirection);
    },
    [onSort, sortKey, sortDirection]
  );

  const getRowKey = useCallback(
    (item: T, index: number) => {
      if (typeof rowKey === 'function') {
        return rowKey(item, index);
      }
      if (rowKey && item[rowKey] !== undefined) {
        return String(item[rowKey]);
      }
      return index;
    },
    [rowKey]
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyState || (
          <div>
            <p className="text-gray-500 text-lg">No data available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`
                  px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                `}
                style={{ width: column.width }}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.title}</span>
                  {column.sortable && (
                    <div className="flex flex-col">
                      <svg
                        className={`w-3 h-3 ${
                          sortKey === column.key && sortDirection === 'asc'
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <svg
                        className={`w-3 h-3 -mt-1 ${
                          sortKey === column.key && sortDirection === 'desc'
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y-0' : ''}`}>
          {data.map((item, index) => (
            <tr
              key={getRowKey(item, index)}
              className={`
                ${striped && index % 2 === 0 ? 'bg-gray-50' : ''}
                ${hoverable ? 'hover:bg-gray-50' : ''}
                ${onRowClick ? 'cursor-pointer' : ''}
                transition-colors duration-150
              `}
              onClick={onRowClick ? () => onRowClick(item, index) : undefined}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`
                    px-6 py-4 whitespace-nowrap text-sm text-gray-900
                    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                  `}
                >
                  {column.render
                    ? column.render(item[column.key], item, index)
                    : String(item[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default { Button, Input, Card, Modal, Table };
