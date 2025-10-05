// Comprehensive API Endpoint Testing Script
// Tests all backend endpoints at http://localhost:8000/api/v1

const BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to make requests
async function testEndpoint(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`\n🔍 Testing: ${method} ${url}`);
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    let responseData;
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`📦 Response:`, JSON.stringify(responseData, null, 2).substring(0, 500));
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData,
      response: response
    };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test all endpoints
async function testAllEndpoints() {
  console.log('🚀 Starting API Endpoint Testing...\n');
  console.log('=' .repeat(60));
  
  let testToken = null;
  let testUserId = null;

  // 1. Test Root Endpoint
  console.log('\n📍 GROUP: Root Endpoints');
  console.log('─'.repeat(60));
  await testEndpoint('GET', '/');

  // 2. Test Health Endpoints
  console.log('\n📍 GROUP: Health Endpoints');
  console.log('─'.repeat(60));
  await testEndpoint('GET', '/health');
  await testEndpoint('GET', '/health/');
  await testEndpoint('GET', '/auth/health');
  await testEndpoint('GET', '/admin/health');

  // 3. Test Authentication Endpoints
  console.log('\n📍 GROUP: Authentication Endpoints');
  console.log('─'.repeat(60));
  
  // Register
  const registerData = {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    full_name: 'Test User',
    username: `testuser_${Date.now()}`
  };
  const registerResult = await testEndpoint('POST', '/auth/register', registerData);
  
  // Login
  const loginData = {
    email: registerData.email,
    password: registerData.password
  };
  const loginResult = await testEndpoint('POST', '/auth/login', loginData);
  
  if (loginResult.success && loginResult.data.access_token) {
    testToken = loginResult.data.access_token;
    console.log('🔑 Token obtained for authenticated tests');
  }

  // Auth Me
  await testEndpoint('GET', '/auth/me', null, testToken);
  
  // Token Refresh (if endpoint exists)
  await testEndpoint('POST', '/auth/refresh', null, testToken);

  // 4. Test Profile Endpoints
  console.log('\n📍 GROUP: Profile Endpoints');
  console.log('─'.repeat(60));
  
  const profileResult = await testEndpoint('GET', '/profile/me', null, testToken);
  if (profileResult.success && profileResult.data.id) {
    testUserId = profileResult.data.id;
  }
  
  // Update Profile
  const updateProfileData = {
    full_name: 'Updated Test User'
  };
  await testEndpoint('PUT', '/profile/me', updateProfileData, testToken);
  await testEndpoint('PATCH', '/profile/me', updateProfileData, testToken);

  // 5. Test User Endpoints
  console.log('\n📍 GROUP: User Endpoints');
  console.log('─'.repeat(60));
  await testEndpoint('GET', '/users/me', null, testToken);
  
  if (testUserId) {
    await testEndpoint('GET', `/users/${testUserId}`, null, testToken);
  }
  
  // Password Reset Request
  await testEndpoint('POST', '/users/password-reset/request', { email: registerData.email });
  await testEndpoint('POST', '/auth/password-reset-request', { email: registerData.email });
  
  // Change Password
  const changePasswordData = {
    old_password: registerData.password,
    new_password: 'NewPassword123!'
  };
  await testEndpoint('POST', '/users/change-password', changePasswordData, testToken);

  // 6. Test Admin Endpoints
  console.log('\n📍 GROUP: Admin Endpoints');
  console.log('─'.repeat(60));
  
  // Get all users
  await testEndpoint('GET', '/admin/users', null, testToken);
  await testEndpoint('GET', '/admin/users?page=1&page_size=10', null, testToken);
  
  // Get specific user
  if (testUserId) {
    await testEndpoint('GET', `/admin/users/${testUserId}`, null, testToken);
  }
  
  // Create user (admin)
  const createUserData = {
    email: `admin_test_${Date.now()}@example.com`,
    password: 'AdminTest123!',
    full_name: 'Admin Test User',
    username: `admintest_${Date.now()}`,
    role: 'user'
  };
  const createResult = await testEndpoint('POST', '/admin/users', createUserData, testToken);
  
  // Update user (admin)
  if (createResult.success && createResult.data.id) {
    const updateUserData = {
      full_name: 'Updated Admin Test User',
      is_active: true
    };
    await testEndpoint('PUT', `/admin/users/${createResult.data.id}`, updateUserData, testToken);
    
    // Delete user
    await testEndpoint('DELETE', `/admin/users/${createResult.data.id}`, null, testToken);
  }
  
  // Admin stats
  await testEndpoint('GET', '/admin/stats', null, testToken);

  // 7. Test Audit Endpoints
  console.log('\n📍 GROUP: Audit Endpoints');
  console.log('─'.repeat(60));
  
  await testEndpoint('GET', '/audit/logs', null, testToken);
  await testEndpoint('GET', '/audit/logs?page=1&page_size=10', null, testToken);
  await testEndpoint('GET', '/audit/summary', null, testToken);
  
  if (testUserId) {
    await testEndpoint('GET', `/audit/logs?user_id=${testUserId}`, null, testToken);
  }

  // 8. Test Logout
  console.log('\n📍 GROUP: Logout');
  console.log('─'.repeat(60));
  await testEndpoint('POST', '/auth/logout', null, testToken);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✨ API Endpoint Testing Complete!');
  console.log('='.repeat(60));
  console.log('\n📝 Review the results above to identify:');
  console.log('  - Working endpoints (200-299 status)');
  console.log('  - Missing endpoints (404 status)');
  console.log('  - Authorization issues (401/403 status)');
  console.log('  - Server errors (500+ status)');
}

// Run the tests
testAllEndpoints().catch(console.error);
