/**
 * API Diagnostic Tool
 * Run this in browser console to diagnose the 401 error
 * 
 * Using centralized diagnostic logger for dual output:
 * - Browser console: Immediate visibility with emoji styling
 * - Structured logs: Persistence and debugging
 * 
 * @see {diagnostic} @/core/logging/diagnostic
 */

import { logger, diagnostic } from '@/core/logging';

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
      diagnostic.error('❌ No access token found in localStorage');
      return null;
    }
    
    try {
      const [, payloadBase64] = token.split('.');
      const payload = JSON.parse(atob(payloadBase64));
      
      diagnostic.log('✅ Access Token Found');
      diagnostic.log('Token Payload:', { payload });
      diagnostic.log('Permissions:', { permissions: payload.permissions || 'None' });
      diagnostic.log('Roles:', { roles: payload.roles || 'None' });
      diagnostic.log('Expires:', { expires: new Date(payload.exp * 1000).toLocaleString() });
      
      // Check for RBAC permissions
      const hasRbacRead = payload.permissions?.includes('admin:rbac:read');
      const hasUsersRead = payload.permissions?.includes('admin:users:read');
      
      diagnostic.log('📊 Permission Check:');
      diagnostic.log(`  admin:users:read: ${hasUsersRead ? '✅' : '❌'}`);
      diagnostic.log(`  admin:rbac:read: ${hasRbacRead ? '✅' : '❌'}`);
      
      if (!hasRbacRead) {
        diagnostic.warn('⚠️ WARNING: Token lacks admin:rbac:read permission!');
        diagnostic.warn('This is likely why role API returns 401');
      }
      
      return payload;
    } catch (error) {
      diagnostic.error('❌ Failed to decode token:', error);
      return null;
    }
  },
  
  /**
   * Test both API endpoints
   */
  testEndpoints: async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      diagnostic.error('❌ No access token found');
      return;
    }
    
    const baseURL = 'http://localhost:8000';
    
    // Test User API (working)
    diagnostic.log('\n🧪 Testing User API...');
    try {
      const userResponse = await fetch(`${baseURL}/api/v1/admin/users?page=1&page_size=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      diagnostic.log(`User API Status: ${userResponse.status} ${userResponse.statusText}`);
      
      if (userResponse.ok) {
        const data = await userResponse.json();
        diagnostic.log('✅ User API Success:', data);
      } else {
        const error = await userResponse.text();
        diagnostic.error('❌ User API Error:', error);
      }
    } catch (error) {
      diagnostic.error('❌ User API Request Failed:', error);
    }
    
    // Test Role API (failing)
    diagnostic.log('\n🧪 Testing Role API (current path)...');
    try {
      const roleResponse = await fetch(`${baseURL}/api/v1/admin/rbac/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      diagnostic.log(`Role API Status: ${roleResponse.status} ${roleResponse.statusText}`);
      
      if (roleResponse.ok) {
        const data = await roleResponse.json();
        diagnostic.log('✅ Role API Success:', data);
      } else {
        const error = await roleResponse.text();
        diagnostic.error('❌ Role API Error:', error);
      }
    } catch (error) {
      diagnostic.error('❌ Role API Request Failed:', error);
    }
    
    // Test alternative path
    diagnostic.log('\n🧪 Testing Role API (alternative path)...');
    try {
      const altResponse = await fetch(`${baseURL}/api/v1/admin/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      diagnostic.log(`Alternative Role API Status: ${altResponse.status} ${altResponse.statusText}`);
      
      if (altResponse.ok) {
        const data = await altResponse.json();
        diagnostic.log('✅ Alternative path works!:', data);
      } else {
        const error = await altResponse.text();
        diagnostic.error('❌ Alternative path also fails:', error);
      }
    } catch (error) {
      diagnostic.error('❌ Alternative path request failed:', error);
    }
  },
  
  /**
   * Compare API prefixes in code
   */
  checkPrefixes: () => {
    diagnostic.log('📋 Current API Prefix Configuration:');
    diagnostic.log('  ADMIN: /api/v1/admin');
    diagnostic.log('  ADMIN_USERS: /api/v1/admin/users');
    diagnostic.log('  ADMIN_RBAC: /api/v1/admin/rbac');
    
    diagnostic.log('\n🔍 Actual URLs Used:');
    diagnostic.log('  User List: /api/v1/admin + /users = /api/v1/admin/users ✅');
    diagnostic.log('  Role List: /api/v1/admin/rbac + /roles = /api/v1/admin/rbac/roles ❓');
    
    diagnostic.log('\n💡 Recommendation:');
    diagnostic.log('  Check backend to see if it expects:');
    diagnostic.log('    Option A: /api/v1/admin/rbac/roles');
    diagnostic.log('    Option B: /api/v1/admin/roles');
  },
  
  /**
   * Check request headers
   */
  checkHeaders: () => {
    const token = localStorage.getItem('access_token');
    const csrfToken = localStorage.getItem('csrf_token');
    
    diagnostic.log('🔒 Request Headers That Will Be Sent:');
    diagnostic.log(`  Authorization: ${token ? `Bearer ${token.substring(0, 20)}...` : '❌ Missing'}`);
    diagnostic.log(`  X-CSRF-Token: ${csrfToken ? csrfToken : '❌ Missing (only for mutations)'}`);
    diagnostic.log('  Content-Type: application/json');
  },
  
  /**
   * Full diagnostic report
   */
  runFullDiagnostic: async () => {
    // Clear console for cleaner output (diagnostic tool)
    diagnostic.clear();
    
    diagnostic.log('🔍 API DIAGNOSTIC REPORT');
    diagnostic.log('========================');
    
    diagnoseAPI.checkToken();
    diagnoseAPI.checkPrefixes();
    diagnoseAPI.checkHeaders();
    await diagnoseAPI.testEndpoints();
    
    diagnostic.log('\n✅ Diagnostic Complete');
    diagnostic.log('Check the output above for issues');
  }
};

// ============================================================================
// Browser Console Instructions
// ============================================================================

logger().debug(`
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
