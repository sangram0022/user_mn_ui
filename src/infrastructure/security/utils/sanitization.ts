/**
 * Input Sanitization Utilities
 * Provides comprehensive input sanitization to prevent XSS and injection attacks
 */

interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripHtml?: boolean;
  normalizeWhitespace?: boolean;
  maxLength?: number;
}

const DEFAULT_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'ol',
  'ul',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
];

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  code: ['class'],
  pre: ['class'],
};

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string, options: SanitizationOptions = {}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
    stripHtml = false,
    maxLength,
  } = options;

  let sanitized = input;

  // Truncate if max length specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  if (stripHtml) {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } else {
    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove dangerous tags
    const dangerousTags = [
      'script',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'textarea',
      'select',
      'button',
      'meta',
      'link',
      'style',
    ];

    dangerousTags.forEach((tag) => {
      const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      sanitized = sanitized.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
    });

    // Remove event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>]*/gi, '');

    // Remove javascript: urls
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: urls (except for images)
    sanitized = sanitized.replace(/data:(?!image\/)/gi, '');

    // Filter allowed tags and attributes
    sanitized = filterAllowedTags(sanitized, allowedTags, allowedAttributes);
  }

  // Encode remaining special characters
  sanitized = htmlEncode(sanitized);

  return sanitized;
}

/**
 * Sanitize text input
 */
export function sanitizeText(input: string, options: SanitizationOptions = {}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const { normalizeWhitespace = true, maxLength } = options;

  let sanitized = input;

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Normalize whitespace
  if (normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
  }

  // Truncate if max length specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Encode special characters
  sanitized = htmlEncode(sanitized);

  return sanitized;
}

/**
 * Sanitize input for database queries
 */
export function sanitizeForDatabase(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potential SQL injection characters
  return input
    .replace(/['"`;\\]/g, '') // Remove quotes, semicolons, backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .trim();
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return '';
  }

  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscore
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .substring(0, 255); // Limit length
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
  const lowerUrl = url.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  // Allow only http, https, and relative URLs
  if (!/^(https?:\/\/|\/|#)/.test(url)) {
    return '';
  }

  return url;
}

/**
 * General input sanitization
 */
export function sanitizeInput(
  input: string,
  type: 'html' | 'text' | 'url' | 'filename' | 'database' = 'text',
  options?: SanitizationOptions
): string {
  switch (type) {
    case 'html':
      return sanitizeHtml(input, options);
    case 'url':
      return sanitizeUrl(input);
    case 'filename':
      return sanitizeFileName(input);
    case 'database':
      return sanitizeForDatabase(input);
    case 'text':
    default:
      return sanitizeText(input, options);
  }
}

/**
 * Filter allowed HTML tags and attributes
 */
function filterAllowedTags(
  html: string,
  allowedTags: string[],
  allowedAttributes: Record<string, string[]>
): string {
  // Simple implementation - in production, use a proper HTML parser
  const tagRegex = /<(\/?)([\w-]+)([^>]*)>/gi;

  return html.replace(tagRegex, (_match, isClosing, tagName, attributes) => {
    const tag = tagName.toLowerCase();

    if (!allowedTags.includes(tag)) {
      return '';
    }

    if (isClosing) {
      return `</${tag}>`;
    }

    // Filter attributes
    const allowedAttrs = allowedAttributes[tag] || [];
    if (allowedAttrs.length === 0) {
      return `<${tag}>`;
    }

    const filteredAttributes = filterAttributes(attributes, allowedAttrs);
    return `<${tag}${filteredAttributes}>`;
  });
}

/**
 * Filter HTML attributes
 */
function filterAttributes(attributeString: string, allowedAttributes: string[]): string {
  if (!attributeString.trim()) {
    return '';
  }

  const attrRegex = /(\w+)=['"]([^'"]*)['"]/g;
  const filteredAttrs: string[] = [];
  let match;

  while ((match = attrRegex.exec(attributeString)) !== null) {
    const [, attrName, attrValue] = match;

    if (allowedAttributes.includes(attrName.toLowerCase())) {
      const sanitizedValue = htmlEncode(attrValue);
      filteredAttrs.push(`${attrName}="${sanitizedValue}"`);
    }
  }

  return filteredAttrs.length > 0 ? ` ${filteredAttrs.join(' ')}` : '';
}

/**
 * HTML encode special characters
 */
function htmlEncode(text: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => entityMap[char] || char);
}
