// ============================================================================
// RBAC TESTING UTILITIES
// Comprehensive testing infrastructure for RBAC system validation
// ============================================================================

import type { 
  UserRole, 
  Permission, 
  RbacContextValue,
  RoleLevelType,
  AccessCheckOptions 
} from '../types/rbac.types';

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

interface TestUserProfile {
  name: string;
  department: string;
  status?: string;
}

export interface TestUser {
  id: string;
  email: string;
  roles: UserRole[];
  permissions: Permission[];
  profile: TestUserProfile;
}

export class RbacTestDataGenerator {
  // Generate test users with different role combinations
  static generateTestUsers(): TestUser[] {
    return [
      {
        id: 'test-admin-001',
        email: 'admin@test.com',
        roles: ['admin', 'employee', 'user'],
        permissions: [
          'admin:*', 'users:*', 'rbac:*', 'content:*', 'profile:*'
        ],
        profile: { name: 'Test Admin', department: 'IT' }
      },
      {
        id: 'test-manager-001',
        email: 'manager@test.com',
        roles: ['manager', 'employee', 'user'],
        permissions: [
          'profile:*', 'content:*', 'users:view_list', 'users:view_details'
        ],
        profile: { name: 'Test Manager', department: 'Management' }
      },
      {
        id: 'test-employee-001',
        email: 'employee@test.com',
        roles: ['employee', 'user'],
        permissions: ['profile:view_own', 'profile:edit_own', 'content:view', 'content:create'],
        profile: { name: 'Test Employee', department: 'Operations' }
      },
      {
        id: 'test-user-001',
        email: 'user@test.com',
        roles: ['user'],
        permissions: ['profile:view_own', 'profile:edit_own', 'content:view'],
        profile: { name: 'Test User', department: 'General' }
      },
      {
        id: 'test-suspended-001',
        email: 'suspended@test.com',
        roles: [],
        permissions: [],
        profile: { name: 'Suspended User', department: 'None', status: 'suspended' }
      }
    ];
  }

