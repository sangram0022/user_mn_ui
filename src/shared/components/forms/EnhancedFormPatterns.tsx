/* eslint-disable react-refresh/only-export-components */
/**
 * Enhanced Form Patterns
 * 
 * This file has been refactored for better maintainability.
 * Implementation now in: src/shared/components/forms/enhanced/
 * 
 * Structure:
 * - components/: Form components (EnhancedContactForm, EnhancedRegistrationForm, FormField)
 * - utils/: Utilities and schemas (FormStateManager, contactSchema, userSchema)
 * 
 * Features:
 * - Form state persistence with TTL support
 * - Real-time validation with Zod
 * - Character counting and limits
 * - Password strength indicator
 * - Debounced auto-save
 * - Success state handling
 */

// Re-export all form components and utilities for backward compatibility
export {
  // Components
  EnhancedContactForm,
  EnhancedRegistrationForm,
  FormField,
  
  // Utilities
  FormStateManager,
  
  // Schemas and types
  contactSchema,
  userSchema,
  type ContactFormData,
  type UserFormData,
} from './enhanced';