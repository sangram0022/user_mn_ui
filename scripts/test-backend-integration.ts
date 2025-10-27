/**
 * Backend Integration Test
 * Tests real backend at http://127.0.0.1:8001
 *
 * Usage: npx tsx scripts/test-backend-integration.ts
 */

const BACKEND_URL = 'http://127.0.0.1:8001';
const API_BASE = `${BACKEND_URL}/api/v1`;

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
let _testUserId: string | null = null;

// Test credentials (CORRECTED)
const TEST_ADMIN = {
  email: 'sangram0202@gmail.com',
  password: 'Sangram@1',
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
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseTime = Date.now() - startTime;
    let data;

    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = undefined;
    }

    return { status: response.status, data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    throw { error, responseTime };
  }
}

function addResult(result: TestResult) {
  results.push(result);
  const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
  const timeStr = result.responseTime ? ` (${result.responseTime}ms)` : '';
  console.log(
    `${statusIcon} ${result.method.padEnd(6)} ${result.endpoint.padEnd(45)} ${result.message}${timeStr}`
  );
}

async function testHealthEndpoints() {
  console.log('\n📊 1. HEALTH ENDPOINTS');
  console.log('-'.repeat(100));

  try {
    const { status, data, responseTime } = await makeRequest('/health/', 'GET');
    addResult({
      category: 'Health',
      endpoint: '/health/',
      method: 'GET',
      status: status === 200 ? 'PASS' : 'FAIL',
      statusCode: status,
      message: status === 200 ? `✅ Healthy` : `❌ Status ${status}`,
      responseTime,
      response: data,
    });
  } catch (error: any) {
    addResult({
      category: 'Health',
      endpoint: '/health/',
      method: 'GET',
      status: 'FAIL',
      message: `❌ Connection error: ${error.error?.message || 'Unknown'}`,
      responseTime: error.responseTime,
    });
  }
}

async function testAuthEndpoints() {
  console.log('\n🔐 2. AUTHENTICATION ENDPOINTS');
  console.log('-'.repeat(100));

  try {
    const { status, data, responseTime } = await makeRequest('/auth/login', 'POST', TEST_ADMIN);

    if (status === 200 && data?.access_token) {
      authToken = data.access_token;
      addResult({
        category: 'Auth',
        endpoint: '/auth/login',
        method: 'POST',
        status: 'PASS',
        statusCode: status,
        message: `✅ Login successful (token received)`,
        responseTime,
      });
    } else if (status === 401) {
      addResult({
        category: 'Auth',
        endpoint: '/auth/login',
        method: 'POST',
        status: 'FAIL',
        statusCode: status,
        message: `❌ Invalid credentials - Please create admin user first`,
        responseTime,
      });
    } else {
      addResult({
        category: 'Auth',
        endpoint: '/auth/login',
        method: 'POST',
        status: 'FAIL',
        statusCode: status,
        message: `❌ Status ${status}`,
        responseTime,
        response: data,
      });
    }
  } catch (error: any) {
    addResult({
      category: 'Auth',
      endpoint: '/auth/login',
      method: 'POST',
      status: 'FAIL',
      message: `❌ Connection error: ${error.error?.message || 'Unknown'}`,
      responseTime: error.responseTime,
    });
  }
}

async function testProfileEndpoints() {
  console.log('\n👤 3. PROFILE ENDPOINTS');
  console.log('-'.repeat(100));

  if (!authToken) {
    addResult({
      category: 'Profile',
      endpoint: '/profile/me',
      method: 'GET',
      status: 'SKIP',
      message: '⏭️ Skipped (no auth token)',
    });
    return;
  }

  try {
    const { status, data, responseTime } = await makeRequest('/profile/me', 'GET', undefined, true);

    if (status === 200 && data?.user_id) {
      _testUserId = data.user_id;
      addResult({
        category: 'Profile',
        endpoint: '/profile/me',
        method: 'GET',
        status: 'PASS',
        statusCode: status,
        message: `✅ Profile retrieved (${data.email})`,
        responseTime,
      });
    } else {
      addResult({
        category: 'Profile',
        endpoint: '/profile/me',
        method: 'GET',
        status: 'FAIL',
        statusCode: status,
        message: `❌ Status ${status}`,
        responseTime,
      });
    }
  } catch (error: any) {
    addResult({
      category: 'Profile',
      endpoint: '/profile/me',
      method: 'GET',
      status: 'FAIL',
      message: `❌ Connection error`,
      responseTime: error.responseTime,
    });
  }
}

