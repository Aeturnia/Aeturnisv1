import { useCallback } from 'react';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

interface ApiOptions {
  headers?: Record<string, string>;
  body?: any;
  method?: string;
}

export const useApi = (token?: string) => {
  const baseHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const request = useCallback(
    async <T = any>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> => {
      try {
        const {
          method = 'GET',
          body,
          headers = {},
        } = options;

        const requestOptions: RequestInit = {
          method,
          headers: {
            ...baseHeaders,
            ...headers,
          },
        };

        if (body && method !== 'GET') {
          requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const response = await fetch(url, requestOptions);
        const data = await response.json();

        return {
          success: response.ok,
          data: response.ok ? data : undefined,
          message: !response.ok ? data.message || 'Request failed' : undefined,
          error: !response.ok ? data : undefined,
        };
      } catch (error) {
        return {
          success: false,
          message: `Network error: ${error}`,
          error,
        };
      }
    },
    [token, baseHeaders]
  );

  const get = useCallback(
    <T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> =>
      request<T>(url, { method: 'GET', headers }),
    [request]
  );

  const post = useCallback(
    <T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> =>
      request<T>(url, { method: 'POST', body, headers }),
    [request]
  );

  const patch = useCallback(
    <T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> =>
      request<T>(url, { method: 'PATCH', body, headers }),
    [request]
  );

  const del = useCallback(
    <T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> =>
      request<T>(url, { method: 'DELETE', headers }),
    [request]
  );

  return {
    get,
    post,
    patch,
    delete: del,
    request,
  };
};