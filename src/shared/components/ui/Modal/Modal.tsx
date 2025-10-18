/**
 * Modal Component
 *
 * A flexible modal dialog with:
 * - Multiple sizes
 * - Animation support
 * - Focus trap
 * - Escape key handling
 * - Theme support
 * - Accessibility built-in
 */

import { cn } from '@shared/utils';
import { X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;

  /** Callback when modal should close */
  onClose: () => void;

  /** Modal title */
  title?: string;

  /** Modal content */
  children: React.ReactNode;

  /** Footer content */
  footer?: React.ReactNode;

  /** Size */
  size?: ModalSize;

  /** Close on backdrop click */
  closeOnBackdrop?: boolean;

  /** Close on escape key */
  closeOnEscape?: boolean;

  /** Show close button */
  showCloseButton?: boolean;

  /** Custom class names */
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;

  /** Enable container query responsive behavior */
  responsive?: boolean;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  responsive = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus trap and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Save current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Focus modal
    modalRef.current?.focus();

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-modal flex items-center justify-center p-4',
        'animate-fade-in',
        overlayClassName
      )}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={handleBackdropClick}
        role="presentation"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full',
          'bg-white dark:bg-gray-800',
          'rounded-xl shadow-2xl',
          'max-h-[90vh] flex flex-col',
          'animate-scale-in',
          sizeStyles[size],
          responsive && 'container-modal modal-responsive',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  p-2 rounded-lg
                  text-gray-400 hover:text-gray-600
                  dark:text-gray-500 dark:hover:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={cn('flex-1 overflow-y-auto px-6 py-4', contentClassName)}>{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/**
 * ModalFooter Component
 *
 * Convenience component for modal footer with standard button layout
 */
export interface ModalFooterProps {
  /** Primary action button (e.g., "Save", "Confirm") */
  primaryAction?: React.ReactNode;
  /** Secondary action button (e.g., "Cancel") */
  secondaryAction?: React.ReactNode;
  /** Additional actions (rendered on the left side) */
  additionalActions?: React.ReactNode;
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