  // Generate test role configurations
  static generateTestRoles(): Record<UserRole, {
    permissions: Permission[];
    level: RoleLevelType;
    description: string;
    endpoints: Array<{ path: string; methods: string[] }>;
  }> {
    return {
      public: {
        permissions: ['public:*'],
        level: 0, // PUBLIC
        description: 'Public guest access',
        endpoints: [
          { path: '/public/*', methods: ['GET'] },
          { path: '/api/public/*', methods: ['GET'] }
        ]
      },
      user: {
        permissions: ['profile:view_own', 'profile:edit_own', 'content:view'],
        level: 1, // USER
        description: 'Standard user access',
        endpoints: [
          { path: '/profile/*', methods: ['GET', 'PUT'] },
          { path: '/api/profile/*', methods: ['GET', 'PUT'] }
        ]
      },
      employee: {
        permissions: ['profile:view_own', 'profile:edit_own', 'content:view', 'content:create'],
        level: 2, // EMPLOYEE
        description: 'Employee access with content creation',
        endpoints: [
          { path: '/employee/*', methods: ['GET', 'POST', 'PUT'] },
          { path: '/api/content/*', methods: ['GET', 'POST', 'PUT'] }
        ]
      },
      manager: {
        permissions: ['profile:*', 'content:*', 'users:view_list', 'users:view_details'],
        level: 3, // MANAGER
        description: 'Management level access',
        endpoints: [
          { path: '/manager/*', methods: ['GET', 'POST', 'PUT'] },
          { path: '/api/users/*', methods: ['GET'] }
        ]
      },
      admin: {
        permissions: ['admin:*', 'users:*', 'rbac:*', 'content:*', 'profile:*'],
        level: 4, // ADMIN
        description: 'Full system administrator access',
        endpoints: [
          { path: '/admin/*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
          { path: '/api/users/*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
          { path: '/api/rbac/*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
        ]
      },
      super_admin: {
        permissions: ['*:*'],
        level: 5, // SUPER_ADMIN
        description: 'Super administrator with all permissions',
        endpoints: [
          { path: '/*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
        ]
      },
      auditor: {
        permissions: ['audit:*', 'users:view_list', 'rbac:view'],
        level: 4, // AUDITOR
        description: 'Audit and compliance access',
        endpoints: [
          { path: '/audit/*', methods: ['GET'] },
          { path: '/api/audit/*', methods: ['GET'] }
        ]
      }
    };
  }

  // Generate test scenarios for permission combinations
  static generatePermissionTestScenarios(): Array<{
    name: string;
    user: TestUser;
    expectedPermissions: Permission[];
    expectedRoles: UserRole[];
    testCases: Array<{
      permission: Permission;
      shouldHave: boolean;
      context?: Record<string, unknown>;
    }>;
  }> {
    const users = this.generateTestUsers();
    
    return [
      {
        name: 'Admin User - Full Access',
        user: users[0],
        expectedPermissions: users[0].permissions,
        expectedRoles: users[0].roles,
        testCases: [
          { permission: 'admin:dashboard', shouldHave: true },
          { permission: 'users:delete', shouldHave: true },
          { permission: 'rbac:assign_roles', shouldHave: true },
          { permission: 'system:shutdown', shouldHave: false }, // Non-existent permission
        ]
      },
      {
        name: 'Manager User - Management Access',
        user: users[1],
        expectedPermissions: users[1].permissions,
        expectedRoles: users[1].roles,
        testCases: [
          { permission: 'content:create', shouldHave: true },
          { permission: 'users:view_list', shouldHave: true },
          { permission: 'admin:dashboard', shouldHave: false },
          { permission: 'users:delete', shouldHave: false },
        ]
      },
      {
        name: 'Employee User - Content Access',
        user: users[2],
        expectedPermissions: users[2].permissions,
        expectedRoles: users[2].roles,
        testCases: [
          { permission: 'content:view', shouldHave: true },
          { permission: 'content:create', shouldHave: true },
          { permission: 'users:view_list', shouldHave: false },
          { permission: 'admin:dashboard', shouldHave: false },
        ]
      },
      {
        name: 'Regular User - Limited Access',
        user: users[3],
        expectedPermissions: users[3].permissions,
        expectedRoles: users[3].roles,
        testCases: [
          { permission: 'profile:view_own', shouldHave: true },
          { permission: 'profile:edit_own', shouldHave: true },
          { permission: 'content:view', shouldHave: true },
          { permission: 'content:create', shouldHave: false },
        ]
      },
      {
        name: 'Suspended User - No Access',
        user: users[4],
        expectedPermissions: users[4].permissions,
        expectedRoles: users[4].roles,
        testCases: [
          { permission: 'content:view', shouldHave: false },
          { permission: 'profile:view_own', shouldHave: false },
          { permission: 'admin:dashboard', shouldHave: false },
        ]
      }
    ];
  }
}

// ============================================================================
// RBAC MOCK CONTEXT PROVIDER
// ============================================================================

export class RbacMockProvider {
  private mockContext: RbacContextValue;

  constructor(user?: TestUser) {
    const testUser = user || RbacTestDataGenerator.generateTestUsers()[0];
    
    this.mockContext = {
      permissions: testUser.permissions,
      userRoles: testUser.roles,
      hasRole: (role: UserRole | UserRole[]) => {
        const roles = Array.isArray(role) ? role : [role];
        return roles.some(r => testUser.roles.includes(r));
      },
      hasPermission: (permission: Permission) => testUser.permissions.includes(permission),
      hasAllPermissions: (permissions: Permission[]) => 
        permissions.every(p => testUser.permissions.includes(p)),
      hasAnyPermission: (permissions: Permission[]) => 
        permissions.some(p => testUser.permissions.includes(p)),
      hasAccess: (options: AccessCheckOptions) => {
        // Mock access logic based on user permissions and roles
        let hasRoleAccess = true;
        let hasPermissionAccess = true;

        if (options.requiredRole) {
          const requiredRoles = Array.isArray(options.requiredRole) ? options.requiredRole : [options.requiredRole];
          hasRoleAccess = requiredRoles.some(role => testUser.roles.includes(role));
        }

        if (options.requiredPermissions) {
          const requiredPerms = Array.isArray(options.requiredPermissions) ? options.requiredPermissions : [options.requiredPermissions];
          if (options.requireAllPermissions) {
            hasPermissionAccess = requiredPerms.every(perm => testUser.permissions.includes(perm));
          } else {
            hasPermissionAccess = requiredPerms.some(perm => testUser.permissions.includes(perm));
          }
        }

        return hasRoleAccess && hasPermissionAccess;
      },
      getRoleLevel: (role: UserRole) => this.determineRoleLevel([role]),
      hasRoleLevel: (level: RoleLevelType) => this.determineRoleLevel(testUser.roles) >= level,
      canAccessEndpoint: (method: string, path: string) => {
        // Mock endpoint access logic
        const roles = RbacTestDataGenerator.generateTestRoles();
        return testUser.roles.some((role: UserRole) => {
          const roleConfig = roles[role];
          return roleConfig.endpoints.some(endpoint => {
            const pathMatches = this.pathMatches(path, endpoint.path);
            const methodMatches = endpoint.methods.includes(method);
            return pathMatches && methodMatches;
          });
        });
      },
      getEndpointPermissions: (_method: string, path: string) => {
        // Return mock permissions for endpoint
        const resourcePermissions = this.getResourcePermissions(path);
        return {
          requiredRoles: ['user'] as UserRole[],
          requiredPermissions: resourcePermissions
        };
      }
    };
  }

  getContext(): RbacContextValue {
    return this.mockContext;
  }

  // Update mock user for testing different scenarios
  updateUser(user: TestUser): void {
    this.mockContext.permissions = user.permissions;
    this.mockContext.userRoles = user.roles;
    
    // Update all methods with new user data
    this.mockContext.hasRole = (role: UserRole | UserRole[]) => {
      const roles = Array.isArray(role) ? role : [role];
      return roles.some(r => user.roles.includes(r));
    };
    this.mockContext.hasPermission = (permission: Permission) => user.permissions.includes(permission);
    this.mockContext.hasAllPermissions = (permissions: Permission[]) => 
      permissions.every(p => user.permissions.includes(p));
    this.mockContext.hasAnyPermission = (permissions: Permission[]) => 
      permissions.some(p => user.permissions.includes(p));
  }

  private getResourcePermissions(resource: string): Permission[] {
    // Mock logic to determine required permissions for a resource/action
    const permissionMap: Record<string, Permission[]> = {
      'admin': ['admin:dashboard', 'admin:config'],
      'users': ['users:view_list', 'users:view_details'],
      'profile': ['profile:view_own', 'profile:edit_own'],
      'content': ['content:view', 'content:create', 'content:edit'],
      'settings': ['admin:config', 'admin:system']
    };

    const baseResource = resource.split('/')[0] || resource;
    return permissionMap[baseResource] || [];
  }

  private determineRoleLevel(roles: UserRole[]): RoleLevelType {
    if (roles.includes('super_admin')) return 5; // SUPER_ADMIN
    if (roles.includes('admin')) return 4; // ADMIN
    if (roles.includes('auditor')) return 4; // AUDITOR
    if (roles.includes('manager')) return 3; // MANAGER
    if (roles.includes('employee')) return 2; // EMPLOYEE
    if (roles.includes('user')) return 1; // USER
    return 0; // PUBLIC
  }

  private pathMatches(actualPath: string, patternPath: string): boolean {
    // Simple path matching with wildcards
    if (patternPath.endsWith('/*')) {
      const basePath = patternPath.slice(0, -2);
      return actualPath.startsWith(basePath);
    }
    return actualPath === patternPath;
  }
}

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

export class RbacPerformanceTester {
  private results: Array<{
    operation: string;
    duration: number;
    iterations: number;
    timestamp: number;
  }> = [];

  // Test permission checking performance
  async testPermissionPerformance(
    mockProvider: RbacMockProvider,
    iterations: number = 1000
  ): Promise<{
    hasPermission: number;
    hasAllPermissions: number;
    hasAnyPermission: number;
    hasRole: number;
    hasAccess: number;
  }> {
    const context = mockProvider.getContext();
    const testPermissions: Permission[] = ['content:view', 'content:create', 'admin:dashboard'];
    // Test roles available for testing
    // const testRoles: RbacRole[] = ['user', 'editor', 'admin'];

    // Test hasPermission
    const hasPermissionStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      context.hasPermission('read_content');
    }
    const hasPermissionTime = performance.now() - hasPermissionStart;

    // Test hasAllPermissions
    const hasAllStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      context.hasAllPermissions(testPermissions);
    }
    const hasAllTime = performance.now() - hasAllStart;

    // Test hasAnyPermission
    const hasAnyStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      context.hasAnyPermission(testPermissions);
    }
    const hasAnyTime = performance.now() - hasAnyStart;

    // Test hasRole
    const hasRoleStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      context.hasRole('user');
    }
    const hasRoleTime = performance.now() - hasRoleStart;

    // Test hasAccess
    const hasAccessStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      context.hasAccess({ requiredPermissions: ['profile:view_own'] });
    }
    const hasAccessTime = performance.now() - hasAccessStart;

