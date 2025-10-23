/**
 * URL and Query Parameter Utility Functions
 *
 * Common URL manipulation and query string utilities to reduce code duplication
 * and provide consistent URL operations across the application.
 *
 * @module urlUtils
 */

/**
 * Builds query string from object
 *
 * @param params - Object with query parameters
 * @param options - Build options
 * @returns Query string (without leading '?')
 *
 * @example
 * buildQueryString({ page: 1, sort: 'name' }) // "page=1&sort=name"
 * buildQueryString({ tags: ['a', 'b'] }) // "tags=a&tags=b"
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | unknown[] | null | undefined>,
  options: {
    encode?: boolean;
    arrayFormat?: 'bracket' | 'repeat' | 'comma';
    skipNull?: boolean;
    skipEmpty?: boolean;
  } = {}
): string {
  const { encode = true, arrayFormat = 'repeat', skipNull = true, skipEmpty = true } = options;

  const parts: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    // Skip null/undefined
    if (skipNull && (value === null || value === undefined)) {
      return;
    }

    // Skip empty strings
    if (skipEmpty && value === '') {
      return;
    }

    const encodedKey = encode ? encodeURIComponent(key) : key;

    // Handle arrays
    if (Array.isArray(value)) {
      if (arrayFormat === 'bracket') {
        value.forEach((item) => {
          const encodedValue = encode ? encodeURIComponent(String(item)) : String(item);
          parts.push(`${encodedKey}[]=${encodedValue}`);
        });
      } else if (arrayFormat === 'comma') {
        const encodedValue = encode
          ? value.map((v) => encodeURIComponent(String(v))).join(',')
          : value.join(',');
        parts.push(`${encodedKey}=${encodedValue}`);
      } else {
        // repeat
        value.forEach((item) => {
          const encodedValue = encode ? encodeURIComponent(String(item)) : String(item);
          parts.push(`${encodedKey}=${encodedValue}`);
        });
      }
    } else {
      const encodedValue = encode ? encodeURIComponent(String(value)) : String(value);
      parts.push(`${encodedKey}=${encodedValue}`);
    }
  });

  return parts.join('&');
}

/**
 * Parses query string to object
 *
 * @param queryString - Query string (with or without leading '?')
 * @param options - Parse options
 * @returns Object with parsed parameters
 *
 * @example
 * parseQueryString('page=1&sort=name') // { page: '1', sort: 'name' }
 * parseQueryString('?tags=a&tags=b', { parseArrays: true }) // { tags: ['a', 'b'] }
 */
export function parseQueryString(
  queryString: string,
  options: {
    decode?: boolean;
    parseArrays?: boolean;
    parseNumbers?: boolean;
    parseBooleans?: boolean;
  } = {}
): Record<string, string | (string | number | boolean)[] | number | boolean> {
  const {
    decode = true,
    parseArrays = true,
    parseNumbers = false,
    parseBooleans = false,
  } = options;

  // Remove leading '?' if present
  const cleaned = queryString.startsWith('?') ? queryString.slice(1) : queryString;

  if (!cleaned) {
    return {};
  }

  const result: Record<string, string | (string | number | boolean)[] | number | boolean> = {};

  cleaned.split('&').forEach((part) => {
    const [keyPart, valuePart = ''] = part.split('=');

    const key = decode ? decodeURIComponent(keyPart) : keyPart;
    let value: string | number | boolean = decode ? decodeURIComponent(valuePart) : valuePart;

    // Parse numbers
    if (parseNumbers && !Number.isNaN(Number(value))) {
      value = Number(value);
    }

    // Parse booleans
    if (parseBooleans && (value === 'true' || value === 'false')) {
      value = value === 'true';
    }

    // Handle arrays
    if (parseArrays) {
      const arrayKey = key.endsWith('[]') ? key.slice(0, -2) : key;

      if (result[arrayKey]) {
        if (Array.isArray(result[arrayKey])) {
          (result[arrayKey] as (string | number | boolean)[]).push(value);
        } else {
          const existingValue = result[arrayKey];
          result[arrayKey] = [existingValue, value] as (string | number | boolean)[];
        }
      } else {
        result[arrayKey] = value;
      }
    } else {
      result[key] = value;
    }
  });

  return result;
}

