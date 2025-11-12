/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests to failing services
 * 
 * States:
 * - CLOSED: Normal operation, all requests allowed
 * - OPEN: Service is failing, all requests blocked
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 * 
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   timeout: 60000,
 *   resetTimeout: 30000,
 * });
 * 
 * try {
 *   const result = await breaker.execute(async () => {
 *     return await apiClient.get('/api/users');
 *   });
 * } catch (error) {
 *   // Handle circuit open or request failure
 * }
 * ```
 */

import { logger } from '@/core/logging';

export const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
} as const;

export type CircuitState = typeof CircuitState[keyof typeof CircuitState];

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit (default: 5) */
  failureThreshold?: number;
  
  /** Time in ms to keep circuit open before attempting half-open (default: 60000ms = 1 minute) */
  resetTimeout?: number;
  
  /** Request timeout in ms (default: 30000ms = 30 seconds) */
  timeout?: number;
  
  /** Number of successful requests in half-open to close circuit (default: 2) */
  successThreshold?: number;
  
  /** Callback when circuit state changes */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
  
  /** Callback when circuit opens */
  onOpen?: () => void;
  
  /** Callback when circuit closes */
  onClose?: () => void;
  
  /** Name for logging and identification */
  name?: string;
}

export class CircuitBreakerError extends Error {
  readonly state: CircuitState;
  readonly circuitName: string;
  
  constructor(
    message: string,
    state: CircuitState,
    circuitName: string
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.state = state;
    this.circuitName = circuitName;
  }
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttemptTime = 0;
  private options: Required<Omit<CircuitBreakerOptions, 'onStateChange' | 'onOpen' | 'onClose'>> & {
    onStateChange?: (from: CircuitState, to: CircuitState) => void;
    onOpen?: () => void;
    onClose?: () => void;
  };
  
  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      resetTimeout: options.resetTimeout ?? 60000,
      timeout: options.timeout ?? 30000,
      successThreshold: options.successThreshold ?? 2,
      name: options.name ?? 'CircuitBreaker',
      onStateChange: options.onStateChange,
      onOpen: options.onOpen,
      onClose: options.onClose,
    };
    
    logger().info('Circuit breaker initialized', {
      name: this.options.name,
      failureThreshold: this.options.failureThreshold,
      resetTimeout: this.options.resetTimeout,
      timeout: this.options.timeout,
    });
  }
  
  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        logger().warn('Circuit breaker is OPEN', {
          name: this.options.name,
          nextAttempt: new Date(this.nextAttemptTime).toISOString(),
        });
        throw new CircuitBreakerError(
          `Circuit breaker is OPEN for ${this.options.name}. Try again later.`,
          this.state,
          this.options.name
        );
      }
      
      // Time to attempt recovery
      this.setState(CircuitState.HALF_OPEN);
    }
    
    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn);
      
      // Handle success
      this.onSuccess();
      
      return result;
    } catch (error) {
      // Handle failure
      this.onFailure(error);
      throw error;
    }
  }
  
  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout after ${this.options.timeout}ms`)),
          this.options.timeout
        )
      ),
    ]);
  }
  
  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.options.successThreshold) {
        logger().info('Circuit breaker closing after successful recovery', {
          name: this.options.name,
          successCount: this.successCount,
        });
        this.setState(CircuitState.CLOSED);
        this.successCount = 0;
      }
    }
  }
  
  /**
   * Handle failed request
   */
  private onFailure(error: unknown): void {
    this.failureCount++;
    
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger().error('Circuit breaker request failed', errorObj, {
      name: this.options.name,
      failures: this.failureCount,
      threshold: this.options.failureThreshold,
    });
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during recovery, go back to open
      logger().warn('Circuit breaker failed during recovery', {
        name: this.options.name,
      });
      this.setState(CircuitState.OPEN);
      this.successCount = 0;
      this.nextAttemptTime = Date.now() + this.options.resetTimeout;
    } else if (this.failureCount >= this.options.failureThreshold) {
      // Too many failures, open circuit
      logger().error('Circuit breaker opening due to failures', {
        name: this.options.name,
        failureCount: this.failureCount,
        threshold: this.options.failureThreshold,
      });
      this.setState(CircuitState.OPEN);
      this.nextAttemptTime = Date.now() + this.options.resetTimeout;
    }
  }
  
  /**
   * Change circuit state
   */
  private setState(newState: CircuitState): void {
    const oldState = this.state;
    
    if (oldState === newState) return;
    
    this.state = newState;
    
    logger().info('Circuit breaker state changed', {
      name: this.options.name,
      from: oldState,
      to: newState,
    });
    
    // Trigger callbacks
    this.options.onStateChange?.(oldState, newState);
    
    if (newState === CircuitState.OPEN) {
      this.options.onOpen?.();
    } else if (newState === CircuitState.CLOSED) {
      this.options.onClose?.();
    }
  }
  
  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }
  
  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failureCount;
  }
  
  /**
   * Get success count (in half-open state)
   */
  getSuccessCount(): number {
    return this.successCount;
  }
  
  /**
   * Get time until next attempt (for open state)
   */
  getNextAttemptTime(): Date | null {
    if (this.state !== CircuitState.OPEN) return null;
    return new Date(this.nextAttemptTime);
  }
  
  /**
   * Manually reset circuit to closed state
   */
  reset(): void {
    logger().info('Circuit breaker manually reset', {
      name: this.options.name,
      previousState: this.state,
    });
    
    this.setState(CircuitState.CLOSED);
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTime = 0;
  }
  
  /**
   * Get circuit breaker statistics
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    nextAttemptTime: Date | null;
    options: {
      failureThreshold: number;
      resetTimeout: number;
      timeout: number;
      successThreshold: number;
      name: string;
    };
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttemptTime: this.getNextAttemptTime(),
      options: {
        failureThreshold: this.options.failureThreshold,
        resetTimeout: this.options.resetTimeout,
        timeout: this.options.timeout,
        successThreshold: this.options.successThreshold,
        name: this.options.name,
      },
    };
  }
}

/**
 * Create a circuit breaker for an API endpoint
 */
export function createApiCircuitBreaker(
  endpoint: string,
  options?: Omit<CircuitBreakerOptions, 'name'>
): CircuitBreaker {
  return new CircuitBreaker({
    ...options,
    name: `API:${endpoint}`,
  });
}

/**
 * Create a circuit breaker for a service
 */
export function createServiceCircuitBreaker(
  serviceName: string,
  options?: Omit<CircuitBreakerOptions, 'name'>
): CircuitBreaker {
  return new CircuitBreaker({
    ...options,
    name: `Service:${serviceName}`,
  });
}

