import { $fetch, type FetchOptions } from 'ofetch';

/**
 * services/api/client.ts
 *
 * This is the ONLY place in the frontend where `$fetch` is used directly.
 * All other layers (components, pages, composables, stores) must go through
 * the typed API functions exposed from `services/api/`.
 *
 * Layered architecture (ADR-007):
 *   components -> composables -> services/api -> contracts
 */

const DEFAULT_BASE_URL = '/api';

export interface ApiClientOptions {
  baseURL?: string;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClient {
  get<T>(url: string, options?: FetchOptions): Promise<T>;
  post<T>(url: string, body?: unknown, options?: FetchOptions): Promise<T>;
  put<T>(url: string, body?: unknown, options?: FetchOptions): Promise<T>;
  patch<T>(url: string, body?: unknown, options?: FetchOptions): Promise<T>;
  delete<T>(url: string, options?: FetchOptions): Promise<T>;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseURL = options.baseURL ?? DEFAULT_BASE_URL;
  const baseHeaders = options.headers ?? {};

  async function request<T>(url: string, fetchOptions: FetchOptions = {}): Promise<T> {
    try {
      return await $fetch<T>(url, {
        baseURL,
        ...fetchOptions,
        headers: { ...baseHeaders, ...(fetchOptions.headers as Record<string, string>) },
      });
    } catch (err: unknown) {
      const anyErr = err as {
        response?: { status?: number };
        data?: { code?: string; message?: string };
        message?: string;
      };
      const status = anyErr?.response?.status ?? 0;
      const code = anyErr?.data?.code ?? 'UNKNOWN';
      const message = anyErr?.data?.message ?? anyErr?.message ?? 'Request failed';
      throw new ApiError(status, code, message);
    }
  }

  return {
    get: (url, options) => request<T>(url, { ...options, method: 'GET' }),
    post: (url, body, options) => request<T>(url, { ...options, method: 'POST', body }),
    put: (url, body, options) => request<T>(url, { ...options, method: 'PUT', body }),
    patch: (url, body, options) => request<T>(url, { ...options, method: 'PATCH', body }),
    delete: (url, options) => request<T>(url, { ...options, method: 'DELETE' }),
  };
}

/**
 * Shared default client instance.
 * The base URL can be overridden via the `VITE_API_BASE_URL` env var.
 */
export const apiClient: ApiClient = createApiClient({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_BASE_URL,
});
