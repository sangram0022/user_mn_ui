/**
 * Session Warning Modal
 *
 * React 19: No memoization needed - React Compiler handles optimization
 */

import { Clock, LogOut, RefreshCcw } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface SessionWarningModalProps {
  isOpen: boolean;
  remainingTime: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  isOpen,
  remainingTime,
  onExtend,
  onLogout,
}) => {
  const [timeLeft, setTimeLeft] = useState(Math.floor(remainingTime / 1000));
  const extendButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen && remainingTime > 0) {
      const interval = setInterval(() => {
        const seconds = Math.floor(remainingTime / 1000);
        setTimeLeft(seconds);

        if (seconds <= 0) {
          onLogout();
        }
      }, 1000);

      return () => clearInterval(interval);
    }

    // Return undefined when conditions are not met
    return undefined;
  }, [isOpen, remainingTime, onLogout]);

  useEffect(() => {
    const handleKeyDownEffect = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onLogout();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDownEffect);
      extendButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDownEffect);
    };
  }, [isOpen, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Removed direct DOM style manipulation - using Tailwind classes instead

  if (!isOpen) return null;

  const headingId = 'session-timeout-heading';
  const descriptionId = 'session-timeout-description';

  return (
    <div
      role="presentation"
      aria-hidden="false"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="w-[90%] max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-primary)] p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-warning)]">
            <Clock className="h-8 w-8 text-[var(--color-text-primary)]" />
          </div>
          <h2 id={headingId} className="mb-2 text-2xl font-bold text-[var(--color-text-primary)]">
            Session Expiring Soon
          </h2>
          <p id={descriptionId} className="m-0 text-sm text-[var(--color-text-tertiary)]">
            Your session will expire in <strong>{formatTime(timeLeft)}</strong>
          </p>
        </div>

        {/* Content */}
        <div className="mb-6 rounded-lg border border-[var(--color-warning)] bg-[var(--color-warning)] p-4">
          <p className="m-0 text-sm text-[var(--color-warning)]">
            To continue your session, click &quot;Stay Logged In&quot; below. Otherwise, you&apos;ll
            be automatically logged out for security.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onExtend}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-[color:var(--color-primary)] px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-all duration-200 hover:bg-[color:var(--color-primary-600)] hover:shadow-lg focus:bg-[color:var(--color-primary-600)] focus:shadow-lg active:shadow-md"
          >
            <RefreshCcw className="icon-sm" />
            Continue Session
          </button>
          <button
            onClick={onLogout}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-error)] bg-[var(--color-surface-primary)] px-4 py-3 text-sm font-medium text-[var(--color-error)] transition-all duration-200 hover:bg-[var(--color-error-light)] hover:shadow-md focus:bg-[var(--color-error-light)] focus:shadow-md active:shadow-sm"
          >
            <LogOut className="icon-sm" />
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
