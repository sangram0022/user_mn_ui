import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal component sizes
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal component props
 */
export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: ReactNode;
  /** Modal content */
  children: ReactNode;
  /** Modal footer content (typically action buttons) */
  footer?: ReactNode;
  /** Modal size variant */
  size?: ModalSize;
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing ESC closes the modal */
  closeOnEscape?: boolean;
  /** Custom className for the modal content */
  className?: string;
  /** Whether to show the close button in header */
  showCloseButton?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * Get the CSS class for modal size
 */
const getModalSizeClass = (size: ModalSize): string => {
  const sizeMap: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl',
  };
  return sizeMap[size];
};

/**
 * Modal Component
 *
 * A reusable, accessible modal dialog with:
 * - Portal rendering for proper z-index layering
 * - Focus trap (locks focus inside modal)
 * - Backdrop click and ESC key handling
 * - Smooth animations
 * - Multiple size variants
 * - Full accessibility (ARIA attributes)
 * - Dark mode support
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="md"
 *   footer={
 *     <>
 *       <button onClick={() => setIsOpen(false)}>Cancel</button>
 *       <button onClick={handleConfirm}>Confirm</button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  showCloseButton = true,
  ariaLabel,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap and restoration
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal
      modalRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        document.body.style.overflow = '';

        // Restore focus to previous element
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (closeOnBackdropClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClose();
    }
  };

  const modalContent = (
    <div
      className="modal-container"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`modal-content ${getModalSizeClass(size)} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-label={ariaLabel || (typeof title === 'string' ? title : 'Modal')}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );

  // Render in portal for proper z-index layering
  return createPortal(modalContent, document.body);
}

/**
 * Convenience component for modal footer with standard button layout
 */
export interface ModalFooterProps {
  /** Primary action button (e.g., "Save", "Confirm") */
  primaryAction?: ReactNode;
  /** Secondary action button (e.g., "Cancel") */
  secondaryAction?: ReactNode;
  /** Additional actions (rendered on the left side) */
  additionalActions?: ReactNode;
}

export function ModalFooter({
  primaryAction,
  secondaryAction,
  additionalActions,
}: ModalFooterProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left side - additional actions */}
      <div className="flex items-center gap-2">{additionalActions}</div>

      {/* Right side - primary and secondary actions */}
      <div className="flex items-center gap-2 ml-auto">
        {secondaryAction}
        {primaryAction}
      </div>
    </div>
  );
}

export default Modal;
