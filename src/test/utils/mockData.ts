import type {
  AdminUser,
  ListUsersResponse,
  UserDetailedStats,
  CreateUserRequest,
  UpdateUserRequest,
  AdminRole,
  ListRolesResponse,
  AdminStats,
  GrowthAnalytics,
  AuditLog,
} from '../../domains/admin/types';

/**
 * Mock Admin User Data
 */
export const mockAdminUser: AdminUser = {
  user_id: 'user-1',
  email: 'john.doe@example.com',
  username: 'johndoe',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '+1234567890',
  roles: ['admin'],
  is_active: true,
  is_verified: true,
  is_approved: true,
  created_at: '2024-01-01T00:00:00Z',
  last_login_at: '2024-01-15T10:30:00Z',
};

export const mockPendingUser: AdminUser = {
  user_id: 'user-2',
  email: 'jane.smith@example.com',
  username: 'janesmith',
  first_name: 'Jane',
  last_name: 'Smith',
  roles: ['user'],
  is_active: true,
  is_verified: true,
  is_approved: false,
  created_at: '2024-01-10T00:00:00Z',
};

export const mockSuspendedUser: AdminUser = {
  user_id: 'user-3',
  email: 'bob.wilson@example.com',
  username: 'bobwilson',
  first_name: 'Bob',
  last_name: 'Wilson',
  roles: ['user'],
  is_active: false,
  is_verified: true,
  is_approved: true,
  created_at: '2024-01-05T00:00:00Z',
  last_login_at: '2024-01-14T08:00:00Z',
};

export const mockAdminUsers: AdminUser[] = [
  mockAdminUser,
  mockPendingUser,
  mockSuspendedUser,
];

