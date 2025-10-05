// Debug Login Issue - Run this in the browser console
// Make sure the Python backend is running on http://127.0.0.1:8000

const DEBUG_USER = {
  email: 'debug@example.com',
  password: 'DebugPassword123!',
  first_name: 'Debug',
  last_name: 'User',
  username: 'debuguser',
  terms_accepted: true
};

async function debugLoginIssue() {
  const baseUrl = 'http://127.0.0.1:8000/api/v1';
  
  console.log('🐛 Starting login debug session...\n');
  
  // Step 1: Register a fresh user
  console.log('1️⃣ Registering fresh debug user...');
  try {
    const regResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEBUG_USER)
    });
    
    const regData = await regResponse.json();
    console.log('Registration response:', regData);
    
    if (!regResponse.ok && !regData.detail?.includes('already exists')) {
      console.log('❌ Registration failed unexpectedly');
      return;
    }
    
    console.log('✅ User registration OK (new or existing)');
  } catch (error) {
    console.log('❌ Registration request failed:', error);
    return;
  }
  
  // Step 2: Try immediate login
  console.log('\n2️⃣ Testing immediate login...');
  try {
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEBUG_USER.email,
        password: DEBUG_USER.password
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('Token preview:', loginData.access_token?.substring(0, 30) + '...');
      
      // Test authenticated request
      const profileResponse = await fetch(`${baseUrl}/users/me`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${loginData.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Authenticated request successful');
        console.log('Profile data:', profileData);
      } else {
        console.log('❌ Authenticated request failed');
      }
    } else {
      console.log('❌ Login failed:', loginData);
      console.log('\n🔍 Debugging suggestions:');
      console.log('1. Check if password hashing is consistent between registration and login');
      console.log('2. Verify the user exists in the database');
      console.log('3. Check if user account is active');
      console.log('4. Examine backend logs for authentication errors');
    }
  } catch (error) {
    console.log('❌ Login request failed:', error);
  }
  
  // Step 3: Test with a known good user if the above fails
  console.log('\n3️⃣ Testing with the previous test user...');
  try {
    const testLoginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!'
      })
    });
    
    const testLoginData = await testLoginResponse.json();
    console.log('Test user login response:', testLoginData);
    
    if (testLoginResponse.ok) {
      console.log('✅ Previous test user can login successfully');
    } else {
      console.log('❌ Previous test user also fails to login');
    }
  } catch (error) {
    console.log('❌ Test user login request failed:', error);
  }
  
  console.log('\n📊 Debug Summary:');
  console.log('- If registration works but login fails: Check password hashing logic');
  console.log('- If all logins fail: Check authentication service');
  console.log('- If authenticated requests fail: Check JWT token generation');
}

// Declare the function on window for debugging
declare global {
  interface Window {
    debugLoginIssue: () => void;
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.debugLoginIssue = debugLoginIssue;
  console.log('Debug function loaded! Run: debugLoginIssue()');
}

export { debugLoginIssue };