    const results = {
      hasPermission: hasPermissionTime / iterations,
      hasAllPermissions: hasAllTime / iterations,
      hasAnyPermission: hasAnyTime / iterations,
      hasRole: hasRoleTime / iterations,
      hasAccess: hasAccessTime / iterations
    };

    // Store results
    this.results.push({
      operation: 'permission_checking_suite',
      duration: Object.values(results).reduce((sum, time) => sum + time, 0),
      iterations,
      timestamp: Date.now()
    });

    return results;
  }

  // Test role hierarchy performance
  async testRoleHierarchyPerformance(iterations: number = 1000): Promise<number> {
    const users = RbacTestDataGenerator.generateTestUsers();
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      users.forEach(user => {
        const mockProvider = new RbacMockProvider(user);
        const context = mockProvider.getContext();
        
        // Test complex permission scenarios
        context.hasAllPermissions(['content:view', 'content:create']);
        context.hasAnyPermission(['admin:dashboard', 'users:view_list']);
        context.canAccessEndpoint('GET', '/admin/users');
      });
    }
    
    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    this.results.push({
      operation: 'role_hierarchy_test',
      duration: avgTime,
      iterations,
      timestamp: Date.now()
    });

    return avgTime;
  }

  // Get performance test results
  getResults(): Array<{
    operation: string;
    duration: number;
    iterations: number;
    timestamp: number;
  }> {
    return [...this.results];
  }

  // Clear performance test results
  clearResults(): void {
    this.results = [];
  }

  // Generate performance report
  generateReport(): {
    summary: {
      totalTests: number;
      averageDuration: number;
      slowestOperation: string;
      fastestOperation: string;
    };
    details: Array<{
      operation: string;
      avgDuration: number;
      totalIterations: number;
      lastRun: string;
    }>;
  } {
    if (this.results.length === 0) {
      return {
        summary: {
          totalTests: 0,
          averageDuration: 0,
          slowestOperation: 'N/A',
          fastestOperation: 'N/A'
        },
        details: []
      };
    }

    const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);
    const averageDuration = totalDuration / this.results.length;
    
    const slowest = this.results.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    );
    
    const fastest = this.results.reduce((prev, current) => 
      prev.duration < current.duration ? prev : current
    );

    return {
      summary: {
        totalTests: this.results.length,
        averageDuration,
        slowestOperation: slowest.operation,
        fastestOperation: fastest.operation
      },
      details: this.results.map(result => ({
        operation: result.operation,
        avgDuration: result.duration,
        totalIterations: result.iterations,
        lastRun: new Date(result.timestamp).toISOString()
      }))
    };
  }
}

