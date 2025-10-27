/**
 * Comprehensive Backend API Integration Test
 * Tests all 56+ backend endpoints end-to-end with real data
 *
 * Coverage:
 * - Authentication APIs (11 endpoints)
 * - Profile APIs (2 endpoints)
 * - Admin User Management (9 endpoints)
 * - Admin Role Management (5 endpoints)
 * - Admin RBAC (12 endpoints) ✨ NEW
 * - Audit APIs (2 endpoints)
 * - GDPR Compliance (3 endpoints)
 * - Health Checks (6 endpoints)
 * - Logs (1 endpoint)
 * - Metrics (2 endpoints) ✨ NEW
 * - Circuit Breaker (2 endpoints) ✨ NEW
 *
 * Usage: npx tsx scripts/test-all-backend-apis.ts
 *
 * Test Users:
 * - Super Admin: sangram1@gmail.com / Sangram@1 (Role: ADMIN/super_admin)
 * - Regular Admin: admin@example.com / Admin@123456 (Role: ADMIN)
 * - Test Users: user3-6@example.com (Various roles)
 */

const BACKEND_URL = 'http://127.0.0.1:8001';
const API_BASE = `${BACKEND_URL}/api/v1`;

// Test User Credentials
const TEST_USERS = {
  superAdmin: {
    email: process.env.ADMIN_EMAIL || 'sangram1@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'Sangram@1',
    role: 'ADMIN',
    userId: 'super-admin-001',
  },
  regularAdmin: {
    email: 'admin@example.com',
    password: 'Admin@123456',
    role: 'ADMIN',
    userId: 'admin-001',
  },
  testUser3: {
    email: 'user3@example.com',
    password: 'Password@3',
    role: 'USER',
  },
  testUser4: {
    email: 'user4@example.com',
    password: 'Password@4',
    role: 'MANAGER',
  },
  testUser5: {
    email: 'user5@example.com',
    password: 'Password@5',
    role: 'MODERATOR',
  },
  testUser6: {
    email: 'user6@example.com',
    password: 'Password@6',
    role: 'AUDITOR',
  },
};

// Use super admin for testing
const ADMIN_CREDENTIALS = TEST_USERS.superAdmin;

interface TestResult {
  category: string;
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  message: string;
  responseTime?: number;
  response?: any;
}

