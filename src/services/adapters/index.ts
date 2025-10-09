import { apiClient as baseClient } from '@lib/api';

/**
 * @deprecated Adapter layer removed. Use "@lib/api" instead.
 */
export { ApiClient, apiClient, useApi } from '@lib/api';
export type { RequestOptions } from '@lib/api';

export const apiClientAdapter = baseClient;
export default baseClient;
