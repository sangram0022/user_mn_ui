/**
 * Accessible Modal Component
 * WCAG 2.1 AA compliant with focus trap, keyboard navigation, and ARIA attributes
 */

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useKeyboardShortcut, SHORTCUTS } from '@/shared/hooks/useKeyboardShortcut';
import { ComponentErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideCloseButton = false,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useKeyboardShortcut(
    {
      ...SHORTCUTS.ESCAPE,
      handler: () => closeOnEscape && onClose(),
    },
    [onClose, closeOnEscape]
  );

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h2>
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close dialog"
              type="button"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Content */}
        <div id="modal-description" className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Modal Footer for actions
 */
interface ModalFooterProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function ModalFooter({ children, align = 'right' }: ModalFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${alignClasses[align]}`}>
      {children}
    </div>
  );
}

// Wrap Modal with ComponentErrorBoundary
function ModalWithErrorBoundary(props: ModalProps) {
  return (
    <ComponentErrorBoundary>
      <Modal {...props} />
    </ComponentErrorBoundary>
  );
}

// Override default export
export default ModalWithErrorBoundary;
