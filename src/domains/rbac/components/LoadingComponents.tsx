/**
 * ========================================
 * RBAC Loading Components
 * ========================================
 * Separated loading components for React Fast Refresh compatibility
 * ========================================
 */



export const DefaultComponentLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-brand-primary border-r-transparent"></div>
    <span className="ml-2 text-sm text-gray-600">Loading component...</span>
  </div>
);