// ============================================================================
// VALIDATION TESTING UTILITIES
// ============================================================================

export class RbacValidationTester {
  // Test all permission scenarios
  static async validatePermissionMatrix(): Promise<{
    passed: number;
    failed: number;
    results: Array<{
      scenario: string;
      user: string;
      permission: Permission;
      expected: boolean;
      actual: boolean;
      passed: boolean;
    }>;
  }> {
    const scenarios = RbacTestDataGenerator.generatePermissionTestScenarios();
    const results: Array<{
      scenario: string;
      user: string;
      permission: Permission;
      expected: boolean;
      actual: boolean;
      passed: boolean;
    }> = [];

    for (const scenario of scenarios) {
      const mockProvider = new RbacMockProvider(scenario.user);
      const context = mockProvider.getContext();

      for (const testCase of scenario.testCases) {
        const actual = context.hasPermission(testCase.permission);
        const passed = actual === testCase.shouldHave;

        results.push({
          scenario: scenario.name,
          user: scenario.user.email,
          permission: testCase.permission,
          expected: testCase.shouldHave,
          actual,
          passed
        });
      }
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    return { passed, failed, results };
  }

  // Test role hierarchy consistency
  static async validateRoleHierarchy(): Promise<{
    isValid: boolean;
    issues: string[];
    roleMatrix: Record<UserRole, {
      permissions: Permission[];
      level: RoleLevelType;
      inconsistencies: string[];
    }>;
  }> {
    const roles = RbacTestDataGenerator.generateTestRoles();
    const issues: string[] = [];
    const roleMatrix: Record<UserRole, {
      permissions: Permission[];
      level: RoleLevelType;
      inconsistencies: string[];
    }> = {} as Record<UserRole, {
      permissions: Permission[];
      level: RoleLevelType;
      inconsistencies: string[];
    }>;

    // Check each role for consistency
    Object.entries(roles).forEach(([roleName, roleConfig]) => {
      const inconsistencies: string[] = [];
      
      // Check if admin has all permissions that other roles have
      if (roleName === 'admin') {
        Object.entries(roles).forEach(([otherRole, otherConfig]) => {
          if (otherRole !== 'admin') {
            otherConfig.permissions.forEach(permission => {
              if (!roleConfig.permissions.includes(permission)) {
                inconsistencies.push(
                  `Admin role missing permission '${permission}' that ${otherRole} has`
                );
              }
            });
          }
        });
      }

      // Check if editor has basic user permissions
      if (roleName === 'editor') {
        const userPermissions = roles.user.permissions;
        userPermissions.forEach(permission => {
          if (!roleConfig.permissions.includes(permission)) {
            inconsistencies.push(
              `Editor role missing basic user permission '${permission}'`
            );
          }
        });
      }

      roleMatrix[roleName as UserRole] = {
        permissions: roleConfig.permissions,
        level: roleConfig.level,
        inconsistencies
      };

      issues.push(...inconsistencies);
    });

    return {
      isValid: issues.length === 0,
      issues,
      roleMatrix
    };
  }

  // Test endpoint access patterns
  static async validateEndpointAccess(): Promise<{
    isValid: boolean;
    accessMatrix: Array<{
      role: UserRole;
      endpoint: string;
      method: string;
      hasAccess: boolean;
      shouldHaveAccess: boolean;
      isCorrect: boolean;
    }>;
    issues: string[];
  }> {
    const users = RbacTestDataGenerator.generateTestUsers();
    const roles = RbacTestDataGenerator.generateTestRoles();
    const accessMatrix: Array<{
      role: UserRole;
      endpoint: string;
      method: string;
      hasAccess: boolean;
      shouldHaveAccess: boolean;
      isCorrect: boolean;
    }> = [];
    const issues: string[] = [];

    // Test endpoints for each user role
    users.forEach(user => {
      const mockProvider = new RbacMockProvider(user);
      const context = mockProvider.getContext();

      user.roles.forEach((role: UserRole) => {
        const roleConfig = roles[role];
        
        // Test each endpoint defined for this role
        roleConfig.endpoints.forEach(endpoint => {
          endpoint.methods.forEach((method: string) => {
            const hasAccess = context.canAccessEndpoint(method, endpoint.path);
            const shouldHaveAccess = true; // Should have access to own role's endpoints
            const isCorrect = hasAccess === shouldHaveAccess;

            if (!isCorrect) {
              issues.push(
                `Role '${role}' should have ${method} access to '${endpoint.path}' but doesn't`
              );
            }

            accessMatrix.push({
              role,
              endpoint: endpoint.path,
              method,
              hasAccess,
              shouldHaveAccess,
              isCorrect
            });
          });
        });
      });
    });

    return {
      isValid: issues.length === 0,
      accessMatrix,
      issues
    };
  }
}

// ============================================================================
// COMPREHENSIVE TEST SUITE
// ============================================================================

export class RbacTestSuite {
  private performanceTester = new RbacPerformanceTester();

