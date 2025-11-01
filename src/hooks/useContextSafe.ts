/**
 * React 19: use() hook for Context consumption
 * 
 * This is the modern way to consume context in React 19.
 * Benefits:
 * - Can be used conditionally (unlike useContext)
 * - Can be used in loops
 * - Better TypeScript inference
 * - More flexible than useContext
 */

import { use, type Context } from 'react';

/**
 * Safe wrapper around React 19's use() hook for context
 * Provides better error messages when context is missing
 */
export function useContextSafe<T>(
  context: Context<T | null>,
  contextName: string = 'Context'
): T {
  const value = use(context);
  
  if (value === null) {
    throw new Error(
      `${contextName} must be used within its Provider. ` +
      `Make sure your component is wrapped in the appropriate Provider component.`
    );
  }
  
  return value;
}

/**
 * Example usage:
 * 
 * // Instead of:
 * const auth = useContext(AuthContext);
 * if (!auth) throw new Error('...');
 * 
 * // Use:
 * const auth = useContextSafe(AuthContext, 'AuthContext');
 */
