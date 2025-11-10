// ========================================
// Enhanced Form Patterns - EXPERIMENTAL / DEPRECATED
// ========================================
// ⚠️ DEPRECATED: This hook is experimental and NOT recommended for production use.
// 
// **USE INSTEAD:** React Hook Form + Zod (Standard Pattern)
//   - Example: src/pages/ModernContactForm.tsx
//   - See: src/domains/auth/pages/ChangePasswordPage.tsx
//
// **WHY DEPRECATED:**
//   - Adds unnecessary complexity over React Hook Form
//   - 504 lines of code vs simple RHF integration
//   - React Compiler handles optimizations automatically
//   - Persistence patterns better handled at app level
//
// **STANDARD PATTERN (PREFERRED):**
//   ```ts
//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: {...}
//   });
//   ```
//
// This file remains for reference only. Do NOT use in new code.
// ========================================

import { useState, useEffect, useRef } from 'react';
import { useForm, type FieldValues, type UseFormReturn, type Path, type PathValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedCallback } from 'use-debounce';
import type { z } from 'zod';
import { useStandardErrorHandler } from './useStandardErrorHandler';
import { storageService } from '@/core/storage';

// ========================================
// Types and Interfaces
// ========================================

export interface FormPersistenceOptions {
  storageKey: string;
  clearOnSubmit?: boolean;
  persistOnChange?: boolean;
  ttlMinutes?: number;
}

export interface ValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  revalidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

export interface EnhancedFormOptions<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  persistence?: FormPersistenceOptions;
  validation?: ValidationOptions;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onError?: (error: Error) => void;
}

// ========================================
// Form State Persistence Manager
// ========================================

class FormPersistenceManager {
  private static readonly PREFIX = 'form_state_';

  /**
   * Save form state using storageService with TTL
   */
  static saveState(key: string, data: Record<string, unknown>, ttlMinutes = 60): void {
    // storageService handles TTL, error handling, and JSON serialization
    storageService.set(
      `${this.PREFIX}${key}`,
      data,
      { ttl: ttlMinutes * 60 * 1000 }
    );
  }

  /**
   * Load form state using storageService (auto-handles expiry)
   */
  static loadState(key: string): Record<string, unknown> | null {
    // storageService automatically checks TTL and removes expired items
    return storageService.get<Record<string, unknown>>(`${this.PREFIX}${key}`);
  }

  /**
   * Clear form state using storageService
   */
  static clearState(key: string): void {
    storageService.remove(`${this.PREFIX}${key}`);
  }

  /**
   * Clear all expired form states
   * Note: storageService automatically handles expiry on get()
   * This method clears all form_state_* keys
   */
  static cleanupExpiredStates(): void {
    const allKeys = storageService.keys();
    const formKeys = allKeys.filter(key => key.startsWith(this.PREFIX));
    
    formKeys.forEach(key => {
      // Accessing the key will auto-remove if expired
      storageService.get(key);
    });
  }
}

// ========================================
// Field Dependency Manager
// ========================================

class FieldDependencyManager<T extends FieldValues> {
  private dependencies = new Map<keyof T, Set<keyof T>>();
  private computedFields = new Map<keyof T, (values: T) => unknown>();

  /**
   * Add field dependency
   */
  addDependency(field: keyof T, dependsOn: (keyof T)[]): void {
    if (!this.dependencies.has(field)) {
      this.dependencies.set(field, new Set());
    }
    dependsOn.forEach((dep: keyof T) => this.dependencies.get(field)!.add(dep));
  }

  /**
   * Add computed field
   */
  addComputedField(field: keyof T, computeFn: (values: T) => unknown): void {
    this.computedFields.set(field, computeFn);
  }

  /**
   * Get fields that should be revalidated when a field changes
   */
  getDependentFields(changedField: keyof T): Set<keyof T> {
    const dependents = new Set<keyof T>();
    
    this.dependencies.forEach((deps, field) => {
      if (deps.has(changedField)) {
        dependents.add(field);
      }
    });

    return dependents;
  }

