/**
 * Text Formatting Utilities
 * Single source of truth for text transformations
 * 
 * @module textFormatters
 * @example
 * import { formatUserRole, formatEnumValue } from '@/shared/utils/textFormatters';
 * 
 * console.log(formatUserRole('super_admin')); // "Super Administrator"
 * console.log(formatEnumValue('pending_approval')); // "Pending Approval"
 */

// ============================================================================
// Types
// ============================================================================

export type UserRole = 'admin' | 'user' | 'auditor' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// ============================================================================
// Enum Formatters
// ============================================================================

/**
 * Format enum value to human-readable text
 * 
 * @param value - Enum value (e.g., "super_admin")
 * @returns Human-readable string (e.g., "Super Admin")
 * 
 * @example
 * formatEnumValue('super_admin') // "Super Admin"
 * formatEnumValue('pending_approval') // "Pending Approval"
 */
export function formatEnumValue(value: string): string {
  if (!value) return '';
  
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Capitalize first letter
 * 
 * @param value - String to capitalize
 * @returns Capitalized string
 * 
 * @example
 * capitalizeFirst('active') // "Active"
 * capitalizeFirst('hello world') // "Hello world"
 */
export function capitalizeFirst(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Capitalize all words
 * 
 * @param value - String to capitalize
 * @returns String with all words capitalized
 * 
 * @example
 * capitalizeWords('hello world') // "Hello World"
 */
export function capitalizeWords(value: string): string {
  if (!value) return '';
  return value.replace(/\b\w/g, char => char.toUpperCase());
}

// ============================================================================
// User-Specific Formatters
// ============================================================================

/**
 * Format user role with custom mapping
 * 
 * @param role - User role
 * @returns Formatted role name
 * 
 * @example
 * formatUserRole('super_admin') // "Super Administrator"
 * formatUserRole('auditor') // "Auditor"
 */
export function formatUserRole(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'Administrator',
    'user': 'User',
    'auditor': 'Auditor',
    'super_admin': 'Super Administrator',
    'guest': 'Guest',
  };
  
  return roleMap[role] || formatEnumValue(role);
}

/**
 * Format user status with custom mapping
 * 
 * @param status - User status
 * @returns Formatted status name
 * 
 * @example
 * formatUserStatus('pending') // "Pending Approval"
 * formatUserStatus('active') // "Active"
 */
export function formatUserStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'suspended': 'Suspended',
    'pending': 'Pending Approval',
    'locked': 'Locked',
  };
  
  return statusMap[status] || capitalizeFirst(status);
}

// ============================================================================
// Text Manipulation
// ============================================================================

/**
 * Truncate text with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 * 
 * @example
 * truncateText('Hello World', 8) // "Hello..."
 * truncateText('Hi', 10) // "Hi"
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Convert text to URL-friendly slug
 * 
 * @param text - Text to slugify
 * @returns URL-friendly slug
 * 
 * @example
 * slugify('Hello World!') // "hello-world"
 * slugify('React & TypeScript') // "react-typescript"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get initials from name
 * 
 * @param name - Full name
 * @returns Initials (e.g., "JS" for "John Smith")
 * 
 * @example
 * getInitials('John Smith') // "JS"
 * getInitials('Mary') // "M"
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (
    parts[0].charAt(0) + 
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

/**
 * Format full name from first and last name
 * 
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Full name
 * 
 * @example
 * formatFullName('John', 'Smith') // "John Smith"
 */
export function formatFullName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Remove extra whitespace
 * 
 * @param text - Text with potential extra whitespace
 * @returns Cleaned text
 * 
 * @example
 * removeExtraWhitespace('Hello   World') // "Hello World"
 */
export function removeExtraWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Convert camelCase to Title Case
 * 
 * @param text - camelCase string
 * @returns Title Case string
 * 
 * @example
 * camelToTitle('firstName') // "First Name"
 * camelToTitle('userId') // "User Id"
 */
export function camelToTitle(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Mask sensitive information
 * 
 * @param text - Text to mask
 * @param visibleChars - Number of visible characters at start/end
 * @returns Masked text
 * 
 * @example
 * maskText('1234567890', 2) // "12******90"
 * maskText('secret', 1) // "s****t"
 */
export function maskText(text: string, visibleChars: number = 4): string {
  if (!text || text.length <= visibleChars * 2) return text;
  
  const start = text.substring(0, visibleChars);
  const end = text.substring(text.length - visibleChars);
  const maskedLength = text.length - (visibleChars * 2);
  
  return `${start}${'*'.repeat(maskedLength)}${end}`;
}
