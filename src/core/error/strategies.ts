/**
 * Error Handler Strategy Pattern
 * 
 * Provides an extensible, pluggable system for handling different error types.
 * Implements the Open/Closed Principle - open for extension, closed for modification.
 * 
 * Usage:
 *   // Register a custom error strategy
 *   registerErrorStrategy({
 *     name: 'CustomDomainError',
 *     canHandle: (error) => error instanceof CustomError,
 *     handle: (error) => ({ ... }),
 *     priority: 80,
 *   });
 * 
 *   // Use in error handler
 *   const strategy = getErrorStrategy(error);
 *   const result = strategy ? strategy.handle(error) : handleGenericError(error);
 */

import type { ErrorHandlingResult } from '../error';
import { logger } from '../logging';

// ============================================================================
// Strategy Interface
// ============================================================================

/**
 * Error handler strategy interface
 * Each strategy knows how to handle a specific type of error
 */
export interface ErrorHandlerStrategy {
  /** Unique identifier for this strategy */
  name: string;
  
  /** Check if this strategy can handle the given error */
  canHandle: (error: unknown) => boolean;
  
  /** Handle the error and return structured result */
  handle: (error: unknown) => ErrorHandlingResult;
  
  /** Priority (higher = checked first). Default: 50 */
  priority: number;
}

// ============================================================================
// Strategy Registry
// ============================================================================

/** Internal registry of error strategies */
const strategies: ErrorHandlerStrategy[] = [];

/**
 * Register a new error handling strategy
 * Strategies are automatically sorted by priority (higher first)
 * 
 * @example
 * ```typescript
 * registerErrorStrategy({
 *   name: 'NetworkError',
 *   canHandle: (error) => error instanceof TypeError && error.message.includes('fetch'),
 *   handle: (error) => ({
 *     severity: 'error',
 *     message: 'Network connection failed',
 *     code: 'NETWORK_ERROR',
 *     // ...
 *   }),
 *   priority: 90,
 * });
 * ```
 */
export function registerErrorStrategy(strategy: ErrorHandlerStrategy): void {
  // Check for duplicate names
  const existing = strategies.findIndex(s => s.name === strategy.name);
  if (existing !== -1) {
    logger().warn('Overwriting existing error strategy', {
      strategyName: strategy.name,
      context: 'registerErrorStrategy',
    });
    strategies.splice(existing, 1);
  }

  strategies.push(strategy);
  
  // Sort by priority (descending)
  strategies.sort((a, b) => b.priority - a.priority);

  logger().info('Registered error strategy', {
    name: strategy.name,
    priority: strategy.priority,
    totalStrategies: strategies.length,
    context: 'registerErrorStrategy',
  });
}

/**
 * Unregister an error handling strategy by name
 */
export function unregisterErrorStrategy(name: string): boolean {
  const index = strategies.findIndex(s => s.name === name);
  if (index !== -1) {
    strategies.splice(index, 1);
    logger().info('Unregistered error strategy', {
      name,
      remainingStrategies: strategies.length,
      context: 'unregisterErrorStrategy',
    });
    return true;
  }
  return false;
}

/**
 * Get the appropriate strategy for handling the given error
 * Returns the first strategy (by priority) that can handle the error
 * 
 * @example
 * ```typescript
 * const strategy = getErrorStrategy(error);
 * if (strategy) {
 *   return strategy.handle(error);
 * } else {
 *   return handleGenericError(error);
 * }
 * ```
 */
export function getErrorStrategy(error: unknown): ErrorHandlerStrategy | null {
  for (const strategy of strategies) {
    try {
      if (strategy.canHandle(error)) {
        logger().debug('Found error strategy', {
          strategyName: strategy.name,
          priority: strategy.priority,
          context: 'getErrorStrategy',
        });
        return strategy;
      }
    } catch (handlerError) {
      // Strategy's canHandle threw an error - log and continue
      logger().error(
        `Error strategy '${strategy.name}' threw error in canHandle`,
        handlerError instanceof Error ? handlerError : undefined,
        {
          strategyName: strategy.name,
          context: 'getErrorStrategy',
        }
      );
    }
  }
  
  return null;
}

/**
 * Get all registered strategies (useful for debugging)
 */
