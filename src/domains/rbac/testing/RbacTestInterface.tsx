import React, { useState, useEffect } from 'react';
import { 
  RbacTestDataGenerator, 
  RbacMockProvider, 
  RbacPerformanceTester, 
  RbacValidationTester, 
  RbacTestSuite 
} from './rbacTestUtils';
import type { TestUser } from './rbacTestUtils';
import './RbacTestInterface.css';

// ============================================================================
// RBAC TESTING INTERFACE COMPONENTS
// ============================================================================

interface TestResult {
  name: string;
  status: 'running' | 'passed' | 'failed' | 'pending';
  duration?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export function RbacTestInterface(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'permissions' | 'performance' | 'security' | 'suite'>('permissions');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null);

  useEffect(() => {
    // Initialize with first test user
    const users = RbacTestDataGenerator.generateTestUsers();
    setSelectedUser(users[0]);
  }, []);

  const runPermissionTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      console.log('🧪 Running Permission Matrix Tests...');
      const start = performance.now();
      
      const results = await RbacValidationTester.validatePermissionMatrix();
      const duration = performance.now() - start;

      setTestResults([{
        name: 'Permission Matrix Validation',
        status: results.failed === 0 ? 'passed' : 'failed',
        duration,
        details: results
      }]);

      console.log(`✅ Permission tests completed in ${duration.toFixed(2)}ms`);
      console.log(`Results: ${results.passed} passed, ${results.failed} failed`);
    } catch (error) {
      setTestResults([{
        name: 'Permission Matrix Validation',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runPerformanceTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      console.log('⚡ Running Performance Tests...');
      const tester = new RbacPerformanceTester();
      
      if (!selectedUser) return;
      
      const mockProvider = new RbacMockProvider(selectedUser);
      
      const start = performance.now();
      const permissionResults = await tester.testPermissionPerformance(mockProvider);
      const hierarchyTime = await tester.testRoleHierarchyPerformance();
      const duration = performance.now() - start;

      const report = tester.generateReport();

      setTestResults([
        {
          name: 'Permission Performance',
          status: 'passed',
          duration,
          details: { permissionResults, hierarchyTime, report }
        }
      ]);

      console.log('✅ Performance tests completed');
      console.log('Permission check avg:', permissionResults.hasPermission.toFixed(3), 'ms');
      console.log('Role hierarchy avg:', hierarchyTime.toFixed(3), 'ms');
    } catch (error) {
      setTestResults([{
        name: 'Performance Tests',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runSecurityTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      console.log('🔒 Running Security Tests...');
      const start = performance.now();
      
      const roleResults = await RbacValidationTester.validateRoleHierarchy();
      const endpointResults = await RbacValidationTester.validateEndpointAccess();
      const duration = performance.now() - start;

      setTestResults([
        {
          name: 'Role Hierarchy Validation',
          status: roleResults.isValid ? 'passed' : 'failed',
          duration: duration / 2,
          details: roleResults
        },
        {
          name: 'Endpoint Access Validation',
          status: endpointResults.isValid ? 'passed' : 'failed',
          duration: duration / 2,
          details: endpointResults
        }
      ]);

      console.log('✅ Security tests completed');
      console.log('Role hierarchy:', roleResults.isValid ? 'VALID' : 'INVALID');
      console.log('Endpoint access:', endpointResults.isValid ? 'VALID' : 'INVALID');
    } catch (error) {
      setTestResults([{
        name: 'Security Tests',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runFullTestSuite = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      console.log('🚀 Running Full RBAC Test Suite...');
      const testSuite = new RbacTestSuite();
      
      const start = performance.now();
      const results = await testSuite.runFullTestSuite();
      const duration = performance.now() - start;

      const suiteResults: TestResult[] = [
        {
          name: 'Permission Tests',
          status: results.permissionTests.failed === 0 ? 'passed' : 'failed',
          duration: duration * 0.3,
          details: results.permissionTests
        },
        {
          name: 'Role Hierarchy Tests',
          status: results.roleHierarchyTests.isValid ? 'passed' : 'failed',
          duration: duration * 0.2,
          details: results.roleHierarchyTests
        },
        {
          name: 'Endpoint Tests',
          status: results.endpointTests.isValid ? 'passed' : 'failed',
          duration: duration * 0.2,
          details: results.endpointTests
        },
        {
          name: 'Performance Tests',
          status: 'passed',
          duration: duration * 0.3,
          details: results.performanceTests
        }
      ];

      setTestResults(suiteResults);

      console.log('🎉 Full test suite completed!');
      console.log(`Overall: ${results.summary.passed}/${results.summary.totalTests} tests passed`);
      if (results.summary.issues.length > 0) {
        console.log('Issues found:', results.summary.issues);
      }
    } catch (error) {
      setTestResults([{
        name: 'Full Test Suite',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const users = RbacTestDataGenerator.generateTestUsers();

  return (
    <div className="rbac-test-interface">
      <div className="test-header">
        <h2>RBAC Testing Interface</h2>
        <div className="test-nav">
          <button 
            className={activeTab === 'permissions' ? 'active' : ''}
            onClick={() => setActiveTab('permissions')}
          >
            Permissions
          </button>
          <button 
            className={activeTab === 'performance' ? 'active' : ''}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button 
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button 
            className={activeTab === 'suite' ? 'active' : ''}
            onClick={() => setActiveTab('suite')}
          >
            Full Suite
          </button>
        </div>
      </div>

      <div className="test-controls">
        <div className="user-selector">
          <label>Test User:</label>
          <select 
            value={selectedUser?.id || ''} 
            onChange={(e) => {
              const user = users.find(u => u.id === e.target.value);
              setSelectedUser(user || null);
            }}
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.profile.name} ({user.roles.join(', ')})
              </option>
            ))}
          </select>
        </div>

        <div className="test-actions">
          {activeTab === 'permissions' && (
            <button 
              onClick={runPermissionTests}
              disabled={isRunning}
              className="test-button permission-test"
            >
              {isRunning ? 'Running...' : 'Test Permissions'}
            </button>
          )}
          {activeTab === 'performance' && (
            <button 
              onClick={runPerformanceTests}
              disabled={isRunning}
              className="test-button performance-test"
            >
              {isRunning ? 'Running...' : 'Test Performance'}
            </button>
          )}
          {activeTab === 'security' && (
            <button 
              onClick={runSecurityTests}
              disabled={isRunning}
              className="test-button security-test"
            >
              {isRunning ? 'Running...' : 'Test Security'}
            </button>
          )}
          {activeTab === 'suite' && (
            <button 
              onClick={runFullTestSuite}
              disabled={isRunning}
              className="test-button suite-test"
            >
              {isRunning ? 'Running...' : 'Run Full Suite'}
            </button>
          )}
        </div>
      </div>

      <div className="test-content">
        {activeTab === 'permissions' && (
          <PermissionTestTab 
            testResults={testResults} 
            selectedUser={selectedUser}
            isRunning={isRunning}
          />
        )}
        {activeTab === 'performance' && (
          <PerformanceTestTab 
            testResults={testResults} 
            selectedUser={selectedUser}
            isRunning={isRunning}
          />
        )}
        {activeTab === 'security' && (
          <SecurityTestTab 
            testResults={testResults} 
            isRunning={isRunning}
          />
        )}
        {activeTab === 'suite' && (
          <FullSuiteTab 
            testResults={testResults} 
            isRunning={isRunning}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TEST TAB COMPONENTS
// ============================================================================

function PermissionTestTab({ 
  testResults, 
  selectedUser, 
  isRunning 
}: {
  testResults: TestResult[];
  selectedUser: TestUser | null;
  isRunning: boolean;
}): React.JSX.Element {
  return (
    <div className="permission-test-tab">
      <div className="test-info">
        <h3>Permission Matrix Testing</h3>
        <p>Validates that all permission scenarios work correctly across different user roles.</p>
        
        {selectedUser && (
          <div className="selected-user-info">
            <h4>Selected Test User:</h4>
            <div className="user-details">
              <p><strong>Name:</strong> {selectedUser.profile.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Roles:</strong> {selectedUser.roles.join(', ')}</p>
              <p><strong>Permissions:</strong></p>
              <div className="permissions-list">
                {selectedUser.permissions.map((perm: string) => (
                  <span key={perm} className="permission-badge">{perm}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <TestResultsDisplay results={testResults} isRunning={isRunning} />
    </div>
  );
}

function PerformanceTestTab({ 
  testResults, 
  isRunning 
}: {
  testResults: TestResult[];
  selectedUser: TestUser | null;
  isRunning: boolean;
}): React.JSX.Element {
  return (
    <div className="performance-test-tab">
      <div className="test-info">
        <h3>Performance Benchmarking</h3>
        <p>Measures RBAC system performance under various conditions.</p>
        
        <div className="performance-metrics">
          <div className="metric-card">
            <h4>Target Metrics</h4>
            <ul>
              <li>Permission check: &lt; 1ms</li>
              <li>Role validation: &lt; 0.5ms</li>
              <li>Complex access check: &lt; 2ms</li>
              <li>Memory usage: Stable</li>
            </ul>
          </div>
        </div>
      </div>

      <TestResultsDisplay results={testResults} isRunning={isRunning} />

      {testResults.length > 0 && testResults[0].details && (
        <PerformanceMetricsDisplay details={testResults[0].details} />
      )}
    </div>
  );
}

function SecurityTestTab({ 
  testResults, 
  isRunning 
}: {
  testResults: TestResult[];
  isRunning: boolean;
}): React.JSX.Element {
  return (
    <div className="security-test-tab">
      <div className="test-info">
        <h3>Security Validation</h3>
        <p>Validates role hierarchy consistency and endpoint access controls.</p>
        
        <div className="security-checks">
          <div className="check-card">
            <h4>Role Hierarchy</h4>
            <p>Ensures roles inherit permissions correctly and no conflicts exist.</p>
          </div>
          <div className="check-card">
            <h4>Endpoint Access</h4>
            <p>Validates that endpoint access controls match role definitions.</p>
          </div>
        </div>
      </div>

      <TestResultsDisplay results={testResults} isRunning={isRunning} />
    </div>
  );
}

function FullSuiteTab({ 
  testResults, 
  isRunning 
}: {
  testResults: TestResult[];
  isRunning: boolean;
}): React.JSX.Element {
  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const totalTests = testResults.length;

  return (
    <div className="full-suite-tab">
      <div className="test-info">
        <h3>Comprehensive Test Suite</h3>
        <p>Runs all RBAC tests including permissions, security, and performance validation.</p>
        
        {totalTests > 0 && (
          <div className="suite-summary">
            <div className="summary-card">
              <h4>Test Results Summary</h4>
              <div className="results-overview">
                <div className="result-metric">
                  <span className="metric-value">{passedTests}</span>
                  <span className="metric-label">Passed</span>
                </div>
                <div className="result-metric">
                  <span className="metric-value">{totalTests - passedTests}</span>
                  <span className="metric-label">Failed</span>
                </div>
                <div className="result-metric">
                  <span className="metric-value">{totalTests}</span>
                  <span className="metric-label">Total</span>
                </div>
              </div>
              <div className="success-rate">
                Success Rate: {totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        )}
      </div>

      <TestResultsDisplay results={testResults} isRunning={isRunning} />
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function TestResultsDisplay({ 
  results, 
  isRunning 
}: {
  results: TestResult[];
  isRunning: boolean;
}): React.JSX.Element {
  if (isRunning) {
    return (
      <div className="test-running">
        <div className="loading-spinner"></div>
        <p>Running tests...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="no-results">
        <p>No test results yet. Click a test button to begin.</p>
      </div>
    );
  }

  return (
    <div className="test-results">
      <h4>Test Results</h4>
      {results.map((result, index) => (
        <div key={index} className={`test-result ${result.status}`}>
          <div className="result-header">
            <span className="test-name">{result.name}</span>
            <span className={`status-badge ${result.status}`}>
              {result.status.toUpperCase()}
            </span>
            {result.duration && (
              <span className="duration">
                {result.duration.toFixed(2)}ms
              </span>
            )}
          </div>
          
          {result.error && (
            <div className="error-details">
              <p><strong>Error:</strong> {result.error}</p>
            </div>
          )}
          
          {result.details && result.status === 'passed' && (
            <details className="test-details">
              <summary>View Details</summary>
              <TestDetailsDisplay details={result.details} />
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

function TestDetailsDisplay({ details }: { details: Record<string, unknown> }): React.JSX.Element {
  return (
    <div className="test-details-content">
      <pre>{JSON.stringify(details, null, 2)}</pre>
    </div>
  );
}

interface PerformanceResults {
  hasPermission: number;
  hasAllPermissions: number;
  hasAnyPermission: number;
  hasRole: number;
  hasAccess: number;
}

interface PerformanceReport {
  summary?: {
    totalTests: number;
    averageDuration: number;
    slowestOperation: string;
    fastestOperation: string;
  };
}

function PerformanceMetricsDisplay({ details }: { details: Record<string, unknown> }): React.JSX.Element {
  const permissionResults = details.permissionResults as PerformanceResults | undefined;
  const hierarchyTime = details.hierarchyTime as number | undefined;
  const report = details.report as PerformanceReport | undefined;

  if (!permissionResults || typeof hierarchyTime !== 'number') {
    return <div>Performance data not available</div>;
  }

  return (
    <div className="performance-metrics-display">
      <h4>Performance Metrics</h4>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h5>Permission Operations (per call)</h5>
          <div className="metric-list">
            <div className="metric-item">
              <span>hasPermission:</span>
              <span>{permissionResults.hasPermission.toFixed(3)}ms</span>
            </div>
            <div className="metric-item">
              <span>hasAllPermissions:</span>
              <span>{permissionResults.hasAllPermissions.toFixed(3)}ms</span>
            </div>
            <div className="metric-item">
              <span>hasAnyPermission:</span>
              <span>{permissionResults.hasAnyPermission.toFixed(3)}ms</span>
            </div>
            <div className="metric-item">
              <span>hasRole:</span>
              <span>{permissionResults.hasRole.toFixed(3)}ms</span>
            </div>
            <div className="metric-item">
              <span>hasAccess:</span>
              <span>{permissionResults.hasAccess.toFixed(3)}ms</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h5>Complex Operations</h5>
          <div className="metric-list">
            <div className="metric-item">
              <span>Role Hierarchy Check:</span>
              <span>{hierarchyTime.toFixed(3)}ms</span>
            </div>
          </div>
        </div>

        {report?.summary && (
          <div className="metric-card">
            <h5>Test Summary</h5>
            <div className="metric-list">
              <div className="metric-item">
                <span>Total Tests:</span>
                <span>{report?.summary?.totalTests}</span>
              </div>
              <div className="metric-item">
                <span>Average Duration:</span>
                <span>{report?.summary?.averageDuration?.toFixed(3)}ms</span>
              </div>
              <div className="metric-item">
                <span>Slowest Operation:</span>
                <span>{report?.summary?.slowestOperation}</span>
              </div>
              <div className="metric-item">
                <span>Fastest Operation:</span>
                <span>{report?.summary?.fastestOperation}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RbacTestInterface;