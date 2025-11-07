/**
 * Zod Validation Schemas
 * Integration with existing ValidationBuilder system
 * Provides type-safe, reusable validation schemas for React Hook Form
 */

import { z } from 'zod';
import { 
  EMAIL_REGEX, 
  USERNAME_REGEX, 
  PHONE_REGEX, 
  NAME_REGEX 
} from './index';

import { PASSWORD_RULES } from './validators/PasswordValidator';

// ============================================================================
// Password Regex Patterns
// ============================================================================

const UPPERCASE_REGEX = /(?=.*[A-Z])/;
const LOWERCASE_REGEX = /(?=.*[a-z])/;
const DIGIT_REGEX = /(?=.*\d)/;
const SPECIAL_CHAR_REGEX = /(?=.*[!@#$%^&*()_+\-=[\]{}|;:,.<>?])/;

// ============================================================================
// Base Field Schemas
// ============================================================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(254, 'Email must be less than 254 characters')
  .regex(EMAIL_REGEX, 'Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(PASSWORD_RULES.MIN_LENGTH, `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`)
  .max(PASSWORD_RULES.MAX_LENGTH, `Password must be less than ${PASSWORD_RULES.MAX_LENGTH} characters`)
  .regex(UPPERCASE_REGEX, 'Password must contain at least one uppercase letter')
  .regex(LOWERCASE_REGEX, 'Password must contain at least one lowercase letter')
  .regex(DIGIT_REGEX, 'Password must contain at least one number')
  .regex(SPECIAL_CHAR_REGEX, 'Password must contain at least one special character');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(USERNAME_REGEX, 'Username can only contain letters, numbers, and underscores');

export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || PHONE_REGEX.test(val), 
    'Please enter a valid phone number'
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(NAME_REGEX, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ============================================================================
// User Management Schemas
// ============================================================================

export const userEditSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  username: usernameSchema.optional(),
  phone_number: phoneSchema,
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  is_active: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  is_approved: z.boolean().optional(),
});

export const userCreateSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  phone_number: phoneSchema,
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// ============================================================================
// Contact Form Schema
// ============================================================================

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  department: z.string().optional(),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  newsletter: z.boolean().optional(),
});

// ============================================================================
// Profile Schema
// ============================================================================

export const profileUpdateSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  phone_number: phoneSchema,
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// ============================================================================
// Type Exports (Inferred from schemas)
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UserEditFormData = z.infer<typeof userEditSchema>;
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// ============================================================================
// Schema Mapping for Dynamic Use
// ============================================================================

export const validationSchemas = {
  login: loginSchema,
  register: registerSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  changePassword: changePasswordSchema,
  userEdit: userEditSchema,
  userCreate: userCreateSchema,
  contactForm: contactFormSchema,
  profileUpdate: profileUpdateSchema,
} as const;

export type ValidationSchemaKey = keyof typeof validationSchemas;