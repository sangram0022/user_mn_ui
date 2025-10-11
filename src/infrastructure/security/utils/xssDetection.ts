/**
 * XSS Detection Utilities
 * Provides detection and prevention of Cross-Site Scripting attacks
 */

export interface XSSDetectionResult {
  isXSS: boolean;
  threats: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  sanitized?: string;
}

export interface XSSDetectionConfig {
  strictMode: boolean;
  allowedTags: string[];
  allowedAttributes: string[];
  checkUrls: boolean;
  checkEventHandlers: boolean;
}

const DEFAULT_CONFIG: XSSDetectionConfig = {
  strictMode: true,
  allowedTags: ['p', 'br', 'strong', 'em', 'u'],
  allowedAttributes: ['class', 'id'],
  checkUrls: true,
  checkEventHandlers: true,
};

/**
 * Detect potential XSS patterns in input
 */
export function detectXSS(
  input: string,
  config: Partial<XSSDetectionConfig> = {}
): XSSDetectionResult {
  const options = { ...DEFAULT_CONFIG, ...config };
  const threats: string[] = [];
  let severity: XSSDetectionResult['severity'] = 'low';

  if (!input || typeof input !== 'string') {
    return {
      isXSS: false,
      threats: [],
      severity: 'low',
    };
  }

  // Check for script tags
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(input)) {
    threats.push('Script tag detected');
    severity = 'critical';
  }

  // Check for iframe tags
  if (/<iframe\b[^>]*>/gi.test(input)) {
    threats.push('Iframe tag detected');
    severity = upgradeSeverity(severity, 'high');
  }

  // Check for object/embed tags
  if (/<(object|embed)\b[^>]*>/gi.test(input)) {
    threats.push('Object/Embed tag detected');
    severity = upgradeSeverity(severity, 'high');
  }

  // Check for event handlers
  if (options.checkEventHandlers) {
    const eventHandlers = /\s*on\w+\s*=/gi;
    if (eventHandlers.test(input)) {
      threats.push('Event handler detected');
      severity = upgradeSeverity(severity, 'high');
    }
  }

  // Check for javascript: URLs
  if (options.checkUrls) {
    if (/javascript\s*:/gi.test(input)) {
      threats.push('JavaScript URL detected');
      severity = upgradeSeverity(severity, 'critical');
    }

    // Check for data: URLs with scripts
    if (/data\s*:\s*text\/html/gi.test(input)) {
      threats.push('Data URL with HTML detected');
      severity = upgradeSeverity(severity, 'high');
    }
  }

  // Check for vbscript
  if (/vbscript\s*:/gi.test(input)) {
    threats.push('VBScript detected');
    severity = upgradeSeverity(severity, 'critical');
  }

  // Check for expression() CSS
  if (/expression\s*\(/gi.test(input)) {
    threats.push('CSS expression detected');
    severity = upgradeSeverity(severity, 'high');
  }

  // Check for import statements
  if (/@import/gi.test(input)) {
    threats.push('CSS import detected');
    severity = upgradeSeverity(severity, 'medium');
  }

  // Check for style attributes with suspicious content
  if (/style\s*=\s*['"]*[^'"]*(?:javascript|expression|behavior|binding)/gi.test(input)) {
    threats.push('Suspicious style attribute detected');
    severity = upgradeSeverity(severity, 'high');
  }

  // Check for meta refresh
  if (/<meta\b[^>]*http-equiv\s*=\s*['"]*refresh/gi.test(input)) {
    threats.push('Meta refresh detected');
    severity = upgradeSeverity(severity, 'medium');
  }

  // Check for form tags
  if (/<form\b[^>]*>/gi.test(input)) {
    threats.push('Form tag detected');
    severity = upgradeSeverity(severity, 'medium');
  }

  // Check for input/textarea tags
  if (/<(input|textarea|select)\b[^>]*>/gi.test(input)) {
    threats.push('Input element detected');
    severity = upgradeSeverity(severity, 'medium');
  }

  // Check for link tags
  if (/<link\b[^>]*>/gi.test(input)) {
    threats.push('Link tag detected');
    severity = upgradeSeverity(severity, 'medium');
  }

  // Check for base tag
  if (/<base\b[^>]*>/gi.test(input)) {
    threats.push('Base tag detected');
    severity = upgradeSeverity(severity, 'high');
  }

  // Check for suspicious attribute values
  const suspiciousPatterns = [
    /(?:src|href|action)\s*=\s*['"]*(?:javascript|data|vbscript):/gi,
    /(?:src|href|action)\s*=\s*['"]*[^'"]*(?:alert|confirm|prompt)\s*\(/gi,
  ];

  suspiciousPatterns.forEach((pattern) => {
    if (pattern.test(input)) {
      threats.push('Suspicious attribute value detected');
      severity = upgradeSeverity(severity, 'high');
    }
  });

  // Check for encoded scripts
  if (isEncodedScript(input)) {
    threats.push('Encoded script detected');
    severity = upgradeSeverity(severity, 'critical');
  }

  // Check for DOM manipulation attempts
  if (isDOMManipulation(input)) {
    threats.push('DOM manipulation detected');
    severity = upgradeSeverity(severity, 'high');
  }

  // Strict mode additional checks
  if (options.strictMode) {
    // Check for any HTML tags not in allowed list
    const htmlTags = input.match(/<\/?([a-zA-Z0-9]+)[^>]*>/g) || [];
    const disallowedTags = htmlTags.filter((tag) => {
      const tagName = tag.match(/<\/?([a-zA-Z0-9]+)/)?.[1]?.toLowerCase();
      return tagName && !options.allowedTags.includes(tagName);
    });

    if (disallowedTags.length > 0) {
      threats.push(`Disallowed HTML tags detected: ${disallowedTags.join(', ')}`);
      severity = upgradeSeverity(severity, 'medium');
    }
  }

  return {
    isXSS: threats.length > 0,
    threats,
    severity,
  };
}

/**
 * Check if input contains encoded script content
 */
function isEncodedScript(input: string): boolean {
  // Check for HTML entity encoded scripts
  const htmlDecoded = input
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&amp;/gi, '&');

  if (/<script/gi.test(htmlDecoded)) {
    return true;
  }

  // Check for URL encoded scripts
  try {
    const urlDecoded = decodeURIComponent(input);
    if (/<script/gi.test(urlDecoded) || /javascript:/gi.test(urlDecoded)) {
      return true;
    }
  } catch {
    // Invalid URL encoding
  }

  // Check for hex encoded content
  const hexPattern = /(?:%[0-9a-f]{2})+/gi;
  const hexMatches = input.match(hexPattern);
  if (hexMatches) {
    try {
      const hexDecoded = hexMatches.map((hex) => decodeURIComponent(hex)).join('');
      if (/<script/gi.test(hexDecoded) || /javascript:/gi.test(hexDecoded)) {
        return true;
      }
    } catch {
      // Invalid hex encoding
    }
  }

  return false;
}

/**
 * Check if input contains DOM manipulation attempts
 */
function isDOMManipulation(input: string): boolean {
  const domPatterns = [
    /document\s*\.\s*(?:write|writeln|createElement|getElementById)/gi,
    /window\s*\.\s*(?:location|open|eval)/gi,
    /(?:innerHTML|outerHTML|insertAdjacentHTML)/gi,
    /(?:appendChild|insertBefore|replaceChild)/gi,
    /eval\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
  ];

  return domPatterns.some((pattern) => pattern.test(input));
}

/**
 * Upgrade severity level
 */
function upgradeSeverity(
  current: XSSDetectionResult['severity'],
  newLevel: XSSDetectionResult['severity']
): XSSDetectionResult['severity'] {
  const levels = { low: 1, medium: 2, high: 3, critical: 4 };
  return levels[newLevel] > levels[current] ? newLevel : current;
}

/**
 * Sanitize detected XSS threats
 */
export function sanitizeXSS(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove script tags and content
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
    'meta',
    'link',
    'style',
    'base',
  ];

  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    sanitized = sanitized.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '');
  });

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>]*/gi, '');

  // Remove javascript: and vbscript: URLs
  sanitized = sanitized.replace(/(?:javascript|vbscript)\s*:/gi, '');

  // Remove dangerous CSS
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');
  sanitized = sanitized.replace(/@import[^;]*/gi, '');

  return sanitized;
}

/**
 * Create XSS protection middleware
 */
export function createXSSProtection(config?: Partial<XSSDetectionConfig>) {
  const options = { ...DEFAULT_CONFIG, ...config };

  return function xssMiddleware(input: string): XSSDetectionResult {
    const result = detectXSS(input, options);

    if (result.isXSS) {
      result.sanitized = sanitizeXSS(input);
    }

    return result;
  };
}
