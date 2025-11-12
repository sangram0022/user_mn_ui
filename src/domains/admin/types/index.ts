/**
 * Admin Types - Barrel Export
 * Single import point for all admin-related types
 * 
 * Usage:
 * import type { AdminUser, AdminRole, AdminStats } from '@/domains/admin/types';
 */

// Core admin types
export * from './admin.types';

// User management types
export * from './adminUser.types';

// Role management types (RBAC)
export * from './adminRole.types';

// User approval types
export * from './adminApproval.types';

// Analytics and statistics types
export * from './adminAnalytics.types';

// Audit log types
export * from './adminAudit.types';
