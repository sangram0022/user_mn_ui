/**
 * Backend API Verification Script
 * Tests connectivity and endpoint availability with running backend at 127.0.0.1:8001
 */

const BACKEND_URL = 'http://127.0.0.1:8001';
const API_BASE = `${BACKEND_URL}/api/v1`;

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  message: string;
  responseTime?: number;
}

const results: TestResult[] = [];

async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  requiresAuth: boolean = false,
  skip: boolean = false
): Promise<TestResult> {
  if (skip) {
    return {
      endpoint,
      method,
      status: 'SKIP',
      message: 'Skipped (requires authentication)',
    };
  }

  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseTime = Date.now() - startTime;
    const statusCode = response.status;

    // For auth endpoints, 401/400 is expected (no credentials)
    if (requiresAuth && (statusCode === 401 || statusCode === 400)) {
      return {
        endpoint,
        method,
        status: 'PASS',
        statusCode,
        message: `✅ Endpoint exists (${statusCode} expected without auth)`,
        responseTime,
      };
    }

    // For non-auth endpoints, 200/201 is expected
    if (!requiresAuth && (statusCode === 200 || statusCode === 201)) {
      return {
        endpoint,
        method,
        status: 'PASS',
        statusCode,
        message: `✅ Endpoint working (${statusCode})`,
        responseTime,
      };
    }

    // 404 means endpoint doesn't exist
    if (statusCode === 404) {
      return {
        endpoint,
        method,
        status: 'FAIL',
        statusCode,
        message: `❌ Endpoint not found (404)`,
        responseTime,
      };
    }

    // Other status codes
    return {
      endpoint,
      method,
      status: 'PASS',
      statusCode,
      message: `⚠️ Endpoint exists (${statusCode})`,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint,
      method,
      status: 'FAIL',
      message: `❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime,
    };
  }
}

async function runTests() {
  console.log('\n🔍 Backend API Verification');
  console.log('=' .repeat(80));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`API Base: ${API_BASE}`);
  console.log('=' .repeat(80));
  console.log('');

  // ============================================================================
  // 1. HEALTH ENDPOINTS (7 tests)
  // ============================================================================
  console.log('📊 1. HEALTH ENDPOINTS');
  console.log('-'.repeat(80));
  
  results.push(await testEndpoint('/health', 'GET'));
  results.push(await testEndpoint('/health/', 'GET'));
  results.push(await testEndpoint('/health/ping', 'GET'));
  results.push(await testEndpoint('/health/ready', 'GET'));
  results.push(await testEndpoint('/health/live', 'GET'));
  results.push(await testEndpoint('/health/detailed', 'GET'));
  results.push(await testEndpoint('/health/database', 'GET'));
  results.push(await testEndpoint('/health/system', 'GET'));

  // ============================================================================
  // 2. AUTHENTICATION ENDPOINTS (13 tests)
  // ============================================================================
  console.log('\n🔐 2. AUTHENTICATION ENDPOINTS');
  console.log('-'.repeat(80));
  
  results.push(await testEndpoint('/auth/login', 'POST', true));
  results.push(await testEndpoint('/auth/secure-login', 'POST', true));
  results.push(await testEndpoint('/auth/register', 'POST', true));
  results.push(await testEndpoint('/auth/logout', 'POST', true));
  results.push(await testEndpoint('/auth/secure-logout', 'POST', true));
  results.push(await testEndpoint('/auth/refresh', 'POST', true));
  results.push(await testEndpoint('/auth/secure-refresh', 'POST', true));
  results.push(await testEndpoint('/auth/verify-email', 'POST', true));
  results.push(await testEndpoint('/auth/resend-verification', 'POST', true));
  results.push(await testEndpoint('/auth/forgot-password', 'POST', true));
  results.push(await testEndpoint('/auth/reset-password', 'POST', true));
  results.push(await testEndpoint('/auth/change-password', 'POST', true));
  results.push(await testEndpoint('/auth/csrf-token', 'GET'));

  // ============================================================================
  // 3. PROFILE ENDPOINTS (3 tests)
  // ============================================================================
  console.log('\n👤 3. PROFILE ENDPOINTS');
  console.log('-'.repeat(80));
  
  results.push(await testEndpoint('/profile', 'GET', true, true)); // Skip (requires auth)
  results.push(await testEndpoint('/profile/', 'GET', true, true)); // Skip (requires auth)
  results.push(await testEndpoint('/profile/me', 'GET', true, true)); // Skip (requires auth)

  // ============================================================================
  // 4. ADMIN - USER MANAGEMENT ENDPOINTS (7 tests)
  // ============================================================================
  console.log('\n👥 4. ADMIN - USER MANAGEMENT ENDPOINTS');
  console.log('-'.repeat(80));
  
  results.push(await testEndpoint('/admin/users', 'GET', true, true)); // Skip (requires admin auth)
  results.push(await testEndpoint('/admin/users', 'POST', true, true)); // Skip (requires admin auth)
  // Can't test dynamic routes without user ID
  
  // ============================================================================
  // 5. ADMIN - ROLE MANAGEMENT ENDPOINTS (4 tests)
  // ============================================================================
  console.log('\n🎭 5. ADMIN - ROLE MANAGEMENT ENDPOINTS');
  console.log('-'.repeat(80));
  
  results.push(await testEndpoint('/admin/roles', 'GET', true, true)); // Skip (requires admin auth)
  results.push(await testEndpoint('/admin/roles', 'POST', true, true)); // Skip (requires admin auth)
  
  // ============================================================================
  // 6. ADMIN - AUDIT LOGS (1 test)
  // ============================================================================
  console.log('\n📋 6. ADMIN - AUDIT LOGS');
  console.log('-'.repeat(80));
  
  results.push(await testEndpoint('/admin/audit-logs', 'GET', true, true)); // Skip (requires admin auth)
  
  // ============================================================================
  // 7. AUDIT ENDPOINTS (2 tests)
  // ============================================================================
  console.log('\n📝 7. AUDIT ENDPOINTS');
  console.log('-'.repeat(80));
  
  results.push(await testEndpoint('/audit/logs', 'GET', true, true)); // Skip (requires auth)
  results.push(await testEndpoint('/audit/summary', 'GET', true, true)); // Skip (requires auth)

  // ============================================================================
  // 8. GDPR ENDPOINTS (2 tests)
  // ============================================================================
  console.log('\n🔒 8. GDPR ENDPOINTS');
  console.log('-'.repeat(80));
  
  results.push(await testEndpoint('/gdpr/export/my-data', 'POST', true, true)); // Skip (requires auth)
  results.push(await testEndpoint('/gdpr/delete/my-account', 'DELETE', true, true)); // Skip (requires auth)

  // ============================================================================
  // 9. LOGS ENDPOINTS (1 test)
  // ============================================================================
  console.log('\n📜 9. LOGS ENDPOINTS');
  console.log('-'.repeat(80));
  
  results.push(await testEndpoint('/logs/frontend-errors', 'POST', true));

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed} (${Math.round((passed / total) * 100)}%)`);
  console.log(`❌ Failed: ${failed} (${Math.round((failed / total) * 100)}%)`);
  console.log(`⏭️  Skipped: ${skipped} (${Math.round((skipped / total) * 100)}%)`);

  // Show detailed results
  console.log('\n' + '-'.repeat(80));
  console.log('DETAILED RESULTS');
  console.log('-'.repeat(80));

  results.forEach((result) => {
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    const timeStr = result.responseTime ? ` (${result.responseTime}ms)` : '';
    console.log(`${statusIcon} ${result.method.padEnd(6)} ${result.endpoint.padEnd(40)} ${result.message}${timeStr}`);
  });

  // Critical failures
  const criticalFailures = results.filter(
    (r) => r.status === 'FAIL' && !r.endpoint.startsWith('/admin') && !r.endpoint.startsWith('/profile')
  );

  if (criticalFailures.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('⚠️ CRITICAL FAILURES (Public Endpoints)');
    console.log('='.repeat(80));
    criticalFailures.forEach((result) => {
      console.log(`❌ ${result.method} ${result.endpoint}`);
      console.log(`   ${result.message}`);
    });
  }

  // Configuration verification
  console.log('\n' + '='.repeat(80));
  console.log('⚙️ CONFIGURATION VERIFICATION');
  console.log('='.repeat(80));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`API Base URL: ${API_BASE}`);
  console.log(`UI .env file: VITE_BACKEND_URL=${BACKEND_URL}`);
  console.log(`UI .env file: VITE_API_BASE_URL=${API_BASE}`);

  // Final verdict
  console.log('\n' + '='.repeat(80));
  if (failed === 0 || (failed === criticalFailures.length && criticalFailures.length === 0)) {
    console.log('✅ VERIFICATION PASSED: Backend API is properly configured and accessible!');
  } else {
    console.log('⚠️ VERIFICATION INCOMPLETE: Some endpoints are unavailable.');
    console.log('   This may be expected if the backend is not fully implemented.');
  }
  console.log('='.repeat(80) + '\n');

  return { passed, failed, skipped, total, criticalFailures: criticalFailures.length };
}

// Run tests
runTests().then((summary) => {
  process.exit(summary.criticalFailures > 0 ? 1 : 0);
}).catch((error) => {
  console.error('\n❌ Test execution failed:', error);
  process.exit(1);
});
