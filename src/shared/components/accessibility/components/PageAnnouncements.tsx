/**
 * PageAnnouncements Component
 * Announces page navigation changes to screen readers
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLiveRegion } from '@/shared/hooks/accessibility';

export function PageAnnouncements() {
  const location = useLocation();
  const { announce } = useLiveRegion();

  // Announce page changes
  useEffect(() => {
    // Get page title or generate from pathname
    const pageTitle = document.title || location.pathname.split('/').filter(Boolean).join(' ');
    announce(`Navigated to ${pageTitle}`, 'polite');
  }, [location, announce]);

  return null; // This component only handles announcements
}
