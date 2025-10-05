// Test script to verify login functionality with the backend
// Run with: node test-login.js

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Test user credentials - register first if needed
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  terms_accepted: true
};

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    console.log(`\n${options.method || 'GET'} ${url}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      return { response, data };
    } else {
      const text = await response.text();
      console.log('Response (text):', text);
      return { response, data: text };
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return { error };
  }
}

async function testBackendConnection() {
  console.log('🔗 Testing backend connection...');
  
  // Test if backend is running
  try {
    const { response } = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'OPTIONS'
    });
    
    if (response && response.status === 200) {
      console.log('✅ Backend is running and CORS is configured');
      return true;
    } else {
      console.log('❌ Backend connection failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n📝 Testing user registration...');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(TEST_USER)
  });

  if (error) {
    console.log('❌ Registration request failed');
    return false;
  }

  if (response.status === 200) {
    console.log('✅ User registered successfully');
    return true;
  } else if (response.status === 400 && data?.detail?.includes('already exists')) {
    console.log('ℹ️ User already exists, proceeding with login test');
    return true;
  } else {
    console.log('❌ Registration failed:', data);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🔐 Testing user login...');
  
  const loginData = {
    email: TEST_USER.email,
    password: TEST_USER.password
  };

  const { response, data, error } = await makeRequest(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(loginData)
  });

  if (error) {
    console.log('❌ Login request failed');
    return null;
  }

  if (response.status === 200 && data.access_token) {
    console.log('✅ Login successful!');
    console.log('Access Token:', data.access_token.substring(0, 20) + '...');
    console.log('User:', data.user);
    return data.access_token;
  } else {
    console.log('❌ Login failed:', data);
    return null;
  }
}

async function testAuthenticatedRequest(token) {
  console.log('\n👤 Testing authenticated request...');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (error) {
    console.log('❌ Authenticated request failed');
    return false;
  }

  if (response.status === 200) {
    console.log('✅ Authenticated request successful');
    console.log('User profile:', data);
    return true;
  } else {
    console.log('❌ Authenticated request failed:', data);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Starting Backend Authentication Tests\n');
  console.log('=' * 50);

  // Test 1: Backend connection
  const connectionOk = await testBackendConnection();
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed - backend is not accessible');
    console.log('Make sure the Python FastAPI server is running on http://127.0.0.1:8000');
    return;
  }

  // Test 2: User registration (or check if user exists)
  const registrationOk = await testUserRegistration();
  if (!registrationOk) {
    console.log('\n❌ Cannot proceed - user registration failed');
    return;
  }

  // Test 3: User login
  const token = await testUserLogin();
  if (!token) {
    console.log('\n❌ Cannot proceed - login failed');
    return;
  }

  // Test 4: Authenticated request
  const authOk = await testAuthenticatedRequest(token);
  
  console.log('\n' + '=' * 50);
  if (authOk) {
    console.log('🎉 All tests passed! The backend authentication is working correctly.');
    console.log('\nYou can now use these credentials in the frontend:');
    console.log(`Email: ${TEST_USER.email}`);
    console.log(`Password: ${TEST_USER.password}`);
  } else {
    console.log('❌ Some tests failed. Check the backend logs for more details.');
  }
}

// Handle both Node.js environments
if (typeof fetch === 'undefined') {
  // Node.js < 18 or no fetch available
  console.log('This script requires Node.js 18+ with fetch support, or you can run it in a browser console.');
  console.log('Alternatively, install node-fetch: npm install node-fetch');
} else {
  // Run the tests
  runAllTests().catch(console.error);
}
