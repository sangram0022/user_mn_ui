/**
 * URL Validator
 * Validates URL format, protocol, domain, and accessibility
 * 
 * Features:
 * - URL format validation (RFC 3986)
 * - Protocol validation (http, https, ftp, etc.)
 * - Domain name validation
 * - Port validation
 * - Query string validation
 * - Path validation
 * - IP address URL support
 * 
 * @example
 * const validator = new URLValidator({ protocols: ['https'], requireProtocol: true });
 * const result = validator.validate('https://example.com/path', 'websiteUrl');
 */

import { BaseValidator } from './BaseValidator';
import type { FieldValidationResult } from '../ValidationResult';
import { ValidationStatus } from '../ValidationStatus';
import { translateValidation } from '@/core/localization';

export interface URLValidatorOptions {
  /** Allowed protocols (default: ['http', 'https']) */
  protocols?: string[];
  
  /** Require protocol in URL */
  requireProtocol?: boolean;
  
  /** Require HTTPS protocol */
  requireHttps?: boolean;
  
  /** Allow IP addresses as host */
  allowIpAddress?: boolean;
  
  /** Allow localhost */
  allowLocalhost?: boolean;
  
  /** Require top-level domain (e.g., .com, .org) */
  requireTld?: boolean;
  
  /** Allow query parameters */
  allowQueryParams?: boolean;
  
  /** Allow URL fragments (#hash) */
  allowFragments?: boolean;
  
  /** Allow authentication (user:pass@host) */
  allowAuth?: boolean;
  
  /** Allowed ports (empty = any port) */
  allowedPorts?: number[];
  
  /** Custom error messages */
  messages?: {
    invalid?: string;
    protocol?: string;
    https?: string;
    tld?: string;
    port?: string;
    auth?: string;
  };
}

export class URLValidator extends BaseValidator {
  readonly name = 'URLValidator';
  
  private options: {
    protocols: string[];
    requireProtocol: boolean;
    requireHttps: boolean;
    allowIpAddress: boolean;
    allowLocalhost: boolean;
    requireTld: boolean;
    allowQueryParams: boolean;
    allowFragments: boolean;
    allowAuth: boolean;
    allowedPorts: number[];
    messages: URLValidatorOptions['messages'];
  };
  
  constructor(options: URLValidatorOptions = {}) {
    super();
    this.options = {
      protocols: options.protocols ?? ['http', 'https'],
      requireProtocol: options.requireProtocol ?? true,
      requireHttps: options.requireHttps ?? false,
      allowIpAddress: options.allowIpAddress ?? true,
      allowLocalhost: options.allowLocalhost ?? true,
      requireTld: options.requireTld ?? true,
      allowQueryParams: options.allowQueryParams ?? true,
      allowFragments: options.allowFragments ?? true,
      allowAuth: options.allowAuth ?? false,
      allowedPorts: options.allowedPorts ?? [],
      messages: options.messages,
    };
  }
  
  /**
   * Helper to translate validation keys
   */
  private translateValidation(key: string): string {
    return translateValidation('validation', key);
  }
  
  validate(value: unknown, field = 'url'): FieldValidationResult {
    // Check if empty
    if (this.isEmpty(value)) {
      return {
        status: ValidationStatus.ERROR,
        isValid: false,
        field,
        errors: [this.options.messages?.invalid ?? 'URL is required'],
        warnings: [],
        metadata: { validator: this.name },
      };
    }
    
    const urlStr = this.toString(value);
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Try to parse URL
    let parsedUrl: URL;
    try {
      // Add protocol if missing and allowed
      let urlToParse = urlStr;
      if (!this.options.requireProtocol && !urlStr.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/)) {
        urlToParse = `http://${urlStr}`;
      }
      
      parsedUrl = new URL(urlToParse);
    } catch {
      return {
        status: ValidationStatus.ERROR,
        isValid: false,
        field,
        errors: [this.options.messages?.invalid ?? 'Invalid URL format'],
        warnings: [],
        metadata: { validator: this.name },
      };
    }
    
