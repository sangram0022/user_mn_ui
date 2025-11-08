/**
 * API Diagnostic Tool
 * Run this in browser console to diagnose the 401 error
 * 
 * Using centralized logger for diagnostic output
 */

import { logger } from '@/core/logging';

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
      
      logger().debug('✅ Access Token Found');
      logger().debug('Token Payload:', { payload });
      logger().debug('Permissions:', { permissions: payload.permissions || 'None' });
      logger().debug('Roles:', { roles: payload.roles || 'None' });
      logger().debug('Expires:', { expires: new Date(payload.exp * 1000).toLocaleString() });
      
      // Check for RBAC permissions
      const hasRbacRead = payload.permissions?.includes('admin:rbac:read');
      const hasUsersRead = payload.permissions?.includes('admin:users:read');
      
      logger().debug('📊 Permission Check:');
      logger().debug(`  admin:users:read: ${hasUsersRead ? '✅' : '❌'}`);
      logger().debug(`  admin:rbac:read: ${hasRbacRead ? '✅' : '❌'}`);
      
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
    logger().debug('\n🧪 Testing User API...');
    try {
      const userResponse = await fetch(`${baseURL}/api/v1/admin/users?page=1&page_size=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      logger().debug(`User API Status: ${userResponse.status} ${userResponse.statusText}`);
      
      if (userResponse.ok) {
        const data = await userResponse.json();
        logger().debug('✅ User API Success:', data);
      } else {
        const error = await userResponse.text();
        console.error('❌ User API Error:', error);
      }
    } catch (error) {
      console.error('❌ User API Request Failed:', error);
    }
    
    // Test Role API (failing)
    logger().debug('\n🧪 Testing Role API (current path)...');
    try {
      const roleResponse = await fetch(`${baseURL}/api/v1/admin/rbac/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      logger().debug(`Role API Status: ${roleResponse.status} ${roleResponse.statusText}`);
      
      if (roleResponse.ok) {
        const data = await roleResponse.json();
        logger().debug('✅ Role API Success:', data);
      } else {
        const error = await roleResponse.text();
        console.error('❌ Role API Error:', error);
      }
    } catch (error) {
      console.error('❌ Role API Request Failed:', error);
    }
    
    // Test alternative path
    logger().debug('\n🧪 Testing Role API (alternative path)...');
    try {
      const altResponse = await fetch(`${baseURL}/api/v1/admin/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      logger().debug(`Alternative Role API Status: ${altResponse.status} ${altResponse.statusText}`);
      
      if (altResponse.ok) {
        const data = await altResponse.json();
        logger().debug('✅ Alternative path works!:', data);
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
    logger().debug('📋 Current API Prefix Configuration:');
    logger().debug('  ADMIN: /api/v1/admin');
    logger().debug('  ADMIN_USERS: /api/v1/admin/users');
    logger().debug('  ADMIN_RBAC: /api/v1/admin/rbac');
    
    logger().debug('\n🔍 Actual URLs Used:');
    logger().debug('  User List: /api/v1/admin + /users = /api/v1/admin/users ✅');
    logger().debug('  Role List: /api/v1/admin/rbac + /roles = /api/v1/admin/rbac/roles ❓');
    
    logger().debug('\n💡 Recommendation:');
    logger().debug('  Check backend to see if it expects:');
    logger().debug('    Option A: /api/v1/admin/rbac/roles');
    logger().debug('    Option B: /api/v1/admin/roles');
  },
  
  /**
   * Check request headers
   */
  checkHeaders: () => {
    const token = localStorage.getItem('access_token');
    const csrfToken = localStorage.getItem('csrf_token');
    
    logger().debug('🔒 Request Headers That Will Be Sent:');
    logger().debug(`  Authorization: ${token ? `Bearer ${token.substring(0, 20)}...` : '❌ Missing'}`);
    logger().debug(`  X-CSRF-Token: ${csrfToken ? csrfToken : '❌ Missing (only for mutations)'}`);
    logger().debug('  Content-Type: application/json');
  },
  
  /**
   * Full diagnostic report
   */
  runFullDiagnostic: async () => {
    // Clear console for cleaner output (diagnostic tool)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.clear();
    }
    logger().debug('🔍 API DIAGNOSTIC REPORT');
    logger().debug('========================');
    
    diagnoseAPI.checkToken();
    diagnoseAPI.checkPrefixes();
    diagnoseAPI.checkHeaders();
    await diagnoseAPI.testEndpoints();
    
    logger().debug('\n✅ Diagnostic Complete');
    logger().debug('Check the output above for issues');
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