export const mockAdminUserListResponse: ListUsersResponse = {
  users: mockAdminUsers,
  pagination: {
    page: 1,
    page_size: 20,
    total_items: 3,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
  filters_applied: {},
};

export const mockAdminUserDetail: UserDetailedStats = {
  ...mockAdminUser,
  bio: 'Software developer with 5 years of experience',
  login_stats: {
    login_count: 50,
    last_login_at: '2024-01-15T10:30:00Z',
    last_login_ip: '192.168.1.1',
    last_login_user_agent: 'Mozilla/5.0',
    failed_login_attempts: 0,
    account_locked: false,
  },
  session_count: 120,
  total_session_duration: '75 hours',
  average_session_duration: '37 minutes',
  permissions: ['users:read', 'users:create', 'users:update', 'users:delete', 'roles:read'],
  metadata: {
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
  },
};

export const mockUserCreateRequest: CreateUserRequest = {
  email: 'new.user@example.com',
  username: 'newuser',
  first_name: 'New',
  last_name: 'User',
  password: 'SecurePass123!',
  phone_number: '+1234567890',
  roles: ['user'],
  account_type: 'regular',
};

export const mockUserUpdateRequest: UpdateUserRequest = {
  first_name: 'Updated',
  last_name: 'Name',
  phone_number: '+1234567891',
  bio: 'Updated bio',
  is_active: true,
};

/**
 * Mock Admin Role Data
 */
export const mockAdminRole: AdminRole = {
  role_id: 'role-1',
  role_name: 'admin',
  display_name: 'Administrator',
  description: 'Full system access',
  level: 100,
  status: 'active',
  permissions: [],
  users_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockModeratorRole: AdminRole = {
  role_id: 'role-2',
  role_name: 'moderator',
  display_name: 'Moderator',
  description: 'Content moderation access',
  level: 50,
  status: 'active',
  permissions: [],
  users_count: 10,
  created_at: '2024-01-05T00:00:00Z',
  updated_at: '2024-01-10T00:00:00Z',
};

export const mockUserRole: AdminRole = {
  role_id: 'role-3',
  role_name: 'user',
  display_name: 'User',
  description: 'Standard user access',
  level: 1,
  status: 'active',
  permissions: [],
  users_count: 100,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockAdminRoles: AdminRole[] = [
  mockAdminRole,
  mockModeratorRole,
  mockUserRole,
];

export const mockListRolesResponse: ListRolesResponse = {
  roles: mockAdminRoles,
  total: 3,
  metadata: {
    hierarchy: ['admin', 'moderator', 'user'],
    system_roles: ['admin', 'user'],
    custom_roles: ['moderator'],
  },
};

/**
 * Mock Admin Analytics Data
 */
export const mockAdminStats: AdminStats = {
  period: '30d',
  generated_at: '2024-01-15T10:00:00Z',
  overview: {
    total_users: 150,
    active_users: 120,
    inactive_users: 30,
    new_users_this_period: 15,
    growth_rate: '12.5%',
  },
  users: {
    total: 150,
    by_status: {
      active: 120,
      inactive: 30,
      pending_approval: 8,
      suspended: 5,
      deleted: 0,
    },
    by_verification: {
      email_verified: 130,
      email_not_verified: 20,
      phone_verified: 100,
      phone_not_verified: 50,
    },
    by_account_type: {
      regular: 140,
      premium: 8,
      trial: 2,
    },
  },
  registrations: {
    total_this_period: 15,
    approved: 12,
    rejected: 1,
    pending: 2,
    daily_average: 0.5,
    trend: 'increasing' as const,
    chart_data: [],
  },
  activity: {
    daily_active_users: 80,
    weekly_active_users: 110,
    monthly_active_users: 120,
    average_session_duration: '25 minutes',
    total_sessions: 45,
    bounce_rate: '15%',
    engagement_score: 85,
  },
  roles: {
    distribution: {
      user: 100,
      moderator: 30,
      admin: 20,
    },
    percentage: {
      user: '66.7%',
      moderator: '20.0%',
      admin: '13.3%',
    },
  },
  geography: {
    total_countries: 10,
    top_countries: [],
  },
  devices: {
    platforms: { desktop: 70, mobile: 60, tablet: 20 },
    browsers: {},
    operating_systems: {},
  },
  performance: {
    avg_api_response_time: '150ms',
    error_rate: '0.5%',
    uptime: '99.9%',
  },
};

export const mockGrowthAnalytics: GrowthAnalytics = {
  period: '30d',
  granularity: 'daily',
  summary: {
    total_users_start: 100,
    total_users_end: 150,
    net_growth: 50,
    growth_rate: '50%',
    avg_daily_growth: 1.9,
    peak_growth_date: '2024-01-07',
    peak_growth_value: 12,
  },
  time_series: [
    { date: '2024-01-01', total_users: 100, new_users: 5, churned_users: 0, net_growth: 5, growth_rate: '5%' },
    { date: '2024-01-02', total_users: 108, new_users: 8, churned_users: 0, net_growth: 8, growth_rate: '8%' },
    { date: '2024-01-03', total_users: 114, new_users: 6, churned_users: 0, net_growth: 6, growth_rate: '5.3%' },
    { date: '2024-01-04', total_users: 124, new_users: 10, churned_users: 0, net_growth: 10, growth_rate: '8.8%' },
    { date: '2024-01-05', total_users: 131, new_users: 7, churned_users: 0, net_growth: 7, growth_rate: '5.6%' },
    { date: '2024-01-06', total_users: 140, new_users: 9, churned_users: 0, net_growth: 9, growth_rate: '6.9%' },
    { date: '2024-01-07', total_users: 150, new_users: 12, churned_users: 2, net_growth: 10, growth_rate: '7.1%' },
  ],
  trends: {
    overall_trend: 'increasing' as const,
    momentum: 'positive' as const,
    volatility: 'low' as const,
    seasonal_pattern: 'none',
  },
  predictions: {
    next_7_days: { 
      expected_new_users: 10,
      expected_total: 160, 
      confidence: '90%',
    },
    next_30_days: { 
      expected_new_users: 20,
      expected_total: 170, 
      confidence: '85%',
    },
  },
  milestones: [
    { milestone: '100 users', achieved_on: '2024-01-01' },
    { milestone: '150 users', achieved_on: '2024-01-07' },
    { milestone: '200 users', estimated_date: '2024-02-15', days_remaining: 39 },
  ],
};

/**
 * Mock Audit Log Data
 */
export const mockAuditLog: AuditLog = {
  audit_id: 'audit-2024-01-15T10:30:00.000Z',
  user_id: 'user-1',
  action: 'USER_UPDATED',
  resource_type: 'user',
  resource_id: 'user-2',
  severity: 'low',
  timestamp: '2024-01-15T10:30:00Z',
  metadata: {
    changes: {
      status: { from: 'pending_approval', to: 'active' },
      role: { from: 'user', to: 'moderator' },
    },
  },
  outcome: 'success',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
};

export const mockAuditLogError: AuditLog = {
  audit_id: 'audit-2024-01-15T11:00:00.000Z',
  user_id: 'user-3',
  action: 'USER_DELETED',
  resource_type: 'user',
  resource_id: 'user-99',
  severity: 'high',
  timestamp: '2024-01-15T11:00:00Z',
  metadata: {
    error: 'User not found',
    code: 'USER_001',
  },
  outcome: null,
  ip_address: '192.168.1.2',
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
};

export const mockAuditLogs: AuditLog[] = [mockAuditLog, mockAuditLogError];

export const mockAuditLogListResponse: { logs: AuditLog[], total: number } = {
  logs: mockAuditLogs,
  total: 2,
};

/**
 * Factory functions for creating mock data with overrides
 */
export function createMockUser(overrides?: Partial<AdminUser>): AdminUser {
  return {
    ...mockAdminUser,
    ...overrides,
  };
}

export function createMockUserDetail(overrides?: Partial<UserDetailedStats>): UserDetailedStats {
  return {
    ...mockAdminUserDetail,
    ...overrides,
  };
}

export function createMockRole(overrides?: Partial<AdminRole>): AdminRole {
  return {
    ...mockAdminRole,
    ...overrides,
  };
}

export function createMockAuditLog(overrides?: Partial<AuditLog>): AuditLog {
  return {
    ...mockAuditLog,
    ...overrides,
  };
}
