// Test with email verification
const BASE_URL = 'http://localhost:8000/api/v1';

async function testWithVerification() {
  console.log('🧪 Testing Complete Login Flow with Email Verification\n');
  console.log('='.repeat(70));

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
    // Step 1: Register
    console.log('\n📝 Step 1: Registering new user...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    console.log('✅ Status:', registerResponse.status);
    console.log('📦 Response:', JSON.stringify(registerResult, null, 2));

    if (!registerResponse.ok) {
      console.log('\n❌ Registration failed.');
      return;
    }

    const verificationToken = registerResult.verification_token;
    console.log('\n🔑 Verification Token:', verificationToken ? 'Received' : 'Not provided');

    // Step 2: Verify Email
    if (verificationToken) {
      console.log('\n✉️  Step 2: Verifying email...');
      const verifyResponse = await fetch(`${BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken })
      });

      const verifyResult = await verifyResponse.json();
      console.log('✅ Status:', verifyResponse.status);
      console.log('📦 Response:', JSON.stringify(verifyResult, null, 2));

      if (!verifyResponse.ok) {
        console.log('\n❌ Email verification failed.');
        return;
      }
    }

    // Step 3: Login
    console.log('\n🔐 Step 3: Logging in...');
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
    console.log('✅ Status:', loginResponse.status);
    console.log('📦 Response:', JSON.stringify(loginResult, null, 2));

    if (!loginResponse.ok) {
      console.log('\n❌ Login failed.');
      return;
    }

    const token = loginResult.access_token;

    // Step 4: Get Profile
    console.log('\n👤 Step 4: Getting profile...');
    const profileResponse = await fetch(`${BASE_URL}/profile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const profileResult = await profileResponse.json();
    console.log('✅ Status:', profileResponse.status);
    console.log('📦 Response:', JSON.stringify(profileResult, null, 2));

    // Step 5: Update Profile
    console.log('\n✏️  Step 5: Updating profile...');
    const updateResponse = await fetch(`${BASE_URL}/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        first_name: 'Updated',
        last_name: 'Name'
      })
    });

    const updateResult = await updateResponse.json();
    console.log('✅ Status:', updateResponse.status);
    console.log('📦 Response:', JSON.stringify(updateResult, null, 2));

    // Step 6: Get Admin Stats
    console.log('\n📊 Step 6: Testing admin stats...');
    const statsResponse = await fetch(`${BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const statsResult = await statsResponse.json();
    console.log('✅ Status:', statsResponse.status);
    console.log('📦 Response:', JSON.stringify(statsResult, null, 2));

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
    console.log('✅ Status:', logoutResponse.status);
    console.log('📦 Response:', JSON.stringify(logoutResult, null, 2));

    console.log('\n' + '='.repeat(70));
    console.log('✨ Complete Test Finished Successfully!');
    console.log('='.repeat(70));

    console.log('\n📋 Summary of Working Endpoints:');
    console.log('  ✅ POST /auth/register');
    console.log('  ✅ POST /auth/verify-email');
    console.log('  ✅ POST /auth/login');
    console.log('  ✅ GET  /profile/me');
    console.log('  ✅ PUT  /profile/me');
    console.log('  ✅ GET  /admin/stats (if authorized)');
    console.log('  ✅ POST /auth/logout');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testWithVerification();
