// Test login with proper registration first
// Run this with: node test-login-flow.js

const BASE_URL = 'http://localhost:8000/api/v1';

async function testLoginFlow() {
  console.log('🧪 Testing Complete Login Flow\n');
  console.log('='.repeat(60));

  // Step 1: Register a new user
  console.log('\n📝 Step 1: Registering new user...');
  const timestamp = Date.now();
  const registerData = {
    email: `testuser_${timestamp}@example.com`,
    password: 'TestPassword123!',
    confirm_password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
    username: `testuser_${timestamp}`
  };

  try {
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    console.log('✅ Registration Status:', registerResponse.status);
    console.log('📦 Registration Response:', JSON.stringify(registerResult, null, 2));

    if (!registerResponse.ok) {
      console.log('\n❌ Registration failed. Check the response above for details.');
      return;
    }

    // Step 2: Login with the registered user
    console.log('\n🔐 Step 2: Logging in...');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    console.log('✅ Login Status:', loginResponse.status);
    console.log('📦 Login Response:', JSON.stringify(loginResult, null, 2));

    if (!loginResponse.ok) {
      console.log('\n❌ Login failed. Check the response above for details.');
      return;
    }

    const token = loginResult.access_token;
    console.log('\n🔑 Access Token received:', token ? 'Yes' : 'No');

    // Step 3: Get user profile
    console.log('\n👤 Step 3: Getting user profile...');
    const profileResponse = await fetch(`${BASE_URL}/profile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const profileResult = await profileResponse.json();
    console.log('✅ Profile Status:', profileResponse.status);
    console.log('📦 Profile Response:', JSON.stringify(profileResult, null, 2));

    // Step 4: Update profile
    console.log('\n✏️  Step 4: Updating profile...');
    const updateData = {
      first_name: 'Updated',
      last_name: 'Name',
      phone_number: '+1234567890'
    };

    const updateResponse = await fetch(`${BASE_URL}/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    console.log('✅ Update Status:', updateResponse.status);
    console.log('📦 Update Response:', JSON.stringify(updateResult, null, 2));

    // Step 5: Get admin users (should work if user is admin, otherwise 403)
    console.log('\n👥 Step 5: Testing admin endpoint (may be forbidden)...');
    const usersResponse = await fetch(`${BASE_URL}/admin/users?page=1&page_size=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const usersResult = await usersResponse.json();
    console.log('✅ Admin Users Status:', usersResponse.status);
    console.log('📦 Admin Users Response:', JSON.stringify(usersResult, null, 2).substring(0, 500));

    // Step 6: Get audit logs (should work if user is admin, otherwise 403)
    console.log('\n📋 Step 6: Testing audit endpoint (may be forbidden)...');
    const auditResponse = await fetch(`${BASE_URL}/audit/logs?page=1&page_size=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const auditResult = await auditResponse.json();
    console.log('✅ Audit Logs Status:', auditResponse.status);
    console.log('📦 Audit Logs Response:', JSON.stringify(auditResult, null, 2).substring(0, 500));

    // Step 7: Logout
    console.log('\n🚪 Step 7: Logging out...');
    const logoutResponse = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const logoutResult = await logoutResponse.json();
    console.log('✅ Logout Status:', logoutResponse.status);
    console.log('📦 Logout Response:', JSON.stringify(logoutResult, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✨ Login Flow Test Complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
  }
}

testLoginFlow();
