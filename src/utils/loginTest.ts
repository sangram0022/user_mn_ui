// Login Test Script - TypeScript version
// This can be run from the browser console or as a standalone script

interface TestUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
  terms_accepted: boolean;
}

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Test user credentials
const TEST_USER: TestUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  terms_accepted: true
};

class BackendTester {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      console.log(`\n${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
      } else {
        data = await response.text();
        console.log('Response (text):', data);
      }

      return { response, data, success: response.ok };
    } catch (error) {
      console.error('Request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async testConnection(): Promise<boolean> {
    console.log('🔗 Testing backend connection...');
    
    const result = await this.makeRequest('/auth/login', { method: 'OPTIONS' });
    
    if (result.response?.ok) {
      console.log('✅ Backend is running and CORS is configured');
      return true;
    } else {
      console.log('❌ Backend connection failed');
      return false;
    }
  }

  async testRegistration(): Promise<boolean> {
    console.log('\n📝 Testing user registration...');
    
    const result = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(TEST_USER)
    });

    if (result.error) {
      console.log('❌ Registration request failed:', result.error);
      return false;
    }

    if (result.success) {
      console.log('✅ User registered successfully');
      return true;
    } else if (result.data?.detail?.includes('already exists')) {
      console.log('ℹ️ User already exists, proceeding with login test');
      return true;
    } else {
      console.log('❌ Registration failed:', result.data);
      return false;
    }
  }

  async testLogin(): Promise<string | null> {
    console.log('\n🔐 Testing user login...');
    
    const loginData = {
      email: TEST_USER.email,
      password: TEST_USER.password
    };

    const result = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData)
    });

    if (result.error) {
      console.log('❌ Login request failed:', result.error);
      return null;
    }

    if (result.success && result.data?.access_token) {
      console.log('✅ Login successful!');
      console.log('Access Token:', result.data.access_token.substring(0, 20) + '...');
      console.log('User:', result.data.user);
      return result.data.access_token;
    } else {
      console.log('❌ Login failed:', result.data);
      return null;
    }
  }

  async testAuthenticatedRequest(token: string): Promise<boolean> {
    console.log('\n👤 Testing authenticated request...');
    
    const result = await this.makeRequest('/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (result.error) {
      console.log('❌ Authenticated request failed:', result.error);
      return false;
    }

    if (result.success) {
      console.log('✅ Authenticated request successful');
      console.log('User profile:', result.data);
      return true;
    } else {
      console.log('❌ Authenticated request failed:', result.data);
      return false;
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Backend Authentication Tests\n');
    console.log('='.repeat(50));

    // Test 1: Backend connection
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      console.log('\n❌ Cannot proceed - backend is not accessible');
      console.log('Make sure the Python FastAPI server is running on http://127.0.0.1:8000');
      return;
    }

    // Test 2: User registration
    const registrationOk = await this.testRegistration();
    if (!registrationOk) {
      console.log('\n❌ Cannot proceed - user registration failed');
      return;
    }

    // Test 3: User login
    const token = await this.testLogin();
    if (!token) {
      console.log('\n❌ Cannot proceed - login failed');
      return;
    }

    // Test 4: Authenticated request
    const authOk = await this.testAuthenticatedRequest(token);
    
    console.log('\n' + '='.repeat(50));
    if (authOk) {
      console.log('🎉 All tests passed! The backend authentication is working correctly.');
      console.log('\nYou can now use these credentials in the frontend:');
      console.log(`Email: ${TEST_USER.email}`);
      console.log(`Password: ${TEST_USER.password}`);
    } else {
      console.log('❌ Some tests failed. Check the backend logs for more details.');
    }
  }
}

// Export for use in other files or run directly
export { BackendTester, TEST_USER };

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).runLoginTest = () => {
    const tester = new BackendTester(BASE_URL);
    tester.runAllTests().catch(console.error);
  };
  
  console.log('Backend Tester loaded! Run `runLoginTest()` in the console to start tests.');
} else if (typeof globalThis !== 'undefined') {
  // Node.js environment
  const tester = new BackendTester(BASE_URL);
  tester.runAllTests().catch(console.error);
}