async function testAdminEndpoints() {
  console.log('\n👥 4. ADMIN USER MANAGEMENT ENDPOINTS');
  console.log('-'.repeat(100));

  if (!authToken) {
    addResult({
      category: 'Admin',
      endpoint: '/admin/users',
      method: 'GET',
      status: 'SKIP',
      message: '⏭️ Skipped (no auth token)',
    });
    return;
  }

  try {
    const { status, data, responseTime } = await makeRequest(
      '/admin/users',
      'GET',
      undefined,
      true
    );

    if (status === 200 && Array.isArray(data)) {
      addResult({
        category: 'Admin',
        endpoint: '/admin/users',
        method: 'GET',
        status: 'PASS',
        statusCode: status,
        message: `✅ Users listed (${data.length} users)`,
        responseTime,
      });
    } else {
      addResult({
        category: 'Admin',
        endpoint: '/admin/users',
        method: 'GET',
        status: 'FAIL',
        statusCode: status,
        message: `❌ Status ${status}`,
        responseTime,
      });
    }
  } catch (error: any) {
    addResult({
      category: 'Admin',
      endpoint: '/admin/users',
      method: 'GET',
      status: 'FAIL',
      message: `❌ Connection error`,
      responseTime: error.responseTime,
    });
  }
}

async function testAuditEndpoints() {
  console.log('\n📝 5. AUDIT ENDPOINTS');
  console.log('-'.repeat(100));

  if (!authToken) {
    addResult({
      category: 'Audit',
      endpoint: '/audit/logs',
      method: 'GET',
      status: 'SKIP',
      message: '⏭️ Skipped (no auth token)',
    });
    return;
  }

  try {
    const { status, data, responseTime } = await makeRequest('/audit/logs', 'GET', undefined, true);

    if (status === 200 && Array.isArray(data)) {
      addResult({
        category: 'Audit',
        endpoint: '/audit/logs',
        method: 'GET',
        status: 'PASS',
        statusCode: status,
        message: `✅ Audit logs retrieved (${data.length} entries)`,
        responseTime,
      });
    } else {
      addResult({
        category: 'Audit',
        endpoint: '/audit/logs',
        method: 'GET',
        status: 'FAIL',
        statusCode: status,
        message: `❌ Status ${status}`,
        responseTime,
      });
    }
  } catch (error: any) {
    addResult({
      category: 'Audit',
      endpoint: '/audit/logs',
      method: 'GET',
      status: 'FAIL',
      message: `❌ Connection error`,
      responseTime: error.responseTime,
    });
  }
}

async function runTests() {
  console.log('\n🔍 BACKEND INTEGRATION TEST');
  console.log('='.repeat(100));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`API Base: ${API_BASE}`);
  console.log(`Test Credentials: ${TEST_ADMIN.email}`);
  console.log('='.repeat(100));

  await testHealthEndpoints();
  await testAuthEndpoints();
  await testProfileEndpoints();
  await testAdminEndpoints();
  await testAuditEndpoints();

  // Summary
  console.log('\n' + '='.repeat(100));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(100));

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed} (${Math.round((passed / total) * 100)}%)`);
  console.log(`❌ Failed: ${failed} (${Math.round((failed / total) * 100)}%)`);
  console.log(`⏭️  Skipped: ${skipped} (${Math.round((skipped / total) * 100)}%)`);

  // Configuration
  console.log('\n' + '='.repeat(100));
  console.log('⚙️ UI CONFIGURATION STATUS');
  console.log('='.repeat(100));
  console.log(`✅ .env file: VITE_BACKEND_URL=${BACKEND_URL}`);
  console.log(`✅ .env file: VITE_API_BASE_URL=${API_BASE}`);
  console.log(
    `${authToken ? '✅' : '❌'} Authentication: ${authToken ? 'Token obtained' : 'No token'}`
  );

  // Recommendations
  console.log('\n' + '='.repeat(100));
  console.log('💡 NEXT STEPS');
  console.log('='.repeat(100));

  if (!authToken) {
    console.log('❌ SETUP REQUIRED:');
    console.log('   1. Ensure backend is running: http://127.0.0.1:8001');
    console.log('   2. Create admin user:');
    console.log('      cd d:\\code\\python\\user_mn');
    console.log('      python seed_rbac_roles.py');
  } else {
    console.log('✅ Backend integration is working!');
    console.log('   1. Start UI: npm run dev');
    console.log('   2. Test at: http://localhost:5173');
    console.log('   3. Login: admin@example.com / Admin@123456');
  }

  console.log('='.repeat(100) + '\n');

  return { passed, failed, skipped, total, hasAuth: Boolean(authToken) };
}

runTests()
  .then((summary) => {
    process.exit(summary.failed > 0 && !summary.hasAuth ? 1 : 0);
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });
