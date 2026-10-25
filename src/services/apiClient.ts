/**
 * Reusable HTTP API Client
 * Wraps native fetch with HTTP status verification, structured error extraction,
 * timeout handling, and AbortSignal forwarding.
 */

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;

  constructor(message: string, status: number, statusText: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 15000, signal: externalSignal, ...customConfig } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Link external signal if supplied
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  const headers = new Headers(customConfig.headers || {});
  if (!headers.has('Content-Type') && customConfig.body && typeof customConfig.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
    signal: controller.signal
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Native fetch does not reject on 4xx/5xx responses; handle explicitly
    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      const message =
        (typeof errorBody === 'object' && errorBody?.message) ||
        `HTTP Error ${response.status}: ${response.statusText || 'Request failed'}`;

      throw new ApiError(message, response.status, response.statusText, errorBody);
    }

    // For 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out or was aborted for: ${url}`);
    }
    throw err;
  }
}

export const apiClient = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    }),

  put: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    }),

  patch: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'DELETE' })
};
