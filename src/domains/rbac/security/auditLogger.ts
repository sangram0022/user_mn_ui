import { rbacAnalyticsCollector } from '../analytics/performanceMonitor';

// ============================================================================
// AUDIT LOGGING TYPES
// ============================================================================

interface AuditEvent {
  id: string;
  timestamp: number;
  userId: string;
  role: string;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'blocked';
  details: Record<string, unknown>;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditQuery {
  userId?: string;
  role?: string;
  action?: string;
  result?: 'success' | 'failure' | 'blocked';
  securityLevel?: 'low' | 'medium' | 'high' | 'critical';
  startTime?: number;
  endTime?: number;
  limit?: number;
}

interface AuditSummary {
  totalEvents: number;
  successCount: number;
  failureCount: number;
  blockedCount: number;
  criticalEvents: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  securityLevelDistribution: Record<string, number>;
  timeRange: { start: number; end: number };
}

// ============================================================================
// AUDIT LOGGER CLASS
// ============================================================================

export class RbacAuditLogger {
  private events: AuditEvent[] = [];
  private readonly maxEvents: number;
  private readonly retentionHours: number;
  private eventIdCounter = 0;

  constructor(
    maxEvents: number = 50000,
    retentionHours: number = 168 // 7 days
  ) {
    this.maxEvents = maxEvents;
    this.retentionHours = retentionHours;

    // Clean up old events every hour
    setInterval(() => this.cleanup(), 3600000);
  }

  // Log RBAC audit event
  logEvent(
    userId: string,
    role: string,
    action: string,
    resource: string,
    result: 'success' | 'failure' | 'blocked',
    details: Record<string, unknown> = {},
    securityLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): string {
    const eventId = this.generateEventId();
    const event: AuditEvent = {
      id: eventId,
      timestamp: Date.now(),
      userId,
      role,
      action,
      resource,
      result,
      details,
      securityLevel,
      sessionId: details.sessionId as string,
      ipAddress: details.ipAddress as string,
      userAgent: details.userAgent as string
    };

    this.events.push(event);

    // Keep events within limits
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Also send to analytics collector for real-time monitoring
    rbacAnalyticsCollector.track({
      type: result === 'success' ? 'role_access' : 'error',
      userId,
      role,
      data: {
        action,
        resource,
        result,
        securityLevel,
        auditEventId: eventId,
        ...details
      },
      success: result === 'success'
    });

    // Log critical events to console for immediate attention
    if (securityLevel === 'critical') {
      console.warn(`🚨 CRITICAL RBAC AUDIT EVENT:`, {
        eventId,
        userId,
        role,
        action,
        resource,
        result,
        timestamp: new Date(event.timestamp).toISOString()
      });
    }

    return eventId;
  }

