/**
 * Security Initialization and Runtime Protection
 * Comprehensive security setup for production React application
 */

import { logger } from './../utils/logger';
import { validationUtils } from './inputValidation';
import { securityUtils } from './securityHeaders';

export interface SecurityConfig {
  enableCSP?: boolean;
  enableValidation?: boolean;
  enableA11y?: boolean;
  enableMonitoring?: boolean;
  enableRuntimeProtection?: boolean;
  development?: boolean;
}

export interface SecurityViolation {
  type: string;
  message: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  element?: string;
  value?: unknown;
}

export interface SecurityMetrics {
  violations: SecurityViolation[];
  performanceIssues: number;
  accessibilityIssues: number;
  cspViolations: number;
  xssAttempts: number;
}

/**
 * Centralized Security Management System
 * Coordinates all security features and monitoring
 */
export class SecurityManager {
  private config: SecurityConfig;
  private metrics: SecurityMetrics;
  private initialized = false;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      enableCSP: true,
      enableValidation: true,
      enableA11y: true,
      enableMonitoring: true,
      enableRuntimeProtection: true,
      development: process.env.NODE_ENV === 'development',
      ...config,
    };

    this.metrics = {
      violations: [],
      performanceIssues: 0,
      accessibilityIssues: 0,
      cspViolations: 0,
      xssAttempts: 0,
    };
  }

  /**
   * Initialize all security systems
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('SecurityManager already initialized');
      return;
    }

    try {
      logger.info('🔒 Initializing Security Manager...');

      // Initialize CSP
      if (this.config.enableCSP) {
        await this.initializeCSP();
      }

      // Initialize input validation
      if (this.config.enableValidation) {
        this.initializeValidation();
      }

      // Initialize accessibility features
      if (this.config.enableA11y) {
        this.initializeAccessibility();
      }

      // Initialize monitoring
      if (this.config.enableMonitoring) {
        this.initializeMonitoring();
      }

      // Initialize runtime protection
      if (this.config.enableRuntimeProtection) {
        this.initializeRuntimeProtection();
      }

      this.initialized = true;
      logger.info('✅ Security Manager initialized successfully');
    } catch (error) {
      logger.error('❌ Security Manager initialization failed:', undefined, { error });
      throw error;
    }
  }

  /**
   * Initialize Content Security Policy
   */
  private async initializeCSP(): Promise<void> {
    try {
      // Apply CSP headers if in development mode with server
      if (this.config.development && typeof window !== 'undefined') {
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        const devCSP = securityUtils.csp.getDevelopmentCSP();
        cspMeta.content = securityUtils.csp.directivesToString(devCSP);
        document.head.appendChild(cspMeta);
      }

      // Setup CSP violation reporting
      document.addEventListener('securitypolicyviolation', (event) => {
        this.logViolation('csp_violation', {
          directive: event.violatedDirective,
          blockedURI: event.blockedURI,
          sourceFile: event.sourceFile,
          lineNumber: event.lineNumber,
        });
        this.metrics.cspViolations++;
      });

      logger.info('🛡️ CSP initialized');
    } catch (error) {
      logger.error('CSP initialization failed:', undefined, { error });
    }
  }

  /**
   * Initialize input validation and sanitization
   */
  private initializeValidation(): void {
    try {
      // Verify sanitizer is available
      void validationUtils.sanitizer;

      // Setup global validation error handler
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.name === 'ZodError') {
          logger.warn('Validation error caught', { reason: event.reason });
          this.logViolation('validation_error', {
            error: event.reason.message,
            issues: event.reason.issues,
          });
        }
      });

      logger.info('✅ Input validation initialized');
    } catch (error) {
      logger.error('Validation initialization failed:', undefined, { error });
    }
  }

  /**
   * Initialize accessibility features
   */
  private initializeAccessibility(): void {
    try {
      // Enable keyboard navigation - no direct enable method, so skip
      // a11yUtils provides components and hooks for manual implementation

      // Setup accessibility monitoring
      if ('IntersectionObserver' in window) {
        this.monitorAccessibilityIssues();
      }

      logger.info('♿ Accessibility features initialized');
    } catch (error) {
      logger.error('Accessibility initialization failed:', undefined, { error });
    }
  }

  /**
   * Initialize security monitoring
   */
  private initializeMonitoring(): void {
    try {
      // Monitor console errors
      const originalError = console.error;
      console.error = (...args) => {
        this.logViolation('console_error', {
          message: args.join(' '),
          stack: new Error().stack,
        });
        originalError.apply(console, args);
      };

      // Monitor network requests for suspicious activity
      this.monitorNetworkRequests();

      // Monitor DOM mutations for XSS attempts
      this.monitorDOMMutations();

      logger.info('📊 Security monitoring initialized');
    } catch (error) {
      logger.error('Monitoring initialization failed:', undefined, { error });
    }
  }

  /**
   * Initialize runtime protection
   */
  private initializeRuntimeProtection(): void {
    try {
      // Protect against prototype pollution
      this.protectPrototypes();

      // Monitor and protect localStorage/sessionStorage
      this.protectWebStorage();

      // Setup performance monitoring for security issues
      this.monitorPerformanceThreats();

      logger.info('🔐 Runtime protection initialized');
    } catch (error) {
      logger.error('Runtime protection initialization failed:', undefined, { error });
    }
  }

  /**
   * Monitor accessibility issues
   */
  private monitorAccessibilityIssues(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Check for missing alt text on images
              if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
                this.logViolation('a11y_missing_alt', {
                  element: element.outerHTML.substring(0, 100),
                });
                this.metrics.accessibilityIssues++;
              }

              // Check for missing labels on form inputs
              if (
                element.tagName === 'INPUT' &&
                !element.getAttribute('aria-label') &&
                !element.getAttribute('aria-labelledby')
              ) {
                const id = element.getAttribute('id');
                if (!id || !document.querySelector(`label[for="${id}"]`)) {
                  this.logViolation('a11y_missing_label', {
                    element: element.outerHTML.substring(0, 100),
                  });
                  this.metrics.accessibilityIssues++;
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Monitor network requests
   */
  private monitorNetworkRequests(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url] = args;
      const urlString = typeof url === 'string' ? url : url.toString();

      // Check for suspicious URLs
      if (this.isSuspiciousURL(urlString)) {
        this.logViolation('suspicious_request', {
          url: urlString,
          userAgent: navigator.userAgent,
        });
      }

      return originalFetch.apply(window, args);
    };
  }

  /**
   * Monitor DOM mutations for XSS attempts
   */
  private monitorDOMMutations(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Check for script injections
              if (element.tagName === 'SCRIPT' || element.innerHTML.includes('<script')) {
                this.logViolation('xss_attempt', {
                  element: element.outerHTML.substring(0, 200),
                  content: element.innerHTML.substring(0, 100),
                });
                this.metrics.xssAttempts++;
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror'],
    });
  }

  /**
   * Protect against prototype pollution
   */
  private protectPrototypes(): void {
    const protectProto = (obj: unknown, name: string) => {
      if (obj && typeof obj === 'object') {
        Object.defineProperty(obj, '__proto__', {
          get() {
            return Object.getPrototypeOf(this);
          },
          set() {
            logger.warn(`Attempted prototype pollution on ${name}`);
            return false;
          },
        });
      }
    };

    protectProto(Object.prototype, 'Object');
    protectProto(Array.prototype, 'Array');
    protectProto(Function.prototype, 'Function');
  }

  /**
   * Protect web storage
   */
  private protectWebStorage(): void {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key: string, value: string) {
      // Validate and sanitize storage values
      const sanitizedValue = validationUtils.sanitizer.sanitizeHtml(value);
      if (sanitizedValue !== value) {
        logger.warn('Potentially malicious content blocked from localStorage');
        return;
      }
      return originalSetItem.call(this, key, sanitizedValue);
    };
  }

  /**
   * Monitor performance threats
   */
  private monitorPerformanceThreats(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        if (lastEntry && 'startTime' in lastEntry) {
          if (lastEntry.startTime > 2500) {
            // Threshold for poor LCP
            this.logViolation('performance_lcp_poor', {
              value: lastEntry.startTime,
              url: window.location.href,
            });
            this.metrics.performanceIssues++;
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const eventEntry = entry as PerformanceEntry & { processingStart?: number };
          if (
            'processingStart' in entry &&
            eventEntry.processingStart &&
            eventEntry.processingStart - entry.startTime > 100
          ) {
            this.logViolation('performance_fid_poor', {
              value: eventEntry.processingStart - entry.startTime,
              url: window.location.href,
            });
            this.metrics.performanceIssues++;
          }
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  /**
   * Check if URL is suspicious
   */
  private isSuspiciousURL(url: string): boolean {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /eval\(/i,
      /document\.write/i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(url));
  }

  /**
   * Log security violation
   */
  private logViolation(type: string, details: Record<string, unknown>): void {
    const violation: SecurityViolation = {
      type,
      message: JSON.stringify(details),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details,
    };

    this.metrics.violations.push(violation);

    // Log to console in development
    if (this.config.development) {
      logger.warn(`🚨 Security violation: ${type}`, { violation: JSON.stringify(violation) });
    }

    // Send to monitoring service in production
    if (!this.config.development) {
      this.reportViolation(violation);
    }
  }

  /**
   * Report violation to monitoring service
   */
  private async reportViolation(violation: SecurityViolation): Promise<void> {
    try {
      // In a real application, this would send to your monitoring service
      await fetch('/api/security/violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(violation),
      });
    } catch (error) {
      logger.error('Failed to report security violation:', undefined, { error });
    }
  }

  /**
   * Get security metrics
   */
  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  /**
   * Get configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Destroy security manager
   */
  destroy(): void {
    this.initialized = false;
    this.metrics.violations = [];
    logger.info('🔒 Security Manager destroyed');
  }
}

// Global security manager instance
export const securityManager = new SecurityManager();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  securityManager.initialize().catch(console.error);
}
