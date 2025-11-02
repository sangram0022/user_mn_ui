/**
 * Hook to manage accessibility announcements
 * Separated from component to satisfy Fast Refresh requirements
 */

import { useState } from 'react';

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = (message: string, announcePriority: 'polite' | 'assertive' = 'polite') => {
    setPriority(announcePriority);
    setAnnouncement(message);
  };

  return { announcement, priority, announce };
}