const results: TestResult[] = [];
let authToken: string | null = null;
let createdUserId: string | null = null;
let createdRoleName: string | null = null;
let exportId: string | null = null;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function makeRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  useAuth: boolean = false
): Promise<{ status: number; data?: any; responseTime: number }> {
  const startTime = Date.now();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const url = endpoint.startsWith('/health')
      ? `${BACKEND_URL}${endpoint}`
      : `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseTime = Date.now() - startTime;
    let data;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return { status: response.status, data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 0,
      data: { error: error instanceof Error ? error.message : String(error) },
      responseTime,
    };
  }
}

function logResult(result: TestResult) {
  const statusColor =
    result.status === 'PASS' ? colors.green : result.status === 'FAIL' ? colors.red : colors.yellow;
  const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';

  console.log(
    `${statusIcon} ${statusColor}${result.status}${colors.reset} ${result.method} ${result.endpoint} ` +
      `${result.statusCode ? `(${result.statusCode})` : ''} ` +
      `${result.responseTime ? `[${result.responseTime}ms]` : ''} - ${result.message}`
  );
}

async function test(
  category: string,
  endpoint: string,
  method: string,
  expectedStatus: number,
  body?: any,
  useAuth: boolean = false,
  description?: string
): Promise<any> {
  const response = await makeRequest(endpoint, method, body, useAuth);

  const isSuccess = response.status === expectedStatus;
  const result: TestResult = {
    category,
    endpoint,
    method,
    status: isSuccess ? 'PASS' : 'FAIL',
    statusCode: response.status,
    message:
      description || (isSuccess ? 'Success' : `Expected ${expectedStatus}, got ${response.status}`),
    responseTime: response.responseTime,
    response: response.data,
  };

  results.push(result);
  logResult(result);

  return response.data;
}

async function testHealthEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📊 1. HEALTH ENDPOINTS (7 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await test('Health', '/health/', 'GET', 200, undefined, false, 'Basic health check');
  await test('Health', '/health/ping', 'GET', 200, undefined, false, 'Ping endpoint');
  await test('Health', '/health/ready', 'GET', 200, undefined, false, 'Readiness probe');
  await test('Health', '/health/live', 'GET', 200, undefined, false, 'Liveness probe');
  await test('Health', '/health/detailed', 'GET', 200, undefined, false, 'Detailed health status');
  await test('Health', '/health/database', 'GET', 200, undefined, false, 'Database health');
  await test('Health', '/health/system', 'GET', 200, undefined, false, 'System health');
}

async function testAuthenticationEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🔐 2. AUTHENTICATION ENDPOINTS (13 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Test login
  const loginData = await test(
    'Authentication',
    '/auth/login',
    'POST',
    200,
    ADMIN_CREDENTIALS,
    false,
    'Admin login'
  );

  if (loginData?.access_token) {
    authToken = loginData.access_token;
    console.log(`${colors.green}✓ Auth token acquired${colors.reset}\n`);
  }

  // Test register (with unique email)
  const timestamp = Date.now();
  await test(
    'Authentication',
    '/auth/register',
    'POST',
    201,
    {
      email: `test${timestamp}@example.com`,
      password: 'Test@123456',
      first_name: 'Test',
      last_name: 'User',
    },
    false,
    'User registration'
  );

  // Test refresh token
  if (loginData?.refresh_token) {
    const _refreshData = await makeRequest('/auth/refresh', 'POST', undefined, false);
    // Add manual Authorization header with refresh token
    const headers = { Authorization: `Bearer ${loginData.refresh_token}` };
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers,
    });

    const result: TestResult = {
      category: 'Authentication',
      endpoint: '/auth/refresh',
      method: 'POST',
      status: response.status === 200 ? 'PASS' : 'FAIL',
      statusCode: response.status,
      message: 'Refresh access token',
      responseTime: 0,
    };
    results.push(result);
    logResult(result);
  }

  // Test password reset flow
  await test(
    'Authentication',
    '/auth/forgot-password',
    'POST',
    200,
    { email: ADMIN_CREDENTIALS.email },
    false,
    'Request password reset'
  );

  await test(
    'Authentication',
    '/auth/password-reset',
    'POST',
    200,
    { email: ADMIN_CREDENTIALS.email },
    false,
    'Password reset (alias)'
  );

  // Test resend verification
  await test(
    'Authentication',
    '/auth/resend-verification',
    'POST',
    200,
    { email: `test${timestamp}@example.com` },
    false,
    'Resend verification email'
  );

  // Test change password (requires auth)
  await test(
    'Authentication',
    '/auth/change-password',
    'POST',
    200,
    {
      current_password: ADMIN_CREDENTIALS.password,
      new_password: 'NewPass@123456',
    },
    true,
    'Change password (authenticated)'
  );

  // Change back to original password
  await test(
    'Authentication',
    '/auth/change-password',
    'POST',
    200,
    {
      current_password: 'NewPass@123456',
      new_password: ADMIN_CREDENTIALS.password,
    },
    true,
    'Restore original password'
  );

  // Test logout
  await test('Authentication', '/auth/logout', 'POST', 200, undefined, true, 'User logout');

  // Re-login after logout
  const reloginData = await test(
    'Authentication',
    '/auth/login',
    'POST',
    200,
    ADMIN_CREDENTIALS,
    false,
    'Re-login after logout'
  );

  if (reloginData?.access_token) {
    authToken = reloginData.access_token;
  }

  // Note: Secure cookie endpoints and verify-email/reset-password with token require specific setup
  console.log(
    `\n${colors.yellow}⏭️ Skipping secure-login, secure-logout, secure-refresh (require cookie setup)${colors.reset}`
  );
  console.log(
    `${colors.yellow}⏭️ Skipping verify-email, reset-password (require email tokens)${colors.reset}\n`
  );
}

async function testProfileEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}👤 3. PROFILE ENDPOINTS (6 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Test all profile GET endpoints (with aliases)
  await test('Profile', '/profile/me', 'GET', 200, undefined, true, 'Get current user profile');
  await test('Profile', '/profile', 'GET', 200, undefined, true, 'Get profile (alias)');
  await test('Profile', '/profile/', 'GET', 200, undefined, true, 'Get profile (alias with slash)');

  // Test profile update
  const updateData = {
    first_name: 'Updated',
    last_name: 'Admin',
  };

  await test('Profile', '/profile/me', 'PUT', 200, updateData, true, 'Update current user profile');
  await test('Profile', '/profile', 'PUT', 200, updateData, true, 'Update profile (alias)');
  await test(
    'Profile',
    '/profile/',
    'PUT',
    200,
    updateData,
    true,
    'Update profile (alias with slash)'
  );
}

async function testAdminUserEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}👥 4. ADMIN USER MANAGEMENT ENDPOINTS (9 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // List users
  await test('Admin Users', '/admin/users', 'GET', 200, undefined, true, 'List all users');

  // Create user
  const timestamp = Date.now();
  const createUserData = await test(
    'Admin Users',
    '/admin/users',
    'POST',
    201,
    {
      email: `admin-test-${timestamp}@example.com`,
      password: 'TestUser@123',
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
    },
    true,
    'Create new user'
  );

  if (createUserData?.user_id) {
    createdUserId = createUserData.user_id;
    console.log(`${colors.green}✓ Created user ID: ${createdUserId}${colors.reset}\n`);

    // Get user details
    await test(
      'Admin Users',
      `/admin/users/${createdUserId}`,
      'GET',
      200,
      undefined,
      true,
      'Get user details'
    );

    // Update user
    await test(
      'Admin Users',
      `/admin/users/${createdUserId}`,
      'PUT',
      200,
      { first_name: 'Updated', last_name: 'Name' },
      true,
      'Update user'
    );

    // Approve user
    await test(
      'Admin Users',
      `/admin/users/${createdUserId}/approve`,
      'POST',
      200,
      undefined,
      true,
      'Approve user'
    );

    // Reject user (test endpoint)
    await test(
      'Admin Users',
      `/admin/users/${createdUserId}/reject`,
      'POST',
      200,
      { reason: 'Testing rejection' },
      true,
      'Reject user'
    );

    // Delete user
    await test(
      'Admin Users',
      `/admin/users/${createdUserId}`,
      'DELETE',
      200,
      undefined,
      true,
      'Delete user'
    );
  }

  // Test legacy approve endpoint
  await test(
    'Admin Users',
    '/admin/approve-user',
    'POST',
    200,
    { user_id: 'admin-001' },
    true,
    'Approve user (legacy endpoint)'
  );

  // Get audit logs
  await test(
    'Admin Users',
    '/admin/audit-logs',
    'GET',
    200,
    undefined,
    true,
    'Get admin audit logs'
  );
}

async function testAdminRoleEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🎭 5. ADMIN ROLE MANAGEMENT ENDPOINTS (7 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // List roles
  await test('Admin Roles', '/admin/roles', 'GET', 200, undefined, true, 'List all roles');

  // Create role
  const timestamp = Date.now();
  const createRoleData = await test(
    'Admin Roles',
    '/admin/roles',
    'POST',
    201,
    {
      role_name: `test_role_${timestamp}`,
      description: 'Test role for API testing',
      permissions: ['user:read', 'profile:read'],
    },
    true,
    'Create new role'
  );

  if (createRoleData?.role_name || createRoleData?.name) {
    createdRoleName = createRoleData?.role_name || createRoleData?.name;
    console.log(`${colors.green}✓ Created role: ${createdRoleName}${colors.reset}\n`);

    // Get role details
    await test(
      'Admin Roles',
      `/admin/roles/${createdRoleName}`,
      'GET',
      200,
      undefined,
      true,
      'Get role details'
    );

    // Update role
    await test(
      'Admin Roles',
      `/admin/roles/${createdRoleName}`,
      'PUT',
      200,
      {
        description: 'Updated test role',
        permissions: ['user:read', 'profile:read', 'profile:update'],
      },
      true,
      'Update role'
    );

    // Delete role
    await test(
      'Admin Roles',
      `/admin/roles/${createdRoleName}`,
      'DELETE',
      200,
      undefined,
      true,
      'Delete role'
    );
  }

  // Test assign/revoke role (if we have a user)
  if (createdUserId) {
    await test(
      'Admin Roles',
      `/admin/users/${createdUserId}/assign-role`,
      'POST',
      200,
      { role: 'user' },
      true,
      'Assign role to user'
    );

    await test(
      'Admin Roles',
      `/admin/users/${createdUserId}/revoke-role`,
      'POST',
      200,
      undefined,
      true,
      'Revoke role from user'
    );
  } else {
    console.log(
      `${colors.yellow}⏭️ Skipping assign/revoke role (no test user created)${colors.reset}\n`
    );
  }
}

async function testAuditEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📋 6. AUDIT ENDPOINTS (2 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await test('Audit', '/audit/logs', 'GET', 200, undefined, true, 'Query audit logs');
  await test('Audit', '/audit/summary', 'GET', 200, undefined, true, 'Get audit summary');
}

async function testGDPREndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🔒 7. GDPR ENDPOINTS (3 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Request data export
  const exportData = await test(
    'GDPR',
    '/gdpr/export/my-data',
    'POST',
    200,
    { format: 'json', include_audit_logs: true },
    true,
    'Request data export'
  );

  if (exportData?.export_id || exportData?.request_id) {
    exportId = exportData.export_id || exportData.request_id;
    console.log(`${colors.green}✓ Export ID: ${exportId}${colors.reset}\n`);

    // Check export status
    await test(
      'GDPR',
      `/gdpr/export/${exportId}/status`,
      'GET',
      200,
      undefined,
      true,
      'Check export status'
    );
  }

  // Note: Account deletion is destructive, so we skip it in testing
  console.log(
    `${colors.yellow}⏭️ Skipping delete-my-account (destructive operation)${colors.reset}\n`
  );
}

async function testLogsEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📝 8. LOGS ENDPOINTS (1 endpoint)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await test(
    'Logs',
    '/logs/frontend-errors',
    'POST',
    202, // Accept 202 Accepted as valid response
    {
      level: 'error',
      message: 'Test error from API integration test',
      stack: 'Error stack trace',
      timestamp: new Date().toISOString(),
      user_agent: 'API-Test-Script/1.0',
      url: 'http://localhost:5173/test',
    },
    false,
    'Log frontend error'
  );
}

async function testAdminRBACEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🔐 9. ADMIN RBAC ENDPOINTS (12 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  let rbacRoleId: string | null = null;
  const testUserId: string = 'super-admin-001'; // Use super admin for testing

  // 1. List all RBAC roles
  await test('Admin RBAC', '/admin/rbac/roles', 'GET', 200, undefined, true, 'List all RBAC roles');

  // 2. Get all available permissions
  await test(
    'Admin RBAC',
    '/admin/rbac/permissions',
    'GET',
    200,
    undefined,
    true,
    'List available permissions'
  );

  // 3. Create new RBAC role
  const timestamp = Date.now();
  const createRoleData = await test(
    'Admin RBAC',
    '/admin/rbac/roles',
    'POST',
    201,
    {
      role_name: `rbac_test_role_${timestamp}`,
      description: 'RBAC test role for API integration',
      permissions: ['user:read', 'profile:read'],
    },
    true,
    'Create new RBAC role'
  );

  if (createRoleData?.role_id || createRoleData?.id) {
    rbacRoleId = createRoleData?.role_id || createRoleData?.id;
    console.log(`${colors.green}✓ Created RBAC role ID: ${rbacRoleId}${colors.reset}\n`);

    // 4. Get RBAC role details by ID
    await test(
      'Admin RBAC',
      `/admin/rbac/roles/${rbacRoleId}`,
      'GET',
      200,
      undefined,
      true,
      'Get RBAC role details'
    );

    // 5. Update RBAC role
    await test(
      'Admin RBAC',
      `/admin/rbac/roles/${rbacRoleId}`,
      'PUT',
      200,
      {
        description: 'Updated RBAC test role',
        permissions: ['user:read', 'profile:read', 'profile:update'],
      },
      true,
      'Update RBAC role'
    );

    // 6. Get users with this role
    await test(
      'Admin RBAC',
      `/admin/rbac/roles/${rbacRoleId}/users`,
      'GET',
      200,
      undefined,
      true,
      'Get users with specific role'
    );
  }

  // 7. Get user's assigned roles
  await test(
    'Admin RBAC',
    `/admin/rbac/users/${testUserId}/roles`,
    'GET',
    200,
    undefined,
    true,
    'Get user assigned roles'
  );

  // 8. Get user's effective permissions
  await test(
    'Admin RBAC',
    `/admin/rbac/users/${testUserId}/permissions`,
    'GET',
    200,
    undefined,
    true,
    'Get user effective permissions'
  );

  // 9. Check if user has specific permission
  await test(
    'Admin RBAC',
    '/admin/rbac/check-permission',
    'POST',
    200,
    {
      user_id: testUserId,
      permission: 'user:read',
    },
    true,
    'Check user permission'
  );

  if (rbacRoleId) {
    // 10. Assign role to user
    await test(
      'Admin RBAC',
      `/admin/rbac/users/${testUserId}/roles`,
      'POST',
      200,
      { role_id: rbacRoleId },
      true,
      'Assign RBAC role to user'
    );

    // 11. Revoke role from user
    await test(
      'Admin RBAC',
      `/admin/rbac/users/${testUserId}/roles/${rbacRoleId}`,
      'DELETE',
      200,
      undefined,
      true,
      'Revoke RBAC role from user'
    );

    // 12. Delete RBAC role
    await test(
      'Admin RBAC',
      `/admin/rbac/roles/${rbacRoleId}`,
      'DELETE',
      200,
      undefined,
      true,
      'Delete RBAC role'
    );
  }
}

async function testMetricsEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📊 10. METRICS ENDPOINTS (2 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // 1. Get system metrics
  await test(
    'Metrics',
    '/metrics/system?period=1h',
    'GET',
    200,
    undefined,
    true,
    'Get system metrics (1 hour)'
  );

  // 2. Get endpoint-specific metrics
  await test(
    'Metrics',
    '/metrics/endpoints?period=1h',
    'GET',
    200,
    undefined,
    true,
    'Get endpoint metrics (1 hour)'
  );
}

async function testCircuitBreakerEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}⚡ 11. CIRCUIT BREAKER ENDPOINTS (2 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // 1. Get circuit breaker status for all services
  await test(
    'Circuit Breaker',
    '/circuit-breaker/status',
    'GET',
    200,
    undefined,
    true,
    'Get circuit breaker status'
  );

  // 2. Reset circuit breaker for a service
  await test(
    'Circuit Breaker',
    '/circuit-breaker/reset',
    'POST',
    200,
    { service: 'dynamodb' },
    true,
    'Reset circuit breaker'
  );
}

async function testAdditionalMissingEndpoints() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🔧 12. ADDITIONAL MISSING ENDPOINTS (8 endpoints)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Admin stats endpoint
  await test('Admin Users', '/admin/stats', 'GET', 200, undefined, true, 'Get admin statistics');

  // Role detail operations (GET/PUT/DELETE by ID)
  const timestamp = Date.now();
  const createRoleData = await test(
    'Admin Roles',
    '/admin/roles',
    'POST',
    201,
    {
      role_name: `detail_test_role_${timestamp}`,
      description: 'Role for testing detail operations',
      permissions: ['user:read'],
    },
    true,
    'Create role for detail testing'
  );

  if (createRoleData?.role_id || createRoleData?.id || createRoleData?.role_name) {
    const roleId = createRoleData?.role_id || createRoleData?.id || createRoleData?.role_name;
    console.log(`${colors.green}✓ Created role for testing: ${roleId}${colors.reset}\n`);

    // Get role by ID
    await test(
      'Admin Roles',
      `/admin/roles/${roleId}`,
      'GET',
      200,
      undefined,
      true,
      'Get role details by ID'
    );

    // Update role by ID
    await test(
      'Admin Roles',
      `/admin/roles/${roleId}`,
      'PUT',
      200,
      {
        description: 'Updated role description',
        permissions: ['user:read', 'user:write'],
      },
      true,
      'Update role by ID'
    );

    // Delete role by ID
    await test(
      'Admin Roles',
      `/admin/roles/${roleId}`,
      'DELETE',
      200,
      undefined,
      true,
      'Delete role by ID'
    );
  }

  // Health check missing endpoints
  await test('Health', '/health/startup', 'GET', 200, undefined, false, 'Kubernetes startup probe');
  await test('Health', '/health/version', 'GET', 200, undefined, false, 'Get API version info');

  // GDPR consent status
  await test(
    'GDPR',
    '/gdpr/consent-status',
    'GET',
    200,
    undefined,
    true,
    'Get user consent status'
  );

  // Audit log detail
  // Note: We need a valid audit_id, so we'll get logs first
  const auditLogs = await makeRequest('/audit/logs?limit=1', 'GET', undefined, true);
  if (auditLogs.data?.logs && auditLogs.data.logs.length > 0) {
    const auditId = auditLogs.data.logs[0].audit_id || auditLogs.data.logs[0].id;
    if (auditId) {
      await test(
        'Audit',
        `/audit/logs/${auditId}`,
        'GET',
        200,
        undefined,
        true,
        'Get audit log details'
      );
    }
  } else {
    console.log(
      `${colors.yellow}⏭️ Skipping audit log detail test (no audit logs available)${colors.reset}\n`
    );
  }
}

async function printSummary() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;

  const passRate = ((passed / total) * 100).toFixed(1);
  const avgResponseTime = (
    results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length
  ).toFixed(0);

  console.log(`Total Tests:        ${total}`);
  console.log(`${colors.green}✅ Passed:          ${passed} (${passRate}%)${colors.reset}`);
  console.log(`${colors.red}❌ Failed:          ${failed}${colors.reset}`);
  console.log(`${colors.yellow}⏭️  Skipped:         ${skipped}${colors.reset}`);
  console.log(`Avg Response Time:  ${avgResponseTime}ms`);

  // Category breakdown
  console.log(`\n${colors.blue}By Category:${colors.reset}`);
  const categories = [...new Set(results.map((r) => r.category))];
  categories.forEach((cat) => {
    const catResults = results.filter((r) => r.category === cat);
    const catPassed = catResults.filter((r) => r.status === 'PASS').length;
    const catTotal = catResults.length;
    console.log(`  ${cat}: ${catPassed}/${catTotal} passed`);
  });

  // Failed tests
  if (failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`  ❌ ${r.method} ${r.endpoint} (${r.statusCode}) - ${r.message}`);
        if (r.response?.message) {
          console.log(`     Error: ${r.response.message}`);
        }
      });
  }

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Overall result
  if (failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(
      `${colors.red}❌ Some tests failed. Please review the failures above.${colors.reset}\n`
    );
    process.exit(1);
  }
}

async function main() {
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🚀 COMPREHENSIVE BACKEND API INTEGRATION TEST${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`\nBackend URL: ${BACKEND_URL}`);
  console.log(`API Base: ${API_BASE}`);
  console.log(`Admin Email: ${ADMIN_CREDENTIALS.email}`);
  console.log(`Total Endpoints: 56+ (including all documented APIs)`);
  console.log(`\nStarting tests...\n`);

  try {
    await testHealthEndpoints();
    await testAuthenticationEndpoints();
    await testProfileEndpoints();
    await testAdminUserEndpoints();
    await testAdminRoleEndpoints();
    await testAuditEndpoints();
    await testGDPREndpoints();
    await testLogsEndpoints();

    // NEW: Test previously missing categories
    await testAdminRBACEndpoints();
    await testMetricsEndpoints();
    await testCircuitBreakerEndpoints();
    await testAdditionalMissingEndpoints();

    await printSummary();
  } catch (error) {
    console.error(`\n${colors.red}Fatal error during testing:${colors.reset}`, error);
    process.exit(1);
  }
}

main();
