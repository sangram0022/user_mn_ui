import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, LogOut, RefreshCcw } from 'lucide-react';

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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onLogout();
      }
    },
    [onLogout]
  );

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
  }, [isOpen, remainingTime, onLogout]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      extendButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const applyPrimaryButtonStyles = (button: HTMLButtonElement) => {
    button.style.background = 'linear-gradient(135deg, #2563eb, #7c3aed)';
    button.style.transform = 'translateY(-1px)';
  };

  const resetPrimaryButtonStyles = (button: HTMLButtonElement) => {
    button.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
    button.style.transform = 'translateY(0)';
  };

  const applySecondaryButtonStyles = (button: HTMLButtonElement) => {
    button.style.backgroundColor = '#dc2626';
    button.style.color = 'white';
  };

  const resetSecondaryButtonStyles = (button: HTMLButtonElement) => {
    button.style.backgroundColor = 'white';
    button.style.color = '#dc2626';
  };

  if (!isOpen) return null;

  const headingId = 'session-timeout-heading';
  const descriptionId = 'session-timeout-description';

  return (
    <div
      role="presentation"
      aria-hidden="false"
      style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '28rem',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #f3f4f6',
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: '#fbbf24',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Clock style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2 id={headingId} style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem',
            margin: '0 0 0.5rem',
          }}>
            Session Expiring Soon
          </h2>
          <p id={descriptionId} style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0,
          }}>
            Your session will expire in <strong>{formatTime(timeLeft)}</strong>
          </p>
        </div>

        {/* Content */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#92400e',
            margin: 0,
          }}>
            To continue your session, click "Stay Logged In" below. Otherwise, you'll be automatically logged out for security.
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexDirection: 'column',
        }}>
          <button
            ref={extendButtonRef}
            onClick={onExtend}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              applyPrimaryButtonStyles(e.currentTarget);
            }}
            onMouseOut={(e) => {
              resetPrimaryButtonStyles(e.currentTarget);
            }}
            onFocus={(e) => {
              applyPrimaryButtonStyles(e.currentTarget);
            }}
            onBlur={(e) => {
              resetPrimaryButtonStyles(e.currentTarget);
            }}
          >
            <RefreshCcw style={{ width: '1rem', height: '1rem' }} />
            Stay Logged In
          </button>
          
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#dc2626',
              backgroundColor: 'white',
              border: '1px solid #dc2626',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              applySecondaryButtonStyles(e.currentTarget);
            }}
            onMouseOut={(e) => {
              resetSecondaryButtonStyles(e.currentTarget);
            }}
            onFocus={(e) => {
              applySecondaryButtonStyles(e.currentTarget);
            }}
            onBlur={(e) => {
              resetSecondaryButtonStyles(e.currentTarget);
            }}
          >
            <LogOut style={{ width: '1rem', height: '1rem' }} />
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
