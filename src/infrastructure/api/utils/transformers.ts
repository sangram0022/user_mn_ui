/**
 * API Response transformers for normalizing backend responses
 */

export interface TransformOptions {
  camelCase?: boolean;
  snakeCase?: boolean;
  removeNulls?: boolean;
  dateFields?: string[];
}

export const transformKeys = (obj: unknown, toCamelCase: boolean): unknown => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, toCamelCase));
  }

  const result: unknown = {};

  Object.keys(obj).forEach((key) => {
    const newKey = toCamelCase ? toCamelCase_fn(key) : toSnakeCase(key);
    result[newKey] = transformKeys(obj[key], toCamelCase);
  });

  return result;
};

export const toCamelCase_fn = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

export const toSnakeCase = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const removeNullValues = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeNullValues).filter((item) => item !== null);
  }

  if (typeof obj === 'object') {
    const result: unknown = {};
    Object.keys(obj).forEach((key) => {
      const value = removeNullValues(obj[key]);
      if (value !== null && value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }

  return obj;
};

export const transformDates = (obj: unknown, dateFields: string[]): unknown => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformDates(item, dateFields));
  }

  const result: unknown = { ...obj };

  dateFields.forEach((field) => {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = new Date(result[field]);
      } catch {
        console.warn(`Failed to parse date field ${field}:`, result[field]);
      }
    }
  });

  // Recursively transform nested objects
  Object.keys(result).forEach((key) => {
    if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = transformDates(result[key], dateFields);
    }
  });

  return result;
};

export const transformApiResponse = <T>(data: unknown, options: TransformOptions = {}): T => {
  let result = data;

  // Transform keys
  if (options.camelCase) {
    result = transformKeys(result, true);
  } else if (options.snakeCase) {
    result = transformKeys(result, false);
  }

  // Remove null values
  if (options.removeNulls) {
    result = removeNullValues(result);
  }

  // Transform date fields
  if (options.dateFields && options.dateFields.length > 0) {
    result = transformDates(result, options.dateFields);
  }

  return result as T;
};

// Predefined transformers for common use cases
export const transformUser = (userData: unknown) =>
  transformApiResponse(userData, {
    camelCase: true,
    dateFields: ['created_at', 'updated_at', 'last_login_at'],
    removeNulls: true,
  });

export const transformAuthResponse = (authData: unknown) =>
  transformApiResponse(authData, {
    camelCase: true,
    dateFields: ['expires_at', 'last_login_at'],
    removeNulls: true,
  });

export const transformAuditLog = (auditData: unknown) =>
  transformApiResponse(auditData, {
    camelCase: true,
    dateFields: ['timestamp', 'created_at'],
    removeNulls: true,
  });

export const transformAnalyticsEvent = (eventData: unknown) =>
  transformApiResponse(eventData, {
    camelCase: true,
    dateFields: ['timestamp', 'created_at'],
    removeNulls: true,
  });

export const transformWorkflow = (workflowData: unknown) =>
  transformApiResponse(workflowData, {
    camelCase: true,
    dateFields: ['created_at', 'updated_at', 'completed_at'],
    removeNulls: true,
  });
