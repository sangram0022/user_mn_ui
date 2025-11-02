/**
 * Accessibility Announcement Component
 * WCAG 2.1 AA: Live Region for screen readers
 * Announces dynamic content changes to assistive technologies
 */

import { useEffect, useRef, useState } from 'react';

interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number; // milliseconds
}

export default function Announcement({ 
  message, 
  priority = 'polite',
  clearAfter = 5000,
}: AnnouncementProps) {
  const [announcement, setAnnouncement] = useState(message);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setAnnouncement(message);

    if (clearAfter) {
      timeoutRef.current = setTimeout(() => {
        setAnnouncement('');
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
