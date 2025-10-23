/**
 * String Utility Functions
 *
 * Common string manipulation utilities to reduce code duplication
 * and provide consistent string operations across the application.
 *
 * @module stringUtils
 */

/**
 * Capitalizes the first letter of a string
 *
 * @param str - String to capitalize
 * @returns String with first letter capitalized
 *
 * @example
 * capitalize('hello') // "Hello"
 * capitalize('WORLD') // "WORLD"
 * capitalize('') // ""
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalizes the first letter and lowercases the rest
 *
 * @param str - String to format
 * @returns Properly capitalized string
 *
 * @example
 * capitalizeFirst('hello') // "Hello"
 * capitalizeFirst('WORLD') // "World"
 * capitalizeFirst('hELLo WoRLD') // "Hello world"
 */
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts string to title case (capitalize each word)
 *
 * @param str - String to convert
 * @returns Title cased string
 *
 * @example
 * toTitleCase('hello world') // "Hello World"
 * toTitleCase('the quick brown fox') // "The Quick Brown Fox"
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Converts camelCase or PascalCase to readable format
 *
 * @param str - String in camelCase or PascalCase
 * @returns Human-readable string
 *
 * @example
 * camelToReadable('userName') // "User Name"
 * camelToReadable('firstName') // "First Name"
 * camelToReadable('isActive') // "Is Active"
 */
export function camelToReadable(str: string): string {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
}

/**
 * Converts snake_case to readable format
 *
 * @param str - String in snake_case
 * @returns Human-readable string
 *
 * @example
 * snakeToReadable('user_name') // "User Name"
 * snakeToReadable('first_name') // "First Name"
 * snakeToReadable('is_active') // "Is Active"
 */
export function snakeToReadable(str: string): string {
  if (!str) return '';
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Converts kebab-case to readable format
 *
 * @param str - String in kebab-case
 * @returns Human-readable string
 *
 * @example
 * kebabToReadable('user-name') // "User Name"
 * kebabToReadable('first-name') // "First Name"
 */
export function kebabToReadable(str: string): string {
  if (!str) return '';
  return str
    .split('-')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Truncates a string to a maximum length with ellipsis
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length (default: 50)
 * @param ellipsis - Ellipsis character (default: '...')
 * @returns Truncated string
 *
 * @example
 * truncate('Hello World', 8) // "Hello..."
 * truncate('Short', 10) // "Short"
 * truncate('Hello World', 8, '…') // "Hello W…"
 */
export function truncate(str: string, maxLength = 50, ellipsis = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Truncates a string at word boundary
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length (default: 50)
 * @param ellipsis - Ellipsis character (default: '...')
 * @returns Truncated string at word boundary
 *
 * @example
 * truncateWords('Hello World from React', 12) // "Hello World..."
 * truncateWords('Hello World', 20) // "Hello World"
 */
export function truncateWords(str: string, maxLength = 50, ellipsis = '...'): string {
  if (!str || str.length <= maxLength) return str;

  const truncated = str.slice(0, maxLength - ellipsis.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + ellipsis;
  }

  return truncated + ellipsis;
}

/**
 * Pluralizes a word based on count
 *
 * @param count - Number to check
 * @param singular - Singular form of word
 * @param plural - Plural form (optional, adds 's' by default)
 * @returns Correctly pluralized string
 *
 * @example
 * pluralize(1, 'item') // "1 item"
 * pluralize(5, 'item') // "5 items"
 * pluralize(1, 'person', 'people') // "1 person"
 * pluralize(3, 'person', 'people') // "3 people"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
}

/**
 * Removes all whitespace from a string
 *
 * @param str - String to process
 * @returns String without whitespace
 *
 * @example
 * removeWhitespace('  hello  world  ') // "helloworld"
 */
export function removeWhitespace(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, '');
}

/**
 * Normalizes whitespace (multiple spaces to single space, trim)
 *
 * @param str - String to normalize
 * @returns Normalized string
 *
 * @example
 * normalizeWhitespace('  hello    world  ') // "hello world"
 */
export function normalizeWhitespace(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Slugifies a string (URL-friendly format)
 *
 * @param str - String to slugify
 * @returns URL-friendly slug
 *
 * @example
 * slugify('Hello World!') // "hello-world"
 * slugify('User Name (Admin)') // "user-name-admin"
 */
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Escapes HTML special characters
 *
 * @param str - String to escape
 * @returns Escaped string
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Checks if string is empty or contains only whitespace
 *
 * @param str - String to check
 * @returns True if empty or whitespace only
 *
 * @example
 * isEmpty('') // true
 * isEmpty('   ') // true
 * isEmpty('hello') // false
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Checks if string contains a substring (case-insensitive)
 *
 * @param str - String to search in
 * @param search - Substring to search for
 * @returns True if contains substring
 *
 * @example
 * containsIgnoreCase('Hello World', 'WORLD') // true
 * containsIgnoreCase('Hello World', 'xyz') // false
 */
export function containsIgnoreCase(str: string, search: string): boolean {
  if (!str || !search) return false;
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Extracts initials from a name
 *
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials in uppercase
 *
 * @example
 * getInitials('John Doe') // "JD"
 * getInitials('Mary Jane Watson') // "MJ"
 * getInitials('Mary Jane Watson', 3) // "MJW"
 */
export function getInitials(name: string, maxInitials = 2): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, maxInitials)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials;
}

/**
 * Masks sensitive information (e.g., email, phone)
 *
 * @param str - String to mask
 * @param visibleStart - Characters visible at start (default: 3)
 * @param visibleEnd - Characters visible at end (default: 3)
 * @param maskChar - Character to use for masking (default: '*')
 * @returns Masked string
 *
 * @example
 * maskString('1234567890') // "123****890"
 * maskString('john@example.com', 2, 8) // "jo****ample.com"
 */
export function maskString(str: string, visibleStart = 3, visibleEnd = 3, maskChar = '*'): string {
  if (!str || str.length <= visibleStart + visibleEnd) return str;

  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const maskLength = str.length - visibleStart - visibleEnd;

  return `${start}${maskChar.repeat(maskLength)}${end}`;
}

/**
 * Formats a string as a phone number (US format)
 *
 * @param phone - Phone number string (digits only)
 * @returns Formatted phone number
 *
 * @example
 * formatPhone('1234567890') // "(123) 456-7890"
 * formatPhone('123456') // "123-456" (partial)
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.charAt(0) === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Partial formatting
  if (cleaned.length > 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length > 3) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  return cleaned;
}

/**
 * Generates a random string
 *
 * @param length - Length of random string (default: 16)
 * @param charset - Character set to use (default: alphanumeric)
 * @returns Random string
 *
 * @example
 * randomString(8) // "a7bK9mPq"
 * randomString(10, 'numeric') // "1234567890"
 */
export function randomString(
  length = 16,
  charset: 'alphanumeric' | 'alphabetic' | 'numeric' | 'hex' = 'alphanumeric'
): string {
  const charsets = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alphabetic: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789',
    hex: '0123456789abcdef',
  };

  const chars = charsets[charset];
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