  // Query audit events
  query(criteria: AuditQuery = {}): AuditEvent[] {
    let filtered = this.events;

    // Apply filters
    if (criteria.userId) {
      filtered = filtered.filter(e => e.userId === criteria.userId);
    }

    if (criteria.role) {
      filtered = filtered.filter(e => e.role === criteria.role);
    }

    if (criteria.action) {
      filtered = filtered.filter(e => e.action.includes(criteria.action!));
    }

    if (criteria.result) {
      filtered = filtered.filter(e => e.result === criteria.result);
    }

    if (criteria.securityLevel) {
      filtered = filtered.filter(e => e.securityLevel === criteria.securityLevel);
    }

    if (criteria.startTime) {
      filtered = filtered.filter(e => e.timestamp >= criteria.startTime!);
    }

    if (criteria.endTime) {
      filtered = filtered.filter(e => e.timestamp <= criteria.endTime!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (criteria.limit) {
      filtered = filtered.slice(0, criteria.limit);
    }

    return filtered;
  }

  // Get audit summary
  getSummary(timeRangeHours: number = 24): AuditSummary {
    const startTime = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp >= startTime);

    const summary: AuditSummary = {
      totalEvents: recentEvents.length,
      successCount: recentEvents.filter(e => e.result === 'success').length,
      failureCount: recentEvents.filter(e => e.result === 'failure').length,
      blockedCount: recentEvents.filter(e => e.result === 'blocked').length,
      criticalEvents: recentEvents.filter(e => e.securityLevel === 'critical').length,
      uniqueUsers: [...new Set(recentEvents.map(e => e.userId))].length,
      topActions: this.getTopActions(recentEvents),
      securityLevelDistribution: this.getSecurityLevelDistribution(recentEvents),
      timeRange: {
        start: startTime,
        end: Date.now()
      }
    };

    return summary;
  }

  // Get security alerts
  getSecurityAlerts(hoursBack: number = 1): AuditEvent[] {
    const startTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    
    return this.events.filter(event => 
      event.timestamp >= startTime && 
      (event.securityLevel === 'critical' || 
       event.result === 'blocked' ||
       (event.result === 'failure' && event.securityLevel === 'high'))
    ).sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get user activity log
  getUserActivity(userId: string, hoursBack: number = 24): AuditEvent[] {
    const startTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    
    return this.events
      .filter(e => e.userId === userId && e.timestamp >= startTime)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get role usage statistics
  getRoleUsageStats(hoursBack: number = 24): Array<{
    role: string;
    eventCount: number;
    uniqueUsers: number;
    successRate: number;
    lastActivity: number;
  }> {
    const startTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp >= startTime);
    
    const roleStats = new Map<string, {
      events: AuditEvent[];
      users: Set<string>;
    }>();

    // Group events by role
    recentEvents.forEach(event => {
      if (!roleStats.has(event.role)) {
        roleStats.set(event.role, {
          events: [],
          users: new Set()
        });
      }
      
      const stats = roleStats.get(event.role)!;
      stats.events.push(event);
      stats.users.add(event.userId);
    });

    // Calculate statistics
    return Array.from(roleStats.entries()).map(([role, stats]) => {
      const successCount = stats.events.filter(e => e.result === 'success').length;
      const successRate = stats.events.length > 0 ? (successCount / stats.events.length) * 100 : 0;
      const lastActivity = Math.max(...stats.events.map(e => e.timestamp));

      return {
        role,
        eventCount: stats.events.length,
        uniqueUsers: stats.users.size,
        successRate,
        lastActivity
      };
    }).sort((a, b) => b.eventCount - a.eventCount);
  }

  // Export audit log
  exportLog(format: 'json' | 'csv' = 'json', criteria: AuditQuery = {}): string {
    const events = this.query(criteria);

    if (format === 'csv') {
      const headers = [
        'ID', 'Timestamp', 'User ID', 'Role', 'Action', 'Resource', 
        'Result', 'Security Level', 'Session ID', 'IP Address'
      ];
      
      const rows = events.map(event => [
        event.id,
        new Date(event.timestamp).toISOString(),
        event.userId,
        event.role,
        event.action,
        event.resource,
        event.result,
        event.securityLevel,
        event.sessionId || '',
        event.ipAddress || ''
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(events, null, 2);
  }

  // Clear audit log (use with caution)
  clearLog(): void {
    const eventCount = this.events.length;
    this.events = [];
    
    console.warn(`🗑️ Audit log cleared - ${eventCount} events removed`);
    
    // Log the clearing action
    this.logEvent(
      'system',
      'admin',
      'audit_log_cleared',
      'audit_system',
      'success',
      { clearedEventCount: eventCount },
      'critical'
    );
  }

  // Get current statistics
  getStats(): {
    totalEvents: number;
    oldestEvent: number | null;
    newestEvent: number | null;
    memoryUsage: number;
  } {
    return {
      totalEvents: this.events.length,
      oldestEvent: this.events.length > 0 ? this.events[0].timestamp : null,
      newestEvent: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : null,
      memoryUsage: JSON.stringify(this.events).length
    };
  }

  private generateEventId(): string {
    this.eventIdCounter++;
    return `audit_${Date.now()}_${this.eventIdCounter.toString().padStart(6, '0')}`;
  }

  private cleanup(): void {
    const cutoffTime = Date.now() - (this.retentionHours * 60 * 60 * 1000);
    const originalLength = this.events.length;
    
    this.events = this.events.filter(event => event.timestamp > cutoffTime);
    
    const removedCount = originalLength - this.events.length;
    if (removedCount > 0) {
      console.log(`🧹 Audit log cleanup: removed ${removedCount} old events`);
    }
  }

  private getTopActions(events: AuditEvent[]): Array<{ action: string; count: number }> {
    const actionCounts = new Map<string, number>();
    
    events.forEach(event => {
      const count = actionCounts.get(event.action) || 0;
      actionCounts.set(event.action, count + 1);
    });

    return Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getSecurityLevelDistribution(events: AuditEvent[]): Record<string, number> {
    const distribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    events.forEach(event => {
      distribution[event.securityLevel]++;
    });

    return distribution;
  }
}

// ============================================================================
// AUDIT CONVENIENCE FUNCTIONS
// ============================================================================

export const auditLogger = new RbacAuditLogger();

// Convenience functions for common audit events
export const auditPermissionCheck = (
  userId: string,
  role: string,
  permission: string,
  granted: boolean,
  details: Record<string, unknown> = {}
) => {
  return auditLogger.logEvent(
    userId,
    role,
    'permission_check',
    permission,
    granted ? 'success' : 'failure',
    details,
    granted ? 'low' : 'medium'
  );
};

export const auditRoleAssignment = (
  adminUserId: string,
  targetUserId: string,
  newRole: string,
  previousRole: string,
  success: boolean
) => {
  return auditLogger.logEvent(
    adminUserId,
    'admin',
    'role_assignment',
    `user:${targetUserId}`,
    success ? 'success' : 'failure',
    { targetUserId, newRole, previousRole },
    'high'
  );
};

export const auditSecurityViolation = (
  userId: string,
  role: string,
  violation: string,
  details: Record<string, unknown> = {}
) => {
  return auditLogger.logEvent(
    userId,
    role,
    'security_violation',
    'security_system',
    'blocked',
    { violation, ...details },
    'critical'
  );
};

export const auditLogin = (
  userId: string,
  success: boolean,
  details: Record<string, unknown> = {}
) => {
  return auditLogger.logEvent(
    userId,
    'user',
    'login',
    'auth_system',
    success ? 'success' : 'failure',
    details,
    success ? 'low' : 'medium'
  );
};

export const auditLogout = (
  userId: string,
  details: Record<string, unknown> = {}
) => {
  return auditLogger.logEvent(
    userId,
    'user',
    'logout',
    'auth_system',
    'success',
    details,
    'low'
  );
};

// ============================================================================
// TYPES EXPORT
// ============================================================================

export type { AuditEvent, AuditQuery, AuditSummary };