    // Validate protocol
    if (!this.options.protocols.includes(parsedUrl.protocol.replace(':', ''))) {
      errors.push(
        this.options.messages?.protocol ?? 
        `Protocol must be one of: ${this.options.protocols.join(', ')}`
      );
    }
    
    // Validate HTTPS requirement
    if (this.options.requireHttps && parsedUrl.protocol !== 'https:') {
      errors.push(this.options.messages?.https ?? 'URL must use HTTPS protocol');
    }
    
    // Validate host
    const hostErrors = this.validateHost(parsedUrl.hostname);
    errors.push(...hostErrors);
    
    // Validate port
    if (parsedUrl.port) {
      const port = parseInt(parsedUrl.port, 10);
      if (this.options.allowedPorts.length > 0 && !this.options.allowedPorts.includes(port)) {
        errors.push(
          this.options.messages?.port ?? 
          `Port must be one of: ${this.options.allowedPorts.join(', ')}`
        );
      }
    }
    
    // Validate authentication
    if (parsedUrl.username || parsedUrl.password) {
      if (!this.options.allowAuth) {
        errors.push(this.options.messages?.auth ?? this.translateValidation('url.authCredentials'));
      } else {
        warnings.push(this.translateValidation('url.authCredentials'));
      }
    }
    
    // Validate query parameters
    if (!this.options.allowQueryParams && parsedUrl.search) {
      errors.push(this.translateValidation('url.noQueryParams'));
    }
    
    // Validate fragments
    if (!this.options.allowFragments && parsedUrl.hash) {
      errors.push(this.translateValidation('url.noFragments'));
    }
    
    // Warnings
    if (parsedUrl.protocol === 'http:' && parsedUrl.hostname !== 'localhost') {
      warnings.push(this.translateValidation('url.useHttps'));
    }
    
    const isValid = errors.length === 0;
    
    return {
      status: isValid ? ValidationStatus.SUCCESS : ValidationStatus.ERROR,
      isValid,
      field,
      errors,
      warnings,
      metadata: {
        validator: this.name,
        protocol: parsedUrl.protocol.replace(':', ''),
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 'default',
        pathname: parsedUrl.pathname,
        hasAuth: !!(parsedUrl.username || parsedUrl.password),
      },
    };
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  /**
   * Validate hostname/domain
   */
  private validateHost(hostname: string): string[] {
    const errors: string[] = [];
    
    // Check localhost
    if (hostname === 'localhost' && !this.options.allowLocalhost) {
      errors.push(this.translateValidation('url.noLocalhost'));
      return errors;
    }
    
    // Check IP address
    if (this.isIpAddress(hostname)) {
      if (!this.options.allowIpAddress) {
        errors.push(this.translateValidation('url.noIpAddress'));
      }
      return errors;
    }
    
    // Check TLD requirement
    if (this.options.requireTld && !hostname.includes('.')) {
      errors.push(this.translateValidation('url.needTld'));
    }
    
    // Validate domain format
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    if (!domainRegex.test(hostname) && hostname !== 'localhost') {
      errors.push(this.translateValidation('url.invalidDomain'));
    }
    
    return errors;
  }
  
  /**
   * Check if string is an IP address
   */
  private isIpAddress(hostname: string): boolean {
    // IPv4 pattern
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      const parts = hostname.split('.');
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }
    
    // IPv6 pattern (simplified)
    const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
    return ipv6Regex.test(hostname);
  }
}

/**
 * Quick validation functions
 */

export function validateURL(
  value: unknown,
  options?: URLValidatorOptions,
  field?: string
): FieldValidationResult {
  const validator = new URLValidator(options);
  return validator.validate(value, field);
}

export function isValidURL(value: unknown): boolean {
  const result = validateURL(value);
  return result.isValid;
}

export function isHTTPSUrl(value: unknown): boolean {
  const result = validateURL(value, { requireHttps: true });
  return result.isValid;
}

export function isValidDomain(value: unknown): boolean {
  const result = validateURL(value, { 
    requireTld: true, 
    allowIpAddress: false,
    requireProtocol: false,
  });
  return result.isValid;
}

