/**
 * API Diagnostic Tool
 * Run this in browser console to diagnose the 401 error
 * 
 * Note: console.log is intentional for diagnostic output
 */

/* eslint-disable no-console */

// ============================================================================
// Diagnostic Functions
// ============================================================================

export const diagnoseAPI = {
  /**
   * Check if access token exists and decode it
   */
  checkToken: () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.error('❌ No access token found in localStorage');
      return null;
    }
    
    try {
      const [, payloadBase64] = token.split('.');
      const payload = JSON.parse(atob(payloadBase64));
      
      console.log('✅ Access Token Found');
      console.log('Token Payload:', payload);
      console.log('Permissions:', payload.permissions || 'None');
      console.log('Roles:', payload.roles || 'None');
      console.log('Expires:', new Date(payload.exp * 1000).toLocaleString());
      
      // Check for RBAC permissions
      const hasRbacRead = payload.permissions?.includes('admin:rbac:read');
      const hasUsersRead = payload.permissions?.includes('admin:users:read');
      
      console.log('\n📊 Permission Check:');
      console.log(`  admin:users:read: ${hasUsersRead ? '✅' : '❌'}`);
      console.log(`  admin:rbac:read: ${hasRbacRead ? '✅' : '❌'}`);
      
      if (!hasRbacRead) {
        console.warn('\n⚠️ WARNING: Token lacks admin:rbac:read permission!');
        console.warn('This is likely why role API returns 401');
      }
      
      return payload;
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
      return null;
    }
  },
  
  /**
   * Test both API endpoints
   */
  testEndpoints: async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.error('❌ No access token found');
      return;
    }
    
    const baseURL = 'http://localhost:8000';
    
    // Test User API (working)
    console.log('\n🧪 Testing User API...');
    try {
      const userResponse = await fetch(`${baseURL}/api/v1/admin/users?page=1&page_size=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`User API Status: ${userResponse.status} ${userResponse.statusText}`);
      
      if (userResponse.ok) {
        const data = await userResponse.json();
        console.log('✅ User API Success:', data);
      } else {
        const error = await userResponse.text();
        console.error('❌ User API Error:', error);
      }
    } catch (error) {
      console.error('❌ User API Request Failed:', error);
    }
    
    // Test Role API (failing)
    console.log('\n🧪 Testing Role API (current path)...');
    try {
      const roleResponse = await fetch(`${baseURL}/api/v1/admin/rbac/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`Role API Status: ${roleResponse.status} ${roleResponse.statusText}`);
      
      if (roleResponse.ok) {
        const data = await roleResponse.json();
        console.log('✅ Role API Success:', data);
      } else {
        const error = await roleResponse.text();
        console.error('❌ Role API Error:', error);
      }
    } catch (error) {
      console.error('❌ Role API Request Failed:', error);
    }
    
    // Test alternative path
    console.log('\n🧪 Testing Role API (alternative path)...');
    try {
      const altResponse = await fetch(`${baseURL}/api/v1/admin/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`Alternative Role API Status: ${altResponse.status} ${altResponse.statusText}`);
      
      if (altResponse.ok) {
        const data = await altResponse.json();
        console.log('✅ Alternative path works!:', data);
      } else {
        const error = await altResponse.text();
        console.error('❌ Alternative path also fails:', error);
      }
    } catch (error) {
      console.error('❌ Alternative path request failed:', error);
    }
  },
  
  /**
   * Compare API prefixes in code
   */
  checkPrefixes: () => {
    console.log('\n📋 Current API Prefix Configuration:');
    console.log('  ADMIN:', '/api/v1/admin');
    console.log('  ADMIN_USERS:', '/api/v1/admin/users');
    console.log('  ADMIN_RBAC:', '/api/v1/admin/rbac');
    
    console.log('\n🔍 Actual URLs Used:');
    console.log('  User List: /api/v1/admin + /users = /api/v1/admin/users ✅');
    console.log('  Role List: /api/v1/admin/rbac + /roles = /api/v1/admin/rbac/roles ❓');
    
    console.log('\n💡 Recommendation:');
    console.log('  Check backend to see if it expects:');
    console.log('    Option A: /api/v1/admin/rbac/roles');
    console.log('    Option B: /api/v1/admin/roles');
  },
  
  /**
   * Check request headers
   */
  checkHeaders: () => {
    const token = localStorage.getItem('access_token');
    const csrfToken = localStorage.getItem('csrf_token');
    
    console.log('\n🔒 Request Headers That Will Be Sent:');
    console.log('  Authorization:', token ? `Bearer ${token.substring(0, 20)}...` : '❌ Missing');
    console.log('  X-CSRF-Token:', csrfToken ? csrfToken : '❌ Missing (only for mutations)');
    console.log('  Content-Type: application/json');
  },
  
  /**
   * Full diagnostic report
   */
  runFullDiagnostic: async () => {
    console.clear();
    console.log('🔍 API DIAGNOSTIC REPORT');
    console.log('========================\n');
    
    diagnoseAPI.checkToken();
    diagnoseAPI.checkPrefixes();
    diagnoseAPI.checkHeaders();
    await diagnoseAPI.testEndpoints();
    
    console.log('\n✅ Diagnostic Complete');
    console.log('Check the output above for issues');
  }
};

// ============================================================================
// Browser Console Instructions
// ============================================================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           API DIAGNOSTIC TOOL - READY                        ║
╚══════════════════════════════════════════════════════════════╝

To diagnose the 401 error, run these commands in browser console:

1. Check token and permissions:
   diagnoseAPI.checkToken()

2. Test all endpoints:
   await diagnoseAPI.testEndpoints()

3. Check API prefixes:
   diagnoseAPI.checkPrefixes()

4. Check request headers:
   diagnoseAPI.checkHeaders()

5. Run full diagnostic:
   await diagnoseAPI.runFullDiagnostic()

The tool will show you exactly why role API returns 401!
`);

// Export for use
if (typeof window !== 'undefined') {
    // Make available globally for easy access in browser console
  // Type-safe global assignment
  window.diagnoseAPI = diagnoseAPI;
}

export default diagnoseAPI;