  async runFullTestSuite(): Promise<{
    permissionTests: Awaited<ReturnType<typeof RbacValidationTester.validatePermissionMatrix>>;
    roleHierarchyTests: Awaited<ReturnType<typeof RbacValidationTester.validateRoleHierarchy>>;
    endpointTests: Awaited<ReturnType<typeof RbacValidationTester.validateEndpointAccess>>;
    performanceTests: {
      permissionPerformance: Awaited<ReturnType<RbacPerformanceTester['testPermissionPerformance']>>;
      roleHierarchyPerformance: number;
      performanceReport: ReturnType<RbacPerformanceTester['generateReport']>;
    };
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      isValid: boolean;
      issues: string[];
    };
  }> {
    console.log('🧪 Running comprehensive RBAC test suite...');

    // Run validation tests
    const permissionTests = await RbacValidationTester.validatePermissionMatrix();
    const roleHierarchyTests = await RbacValidationTester.validateRoleHierarchy();
    const endpointTests = await RbacValidationTester.validateEndpointAccess();

    // Run performance tests
    const mockProvider = new RbacMockProvider();
    const permissionPerformance = await this.performanceTester.testPermissionPerformance(mockProvider);
    const roleHierarchyPerformance = await this.performanceTester.testRoleHierarchyPerformance();
    const performanceReport = this.performanceTester.generateReport();

    // Calculate summary
    const totalTests = permissionTests.results.length + 
                      Object.keys(roleHierarchyTests.roleMatrix).length +
                      endpointTests.accessMatrix.length;
    
    const passed = permissionTests.passed + 
                  (roleHierarchyTests.isValid ? Object.keys(roleHierarchyTests.roleMatrix).length : 0) +
                  endpointTests.accessMatrix.filter(test => test.isCorrect).length;
    
    const failed = totalTests - passed;
    
    const allIssues = [
      ...roleHierarchyTests.issues,
      ...endpointTests.issues,
      ...permissionTests.results.filter(r => !r.passed).map(r => 
        `Permission test failed: ${r.user} should ${r.expected ? 'have' : 'not have'} '${r.permission}'`
      )
    ];

    const summary = {
      totalTests,
      passed,
      failed,
      isValid: failed === 0,
      issues: allIssues
    };

    console.log(`✅ Test suite completed: ${passed}/${totalTests} tests passed`);
    
    if (summary.issues.length > 0) {
      console.log('❌ Issues found:', summary.issues);
    }

    return {
      permissionTests,
      roleHierarchyTests,
      endpointTests,
      performanceTests: {
        permissionPerformance,
        roleHierarchyPerformance,
        performanceReport
      },
      summary
    };
  }
}

// Classes are exported inline above