  /**
   * Update computed fields based on current values
   */
  updateComputedFields(values: T, setValue: (field: keyof T, value: unknown) => void): void {
    this.computedFields.forEach((computeFn, field) => {
      const newValue = computeFn(values);
      setValue(field, newValue);
    });
  }
}

// ========================================
// Enhanced Form Hook
// ========================================

export function useEnhancedForm<T extends FieldValues>(
  options: EnhancedFormOptions<T>
) {
  const {
    schema,
    persistence,
    validation = {},
    defaultValues = {},
    onSubmit,
    onError,
  } = options;

  // Standard error handler for consistent error handling
  const handleError = useStandardErrorHandler();

  // Form instance with React Hook Form
  // Type assertions needed: Zod generic constraints incompatible with RHF FieldValues
  // zodResolver expects Zod3Type<T, FieldValues> but receives ZodType<T, unknown>
  // This is a known limitation in the type definitions, safe to cast
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
    mode: validation.revalidateMode || 'onChange',
  });

  const { watch, setValue, trigger, formState } = form;
  
  // Performance optimization refs
  const lastValidationTime = useRef<number>(0);
  const validationInProgress = useRef(false);
  const dependencyManager = useRef(new FieldDependencyManager<T>());
  
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [persistedState, setPersistedState] = useState<Partial<T> | null>(null);

  // ========================================
  // Form Persistence
  // ========================================

  // Load persisted state on mount
  useEffect(() => {
    if (!persistence?.storageKey) return;

    const stored = FormPersistenceManager.loadState(persistence.storageKey);
    if (stored) {
      setPersistedState(stored as Partial<T>);
      // Apply persisted values with type assertion for dynamic field names
      Object.entries(stored).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(key as Path<T>, value as any);
      });
    }

    // Cleanup expired states
    FormPersistenceManager.cleanupExpiredStates();
  }, [persistence?.storageKey, setValue]);

  // Persist form state on change
  const persistFormState = useDebouncedCallback(
    (values: T) => {
      if (persistence?.persistOnChange && persistence.storageKey) {
        FormPersistenceManager.saveState(
          persistence.storageKey,
          values,
          persistence.ttlMinutes
        );
      }
    },
    500 // Debounce persistence
  );

  // Watch all form values for persistence
  const allValues = watch();
  useEffect(() => {
    if (persistence?.persistOnChange) {
      persistFormState(allValues);
    }
  }, [allValues, persistFormState, persistence?.persistOnChange]);

  // ========================================
  // Smart Validation with Debouncing
  // ========================================

  const debouncedValidation = useDebouncedCallback(
    async (fieldName?: keyof T) => {
      if (validationInProgress.current) return;
      
      validationInProgress.current = true;
      lastValidationTime.current = Date.now();

      try {
        if (fieldName) {
          // Validate specific field - type assertion for Path<T> compatibility
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await trigger(fieldName as any as Path<T>);
          
          // Validate dependent fields
          const dependentFields = dependencyManager.current.getDependentFields(fieldName);
          if (dependentFields.size > 0) {
            // Type assertion: Field dependency manager returns valid field names
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await trigger([...dependentFields] as any as Path<T>[]);
          }
        } else {
          // Validate entire form
          await trigger();
        }
      } finally {
        validationInProgress.current = false;
      }
    },
    validation.debounceMs || 300
  );

  // ========================================
  // Optimized Field Change Handler
  // React Compiler auto-memoizes this function
  // ========================================

  const handleFieldChange = (fieldName: keyof T, value: unknown) => {
    // Type assertion needed: keyof T may not exactly match Path<T> from RHF
    // This is safe because fieldName comes from the schema's field names
    setValue(fieldName as Path<T>, value as PathValue<T, Path<T>>);

    // Trigger validation if enabled
    if (validation.validateOnChange) {
      debouncedValidation(fieldName);
    }
  };

  // ========================================
  // Enhanced Submit Handler
  // React Compiler auto-memoizes this function
  // ========================================

  const handleSubmit = async (data: T) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);

    try {
      await onSubmit(data);
      
      // Clear persisted state on successful submit
      if (persistence?.clearOnSubmit && persistence.storageKey) {
        FormPersistenceManager.clearState(persistence.storageKey);
      }
    } catch (error) {
      // Use standard error handler for consistent error handling and logging
      handleError(error, { context: { operation: 'form-submit', formName: persistence?.storageKey } });
      onError?.(error as Error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // Field Dependency Management
  // React Compiler auto-memoizes these functions
  // ========================================

  const addFieldDependency = (field: keyof T, dependsOn: (keyof T)[]) => {
    dependencyManager.current.addDependency(field, dependsOn);
  };

  const addComputedField = (field: keyof T, computeFn: (values: T) => unknown) => {
    dependencyManager.current.addComputedField(field, computeFn);
  };

  // ========================================
  // Form State Analysis
  // React Compiler auto-memoizes this calculation
  // ========================================

  const formAnalytics = {
    hasChanges: Object.keys(formState.dirtyFields).length > 0,
    totalErrors: Object.keys(formState.errors).length,
    touchedFields: Object.keys(formState.touchedFields).length,
    submitAttempts: submitCount,
    isFirstSubmit: submitCount === 0,
    hasPersistentState: !!persistedState,
    validationLatency: lastValidationTime.current > 0 
      ? Date.now() - lastValidationTime.current 
      : 0,
  };

  // ========================================
  // Cleanup
  // ========================================

  useEffect(() => {
    return () => {
      // Cancel pending validations
      debouncedValidation.cancel();
      persistFormState.cancel();
    };
  }, [debouncedValidation, persistFormState]);

  return {
    // React Hook Form instance
    ...form,
    
    // Enhanced handlers
    handleFieldChange,
    handleSubmit: form.handleSubmit(handleSubmit),
    
    // State management
    isSubmitting,
    formAnalytics,
    
    // Dependency management
    addFieldDependency,
    addComputedField,
    
    // Persistence management
    clearPersistedState: () => {
      if (persistence?.storageKey) {
        FormPersistenceManager.clearState(persistence.storageKey);
        setPersistedState(null);
      }
    },
    
    // Manual validation trigger
    validateField: (fieldName: keyof T) => debouncedValidation(fieldName),
    validateForm: () => debouncedValidation(),
  };
}

// ========================================
// Enhanced Form Field Component
// ========================================

interface EnhancedFieldProps<T extends FieldValues = FieldValues> {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  required?: boolean;
  form: UseFormReturn<T>;
  onFieldChange?: (name: string, value: unknown) => void;
  className?: string;
}

export function EnhancedField({
  name,
  label,
  type = 'text',
  placeholder,
  helpText,
  disabled,
  required,
  form,
  onFieldChange,
  className = '',
}: EnhancedFieldProps) {
  const { register, formState: { errors, touchedFields } } = form;
  
  const error = errors[name];
  const isTouched = touchedFields[name];
  const hasError = !!error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange?.(name, e.target.value);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        {...register(name)}
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        className={`
          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${hasError ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          transition-colors duration-200
        `}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${name}-error` : helpText ? `${name}-help` : undefined
        }
      />
      
      {helpText && !hasError && (
        <p id={`${name}-help`} className="text-xs text-gray-500 mt-1">
          {helpText}
        </p>
      )}
      
      {hasError && isTouched && (
        <p id={`${name}-error`} className="text-xs text-red-500 mt-1" role="alert">
          {error?.message as string}
        </p>
      )}
    </div>
  );
}

// ========================================
// Export Utilities
// ========================================

export { FormPersistenceManager, FieldDependencyManager };