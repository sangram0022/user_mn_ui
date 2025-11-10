/**
 * AccessibleModal Component
 * Modal dialog with focus trapping, keyboard navigation, and screen reader support
 */

import { useEffect } from 'react';
import { useFocusTrap, useLiveRegion } from '@/shared/hooks/accessibility';

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

  // Handle escape key from focus trap
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleEscape = () => {
      if (closeOnEscape) {
        onClose();
      }
    };

    const handleEscapeEvent = () => handleEscape();
    container.addEventListener('escapeFocusTrap', handleEscapeEvent);

    return () => {
      container.removeEventListener('escapeFocusTrap', handleEscapeEvent);
    };
  }, [closeOnEscape, onClose, containerRef]);

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
