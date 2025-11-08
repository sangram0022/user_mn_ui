/**
 * ESLint Configuration for Migration
 * Temporary rules to catch migration issues
 * 
 * Usage:
 *   npx eslint --config .eslintrc.migration.js src/
 */

module.exports = {
  extends: ['./eslint.config.js'],
  rules: {
    // Enforce: No direct apiClient usage
    'no-restricted-imports': ['error', {
      paths: [{
        name: '@/services/api/apiClient',
        importNames: ['apiClient'],
        message: 'Use useApiQuery/useApiMutation from @/shared/hooks/useApiModern instead'
      }]
    }],
    
    // Enforce: No console usage (already in main config)
    'no-console': ['error', { allow: ['warn', 'error'] }],
    
    // Enforce: Proper error handling
    'no-restricted-syntax': ['warn', {
      selector: 'CatchClause > BlockStatement > ExpressionStatement > AssignmentExpression',
      message: 'Use handleError() from @/core/error for error handling'
    }]
  }
};