export function getRegisteredStrategies(): ReadonlyArray<Readonly<ErrorHandlerStrategy>> {
  return strategies;
}

/**
 * Clear all registered strategies (useful for testing)
 */
export function clearAllStrategies(): void {
  const count = strategies.length;
  strategies.length = 0;
  logger().info('Cleared all error strategies', {
    count,
    context: 'clearAllStrategies',
  });
}

// ============================================================================
// Built-in Strategies
// ============================================================================

/**
 * Register all default error strategies
 * Called automatically on module load
 */
function registerDefaultStrategies(): void {
  // Strategy for API errors (highest priority)
  registerErrorStrategy({
    name: 'APIError',
    canHandle: (error): boolean => {
      return (
        error !== null &&
        typeof error === 'object' &&
        'statusCode' in error &&
        'code' in error
      );
    },
    handle: (error): ErrorHandlingResult => {
      const apiError = error as { 
        message: string; 
        statusCode: number; 
        code: string;
        context?: Record<string, unknown>;
      };
      
      return {
        handled: true,
        userMessage: apiError.message,
        action: apiError.statusCode === 401 ? 'redirect' : apiError.statusCode >= 500 ? 'retry' : undefined,
        retryDelay: apiError.statusCode >= 500 ? 3000 : undefined,
        redirectToLogin: apiError.statusCode === 401,
        context: {
          ...apiError.context,
          code: apiError.code,
          statusCode: apiError.statusCode,
        },
      };
    },
    priority: 100,
  });

  // Strategy for validation errors
  registerErrorStrategy({
    name: 'ValidationError',
    canHandle: (error): boolean => {
      return (
        error !== null &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === 'VALIDATION_ERROR'
      );
    },
    handle: (error): ErrorHandlingResult => {
      const validationError = error as {
        message: string;
        code: string;
        fieldErrors?: Record<string, string>;
        context?: Record<string, unknown>;
      };

      const fieldCount = validationError.fieldErrors 
        ? Object.keys(validationError.fieldErrors).length 
        : 0;

      return {
        handled: true,
        userMessage: validationError.message || 
          `Please fix ${fieldCount} validation error${fieldCount !== 1 ? 's' : ''}`,
        context: {
          ...validationError.context,
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          fieldErrors: validationError.fieldErrors,
        },
      };
    },
    priority: 90,
  });

  // Strategy for network errors
  registerErrorStrategy({
    name: 'NetworkError',
    canHandle: (error): boolean => {
      return (
        error instanceof TypeError &&
        (error.message.includes('fetch') || 
         error.message.includes('network') ||
         error.message.includes('Failed to fetch'))
      );
    },
    handle: (error): ErrorHandlingResult => {
      const networkError = error as TypeError;
      return {
        handled: true,
        userMessage: 'Network connection failed. Please check your internet connection.',
        action: 'retry',
        retryDelay: 5000,
        context: {
          code: 'NETWORK_ERROR',
          statusCode: 0,
          originalMessage: networkError.message,
        },
      };
    },
    priority: 85,
  });

  // Strategy for standard Error objects
  registerErrorStrategy({
    name: 'StandardError',
    canHandle: (error): boolean => error instanceof Error,
    handle: (error): ErrorHandlingResult => {
      const stdError = error as Error;
      return {
        handled: true,
        userMessage: stdError.message || 'An unexpected error occurred',
        action: 'retry',
        retryDelay: 3000,
        context: {
          code: 'ERROR',
          statusCode: 500,
          name: stdError.name,
          stack: stdError.stack,
        },
      };
    },
    priority: 50,
  });

  // Strategy for string errors (lowest priority)
  registerErrorStrategy({
    name: 'StringError',
    canHandle: (error): boolean => typeof error === 'string',
    handle: (error): ErrorHandlingResult => {
      return {
        handled: true,
        userMessage: error as string,
        context: {
          code: 'STRING_ERROR',
          statusCode: 500,
        },
      };
    },
    priority: 10,
  });
}

// Auto-register default strategies on module load
registerDefaultStrategies();

logger().info('Error handler strategies initialized', {
  strategiesCount: strategies.length,
  context: 'strategies.module',
});
