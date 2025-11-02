import { rbacAnalyticsCollector } from '../analytics/performanceMonitor';

// ============================================================================
// SECURITY MIDDLEWARE TYPES
// ============================================================================

interface SecurityConfig {
  rateLimiting: {
    maxRequests: number;
    windowMs: number;
    blockDuration: number;
  };
  validation: {
    enabled: boolean;
    serverSideValidation: boolean;
    csrfProtection: boolean;
  };
  audit: {
    enabled: boolean;
    logLevel: 'basic' | 'detailed' | 'verbose';
    retentionHours: number;
  };
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockUntil?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  securityFlags: string[];
}

// ============================================================================
// RATE LIMITING SYSTEM
// ============================================================================

class RoleBasedRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly config: SecurityConfig['rateLimiting'];

  constructor(config: SecurityConfig['rateLimiting']) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  // Check if request is allowed for user/role combination
  checkLimit(userId: string, role: string, operation: string): {
    allowed: boolean;
    remainingRequests: number;
    resetTime: number;
    reason?: string;
  } {
    const key = `${userId}:${role}:${operation}`;
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = this.limits.get(key);
    if (!entry) {
      entry = {
        count: 0,
        windowStart: now,
        blocked: false
      };
      this.limits.set(key, entry);
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.blockUntil,
        reason: 'Rate limit exceeded - blocked'
      };
    }

    // Reset window if expired
    if (now - entry.windowStart > this.config.windowMs) {
      entry.count = 0;
      entry.windowStart = now;
      entry.blocked = false;
      entry.blockUntil = undefined;
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + this.config.blockDuration;
      
      // Log security event
      rbacAnalyticsCollector.track({
        type: 'error',
        userId,
        role,
        data: { 
          error: 'rate_limit_exceeded',
          operation,
          count: entry.count,
          limit: this.config.maxRequests
        },
        success: false
      });

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.blockUntil,
        reason: 'Rate limit exceeded'
      };
    }

    // Allow request and increment counter
    entry.count++;
    
    return {
      allowed: true,
      remainingRequests: this.config.maxRequests - entry.count,
      resetTime: entry.windowStart + this.config.windowMs
    };
  }

  // Reset rate limit for user
  resetLimit(userId: string, role?: string, operation?: string): void {
    if (role && operation) {
      const key = `${userId}:${role}:${operation}`;
      this.limits.delete(key);
    } else {
      // Reset all limits for user
      const userPrefix = `${userId}:`;
      for (const key of this.limits.keys()) {
        if (key.startsWith(userPrefix)) {
          this.limits.delete(key);
        }
      }
    }
  }

  // Get current stats
  getStats(): {
    totalEntries: number;
    blockedUsers: number;
    activeWindows: number;
  } {
    let blocked = 0;
    let active = 0;
    const now = Date.now();

    for (const entry of this.limits.values()) {
      if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
        blocked++;
      }
      if (now - entry.windowStart < this.config.windowMs) {
        active++;
      }
    }

    return {
      totalEntries: this.limits.size,
      blockedUsers: blocked,
      activeWindows: active
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.limits.entries()) {
      // Remove entries that are old and not blocked
      if (!entry.blocked && now - entry.windowStart > this.config.windowMs * 2) {
        expiredKeys.push(key);
      }
      // Remove expired blocks
      if (entry.blocked && entry.blockUntil && now > entry.blockUntil) {
        entry.blocked = false;
        entry.blockUntil = undefined;
      }
    }

    expiredKeys.forEach(key => this.limits.delete(key));
  }
}

// ============================================================================
// PERMISSION VALIDATION MIDDLEWARE
// ============================================================================

class PermissionValidator {
  private readonly config: SecurityConfig['validation'];

  constructor(config: SecurityConfig['validation']) {
    this.config = config;
  }

  // Validate permission request
  async validatePermission(
    userId: string,
    role: string,
    permission: string,
    context?: Record<string, unknown>
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const securityFlags: string[] = [];

    // Basic validation
    if (!userId || typeof userId !== 'string') {
      errors.push('Invalid user ID');
    }

    if (!role || typeof role !== 'string') {
      errors.push('Invalid role');
    }

    if (!permission || typeof permission !== 'string') {
      errors.push('Invalid permission');
    }

    // Security checks
    if (this.containsSuspiciousPatterns(permission)) {
      securityFlags.push('suspicious_permission_pattern');
      errors.push('Permission contains suspicious patterns');
    }

    if (context && this.containsSuspiciousContext(context)) {
      securityFlags.push('suspicious_context');
      errors.push('Context contains suspicious data');
    }

    // Role elevation check
    if (this.isPrivilegeEscalation(role, permission)) {
      securityFlags.push('privilege_escalation_attempt');
      errors.push('Potential privilege escalation detected');
    }

    // Server-side validation (if enabled)
    if (this.config.serverSideValidation) {
      try {
        const serverValidation = await this.validateWithServer(userId, role, permission);
        if (!serverValidation.isValid) {
          errors.push(...serverValidation.errors);
          securityFlags.push('server_validation_failed');
        }
      } catch {
        securityFlags.push('server_validation_error');
        errors.push('Server validation failed');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      securityFlags
    };
  }

  private containsSuspiciousPatterns(permission: string): boolean {
    const suspiciousPatterns = [
      /\.\.\//,  // Path traversal
      /<script/i, // XSS attempt
      /union\s+select/i, // SQL injection
      /javascript:/i, // JavaScript protocol
      /eval\(/i, // Code evaluation
      /system\(/i, // System calls
    ];

    return suspiciousPatterns.some(pattern => pattern.test(permission));
  }

  private containsSuspiciousContext(context: Record<string, unknown>): boolean {
    const contextStr = JSON.stringify(context);
    
    // Check for common attack patterns in context
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i, // Event handlers
      /union\s+select/i,
      /\.\.\//
    ];

    return suspiciousPatterns.some(pattern => pattern.test(contextStr));
  }

  private isPrivilegeEscalation(role: string, permission: string): boolean {
    // Define critical permissions that require higher roles
    const criticalPermissions = [
      'admin:delete_user',
      'admin:modify_roles',
      'system:access_logs',
      'security:modify_permissions'
    ];

    const lowPrivilegeRoles = ['user', 'guest', 'public'];

    return criticalPermissions.includes(permission) && 
           lowPrivilegeRoles.includes(role.toLowerCase());
  }

  private async validateWithServer(
    userId: string, 
    role: string, 
    permission: string
  ): Promise<ValidationResult> {
    // Mock server validation - in real implementation, make API call
    // For now, validate based on basic rules
    const isValid = userId.length > 0 && role.length > 0 && permission.length > 0;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isValid,
          errors: isValid ? [] : ['Server validation failed'],
          securityFlags: []
        });
      }, 10);
    });
  }
}