/**
 * Appends query parameters to URL
 *
 * @param url - Base URL
 * @param params - Parameters to append
 * @returns URL with query parameters
 *
 * @example
 * appendQueryParams('/users', { page: 1, sort: 'name' })
 * // "/users?page=1&sort=name"
 */
export function appendQueryParams(
  url: string,
  params: Record<string, string | number | boolean | unknown[] | null | undefined>
): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const queryString = buildQueryString(params);
  if (!queryString) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
}

/**
 * Updates query parameters in URL
 *
 * @param url - URL to update
 * @param params - Parameters to update/add
 * @returns Updated URL
 *
 * @example
 * updateQueryParams('/users?page=1', { page: 2, sort: 'name' })
 * // "/users?page=2&sort=name"
 */
export function updateQueryParams(
  url: string,
  params: Record<string, string | number | boolean | unknown[] | null | undefined>
): string {
  const [baseUrl, existingQuery = ''] = url.split('?');
  const existingParams = parseQueryString(existingQuery);

  const updatedParams = { ...existingParams, ...params };
  const newQuery = buildQueryString(
    updatedParams as Record<string, string | number | boolean | unknown[] | null | undefined>
  );

  return newQuery ? `${baseUrl}?${newQuery}` : baseUrl;
}

/**
 * Removes query parameters from URL
 *
 * @param url - URL to process
 * @param keys - Keys to remove (or all if not specified)
 * @returns URL without specified parameters
 *
 * @example
 * removeQueryParams('/users?page=1&sort=name', ['page'])
 * // "/users?sort=name"
 * removeQueryParams('/users?page=1&sort=name')
 * // "/users"
 */
export function removeQueryParams(url: string, keys?: string[]): string {
  if (!url.includes('?')) {
    return url;
  }

  const [baseUrl, queryString] = url.split('?');

  if (!keys) {
    return baseUrl;
  }

  const params = parseQueryString(queryString);
  keys.forEach((key) => delete params[key]);

  const newQuery = buildQueryString(
    params as Record<string, string | number | boolean | unknown[] | null | undefined>
  );
  return newQuery ? `${baseUrl}?${newQuery}` : baseUrl;
}

/**
 * Extracts path segments from URL
 *
 * @param url - URL or path
 * @returns Array of path segments
 *
 * @example
 * getPathSegments('/users/123/profile') // ['users', '123', 'profile']
 * getPathSegments('https://example.com/api/v1/users') // ['api', 'v1', 'users']
 */
export function getPathSegments(url: string): string[] {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').filter(Boolean);
  } catch {
    // Not a full URL, treat as path
    return url.split('?')[0].split('/').filter(Boolean);
  }
}

/**
 * Joins URL parts correctly (handles trailing/leading slashes)
 *
 * @param parts - URL parts to join
 * @returns Joined URL
 *
 * @example
 * joinUrl('https://api.example.com/', '/users/', '123')
 * // "https://api.example.com/users/123"
 */
export function joinUrl(...parts: (string | number)[]): string {
  return parts
    .map((part, index) => {
      let str = String(part);

      // Remove leading slash except for first part
      if (index > 0 && str.startsWith('/')) {
        str = str.slice(1);
      }

      // Remove trailing slash except for last part
      if (index < parts.length - 1 && str.endsWith('/')) {
        str = str.slice(0, -1);
      }

      return str;
    })
    .join('/');
}

/**
 * Checks if URL is absolute (has protocol)
 *
 * @param url - URL to check
 * @returns True if absolute URL
 *
 * @example
 * isAbsoluteUrl('https://example.com') // true
 * isAbsoluteUrl('/users') // false
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url);
}

/**
 * Checks if URL is external (different origin)
 *
 * @param url - URL to check
 * @param currentOrigin - Current origin (default: window.location.origin)
 * @returns True if external URL
 *
 * @example
 * isExternalUrl('https://google.com') // true
 * isExternalUrl('/users') // false
 */
