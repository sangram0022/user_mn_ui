/**
 * Async Validator
 * Validates values against server-side rules (username uniqueness, email availability, etc.)
 * 
 * Features:
 * - Server-side validation with debouncing
 * - Caching to reduce API calls
 * - Abort controller for cancellation
 * - Custom validation functions
 * - Rate limiting protection
 * 
 * @example
 * const validator = new AsyncValidator({
 *   validationFn: async (value) => {
 *     const response = await apiClient.get(`/users/check-username/${value}`);
 *     return response.data.available;
 *   },
 *   errorMessage: 'Username is already taken',
 *   debounceMs: 500,
 * });
 */

import { BaseValidator } from './BaseValidator';
import type { FieldValidationResult } from '../ValidationResult';
import { ValidationStatus } from '../ValidationStatus';

export type AsyncValidationFn = (value: string) => Promise<boolean>;

export interface AsyncValidatorOptions {
  /** Async validation function that returns true if valid */
  validationFn: AsyncValidationFn;
  
  /** Error message when validation fails */
  errorMessage: string;
  
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number;
  
  /** Enable caching of validation results */
  enableCache?: boolean;
  
  /** Cache TTL in milliseconds (default: 60000ms = 1 minute) */
  cacheTtlMs?: number;
  
  /** Minimum value length to trigger validation */
  minLength?: number;
  
  /** Skip validation if value hasn't changed */
  skipIfUnchanged?: boolean;
  
  /** Custom loading message */
  loadingMessage?: string;
}

interface CacheEntry {
  result: boolean;
  timestamp: number;
}

export class AsyncValidator extends BaseValidator {
  readonly name = 'AsyncValidator';
  
  private options: {
    validationFn: AsyncValidationFn;
    errorMessage: string;
    debounceMs: number;
    enableCache: boolean;
    cacheTtlMs: number;
    minLength: number;
    skipIfUnchanged: boolean;
    loadingMessage: string;
  };
  
  private cache = new Map<string, CacheEntry>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private abortController: AbortController | null = null;
  private lastValidatedValue: string | null = null;
  
  constructor(options: AsyncValidatorOptions) {
    super();
    this.options = {
      validationFn: options.validationFn,
      errorMessage: options.errorMessage,
      debounceMs: options.debounceMs ?? 300,
      enableCache: options.enableCache ?? true,
      cacheTtlMs: options.cacheTtlMs ?? 60000,
      minLength: options.minLength ?? 0,
      skipIfUnchanged: options.skipIfUnchanged ?? true,
      loadingMessage: options.loadingMessage ?? 'Validating...',
    };
  }
  
  /**
   * Synchronous validation is not supported for async validators
   * Use validateAsync() instead
   */
  validate(_value: unknown, field = 'value'): FieldValidationResult {
    return {
      status: ValidationStatus.ERROR,
      isValid: false,
      field,
      errors: ['Async validation requires validateAsync() method'],
      warnings: [],
      metadata: { validator: this.name },
    };
  }
  
  /**
   * Async validation with debouncing and caching
   */
  async validateAsync(value: unknown, field = 'value'): Promise<FieldValidationResult> {
    // Check if empty
    if (this.isEmpty(value)) {
      return {
        status: ValidationStatus.SUCCESS,
        isValid: true,
        field,
        errors: [],
        warnings: [],
        metadata: { validator: this.name, cached: false },
      };
    }
    
    const valueStr = this.toString(value);
    
    // Check minimum length
    if (valueStr.length < this.options.minLength) {
      return {
        status: ValidationStatus.SUCCESS,
        isValid: true,
        field,
        errors: [],
        warnings: [],
        metadata: { validator: this.name, skipped: true },
      };
    }
    
    // Skip if unchanged
    if (this.options.skipIfUnchanged && valueStr === this.lastValidatedValue) {
      return {
        status: ValidationStatus.SUCCESS,
        isValid: true,
        field,
        errors: [],
        warnings: [],
        metadata: { validator: this.name, skipped: true },
      };
    }
    
    // Check cache
    if (this.options.enableCache) {
      const cachedResult = this.getFromCache(valueStr);
      if (cachedResult !== null) {
        return {
          status: cachedResult ? ValidationStatus.SUCCESS : ValidationStatus.ERROR,
          isValid: cachedResult,
          field,
          errors: cachedResult ? [] : [this.options.errorMessage],
          warnings: [],
          metadata: { validator: this.name, cached: true },
        };
      }
    }
    
    // Cancel previous validation
    if (this.abortController) {
      this.abortController.abort();
    }
    
    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Create new abort controller
    this.abortController = new AbortController();
    
    // Debounce validation
    return new Promise((resolve) => {
      this.debounceTimer = setTimeout(async () => {
        try {
          const isValid = await this.options.validationFn(valueStr);
          
          // Update cache
          if (this.options.enableCache) {
            this.setCache(valueStr, isValid);
          }
          
          // Update last validated value
          this.lastValidatedValue = valueStr;
          
          resolve({
            status: isValid ? ValidationStatus.SUCCESS : ValidationStatus.ERROR,
            isValid,
            field,
            errors: isValid ? [] : [this.options.errorMessage],
            warnings: [],
            metadata: { validator: this.name, cached: false },
          });
        } catch (error) {
          // Handle validation error
          resolve({
            status: ValidationStatus.ERROR,
            isValid: false,
            field,
            errors: ['Validation failed due to server error'],
            warnings: [],
            metadata: { 
              validator: this.name, 
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
      }, this.options.debounceMs);
    });
  }
  
  /**
   * Cancel ongoing validation
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
  
  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Reset validator state
   */
  reset(): void {
    this.cancel();
    this.clearCache();
    this.lastValidatedValue = null;
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  /**
   * Get result from cache if not expired
   */
  private getFromCache(value: string): boolean | null {
    const entry = this.cache.get(value);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.options.cacheTtlMs) {
      this.cache.delete(value);
      return null;
    }
    
    return entry.result;
  }
  
  /**
   * Set result in cache
   */
  private setCache(value: string, result: boolean): void {
    this.cache.set(value, {
      result,
      timestamp: Date.now(),
    });
  }
}

/**
 * Create username uniqueness validator
 */
export function createUsernameUniqueValidator(
  checkFn: (username: string) => Promise<boolean>,
  options?: Partial<AsyncValidatorOptions>
): AsyncValidator {
  return new AsyncValidator({
    validationFn: checkFn,
    errorMessage: options?.errorMessage ?? 'Username is already taken',
    debounceMs: options?.debounceMs ?? 500,
    enableCache: options?.enableCache ?? true,
    minLength: options?.minLength ?? 3,
  });
}

/**
 * Create email availability validator
 */
export function createEmailAvailableValidator(
  checkFn: (email: string) => Promise<boolean>,
  options?: Partial<AsyncValidatorOptions>
): AsyncValidator {
  return new AsyncValidator({
    validationFn: checkFn,
    errorMessage: options?.errorMessage ?? 'Email is already registered',
    debounceMs: options?.debounceMs ?? 500,
    enableCache: options?.enableCache ?? true,
    minLength: options?.minLength ?? 5,
  });
}

/**
 * Create custom async validator
 */
export function createAsyncValidator(
  validationFn: AsyncValidationFn,
  errorMessage: string,
  options?: Partial<Omit<AsyncValidatorOptions, 'validationFn' | 'errorMessage'>>
): AsyncValidator {
  return new AsyncValidator({
    validationFn,
    errorMessage,
    ...options,
  });
}

