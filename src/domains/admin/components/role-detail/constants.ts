// ========================================
// Role Detail Constants and Types
// ========================================

export const SYSTEM_ROLES = ['admin', 'user'];

export const RESOURCES = [
  'users',
  'roles',
  'analytics',
  'audit_logs',
  'settings',
  'reports',
  'notifications',
] as const;

export const ACTIONS = ['create', 'read', 'update', 'delete', 'approve', 'export', 'configure'] as const;

export const RESOURCE_ACTIONS: Record<string, string[]> = {
  users: ['create', 'read', 'update', 'delete', 'approve'],
  roles: ['create', 'read', 'update', 'delete'],
  analytics: ['read', 'export'],
  audit_logs: ['read', 'export'],
  settings: ['read', 'update', 'configure'],
  reports: ['create', 'read', 'export'],
  notifications: ['create', 'read', 'update', 'delete'],
};

export const getRoleLevelBadge = (level: number) => {
  if (level >= 90) return { variant: 'danger' as const, text: 'Critical' };
  if (level >= 70) return { variant: 'warning' as const, text: 'High' };
  if (level >= 40) return { variant: 'info' as const, text: 'Medium' };
  return { variant: 'success' as const, text: 'Low' };
};
