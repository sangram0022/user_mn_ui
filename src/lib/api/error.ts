/**
 * Re-export canonical ApiError from shared location
 *
 * This file is kept for backward compatibility.
 * All new code should import from @shared/errors/ApiError
 */

export { ApiError, handleApiError, isApiError } from '@shared/errors/ApiError';
export type { ApiErrorInit } from '@shared/errors/ApiError';
