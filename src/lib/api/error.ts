export interface ApiErrorInit { status: number;
  message: string;
  code?: string;
  detail?: string;
  errors?: Record<string, unknown> | undefined;
  headers?: Headers | Record<string, string>;
  timestamp?: string;
  requestId?: string;
  payload?: unknown; }

/**
 * Rich HTTP error object produced by the API client.
 * Captures metadata such as status code, correlation IDs, and retry hints.
 */
export class ApiError extends Error { public readonly status: number;
  public readonly code?: string;
  public readonly detail?: string;
  public readonly errors?: Record<string, unknown>;
  public readonly headers: Record<string, string>;
  public readonly retryAfterSeconds?: number;
  public readonly timestamp: string;
  public readonly requestId?: string;
  public readonly payload?: unknown;

  constructor(init: ApiErrorInit) {
    super(init.message);

    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.detail = init.detail;
    this.errors = init.errors;
    this.payload = init.payload;

    this.headers = ApiError.normalizeHeaders(init.headers);
    this.retryAfterSeconds = ApiError.parseRetryAfter(this.headers['retry-after']);
    this.timestamp = init.timestamp ?? new Date().toISOString();
    this.requestId = init.requestId ?? this.headers['x-request-id'] ?? this.headers['x-correlation-id'];

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  private static normalizeHeaders(headers?: Headers | Record<string, string>): Record<string, string> {
    if (!headers) {
      return {};
    }

    if (typeof Headers !== 'undefined' && headers instanceof Headers) {
      const normalized: Record<string, string> = {};
      headers.forEach((value, key) => { normalized[key.toLowerCase()] = value;
      });
      return normalized;
    }

    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
    );
  }

  private static parseRetryAfter(headerValue?: string): number | undefined { if (!headerValue) {
      return undefined;
    }

    const numericValue = Number(headerValue);
    if (!Number.isNaN(numericValue)) { return numericValue >= 0 ? numericValue : undefined;
    }

    const timestamp = Date.parse(headerValue);
    if (!Number.isNaN(timestamp)) { const deltaMs = timestamp - Date.now();
      if (deltaMs <= 0) {
        return 0;
      }
      return Math.round(deltaMs / 1000);
    }

    return undefined;
  }

  toJSON() { return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      detail: this.detail,
      errors: this.errors,
      retryAfterSeconds: this.retryAfterSeconds,
      timestamp: this.timestamp,
      requestId: this.requestId
    };
  }
}
