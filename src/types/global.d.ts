/**
 * Global Type Declarations
 * Extends global interfaces with application-specific types
 */

declare global {
  /**
   * Window interface extensions
   * These are diagnostic tools available in browser console
   */
  interface Window {
    /**
     * Diagnostic API for debugging authentication and API issues
     * Available in development mode via browser console
     * 
     * @example
     * ```js
     * // Check current token and permissions
     * await window.diagnoseAPI.checkToken();
     * 
     * // Test API endpoints
     * await window.diagnoseAPI.testEndpoints();
     * 
     * // Run full diagnostic
     * await window.diagnoseAPI.runFullDiagnostic();
     * ```
     */
    diagnoseAPI: {
      /**
       * Check current access token and display permissions
       */
      checkToken: () => void;
      
      /**
       * Test user and role API endpoints
       */
      testEndpoints: () => Promise<void>;
      
      /**
       * Run comprehensive diagnostic check
       */
      runFullDiagnostic: () => Promise<void>;
    };
  }
}

// This export is required for TypeScript to treat this as a module
export {};