export function isExternalUrl(url: string, currentOrigin?: string): boolean {
  if (!isAbsoluteUrl(url)) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    const origin = currentOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
    return urlObj.origin !== origin;
  } catch {
    return false;
  }
}

/**
 * Gets query parameter value from URL or current location
 *
 * @param key - Parameter key
 * @param url - URL to parse (default: window.location.search)
 * @returns Parameter value or null
 *
 * @example
 * getQueryParam('page') // "1" (from current URL)
 * getQueryParam('sort', '/users?sort=name') // "name"
 */
export function getQueryParam(key: string, url?: string): string | null {
  const queryString = url
    ? url.split('?')[1] || ''
    : typeof window !== 'undefined'
      ? window.location.search.slice(1)
      : '';

  const params = parseQueryString(queryString);
  const value = params[key];

  return value ? String(value) : null;
}

/**
 * Normalizes URL (removes trailing slash, sorts query params)
 *
 * @param url - URL to normalize
 * @param options - Normalization options
 * @returns Normalized URL
 *
 * @example
 * normalizeUrl('https://example.com/users/?sort=name&page=1')
 * // "https://example.com/users?page=1&sort=name"
 */
export function normalizeUrl(
  url: string,
  options: {
    removeTrailingSlash?: boolean;
    sortQueryParams?: boolean;
    lowercase?: boolean;
  } = {}
): string {
  const { removeTrailingSlash = true, sortQueryParams = true, lowercase = false } = options;

  let normalized = url;

  // Lowercase
  if (lowercase) {
    normalized = normalized.toLowerCase();
  }

  // Split URL and query
  const [path, queryString] = normalized.split('?');
  let normalizedPath = path;

  // Remove trailing slash
  if (removeTrailingSlash && normalizedPath.endsWith('/') && normalizedPath !== '/') {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // Sort query params
  if (queryString && sortQueryParams) {
    const params = parseQueryString(queryString);
    const sortedKeys = Object.keys(params).sort();
    const sortedParams: Record<string, string | number | boolean | (string | number | boolean)[]> =
      {};

    sortedKeys.forEach((key) => {
      sortedParams[key] = params[key];
    });

    const newQuery = buildQueryString(
      sortedParams as Record<string, string | number | boolean | unknown[] | null | undefined>
    );
    return newQuery ? `${normalizedPath}?${newQuery}` : normalizedPath;
  }

  return queryString ? `${normalizedPath}?${queryString}` : normalizedPath;
}

/**
 * Builds API URL from base, path, and params
 *
 * @param base - Base URL
 * @param path - API path
 * @param params - Query parameters
 * @returns Complete API URL
 *
 * @example
 * buildApiUrl('https://api.example.com', '/users', { page: 1 })
 * // "https://api.example.com/users?page=1"
 */
export function buildApiUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | boolean | unknown[] | null | undefined>
): string {
  const url = joinUrl(base, path);
  return params ? appendQueryParams(url, params) : url;
}

/**
 * Extracts domain from URL
 *
 * @param url - URL to parse
 * @returns Domain or empty string
 *
 * @example
 * getDomain('https://api.example.com/users') // "example.com"
 * getDomain('https://subdomain.example.co.uk') // "example.co.uk"
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Simple extraction (works for most cases)
    const parts = hostname.split('.');

    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }

    return hostname;
  } catch {
    return '';
  }
}

/**
 * Safely creates URL object (SSR-safe)
 *
 * @param url - URL string
 * @param base - Base URL (default: window.location.href)
 * @returns URL object or null
 *
 * @example
 * const urlObj = safeUrl('/users', 'https://example.com');
 * console.log(urlObj?.pathname); // "/users"
 */
export function safeUrl(url: string, base?: string): URL | null {
  try {
    const baseUrl = base || (typeof window !== 'undefined' ? window.location.href : undefined);
    return new URL(url, baseUrl);
  } catch {
    return null;
  }
}
