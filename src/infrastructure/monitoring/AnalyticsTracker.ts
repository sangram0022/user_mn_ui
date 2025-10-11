/**
 * Analytics tracker for user behavior and application usage
 */

import { logger } from './logger';

export interface AnalyticsEvent {
  id: string;
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
}

export interface PageViewEvent {
  page: string;
  title: string;
  referrer?: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  events: number;
  referrer?: string;
  userAgent: string;
}

class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private events: AnalyticsEvent[] = [];
  private pageViews: PageViewEvent[] = [];
  private currentSession: UserSession | null = null;
  private maxEvents = 1000;
  private batchTimeout: NodeJS.Timeout | null = null;
  private isInitialized = false;

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.startSession();
    this.setupPageViewTracking();
    this.setupUserInteractionTracking();
    this.isInitialized = true;
    logger.info('AnalyticsTracker initialized');
  }

  private startSession(): void {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: new Date(),
      pageViews: 0,
      events: 0,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };

    // Store session in sessionStorage
    try {
      sessionStorage.setItem(
        'analytics_session',
        JSON.stringify({
          ...this.currentSession,
          startTime: this.currentSession.startTime.toISOString(),
        })
      );
    } catch {
      logger.warn('Failed to store analytics session');
    }

    // Track session start
    this.track('session', 'user_behavior', 'session_start', undefined, undefined, {
      referrer: this.currentSession.referrer,
      userAgent: this.currentSession.userAgent,
    });
  }

  private setupPageViewTracking(): void {
    // Track initial page view
    this.trackPageView(window.location.pathname, document.title);

    // Track navigation changes (for SPAs)
    let currentPath = window.location.pathname;

    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView(currentPath, document.title);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also listen for popstate events
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname, document.title);
    });
  }

  private setupUserInteractionTracking(): void {
    // Track click events
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        this.track(
          'click',
          'user_interaction',
          'button_click',
          target.textContent || 'unknown',
          undefined,
          {
            element: target.tagName,
            className: target.className,
            id: target.id,
          }
        );
      }

      // Track link clicks
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        this.track('click', 'user_interaction', 'link_click', href || 'unknown', undefined, {
          href,
          text: target.textContent,
          external: href?.startsWith('http') && !href.includes(window.location.hostname),
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.track('form', 'user_interaction', 'form_submit', form.id || form.className, undefined, {
        action: form.action,
        method: form.method,
        fieldCount: form.elements.length,
      });
    });

    // Track input focus (for form analytics)
    document.addEventListener(
      'focus',
      (event) => {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT'
        ) {
          this.track(
            'focus',
            'user_interaction',
            'field_focus',
            target.getAttribute('name') || target.id,
            undefined,
            {
              type: target.getAttribute('type'),
              tagName: target.tagName,
            }
          );
        }
      },
      true
    );
  }

  // Public API methods

  track(
    name: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, unknown>
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      name,
      category,
      action,
      label,
      value,
      timestamp: new Date(),
      userId: this.getCurrentUserId(),
      sessionId: this.currentSession?.id,
      properties,
    };

    this.events.unshift(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Update session
    if (this.currentSession) {
      this.currentSession.events++;
    }

    // Log event
    logger.debug(`Analytics event: ${category}.${action}`, {
      name,
      label,
      value,
      properties,
    });

    // Send to external analytics
    this.sendToExternalAnalytics(event);

    // Schedule batch send
    this.scheduleBatchSend();
  }

  trackPageView(page: string, title: string): void {
    const pageView: PageViewEvent = {
      page,
      title,
      referrer: document.referrer,
      timestamp: new Date(),
      userId: this.getCurrentUserId(),
      sessionId: this.currentSession?.id,
    };

    this.pageViews.unshift(pageView);

    // Keep only recent page views
    if (this.pageViews.length > 100) {
      this.pageViews = this.pageViews.slice(0, 100);
    }

    // Update session
    if (this.currentSession) {
      this.currentSession.pageViews++;
    }

    // Log page view
    logger.info(`Page view: ${page} (${title})`);

    // Send to external analytics
    this.sendPageViewToExternalAnalytics(pageView);

    // Track as event
    this.track('pageview', 'navigation', 'page_view', page, undefined, {
      title,
      referrer: pageView.referrer,
    });
  }

  trackUserAction(
    action: string,
    category: string = 'user_action',
    properties?: Record<string, unknown>
  ): void {
    this.track(action, category, action, undefined, undefined, properties);
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    this.track('error', 'application', 'error_occurred', error.message, undefined, {
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }

  trackTiming(name: string, duration: number, category: string = 'performance'): void {
    this.track(name, category, 'timing', undefined, duration, {
      duration,
      unit: 'ms',
    });
  }

  trackCustomEvent(name: string, properties?: Record<string, unknown>): void {
    this.track(name, 'custom', name, undefined, undefined, properties);
  }

  private sendToExternalAnalytics(event: AnalyticsEvent): void {
    try {
      // Send to Google Analytics if available
      const globalWindow = window as Window & { gtag?: (...args: unknown[]) => void };
      if (globalWindow.gtag) {
        globalWindow.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          custom_map: event.properties,
        });
      }

      // Send to other analytics services
      this.sendToCustomAnalytics(event);
    } catch {
      logger.warn('Failed to send event to external analytics');
    }
  }

  private sendPageViewToExternalAnalytics(pageView: PageViewEvent): void {
    try {
      const globalWindow = window as Window & { gtag?: (...args: unknown[]) => void };
      if (globalWindow.gtag) {
        globalWindow.gtag('config', 'GA_MEASUREMENT_ID', {
          page_title: pageView.title,
          page_location: window.location.href,
        });
      }
    } catch {
      logger.warn('Failed to send page view to external analytics');
    }
  }

  private sendToCustomAnalytics(event: AnalyticsEvent): void {
    try {
      // Store for batch sending
      const analyticsData = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      analyticsData.push({
        ...event,
        timestamp: event.timestamp.toISOString(),
      });

      // Keep only last 500 events
      if (analyticsData.length > 500) {
        analyticsData.splice(0, analyticsData.length - 500);
      }

      localStorage.setItem('analytics_events', JSON.stringify(analyticsData));
    } catch {
      logger.warn('Failed to store analytics event');
    }
  }

  private scheduleBatchSend(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.sendBatchToServer();
    }, 5000); // Send batch every 5 seconds
  }

  private async sendBatchToServer(): Promise<void> {
    try {
      const analyticsData = localStorage.getItem('analytics_events');
      if (!analyticsData) return;

      const events = JSON.parse(analyticsData);
      if (events.length === 0) return;

      // Send to server
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          session: this.currentSession,
        }),
      });

      // Clear sent events
      localStorage.removeItem('analytics_events');
    } catch {
      logger.warn('Failed to send analytics batch to server');
    }
  }

  // Utility methods

  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.currentSession.duration =
        this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();

      this.track(
        'session',
        'user_behavior',
        'session_end',
        undefined,
        this.currentSession.duration,
        {
          pageViews: this.currentSession.pageViews,
          events: this.currentSession.events,
        }
      );

      this.currentSession = null;
      sessionStorage.removeItem('analytics_session');
    }
  }

  getEvents(filter?: {
    category?: string;
    action?: string;
    since?: Date;
    limit?: number;
  }): AnalyticsEvent[] {
    let filteredEvents = [...this.events];

    if (filter) {
      if (filter.category) {
        filteredEvents = filteredEvents.filter((event) => event.category === filter.category);
      }

      if (filter.action) {
        filteredEvents = filteredEvents.filter((event) => event.action === filter.action);
      }

      if (filter.since) {
        filteredEvents = filteredEvents.filter((event) => event.timestamp >= filter.since!);
      }

      if (filter.limit) {
        filteredEvents = filteredEvents.slice(0, filter.limit);
      }
    }

    return filteredEvents;
  }

  getPageViews(): PageViewEvent[] {
    return [...this.pageViews];
  }

  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  clearData(): void {
    this.events = [];
    this.pageViews = [];
    localStorage.removeItem('analytics_events');
    logger.info('Analytics data cleared');
  }

  private getCurrentUserId(): string | undefined {
    try {
      const authData = localStorage.getItem('auth_user');
      if (authData) {
        const user = JSON.parse(authData);
        return user.id || user.user_id;
      }
    } catch {
      // Silent fail
    }
    return undefined;
  }

  private generateEventId(): string {
    return 'event_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}

// Create singleton instance
export const analyticsTracker = AnalyticsTracker.getInstance();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  analyticsTracker.initialize();

  // End session on page unload
  window.addEventListener('beforeunload', () => {
    analyticsTracker.endSession();
  });
}

export default analyticsTracker;