// ============================================================================
// SECURITY MIDDLEWARE CLASS
// ============================================================================

export class RbacSecurityMiddleware {
  private rateLimiter: RoleBasedRateLimiter;
  private validator: PermissionValidator;
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      rateLimiting: {
        maxRequests: 100,
        windowMs: 60000, // 1 minute
        blockDuration: 300000, // 5 minutes
        ...config.rateLimiting
      },
      validation: {
        enabled: true,
        serverSideValidation: false,
        csrfProtection: true,
        ...config.validation
      },
      audit: {
        enabled: true,
        logLevel: 'detailed',
        retentionHours: 24,
        ...config.audit
      }
    };

    this.rateLimiter = new RoleBasedRateLimiter(this.config.rateLimiting);
    this.validator = new PermissionValidator(this.config.validation);
  }

  // Main middleware function
  async checkPermission(
    userId: string,
    role: string,
    permission: string,
    context?: Record<string, unknown>
  ): Promise<{
    allowed: boolean;
    reason?: string;
    securityFlags?: string[];
    rateLimitInfo?: {
      remainingRequests: number;
      resetTime: number;
    };
  }> {
    try {
      // 1. Rate limiting check
      const rateLimitResult = this.rateLimiter.checkLimit(userId, role, permission);
      
      if (!rateLimitResult.allowed) {
        return {
          allowed: false,
          reason: rateLimitResult.reason,
          rateLimitInfo: {
            remainingRequests: rateLimitResult.remainingRequests,
            resetTime: rateLimitResult.resetTime
          }
        };
      }

      // 2. Permission validation
      if (this.config.validation.enabled) {
        const validationResult = await this.validator.validatePermission(
          userId, 
          role, 
          permission, 
          context
        );

        if (!validationResult.isValid) {
          // Log security violation
          rbacAnalyticsCollector.track({
            type: 'error',
            userId,
            role,
            data: {
              error: 'validation_failed',
              permission,
              errors: validationResult.errors,
              securityFlags: validationResult.securityFlags
            },
            success: false
          });

          return {
            allowed: false,
            reason: 'Permission validation failed',
            securityFlags: validationResult.securityFlags
          };
        }
      }

      // 3. Success - permission granted
      rbacAnalyticsCollector.track({
        type: 'permission_check',
        userId,
        role,
        data: { 
          permission, 
          context: context || {},
          securityChecks: ['rate_limit', 'validation']
        },
        success: true
      });

      return {
        allowed: true,
        rateLimitInfo: {
          remainingRequests: rateLimitResult.remainingRequests,
          resetTime: rateLimitResult.resetTime
        }
      };

    } catch (error) {
      // Log error
      rbacAnalyticsCollector.track({
        type: 'error',
        userId,
        role,
        data: {
          error: 'security_middleware_error',
          permission,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        },
        success: false
      });

      return {
        allowed: false,
        reason: 'Security middleware error'
      };
    }
  }

  // Get security statistics
  getSecurityStats() {
    return {
      rateLimiting: this.rateLimiter.getStats(),
      config: this.config,
      timestamp: new Date().toISOString()
    };
  }

  // Reset rate limits for user
  resetUserLimits(userId: string, role?: string, operation?: string) {
    this.rateLimiter.resetLimit(userId, role, operation);
  }

  // Update configuration
  updateConfig(newConfig: Partial<SecurityConfig>) {
    this.config = {
      ...this.config,
      ...newConfig,
      rateLimiting: { ...this.config.rateLimiting, ...newConfig.rateLimiting },
      validation: { ...this.config.validation, ...newConfig.validation },
      audit: { ...this.config.audit, ...newConfig.audit }
    };
  }
}

// ============================================================================
// DEFAULT INSTANCE
// ============================================================================

export const rbacSecurityMiddleware = new RbacSecurityMiddleware({
  rateLimiting: {
    maxRequests: 60,    // 60 requests per minute per user/role/operation
    windowMs: 60000,    // 1 minute window
    blockDuration: 300000 // 5 minute block
  },
  validation: {
    enabled: true,
    serverSideValidation: false, // Enable for production
    csrfProtection: true
  },
  audit: {
    enabled: true,
    logLevel: 'detailed',
    retentionHours: 48
  }
});

// ============================================================================
// SECURITY TYPES EXPORT
// ============================================================================

export type { SecurityConfig, ValidationResult };